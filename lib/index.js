'use strict'

const assert = require('assert')
const EntryBuffer = require('./buffer')
const net = require('net')
const tls = require('tls')
const util = require('util')
const Transport = require('winston-transport')

const debug = util.debuglog('winston:tcp')

module.exports = class TCPTransport extends Transport {
  constructor(options) {
    super(options)
    this.options = Object.assign(
      {
        level: 'info',
        reconnectInterval: 1000,
        reconnectAttempts: 100,
        bufferLength: 10000
      },
      options
    )

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
    return this.connect()
  }

  connect() {
    if (!this.connected) {
      if (this.connectionAttempts >= this.options.reconnectAttempts) {
        throw Error('maximum reconnection attempts')
      }

      debug('connection attempt #%s', ++this.connectionAttempts)

      this.reconnect = true
      if (this.options.secure) {
        this.socket = new tls.connect({
          port: this.options.port,
          host: this.options.host
        })
      } else {
        this.socket = new net.connect({
          port: this.options.port,
          host: this.options.host
        })
      }

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
          this.entryBuffer.drain(this.log.bind(this))
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
    }
  }

  disconnect(callback) {
    this.connected = false
    this.reconnect = false
    this.socket.end(callback)
  }

  log(info, callback) {
    if (this.connected) {
      const message = new Buffer(this.options.formatter(info))
      this.socket.write(message, 'utf8', () => {
        this.emit('logged', message)
        if (typeof callback === 'function') {
          return callback(null, true)
        }
      })
    } else {
      this.entryBuffer.add(info)
      if (typeof callback === 'function') {
        return callback(null, true)
      }
    }
  }
}
