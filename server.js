var ecstatic = require('ecstatic');
var server = require('http').createServer(
  ecstatic({ root: __dirname, handleError: false })
);
var io = require('socket.io')(server);

server.listen(1225, function() {
  console.log('Listening on 1225');
});

var Game = require('./src/game.js');
var game = new Game.Game();

var peers = [];

io.on('connection', function(socket) {
  console.log('A peer is trying to connect : %s', socket.id);
  peers.push(socket);
  console.log('A peer is connected : %s', socket.id);
  console.log(peers.length);
  game.join(socket.id);
  socket.broadcast.emit('join', socket.id);

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
        peer.emit('quit', socket.id);
      }
    }
  });

  socket.on('eight', function(data) {
    socket.broadcast.emit('eight', data);
  });

  socket.on('message', function(data) {
    console.log('Message from peer: %s', JSON.stringify(data));
    socket.broadcast.emit('message', data);
  });

  socket.on('select-card', function(cards) {
    console.log('%s selects cards : %s', socket.id, JSON.stringify(cards));
    var newCards = cards;
    if (cards.length === 3) {
      newCards = game.set(socket.id, cards);
      var isSet = false;
      for (var i = 0; i < cards.length; i++) {
        if (cards[i] !== newCards[i]) {
          isSet = true;
        }
      }
      console.log('Is set? ' + isSet);
    }
    io.sockets.emit('select-card', {
      user: socket.id,
      cards: cards,
      newCards: newCards
    });
  });
});
