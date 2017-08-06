'use strict';

const ACTS = require('./index');

ACTS.createServer(__dirname, {
  'server': {
    'webroot': 'webroot',
    'allowedExtensions': [
      'webpage',
      '.php'
    ],
    'websockets': {
      'usewebsockets': true,
      'socketpath': 'sockets'
    }
  },
  'redirectrules': {
    '/backend/*': '/api',
    '/sockets': '/socket.io'
  },
  'plugins': {
    'mongodbstore': {
      'host': 'localhost',
      'port': 8890,
      'datapath': 'store/data',
      'logfile': 'store/mongo.log'
    }
  }
}).start();