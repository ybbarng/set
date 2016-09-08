var ecstatic = require('ecstatic');
var server = require('http').createServer(
  ecstatic({ root: __dirname, handleError: false })
);
var io = require('socket.io')(server);

var Game = require('./src/game.js');


server.listen(1225, function() {
  console.log('Listening on 1225');
});

var game = new Game.Game();
var sockets = [];

io.on('connection', function(socket) {
  console.log('A socket is trying to connect : %s', socket.id);
  sockets.push(socket);
  console.log('A socket is connected : %s', socket.id);
  console.log(sockets.length);

  socket.on('join', function(peerId) {
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

  socket.on('request-table', function() {
    socket.emit('table', game.table);
  });

  socket.on('disconnect', function() {
    console.log('A socket is disconnected : %s %s', socket.id, socket.peerId);
    var i = sockets.indexOf(socket);
    if (i !== -1) {
      sockets.splice(i, 1);
      game.disconnect(socket.peerId);
      io.sockets.emit('players', JSON.stringify(game.players));
    }
  });

  socket.on('message', function(data) {
    console.log('Message from peer: %s', JSON.stringify(data));
    socket.broadcast.emit('message', {
      name: socket.peerId,
      message: data.textVal
    });
  });

  socket.on('select-card', function(cards) {
    console.log('%s selects cards : %s', socket.peerId, JSON.stringify(cards));
    var newCards = false;
    if (cards.length === 3) {
      var newCards = game.checkSet(socket.peerId, cards);
      console.log('Is set? ' + Boolean(newCards));
      if (newCards) {
        io.sockets.emit('players', JSON.stringify(game.players));
      }
      if (game.isOver()) {
        io.sockets.emit('game-over', null);
      }
    }
    io.sockets.emit('select-card', {
      user: socket.peerId,
      cards: cards,
      newCards: newCards
    });
  });

  socket.on('reset', function() {
    game.reset();
    io.sockets.emit('table', game.table);
    io.sockets.emit('reset', null);
  });

  socket.on('draw', function() {
    if (game.set) {
      socket.emit('set-is-exist', null);
    } else {
      game.draw(3);
      io.sockets.emit('table', game.table);
    }
  });

  socket.on('rename', function(newId) {
    var result = game.rename(socket.peerId, newId);
    if (result) {
      socket.peerId = newId;
    }
    socket.emit('rename', socket.peerId);
    if (result) {
      io.sockets.emit('players', JSON.stringify(game.players));
    }
  });
});
