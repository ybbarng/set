var $ = require('jquery');
var io = require('socket.io-client');

var Card = require('./card.js');


var myId = '';
var myPoint = 0;
var peerPointView = 0;

function init() {
  var socket = io();
  var opts = {peerOpts: {trickle: false}, autoUpgrade: false};

  // Elements
  var privateButton = $('#private');
  var form = $('#msg-form');
  var box = $('#msg-box');
  var msgList = $('#msg-list');
  var message = $('#message');
  var interactions = $('#interactions');
  var reset = $('#reset');
  var draw = $('#draw');
  var scoreboard = $('#scoreboard');
  var board = $('#board');
  var myPointView = $('#myPoint');
  var peerPointView = $('#peerPoint');

  socket.on('message', function(data) {
    var li = $('<li>');
    li.text(data.textVal);
    msgList.append(li);
  });

  socket.on('connect', function() {
    myId = '/#' + socket.id;
    console.log(myId);
    socket.emit('request-table', null);
  });

  socket.on('table', function(table) {
    board.empty();
    for (var cardIndex of table) {
      var card = new Card.Card(cardIndex);
      var cardView = $(card.getView());
      cardView.click(onClickCard);
      board.append(cardView);
    }
  });

  socket.on('set-is-exist', function() {
    message.text('왜 찾질 못하니');
  });

  socket.on('players', function(players) {
    players = JSON.parse(players);
    var playerList = Object.keys(players);
    if (playerList.length > 1) {
      interactions.css('display', 'block');
    } else {
      interactions.css('display', 'none');
    }

    var myIndex = playerList.indexOf(myId);
    if (myIndex !== -1) {
      playerList.splice(myIndex, 1);
      playerList.unshift(myId);
    }

    scoreboard.empty();
    for (var player of playerList) {
      var playerView = $('<div>');
      playerView.addClass('player-wrapper');
      var playerNameView = $('<div>');
      playerNameView.addClass('player-name');
      playerNameView.text((player === myId) ? 'Me' : player);
      playerView.append(playerNameView);
      var playerScoreView = $('<div>');
      playerScoreView.addClass('player-score');
      playerScoreView.text(players[player]);
      playerView.append(playerScoreView);
      scoreboard.append(playerView);
    }
  });

  socket.on('select-card', function(data) {
    if (data.user !== myId) {
      $('.card.peer-selected').each(function() {
        $(this).removeClass('peer-selected');
      });
      for (var index of data.cards) {
        var card = new Card.Card(index);
        var cardView = getCardView(card);
        if (cardView) {
          cardView.addClass('peer-selected');
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
            cardView.remove();
          } else {
            var newCardView = $(new Card.Card(data.newCards[i]).getView());
            newCardView.click(onClickCard);
            cardView.replaceWith(newCardView);
          }
        }
      }
    }
  });

  form.on('submit', function(e) {
    e.preventDefault();
    var li = $('<li>');
    li.text((box.val()));
    msgList.append(li);
    socket.emit('message', {textVal: box.val()});
    box.val('');
  });

  reset.on('click', function() {
    socket.emit('reset', null);
  });

  draw.on('click', function() {
    socket.emit('draw', null);
  });

  function onClickCard() {
    var isChanged = false;
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      isChanged = true;
    } else {
      var selectedCards = $('.card.selected');
      if (selectedCards.length >= 3) {
        return;
      }
      $(this).addClass('selected');
      isChanged = true;
    }
    if (isChanged) {
      var selectedIndexes = [];
      $('.card.selected').each(function() {
        var data = $(this).data();
        selectedIndexes.push(Card.cardToInt(
              data.color,
              data.shape,
              data.shading,
              data.count));
      });
      socket.emit('select-card', selectedIndexes);
    }
  }

  function clearSelect() {
    var selectedCards = $('.card.selected');
    if (selectedCards.length == 3) {
      console.log('selected 3 cards');
      selectedCards.each(function() {
        $(this).removeClass('selected');
      });
    }
  }

  function getCardView(card) {

    return $('.card[data-color="' + card.color +
      '"][data-shape="' + card.shape +
      '"][data-shading="' + card.shading +
      '"][data-count="' + card.count + '"]');
  }
}

$(init);
