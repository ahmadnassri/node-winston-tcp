'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _common = require('winston/lib/winston/common');

var _common2 = _interopRequireDefault(_common);

var _debugLog = require('debug-log');

var _debugLog2 = _interopRequireDefault(_debugLog);

var _buffer = require('./buffer');

var _buffer2 = _interopRequireDefault(_buffer);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = (0, _debugLog2.default)('winston:tcp');

var TCPTransport = function (_winston$Transport) {
  _inherits(TCPTransport, _winston$Transport);

  function TCPTransport() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? { level: 'info', reconnectInterval: 1000, reconnectAttempts: 100, bufferLength: 10000 } : arguments[0];

    _classCallCheck(this, TCPTransport);

    // store config

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TCPTransport).call(this, options));

    _this.options = options;

    (0, _assert2.default)(_this.options.host, 'Must define a host');
    (0, _assert2.default)(_this.options.port, 'Must supply a port');

    // generic transport requirements
    _this.name = 'winston-tcp';

    // initiate entry buffer
    _this.entryBuffer = new _buffer2.default(_this.options.bufferLength);

    // internal flags
    _this.connected = false;
    _this.connectionAttempts = 0; // cleared after each connection
    _this.connectionCount = 0;
    _this.reconnect = false;

    _this.connect();
    return _this;
  }

  _createClass(TCPTransport, [{
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      if (!this.connected) {
        if (this.connectionAttempts >= this.options.reconnectAttempts) {
          throw Error('maximum reconnection attempts');
        }

        debug('connection attempt #%s', ++this.connectionAttempts);

        this.reconnect = true;
        this.socket = new _net2.default.Socket();
        this.socket.unref();

        this.socket.on('error', function (err) {
          return debug('socket error %j', err);
        });

        this.socket.on('connect', function () {
          _this2.connected = true;
          _this2.connectionAttempts = 0;

          debug('connection established #%s', ++_this2.connectionCount);

          // attempt to resend messages

          var bufferLength = _this2.entryBuffer.length();

          if (bufferLength) {
            debug('draining buffer of %s entries', bufferLength);

            _this2.entryBuffer.drain(_this2.write.bind(_this2));
          }
        });

        this.socket.on('close', function () {
          debug('connection closed');

          _this2.socket.destroy();
          _this2.connected = false;

          if (_this2.reconnect) {
            debug('attempt to reconnect in %s', _this2.options.reconnectInterval);

            setTimeout(_this2.connect.bind(_this2), _this2.options.reconnectInterval);
          }
        });

        this.socket.connect(this.options.port, this.options.host);
      }
    }
  }, {
    key: 'disconnect',
    value: function disconnect(callback) {
      this.connected = false;
      this.reconnect = false;
      this.socket.end(callback);
    }
  }, {
    key: 'write',
    value: function write(entry, callback) {
      if (this.connected) {
        debug('writing to socket %j', entry);

        this.socket.write(entry, 'utf8', function () {
          if (typeof callback === 'function') {
            callback(null, true);
          }
        });
      } else {
        debug('writing to buffer %j', entry);

        this.entryBuffer.add(entry);

        if (typeof callback === 'function') {
          callback(null, true);
        }
      }
    }
  }, {
    key: 'log',
    value: function log(level, msg, meta, callback) {
      if (typeof meta === 'function') {
        callback = meta;
        meta = {};
      }

      var entry = _common2.default.log({
        level: level,
        message: msg,
        meta: meta,
        timestamp: this.options.timestamp,
        json: this.options.json
      });

      this.write(entry, callback);
    }
  }]);

  return TCPTransport;
}(_winston2.default.Transport);

_winston2.default.transports.TCP = TCPTransport;

exports.default = TCPTransport;