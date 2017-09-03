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
        console.info(Acts);
        Acts.authentication(function (req, res, next) {
            next();
        });
        Acts.start(function () {
            REQ.get('http://localhost:8086/api/test', null, (a, b, c) => {
                console.info(a, b, c);
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
            REQ.get('http://localhost:8086/api/test', null, (a, b, c) => {
                console.info(a, b, c);
                done();
            });
        });
    });
});