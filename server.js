const express = require('express');
const path = require('path');
const compression = require('compression');
const uws = require('uws');
const Game = require('./src/js/game.js');
const Animals = require('./animals.json');

const app = express();
app.use(compression());
app.use(express.static(path.join(__dirname, 'app')));

const oneDay = 864000000;
app.use('/static', express.static(path.join(__dirname, 'static'), { maxAge: oneDay }));

const http = require('http').Server(app);
const io = require('socket.io')(http, {
  'browser client minification': true,
  'browser client etag': true,
  'browser client gzip': true,
  'browser client expires': true,
});

require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l');


io.engine.ws = new (uws.Server)({
  noServer: true,
  perMessageDeflate: false,
});

http.listen(1225, () => {
  console.log('Server is started.');
  console.log('Listening on 1225');
});

const game = new Game();
const sockets = [];

function getRandomName() {
  let name = '';
  do {
    name = Animals[Math.floor(Math.random() * Animals.length)];
  } while (name in game.players);
  return name;
}

io.on('connection', (socket) => {
  let peerId = getRandomName();

  console.log(`A socket is trying to connect : ${socket.id}`);
  const connectionType = socket.client.conn.transport.constructor.name;
  console.log(`Connection Type: ${connectionType}`);
  sockets.push(socket);
  console.log(`A socket is connected : ${socket.id}`);
  console.log(sockets.length);
  socket.emit('recommend-name', peerId);

  socket.on('join', (selectedPeerId) => {
    console.log(`A peer is trying to connect from socket ${socket.id}`);
    peerId = selectedPeerId;
    console.log(`A peer is connected with name: ${peerId}`);
    console.log(sockets.length);
    game.connect(peerId);
    io.sockets.emit('players', JSON.stringify(game.players));
    if (game.isOver()) {
      socket.emit('game-over', null);
    }
  });

  socket.on('request-table', () => {
    socket.emit('table', game.table);
  });

  socket.on('disconnect', () => {
    console.log(`A socket is disconnected : ${socket.id} ${peerId}`);
    const i = sockets.indexOf(socket);
    if (i !== -1) {
      sockets.splice(i, 1);
      game.disconnect(peerId);
      io.sockets.emit('players', JSON.stringify(game.players));
    }
  });

  socket.on('message', (data) => {
    console.log(`Message from peer: ${JSON.stringify(data)}`);
    socket.broadcast.emit('message', {
      name: peerId,
      message: data.textVal,
    });
  });

  socket.on('select-card', (cards) => {
    console.log(`Connection Type: ${socket.client.conn.transport.constructor.name}`);
    console.log(`${peerId} selects cards : ${JSON.stringify(cards)}`);
    if (game.isOver()) {
      return;
    }
    let newCards = false;
    if (cards.length === 3) {
      newCards = game.checkSet(peerId, cards);
      console.log(`Is set? ${Boolean(newCards)}`);
      io.sockets.emit('players', JSON.stringify(game.players));
      if (game.isOver()) {
        io.sockets.emit('game-over', null);
      }
    }
    io.sockets.emit('select-card', {
      user: peerId,
      cards,
      newCards,
    });
  });

  socket.on('reset', () => {
    console.log('Reset the game');
    game.reset();
    io.sockets.emit('table', game.table);
    io.sockets.emit('reset', null);
  });

  socket.on('draw', () => {
    console.log(`${peerId} is trying to open more cards`);
    if (game.sets.length > 0) {
      console.log('There are one or more sets');
      socket.emit('set-is-exist', null);
      game.deductPoint(peerId, 1);
      io.sockets.emit('players', JSON.stringify(game.players));
    } else {
      console.log('There is no set');
      const result = game.draw(3);
      if (result) {
        console.log('3 cards are opened');
        io.sockets.emit('table', game.table);
      }
      game.addPoint(peerId, 2);
      io.sockets.emit('players', JSON.stringify(game.players));
    }
  });

  socket.on('rename', (requestedNewId) => {
    let newId = requestedNewId;
    if (newId === '') {
      newId = getRandomName();
    }
    const result = game.rename(peerId, newId);
    if (result) {
      console.log(`Rename: ${peerId} -> ${newId}`);
      peerId = newId;
    }
    socket.emit('rename', peerId);
    if (result) {
      io.sockets.emit('players', JSON.stringify(game.players));
    }
  });
});
