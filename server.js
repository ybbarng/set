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
var peers = [];

io.on('connection', function(socket) {
  console.log('A peer is trying to connect : %s', socket.id);
  peers.push(socket);
  console.log('A peer is connected : %s', socket.id);
  console.log(peers.length);
  game.join(socket.id);
  io.sockets.emit('players', JSON.stringify(game.players));

  socket.on('request-table', function() {
    socket.emit('table', game.table);
  });

  socket.on('disconnect', function() {
    console.log('A peer is disconnected : %s', socket.id);
    var i = peers.indexOf(socket);
    if (i !== -1) {
      peers.splice(i, 1);
      game.quit(socket.id);
      for (var peer of peers) {
        io.sockets.emit('players', JSON.stringify(game.players));
      }
    }
  });

  socket.on('message', function(data) {
    console.log('Message from peer: %s', JSON.stringify(data));
    socket.broadcast.emit('message', data);
  });

  socket.on('select-card', function(cards) {
    console.log('%s selects cards : %s', socket.id, JSON.stringify(cards));
    var newCards = false;
    if (cards.length === 3) {
      var newCards = game.checkSet(socket.id, cards);
      console.log('Is set? ' + Boolean(newCards));
      if (newCards) {
        io.sockets.emit('players', JSON.stringify(game.players));
      }
    }
    io.sockets.emit('select-card', {
      user: socket.id,
      cards: cards,
      newCards: newCards
    });
  });

  socket.on('reset', function() {
    game.reset();
    io.sockets.emit('table', game.table);
    io.sockets.emit('players', JSON.stringify(game.players));
  });

  socket.on('draw', function() {
    if (game.set) {
      socket.emit('set-is-exist', null);
    } else {
      game.draw(3);
      io.sockets.emit('table', game.table);
    }
  });
});
