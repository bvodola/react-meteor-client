'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactNativeWeb = require('react-native-web');

var _reactNativeWeb2 = _interopRequireDefault(_reactNativeWeb);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _minimongoCache = require('minimongo-cache');

var _minimongoCache2 = _interopRequireDefault(_minimongoCache);

var _trackr = require('trackr');

var _trackr2 = _interopRequireDefault(_trackr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.nextTick = setImmediate;

var db = new _minimongoCache2.default();
db.debug = false;
db.batchedUpdates = _reactDom2.default.unstable_batchedUpdates;

function runAfterOtherComputations(fn) {
  _reactNativeWeb.InteractionManager.runAfterInteractions(function () {
    _trackr2.default.afterFlush(function () {
      fn();
    });
  });
}

exports.default = {
  _endpoint: null,
  _options: null,
  ddp: null,
  subscriptions: {},
  db: db,
  calls: [],

  getUrl: function getUrl() {
    return this._endpoint.substring(0, this._endpoint.indexOf('/websocket'));
  },
  waitDdpReady: function waitDdpReady(cb) {
    var _this = this;

    if (this.ddp) {
      cb();
    } else {
      runAfterOtherComputations(function () {
        _this.waitDdpReady(cb);
      });
    }
  },


  _cbs: [],
  onChange: function onChange(cb) {
    this.db.on('change', cb);
    this.ddp.on('connected', cb);
    this.ddp.on('disconnected', cb);
    this.on('loggingIn', cb);
    this.on('change', cb);
  },
  offChange: function offChange(cb) {
    this.db.off('change', cb);
    this.ddp.off('connected', cb);
    this.ddp.off('disconnected', cb);
    this.off('loggingIn', cb);
    this.off('change', cb);
  },
  on: function on(eventName, cb) {
    this._cbs.push({
      eventName: eventName,
      callback: cb
    });
  },
  off: function off(eventName, cb) {
    this._cbs.splice(this._cbs.findIndex(function (_cb) {
      return _cb.callback == cb && _cb.eventName == eventName;
    }), 1);
  },
  notify: function notify(eventName) {
    this._cbs.map(function (cb) {
      if (cb.eventName == eventName && typeof cb.callback == 'function') {
        cb.callback();
      }
    });
  },
  waitDdpConnected: function waitDdpConnected(cb) {
    var _this2 = this;

    if (this.ddp && this.ddp.status == 'connected') {
      cb();
    } else if (this.ddp) {
      this.ddp.once('connected', cb);
    } else {
      setTimeout(function () {
        _this2.waitDdpConnected(cb);
      }, 10);
    }
  }
};