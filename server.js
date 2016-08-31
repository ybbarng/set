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
    console.log('A peer is trying to connect : %s', peerId);
    console.log(peers);
    if (peers.size >= 2) {
      console.log('No room for %s', peerId);
      socket.emit('full', null);
      console.log(socket.disconnect);
      socket.disconnect();
      socket.close();
      return;
    }
    socket.peerId = peerId;
    peers.add(peerId);
    console.log('A peer is connected : %s', socket.peerId);
    console.log(peers);
    if (peers.size == 2) {
      io.sockets.emit('peers', Array.from(peers));
    }
  });

  socket.on('disconnect', function() {
    console.log('A peer is disconnected : %s', socket.peerId);
    if (socket.peerId) {
      peers.delete(socket.peerId);
      socket.broadcast.emit('peer-disconnect', socket.peerId);
    }
  });

  socket.on('eight', function(data) {
    socket.broadcast.emit('eight', data);
  });

  socket.on('message', function(data) {
    console.log('Message from peer: %s', JSON.stringify(data));
    socket.broadcast.emit('message', data);
  });
});
