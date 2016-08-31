var Socketiop2p = require('socket.io-p2p');
var io = require('socket.io-client');
var myId = null;
var peerId = null;

function init() {
  var socket = io();
  var opts = {peerOpts: {trickle: false}, autoUpgrade: false};
  var p2psocket = new Socketiop2p(socket, opts, function() {
    myId = p2psocket.peerId;
    p2psocket.emit('join', myId);
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
    board.innerHTML = '연결되었습니다.';
    for (let peer of peers) {
      if (peer !== myId) {
        peerId = peer;
        break;
      }
    }
    console.log(peerId);
  });

  p2psocket.on('full', function() {
    board.innerHTML = '방이 가득 찼습니다. 나중에 다시 시도해주세요.';
  });

  p2psocket.on('peer-disconnect', function(disconnectedPeerId) {
    if (peerId === disconnectedPeerId) {
      board.innerHTML = '상대방이 나가서 게임을 종료합니다.';
      console.log(peerId);
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
