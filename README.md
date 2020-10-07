# Winston TCP

> TCP transport for [Winston](https://github.com/winstonjs/winston)

[![license][license-img]][license-url]
[![version][npm-img]][npm-url]
[![super linter][super-linter-img]][super-linter-url]
[![test][test-img]][test-url]
[![release][release-img]][release-url]

[license-url]: LICENSE
[license-img]: https://badgen.net/github/license/ahmadnassri/node-winston-tcp

[npm-url]: https://www.npmjs.com/package/winston-tcp
[npm-img]: https://badgen.net/npm/v/winston-tcp

[super-linter-url]: https://github.com/ahmadnassri/node-winston-tcp/actions?query=workflow%3Asuper-linter
[super-linter-img]: https://github.com/ahmadnassri/node-winston-tcp/workflows/super-linter/badge.svg

[test-url]: https://github.com/ahmadnassri/node-winston-tcp/actions?query=workflow%3Atest
[test-img]: https://github.com/ahmadnassri/node-winston-tcp/workflows/test/badge.svg

[release-url]: https://github.com/ahmadnassri/node-winston-tcp/actions?query=workflow%3Arelease
[release-img]: https://github.com/ahmadnassri/node-winston-tcp/workflows/release/badge.svg

## Install

```bash
npm install --only=production --save winston-tcp
```

## API

```js
const winston = require('winston')
const Transport = require('winston-tcp')

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new Transport({
      host: '127.0.0.1',
      port: 1337
    })
  ],
})
```

## Options

Name                | Description                                                                   | Default
------------------- | ----------------------------------------------------------------------------- | -------
`host`              | The host to connect to                                                        | none
`port`              | The server port to connect to                                                 | none
`reconnectInterval` | Time to pause between disconnect and reconnect (in ms)                        | `1000`
`bufferLength`      | Number of messages to buffer while disconnected, set to `false` for unlimited | `10000`
