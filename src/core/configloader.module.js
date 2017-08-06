'use strict';

/**
 * Holds all the Configuration Options from the Configurationfile
 * @module Configloader
 * @author Markus Gilg
 */
module.exports = {
  server: {
    logfile: {
      file: 'log/server.log',
      maxsize: 20,
      level: 2
    },
    cluster: {
      active: false,
      worker: 4
    },
    address: 'localhost',
    port: 8085,
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
      usessl: false,
      certificate: '',
      privatekey: '',
      certificationauthority: [],
      redirectnonsslrequests: true
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
  redirectrules: {},
  plugins: {}
};