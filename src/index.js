'use strict'

var assert = require('assert')
var common = require('winston/lib/winston/common')
var debug = require('debug-log')('winston:tcp')
var EntryBuffer = require('./buffer')
var net = require('net')
var util = require('util')
var winston = require('winston')

var TCP = winston.transports.TCP = function (options) {
  options = options || {}
  winston.Transport.call(this, options)

  assert(options.host, 'Must define a host')
  assert(options.port, 'Must supply a port')

  // generic transport requirements
  this.name = 'winston-tcp'
  this.level = options.level || 'info'

  // tcp transport specific options
  this.host = options.host
  this.port = options.port

  this.timestamp = options.timestamp
  this.json = options.json
  this.reconnectInterval = options.reconnectInterval || 1000

  // initiate entry buffer
  this.entryBuffer = new EntryBuffer(options.bufferLength || 10000)

  // internal flags
  this.connected = false
  this.connectionAttempts = 0 // cleared after each connection
  this.connectionCount = 0
  this.reconnect = false

  this.connect()
}

util.inherits(TCP, winston.Transport)

TCP.prototype.connect = function () {
  if (!this.connected) {
    debug('connection attempt #%s', ++this.connectionAttempts)

    this.reconnect = true
    this.socket = new net.Socket()
    this.socket.unref()

    this.socket.on('error', function (err) {
      debug('socket error %j', err)
    })

    this.socket.on('connect', function () {
      this.connected = true
      this.connectionAttempts = 0

      debug('connection established #%s', ++this.connectionCount)

      // attempt to resend messages

      var bufferLength = this.entryBuffer.length()

      if (bufferLength) {
        debug('draining buffer of %s entries', bufferLength)

        this.entryBuffer.drain(this.write.bind(this))
      }
    }.bind(this))

    this.socket.on('close', function () {
      debug('connection closed')

      this.socket.destroy()
      this.connected = false

      if (this.reconnect) {
        debug('attempt to reconnect in %s', this.reconnectInterval)
        setTimeout(this.connect.bind(this), this.reconnectInterval)
      }
    }.bind(this))

    this.socket.connect(this.port, this.host)
  }
}

TCP.prototype.disconnect = function () {
  this.connected = false
  this.reconnect = false
  this.socket.end()
}

TCP.prototype.write = function (entry, callback) {
  if (this.connected) {
    debug('writing to socket %j', entry)

    this.socket.write(entry, 'utf8', function () {
      if (callback) callback(null, true)
    })
  } else {
    debug('writing to buffer %j', entry)

    this.entryBuffer.add(entry)
    if (callback) callback(null, true)
  }
}

TCP.prototype.log = function (level, msg, meta, callback) {
  if (typeof meta === 'function') {
    callback = meta
    meta = {}
  }

  var entry = common.log({
    level: level,
    message: msg,
    meta: meta,
    timestamp: this.timestamp,
    json: this.json
  })

  this.write(entry, callback)
}

module.exports = TCP
