<h1>The Config File</h1>
<pre>
{
  "server": {
    "logfile": {
      "debug": "log/debug.log",
      "warning": "log/warning.log",
      "error": "log/error.log",
      "maxsize": "100MB"
    },
    "cluster": {
      "active": false,
      "worker": 4
    },
    "address": "localhost",
    "port": 8085,
    "webroot": "webroot",
    "compress": true,
    "cors": {
      "enabled": true,
      "default": {
        "origin": "*",
        "methods": "GET,POST",
        "headers": "testheader",
        "credentials": false
      }
    },
    "api": {
      "routepath": "api",
      "routealias": "api",
      "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
      "reload": true
    },
    "ssl": {
      "usessl": false,
      "certificate": "",
      "privatekey": "",
      "certificationauthority": [],
      "redirectnonsslrequests": true
    },
    "allowedExtensions": [
      "webpage"
    ],
    "messageFormat": "json",
    "websockets": {
      "usewebsockets": true,
      "socketpath": "sockets"
    },
    "access": {
      "maxsocketperip": 4
    },
    "phppath": "C:\\PHP7\\php.exe"
  },
  "redirectrules": {
    "/backend/*": "/api",
    "/sockets": "/socket.io"
  }
}
</pre>
<table>
<tr>
    <td>address</td>
    <td>String</td>
    <td>the listen Address</td>
</tr>
<tr>
    <td>port</td>
    <td>Integer</td>
    <td>the listen Port</td>
</tr>
<tr>
    <td>webroot</td>
    <td>String</td>
    <td>the Folder with the hosted Files relativ of the current Directory</td>
</tr>
<tr>
    <td>compress</td>
    <td>Boolean</td>
    <td>use the GZIP Compression</td>
</tr>
<tr>
    <td>allowedExtensions</td>
    <td>Array</td>
    <td>Allowed File Extensions for File Hosting</td>
</tr>
<tr>
    <td>messageFormat</td>
    <td>String</td>
    <td>Format of POST/PUT or DELETE Data in Dynamic API</td>
</tr>
<tr>
    <td>redirectrules</td>
    <td>Object</td>
    <td>The Redirect Rules Object Key => Search and Value => Replacement</td>
</tr>
<tr>
    <td>phppath</td>
    <td>String</td>
    <td>The Path to the PHP Executable</td>
</tr>
<tr>
    <td>cluster</td>
    <td>Object</td>
    <td>
        The Cluster Configruation Section
        <table>
            <tr>
                <td>active</td>
                <td>Boolean</td>
                <td>Activate the CLuster Mode</td>
            </tr>
            <tr>
                <td>workers</td>
                <td>Integer</td>
                <td>Number of Server Threads</td>
            </tr>
        </table>
    </td>
</tr>
<tr>
    <td>api</td>
    <td>Object</td>
    <td>
        The Dynamic API Configruation Section
        <table>
            <tr>
                <td>routepath</td>
                <td>String</td>
                <td>The Folder that contains the Dynamic API Files relative from current Directory</td>
            </tr>
            <tr>
                <td>routealias</td>
                <td>String</td>
                <td>The Name of the API in URL. For Example api call the API http://localhost:8085/api</td>
            </tr>
            <tr>
                <td>allowedMethods</td>
                <td>Array</td>
                <td>Array of allowed Methods for API Route</td>
            </tr>
            <tr>
                <td>reload</td>
                <td>Boolean</td>
                <td>Watch API Folder and Reload when API Route changes</td>
            </tr>
        </table>
    </td>
</tr>
<tr>
    <td>ssl</td>
    <td>Object</td>
    <td>
        The SSL Configruation Section
        <table>
            <tr>
                <td>usessl</td>
                <td>Boolean</td>
                <td>Enable HTTPS on Dynamic API</td>
            </tr>
            <tr>
                <td>certificate</td>
                <td>String</td>
                <td>The Path to the SSL Certificate</td>
            </tr>
            <tr>
                <td>privatekey</td>
                <td>String</td>
                <td>The Path to the Private Key</td>
            </tr>
            <tr>
                <td>certificationauthority</td>
                <td>Array</td>
                <td>Certificate Chain</td>
            </tr>
            <tr>
                <td>redirectnonsslrequests</td>
                <td>Boolean</td>
                <td>Redirect HTTP Requests to HTTPS</td>
            </tr>
        </table>
    </td>
</tr>
<tr>
    <td>logfile</td>
    <td>Object</td>
    <td>
        The Logfile Configuration Section
        <table>
            <tr>
                <td>debug</td>
                <td>String</td>
                <td>Relativ Path to logfile (from working directory)</td>
            </tr>
            <tr>
                <td>warning</td>
                <td>String</td>
                <td>Relativ Path to logfile (from working directory)</td>
            </tr>
            <tr>
                <td>error</td>
                <td>String</td>
                <td>Relativ Path to logfile (from working directory)</td>
            </tr>
            <tr>
                <td>maxsize</td>
                <td>String</td>
                <td>The Limit to rotate the logfile valid units are KB, MB or GB</td>
            </tr>
        </table>
    </td>
</tr>
<tr>
    <td>websockets</td>
    <td>Object</td>
    <td>
        The Websocket Configruation Section
        <table>
            <tr>
                <td>usewebsockets</td>
                <td>Boolean</td>
                <td>Enable Websockets on the Server</td>
            </tr>
            <tr>
                <td>socketpath</td>
                <td>String</td>
                <td>The URL Path of Socket. For Example "sockets" => http://localhost8085/sockets</td>
            </tr>
        </table>
    </td>
</tr>
<tr>
    <td>cors</td>
    <td>Object</td>
    <td>
        The CORS Configruation Section
        <table>
            <tr>
                <td>enabled</td>
                <td>Boolean</td>
                <td>Enable CORS on the Server</td>
            </tr>
            <tr>
                <td>default</td>
                <td>Object</td>
                <td>Added Headers Key => Header and Value => Header-Value</td>
            </tr>
        </table>
    </td>
</tr>
<tr>
    <td>access</td>
    <td>Object</td>
    <td>
        Access Handler Options
        <table>
            <tr>
                <td>maxsocketperip</td>
                <td>Integer</td>
                <td>max count of Sockets connect at same Time to the Server for a IP Address</td>
            </tr>
        </table>
    </td>
</tr>
</table>