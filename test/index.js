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

server.listen(1337, '127.0.0.1', 10)

tap.test('no host & port provided', assert => {
  assert.throws(_ => {
    const transport = new Transport()

    assert.equal(transport, undefined)
  }, 'should fail')

  assert.end()
})

tap.test('connection management', assert => {
  assert.plan(2)

  const transport = new Transport({
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
  const transport = new Transport({
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
  const transport = new Transport({
    host: '0.0.0.0',
    port: 1337,
    json: true
  })

  const logger = winston.createLogger({
    transports: [transport]
  })

  // dummy data
  const data = Array.apply(null, { length: 20 }).map(Math.random)
  data.forEach(message => logger.log({ level: 'info', message, yolo: 'foo' }))

  // delay a bit to allow socket connection
  setTimeout(_ => {
    assert.equal(transport.entryBuffer.length(), 0, 'buffer drained')
    transport.disconnect(assert.end)
  }, 50)
})

tap.test('accepts a custom formatter', assert => {
  const transport = new Transport({
    host: '0.0.0.0',
    port: 1337,
    formatter: (options) => {
      return options.message.toUpperCase()
    }
  })

  const logger = winston.createLogger({
    transports: [transport]
  })

  // dummy data
  logger.log({ level: 'info', message: 'uppercase' })

  transport.entryBuffer.drain(entry => assert.equal(entry, '{"level":"info","message":"uppercase"}'))

  // delay a bit to allow socket connection
  setTimeout(_ => {
    transport.disconnect(assert.end)
  }, 50)
})

tap.test('buffer entries', assert => {
  const transport = new Transport({
    host: '0.0.0.0',
    // point to wrong port at first
    port: 1330,
    reconnectInterval: 100,
    reconnectAttempts: 2
  })

  const logger = winston.createLogger({
    transports: [transport]
  })

  // dummy data
  const data = Array.apply(null, { length: 20 }).map(Math.random)
  data.forEach(message => logger.log({ level: 'info', message }))

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
  const transport = new Transport({
    host: '0.0.0.0',
    port: 1330, // point to wrong port initially
    reconnectInterval: 100,
    reconnectAttempts: 3
  })

  // setup winston
  const logger = winston.createLogger({
    transports: [transport]
  })

  // dummy data
  const data = Array.apply(null, { length: 20 }).map(Math.random)
  data.forEach(message => logger.log({ level: 'info', message }))

  // set the correct port
  transport.options.port = 1337

  setTimeout(_ => {
    assert.equal(transport.entryBuffer.length(), 0, 'buffer drained')
    transport.disconnect(assert.end)
  }, transport.options.reconnectInterval * (transport.options.reconnectAttempts - 1))
})

// teardown
tap.teardown(() => server.close())
