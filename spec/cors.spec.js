describe('Cors Specs', function () {
    const HTTP = require('http');
    const Acts = require('./../index');

    afterEach(function () {
        Acts.shutdown();
    });

    it('send success options request', function (done) {
        Acts.createServer(__dirname, {
            server: {
                address: 'localhost',
                port: 8086
            }
        }, []);
        Acts.start(function () {
            let req = HTTP.request({
                protocol: 'http:',
                host: 'localhost',
                port: 8086,
                method: 'OPTIONS'
            });
            req.on('response', function (resp) {
                done();
            });
            req.on('error', function (err) {
                done(err);
            });
            req.end();
        });
    });

    it('is disabled', function (done) {
        Acts.createServer(__dirname, {
            server: {
                address: 'localhost',
                port: 8086,
                cors: {
                    enabled: false
                }
            }
        }, []);
        Acts.start(function () {
            let req = HTTP.request({
                protocol: 'http:',
                host: 'localhost',
                port: 8086,
                method: 'OPTIONS'
            });
            req.on('response', function (resp) {
                done();
            });
            req.on('error', function (err) {
                done(err);
            });
            req.end();
        });
    });
});