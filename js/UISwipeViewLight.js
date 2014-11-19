 /*
  *  SwipeViewLight.js
  *  Author: Oscar Sobrevilla (oscar.sobrevilla@gmail.com)
  *  Version: 0.85 (beta)
  *  this script is based in SwipeView.js by Matteo Spinelli (http://cubiq.org/swipeview)
  */
 var UISwipeViewLight = (function(window, document) {



   var Events = (function() {

     var ArrayProto = Array.prototype,
       ObjProto = Object.prototype,
       FuncProto = Function.prototype,
       push = ArrayProto.push,
       slice = ArrayProto.slice,
       concat = ArrayProto.concat,
       toString = ObjProto.toString,
       hasOwnProperty = ObjProto.hasOwnProperty,
       fireEvents = function(events, args) {
         var ev, i = -1,
           l = events.length,
           a1 = args[0],
           a2 = args[1],
           a3 = args[2];
         switch (args.length) {
           case 0:
             while (++i < l)(ev = events[i]).callback.call(ev.ctx);
             return;
           case 1:
             while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1);
             return;
           case 2:
             while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1, a2);
             return;
           case 3:
             while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
             return;
           default:
             while (++i < l)(ev = events[i]).callback.apply(ev.ctx, args);
             return;
         }
       };

     if (!Object.keys) {
       Object.keys = (function() {
         'use strict';
         var hasOwnProperty = Object.prototype.hasOwnProperty,
           hasDontEnumBug = !({
             toString: null
           }).propertyIsEnumerable('toString'),
           dontEnums = [
             'toString',
             'toLocaleString',
             'valueOf',
             'hasOwnProperty',
             'isPrototypeOf',
             'propertyIsEnumerable',
             'constructor'
           ],
           dontEnumsLength = dontEnums.length;

         return function(obj) {
           if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
             throw new TypeError('Object.keys called on non-object');
           }

           var result = [],
             prop, i;

           for (prop in obj) {
             if (hasOwnProperty.call(obj, prop)) {
               result.push(prop);
             }
           }

           if (hasDontEnumBug) {
             for (i = 0; i < dontEnumsLength; i++) {
               if (hasOwnProperty.call(obj, dontEnums[i])) {
                 result.push(dontEnums[i]);
               }
             }
           }
           return result;
         };
       }());
     }

     return {

       on: function(name, callback, context) {
         this._events || (this._events = {});
         var events = this._events[name] || (this._events[name] = []);
         events.push({
           callback: callback,
           context: context,
           ctx: context || this
         });
         return this;
       },


       once: function(name, callback, context) {
         var self = this;
         var once = (function(func) {
           var memo, times = 2;
           return function() {
             if (--times > 0) {
               memo = func.apply(this, arguments);
             } else {
               func = null;
             }
             return memo;
           };
         })(function() {
           self.off(name, once);
           callback.apply(this, arguments);
         });
         return this.on(name, once, context);
       },


       off: function(name, callback, context) {
         var retain, ev, events, names, i, l, j, k;
         if (!name && !callback && !context) {
           this._events = void 0;
           return this;
         }
         names = name ? [name] : Object.keys(this._events);
         for (i = 0, l = names.length; i < l; i++) {
           name = names[i];
           if (events = this._events[name]) {
             this._events[name] = retain = [];
             if (callback || context) {
               for (j = 0, k = events.length; j < k; j++) {
                 ev = events[j];
                 if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                   (context && context !== ev.context)) {
                   retain.push(ev);
                 }
               }
             }
             if (!retain.length) delete this._events[name];
           }
         }

         return this;
       },


       trigger: function(name) {
         if (!this._events) return this;
         var args = slice.call(arguments, 1);
         var events = this._events[name];
         var allEvents = this._events.all;
         if (events) fireEvents(events, args);
         if (allEvents) fireEvents(allEvents, arguments);
         return this;
       }

     };

   }());



   var m = Math,
     dummyStyle = document.createElement('div').style,
     vendor = (function() {
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
     isAESys = 'attachEvent' in window,
     RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
     START_EV = hasTouch ? 'touchstart' : 'mousedown',
     MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
     END_EV = hasTouch ? 'touchend' : 'mouseup',
     CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
     TRNEND_EV = (function() {
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
     nextFrame = (function() {
       return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
         return setTimeout(callback, 1000 / 60);
       };
     })(),
     cancelFrame = (function() {
       return window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout;
     })(),

     fixEvent = function(event) {
       // add W3C standard event methods
       event.target = (event.currentTarget) ? event.currentTarget : event.srcElement;
       event.preventDefault = fixEvent.preventDefault;
       event.stopPropagation = fixEvent.stopPropagation;
       return event;
     },

     addEvt = function(el, evt, fn, bubble) {
       if ('addEventListener' in el) {
         el.addEventListener(evt, fn, bubble);
       } else if ('attachEvent' in el) {
         // check if the callback is an object and contains handleEvent
         if (typeof fn == 'object' && fn.handleEvent) {
           el.attachEvent('on' + evt, function(e) {
             fn.handleEvent.call(fn, fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event));
           });
         } else {
           el.attachEvent('on' + evt, function(e) {
             fn.call(el, fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event));
           });
         }
       }
     },

     rmEvt = function(el, evt, fn, bubble) {
       if ('removeEventListener' in el) {
         el.removeEventListener(evt, fn, bubble);
       } else if ('detachEvent' in el) {
         // check if the callback is an object and contains handleEvent
         if (typeof fn == 'object' && fn.handleEvent) {
           el.detachEvent("on" + evt, function() {
             // Bind fn as this
             fn.handleEvent.call(fn);
           });
         } else {
           el.detachEvent('on' + evt, fn);
         }
       }
     },
     _extend = function(obj) {
       var type = typeof obj;
       if (!(type === 'function' || type === 'object' && !!obj)) return obj;
       var source, prop;
       for (var i = 1, length = arguments.length; i < length; i++) {
         source = arguments[i];
         for (prop in source) {
           if (Object.hasOwnProperty.call(source, prop)) {
             obj[prop] = source[prop];
           }
         }
       }
       return obj;
     },
     // Helpers
     translateZ = has3d ? ' translateZ(0)' : '',
     SwipeViewLight = function(target, views, options) {

       var that = this,
         i;
       this.options = {
         height: 800,
         width: 600,
         axis: 'x',
         margin: 0,
         loop: true,
         slideSpeed: 250,
         swipe: true,
         index: 0,
         gesture: true,
         preventDefaultTouchEvents: true
       };
       // Copy settings
       this.setOptions(options);
       this.setViews(views || []);
       this.index = this.options.index;
       this.lastIndex = this.index;
       this.enabled = true;
       this.isSliding = false;
       this.swipeThreshold = 30;
       this.scrollSupressionThreshold = 10;
       this.horizontalDistanceThreshold = 30;
       this.verticalDistanceThreshold = 75;
       this.swipeTimeThreshold = 1000;
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
       this.el.style[backfaceVisibility] = 'hidden';

       this.dom = {};
       this.dom.target = target;
       addEvt(window, RESIZE_EV, this);
       addEvt(this.el, START_EV, this);
       this.dom.target.appendChild(this.el);
     };


   _extend(SwipeViewLight.prototype, Events, {
     constructor: SwipeViewLight,
     setOptions: function(options) {
       var i;
       for (i in options) this.options[i] = options[i];
     },
     refresh: function() {},
     enable: function() {
       if (this.enabled === false) {
         this.enabled = true;
         addEvt(this.el, START_EV, this);
       }
     },
     disable: function() {
       if (this.enabled === true) {
         this.enabled = false;
         rmEvt(this.el, START_EV, this);
       }
     },
     goTo: function(index) {
       if (!isNaN(index))
         this.doSlide(Number(index));
       else
         throw 'UISwipeViewLight: Error, @index param no valid';
     },
     prev: function() {
       this.doSlide(this.index - 1);
     },
     next: function() {
       this.doSlide(this.index + 1);
     },
     show: function(view) {
       this.el.appendChild(view.el);
     },
     getViews: function(indexes) {
       var i, j, retval = [],
         view;
       for (i = 0, j = indexes.length; i < j; i++) {
         view = this.views[indexes[i]];
         retval.push(view);
       }
       return retval;
     },
     setViews: function(views) {
       this.views = null;
       this.views = [];
       for (var i = 0, len = views.length; i < len; i++)
         this.addView(views[i]);
     },
     addView: function(view) {
       view.swipeView = this;
       this.views.push(view);
     },
     getView: function(index) {
       return this.views[index === undefined ? this.index : index];
     },
     getNextView: function() {
       var nextIndex = this.index + 1;
       if (nextIndex > this.views.length - 1) {
         nextIndex = 0;
       }
       return this.getView(nextIndex)
     },
     getPrevView: function() {
       var prevIndex = this.index - 1
       if (prevIndex < 0) {
         prevIndex = this.views.length - 1;
       }
       return this.getView(prevIndex);
     },
     slide: function(action) {
       switch (action) {
         case 'swipeleft':
         case 'swipetop':
           this.next();
           break;
         case 'swiperight':
         case 'swipebottom':
           this.prev();
           break;
       }
       return;
     },
     handleEvent: function(e) {
       switch (e.type) {
         case START_EV:
           if (!hasTouch)
             if (isAESys === false && e.button !== 0 || isAESys === true && e.button !== 1) return;
           return this._start(e);
           break;
         case MOVE_EV:
           return this._move(e);
           break;
         case END_EV:
         case CANCEL_EV:
           return this._end(e);
           break;
         case RESIZE_EV:
           this._resize();
           break;
         case TRNEND_EV:
           return this._transitionEnd(e);
           break;
       }
     },
     doSlide: function(index, speed) {

       if (this.isSliding || this.index === index || this.views.length <= 1)
         return;

       this.isSliding = true;

       var that = this,
         speed = speed || this.options.slideSpeed,
         currentView = that.getView(that.index),
         newView,
         slideBy,
         style = {},
         xVal = 0,
         yVal = 0,
         x, y;

       if (this.options.axis == 'x') {
         xVal = this.dom.target.offsetWidth + this.options.margin;
       } else {
         yVal = this.dom.target.offsetHeight + this.options.margin;
       }

       if (this.index < index) {
         xVal = xVal * -1; // swipeleft
         yVal = yVal * -1;
       } else if (this.index > index) {
         xVal = xVal; // swiperight
         yVal = yVal;
       } else {
         return;
       }

       if (xVal < 0 || yVal < 0) {
         this.lastSlideByAction = 'next';
       } else if (xVal > 0 || yVal > 0) {
         this.lastSlideByAction = 'prev';
       } else {
         this.lastSlideByAction = 'current';
       }

       if (this.lastSlideByAction != 'current')
         this.trigger('beforeSlide');
       if (index == that.views.length) {
         newView = that.getView(index = 0);
       } else if (index == -1) {
         newView = that.getView(index = that.views.length - 1);
       } else {
         newView = that.getView(index);
       }

       that.lastIndex = that.index;

       that.index = index;

       x = xVal;
       y = yVal;

       if (speed > 0 && hasTransform && hasTransitionEnd) {

         style[transform] = (has3d) ?
           'translate3d(' + x * -1 + 'px, ' + y * -1 + 'px, 0)' :
           'translate(' + x * -1 + 'px, ' + y * -1 + 'px)';

         that._css(newView.el, style);

         that.el.appendChild(newView.el);

         that.trigger('slideAdded', newView);

         style[transitionDuration] = speed + 'ms';
         style[transitionTimingFunction] = 'ease';
         style[transform] = (has3d) ?
           'translate3d(' + x + 'px, ' + y + 'px, 0)' :
           'translate(' + x + 'px, ' + y + 'px)';

         addEvt(newView.el, TRNEND_EV, function _transitionEnd() {
           rmEvt(this, _transitionEnd, false);
           that.slideEnd();
         }, false);

         setTimeout(function() {
           nextFrame(function() {
             that._css(currentView.el, style);
             style[transform] = (has3d) ?
               'translate3d(0, 0, 0)' :
               'translate(0, 0)';
             that._css(newView.el, style);
           });
         }, 1);

       } else if (window.jQuery && speed > 0) {

         jQuery(newView.el).css({
           'margin-left': x * -1,
           'margin-top': y * -1
         });

         that.el.appendChild(newView.el);

         that.trigger('slideAdded', newView);

         jQuery(currentView.el).animate({
           'margin-left': x,
           'margin-top': y
         }, speed);

         jQuery(newView.el).animate({
           'margin-left': 0,
           'margin-top': 0
         }, speed, function() {
           that.slideEnd();
         });

       } else {
         if (currentView.el.parentNode)
           currentView.el.parentNode.removeChild(currentView.el);
         that.el.appendChild(newView.el);
         that.trigger('slideAdded', newView);
         that.slideEnd();
       }
     },
     slideEnd: function() {

       var lastView = this.getView(this.lastIndex);

       if (lastView.el.parentNode)
         lastView.el.parentNode.removeChild(lastView.el);
       if (lastView.detach) {
         lastView.detach();
       } else {
         throw 'SwipeViewLight: Error, detach method is required in UIView';
       }

       this.isSliding = false;

       if (this.lastIndex !== this.index) {
         this.trigger('changeView', this.views[this.index]);
       }
     },
     fireTouchEvent: function(e) {
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
           if (this.options.axis == 'x' && window.Math.abs(distX) >= this.horizontalDistanceThreshold && window.Math.abs(distY) <= this.verticalDistanceThreshold) {
             this.onTouch((distX < 0) ? 'swipeleft' : 'swiperight', this.endPoint);
             return;
           }
           if (this.options.axis == 'y' && window.Math.abs(distY) >= this.swipeThreshold && window.Math.abs(distX) <= this.scrollSupressionThreshold) {
             this.onTouch((distY < 0) ? 'swipetop' : 'swipebottom', this.endPoint);
             return;
           }
         }
       }
     },
     onTouch: function(action, point) {
       switch (action) {
         case START_EV:
           this.startPoint = point;
           break;
         case 'touchmoveend':
         case 'swipeleft':
         case 'swiperight':
         case 'swipetop':
         case 'swipebottom':
           this.slide(action);
           break;
       }
     },
     _getPoint: function(e, changedTouches) {
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
     _css: function(target, styles) {
       var p;
       for (p in styles) {
         target.style[p] = styles[p];
       }
     },
     _transitionEnd: function(e) {
       //console.log("Other END");
       rmEvt(this.el, TRNEND_EV, this);
     },
     _start: function(e) {
       if (this.enabled === false) {
         return;
       }
       this.touchStartTime = new Date();
       this.isGesture = false;
       this.startPoint = this._getPoint(e);
       if (e.type == "touchstart" && e.touches.length > 1 && this.options.gesture) {
         this.isGesture = true;
         return;
       }
       this.onTouch(START_EV, this.startPoint);

       addEvt(this.el, MOVE_EV, this);
       addEvt(this.el, END_EV, this);
       if (hasTouch)
         addEvt(window, CANCEL_EV, this);

       if (this.options.preventDefaultTouchEvents) {
         e.preventDefault();
       }
     },
     _move: function(e) {
       if (this.isGesture && this.options.gesture) {
         return;
       }
       if (this.options.move)
         this.onTouch(MOVE_EV, this._getPoint(e));

       if (this.options.preventDefaultTouchEvents) {
         e.preventDefault();
       }

     },
     _end: function(e) {
       if (this.isGesture && this.options.gesture) {
         return;
       }

       this.endPoint = this._getPoint(e, !(typeof e.changedTouches === "undefined" || e.changedTouches === null));
       this.onTouch(END_EV, this.endPoint);
       this.fireTouchEvent(e);
       rmEvt(this.el, MOVE_EV, this);
       rmEvt(this.el, END_EV, this);
       if (hasTouch)
         rmEvt(window, CANCEL_EV, this);
       if (this.options.preventDefaultTouchEvents) {
         e.preventDefault();
       }
     },
     _resize: function() {
       this.el.style.height = this.dom.target.offsetHeight + 'px';
       this.el.style.width = this.dom.target.offsetWidth + 'px';
       this.trigger('resize');
     },

     destroy: function() {
       rmEvt(window, RESIZE_EV, this);
       rmEvt(this.el, START_EV, this);
       if (this.el.parentNode)
         this.el.parentNode.removeChild(this.el);
     }
   });

   function prefixStyle(style) {
     if (vendor === '') return style;
     style = style.charAt(0).toUpperCase() + style.substr(1);
     return vendor + style;
   }
   fixEvent.preventDefault = function() {
     this.returnValue = false;
   };
   fixEvent.stopPropagation = function() {
     this.cancelBubble = true;
   };

   return SwipeViewLight;
 })(window, document);

 if (typeof define === 'function' && define.amd) {
   define(function() {
     return UISwipeViewLight;
   });
 }
