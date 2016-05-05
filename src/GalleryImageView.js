var $ = require('jquery');
var CDImage = require('./cdimage');
var Events = require('./events');

function Spinner() {
  this.el = document.createElement('div');
  this.el.className = 'progress-ring';
  this.$el = $(this.el);
}

$.extend(Spinner.prototype, Events, {
  constructor: Spinner,
  destroy: function() {
    this.$el.remove();
  }
})

function GalleryImageView(options) {
  var that = this;
  that.el = document.createElement('div');
  that.$el = $(that.el).addClass(this.className).css({
    'position': 'absolute',
    'left': 0,
    'top': 0,
    'width': '100%',
    'height': '100%'
  });
  that.model = options.model;
  that.downloadRequest = null;
  that.downloading = false;
  that.loaded = false;
  that.size = {
    width: 0,
    height: 0
  };
  that.spinner = new Spinner();

  that.image = $(new Image()).css({
    'position': 'absolute',
    'display': 'none'
  });
  //Hack Firefox SmoothImage
  if ("MozAppearance" in document.documentElement.style) {
    that.image.addClass('image-scale-hack');
  }
  that.$el.append(this.image);
  that.showSpinner();
}

$.extend(GalleryImageView.prototype, Events, {
  constructor: GalleryImageView,
  className: 'media-gallery-image-view',
  show: function(callback) {
    var that = this;
    if (that.loaded) {
      that.resize();
      that.image.show();
      that.hideSpinner();
      callback && callback.call(that);
    } else {
      that.showSpinner();
      that.preload(function() {
        that.show(callback);
      });
    }
  },
  preload: function(callback) {
    if (this.loaded) {
      callback && callback.call(this);
      return;
    }
    if (!this.downloading) {
      this.once('downloaded', callback);
      this.download();
    }
    return this.downloadRequest;
  },

  download: function() {
    var that = this;
    that.downloading = true;
    that.downloadRequest = CDImage.load(this.model.src, function(src, img) {
      that.size.width = img.width;
      that.size.height = img.height;
      that._downloaded();
    });
    return that.downloadRequest;
  },
  resize: function(wW, wH) {

    var iH = this.size.height,
      iW = this.size.width,
      scale;

    wW = wW === undefined ? this.$el.width() : wW;
    wH = wH === undefined ? this.$el.height() : wH;

    scale = (wH / wW) > (iH / iW) ? wW / iW : wH / iH;

    this.image.css({
      width: iW * scale,
      height: iH * scale,
      left: (wW - iW * scale) / 2,
      top: (wH - iH * scale) / 2
    });

  },
  abortDownload: function() {
    var that = this;
    if (that.downloadRequest) {
      that.downloadRequest.abort();
      that.downloadRequest = null;
      that.downloading = false;
      that.off('downloaded');
    }
  },
  _downloaded: function() {
    var that = this,
      cb;
    that.downloadRequest = null;
    that.downloading = false;
    that.loaded = true;
    that.image.attr('src', this.model.src);
    that.resize();
    that.hideSpinner();
    that.image.show();
    that.trigger('downloaded');
  },
  showSpinner: function() {
    this.$el.append(this.spinner.el);
  },
  hideSpinner: function() {
    this.spinner.$el.fadeOut(function(){
      this.spinner.$el.detach();
    }.bind(this))
  },
  detach: function() {
    this.$el.detach();
  }
});
//
// if (typeof module !== "undefined" && module.exports) {
//   module.exports = GalleryImageView;
// } else if (typeof define === "function" && define.amd) {
//   define([''], function(){return GalleryImageView;});
// } else {
//   window.doT = GalleryImageView;
// }
module.exports = GalleryImageView;
