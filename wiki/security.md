<h1>Security</h1>
<h2>Setup HTTPS</h2>
<p>To use HTTPS you must specify the server.ssl Section in the Configuration File.</p>
<pre>
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
</pre>
<p>The Core Modul uses Helmet and a Access Handler to increase the Security. You can choose how many Sockets can have one IP Address when this Limit is reached old Sockets was closed.</p>