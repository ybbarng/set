const Card = require('./card.js');

module.exports = class {
  constructor() {
    this.initiate();
  }

  initiate() {
    this.reset();
  }

  reset() {
    this.players = {};
    this.table = [];
    this.sets = [];
    this.deck = [];
    for (let i = 0; i < 81; i += 1) {
      this.deck.push(i);
    }
    this.shuffle();
    this.draw(12);
  }

  // Fisher-Yates Shuffle
  shuffle() {
    let i;
    let j;
    let buffer;
    for (i = this.deck.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1));
      buffer = this.deck[j];
      this.deck[j] = this.deck[i];
      this.deck[i] = buffer;
    }
  }

  draw(count) {
    if (this.isOver()) {
      return;
    }
    for (let i = 0; i < count; i += 1) {
      const card = this.deck.pop();
      if (typeof card === 'undefined') {
        break;
      }
      this.table.push(card);
    }
    this.updateSetExistence();
  }

  checkSet(player, cards) {
    if (this.isOver()) {
      return false;
    }
    if (Card.isSet(cards)) {
      if (!(player in this.players)) {
        throw new Error(`There is no such player ${player} in ${JSON.stringify(this.players)}`);
      }
      this.players[player].score += 3;
      const newCards = [];
      cards.forEach((cardIndex) => {
        const tableIndex = this.table.indexOf(cardIndex);
        if (tableIndex === -1) {
          throw new Error(`There is no such card ${cardIndex} in ${JSON.stringify(this.table)}`);
        }
        let card = null;
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
      });
      this.updateSetExistence();
      return newCards;
    }
    return false;
  }

  updateSetExistence() {
    this.sets = Card.getSets(this.table, true);
    if (this.sets.length > 0) {
      console.log(`set : ${this.sets}`);
    } else {
      console.log(`There is no set. : ${this.table}`);
    }
  }

  isOver() {
    return this.sets.length === 0 && this.deck.length === 0;
  }

  connect(player) {
    if (player in this.players) {
      this.players[player].connected += 1;
    } else {
      this.players[player] = {
        connected: 1,
        score: 0,
      };
    }
  }

  disconnect(player) {
    if (player in this.players) {
      this.players[player].connected -= 1;
    }
  }

  rename(oldName, newName) {
    if (newName in this.players) {
      return false;
    }
    if (oldName in this.players) {
      const player = this.players[oldName];
      delete this.players[oldName];
      this.players[newName] = player;
      return true;
    }
    return false;
  }
};
