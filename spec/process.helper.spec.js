const ASSERT = require('assert');

describe('Process Helper Specs', function () {
    const PATH = require('path');
    let Process = require('./../src/common/process.helper');
    
    it('execute helloworld process', function (done) {
        let p = new Process('node', [PATH.join(__dirname, 'processes', 'helloworld.js')]);
        p.onOut = (buffer, resp, contentType) => {
            ASSERT.equal(buffer.toString('utf8'), 'hello', `invalid output ${buffer.toString('utf8')}`);
            ASSERT.notEqual(resp, null, 'missing response object');
            ASSERT.equal(contentType, 'application/json', 'wrong content-type');
        };
        p.onErr = (buffer, resp, contentType) => {
            ASSERT.equal(buffer.toString('utf8'), 'fehler', `invalid output ${buffer.toString('utf8')}`);
            ASSERT.notEqual(resp, null, 'missing response object');
            ASSERT.equal(contentType, 'application/json', 'wrong content-type');
        };
        p.onClose = (code, resp, contentType) => {
            ASSERT.equal(code <= 0, true, 'invalid exitcode');
            ASSERT.notEqual(resp, null, 'missing response object');
            ASSERT.equal(contentType, 'application/json', 'wrong content-type');
            done();
        };
        p.execute({
            url: 'demo',
            method: 'GET'
        }, 'application/json');
    });

    it('cannot set no functions onOut, onErr and onClose', function () {
        let p = new Process('node', [PATH.join(__dirname, 'processes', 'helloworld.js')]);
        p.onOut = 1;
        p.onErr = 2;
        p.onClose = 3;
        ASSERT.equal(p.onOut, null, `onOut was overwritten with not a Function: ${p.onOut}`);
        ASSERT.equal(p.onErr, null, `onErr was overwritten with not a Function: ${p.onErr}`);
        ASSERT.equal(p.onClose, null, `onClose was overwritten with not a Function: ${p.onClose}`);
    });
});