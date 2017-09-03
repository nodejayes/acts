describe('Authentication Specs', function () {
    const Acts = require('./../index');
    const REQ  = require('request');

    it('test true authentication', function (done) {
        Acts.createServer(__dirname, {
            server: {
                address: 'localhost',
                port: 8086
            }
        }, []);
        Acts.authentication(function (req, res, next) {
            next();
        });
        Acts.start(function () {
            REQ.get('http://localhost:8086/api/test', null, (err, resp, body) => {
                expect(err).toBe(null);
                expect(resp.statusCode).toBe(200);
                expect(body).toBe('test ok');
                Acts.shutdown();
                done();
            });
        });
    });

    it('test false authentication', function (done) {
        Acts.createServer(__dirname, {
            server: {
                address: 'localhost',
                port: 8086
            }
        }, []);
        Acts.authentication(function (req, res, next) {
            // next not called
            res.statusCode = 403;
            res.end();
        });
        Acts.start(function () {
            REQ.get('http://localhost:8086/api/test', null, (err, resp, body) => {
                expect(err).toBe(null);
                expect(resp.statusCode).toBe(403);
                expect(body).toBe('');
                Acts.shutdown();
                done();
            });
        });
    });
});