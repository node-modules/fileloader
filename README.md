fileloader
=======

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/fileloader.svg?style=flat-square
[npm-url]: https://npmjs.org/package/fileloader
[travis-image]: https://img.shields.io/travis/node-modules/fileloader.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/fileloader
[codecov-image]: https://codecov.io/gh/node-modules/fileloader/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/node-modules/fileloader
[david-image]: https://img.shields.io/david/node-modules/fileloader.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/fileloader
[download-image]: https://img.shields.io/npm/dm/fileloader.svg?style=flat-square
[download-url]: https://npmjs.org/package/fileloader

more stable file loader for nunjucks, and support charsets like `gbk`.

## Install

```bash
$ npm install fileloader
```

## Usage

```js
const nunjucks = require('nunjucks');
const FileLoader = require('fileloader');
const cluster = require('cluster');

let watch = true;
if (cluster.isWorker) {
  watch = function(dirs, listener) {
    process.on('message', msg => {
      if (msg && msg.action === 'watch-file') {
        console.warn('got master file change message: %j', msg.info);
        listener(msg.info);
      }
    });
  };
}

const dirs = ['/foo', '/bar/cms'];
const charsets = {
  '/bar/cms': 'gbk'
};

const fileloader = new FileLoader(dirs, watch, charsets);
const env = new nunjucks.Environment(fileloader);
```

## License

[MIT](LICENSE.txt)
