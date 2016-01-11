'use strict'

import assert from 'assert'
import common from 'winston/lib/winston/common'
import debugLog from 'debug-log'
import EntryBuffer from './buffer'
import net from 'net'
import winston from 'winston'

var debug = debugLog('winston:tcp')

class TCPTransport extends winston.Transport {
  constructor (options = { level: 'info', reconnectInterval: 1000, reconnectAttempts: 100, bufferLength: 10000 }) {
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
    if (!this.connected) {
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

        var bufferLength = this.entryBuffer.length()

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

  write (entry, callback) {
    if (this.connected) {
      debug('writing to socket %j', entry)

      this.socket.write(entry, 'utf8', () => {
        if (typeof callback === 'function') {
          callback(null, true)
        }
      })
    } else {
      debug('writing to buffer %j', entry)

      this.entryBuffer.add(entry)

      if (typeof callback === 'function') {
        callback(null, true)
      }
    }
  }

  log (level, msg, meta, callback) {
    if (typeof meta === 'function') {
      callback = meta
      meta = {}
    }

    var entry = common.log({
      level: level,
      message: msg,
      meta: meta,
      timestamp: this.options.timestamp,
      json: this.options.json
    })

    this.write(entry, callback)
  }
}

winston.transports.TCP = TCPTransport

export default TCPTransport
