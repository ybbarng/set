var ecstatic = require('ecstatic');
var server = require('http').createServer(
  ecstatic({ root: __dirname, handleError: false })
);
var io = require('socket.io')(server);

server.listen(1225, function() {
  console.log('Listening on 1225');
});

var peers = new Set();

io.on('connection', function(socket) {
  console.log('A peer is trying to connect : %s', socket.id);
  console.log(peers);
  if (peers.size >= 2) {
    console.log('No room for %s', socket.id);
    socket.emit('full', null);
    console.log(socket.disconnect);
    socket.disconnect();
    return;
  }
  peers.add(socket.id);
  console.log('A peer is connected : %s', socket.id);
  console.log(peers);
  if (peers.size == 2) {
    io.sockets.emit('peers', Array.from(peers));
  }

  socket.on('disconnect', function() {
    console.log('A peer is disconnected : %s', socket.id);
    peers.delete(socket.id);
    socket.broadcast.emit('peer-disconnect', socket.id);
  });

  socket.on('eight', function(data) {
    socket.broadcast.emit('eight', data);
  });

  socket.on('message', function(data) {
    console.log('Message from peer: %s', JSON.stringify(data));
    socket.broadcast.emit('message', data);
  });
});
