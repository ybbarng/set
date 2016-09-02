exports.Card = function(index) {
  this.parseCard(index);
};


exports.Card.prototype = (function() {
  var Color = {
    'RED': 0,
    'BLUE': 1,
    'GREEN': 2
  };

  var Shape = {
    'OVAL': 0,
    'DIAMOND': 1,
    'SQUIGGLE': 2
  };

  var Shading = {
    'SOLID': 0,
    'OPEN': 1,
    'STRIPTED': 2
  };

  var Number = {
    1 : 0,
    2 : 1,
    3 : 2
  };

  return {
    Color: Color,
    Shape: Shape,
    Shading: Shading,
    Number: Number,
    parseCard: function(index) {
      var index = index.toString(3);
      if (index.length < 4) {
        index = '0000' + index;
        index = index.substr(index.length - 4);
      }
      this.color = Object.keys(Color)[index[0] * 1];
      this.shape = Object.keys(Shape)[index[1] * 1];
      this.shading = Object.keys(Shading)[index[2] * 1];
      this.number = Object.keys(Number)[index[3] * 1] * 1;
      console.log(this);
    },
    getView() {
      var cardView = document.createElement('div');
      cardView.className += 'card';
      for (var i = 0; i < this.number; i++) {
        var pattern = document.createElement('div');
        pattern.className += 'pattern';
        pattern.dataset.color = this.color;
        pattern.dataset.shape = this.shape;
        pattern.dataset.shading = this.shading;
        cardView.appendChild(pattern);
      }
      return cardView;
    }
  };
})();
