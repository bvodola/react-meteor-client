'use strict';

var _reactNativeWeb = require('react-native-web');

var _Data = require('../Data');

var _Data2 = _interopRequireDefault(_Data);

var _utils = require('../../lib/utils');

var _Call = require('../Call');

var _Call2 = _interopRequireDefault(_Call);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var TOKEN_KEY = 'reactnativemeteor_usertoken';

module.exports = {
  user: function user() {
    if (!this._userIdSaved) return null;

    return this.collection('users').findOne(this._userIdSaved);
  },
  userId: function userId() {
    if (!this._userIdSaved) return null;

    var user = this.collection('users').findOne(this._userIdSaved);
    return user && user._id;
  },

  _isLoggingIn: true,
  loggingIn: function loggingIn() {
    return this._isLoggingIn;
  },
  logout: function logout(callback) {
    var _this = this;

    (0, _Call2.default)("logout", function (err) {
      _this.handleLogout();
      _this.connect();

      typeof callback == 'function' && callback(err);
    });
  },
  handleLogout: function handleLogout() {
    _reactNativeWeb.AsyncStorage.removeItem(TOKEN_KEY);
    _Data2.default._tokenIdSaved = null;
    this._userIdSaved = null;
  },
  loginWithPassword: function loginWithPassword(selector, password, callback) {
    var _this2 = this;

    if (typeof selector === 'string') {
      if (selector.indexOf('@') === -1) selector = { username: selector };else selector = { email: selector };
    }

    this._startLoggingIn();
    (0, _Call2.default)("login", {
      user: selector,
      password: (0, _utils.hashPassword)(password)
    }, function (err, result) {
      _this2._endLoggingIn();

      _this2._handleLoginCallback(err, result);

      typeof callback == 'function' && callback(err);
    });
  },
  logoutOtherClients: function logoutOtherClients() {
    var _this3 = this;

    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

    (0, _Call2.default)('getNewToken', function (err, res) {
      if (err) return callback(err);

      _this3._handleLoginCallback(err, res);

      (0, _Call2.default)('removeOtherTokens', function (err) {
        callback(err);
      });
    });
  },
  _login: function _login(user, callback) {
    var _this4 = this;

    this._startLoggingIn();
    this.call("login", user, function (err, result) {
      _this4._endLoggingIn();

      _this4._handleLoginCallback(err, result);

      typeof callback == 'function' && callback(err);
    });
  },
  _startLoggingIn: function _startLoggingIn() {
    this._isLoggingIn = true;
    _Data2.default.notify('loggingIn');
  },
  _endLoggingIn: function _endLoggingIn() {
    this._isLoggingIn = false;
    _Data2.default.notify('loggingIn');
  },
  _handleLoginCallback: function _handleLoginCallback(err, result) {
    if (!err) {
      //save user id and token
      _reactNativeWeb.AsyncStorage.setItem(TOKEN_KEY, result.token);
      _Data2.default._tokenIdSaved = result.token;
      this._userIdSaved = result.id;
      _Data2.default.notify('onLogin');
    } else {
      _Data2.default.notify('onLoginFailure');
      this.handleLogout();
    }
    _Data2.default.notify('change');
  },
  _loginWithToken: function _loginWithToken(value) {
    var _this5 = this;

    _Data2.default._tokenIdSaved = value;
    if (value !== null) {
      this._startLoggingIn();
      (0, _Call2.default)('login', { resume: value }, function (err, result) {
        _this5._endLoggingIn();
        _this5._handleLoginCallback(err, result);
      });
    } else {
      this._endLoggingIn();
    }
  },
  getAuthToken: function getAuthToken() {
    return _Data2.default._tokenIdSaved;
  },
  _loadInitialUser: function _loadInitialUser() {
    var _this6 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
      var value;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              value = null;
              _context.prev = 1;
              _context.next = 4;
              return _reactNativeWeb.AsyncStorage.getItem(TOKEN_KEY);

            case 4:
              value = _context.sent;
              _context.next = 10;
              break;

            case 7:
              _context.prev = 7;
              _context.t0 = _context['catch'](1);

              console.warn('AsyncStorage error: ' + _context.t0.message);

            case 10:
              _context.prev = 10;

              _this6._loginWithToken(value);
              return _context.finish(10);

            case 13:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this6, [[1, 7, 10, 13]]);
    }))();
  }
};