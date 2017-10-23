import Card from './card';

// const io = require('socket.io-client');
// const Cookies = require('js-cookie');
// const $ = require('jquery');


let myId = '';

$(() => {
  // const socket = io({transports: ['websocket'], upgrade: false});
  const socket = io();

  // Elements
  const form = $('#msg-form');
  const box = $('#msg-box');
  const msgList = $('#msg-list');
  const message = $('#message');
  const interactions = $('#interactions');
  const reset = $('#reset');
  const draw = $('#draw');
  const rename = $('#rename');
  const scoreboard = $('#scoreboard');
  const board = $('#board');

  function clearSelect() {
    const selectedCards = $('.card.selected');
    if (selectedCards.length === 3) {
      console.log('selected 3 cards');
      selectedCards.each((index, value) => {
        $(value).removeClass('selected');
      });
    }
  }

  function onClickCard(event) {
    let isChanged = false;
    if ($(event.currentTarget).hasClass('selected')) {
      $(event.currentTarget).removeClass('selected');
      isChanged = true;
    } else {
      const selectedCards = $('.card.selected');
      if (selectedCards.length >= 3) {
        return;
      }
      $(event.currentTarget).addClass('selected');
      isChanged = true;
    }
    if (isChanged) {
      const selectedIndexes = [];
      $('.card.selected').each((index, value) => {
        const data = $(value).data();
        selectedIndexes.push(Card.cardDataToInt(
          data.color,
          data.shape,
          data.shading,
          data.count,
        ));
      });
      socket.emit('select-card', selectedIndexes);
    }
  }

  function getCardView(card) {
    return $(`.card[data-color="${card.color}"][data-shape="${card.shape}"][data-shading="${card.shading}"][data-count="${card.count}"]`);
  }

  socket.on('message', (data) => {
    const li = $('<li>');
    li.text(`${data.name}|${data.message}`);
    msgList.append(li);
  });

  socket.on('connect', () => {
    myId = Cookies.get('myId');
    if (!myId) {
      myId = `/#${socket.id}`;
    }
    Cookies.set('myId', myId, { expires: 365 });
    console.log(myId);
    socket.emit('join', myId);
    socket.emit('request-table', null);
  });

  socket.on('reset', () => {
    socket.emit('join', myId);
  });

  socket.on('rename', (newId) => {
    if (myId === newId) {
      message.text('이미 존재하는 이름입니다.');
      return;
    }
    console.log(`renamed : ${myId} -> ${newId}`);
    myId = newId;
    Cookies.set('myId', myId, { expires: 365 });
  });

  socket.on('table', (table) => {
    board.empty();
    table.forEach((cardIndex) => {
      const card = new Card(cardIndex);
      const cardView = $(card.getView());
      cardView.click(onClickCard);
      board.append(cardView);
    });
  });

  socket.on('game-over', () => {
    message.text('게임이 종료되었습니다.');
  });

  socket.on('set-is-exist', () => {
    message.text('왜 찾질 못하니');
  });

  socket.on('players', (playersJson) => {
    const players = JSON.parse(playersJson);
    const playerList = Object.keys(players);
    if (playerList.length > 1) {
      interactions.css('display', 'block');
      playerList.sort((a, b) => {
        const pointOrder = players[b].score - players[a].score;
        const nameOrder = (a < b) ? -1 : 1;
        return pointOrder === 0 ? nameOrder : pointOrder;
      });
    } else {
      interactions.css('display', 'none');
    }

    scoreboard.empty();
    playerList.forEach((player) => {
      const playerView = $('<div>');
      playerView.addClass('player-wrapper');
      playerView.addClass(players[player].connected ?
        'connected' : 'disconnected');
      const isMe = (player === myId);
      if (isMe) {
        playerView.addClass('me');
      }
      const playerNameView = $('<div>');
      playerNameView.addClass('player-name');
      playerNameView.text(player + (isMe ? ' (나)' : ''));
      playerView.append(playerNameView);
      const playerScoreView = $('<span>');
      playerScoreView.addClass('player-score');
      playerScoreView.text(players[player].score);
      playerView.append(playerScoreView);
      scoreboard.append(playerView);
    });
  });

  socket.on('select-card', (data) => {
    if (data.user !== myId) {
      $('.card.peer-selected').each((index, value) => {
        $(value).removeClass('peer-selected');
      });
      data.cards.forEach((index) => {
        const card = new Card(index);
        const cardView = getCardView(card);
        cardView.addClass('peer-selected');
      });
    }
    if (data.cards.length !== 3) {
      return;
    }
    if (data.user === myId && !data.newCards) {
      setTimeout(() => {
        socket.emit('select-card', []);
      }, 150);
      clearSelect();
    }
    if (!data.newCards) {
      return;
    }
    for (let i = 0; i < data.cards.length; i += 1) {
      const oldCard = data.cards[i];
      const newCard = data.newCards[i];
      if (oldCard !== newCard) {
        const cardView = getCardView(new Card(oldCard));
        cardView.fadeOut('slow', () => {
          if (newCard === -1) {
            cardView.remove();
          } else {
            const newCardView = $(new Card(newCard).getView())
              .hide();
            newCardView.click(onClickCard);
            cardView.replaceWith(newCardView);
            newCardView.fadeIn();
          }
        });
      }
    }
  });

  form.on('submit', (e) => {
    e.preventDefault();
    const li = $('<li>');
    li.text((box.val()));
    msgList.append(li);
    socket.emit('message', { textVal: box.val() });
    box.val('');
  });

  reset.on('click', () => {
    socket.emit('reset', null);
  });

  draw.on('click', () => {
    socket.emit('draw', null);
  });

  rename.on('click', () => {
    const newId = prompt('새 이름을 입력해주세요', myId);
    if (newId !== null) {
      socket.emit('rename', newId);
    }
  });

  $(document).on('click', () => {
    message.text('');
  });
});
