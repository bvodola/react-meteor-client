"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.uniqueId = uniqueId;
exports.contains = contains;
exports.hashPassword = hashPassword;
exports.isPlainObject = isPlainObject;

var _sha = require("crypto-js/sha256");

var _sha2 = _interopRequireDefault(_sha);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var i = 0;
function uniqueId() {
  return (i++).toString();
}

function contains(array, element) {
  return array.indexOf(element) !== -1;
}

function hashPassword(password) {
  return {
    digest: (0, _sha2.default)(password).toString(),
    algorithm: "sha-256"
  };
}

//From Meteor core
var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};

// Populate the class2type map
_underscore2.default.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (name, i) {
  class2type["[object " + name + "]"] = name.toLowerCase();
});

function type(obj) {
  if (obj == null) {
    return obj + "";
  }
  return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
}

function isWindow(obj) {
  /* jshint eqeqeq: false */
  return obj != null && obj == obj.window;
}

function isPlainObject(obj) {
  var key;

  // Must be an Object.
  // Because of IE, we also have to check the presence of the constructor property.
  // Make sure that DOM nodes and window objects don't pass through, as well
  if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
    return false;
  }

  try {
    // Not own constructor property must be Object
    if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
      return false;
    }
  } catch (e) {
    // IE8,9 Will throw exceptions on certain host objects #9897
    return false;
  }

  // Support: IE<9
  // Handle iteration over inherited properties before own properties.
  if (support.ownLast) {
    for (key in obj) {
      return hasOwn.call(obj, key);
    }
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  for (key in obj) {}

  return key === undefined || hasOwn.call(obj, key);
};