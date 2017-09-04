/**
 * Cors Extension
 * @module CorsExtension
 * @author Markus Gilg
 */
'use strict';

const REQU = require('./../common/request.helper');

/**
 * Handle a CORS Request
 * @function checkRequest
 * @param {Object} req the NodeJs Request Object
 * @param {Object} res the NodeJs Response Object
 * @return {Boolean} Returns true when CORS was handled or is disabled
 */
const checkRequest = function (req, res, next) {
    if (req.method !== 'OPTIONS') {
        this.privates.logger.warning('request has no OPTIONS Method CORS Check Skip');
        next();
        return;
    }
    this.privates.logger.debug('check request for cors ' + req.path);
    if (!this.privates.cfg.server.cors.enabled) {
        this.privates.logger.warning('CORS is disabled');
        REQU.ok(req, res);
        return;
    }

    const opt = this.privates.cfg.server.cors.default;
    for (const x in opt) {
        if (opt.hasOwnProperty(x)) {
            const headerdescription = getHeader(x);
            if (headerdescription === null) {
                continue;
            }
            this.privates.logger.debug('set CORS header ' + headerdescription + ' = ' + opt[x].toString());
            res.setHeader(headerdescription, opt[x].toString());
        }
    }
    REQU.ok(req, res);
};

/**
 * Get the right CORS Header Definition
 * @function getHeader
 * @private
 * @param {String} des Keyword from Configfile
 * @returns {String} CORS Headerkey Definition
 */
const getHeader = function (des) {
    switch (des) {
        case 'origin':
            return 'Access-Control-Allow-Origin';
        case 'methods':
            return 'Access-Control-Request-Method';
        case 'headers':
            return 'Access-Control-Request-Headers';
        case 'credentials':
            return 'Access-Control-Allow-Credentials';
        default:
            return null;
    }
};

class CorsExtension {
    constructor (cfg, logger) {
        this.privates = {
            cfg: cfg,
            logger: logger
        };
    }

    checkRequest (req, res, next) {
        return checkRequest.bind(this)(req, res, next);
    }
}
module.exports = CorsExtension;
