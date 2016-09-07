var io = require('socket.io-client');
var Cookies = require('js-cookie');
var $ = require('jquery');

var Card = require('./card.js');


var myId = '';
var myPoint = 0;
var peerPointView = 0;

function init() {
  var socket = io();

  // Elements
  var privateButton = $('#private');
  var form = $('#msg-form');
  var box = $('#msg-box');
  var msgList = $('#msg-list');
  var message = $('#message');
  var interactions = $('#interactions');
  var reset = $('#reset');
  var draw = $('#draw');
  var rename = $('#rename');
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
    myId = Cookies.get('myId');
    if (!myId) {
      myId = '/#' + socket.id;
      Cookies.set('myId', myId);
    }
    console.log(myId);
    socket.emit('join', myId);
    socket.emit('request-table', null);
  });

  socket.on('reset', function() {
    socket.emit('join', myId);
  });

  socket.on('rename', function(newId) {
    if (myId === newId) {
      message.text('이미 존재하는 이름입니다.');
      return;
    }
    console.log('renamed : ' + myId + ' -> ' + newId);
    myId = newId;
    Cookies.set('myId', myId);
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
      playerList.sort(function(a, b) {
        var pointOrder = players[b].score - players[a].score;
        var nameOrder = (a < b) ? -1 : 1;
        return pointOrder == 0 ? nameOrder : pointOrder;
      });
    } else {
      interactions.css('display', 'none');
    }

    scoreboard.empty();
    for (var player of playerList) {
      var playerView = $('<div>');
      playerView.addClass('player-wrapper');
      playerView.addClass(players[player].connected ?
          'connected' : 'disconnected');
      var isMe = (player === myId);
      if (isMe) {
        playerView.addClass('me');
      }
      var playerNameView = $('<div>');
      playerNameView.addClass('player-name');
      playerNameView.text(player + (isMe ? ' (나)' : ''));
      playerView.append(playerNameView);
      var playerScoreView = $('<span>');
      playerScoreView.addClass('player-score');
      playerScoreView.text(players[player].score);
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
        cardView.addClass('peer-selected');
      }
    }
    if (data.cards.length !== 3) {
      return;
    }
    if (data.user === myId && !data.newCards) {
      setTimeout(function() {
        socket.emit('select-card', []);
      }, 150);
      clearSelect();
    }
    if (!data.newCards) {
      return;
    }
    for (var i = 0; i < data.cards.length; i++) {
      if (data.cards[i] !== data.newCards[i]) {
        var cardView = getCardView(new Card.Card(data.cards[i]));
        cardView.fadeOut('slow', (function(newCard) {
          return function() {
            if (newCard == -1) {
              $(this).remove();
            } else {
              var newCardView = $(new Card.Card(newCard).getView())
                .hide();
              newCardView.click(onClickCard);
              $(this).replaceWith(newCardView);
              newCardView.fadeIn();
            }
          };
        })(data.newCards[i]));
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

  rename.on('click', function() {
    var newId = prompt('새 이름을 입력해주세요', myId);
    if (newId != null) {
      socket.emit('rename', newId);
    }
  });

  $(document).on('click', function() {
    message.text('');
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
