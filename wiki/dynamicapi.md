# Dynamic API

The Dynamic API is desinged to easy create APIs and Host it immediately without restart the Server. This means the API Files was automatically releaded when it changes. First you define a API Path and Name in the Configuration then you can create a Javascript File in this Path (for example {API Path}/mypath.js) and the Server host a API named {ServerAddress}/{APIName}/mypath.

In the API Javascript File you can define the Method Handler for a HTTP Method with the module.exports Object. You must use always uppercase letters!

```javascript
module.exports.GET = function (request, response, next) {
  // do something here
  // send result data back
  next("HelloWorld!");
};
```
You can Access the URL Parameter in the "parameter" Property of the Request Object.

```javascript
module.exports.GET = function (request, response, next) {
  // access url parameter
  let parameter = request.parameter;
  // send result data back
  next("HelloWorld!");
};
```

When you have a POST Request you can Access the POST Data on the "body" Property in the Request Object.

```javascript
module.exports.POST = function (request, response, next) {
  // access POST Data
  let data = request.body;
  // send result data back
  next("HelloWorld!");
};
```
If you want to run something before or after the Request you can define a Method "BEFORE" and "AFTER".

```javascript
module.exports.BEFORE = function (request, response) {
  // do something before the request method executes
};
module.exports.AFTER = function (request, response) {
  // do something after the request method was executed
};
```