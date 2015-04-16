'use strict'

var net = require('net')
var util = require('util')
var winston = require('winston')
var common = require('winston/lib/winston/common')

var TCP = winston.transports.TCP = function (options) {
  winston.Transport.call(this, options)

  this.options = options || {}

  // generic transport requirements
  this.name = 'winston-tcp'
  this.level = options.level || 'info'

  // tcp transport specific options
  this.host = options.host || '127.0.0.1'
  this.port = options.port || 1337

  this.connect()
}

util.inherits(TCP, winston.Transport)

TCP.prototype.connect = function () {
  this.client = new net.Socket()
  this.client.connect(this.port, this.host)
}

TCP.prototype.log = function (level, msg, meta, callback) {
  var self = this

  if (typeof meta === 'function') {
    callback = meta
    meta = {}
  }

  console.log(self.options)

  var entry = common.log({
    level: level,
    message: msg,
    meta: meta,
    timestamp: self.options.timestamp || false,
    json: self.options.json || false
  })

  console.log(self.options.json)

  self.client.write(entry, 'utf8', function () {
    self.emit('logged')

    if (callback) callback(null, true)
  })

}

module.exports = TCP
