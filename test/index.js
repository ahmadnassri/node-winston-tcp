'use strict'

const net = require('net')
const Transport = require('../lib/index')
const winston = require('winston')
const util = require('util')
const tap = require('tap')

const debug = util.debuglog('winston:tcp:test')

const server = net.createServer(socket => {
  socket.on('data', data => debug('[data]: %s %j', data))
  socket.on('error', err => debug('[error]: %s %j', err))
})

tap.test('setup', test => server.listen(1337, '127.0.0.1', 10, test.end))

tap.test('no host & port provided', assert => {
  assert.throws(_ => {
    let transport = new Transport()

    assert.equal(transport, undefined)
  }, 'should fail')

  assert.end()
})

tap.test('connection management', assert => {
  assert.plan(2)

  let transport = new Transport({
    host: '0.0.0.0',
    port: 1337,
    reconnectInterval: 50,
    reconnectAttempts: 2
  })

  setTimeout(_ => assert.ok(transport.connected, 'connected'), transport.options.reconnectInterval)

  setTimeout(_ => {
    transport.disconnect()

    assert.notOk(transport.connected, 'disconnected')
  }, transport.options.reconnectInterval * transport.options.reconnectAttempts)
})

tap.test('reconnect on failure', assert => {
  let transport = new Transport({
    host: '0.0.0.0',
    port: 1330, // point to wrong port initially
    reconnectInterval: 50,
    reconnectAttempts: 5
  })

  setTimeout(_ => {
    // fix the port (to avoid thrown error)
    transport.options.port = 1337

    // test
    assert.equal(transport.connectionAttempts, transport.options.reconnectAttempts - 1, 'attempted to reconnect 4 times')
  }, transport.options.reconnectInterval * (transport.options.reconnectAttempts - 1))

  // disconnect after the last attempt
  setTimeout(_ => transport.disconnect(assert.end), transport.options.reconnectInterval * transport.options.reconnectAttempts)
})

tap.test('write entries', assert => {
  let transport = new Transport({
    host: '0.0.0.0',
    port: 1337,
    json: true
  })

  let logger = new winston.Logger({
    transports: [transport]
  })

  // dummy data
  let data = Array.apply(null, { length: 20 }).map(Math.random)
  data.forEach(msg => logger.log('info', msg, { yolo: 'foo' }))

  // delay a bit to allow socket connection
  setTimeout(_ => {
    assert.equal(transport.entryBuffer.length(), 0, 'buffer drained')
    transport.disconnect(assert.end)
  }, 50)
})

tap.test('accepts a custom formatter', assert => {
  let transport = new Transport({
    host: '0.0.0.0',
    port: 1337,
    formatter: (options) => {
      return options.message.toUpperCase()
    }
  })

  let logger = new winston.Logger({
    transports: [transport]
  })

  // dummy data
  logger.log('info', 'uppercase')

  transport.entryBuffer.drain(entry => assert.equal(entry, 'UPPERCASE'))

  // delay a bit to allow socket connection
  setTimeout(_ => {
    transport.disconnect(assert.end)
  }, 50)
})

>>>>>>> danielsiwiec-master
tap.test('buffer entries', assert => {
  let transport = new Transport({
    host: '0.0.0.0',
    // point to wrong port at first
    port: 1330,
    reconnectInterval: 100,
    reconnectAttempts: 2
  })

  let logger = new winston.Logger({
    transports: [transport]
  })

  // dummy data
  let data = Array.apply(null, { length: 20 }).map(Math.random)
  data.forEach(msg => logger.log('info', msg))

  // test
  assert.equal(transport.entryBuffer.length(), 20, '20 entries in buffer')

  // fix the port before continue
  transport.options.port = 1337

  // delay a bit to allow socket connection
  setTimeout(_ => {
    assert.equal(transport.entryBuffer.length(), 0, 'buffer drained')
    transport.disconnect(assert.end)
  }, transport.options.reconnectInterval * transport.options.reconnectAttempts)
})

tap.test('buffer => drain', assert => {
  // setup transport
  let transport = new Transport({
    host: '0.0.0.0',
    port: 1330,  // point to wrong port initially
    reconnectInterval: 100,
    reconnectAttempts: 3
  })

  // setup winston
  let logger = new winston.Logger({
    transports: [transport]
  })

  // dummy data
  let data = Array.apply(null, { length: 20 }).map(Math.random)
  data.forEach(msg => logger.log('info', msg))

  // set the correct port
  transport.options.port = 1337

  setTimeout(_ => {
    assert.equal(transport.entryBuffer.length(), 0, 'buffer drained')
    transport.disconnect(assert.end)
  }, transport.options.reconnectInterval * (transport.options.reconnectAttempts - 1))
})

// teardown
tap.test('teardown', assert => server.close(assert.end))
