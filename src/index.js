var Socketiop2p = require('socket.io-p2p');
var io = require('socket.io-client');
var myId = null;
var peerId = null;
var myPoint = 0;

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
  var message = document.getElementById('message');
  var board = document.getElementById('board');
  var myPointView = document.getElementById('myPoint');
  var peerPointView = document.getElementById('peerPoint');
  var eight = document.getElementById('eight');

  p2psocket.on('message', function(data) {
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(data.textVal));
    msgList.appendChild(li);
  });

  p2psocket.on('peers', function(peers) {
    message.innerHTML = '연결되었습니다.';
    for (let peer of peers) {
      if (peer !== myId) {
        peerId = peer;
        break;
      }
    }
    console.log(peerId);
    board.style.display = 'block';
    myPoint = 0;
    myPointView.innerHTML = 0;
    peerPointView.innerHTML = 0;
    eight.disabled = false;
  });

  p2psocket.on('full', function() {
    message.innerHTML = '방이 가득 찼습니다. 나중에 다시 시도해주세요.';
  });

  p2psocket.on('peer-disconnect', function(disconnectedPeerId) {
    if (peerId === disconnectedPeerId) {
      message.innerHTML = '상대방이 나가서 게임을 종료합니다.';
      console.log(peerId);
      eight.disabled = true;
    }
  });

  p2psocket.on('eight', function(peerPoint) {
    peerPointView.innerHTML = peerPoint;
  });

  eight.addEventListener('click', function() {
    myPoint += 1;
    myPointView.innerHTML = myPoint;
    p2psocket.emit('eight', myPoint);
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
