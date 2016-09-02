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

  var Count = {
    1 : 0,
    2 : 1,
    3 : 2
  };

  return {
    Color: Color,
    Shape: Shape,
    Shading: Shading,
    Count: Count,
    parseCard: function(index) {
      var index = index.toString(3);
      if (index.length < 4) {
        index = '0000' + index;
        index = index.substr(index.length - 4);
      }
      this.color = Object.keys(Color)[index[0] * 1];
      this.shape = Object.keys(Shape)[index[1] * 1];
      this.shading = Object.keys(Shading)[index[2] * 1];
      this.count = Object.keys(Count)[index[3] * 1] * 1;
    },
    getView() {
      var cardView = document.createElement('div');
      cardView.className += 'card';
      var patternWrapper = document.createElement('div');
      patternWrapper.className += 'pattern-wrapper';

      var top = Shape[this.shape] * 55;
      var left = (Color[this.color] * 3 + Shading[this.shading]) * 33;
      var style = '-' + left + 'px -' + top + 'px';

      for (var i = 0; i < this.count; i++) {
        var pattern = document.createElement('div');
        pattern.className += 'pattern';
        pattern.dataset.color = this.color;
        pattern.dataset.shape = this.shape;
        pattern.dataset.shading = this.shading;
        pattern.style.backgroundPosition = style;
        patternWrapper.appendChild(pattern);
      }
      cardView.appendChild(patternWrapper);
      return cardView;
    }
  };
})();
