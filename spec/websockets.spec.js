const ASSERT = require('assert');

describe('Websockets Specs', function() {
    const IO = require('socket.io-client');
    const Acts = require('./../index');

    before(function() {
        Acts.createServer(__dirname, {
            server: {
                address: 'localhost',
                port: 8086,
                compress: false,
                websockets: {
                    usewebsockets: true,
                    socketpath: 'sockets'
                }
            }
        });
    });

    after(function() {
        Acts.shutdown();
        setTimeout(process.exit, 2000);
    });

    it('boot with websockets', function(done) {
        Acts.start(function () {
            let socket = IO('http://localhost:8086');
            socket.on('testsend', function (data) {
                ASSERT.deepEqual(data, {hallo:'welt'}, 'wrong data recieved');
                done();
            });
            socket.emit('testsocket', {hallo:'welt'});
        });
    });
});
