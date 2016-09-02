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
      this.table.push(this.deck.pop());
    }
  },
  join: function(player) {
    this.players[player] = 0;
  },
  quit: function(player) {
    delete this.players[player];
  }
};
