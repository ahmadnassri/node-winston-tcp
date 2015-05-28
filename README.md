# Winston TCP [![version][npm-version]][npm-url] [![License][npm-license]][license-url]

TCP transport for [Winston](https://github.com/winstonjs/winston)

[![Build Status][travis-image]][travis-url]
[![Downloads][npm-downloads]][npm-url]
[![Code Climate][codeclimate-quality]][codeclimate-url]
[![Coverage Status][codeclimate-coverage]][codeclimate-url]
[![Dependencies][david-image]][david-url]

## Install

```sh
npm install --save winston-tcp
```

## Usage

```js
require('winston-tcp')

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.TCP)({
      host: '127.0.0.1',
      port: 1337,
      json: true,
      timestamp: true
    })
  ]
})

logger.log('info', 'foo')
```

or simply:

```js
var winston = require('winston')
var transport = require('winston-tcp')

winston.add(new transport({
  host: '127.0.0.1',
  port: 1337
})

winston.info('foo')
```

## Options

| Name                | Description                                                                   | Default   |
| ------------------- | ----------------------------------------------------------------------------- | --------- |
| `host`              | The host to connect to                                                        | none      |
| `port`              | The server port to connect to                                                 | none      |
| `reconnectInterval` | Time to pause between disconnect and reconnect (in ms)                        | `1000`    |
| `bufferLength`      | Number of messages to buffer while disconnected, set to `false` for unlimited | `10000`   |
| `json`              | If `true`, messages will be logged as JSON                                    | `false`   |
| `timestamp`         | flag indicating if we should prepend output with timestamps                   | `false`   |

## Support

Donations are welcome to help support the continuous development of this project.

[![Gratipay][gratipay-image]][gratipay-url]
[![PayPal][paypal-image]][paypal-url]
[![Flattr][flattr-image]][flattr-url]
[![Bitcoin][bitcoin-image]][bitcoin-url]

## License

[MIT](LICENSE) &copy; [Ahmad Nassri](https://www.ahmadnassri.com)

[license-url]: https://github.com/ahmadnassri/winston-tcp/blob/master/LICENSE

[travis-url]: https://travis-ci.org/ahmadnassri/winston-tcp
[travis-image]: https://img.shields.io/travis/ahmadnassri/winston-tcp.svg?style=flat-square

[npm-url]: https://www.npmjs.com/package/winston-tcp
[npm-license]: https://img.shields.io/npm/l/winston-tcp.svg?style=flat-square
[npm-version]: https://img.shields.io/npm/v/winston-tcp.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/winston-tcp.svg?style=flat-square

[codeclimate-url]: https://codeclimate.com/github/ahmadnassri/winston-tcp
[codeclimate-quality]: https://img.shields.io/codeclimate/github/ahmadnassri/winston-tcp.svg?style=flat-square
[codeclimate-coverage]: https://img.shields.io/codeclimate/coverage/github/ahmadnassri/winston-tcp.svg?style=flat-square

[david-url]: https://david-dm.org/ahmadnassri/winston-tcp
[david-image]: https://img.shields.io/david/ahmadnassri/winston-tcp.svg?style=flat-square

[gratipay-url]: https://www.gratipay.com/ahmadnassri/
[gratipay-image]: https://img.shields.io/gratipay/ahmadnassri.svg?style=flat-square

[paypal-url]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=UJ2B2BTK9VLRS&on0=project&os0=winston-tcp
[paypal-image]: http://img.shields.io/badge/payPal-donate-green.svg?style=flat-square

[flattr-url]: https://flattr.com/submit/auto?user_id=ahmadnassri&url=https://github.com/ahmadnassri/winston-tcp&title=winston-tcp&language=&tags=github&category=software
[flattr-image]: http://img.shields.io/badge/flattr-donate-green.svg?style=flat-square

[bitcoin-image]: http://img.shields.io/badge/bitcoin-1Nb46sZRVG3or7pNaDjthcGJpWhvoPpCxy-green.svg?style=flat-square
[bitcoin-url]: https://www.coinbase.com/checkouts/ae383ae6bb931a2fa5ad11cec115191e?name=winston-tcp
