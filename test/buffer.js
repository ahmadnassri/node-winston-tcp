/* global describe, it */

'use strict'

var EntryBuffer = require('../src/buffer')

require('should')

describe('Entry Buffer', function () {
  it('should return current length', function (done) {
    var data = Array.apply(null, {length: 20}).map(Math.random)

    var buffer = new EntryBuffer()
    data.map(buffer.add, buffer)

    buffer.length().should.equal(20)

    done()
  })

  it('should not allow more than max entries', function (done) {
    var data = Array.apply(null, {length: 20}).map(Math.random)

    var buffer = new EntryBuffer(10)
    data.map(buffer.add, buffer)

    buffer.length().should.equal(10)

    done()
  })

  it('should drain without a callback', function (done) {
    var data = Array.apply(null, {length: 10}).map(Math.random)

    var buffer = new EntryBuffer()
    data.map(buffer.add, buffer)

    buffer.drain()

    buffer.length().should.equal(0)

    done()
  })

  it('should drain with a callback', function (done) {
    var counter = 0
    var data = Array.apply(null, {length: 10}).map(Math.random)

    var buffer = new EntryBuffer()
    data.map(buffer.add, buffer)

    buffer.drain(function (entry) {
      counter++
    })

    buffer.length().should.equal(0)
    counter.should.equal(10)

    done()
  })
})
