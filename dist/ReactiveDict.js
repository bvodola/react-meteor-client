'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ejson = require('ejson');

var _ejson2 = _interopRequireDefault(_ejson);

var _Data = require('./Data');

var _Data2 = _interopRequireDefault(_Data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var stringify = function stringify(value) {
  if (value === undefined) return 'undefined';
  return _ejson2.default.stringify(value);
};

var parse = function parse(serialized) {
  if (serialized === undefined || serialized === 'undefined') return undefined;
  return _ejson2.default.parse(serialized);
};

var ReactiveDict = function () {
  function ReactiveDict(dictName) {
    _classCallCheck(this, ReactiveDict);

    this.keys = {};
    if ((typeof dictName === 'undefined' ? 'undefined' : _typeof(dictName)) === 'object') {
      for (var i in dictName) {
        this.keys[i] = stringify(dictName[i]);
      }
    }
  }

  _createClass(ReactiveDict, [{
    key: 'set',
    value: function set(keyOrObject, value) {
      if ((typeof keyOrObject === 'undefined' ? 'undefined' : _typeof(keyOrObject)) === 'object' && value === undefined) {
        this._setObject(keyOrObject);
        return;
      }
      // the input isn't an object, so it must be a key
      // and we resume with the rest of the function
      var key = keyOrObject;

      value = stringify(value);

      var oldSerializedValue = 'undefined';
      if (Object.keys(this.keys).indexOf(key) != -1) {
        oldSerializedValue = this.keys[key];
      }
      if (value === oldSerializedValue) return;

      this.keys[key] = value;

      _Data2.default.notify('change');
    }
  }, {
    key: 'setDefault',
    value: function setDefault(key, value) {
      // for now, explicitly check for undefined, since there is no
      // ReactiveDict.clear().  Later we might have a ReactiveDict.clear(), in which case
      // we should check if it has the key.
      if (this.keys[key] === undefined) {
        this.set(key, value);
      }
    }
  }, {
    key: 'get',
    value: function get(key) {
      return parse(this.keys[key]);
    }
  }, {
    key: 'equals',
    value: function equals(key, value) {
      // We don't allow objects (or arrays that might include objects) for
      // .equals, because JSON.stringify doesn't canonicalize object key
      // order. (We can make equals have the right return value by parsing the
      // current value and using EJSON.equals, but we won't have a canonical
      // element of keyValueDeps[key] to store the dependency.) You can still use
      // "EJSON.equals(reactiveDict.get(key), value)".
      //
      // XXX we could allow arrays as long as we recursively check that there
      // are no objects
      if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean' && typeof value !== 'undefined' && !(value instanceof Date) && !(ObjectID && value instanceof ObjectID) && value !== null) throw new Error("ReactiveDict.equals: value must be scalar");

      var serializedValue = stringify(value);

      var oldValue = undefined;
      if (Object.keys(this.keys).indexOf(key) != -1) {
        oldValue = parse(this.keys[key]);
      }
      return _ejson2.default.equals(oldValue, value);
    }
  }, {
    key: '_setObject',
    value: function _setObject(object) {

      var keys = Object.keys(object);

      for (var i in keys) {
        this.set(i, keys[i]);
      }
    }
  }]);

  return ReactiveDict;
}();

exports.default = ReactiveDict;