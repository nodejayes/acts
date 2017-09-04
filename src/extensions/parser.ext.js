/**
 * Parser Extension
 * @module ParserExtension
 * @author Markus Gilg
 * @requires npm_sqlstring
 * @requires RequestHelper
 */
'use strict';

/**
 * Request Helper Namespace
 * @const {Object} REQU
 * @private
 */
const REQU = require('./../common/request.helper');
/**
 * Sqlstring NPM Package
 * @const {Object} SQLSTRING
 * @private
 */
const SQLSTRING = require('sqlstring');

/**
 * read the Query Parameters from the Request and write it to parameter Property
 * @function parseParameter
 * @private
 * @param {Object} req Node Request Object 
 */
const parseParameter = function (req) {
    const result = {};
    const tmp = req.url.split('?');
    if (tmp.length !== 2) {
        return;
    }
    req.url = tmp[0];
    const values = tmp[1].split('&');
    for (let i = 0; i < values.length; i++) {
        const value = values[i].split('=');
        if (value.length !== 2) {
            continue;
        }
        let escaped = SQLSTRING.escape(decodeURI(value[1]));
        escaped = escaped.substr(1, escaped.length - 2);
        result[value[0]] = escaped;
    }
    req.parameter = result;
};

/**
 * try to read the Data from Request and write it to body property
 * @function getData
 * @private
 * @param {Object} req Node Request Object
 * @param {Object} data the Request Data
 * @param {String} type Content-Type of Post Data 
 */
const getData = function (req, data, type) {
    try {
        this.privates.logger.debug('try to parse request data');
        req.contenttype = null;
        req.body = null;

        req.contenttype = type;
        const strData = data.toString('utf-8');
        // must the right contenttype
        this.privates.logger.debug('use messageFormat ' + this.privates.cfg.server.messageFormat);
        switch (this.privates.cfg.server.messageFormat) {
            case 'json':
                if (type !== 'application/json') {
                    this.privates.logger.warning('invalid contenttype in request');
                    return false;
                } else {
                    // parse data
                    req.body = JSON.parse(strData);
                    return true;
                }
            case 'string':
                req.body = strData;
                return true;
            default:
                return true;
        }
    } catch (ex) {
        this.privates.logger.error(ex);
        return false;
    }
};

/**
 * handle the incoming Data
 * @function handleData
 * @private 
 * @param {Object} data 
 */
const handleData = function (data) {
    try {
        getData.bind(this.class)(this.req, data, this.req.headers['content-type']);
        this.next();
    } catch (err) {
        this.class.privates.logger.error(err);
        REQU.internalError(this.req, this.res);
    }
};

class ParserExtension {
    constructor (cfg, logger) {
        this.privates = {
            cfg: cfg,
            logger: logger,
            nobodyrequests: ['GET', 'DELETE']
        }
    }

    /**
     * starts the parse of the Request
     * @function parse
     * @param {Object} req Node Request Object 
     * @param {Object} res Node Response Object
     * @param {Function} next Connect next Function
     */
    parse (req, res, next) {
        req.parameter = null;
        parseParameter(req);
        if (this.privates.nobodyrequests.indexOf(req.method) === -1) {
            req.on('data', handleData.bind({
                req: req,
                res: res,
                next: next,
                class: this
            }));
        } else {
            next();
        }
    }
}
module.exports = ParserExtension;
