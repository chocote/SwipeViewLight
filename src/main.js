var MediaGallery = require('./mediagallery');
var $ = require('jquery');
const BASE_URL = window.location.protocol + '//' + location.host + location.pathname.replace(/\/+$/, '');
const HAS_HISTORY_API =  typeof history.pushState == 'function';
const REG_GET_PAGE = new RegExp(BASE_URL + "\\/(\\d+)");

var app = {

  init: function() {

    app.lastPage = app.getPageNumFromURL();

    app.gallery = new MediaGallery(data.pages, {
      index: 0
    })
      .on('next', app.next, app)
      .on('prev', app.prev, app)

    $(window).off('popstate').on('popstate', app.dispatch);
    $(document.body).append(app.gallery.$el);
    
    app.gallery.render();
  },
  getPageNumFromURL: function() {
    var matched = (REG_GET_PAGE).exec(window.location);
    return matched === null ? 1 : parseInt(matched[1]);
  },
  dispatch: function() {
    app.lastPage = app.getPageNumFromURL();
    app.gallery.swipeView.goTo(app.lastPage - 1);
  },
  next: function() {
    var swipeView = app.gallery.swipeView,
      newURL;
    if (swipeView.isSliding)
      return
    if (HAS_HISTORY_API) {
      newURL = BASE_URL + '/' + (swipeView.views.length - 1 === swipeView.index ? 1 : swipeView.index + 2);
      history.pushState(null, '', newURL);
      app.dispatch();
    } else {
      swipeView.next();
    }
  },
  prev: function() {
    var swipeView = app.gallery.swipeView,
      newURL;
    if (swipeView.isSliding)
      return
    if (HAS_HISTORY_API) {
      newURL = BASE_URL + '/' + (swipeView.index === 0 ? swipeView.views.length : swipeView.index);
      history.pushState(null, '', newURL);
      app.dispatch();
    } else {
      swipeView.prev();
    }
  }
};

// Document Ready
$(app.init.bind(app));

module.exports = app;