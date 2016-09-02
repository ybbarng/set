var io = require('socket.io-client');

var Card = require('./card.js');

var myPoint = 0;
var peerPointView = 0;

function init() {
  var socket = io();
  var opts = {peerOpts: {trickle: false}, autoUpgrade: false};

  // Elements
  var privateButton = document.getElementById('private');
  var form = document.getElementById('msg-form');
  var box = document.getElementById('msg-box');
  var msgList = document.getElementById('msg-list');
  var message = document.getElementById('message');
  var interactions = document.getElementById('interactions');
  var board = document.getElementById('board');
  var myPointView = document.getElementById('myPoint');
  var peerPointView = document.getElementById('peerPoint');
  var eight = document.getElementById('eight');
  var eightSound = new Audio('./static/eight.wav');
  var testBoard = document.getElementById('test-board');
	for(var i = 0; i < 81; i++) {
    var card = new Card.Card(i);
    testBoard.appendChild(card.getView());
  }

  socket.on('message', function(data) {
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(data.textVal));
    msgList.appendChild(li);
  });

  socket.on('start', function() {
    message.innerHTML = '연결되었습니다.';
    interactions.style.display = 'block';
    myPoint = 0;
    peerPoint = 0;
    updatePointView();
    eight.disabled = false;
  });

  socket.on('full', function() {
    message.innerHTML = '방이 가득 찼습니다. 나중에 다시 시도해주세요.';
  });

  socket.on('end', function() {
    message.innerHTML = '상대방이 나가서 게임을 종료합니다.';
    eight.disabled = true;
  });

  socket.on('eight', function(newPeerPoint) {
    peerPoint = newPeerPoint;
    updatePointView();
  });

  eight.addEventListener('click', function() {
    eightSound.play();
    myPoint += 1;
    updatePointView();
    socket.emit('eight', myPoint);
  });

  form.addEventListener('submit', function(e, d) {
    e.preventDefault();
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(box.value));
    msgList.appendChild(li);
    socket.emit('message', {textVal: box.value});
    box.value = '';
  });

  function updatePointView() {
    myPointView.innerHTML = myPoint;
    peerPointView.innerHTML = peerPoint;
    var difference = myPoint - peerPoint;
    console.log(difference);
    var defaultSize = 30;
    var myFontSize = defaultSize;
    var peerFontSize = defaultSize;
    if (difference > 0) {
      myFontSize += difference;
    } else if (difference < 0) {
      peerFontSize -= difference;
    }
    myPointView.style.fontSize = myFontSize + 'px';
    peerPointView.style.fontSize = peerFontSize + 'px';
  }
}

document.addEventListener('DOMContentLoaded', init, false);
