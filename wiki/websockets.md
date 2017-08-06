# Websocekts

The Websoctes works with the same Principal as the Dynamic API. The only Difference between the Dynamic API is the Websockets Javascript File exports only one Method. This Method was called when the Client emits the Socket IO with a String named by Socketfilename and subfolders. For Example Websocketfile {Websocketfolder}/testsocket.js was named "testsocket" and {Websocketfolder}/subfolder/testsocket.js was named "subfolder-testsocket" and so on.

```javascript
// connect to the Socket IO
var socket = io("http://localhost:8085");

function consolelog (msg) {
  console.log(msg);
}

// register the returnsocket1 Method
socket.on("returnsocket1", consolelog);

// emit the testsocket Method on the Server
socket.emit("testsocket", "test for socket 1");
```

On Server side you can emit a Client Method when you Call this.emit in the Websocket Method

```javascript
module.exports = function (data) {
  // data is the data sended by the client
  // emit clients returnsocket1 Method
  this.emit("returnsocket1", data);
};
```