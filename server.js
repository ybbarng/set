var ecstatic = require('ecstatic');
var server = require('http').createServer(
  ecstatic({ root: __dirname, handleError: false })
);
var io = require('socket.io')(server);

server.listen(1225, function() {
  console.log('Listening on 1225');
});

var peers = [];

io.on('connection', function(socket) {
  console.log('A peer is trying to connect : %s', socket.id);
  console.log(peers);
  if (peers.length >= 2) {
    console.log('No room for %s', socket.id);
    socket.emit('full', null);
    console.log(socket.disconnect);
    socket.disconnect();
    return;
  }
  peers.push(socket);
  console.log('A peer is connected : %s', socket.id);
  console.log(peers.length);
  if (peers.length === 2) {
    io.sockets.emit('start', null);
  }

  socket.on('disconnect', function() {
    console.log('A peer is disconnected : %s', socket.id);
    console.log(peers);
    var i = peers.indexOf(socket);
    if (i !== -1) {
      peers.splice(i, 1);
      console.log(peers);
      if (peers.length === 1) {
        peers[0].emit('end');
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
});
