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
                address: 'localhost',
                port: 8086
            }
        }, []);
    });

    afterEach(function () {
        Acts.shutdown();
        Acts = null;
    });

    it('test true authentication', function (done) {
        Acts.authentication(validAuthentication);
        Acts.start(function () {
            REQ.get('http://localhost:8086/api/test', null, (err, resp, body) => {
                expect(err).toBe(null);
                expect(resp.statusCode).toBe(200);
                expect(body).toBe('"test ok"');
                done();
            });
        });
    });

    it('test false authentication', function (done) {
        Acts.authentication(invalidAuthentication);
        Acts.start(function () {
            REQ.get('http://localhost:8086/api/test', null, (err, resp, body) => {
                expect(err).toBe(null);
                expect(resp.statusCode).toBe(403);
                expect(body).toBe('');
                done();
            });
        });
    });
});