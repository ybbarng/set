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
  var reset = document.getElementById('reset');
  var draw = document.getElementById('draw');
  var scoreboard = document.getElementById('scoreboard');
  var board = document.getElementById('board');
  var myPointView = document.getElementById('myPoint');
  var peerPointView = document.getElementById('peerPoint');

  socket.on('message', function(data) {
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(data.textVal));
    msgList.appendChild(li);
  });

  socket.on('connect', function() {
    myId = '/#' + socket.id;
    console.log(myId);
    socket.emit('request-table', null);
  });

  socket.on('table', function(table) {
    board.innerHTML = '';
    for (var cardIndex of table) {
      var card = new Card.Card(cardIndex);
      var cardView = card.getView();
      cardView.onclick = onClickCard;
      board.appendChild(cardView);
    }
  });

  socket.on('set-is-exist', function() {
    message.innerHTML = '왜 찾질 못하니';
  });

  socket.on('players', function(players) {
    players = JSON.parse(players);
    var playerList = Object.keys(players);
    if (playerList.length > 1) {
      interactions.style.display = 'block';
    } else {
      interactions.style.display = 'none';
    }

    var myIndex = playerList.indexOf(myId);
    if (myIndex !== -1) {
      playerList.splice(myIndex, 1);
      playerList.unshift(myId);
    }

    scoreboard.innerHTML = '';
    for (var player of playerList) {
      var playerView = document.createElement('div');
      playerView.className += 'player-wrapper';
      var playerNameView = document.createElement('div');
      playerNameView.className += 'player-name';
      playerNameView.innerHTML = (player === myId) ? 'Me' : player;
      playerView.appendChild(playerNameView);
      var playerScoreView = document.createElement('div');
      playerScoreView.className += 'player-score';
      playerScoreView.innerHTML = players[player];
      playerView.appendChild(playerScoreView);
      scoreboard.appendChild(playerView);
    }
  });

  socket.on('select-card', function(data) {
    if (data.user !== myId) {
      var peerSelectedCards = document.querySelectorAll('.card.peer-selected');
      for (var i = 0; i < peerSelectedCards.length; i++) {
        var card = peerSelectedCards[i];
        card.classList.remove('peer-selected');
      }
      for (var index of data.cards) {
        var card = new Card.Card(index);
        var cardView = getCardView(card);
        if (cardView) {
          cardView.classList.add('peer-selected');
        }
      }
    }
    if (data.cards.length !== 3) {
      return;
    }
    socket.emit('select-card', []);
    if (!data.newCards) {
      clearSelect();
      return;
    }
    for (var i = 0; i < data.cards.length; i++) {
      if (data.cards[i] !== data.newCards[i]) {
        var cardView = getCardView(new Card.Card(data.cards[i]));
        if (cardView) {
          if (data.newCards[i] == -1) {
            cardView.parentNode.removeChild(cardView);
          } else {
            var newCardView = (new Card.Card(data.newCards[i])).getView();
            newCardView.onclick = onClickCard;
            cardView.parentNode.replaceChild(newCardView, cardView);
          }
        }
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

  reset.addEventListener('click', function() {
    socket.emit('reset', null);
  });

  draw.addEventListener('click', function() {
    socket.emit('draw', null);
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
      for (var i = 0; i < selectedCards.length; i++) {
        var card = selectedCards[i];
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
      for (var i = 0; i < selectedCards.length; i++) {
        var card = selectedCards[i];
        card.classList.remove('selected');
      }
    }
  }

  function getCardView(card) {

    return document.querySelector('.card[data-color="' + card.color +
      '"][data-shape="' + card.shape +
      '"][data-shading="' + card.shading +
      '"][data-count="' + card.count + '"]');
  }
}

document.addEventListener('DOMContentLoaded', init, false);
