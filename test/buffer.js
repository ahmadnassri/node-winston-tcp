'use strict'

const EntryBuffer = require('../lib/buffer')
const tap = require('tap')

tap.test('return current length', assert => {
  let data = Array.apply(null, { length: 20 }).map(Math.random)

  let buffer = new EntryBuffer()
  data.map(buffer.add, buffer)

  assert.equal(buffer.length(), 20, '20 total entries')
  assert.end()
})

tap.test('don\'t allow more than max entries', assert => {
  let data = Array.apply(null, { length: 20 }).map(Math.random)

  let buffer = new EntryBuffer(10)
  data.map(buffer.add, buffer)

  assert.equal(buffer.length(), 10, 'reached max entries')
  assert.end()
})

tap.test('should drain without a callback', assert => {
  let data = Array.apply(null, { length: 10 }).map(Math.random)

  let buffer = new EntryBuffer()
  data.map(buffer.add, buffer)

  buffer.drain()

  assert.equal(buffer.length(), 0, 'empty drained')
  assert.end()
})

tap.test('drain with a callback', assert => {
  let counter = 0
  let data = Array.apply(null, { length: 10 }).map(Math.random)

  let buffer = new EntryBuffer()
  data.map(buffer.add, buffer)

  buffer.drain((entry) => counter++)

  assert.equal(buffer.length(), 0, 'buffer drained')
  assert.equal(counter, 10, 'counted 10 drain events')
  assert.end()
})
