/**
 * Process Helper
 * @module ProcessHelper
 * @author Markus Gilg
 * @requires node_child_process
 */
'use strict';

/**
 * Node Process Spawn
 * @const {Function} EXEC
 * @private
 */
const EXEC = require('child_process').spawn;

/**
 * check if typeof function
 * @function isFunction
 * @private
 * @param {Object} value
 * @return {Boolean} isFunction? 
 */
const isFunction = function (value) {
    return typeof value === 'function';
};

class ProcessHelper {
    constructor (path, args) {
        this.privates = {
            processpath: path,
            args: args,
            onOut: null,
            onErr: null,
            onClose: null,
            contentType: null,
            response: null,
            instance: null
        }
    }

    /**
     * Event Handler when Process sends output
     * @prop {Function} onOut
     */
    get onOut () {
        return this.privates.onOut;
    } 

    set onOut (v) {
        if (!isFunction(v)) {
            return;
        }
        this.privates.onOut = v;
    }

    /**
     * Event Handler when Process becomes a error
     * @prop {Function} onErr
     */
    get onErr () {
        return this.privates.onErr;
    }

    set onErr (v) {
        if (!isFunction(v)) {
            return;
        }
        this.privates.onErr = v;
    }

    /**
     * Event Handler when Process is terminated
     * @prop {Function} onClose
     */
    get onClose () {
        return this.privates.onClose;
    }

    set onClose (v) {
        if (!isFunction(v)) {
            return;
        }
        this.privates.onClose = v;
    }

    /**
     * execute the process and send response when finish
     * @function execute
     * @param {Object} res Node Response Object 
     * @param {String} contenttype Content-Type
     */
    execute (res, contenttype) {
        this.privates.response = res;
        this.privates.contenttype = contenttype;
        this.privates.instance = EXEC(this.privates.processpath, this.privates.args);
        this.privates.instance.stdout.on('data', data => {
            this.privates.onOut(data, this.privates.response, this.privates.contenttype);
        });
        this.privates.instance.stderr.on('data', data => {
            this.privates.onErr(data, this.privates.response, this.privates.contenttype);
        });
        this.privates.instance.on('close', code => {
            this.privates.onClose(code, this.privates.response, this.privates.contenttype);
        });
    }
}
module.exports = ProcessHelper;