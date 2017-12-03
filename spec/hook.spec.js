let ASSERT = require('assert');

describe('Hook Specification', function () {
    it('can call hook', function () {
        let Acts = require('./../index');
        Acts.createServer(__dirname, {
            server: {
                address: 'localhost',
                port: 8087
            }
        });
        Acts.hook((req, res, next) => {
            if (req.method === 'GET') {
                res.statusCode = 200;
                return res.end('test ok');
            }
            next();
        });
        Acts.start(function () {
            let req = HTTP.request({
                protocol: 'http:',
                host: 'localhost',
                port: 8087,
                path: '/something',
                method: 'GET'
            });
            req.on('response', resp => {
                ASSERT.equal(resp.statusCode, 200, 'invalid status code on GET');
                resp.on('data', d => {
                    let body = d.toString('utf8');
                    ASSERT.equal(JSON.parse(body), 'test ok', 'invalid request body');
                    Acts.shutdown();
                    done();
                });
            });
            req.on('abort', err => {
                Acts.shutdown();
                done(err);
            });
            req.end();
        });
    });
});