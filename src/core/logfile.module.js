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
 * @const {Object} INSTANCE
 * @private
 */
const INSTANCE = null;

class Logfile {
    /**
     * initialize the Logwriter Instance
     * @function
     * @param {Object} opts Logwriter Options 
     */
    static init (opts) {
        INSTANCE = new LOGWRITER(opts);
    }

    /**
     * returns the Logwriter Instance
     * @function
     * @return {Object} Logwriter
     */
    static getInstance () {
        return INSTANCE;
    }
}
module.exports = Logfile;