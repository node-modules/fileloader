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
    info.src.should.include('知道');


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
});
