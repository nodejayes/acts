describe('Plugins Specs', function () {
    const PATH = require('path');
    let Acts = require('./../index');

    after(function () {
        setTimeout(process.exit, 2000);
    });

    it('load Plugin', function (done) {
        Acts.createServer(__dirname, {
            server: {
                address: 'localhost',
                port: 8086
            }
        }, [
            function () { /* will be not loaded */ },
            {
                src: PATH.join(__dirname, 'plugin', 'test.js'),
                cfg: { /* Configuration pass here */ }
            }
        ]);
        Acts.start(function () {
            Acts.shutdown();
            done();
        })
    });
});
