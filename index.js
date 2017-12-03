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

let _instance = null;

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
        _instance = new CLUSTER(cwd, cfg, plugins);
        return _instance;
    }

    /**
     * implements the Authentication for the Server
     * 
     * @static
     * @param {function} authenticateFunction 
     * @returns 
     * @memberof Acts
     */
    static authentication (authenticateFunction) {
        if (typeof authenticateFunction !== 'function') {
            console.warn(`authentication Function is not a Function type: ${typeof authenticateFunction}`);
            return _instance;
        }
        _instance.setAuthentication(authenticateFunction);
        return _instance;
    }

    /**
     * set a hook after authentication
     * 
     * @static
     * @param {function} hookFunction 
     * @memberof Acts
     */
    static hook (hookFunction) {
        if (typeof hookFunction !== 'function') {
            console.warn(`hook Function is not a Function type: ${typeof hookFunction}`);
            return _instance;
        }
        _instance.setAuthentication(hookFunction);
        return _instance;
    }

    /**
     * call Cluster start method from Acts Class
     * 
     * @static
     * @param {function} cb 
     * @memberof Acts
     */
    static start (cb) {
        _instance.start(cb);
    }

    /**
     * shutdown the Server
     * 
     * @static
     * @memberof Acts
     */
    static shutdown () {
        if (_instance === null) {
            return;
        }
        _instance.shutdownInstances();
    }
}
module.exports = Acts;