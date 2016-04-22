var MediaGallery = require('./mediagallery');
var $ = require('jquery');
var app = {

  baseURL: 'http://' + location.host + location.pathname.replace(/\/+$/, ''),

  init: function() {

    app.lastPage = app.getURLPage();

    app.gallery = new MediaGallery(data.pages, {
      index: 0
    });

    $('body').append(app.gallery.$el);

    app.gallery.on('next', function() {
      if (this.swipeView.isSliding)
        return
      if (typeof history.pushState == 'function') {
        var newURL = app.baseURL + '/' + (this.swipeView.views.length - 1 === this.swipeView.index ? 1 : this.swipeView.index + 2);
        history.pushState(null, '', newURL);
        app.dispatch();
      } else {
        this.swipeView.next();
      }
    });

    app.gallery.on('prev', function() {
      if (this.swipeView.isSliding)
        return
      if (typeof history.pushState == 'function') {
        var newURL = app.baseURL + '/' + (this.swipeView.index === 0 ? this.swipeView.views.length : this.swipeView.index);
        history.pushState(null, '', newURL);
        app.dispatch();
      } else {
        this.swipeView.prev();
      }
    });

    $(window).off('popstate').on('popstate', app.dispatch);

    app.gallery.render();
  },
  getURLPage: function() {
    var page, out = (new RegExp(app.baseURL + "\\/(\\d+)")).exec(window.location);
    if (out === null) {
      page = 1;
    } else {
      page = parseInt(out[1]);
    }
    return page;
  },
  dispatch: function() {
    app.lastPage = app.getURLPage();
    if (this.gallery.swipeView.isSliding) {
      this.gallery.off('changePage', this.go).on('changePage', this.go);
    } else {
      go();
    }
  },
  go: function() {
    gallery.swipeView.goTo(app.lastPage - 1);
  }
};

// Document Ready
$(app.init.bind(app));

module.exports = app;
