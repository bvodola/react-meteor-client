'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (reactiveFn, L, E, options) {
  var onPropsChange = function onPropsChange(props, onData) {
    var trackerCleanup = void 0;

    var _meteorDataDep = new _trackr2.default.Dependency();
    var _meteorDataChangedCallback = function _meteorDataChangedCallback() {
      _meteorDataDep.changed();
    };

    _Data2.default.onChange(_meteorDataChangedCallback);

    var handler = _trackr2.default.nonreactive(function () {
      return _trackr2.default.autorun(function () {
        _meteorDataDep.depend();
        trackerCleanup = reactiveFn(props, onData);
      });
    });

    return function () {
      if (typeof trackerCleanup === 'function') {
        trackerCleanup();
      }
      _Data2.default.offChange(_meteorDataChangedCallback);
      return handler.stop();
    };
  };

  return (0, _reactKomposer.compose)(onPropsChange, L, E, options);
};

var _trackr = require('trackr');

var _trackr2 = _interopRequireDefault(_trackr);

var _reactKomposer = require('react-komposer');

var _Data = require('../Data');

var _Data2 = _interopRequireDefault(_Data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }