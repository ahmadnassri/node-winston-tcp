const assert = require('assert')
const EntryBuffer = require('./buffer')
const net = require('net')
const Transport = require('winston-transport')
const util = require('util')

const debug = util.debuglog('winston:tcp')

module.exports = class TCPTransport extends Transport {
  constructor (options) {
    options = Object.assign({ level: 'info', reconnectInterval: 1000, reconnectAttempts: 100, bufferLength: 10000 }, options)

    super(options)

    // store config
    this.options = options

    assert(this.options.host, 'Must define a host')
    assert(this.options.port, 'Must supply a port')

    // generic transport requirements
    this.name = 'winston-tcp'

    // initiate entry buffer
    this.entryBuffer = new EntryBuffer(this.options.bufferLength)

    // internal flags
    this.connected = false
    this.connectionAttempts = 0 // cleared after each connection
    this.connectionCount = 0
    this.reconnect = false

    this.connect()
  }

  connect () {
    /* istanbul ignore else */
    if (!this.connected) {
      /* istanbul ignore if */
      if (this.connectionAttempts >= this.options.reconnectAttempts) {
        throw Error('maximum reconnection attempts')
      }

      debug('connection attempt #%s', ++this.connectionAttempts)

      this.reconnect = true
      this.socket = new net.Socket()
      this.socket.unref()

      this.socket.on('error', err => debug('socket error %j', err))

      this.socket.on('connect', () => {
        this.connected = true
        this.connectionAttempts = 0

        debug('connection established #%s', ++this.connectionCount)

        // attempt to resend messages

        const bufferLength = this.entryBuffer.length()

        if (bufferLength) {
          debug('draining buffer of %s entries', bufferLength)

          this.entryBuffer.drain(this.write.bind(this))
        }
      })

      this.socket.on('close', () => {
        debug('connection closed')

        this.socket.destroy()
        this.connected = false

        if (this.reconnect) {
          debug('attempt to reconnect in %s', this.options.reconnectInterval)

          setTimeout(this.connect.bind(this), this.options.reconnectInterval)
        }
      })

      this.socket.connect(this.options.port, this.options.host)
    }
  }

  disconnect (callback) {
    this.connected = false
    this.reconnect = false
    this.socket.end(callback)
  }

  write (info, callback) {
    const entry = JSON.stringify(info)

    if (this.connected) {
      debug('writing to socket %j', entry)

      this.socket.write(entry, 'utf8', () => {
        /* istanbul ignore if */
        if (typeof callback === 'function') {
          callback(null, true)
        }
      })
    } else {
      debug('writing to buffer %j', entry)

      this.entryBuffer.add(entry)

      /* istanbul ignore if */
      if (typeof callback === 'function') {
        callback()
      }
    }
  }

  /* istanbul ignore next */
  log (info, callback) {
    this.write(info, callback)
  }
}
