'use strict';

const CLUSTER = require('./src/core/cluster.module');

class Acts {
    static createServer (cwd, cfg, plugins) {
        return new CLUSTER(cwd, cfg, plugins);
    }
}
module.exports = Acts;