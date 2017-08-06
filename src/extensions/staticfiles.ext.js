/**
 * Static File Extension
 * @module StaticFileExtension
 * @author Markus Gilg
 * @requires FileSystemHelper
 * @requires RequestHelper
 * @requires filetypes.json
 */
'use strict';

/**
 * Files Helper Namespace
 * @const {Object} FILE
 * @private
 */
const FILE     = require('./../common/filesystem.helper');
/**
 * Request Helper Namespace
 * @const {Object} REQU
 * @private
 */
const REQU     = require('./../common/request.helper');
/**
 * Filetypes
 * @const {Object} FILETYPES
 * @private
 */
const FILETYPES = require('./../meta/filetypes.json');

/**
 * Shortcut for Root Directory
 * @prop {String} _root
 * @private
 */
let _root = '.' + FILE.pathSep;
/**
 * Server Configuration
 * @prop {Object} _cfg
 * @private
 */
let _cfg = null;
/**
 * Logwriter Instance
 * @prop {Object} _logger
 * @private
 */
let _logger = null;
/**
 * static Webpage Extensions
 * @prop {Array} _webpageextensions
 * @private
 */
let _webpageextensions = ['.js', '.html', '.xhtml', '.jpeg', '.jpg', '.png', '.bmp', '.css', '.ico'];
/**
 * result of allowed Extensions
 * @prop {Array} _tmpextensions
 * @private
 */
let _tmpextensions = [];

/**
 * fills the extension array for keyword webpage
 * @function fillWebpageFilter
 * @private
 * @param {Array} webpageextensions 
 * @param {Array} tmpextensions 
 */
const fillWebpageFilter = function (webpageextensions, tmpextensions) {
    for (var j = 0; j < webpageextensions.length; j++) {
        if (tmpextensions.indexOf(webpageextensions[j]) === -1) {
           tmpextensions.push(webpageextensions[j]);
        }
    }
};

/**
 * fill all Config Extension in the result Array
 * @function fillOtherExtensions
 * @private
 * @param {Array} tmpextensions 
 * @param {Integer} i 
 */
const fillOtherExtensions = function (tmpextensions, i) {
    if (tmpextensions.indexOf(_cfg.server.allowedExtensions[i]) === -1) {
        tmpextensions.push(_cfg.server.allowedExtensions[i]);
    }
};

/**
 * response php result
 * @event phpFinish
 * @private
 * @param {String} data PHP Result String
 * @param {Object} response Node Response Object 
 */
const phpFinish = function (data, response) {
    response.phpcontent = data;
};

/**
 * send the PHP Response
 * @event phpClose
 * @private
 * @param {Integer} code Exitcode 
 * @param {Object} response Node Response Object 
 */
const phpClose = function (code, response) {
    if (code === 0) {
        REQU.okWithData(undefined, response, getContentType('.html'), response.phpcontent);
    } else {
        REQU.internalError(undefined, response);
    }
};

/**
 * if current extension allowed in server configuration
 * @function checkExtension
 * @private
 * @param {String} extension current File Extension
 * @return {Boolean} allowed?
 */
const checkExtension = function (extension) {
    if (_cfg.server.allowedExtensions.indexOf(extension) === -1) {
        return false;
    }
    return true;
};

/**
 * get contenttype with the current extension
 * @function getContentType
 * @private
 * @param {String} extension current File Extension
 * @return {String} Content-Type
 */
const getContentType = function (extension) {
    if (FILETYPES.hasOwnProperty(extension)) {
        return FILETYPES[extension];
    } else {  
        return "text/plain";
    }
};

class StaticFileExtension {
    constructor (cfg, logger) {
        _cfg = cfg;
        _logger = logger;

        // fill extension list
        for (var i = 0; i < _cfg.server.allowedExtensions.length; i++) {
            const curr = _cfg.server.allowedExtensions[i];
            if (curr === 'webpage') {
                fillWebpageFilter(_webpageextensions, _tmpextensions);
            } else {
                fillOtherExtensions(_tmpextensions, i);
            }
        }
        _cfg.server.allowedExtensions = _tmpextensions;
    }

    /**
     * search for Files and returns the Content (PHP files was executed)
     * @function request
     * @param {Object} req Node Request Object
     * @param {Object} res Node Response Object
     * @param {Function} next Connect next Callback 
     */
    request (req, res, next) {
        let filepath = _root + _cfg.server.webroot + req.url.split('/').join(FILE.pathSep).trim();
        const absolutepath = FILE.joinPath(_cfg.serverdir, _cfg.server.webroot, req.url.split('/').join(FILE.pathSep)).trim();
        _logger.debug('request ' + absolutepath);
        // correct root with index.html
        if (filepath === _root + _cfg.server.webroot + FILE.pathSep) {
            filepath = _root + _cfg.server.webroot + FILE.pathSep + 'index.html';
        }
        try {
            const extension = FILE.extname(filepath);
            if (!checkExtension(extension)) {
                _logger.warning('file extension not allowed');
                next();
                return;
            }
            const contenttype = getContentType(extension);
            _logger.debug('contenttype is ' + contenttype);
            if (_cfg.server.phppath && contenttype === 'application/x-httpd-php') {
                // works only with absolute path
                const php = require('./processrunner')(_cfg.server.phppath, [absolutepath]);
                php.onOut = phpFinish;
                php.onClose = phpClose;
                php.execute(res);
                return;
            }
            const content = FILE.getFileContent(filepath);
            REQU.okWithData(req, res, contenttype, content);
            _logger.debug('sending file: ' + filepath);
        } catch (ex) {
            _logger.error(ex);
            next();
        }
    }
}
module.exports = StaticFileExtension;