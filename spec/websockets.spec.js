describe('Websockets Specs', function () {
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
            Acts.shutdown();
            done();
        });
    });
});