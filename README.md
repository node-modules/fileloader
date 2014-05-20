fileloader
=======

[![Build Status](https://secure.travis-ci.org/node-modules/fileloader.png)](http://travis-ci.org/node-modules/fileloader)
[![Dependency Status](https://gemnasium.com/node-modules/fileloader.png)](https://gemnasium.com/node-modules/fileloader)

[![NPM](https://nodei.co/npm/fileloader.png?downloads=true&stars=true)](https://nodei.co/npm/fileloader/)

![logo](https://raw.github.com/node-modules/fileloader/master/logo.png)

more stable file loader for nunjucks, and support charsets like `gbk`.

## Install

```bash
$ npm install fileloader
```

## Usage

```js
var nunjucks = require('nunjucks');
var FileLoader = require('fileloader');

var watch = true;
if (cluster.isWorker) {
  watch = function (dirs, listener) {
    process.on('message', function (msg) {
      if (msg && msg.action === 'watch-file') {
        console.warn('got master file change message: %j', msg.info);
        listener(msg.info);
      }
    });
  };
}

var dirs = ['/foo', '/bar/cms'];
var charsets = {
  '/bar/cms': 'gbk'
};

var fileloader = new FileLoader(dirs, watch, charsets);
var env = new nunjucks.Environment(fileloader);
```

## License

(The MIT License)

Copyright (c) 2014 fengmk2 &lt;fengmk2@gmail.com&gt; and other contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
