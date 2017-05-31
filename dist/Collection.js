'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Collection = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _trackr = require('trackr');

var _trackr2 = _interopRequireDefault(_trackr);

var _ejson = require('ejson');

var _ejson2 = _interopRequireDefault(_ejson);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _Data = require('./Data');

var _Data2 = _interopRequireDefault(_Data);

var _Random = require('../lib/Random');

var _Random2 = _interopRequireDefault(_Random);

var _Call = require('./Call');

var _Call2 = _interopRequireDefault(_Call);

var _utils = require('../lib/utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cursor = function () {
  function Cursor(collection, docs) {
    _classCallCheck(this, Cursor);

    this._docs = docs || [];
    this._collection = collection;
  }

  _createClass(Cursor, [{
    key: 'count',
    value: function count() {
      return this._docs.length;
    }
  }, {
    key: 'fetch',
    value: function fetch() {
      return this._transformedDocs();
    }
  }, {
    key: 'forEach',
    value: function forEach(callback) {
      this._transformedDocs().forEach(callback);
    }
  }, {
    key: 'map',
    value: function map(callback) {
      return this._transformedDocs().map(callback);
    }
  }, {
    key: '_transformedDocs',
    value: function _transformedDocs() {
      return this._collection._transform ? this._docs.map(this._collection._transform) : this._docs;
    }
  }]);

  return Cursor;
}();

var Collection = function () {
  function Collection(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Collection);

    if (!_Data2.default.db[name]) _Data2.default.db.addCollection(name);

    this._collection = _Data2.default.db[name];
    this._cursoredFind = options.cursoredFind;
    this._name = name;
    this._transform = wrapTransform(options.transform);
  }

  _createClass(Collection, [{
    key: 'find',
    value: function find(selector, options) {
      var result = void 0;
      var docs = void 0;

      if (typeof selector == 'string') {
        if (options) {
          docs = this._collection.findOne({ _id: selector }, options);
        } else {
          docs = this._collection.get(selector);
        }

        if (docs) docs = [docs];
      } else {
        docs = this._collection.find(selector, options);
      }

      if (this._cursoredFind) {
        result = new Cursor(this, docs);
      } else {
        if (docs && this._transform) docs = docs.map(this._transform);

        result = docs;
      }

      return result;
    }
  }, {
    key: 'findOne',
    value: function findOne(selector, options) {
      var result = this.find(selector, options);

      if (result) {
        if (this._cursoredFind) result = result.fetch();

        result = result[0];
      }

      return result;
    }
  }, {
    key: 'insert',
    value: function insert(item) {
      var _this = this;

      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      var id = void 0;

      if ('_id' in item) {
        if (!item._id || typeof item._id != 'string') {
          return callback("Meteor requires document _id fields to be non-empty strings");
        }
        id = item._id;
      } else {
        id = item._id = _Random2.default.id();
      }

      if (this._collection.get(id)) return callback({ error: 409, reason: 'Duplicate key _id with value ' + id });

      this._collection.upsert(item);
      _Data2.default.waitDdpConnected(function () {
        (0, _Call2.default)('/' + _this._name + '/insert', item, function (err) {
          if (err) {
            _this._collection.del(id);
            return callback(err);
          }

          callback(null, id);
        });
      });

      return id;
    }
  }, {
    key: 'update',
    value: function update(id, modifier) {
      var _this2 = this;

      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};

      if (typeof options == 'function') {
        callback = options;
        options = {};
      }

      if (!this._collection.get(id)) return callback({
        error: 409,
        reason: 'Item not found in collection ' + this._name + ' with id ' + id
      });

      _Data2.default.waitDdpConnected(function () {
        (0, _Call2.default)('/' + _this2._name + '/update', { _id: id }, modifier, function (err) {
          if (err) {
            return callback(err);
          }

          callback(null, id);
        });
      });
    }
  }, {
    key: 'remove',
    value: function remove(id) {
      var _this3 = this;

      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      var element = this.findOne(id);

      if (element) {
        this._collection.del(element._id);

        _Data2.default.waitDdpConnected(function () {
          (0, _Call2.default)('/' + _this3._name + '/remove', { _id: id }, function (err, res) {
            if (err) {
              _this3._collection.upsert(element);
              return callback(err);
            }
            callback(null, res);
          });
        });
      } else {
        callback('No document with _id : ' + id);
      }
    }
  }, {
    key: 'helpers',
    value: function helpers(_helpers) {
      var _this4 = this;

      var self = this;
      var _transform = void 0;

      if (this._transform && !this._helpers) _transform = this._transform;

      if (!this._helpers) {
        this._helpers = function Document(doc) {
          return _underscore2.default.extend(this, doc);
        };
        this._transform = function (doc) {
          if (_transform) {
            doc = _transform(doc);
          };
          return new _this4._helpers(doc);
        };
      }

      _underscore2.default.each(_helpers, function (helper, key) {
        _this4._helpers.prototype[key] = helper;
      });
    }
  }]);

  return Collection;
}();

//From Meteor core

// Wrap a transform function to return objects that have the _id field
// of the untransformed document. This ensures that subsystems such as
// the observe-sequence package that call `observe` can keep track of
// the documents identities.
//
// - Require that it returns objects
// - If the return value has an _id field, verify that it matches the
//   original _id field
// - If the return value doesn't have an _id field, add it back.


exports.Collection = Collection;
function wrapTransform(transform) {
  if (!transform) return null;

  // No need to doubly-wrap transforms.
  if (transform.__wrappedTransform__) return transform;

  var wrapped = function wrapped(doc) {
    if (!_underscore2.default.has(doc, '_id')) {
      // XXX do we ever have a transform on the oplog's collection? because that
      // collection has no _id.
      throw new Error("can only transform documents with _id");
    }

    var id = doc._id;
    // XXX consider making tracker a weak dependency and checking Package.tracker here
    var transformed = _trackr2.default.nonreactive(function () {
      return transform(doc);
    });

    if (!(0, _utils.isPlainObject)(transformed)) {
      throw new Error("transform must return object");
    }

    if (_underscore2.default.has(transformed, '_id')) {
      if (!_ejson2.default.equals(transformed._id, id)) {
        throw new Error("transformed document can't have different _id");
      }
    } else {
      transformed._id = id;
    }
    return transformed;
  };
  wrapped.__wrappedTransform__ = true;
  return wrapped;
};