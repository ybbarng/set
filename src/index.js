var Socketiop2p = require('socket.io-p2p');
var io = require('socket.io-client');

function init() {
  var socket = io();
  var opts = {peerOpts: {trickle: false}, autoUpgrade: false};
  var p2psocket = new Socketiop2p(socket, opts, function() {
    p2psocket.emit('join', p2psocket.peerId);
  });

  // Elements
  var privateButton = document.getElementById('private');
  var form = document.getElementById('msg-form');
  var box = document.getElementById('msg-box');
  var msgList = document.getElementById('msg-list');
  var board = document.getElementById('board');

  p2psocket.on('message', function(data) {
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(data.textVal));
    msgList.appendChild(li);
  });

  p2psocket.on('peers', function(peers) {
    if (peers === 2) {
      board.innerHTML = '연결되었습니다.';
    } else {
    }
  });

  form.addEventListener('submit', function(e, d) {
    e.preventDefault();
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(box.value));
    msgList.appendChild(li);
    p2psocket.emit('message', {textVal: box.value});
    box.value = '';
  });
}

document.addEventListener('DOMContentLoaded', init, false);
