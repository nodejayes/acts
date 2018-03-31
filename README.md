[![Build Status](https://travis-ci.org/nodejayes/acts.svg?branch=master)](https://travis-ci.org/nodejayes/acts)
[![Coverage Status](https://coveralls.io/repos/github/nodejayes/acts/badge.svg)](https://coveralls.io/github/nodejayes/acts)
[![dependencies Status](https://david-dm.org/nodejayes/acts.svg)](https://david-dm.org/nodejayes/acts)
[![devDependency Status](https://david-dm.org/nodejayes/acts/dev-status.svg)](https://david-dm.org/nodejayes/acts#info=devDependencies)
[![npm version](https://badge.fury.io/js/acts.svg)](https://badge.fury.io/js/acts)
![npm](https://img.shields.io/npm/l/acts.svg)
![npm](https://img.shields.io/npm/dt/acts.svg)
![npm](https://img.shields.io/npm/dw/acts.svg)
![npm](https://img.shields.io/npm/dm/acts.svg)
![npm](https://img.shields.io/npm/dy/acts.svg)

# Acts

An application server that allows you to quickly create Backends and hosting Frontends.

*It is completly redesinged with pure ES2017 Features.*

To run the Scripts you can use NPM or Yarn. This Examples all use Yarn!

## Installation

```bash
yarn install acts
```

## Build Documentation

You need jsdoc to generate the Documentation!

```bash
yarn run docu
```

## Usage

```javascript
const ACTS = require('acts');

ACTS.createServer(process.cwd(), {
  server: {
      address: 'localhost',
      port: 8080
  }
}, [])
.start(function () {
  // insert stuff to do when server is started
});
```

## More Documentation

[1. Configuration](https://github.com/nodejayes/acts/tree/master/wiki/configuration.md)

[2. Dynamic API](https://github.com/nodejayes/acts/tree/master/wiki/dynamicapi.md)

[3. Security](https://github.com/nodejayes/acts/tree/master/wiki/security.md)

[4. Websockets](https://github.com/nodejayes/acts/tree/master/wiki/websockets.md)