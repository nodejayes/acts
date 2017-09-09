const ASSERT = require('assert');

describe('Websockets Specs', function () {
    const IO = require('socket.io-client');
    let Acts = require('./../index');

    it('boot with websockets', function () {
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
        Acts.start(function () {
            let socket = IO('http://localhost:8086');
            socket.on('testsend', function (data) {
                ASSERT.deepEqual(data, {hallo:'welt'}, 'wrong data recieved');
                setTimeout(function () {
                    Acts.shutdown();
                    done();
                }, 100);
            });
            socket.emit('testsocket', {hallo:'welt'});
        });
    });
});