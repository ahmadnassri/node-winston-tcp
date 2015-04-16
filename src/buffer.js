'use strict'

function EntryBuffer (maxLength) {
  this.buffer = []
  this.maxLength = maxLength || false
}

EntryBuffer.prototype.add = function (entry) {
  if (this.maxLength === false || this.buffer.length < this.maxLength) {
    this.buffer.push(entry)
  }
}

EntryBuffer.prototype.drain = function (callback) {
  if (callback) {
    var i = this.buffer.length

    while (i--) {
      callback(this.buffer[i])
    }
  }

  this.buffer = []
}

EntryBuffer.prototype.length = function () {
  return this.buffer.length
}

module.exports = EntryBuffer
