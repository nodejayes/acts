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
 * path to processfile
 * @prop {String}
 * @private
 */
let _processpath = null;
/**
 * process arguments
 * @prop {Array}
 * @private
 */
let _arguments   = null;
/**
 * Node Spawn Object
 * @prop {Object}
 * @private
 */
let _instance    = null;
/**
 * Node Response Object
 * @prop {Object}
 * @private
 */
let _response    = null;
/**
 * contenttype of response
 * @prop {String}
 * @private
 */
let _contenttype = null;
/**
 * inner on process out eventhandler
 * @prop {String}
 * @private
 */
let _onOut       = null;
/**
 * inner on process error eventhandler
 * @prop {Function}
 * @private
 */
let _onErr       = null;
/**
 * inner on process close eventhandler
 * @prop {Function}
 * @private
 */
let _onClose     = null;

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
        _processpath = path;
        _arguments = args;
    }

    /**
     * Event Handler when Process sends output
     * @prop {Function} onOut
     */
    get onOut () {
        return _onOut;
    } 

    set onOut (v) {
        if (!isFunction(v)) {
            return;
        }
        _onOut = v;
    }

    /**
     * Event Handler when Process becomes a error
     * @prop {Function} onErr
     */
    get onErr () {
        return _onErr;
    }

    set onErr (v) {
        if (!isFunction(v)) {
            return;
        }
        _onErr = v;
    }

    /**
     * Event Handler when Process is terminated
     * @prop {Function} onClose
     */
    get onClose () {
        return _onClose;
    }

    set onClose (v) {
        if (!isFunction(v)) {
            return;
        }
        _onClose = v;
    }

    /**
     * execute the process and send response when finish
     * @function execute
     * @param {Object} res Node Response Object 
     * @param {String} contenttype Content-Type
     */
    execute (res, contenttype) {
        _response = res;
        _contenttype = contenttype;
        _instance = EXEC(_processpath, _arguments);
        _instance.stdout.on('data', data => {
            _onOut(data, _response, _contenttype);
        });
        _instance.stderr.on('data', data => {
            _onErr(data, _response, _contenttype);
        });
        _instance.on('close', code => {
            _onClose(code, _response, _contenttype);
        });
    }
}
module.exports = ProcessHelper;