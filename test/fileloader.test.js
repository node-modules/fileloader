'use strict';

const path = require('path');
const fs = require('fs');
const mm = require('mm');
const assert = require('assert');
const FileLoader = require('../');

describe('fileloader.test.js', () => {
  const fixtures = path.join(__dirname, 'fixtures');
  const dirs = [
    path.join(fixtures, 'dir1'),
    path.join(fixtures, 'dir2'),
  ];
  const charsets = {};
  charsets[dirs[1]] = 'gbk';
  const loader = new FileLoader(dirs, true, charsets);

  afterEach(mm.restore);

  it('should get change file dir1', done => {
    let info = loader.getSource('foo.txt');
    const filepath = path.join(dirs[0], 'foo.txt');
    assert(info.path === filepath);
    assert(info.src === 'bar\n');

    loader.once('update', function(name) {
      assert(name === 'foo.txt');
      done();
    });

    fs.writeFileSync(filepath, 'bar change');

    info = loader.getSource('foo.txt');
    assert(info.path === filepath);
    assert(info.src === 'bar change');
    fs.writeFileSync(filepath, 'bar\n');
  });

  it('should get change file dir1/subdir1/subdirfile.txt', done => {
    let info = loader.getSource('subdir1/subdirfile.txt');
    const filepath = path.join(dirs[0], 'subdir1', 'subdirfile.txt');
    assert(info.path === filepath);
    assert(info.src === 'subfile\n');

    loader.once('update', function(name) {
      assert(name === 'subdir1/subdirfile.txt');
      done();
    });

    fs.writeFileSync(filepath, 'subfile change');

    info = loader.getSource('subdir1/subdirfile.txt');
    assert(info.path === filepath);
    assert(info.src === 'subfile change');

    fs.writeFileSync(filepath, 'subfile\n');
  });

  it('should get change file and decode gbk charset content', done => {
    const filepath = path.join(dirs[1], 'dir2file.txt');
    const orginal = fs.readFileSync(filepath);
    let info = loader.getSource('dir2file.txt');
    assert(info.path === filepath);
    assert(info.src.includes('知道'));


    loader.once('update', name => {
      assert(name === 'dir2file.txt');
      done();
    });

    fs.writeFileSync(filepath, 'gbk change');

    info = loader.getSource('dir2file.txt');
    assert(info.path === filepath);
    assert(info.src === 'gbk change');
    fs.writeFileSync(filepath, orginal);
  });

  it('should return null when view not exists', () => {
    assert(!loader.getSource('not-exists.txt'));
  });

  it('should work with upper case charset', () => {
    const cs = {};
    cs[path.join(dirs[0], 'subdir1')] = 'UTF-8';
    cs[dirs[0]] = 'UTF8';
    cs[dirs[1]] = 'GBK';
    const loader = new FileLoader([ dirs[0], dirs[1], path.join(dirs[0], 'subdir1') ], false, cs);
    let info = loader.getSource('dir2file.txt');
    assert(info.src.includes('知道'));

    info = loader.getSource('foo.txt');
    assert(info.src === 'bar\n');

    info = loader.getSource('subdirfile.txt');
    assert(info.src === 'subfile\n');
  });

  it('should get from current dir when dirs param missing', () => {
    mm(process, 'cwd', () => {
      return dirs[0];
    });
    const loader = new FileLoader();
    const info = loader.getSource('foo.txt');
    assert(info.src === 'bar\n');
  });

  it('should support dirs as string', () => {
    const loader = new FileLoader(dirs[0]);
    const info = loader.getSource('foo.txt');
    assert(info.src === 'bar\n');
  });

  it('should support custom watch', done => {
    let cb;
    function watch(dirs, listener) {
      cb = listener;
    }

    const loader = new FileLoader(dirs, watch);
    let info = loader.getSource('foo.txt');
    assert(info.src === 'bar\n');

    info = loader.getSource('subdir1/subdirfile.txt');
    const filepath = path.join(dirs[0], 'subdir1', 'subdirfile.txt');
    assert(info.path === filepath);
    assert(info.src === 'subfile\n');

    loader.once('update', function(name) {
      assert(name === 'subdir1/subdirfile.txt');
      done();
    });

    setTimeout(() => {
      cb({ path: path.join(dirs[0], 'subdir1', 'subdirfile.txt') });
    }, 10);
  });

  it('should support fullpath', () => {
    let filepath = path.join(dirs[0], 'foo.txt');
    let info = loader.getSource(filepath);
    assert(info.path === filepath);
    assert(info.src === 'bar\n');

    info = loader.getSource('/foo.txt');
    assert(info.path === filepath);

    info = loader.getSource('/home');
    assert(info.path === path.join(dirs[0], 'home'));

    filepath = path.join(dirs[0], 'noexist.txt');
    info = loader.getSource(filepath);
    assert(info === null);

    filepath = path.join(dirs[1], 'dir2file.txt');
    info = loader.getSource(filepath);
    assert(info.path === filepath);
    assert(info.src.includes('知道'));
  });
});
