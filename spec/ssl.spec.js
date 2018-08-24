const ASSERT = require('assert');

describe('SSL Specs', function () {
    const PATH = require('path');
    let Acts = require('./../index');
    let testcert = PATH.join(__dirname, 'certs', 'test.cert');
    let testkey = PATH.join(__dirname, 'certs', 'test.key');

    it('boot with testcertificate without chain', function() {
        return new Promise((resolve, reject) => {
            try {
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
                    Acts.shutdown();
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    });

    it('boot with testcertificate with chain', function() {
        return new Promise((resolve, reject) => {
            try {
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
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    });
});
