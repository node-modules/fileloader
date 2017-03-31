/**!
 * fileloader - test/fileloader.test.js
 *
 * Copyright(c) 2014 fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var should = require('should');
var path = require('path');
var fs = require('fs');
var mm = require('mm');
var assert = require('assert');
var FileLoader = require('../');

describe('fileloader.test.js', function () {
  var fixtures = path.join(__dirname, 'fixtures');
  var dirs = [
    path.join(fixtures, 'dir1'),
    path.join(fixtures, 'dir2'),
  ];
  var charsets = {};
  charsets[dirs[1]] = 'gbk';
  var loader = new FileLoader(dirs, true, charsets);

  afterEach(mm.restore);

  it('should get change file dir1', function (done) {
    var info = loader.getSource('foo.txt');
    var filepath = path.join(dirs[0], 'foo.txt');
    info.path.should.equal(filepath);
    info.src.should.equal('bar\n');

    loader.once('update', function (name) {
      name.should.equal('foo.txt');
      done();
    });

    fs.writeFileSync(filepath, 'bar change');

    info = loader.getSource('foo.txt');
    info.path.should.equal(filepath);
    info.src.should.equal('bar change');
    fs.writeFileSync(filepath, 'bar\n');
  });

  it('should get change file dir1/subdir1/subdirfile.txt', function (done) {
    var info = loader.getSource('subdir1/subdirfile.txt');
    var filepath = path.join(dirs[0], 'subdir1', 'subdirfile.txt');
    info.path.should.equal(filepath);
    info.src.should.equal('subfile\n');

    loader.once('update', function (name) {
      name.should.equal('subdir1/subdirfile.txt');
      done();
    });

    fs.writeFileSync(filepath, 'subfile change');

    info = loader.getSource('subdir1/subdirfile.txt');
    info.path.should.equal(filepath);
    info.src.should.equal('subfile change');

    fs.writeFileSync(filepath, 'subfile\n');
  });

  it('should get change file and decode gbk charset content', function (done) {
    var filepath = path.join(dirs[1], 'dir2file.txt');
    var orginal = fs.readFileSync(filepath);
    var info = loader.getSource('dir2file.txt');
    info.path.should.equal(filepath);
    info.src.should.containEql('知道');


    loader.once('update', function (name) {
      name.should.equal('dir2file.txt');
      done();
    });

    fs.writeFileSync(filepath, 'gbk change');

    info = loader.getSource('dir2file.txt');
    info.path.should.equal(filepath);
    info.src.should.equal('gbk change');
    fs.writeFileSync(filepath, orginal);
  });

  it('should return null when view not exists', function () {
    should.not.exist(loader.getSource('not-exists.txt'));
  });

  it('should work with upper case charset', function () {
    var cs = {};
    cs[path.join(dirs[0], 'subdir1')] = 'UTF-8';
    cs[dirs[0]] = 'UTF8';
    cs[dirs[1]] = 'GBK';
    var loader = new FileLoader([dirs[0], dirs[1], path.join(dirs[0], 'subdir1')], false, cs);
    var info = loader.getSource('dir2file.txt');
    info.src.should.containEql('知道');

    var info = loader.getSource('foo.txt');
    info.src.should.equal('bar\n');

    var info = loader.getSource('subdirfile.txt');
    info.src.should.equal('subfile\n');
  });

  it('should get from current dir when dirs param missing', function () {
    mm(process, 'cwd', function () {
      return dirs[0];
    });
    var loader = new FileLoader();
    var info = loader.getSource('foo.txt');
    info.src.should.equal('bar\n');
  });

  it('should support dirs as string', function () {
    var loader = new FileLoader(dirs[0]);
    var info = loader.getSource('foo.txt');
    info.src.should.equal('bar\n');
  });

  it('should support custom watch', function (done) {
    var cb;
    function watch(dirs, listener) {
      cb = listener;
    }

    var loader = new FileLoader(dirs, watch);
    var info = loader.getSource('foo.txt');
    info.src.should.equal('bar\n');

    var info = loader.getSource('subdir1/subdirfile.txt');
    var filepath = path.join(dirs[0], 'subdir1', 'subdirfile.txt');
    info.path.should.equal(filepath);
    info.src.should.equal('subfile\n');

    loader.once('update', function (name) {
      name.should.equal('subdir1/subdirfile.txt');
      done();
    });

    setTimeout(function () {
      cb({path: path.join(dirs[0], 'subdir1', 'subdirfile.txt')});
    }, 10);
  });

  it('should support fullpath', function () {
    var filepath = path.join(dirs[0], 'foo.txt');
    var info = loader.getSource(filepath);
    info.path.should.equal(filepath);
    info.src.should.equal('bar\n');

    info = loader.getSource('/foo.txt');
    info.path.should.equal(filepath);

    info = loader.getSource('/home');
    info.path.should.equal(path.join(dirs[0], 'home'));

    filepath = path.join(dirs[0], 'noexist.txt');
    info = loader.getSource(filepath);
    assert(info === null);

    filepath = path.join(dirs[1], 'dir2file.txt');
    info = loader.getSource(filepath);
    info.path.should.equal(filepath);
    info.src.should.containEql('知道');
  });
});
