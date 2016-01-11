'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EntryBuffer = function () {
  function EntryBuffer() {
    var maxLength = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    _classCallCheck(this, EntryBuffer);

    this.buffer = [];
    this.maxLength = maxLength;
  }

  _createClass(EntryBuffer, [{
    key: 'add',
    value: function add(entry) {
      if (this.maxLength === false || this.buffer.length < this.maxLength) {
        this.buffer.push(entry);
      }
    }
  }, {
    key: 'drain',
    value: function drain(callback) {
      if (typeof callback === 'function') {
        var i = this.buffer.length;

        while (i--) {
          callback(this.buffer[i]);
        }
      }

      this.buffer = [];
    }
  }, {
    key: 'length',
    value: function length() {
      return this.buffer.length;
    }
  }]);

  return EntryBuffer;
}();

exports.default = EntryBuffer;