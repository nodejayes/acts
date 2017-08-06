/**
 * Helper that create and holds one Logwriter Instance
 * @module Logfile
 * @author Markus Gilg
 * @requires npm_logwriter
 */
'use strict';

/**
 * Logwriter Namespace
 * @const {Object} LOGWRITER
 * @private
 */
const LOGWRITER = require('logwriter');
/**
 * Logwriter Instance
 * @prop {Object} _instance
 * @private
 */
let _instance = null;

class Logfile {
    /**
     * initialize the Logwriter Instance
     * @function
     * @param {Object} opts Logwriter Options 
     */
    static init (opts) {
        _instance = new LOGWRITER(opts);
    }

    /**
     * returns the Logwriter Instance
     * @function
     * @return {Object} Logwriter
     */
    static getInstance () {
        return _instance;
    }
}
module.exports = Logfile;