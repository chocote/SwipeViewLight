var $ = require('jquery');
var Events =  require('./events');
var SwipeViewLight = require('./swipeviewlight');
var GalleryImageView = require('./galleryimageview');

function MediaGallery(data, options) {
  var that = this;
  that.options = $.extend({
    index: 0
  }, options);
  that.el = document.createElement('div');
  that.$el = $(that.el).css({
    'position': 'relative',
    'overflow': 'hidden',
    'width': '100%',
    'height': '90%',
    'left': 0,
    'top': 0
  })
  .addClass(this.className)
  .focus();

  that.isOpen = false;
  that.dom = {};
  that.dom.content = $('<div/>').css({
    'position': 'absolute',
    'left': 0,
    'top': 0,
    'right': 0,
    'bottom': 0
  })
  .addClass('ui-media-gallery-content')
  .appendTo(this.el);

  that.swipeView = null;

  that.views = $.map(data, function(obj) {
    return new GalleryImageView({
      model: obj
    })
  });

  if (that.views.length === 1) {
    that.dom.btns.hide();
  }

}

$.extend(MediaGallery.prototype, Events, {
  constructor: MediaGallery,
  className: 'media-gallery',
  render: function() {
    var that = this;
    that.swipeView = new SwipeViewLight(that.dom.content[0], that.views, $.extend({
      height: that.dom.content.height(),
      width: that.dom.content.width(),
      slideSpeed: 750
    }, this.options))
    .on('changeView', function(view) {
      that.loadAndShowView();
      that.trigger('changePage');
    })
    .on('slideAdded', function(view) {
      view.resize();
    })
    .on('resize', function() {
      this.getView().resize();
    });

    that.swipeView.slide = function(action) {
      switch (action) {
        case 'swipeleft':
        case 'swipetop':
          that.trigger('next');
          break;
        case 'swiperight':
        case 'swipebottom':
          that.trigger('prev');
          break;
      }
    };

    that.dom.content.append(that.swipeView.el);
    that.swipeView.show(that.swipeView.getView());
    that.loadAndShowView();
  },

  loadAndShowView: function(view) {
    var that = this;
    view = view || that.swipeView.getView();
    view.show(function() {
      that._preloadAsides();
    });
  },
  _preloadAsides: function() {
    var that = this,
      swipeView = that.swipeView,
      asideIndexes = that._getAsideIndexes(swipeView.index, swipeView.views.length),
      _prevView = swipeView.getView(asideIndexes[0]),
      _nextView = swipeView.getView(asideIndexes[1]);
    _nextView.preload();
    _prevView.preload();
  },
  _getAsideIndexes: function(index, len) {
    var nextIndex = index + 1,
      prevIndex = index - 1;
    if (nextIndex > len - 1) {
      nextIndex = 0;
    }
    if (prevIndex < 0) {
      prevIndex = len - 1;
    }
    return [prevIndex, nextIndex];
  },

  destroy: function() {
    this.swipeView.destroy();
    this.$el.remove();
  }
});


module.exports = MediaGallery;

// if (typeof module !== "undefined" && module.exports) {
// 	module.exports = MediaGallery;
// } else if (typeof define === "function" && define.amd) {
// 	define(['jquery', './events', './swipeviewlight', './galleryimageview'], function(){return MediaGallery;});
// } else {
// 	_globals.doT = MediaGallery;
// }
