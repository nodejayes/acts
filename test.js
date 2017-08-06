'use strict';

const ACTS = require('./index');

ACTS.createServer(__dirname, {
  server: {
    logfile: {
      file: 'log/server.log',
      maxsize: 20,
      level: 4
    },
    webroot: 'webroot',
    allowedExtensions: [
      'webpage',
      '.php'
    ],
    websockets: {
      usewebsockets: true,
      socketpath: 'sockets'
    }
  },
  redirectrules: {
    '/backend/*': '/api',
    '/sockets': '/socket.io'
  },
  plugins: {}
}).start();