let ASSERT = require('assert');

describe('FileSystem Helper Specs', function () {
    const PATH = require('path');
    const FS = require('fs');
    const FSH = require('./../src/common/filesystem.helper');
    const TESTDIR = PATH.join(__dirname, 'test', 'recursive');
    const TESTFILE = PATH.join(__dirname, 'api.spec.js');

    it('can get file stats async', function () {
        FSH.getStatsAsync(TESTFILE, (err, stat) => {
            if (err) {
                done(err);
            } else {
                done();
            }
        });
    });

    it('can create directory recursive', function (done) {
        FSH.createDirectoryRecursive(TESTDIR);
        setTimeout(() => {
            let stat = FSH.getStats(TESTDIR);
            ASSERT.equal(stat.isDirectory(), true, 'folder not created');
            FS.rmdirSync(TESTDIR);
            FS.rmdirSync(PATH.join(TESTDIR, '..'));
            done();
        }, 10);
    });

    it('valid Folderdiff', function () {
        let diff = FSH.folderDiff(PATH.join(__dirname), PATH.join(__dirname, 'api', 'test'));
        ASSERT.equal(diff, 'api-test-', `result is not the same ${diff} must be api-test-`);
        diff = FSH.folderDiff(PATH.join(__dirname, 'api'), PATH.join(__dirname));
        ASSERT.equal(diff, '', 'result is not empty');
    });

    it('get basename', function () {
        let basename = FSH.basename(PATH.join(__dirname, 'api'));
        ASSERT.equal(basename, 'api', `basename are not the same ${basename} must be api`);
    });
});