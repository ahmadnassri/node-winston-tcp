/* global describe, it */

'use strict'

require('..')

var winston = require('winston')

require('should')

describe('node module', function () {
  it('must have at least one test', function (done) {
    var logger = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.TCP)({
          host: '127.0.0.1',
          port: 1337,
          json: true,
          timestamp: true
        })
      ]
    })

    logger.log('info', { data: 'foo'})
    logger.log('info', 'foo')

    true.should.be.true

    done()
  })
})
