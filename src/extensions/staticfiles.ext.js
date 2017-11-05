/**
 * Static File Extension
 * @module StaticFileExtension
 * @author Markus Gilg
 * @requires FileSystemHelper
 * @requires RequestHelper
 * @requires ProcessHelper
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
 * Process Helper Namespace
 * @const {Object} PROC
 * @private
 */
const PROC     = require('./../common/process.helper'); 
/**
 * Filetypes
 * @const {Object} FILETYPES
 * @private
 */
const FILETYPES = require('./../meta/filetypes.json');

/**
 * Shortcut for Root Directory
 * @const {String} ROOT
 * @private
 */
const ROOT = '.' + FILE.pathSep;
/**
 * static Webpage Extensions
 * @const {Array} WEBPAGEEXTENSIONS
 * @private
 */
const WEBPAGEEXTENSIONS = ['.js', '.html', '.xhtml', '.jpeg', '.jpg', '.png', '.bmp', '.css', '.ico'];

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
    if (tmpextensions.indexOf(this.privates.cfg.server.allowedExtensions[i]) === -1) {
        tmpextensions.push(this.privates.cfg.server.allowedExtensions[i]);
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
    if (this.privates.cfg.server.allowedExtensions.indexOf(extension) === -1) {
        return false;
    }
    return true;
};

class StaticFileExtension {
    constructor (cfg, logger) {
        this.privates = {
            cfg: cfg,
            logger: logger,
            tmpextensions: []
        };

        // fill extension list
        for (var i = 0; i < this.privates.cfg.server.allowedExtensions.length; i++) {
            const curr = this.privates.cfg.server.allowedExtensions[i];
            if (curr === 'webpage') {
                fillWebpageFilter(WEBPAGEEXTENSIONS, this.privates.tmpextensions);
            } else {
                fillOtherExtensions.bind(this)(this.privates.tmpextensions, i);
            }
        }
        this.privates.cfg.server.allowedExtensions = this.privates.tmpextensions;
    }

    /**
     * search for Files and returns the Content (PHP files was executed)
     * @function request
     * @param {Object} req Node Request Object
     * @param {Object} res Node Response Object
     * @param {Function} next Connect next Callback 
     */
    request (req, res, next) {
        const absolutepath = FILE.joinPath(this.privates.cfg.serverdir, this.privates.cfg.server.webroot, req.url.split('/').join(FILE.pathSep)).trim();
        this.privates.logger.debug('request ' + absolutepath);
        // correct root with index.html
        if (absolutepath === FILE.joinPath(this.privates.cfg.serverdir, this.privates.cfg.server.webroot) + FILE.pathSep) {
            absolutepath = FILE.joinPath(this.privates.cfg.serverdir, this.privates.cfg.server.webroot) + FILE.pathSep + 'index.html';
        }
        try {
            const extension = FILE.extname(absolutepath);
            if (!checkExtension.bind(this)(extension)) {
                this.privates.logger.warning('file extension not allowed');
                next();
                return;
            }
            const contenttype = getContentType(extension);
            this.privates.logger.debug('contenttype is ' + contenttype);
            if (this.privates.cfg.server.phppath && contenttype === 'application/x-httpd-php') {
                // works only with absolute path
                const php = new PROC(this.privates.cfg.server.phppath, [absolutepath]);
                php.onOut = phpFinish;
                php.onClose = phpClose;
                php.execute(res);
                return;
            }
            const content = FILE.getFileContent(absolutepath);
            REQU.okWithData(req, res, contenttype, content);
            this.privates.logger.debug('sending file: ' + absolutepath);
        } catch (ex) {
            this.privates.logger.error(ex);
            next();
        }
    }
}
module.exports = StaticFileExtension;