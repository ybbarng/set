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
  for (var i = 0; i < 81; i++) {
    var card = new Card.Card(i);
    var cardView = card.getView();
    cardView.onclick = onClickCard;
    board.appendChild(cardView);
  }

  socket.on('message', function(data) {
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(data.textVal));
    msgList.appendChild(li);
  });

  socket.on('start', function() {
    message.innerHTML = '연결되었습니다.';
    interactions.style.display = 'block';
  });

  socket.on('full', function() {
    message.innerHTML = '방이 가득 찼습니다. 나중에 다시 시도해주세요.';
  });

  socket.on('end', function() {
    message.innerHTML = '상대방이 나갔습니다.';
  });

  socket.on('select-card', function(selectedIndexes) {
    for (var card of document.querySelectorAll('.card.peer-selected')) {
      card.classList.remove('peer-selected');
    }
    for (var index of selectedIndexes) {
      var card = new Card.Card(index);
      var cardView = document.querySelector('.card[data-color="' + card.color +
          '"][data-shape="' + card.shape +
          '"][data-shading="' + card.shading +
          '"][data-count="' + card.count + '"]');
      if (cardView) {
        cardView.classList.add('peer-selected');
      }
    }
  });

  form.addEventListener('submit', function(e, d) {
    e.preventDefault();
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(box.value));
    msgList.appendChild(li);
    socket.emit('message', {textVal: box.value});
    box.value = '';
  });

  function onClickCard() {
    var isChanged = false;
    if (this.classList.contains('selected')) {
      this.classList.remove('selected');
      isChanged = true;
    } else {
      var selectedCards = document.querySelectorAll('.card.selected');
      if (selectedCards.length >= 3) {
        return;
      }
      this.classList.add('selected');
      isChanged = true;
    }
    if (isChanged) {
      var selectedCards = document.querySelectorAll('.card.selected');
      var selectedIndexes = [];
      for (var card of selectedCards) {
        selectedIndexes.push(Card.cardToInt(card.dataset.color,
          card.dataset.shape,
          card.dataset.shading,
          card.dataset.count));
      }
      socket.emit('select-card', selectedIndexes);
    }
  }

  function clearSelect() {
    var selectedCards = document.querySelectorAll('.card.selected');
    if (selectedCards.length == 3) {
      console.log('selected 3 cards');
      for (var card of selectedCards) {
        card.classList.remove('selected');
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', init, false);
