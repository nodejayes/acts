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

class Logfile {
    constructor (opts) {
        this.privates = {
            /**
             * Logwriter Instance
             * @prop {Object} _instance
             * @private
             */
            instance: null
        };
        this.options = opts;
    }

    /**
     * initialize the Logwriter Instance
     * @function
     * @param {Object} opts Logwriter Options 
     */
    init () {
        this.privates.instance = new LOGWRITER(this.options);
    }

    /**
     * returns the Logwriter Instance
     * @function
     * @return {Object} Logwriter
     */
    getInstance () {
        return this.privates.instance;
    }
}
module.exports = Logfile;