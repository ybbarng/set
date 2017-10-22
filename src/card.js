const Colors = ['RED', 'BLUE', 'GREEN'];
const Shapes = ['OVAL', 'DIAMOND', 'SQUIGGLE'];
const Shadings = ['SOLID', 'OPEN', 'STRIPED'];
const Counts = [1, 2, 3];

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
};
