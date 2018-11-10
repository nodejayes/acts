const ASSERT = require('assert');

describe('Websockets Specs', function() {
    const IO = require('socket.io-client');
    const Acts = require('./../index');
    let server;
    let socket;

    before((done) => {
        server = Acts.createServer(__dirname, {
            server: {
                address: 'localhost',
                port: 8086,
                compress: false,
                websockets: {
                    usewebsockets: true,
                    socketpath: 'sockets'
                }
            }
        }, []);
        server.start(() => {
            socket = IO('http://localhost:8086');
            done();
        });
    });

    after(() => {
        Acts.shutdown();
        socket.close();
        socket = null;
        server = null;
        setTimeout(process.exit, 2000);
    });

    it('boot with websockets', function(done) {
        socket.on('testsend', function (data) {
            ASSERT.deepEqual(data, {hallo:'welt'}, 'wrong data recieved');
            done();
        });
        socket.emit('testsocket', {hallo:'welt'});
    });
});
