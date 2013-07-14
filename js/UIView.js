
UIView = (function(options) {
  this.el = null;
  this.loaded = false;
  this.html = '<div class="view" data-role="view">\
                <img class="view-image" src="'+options.thumb+'" />\
                <div class="view-area"></div>\
              </div>';
  this.spinner = null;
  this.options = options;
  this.src = options.src;
  this.thumb = options.thumb;
  this.dom = {};
});

UIView.prototype = {

  constructor: UIView,

  render: function() {
    if (!this.el) {
      var el = $(this.html);
      this.spinner = $('<h2>Cargando..</h2>');
      this.dom.image = el.find('.view-image');
      this.dom.area = el.find('.view-area');
      this.el = el.get(0);
    }
    if (this.loaded)
      this.setImage(true);
    return this.el;
  },

  setImage: function(big) {
    this.dom.image.attr('src', big? this.src : this.thumb);
  },

  show: function (callback) {
    var that = this;
    if (that.loaded) {
      callback && callback.call(that);
    } else {
      that.preload(function(){
        that.show(callback);  
      });
    }
  },

  preload: function(callback){
    this.download(function(){
      this._downloaded();
      callback && callback.call(this);
    });
  },

  download: function(callback){
    var that = this,
        img = new Image();
    
    img.onload = function(){ 
      this.onLoad = null;
      callback && callback.call(that, that.src);
    };
    img.src = this.src;
    
    that.dom.area.append(this.spinner);
  },

  _downloaded: function(){
    this.loaded = true;
    this.spinner.remove();
  },

  unload: function(){
    this.setImage(false);
  },

  detach: function(){
    if ( this.el.parentNode )
      this.el.parentNode.removeChild(this.el);
  },
  
  destroy: function(){}      
};