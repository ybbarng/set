var io = require('socket.io-client');

var Card = require('./card.js');

var myId = '';

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

  socket.on('connect', function() {
    myId = socket.id;
  });

  socket.on('join', function(id) {
    message.innerHTML = id + ' joined.';
    interactions.style.display = 'block';
  });

  socket.on('quit', function(id) {
    message.innerHTML = id + ' has gone.';
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
