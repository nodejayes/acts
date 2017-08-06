/**
 * Acts
 * @module Acts
 * @author Markus Gilg
 * @requires ActsCluster
 */
'use strict';

/**
 * ActsCluster Module Namespace
 * @const {Object} CLUSTER
 * @private
 */
const CLUSTER = require('./src/core/cluster.module');

class Acts {
    /**
     * initialize a Acts Server
     * @function createServer
     * @param {String} cwd Server Directory 
     * @param {Object} cfg Server Configuration to overwrite
     * @param {Array} plugins a String Array with Plugins to load
     * @return {Object} ActsCluster Instance
     */
    static createServer (cwd, cfg, plugins) {
        return new CLUSTER(cwd, cfg, plugins);
    }
}
module.exports = Acts;