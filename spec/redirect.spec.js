const ASSERT = require('assert');

describe('Redirect Specs', function () {
    const PATH = require('path');
    const Redirect = require('./../src/extensions/redirect.ext');
    const Logger = require('logwriter');

    let testcert = PATH.join(__dirname, 'certs', 'test.cert');
    let testkey = PATH.join(__dirname, 'certs', 'test.key');
    let red = null;
    let logger = null;
    let cfg = {
        server: {
          verbose: false,
          logfile: {
            file: PATH.join(__dirname, 'log', 'server.log'),
            maxsize: 20,
            level: 2
          },
          cluster: {
            active: false,
            worker: 4
          },
          address: 'localhost',
          port: 8086,
          webroot: 'public',
          compress: true,
          cors: {
            enabled: true,
            default: {
              origin: '*',
              methods: 'GET,POST',
              headers: 'testheader',
              credentials: false
            }
          },
          api: {
            routepath: 'api',
            routealias: 'api',
            allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
            reload: true
          },
          ssl: {
            usessl: true,
            redirectnonsslrequests: true,
            privatekey: testkey,
            certificate: testcert,
            certificationauthority: []
          },
          allowedExtensions: [
            'webpage'
          ],
          messageFormat: 'json',
          websockets: {
            usewebsockets: false,
            socketpath: 'sockets'
          },
          access: {
            maxsocketperip: 10
          }
        },
        redirectrules: {
            '/backend/*': '/api',
            'sockets': '/socket.io'
        },
        plugins: {}
    };
    let req = {
        socket: {
            encrypted: false
        },
        url: '/'
    };
    let res = {
        header: {},
        isnextcalled: false,
        isendcalled: false,
        next: function () {
            this.isnextcalled = true;
        },
        setHeader: function (key, value) {
            this.header[key] = value;
        },
        end: function () {
            this.isendcalled = true;
        }
    };

    beforeEach(function () {
        logger = new Logger({
            logfilepath: cfg.server.logfile.file,
            maxsize: cfg.server.logfile.maxsize
        });
        red = new Redirect(cfg, logger);
    });

    it('check redirect', function () {
        red.handle(req, res, res.next);
        ASSERT.equal(res.isendcalled, true, 'end not called');
        ASSERT.equal(res.isnextcalled, false, 'next is called');
        ASSERT.equal(res.header.Location, 'https://localhost:8086/', 'wrong location was send to client');
        ASSERT.equal(res.statusCode, 307, 'wrong status code');
    });

    it('use redirect rule backend', function () {
        req.url = '/backend/test';
        req.socket.encrypted = true;
        red.handle(req, res, res.next);
        ASSERT.equal(res.isendcalled, true, 'end not called');
        ASSERT.equal(res.isnextcalled, false, 'next is called');
        ASSERT.equal(res.header.Location, 'https://localhost:8086/api/test', 'wrong location was send to client');
        ASSERT.equal(res.statusCode, 307, 'wrong status code');
    });

    it('use redirect rule sockets', function () {
        req.url = '/sockets';
        req.socket.encrypted = true;
        red.handle(req, res, res.next);
        ASSERT.equal(res.isendcalled, true, 'end not called');
        ASSERT.equal(res.isnextcalled, false, 'next is called');
        ASSERT.equal(res.header.Location, 'https://localhost:8086/socket.io', 'wrong location was send to client');
        ASSERT.equal(res.statusCode, 307, 'wrong status code');
    });
});