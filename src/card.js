const Colors = ['RED', 'BLUE', 'GREEN'];
const Shapes = ['OVAL', 'DIAMOND', 'SQUIGGLE'];
const Shadings = ['SOLID', 'OPEN', 'STRIPED'];
const Counts = [1, 2, 3];
const typesLength = [Colors, Shapes, Shadings, Counts].length;

module.exports = class {
  constructor(index) {
    this.parseCard(index);
  }

  parseCard(index) {
    let indexStr = index.toString(3);
    if (indexStr.length < 4) {
      indexStr = `0000${indexStr}`;
      indexStr = indexStr.substr(indexStr.length - 4);
    }
    this.color = Colors[indexStr[0] * 1];
    this.shape = Shapes[indexStr[1] * 1];
    this.shading = Shadings[indexStr[2] * 1];
    this.count = Counts[indexStr[3] * 1] * 1;
    this.index = index;
  }

  getView() {
    const cardView = document.createElement('div');
    cardView.className += 'card';
    cardView.dataset.color = this.color;
    cardView.dataset.shape = this.shape;
    cardView.dataset.shading = this.shading;
    cardView.dataset.count = this.count;
    const patternWrapper = document.createElement('div');
    patternWrapper.className += 'pattern-wrapper';

    const top = Shapes.indexOf(this.shape) * 55;
    const left = ((Colors.indexOf(this.color) * 3) + Shadings.indexOf(this.shading)) * 33;
    const style = `-${left}px -${top}px`;

    for (let i = 0; i < this.count; i += 1) {
      const pattern = document.createElement('div');
      pattern.className += 'pattern';
      pattern.style.backgroundPosition = style;
      patternWrapper.appendChild(pattern);
    }
    cardView.appendChild(patternWrapper);
    return cardView;
  }

  static cardDataToInt(color, shape, shading, count) {
    return (Colors.indexOf(color) * (3 ** 3)) +
      (Shapes.indexOf(shape) * (3 ** 2)) +
      (Shadings.indexOf(shading) * (3 ** 1)) +
      (Counts.indexOf(count) * (3 ** 0));
  }

  static getTypeIndexes(cardIndex) {
    let remain = cardIndex;
    const result = [];
    for (let i = 0; i < 4; i += 1) {
      result.unshift(remain % 3);
      remain = Math.floor(remain / 3);
    }
    return result;
  }
  static isSet(cardIndexes) {
    const typeIndexes = [];
    cardIndexes.forEach((cardIndex) => {
      typeIndexes.push(this.getTypeIndexes(cardIndex));
    });
    for (let iType = 0; iType < typesLength; iType += 1) {
      let typeSum = 0;
      for (let iCard = 0; iCard < typeIndexes.length; iCard += 1) {
        typeSum += typeIndexes[iCard][iType];
      }
      if (typeSum % 3 !== 0) {
        return false;
      }
    }
    return true;
  }

  static getSets(table, findOneSet) {
    const sets = [];
    for (let i = 0; i < table.length; i += 1) {
      for (let j = i + 1; j < table.length; j += 1) {
        const iTypes = this.getTypeIndexes(table[i]);
        const jTypes = this.getTypeIndexes(table[j]);
        let predictCard = 0;
        for (let k = 0; k < 4; k += 1) {
          predictCard *= 3;
          if (iTypes[k] === jTypes[k]) {
            predictCard += iTypes[k];
          } else {
            predictCard += 3 - (iTypes[k] + jTypes[k]);
          }
        }
        for (let k = j + 1; k < table.length; k += 1) {
          if (table[k] === predictCard) {
            sets.push([i + 1, j + 1, k + 1]);
            if (findOneSet) {
              return sets;
            }
          }
        }
      }
    }
    return sets;
  }
};
