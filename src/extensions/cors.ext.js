/**
 * Cors Extension
 * @module CorsExtension
 * @author Markus Gilg
 */
'use strict';

const REQU = require('./../common/request.helper');

let _cfg = null;
let _logger = null;

/**
 * Handle a CORS Request
 * @function checkRequest
 * @param {Object} req the NodeJs Request Object
 * @param {Object} res the NodeJs Response Object
 * @return {Boolean} Returns true when CORS was handled or is disabled
 */
const checkRequest = function (req, res, next) {
    if (req.method !== 'OPTIONS') {
        _logger.warning('request has no OPTIONS Method CORS Check Skip');
        next();
        return;
    }
    _logger.debug('check request for cors ' + req.path);
    if (!_cfg.server.cors.enabled) {
        _logger.warning('CORS is disabled');
        REQU.ok(req, res);
        return;
    }

    const opt = _cfg.server.cors.default;
    for (const x in opt) {
        if (opt.hasOwnProperty(x)) {
            const headerdescription = getHeader(x);
            if (headerdescription === null) {
                continue;
            }
            _logger.debug('set CORS header ' + headerdescription + ' = ' + opt[x].toString());
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
        _cfg = cfg;
        _logger = logger;
    }

    checkRequest (req, res, next) {
        return checkRequest(req, res, next);
    }
}
module.exports = CorsExtension;
