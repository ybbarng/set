const Card = require('./card.js');
const sets = require('../sets.json');

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
    this.set = false;
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
    const colorSet = new Set();
    const shapeSet = new Set();
    const shadingSet = new Set();
    const countSet = new Set();
    cards.forEach((cardIndex) => {
      const card = new Card(cardIndex);
      colorSet.add(card.color);
      shapeSet.add(card.shape);
      shadingSet.add(card.shading);
      countSet.add(card.count);
    });
    const isSet = [1, 3].indexOf(colorSet.size) !== -1 &&
        [1, 3].indexOf(shapeSet.size) !== -1 &&
        [1, 3].indexOf(shadingSet.size) !== -1 &&
        [1, 3].indexOf(countSet.size) !== -1;
    if (isSet) {
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
        return true;
      });
      this.updateSetExistence();
      return newCards;
    }
    return false;
  }

  updateSetExistence() {
    this.set = false;
    const table = this.table.slice().sort((a, b) => a - b);
    for (let setIndex = 0; setIndex < sets.length; setIndex += 1) {
      const set = [];
      let cardIndex = 0;
      for (let tableIndex = 0; tableIndex < table.length; tableIndex += 1) {
        if (table[tableIndex] === sets[setIndex][cardIndex]) {
          cardIndex += 1;
          set.push(this.table.indexOf(table[tableIndex]) + 1);
        }
      }
      if (cardIndex === 3) {
        this.set = set;
        console.log(`set : ${set.sort()}`);
        return;
      }
    }
    console.log(`There is no set. : ${table}`);
  }

  isOver() {
    return !this.set && this.deck.length === 0;
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
