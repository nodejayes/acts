# Security
## Setup HTTPS

To use HTTPS you must specify the server.ssl Section in the Configuration File.

```javascript
require("./index").server(process.cwd(), {
  "server": {
    "webroot": "webroot",
    "allowedExtensions": [
      "webpage",
      ".php"
    ],
    "websockets": {
      "usewebsockets": true,
      "socketpath": "sockets"
    }
  },
  "redirectrules": {
    "/backend/*": "/api",
    "/sockets": "/socket.io"
  },
  "ssl": {
    "usessl": true,
    "certificate": "", // Path to the Certificate File
    "privatekey": "",  // Path to the Private Keyfile
    "certificationauthority": [], // insert all Certificate Files they are in the Certificates Chain
    "redirectnonsslrequests": true
  },
  "plugins": {
    "mongodbstore": {
      "port": 9005,
      "datapath": "db"
    }
  }
}, ["acts-mongodb-store"])
.start(function () {
  // insert stuff to do when server is started
});
```

The Core Modul uses Helmet and a Access Handler to increase the Security. You can choose how many Sockets can have one IP Address when this Limit is reached old Sockets was closed.

## Authentication

You can add a Custom Authentication Method to the Server. The Function Parameter looks like the API Parameter. IMPORTANT: Only call next when the Authentication is successfully !!! otherwise response the request with 403.

```javascript
const Acts = require('acts');

Acts.createServer(__dirname, {
  server: {
    address: 'localhost',
    port: 8086
  }
});
Acts.authentication(function (req, res, next) {
  // do some custom Authentication and call next when authentication is correct.
  next();
});
Acts.start(function () {
  // the server is running
});
```