'use strict';

const debug = require('debug')('fileloader');
const fs = require('fs');
const path = require('path');
const util = require('util');
const iconv = require('iconv-lite');
const EventEmitter = require('events');
const wt = require('wt');

module.exports = FileLoader;

// more stable nunjucks loader

// new FileLoader(dirs, true/false, charsets);
// new FileLoader(dirs, function, charsets);
// if watch is a function, must use this format: `function (dirs, listener)`
function FileLoader(dirs, watch, charsets) {
  // support custom charsets = { '/foo/cms': 'gbk' }
  this.charsets = charsets || {};
  this.pathsToNames = {};

  if (dirs) {
    dirs = Array.isArray(dirs) ? dirs : [ dirs ];
    // For windows, convert to forward slashes
    this.searchPaths = dirs.map(path.normalize);
  } else {
    this.searchPaths = [ process.cwd() ];
  }

  if (watch) {
    if (typeof watch === 'boolean') {
      // new FileLoader(dirs, true/false, charsets);
      watch = this._watch;
    }
    // Watch all the templates in the paths and fire an event when they change
    watch(this.searchPaths, this.update.bind(this));
  }
}

util.inherits(FileLoader, EventEmitter);

const proto = FileLoader.prototype;

proto.update = function(info) {
  debug('file %s %s', info.event, info.path);
  this.emit('update', this.pathsToNames[info.path]);
};

proto._watch = function(dirs, listener) {
  const watcher = wt.watch(dirs);
  watcher.on('file', listener);
  debug('start watch on %j', dirs);
};

proto.getSource = function(name) {
  let fullpath = null;
  const paths = this.searchPaths;
  let charset = '';

  for (const root of paths) {
    const p = path.join(root, name);

    // Only allow the current directory and anything
    // underneath it to be searched
    if (fs.existsSync(p)) {
      fullpath = p;
      charset = this.charsets[root];
      if (charset) {
        charset = charset.toLowerCase();
      }
      break;
    }
  }

  if (!fullpath && path.isAbsolute(name) && fs.existsSync(name)) {
    fullpath = name;
    const roots = Object.keys(this.charsets);
    for (const root of roots) {
      if (fullpath.indexOf(root) > -1) {
        charset = this.charsets[root];
        break;
      }
    }
  }

  if (!fullpath) {
    debug('view %s not found in %j', name, this.searchPaths);
    return null;
  }

  this.pathsToNames[fullpath] = name;
  let content = fs.readFileSync(fullpath);
  debug('view %s mapping to %s, charset: %s, size: %d', name, fullpath, charset, content.length);
  if (charset && (charset !== 'utf8' || charset !== 'utf-8')) {
    content = iconv.decode(content, charset);
  } else {
    content = content.toString();
  }
  return {
    src: content,
    path: fullpath,
  };
};
