var ecstatic = require('ecstatic');
var server = require('http').createServer(
  ecstatic({ root: __dirname, handleError: false })
);
var p2pserver = require('socket.io-p2p-server').Server;
var io = require('socket.io')(server);

server.listen(1225, function() {
  console.log('Listening on 1225');
});

io.use(p2pserver);

io.on('connection', function(socket) {
  socket.on('peer-msg', function(data) {
    console.log('Message from peer: %s', data);
    socket.broadcast.emit('peer-msg', data);
  });

  socket.on('join', function(peerId) {
    socket.peerId = peerId;
    console.log('A peer is connected : %s', socket.peerId);
  });

  socket.on('disconnect', function() {
    console.log('A peer is disconnected : %s', socket.peerId);
  });
});
