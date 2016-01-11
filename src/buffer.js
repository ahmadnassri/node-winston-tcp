export default class EntryBuffer {
  constructor (maxLength = false) {
    this.buffer = []
    this.maxLength = maxLength
  }

  add (entry) {
    if (this.maxLength === false || this.buffer.length < this.maxLength) {
      this.buffer.push(entry)
    }
  }

  drain (callback) {
    if (typeof callback === 'function') {
      var i = this.buffer.length

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
