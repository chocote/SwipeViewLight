 /*
  *  SwipeViewLight.js
  *  Author: Oscar Sobrevilla (oscar.sobrevilla@gmail.com)
  *  Version: 0.8 (beta)
  *  this script is based in SwipeView.js by Matteo Spinelli (http://cubiq.org/swipeview)
  */

var UISwipeViewLight = (function (window, doc) {
  var m = Math,
    dummyStyle = doc.createElement('div').style,
    vendor = (function () {
      var vendors = 't,webkitT,MozT,msT,OT'.split(','),
        t,
        i = 0,
        l = vendors.length;
      for (; i < l; i++) {
        t = vendors[i] + 'ransform';
        if (t in dummyStyle) {
          return vendors[i].substr(0, vendors[i].length - 1);
        }
      }
      return false;
    })(),
    cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',
    // Style properties
    transform = prefixStyle('transform'),
    transitionProperty = prefixStyle('transitionProperty'),
    transitionDuration = prefixStyle('transitionDuration'),
    transformOrigin = prefixStyle('transformOrigin'),
    transitionTimingFunction = prefixStyle('transitionTimingFunction'),
    transitionDelay = prefixStyle('transitionDelay'),
    backfaceVisibility = prefixStyle('backfaceVisibility'),
    perspective = prefixStyle("perspective"),
    // Browser capabilities
    isAndroid = (/android/gi).test(navigator.appVersion),
    isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
    isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
    has3d = prefixStyle('perspective') in dummyStyle,
    hasTouch = 'ontouchstart' in window && !isTouchPad,
    hasTransform = vendor !== false,
    hasTransitionEnd = prefixStyle('transition') in dummyStyle,
    RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
    START_EV = hasTouch ? 'touchstart' : 'mousedown',
    MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
    END_EV = hasTouch ? 'touchend' : 'mouseup',
    CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
    TRNEND_EV = (function () {
      if (vendor === false) return false;
      var transitionEnd = {
        '': 'transitionend',
        'webkit': 'webkitTransitionEnd',
        'Moz': 'transitionend',
        'O': 'otransitionend',
        'ms': 'MSTransitionEnd'
      };
      return transitionEnd[vendor];
    })(),
    nextFrame = (function () {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        return setTimeout(callback, 1);
      };
    })(),
    cancelFrame = (function () {
      return window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout;
    })(),
    // Helpers
    translateZ = has3d ? ' translateZ(0)' : '',
    SwipeViewLight = function (target, views, options) {
      var that = this,
        i;
      this.options = {
        height: 800,
        width: 600,
        margin: 0,
        loop: true,
        slideSpeed: 250,
        swipe: true,
        index: 0,
        gesture: true,
        preventDefaultTouchEvents: true,
        onBeforeSlide: null,
        onChangeView: null
      };
      // Copy settings
      this.setOptions(options);
      this.views = views || [];
      this.index = this.options.index;
      this.lastIndex = this.index;
      this.enabled = true;
      this.isSliding = false;
      this.swipeThreshold = 100;
      this.swipeTimeThreshold = 250;
      this.startPoint = {
        x: 0,
        y: 0
      };
      this.el = document.createElement('div');
      this.el.className = 'swipeviewlight';
      this.el.style.height = this.options.height + 'px';
      this.el.style.width = this.options.width + 'px';
      this.el.style.position = 'relative';
      this.el.style.overflow = 'hidden';
      this.dom = {};
      this.dom.target = target;
      this._bind(RESIZE_EV, window);
      this._bind(START_EV);
      this.dom.target.appendChild(this.el);
    };
  SwipeViewLight.prototype = {
    constructor: SwipeViewLight,
    setOptions: function (options) {
      var i;
      for (i in options) this.options[i] = options[i];
    },
    refresh: function(){
      this.el.style.height = this.options.height + 'px';
      this.el.style.width = this.options.width + 'px';
    },
    _bind: function (type, el, bubble) {
      (el || this.el).addEventListener(type, this, !! bubble);
    },
    _unbind: function (type, el, bubble) {
      (el || this.el).removeEventListener(type, this, !! bubble);
    },
    enable: function () {
      this.enabled = true;
      this._bind(START_EV);
    },
    disable: function () {
      this.enabled = false;
      this._unbind(START_EV);
    },
    prev: function () {
      this.doSlide(this.index - 1);
    },
    next: function () {
      this.doSlide(this.index + 1);
    },
    show: function (view) {
      this.el.appendChild(view.render());
    },
    getViews: function (indexes) {
      var i, j, retval = [],
        view;
      for (i = 0, j = indexes.length; i < j; i++) {
        view = this.views[indexes[i]];
        retval.push(view);
      }
      return retval;
    },
    getView: function (index) {
      return this.views[index == undefined ? this.index : index];
    },
    slide: function (action) {
      switch (action) {
      case 'swipeleft':
        this.next();
        break;
      case 'swiperight':
        this.prev();
        break;
      }
      return;
    },
    doSlide: function (index, speed) {
      var that = this,
        speed = speed || this.options.slideSpeed,
        currentView = that.getView(that.index),
        xVal = this.dom.target.offsetWidth + this.options.margin,
        newView,
        slideBy,
        style = {},
        style2 = {},
        x,
        y;
      if (this.index < index) {
        xVal = xVal * -1; // swipeleft
      } else if (this.index > index) {
        xVal = xVal; // swiperight
      } else {
        return;
      }
      if (xVal < 0) {
        this.lastSlideByAction = 'next';
      } else if (xVal > 0) {
        this.lastSlideByAction = 'prev';
      } else {
        this.lastSlideByAction = 'current';
      }
      if (this.lastSlideByAction != 'current') this.options.onBeforeSlide && this.options.onBeforeSlide.call(this);
      if (index == that.views.length) {
        newView = that.getView(index = 0);
      } else if (index == -1) {
        newView = that.getView(index = that.views.length - 1);
      } else {
        newView = that.getView(index);
      }
      that.lastIndex = that.index;
      that.index = index;
      if (hasTransform) {
        that.el.appendChild(newView.render());
        x = xVal;
        y = 0;
        style[transitionProperty] = 'all';
        style[transitionDelay] = '0';
        if (speed === 0) {
          style[transitionDuration] = '';
          style[transitionTimingFunction] = '';
          that.slideEnd();
        } else {
          style[transitionDuration] = speed + 'ms';
          style[transitionTimingFunction] = 'ease-out';
          style[backfaceVisibility] = 'hidden';
          newView.el.addEventListener(TRNEND_EV, function () {
            newView.el.removeEventListener(TRNEND_EV, this);
            that.slideEnd();
          });
        }
        style[transform] = (has3d) ? 'translate3d(' + x * -1 + 'px, ' + y + 'px, 0px)' : 'translate(' + x * -1 + 'px, ' + y + 'px)';
        that._css(newView.el, style);
        setTimeout(function () {
          style[transform] = (has3d) ? 'translate3d(' + x + 'px, ' + y + 'px, 0px)' : 'translate(' + x + 'px, ' + y + 'px)';
          that._css(currentView.el, style);
          style[transform] = (has3d) ? 'translate3d(0px, ' + y + 'px, 0px)' : 'translate(0px, ' + y + 'px)';
          that._css(newView.el, style);
        });
      }
    },
    slideEnd: function () {
      this.isSliding = false;
      if (this.lastIndex !== this.index) {
        this.options.onChangeView && this.options.onChangeView.call(this);
      }
      this.getView(this.lastIndex).detach();
    },
    handleEvent: function (e) {
      switch (e.type) {
      case START_EV:
        if (!hasTouch && e.button !== 0) return;
        this._start(e);
        break;
      case MOVE_EV:
        this._move(e);
        break;
      case END_EV:
      case CANCEL_EV:
        this._end(e);
        break;
      case RESIZE_EV:
        this._resize();
        break;
      case TRNEND_EV:
        this._transitionEnd(e);
        break;
      }
    },
    fireTouchEvent: function (e) {
      var action,
        distX = 0,
        distY = 0,
        dist = 0,
        self,
        endTime,
        diffTime;
      distX = this.endPoint.x - this.startPoint.x;
      distY = this.endPoint.y - this.startPoint.y;
      dist = Math.sqrt((distX * distX) + (distY * distY));
      if (this.options.swipe) {
        endTime = new Date();
        diffTime = endTime - this.touchStartTime;
        // See if there was a swipe gesture
        if (diffTime <= this.swipeTimeThreshold) {
          if (window.Math.abs(distX) >= this.swipeThreshold) {
            this.onTouch((distX < 0) ? 'swipeleft' : 'swiperight', this.endPoint);
            return;
          }
        }
      }
    },
    onTouch: function (action, point) {
      switch (action) {
      case START_EV:
        this.startPoint = point;
        break;
      case 'touchmoveend':
      case 'swipeleft':
      case 'swiperight':
        this.slide(action);
        break;
      }
    },
    _getPoint: function (e, changedTouches) {
      if (hasTouch) {
        var touches = changedTouches ? e.changedTouches[0] : e.touches[0];
        return {
          x: touches.pageX,
          y: touches.pageY
        };
      } else {
        var retval = {
          x: 0,
          y: 0
        };
        if (e.pageX) {
          retval.x = e.pageX;
        } else if (e.clientX) {
          retval.x = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
        }
        if (e.pageY) {
          retval.y = e.pageY;
        } else if (e.clientY) {
          retval.y = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
        }
        return retval;
      }
    },
    _css: function (target, styles) {
      var p;
      for (p in styles) {
        target.style[p] = styles[p];
      }
    },
    _transitionEnd: function (e) {
      this._unbind(TRNEND_EV);
    },
    _start: function (e) {
      if (this.enabled === false) {
        return;
      }
      if (this.options.preventDefaultTouchEvents) {
        e.preventDefault();
      }
      this.touchStartTime = new Date();
      this.isGesture = false;
      this.startPoint = this._getPoint(e);
      if (e.type == "touchstart" && e.touches.length > 1 && this.options.gesture) {
        this.isGesture = true;
        return;
      }
      this.onTouch(START_EV, this.startPoint);
      if (this.options.move) this._bind(MOVE_EV);
      this._bind(END_EV);
      this._bind(CANCEL_EV, window);
    },
    _move: function (e) {
      if (this.options.preventDefaultTouchEvents) {
        e.preventDefault();
      }
      if (this.isGesture && this.options.gesture) {
        return;
      }
      this.onTouch(MOVE_EV, this._getPoint(e));
    },
    _end: function (e) {
      if (this.isGesture && this.options.gesture) {
        return;
      }
      if (this.options.preventDefaultTouchEvents) {
        e.preventDefault();
      }
      this.endPoint = this._getPoint(e, !(typeof e.changedTouches === "undefined" || e.changedTouches === null));
      this.onTouch(END_EV, this.endPoint);
      this.fireTouchEvent(e);
      if (this.options.move) this._unbind(MOVE_EV);
      this._unbind(END_EV);
      this._unbind(CANCEL_EV, window);
    },
    _resize: function(){

    }
  };

  function prefixStyle(style) {
    if (vendor === '') return style;
    style = style.charAt(0).toUpperCase() + style.substr(1);
    return vendor + style;
  }
  return SwipeViewLight;
})(window, document);

if (typeof define === 'function' && define.amd) {
  define(function () {
    return UISwipeViewLight;
  });
}