/* global describe, it, beforeEach, afterEach */

'use strict'

var debug = require('debug')('winston:tcp:test')
var net = require('net')
var should = require('should')
var Transport = require('..')
var winston = require('winston')

var server

beforeEach(function (done) {
  server = net.createServer(function (socket) {
    socket.on('data', function (data) {
      debug('[%s]: %s', new Date().toISOString(), data.toString())
    })

    socket.on('error', function (err) {
      debug('[%s] %s:', new Date().toISOString(), err.toString())
    })
  })

  server.listen(1337, '127.0.0.1', 10, done)
})

afterEach(function () {
  server.close()
})

describe('node module', function () {
  it('should fail if no host & port are provided', function (done) {
    var transport

    /*eslint-disable no-extra-parens */
    (function () {
      transport = new Transport()
    }).should.throw(Error)

    should.not.exist(transport)

    done()
  })

  it('should try reconnecting', function (done) {
    var transport = new Transport({
      host: '0.0.0.0',
      port: 1330,
      reconnectInterval: 50
    })

    setTimeout(function () {
      // set the correct port
      transport.port = 1337
      transport.connectionAttempts.should.equal(4)
    }, 200)

    setTimeout(function () {
      done()
    }, 500)
  })

  it('should close connection', function (done) {
    var transport = new Transport({
      host: '0.0.0.0',
      port: 1337,
      reconnectInterval: 50
    })

    setTimeout(function () {
      transport.connected.should.be.true
    }, 100)

    setTimeout(function () {
      transport.disconnect()
      transport.connected.should.be.false
      done()
    }, 200)
  })

  it('should buffer entries', function (done) {
    var data = Array.apply(null, {length: 20}).map(Math.random)

    var transport = new Transport({
      host: '0.0.0.0',
      port: 1330
    })

    var logger = new winston.Logger({
      transports: [transport]
    })

    data.forEach(function (msg) {
      logger.log('info', msg)
    })

    transport.entryBuffer.length().should.equal(20)

    done()
  })

  it('should write entries', function (done) {
    var data = Array.apply(null, {length: 20}).map(Math.random)

    var transport = new Transport({
      host: '0.0.0.0',
      port: 1337
    })

    var logger = new winston.Logger({
      transports: [transport]
    })

    // delay a bit to allow socket connection
    setTimeout(function () {
      data.forEach(function (msg) {
        logger.log('info', msg)
      })

      transport.entryBuffer.length().should.equal(0)

      done()
    }, 100)
  })

  it('should buffer first then drain when connection is established', function (done) {
    var data = Array.apply(null, {length: 20}).map(Math.random)

    var transport = new Transport({
      host: '0.0.0.0',
      port: 1330,
      reconnectInterval: 200
    })

    var logger = new winston.Logger({
      transports: [transport]
    })

    data.forEach(function (msg) {
      logger.log('info', msg)
    })

    setTimeout(function () {
      // set the correct port
      transport.port = 1337
    }, 100)

    setTimeout(function () {
      transport.entryBuffer.length().should.equal(0)

      done()
    }, 400)
  })
})
