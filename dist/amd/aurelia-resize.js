define(['exports', 'aurelia-framework'], function (exports, _aureliaFramework) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var ResizeCustomAttribute = (function () {
    function ResizeCustomAttribute(element) {
      _classCallCheck(this, _ResizeCustomAttribute);

      this.element = element;
      this.callback = null;
    }

    _createClass(ResizeCustomAttribute, [{
      key: 'createThrottler',
      value: function createThrottler(fn, delay) {
        var _arguments = arguments;

        var timeout = 0;
        return function () {
          var args = _arguments;
          if (timeout == 0) {
            timeout = setTimeout(function () {
              timeout = 0;
              return fn.apply(fn, args);
            }, delay);
          }
        };
      }
    }, {
      key: 'createDebouncer',
      value: function createDebouncer(fn, delay) {
        var timeout = 0;
        return function () {
          var args = arguments;
          timeout && clearTimeout(timeout);
          timeout = setTimeout(function () {
            return fn.apply(fn, args);
          }, delay);
        };
      }
    }, {
      key: 'bind',
      value: function bind() {
        if (this.handler == undefined) return;

        var element = this.element;
        var handler = this.handler;
        this.callback = function () {
          var width = element.offsetWidth;
          var height = element.offsetHeight;
          handler(width, height);
        };

        if (this.throttle != undefined && this.throttle > 0) this.callback = this.createThrottler(this.callback, this.throttle);else if (this.debounce != undefined && this.debounce > 0) this.callback = this.createDebouncer(this.callback, this.debounce);

        addResizeListener(this.element, this.callback);
      }
    }, {
      key: 'unbind',
      value: function unbind() {
        if (this.callback) removeResizeListener(this.element, this.callback);
      }
    }]);

    var _ResizeCustomAttribute = ResizeCustomAttribute;
    ResizeCustomAttribute = (0, _aureliaFramework.bindable)('debounce')(ResizeCustomAttribute) || ResizeCustomAttribute;
    ResizeCustomAttribute = (0, _aureliaFramework.bindable)('throttle')(ResizeCustomAttribute) || ResizeCustomAttribute;
    ResizeCustomAttribute = (0, _aureliaFramework.bindable)('handler')(ResizeCustomAttribute) || ResizeCustomAttribute;
    ResizeCustomAttribute = (0, _aureliaFramework.customAttribute)('resize-event')(ResizeCustomAttribute) || ResizeCustomAttribute;
    ResizeCustomAttribute = (0, _aureliaFramework.inject)(Element)(ResizeCustomAttribute) || ResizeCustomAttribute;
    return ResizeCustomAttribute;
  })();

  exports.ResizeCustomAttribute = ResizeCustomAttribute;

  (function () {
    var attachEvent = document.attachEvent;
    var isIE = navigator.userAgent.match(/Trident/);
    console.log(isIE);
    var requestFrame = (function () {
      var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
        return window.setTimeout(fn, 20);
      };
      return function (fn) {
        return raf(fn);
      };
    })();

    var cancelFrame = (function () {
      var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout;
      return function (id) {
        return cancel(id);
      };
    })();

    function resizeListener(e) {
      var win = e.target || e.srcElement;
      if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
      win.__resizeRAF__ = requestFrame(function () {
        var trigger = win.__resizeTrigger__;
        trigger.__resizeListeners__.forEach(function (fn) {
          fn.call(trigger, e);
        });
      });
    }

    function objectLoad(e) {
      this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
      this.contentDocument.defaultView.addEventListener('resize', resizeListener);
    }

    window.addResizeListener = function (element, fn) {
      if (!element.__resizeListeners__) {
        element.__resizeListeners__ = [];
        if (attachEvent) {
          element.__resizeTrigger__ = element;
          element.attachEvent('onresize', resizeListener);
        } else {
          if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
          var obj = element.__resizeTrigger__ = document.createElement('object');
          obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
          obj.__resizeElement__ = element;
          obj.onload = objectLoad;
          obj.type = 'text/html';
          if (isIE) element.appendChild(obj);
          obj.data = 'about:blank';
          if (!isIE) element.appendChild(obj);
        }
      }
      element.__resizeListeners__.push(fn);
    };

    window.removeResizeListener = function (element, fn) {
      element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
      if (!element.__resizeListeners__.length) {
        if (attachEvent) element.detachEvent('onresize', resizeListener);else {
          element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
          element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
        }
      }
    };
  })();
});