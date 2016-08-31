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

var peers = new Set();

io.on('connection', function(socket) {
  socket.on('join', function(peerId) {
    socket.peerId = peerId;
    peers.add(peerId);
    console.log('A peer is connected : %s', socket.peerId);
    console.log(peers);
    io.sockets.emit('peers', peers.size);
  });

  socket.on('disconnect', function() {
    console.log('A peer is disconnected : %s', socket.peerId);
    peers.delete(socket.peerId);
  });

  socket.on('message', function(data) {
    console.log('Message from peer: %s', JSON.stringify(data));
    socket.broadcast.emit('message', data);
  });

});
