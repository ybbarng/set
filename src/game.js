var Card = require('./card.js');

exports.Game = function() {
  this.initiate();
};

exports.Game.prototype = {
  initiate: function() {
    this.players = {};
    this.table = [];
    this.reset();
  },
  reset: function() {
    for (var player in this.players) {
      this.players[player] = 0;
    }
    this.table = [];
    this.deck = [];
    for (var i = 0; i < 81; i++) {
      this.deck.push(i);
    }
    this.shuffle();
    this.draw(12);
  },
  shuffle: function() {
    var m = this.deck.length, t, i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = this.deck[m];
      this.deck[m] = this.deck[i];
      this.deck[i] = t;
    }
  },
  draw: function(count) {
    for (var i = 0; i < count; i++) {
      var card = this.deck.pop();
      if (typeof card !== 'undefined') {
        this.table.push(card);
      } else {
        return false;
      }
    }
    return true;
  },
  set: function(player, cards) {
    var colorSet = new Set();
    var shapeSet = new Set();
    var shadingSet = new Set();
    var countSet = new Set();
    for (var cardIndex of cards) {
      var card = new Card.Card(cardIndex);
      colorSet.add(card.color);
      shapeSet.add(card.shape);
      shadingSet.add(card.shading);
      countSet.add(card.count);
    }
    var isSet = [1, 3].indexOf(colorSet.size) !== -1 &&
        [1, 3].indexOf(shapeSet.size) !== -1 &&
        [1, 3].indexOf(shadingSet.size) !== -1 &&
        [1, 3].indexOf(countSet.size) !== -1;
    if (isSet) {
      if (!(player in this.players)) {
        return false;
      }
      this.players[player] += 3;
      var newCards = [];
      for (var cardIndex of cards) {
        var tableIndex = this.table.indexOf(cardIndex);
        if (tableIndex === -1) {
          return false;
        }
        var card = null;
        if (this.table.length <= 12) {
          card = this.deck.pop();
        }
        if (typeof card === 'number') {
          this.table[tableIndex] = card;
          newCards.push(card);
        } else {
          this.table.splice(tableIndex, 1);
          newCards.push(-1);
        }
      }
      return newCards;
    }
    return false;
  },
  join: function(player) {
    this.players[player] = 0;
  },
  quit: function(player) {
    delete this.players[player];
  }
};
