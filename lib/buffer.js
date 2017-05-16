'use strict'

module.exports = class EntryBuffer {
  constructor (maxLength) {
    this.buffer = []
    this.maxLength = maxLength || false
  }

  add (entry) {
    if (this.maxLength === false || this.buffer.length < this.maxLength) {
      this.buffer.push(entry)
    }
  }

  drain (callback) {
    if (typeof callback === 'function') {
      let i = this.buffer.length

      while (i--) {
        callback(this.buffer[i])
      }
    }

    this.buffer = []
  }

  length () {
    return this.buffer.length
  }
}
