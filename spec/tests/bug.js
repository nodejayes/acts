const HTTP = require('http');
const PATH = require('path');
let Acts = require('./../../index');

Acts.createServer(PATH.join(__dirname, '..'), {
    server: {
        address: 'localhost',
        port: 8086,
        api: {
            allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'CUSTOM']
        },
        websockets: {
            usewebsockets: true,
            socketpath: 'sockets'
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
        console.info(resp);
        resp.on('data', d => {
            let body = d.toString('utf8');
            console.info(JSON.parse(body));
        });
    });
    req.on('abort', err => {
        console.error(err);
    });
    req.end();
});