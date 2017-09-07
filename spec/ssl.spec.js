describe('SSL Specs', function () {
    const PATH = require('path');
    const HTTP = require('http');
    let Acts = require('./../index');
    let testcert = PATH.join(__dirname, 'certs', 'test.cert');
    let testkey = PATH.join(__dirname, 'certs', 'test.key');

    it('boot with testcertificate without chain', function (done) {
        Acts.createServer(__dirname, {
            server: {
                address: 'localhost',
                port: 8086,
                ssl: {
                    usessl: true,
                    redirectnonsslrequests: true,
                    privatekey: testkey,
                    certificate: testcert,
                    certificationauthority: []   
                }
            }
        });
        Acts.start(function () {
            let req = HTTP.request({
                protocol: 'http:',
                host: 'localhost',
                port: 8086,
                path: '/api/test',
                method: 'GET'
            });
            req.on('response', resp => {
                ASSERT.equal(resp.statusCode, 307, 'invalid status code on GET');
                Acts.shutdown();
                done();
            });
            req.on('abort', err => {
                Acts.shutdown();
                done(err);
            });
            req.end();
        });
    });

    it('boot with testcertificate with chain', function (done) {
        Acts.createServer(__dirname, {
            server: {
                address: 'localhost',
                port: 8086,
                ssl: {
                    usessl: true,
                    redirectnonsslrequests: true,
                    privatekey: testkey,
                    certificate: testcert,
                    certificationauthority: [testcert]
                }
            }
        });
        Acts.start(function () {
            Acts.shutdown();
            done();
        });
    });
});