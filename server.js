const express = require('express');
const path = require('path');
const compression = require('compression');
const uws = require('uws');

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
const Game = require('./src/game.js');

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

io.on('connection', (socket) => {
  console.log('A socket is trying to connect : %s', socket.id);
  const connectionType = socket.client.conn.transport.constructor.name;
  console.log(`Connection Type: ${connectionType}`);
  sockets.push(socket);
  console.log('A socket is connected : %s', socket.id);
  console.log(sockets.length);

  socket.on('join', (peerId) => {
    console.log('A peer is trying to connect : %s', socket.peerId);
    socket.peerId = peerId;
    console.log('A peer is connected : %s', socket.peerId);
    console.log(sockets.length);
    game.connect(socket.peerId);
    io.sockets.emit('players', JSON.stringify(game.players));
    if (game.isOver()) {
      socket.emit('game-over', null);
    }
  });

  socket.on('request-table', () => {
    socket.emit('table', game.table);
  });

  socket.on('disconnect', () => {
    console.log('A socket is disconnected : %s %s', socket.id, socket.peerId);
    const i = sockets.indexOf(socket);
    if (i !== -1) {
      sockets.splice(i, 1);
      game.disconnect(socket.peerId);
      io.sockets.emit('players', JSON.stringify(game.players));
    }
  });

  socket.on('message', (data) => {
    console.log(`Message from peer: ${JSON.stringify(data)}`);
    socket.broadcast.emit('message', {
      name: socket.peerId,
      message: data.textVal,
    });
  });

  socket.on('select-card', (cards) => {
    console.log(`Connection Type: ${socket.client.conn.transport.constructor.name}`);
    console.log(`${socket.peerId} selects cards : ${JSON.stringify(cards)}`);
    let newCards = false;
    if (cards.length === 3) {
      newCards = game.checkSet(socket.peerId, cards);
      console.log(`Is set? ${Boolean(newCards)}`);
      if (newCards) {
        io.sockets.emit('players', JSON.stringify(game.players));
      }
      if (game.isOver()) {
        io.sockets.emit('game-over', null);
      }
    }
    io.sockets.emit('select-card', {
      user: socket.peerId,
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
    console.log(`${socket.peerId} is trying to open more cards`);
    if (game.set) {
      console.log('There are one or more sets');
      socket.emit('set-is-exist', null);
    } else {
      console.log('There is no set');
      game.draw(3);
      console.log('3 cards are opened');
      io.sockets.emit('table', game.table);
    }
  });

  socket.on('rename', (newId) => {
    const result = game.rename(socket.peerId, newId);
    if (result) {
      console.log(`Rename: ${socket.peerId} -> ${newId}`);
      socket.peerId = newId;
    }
    socket.emit('rename', socket.peerId);
    if (result) {
      io.sockets.emit('players', JSON.stringify(game.players));
    }
  });
});
