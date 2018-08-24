const ASSERT = require('assert');

describe('Authentication Specs', function () {
    const REQ  = require('request');
    const validAuthentication = function (req, res, next) {
        next();
    };
    const invalidAuthentication = function (req, res, next) {
        res.statusCode = 403;
        res.end();
    };
    let Acts = null;

    beforeEach(function () {
        Acts = require('./../index');
        Acts.createServer(__dirname, {
            server: {
                verbose: false,
                address: 'localhost',
                port: 8086
            }
        }, []);
    });

    afterEach(function () {
        Acts.shutdown();
        Acts = null;
    });

    after(function () {
        setTimeout(process.exit, 2000);
    });

    it('test true authentication', function (done) {
        Acts.authentication(validAuthentication);
        Acts.start(function () {
            REQ.get('http://localhost:8086/api/test', null, (err, resp, body) => {
                ASSERT.equal(err, null, `error on sending response ${err === null ? null : err.message}`);
                ASSERT.equal(resp.statusCode, 200, 'response status is not okay');
                ASSERT.equal(JSON.parse(body), 'test ok', 'response body is not okay');
                done();
            });
        });
    });

    it('test false authentication', function (done) {
        Acts.authentication(invalidAuthentication);
        Acts.start(function () {
            REQ.get('http://localhost:8086/api/test', null, (err, resp, body) => {
                ASSERT.equal(err, null, `error on sending response ${err === null ? null : err.message}`);
                ASSERT.equal(resp.statusCode, 403, 'response status is not okay');
                ASSERT.equal(body, '', 'response body is not okay');
                done();
            });
        });
    });

    it('authentication function is not a function', function (done) {
        Acts.authentication({});
        Acts.start(function () {
            REQ.get('http://localhost:8086/api/test', null, (err, resp, body) => {
                ASSERT.equal(err, null, `error on sending response ${err === null ? null : err.message}`);
                ASSERT.equal(resp.statusCode, 200, 'response status is not okay');
                ASSERT.equal(JSON.parse(body), 'test ok', 'response body is not okay');
                done();
            });
        });
    });
});
