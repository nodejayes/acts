/**
 * Request Helper Functions
 * @module RequestHelper
 * @author Markus Gilg
 */
'use strict';

class RequestHelper {
    /**
     * handle ok
     * @method ok
     * @param {Object} req a NodeJs Request Object
     * @param {Object} res a NodeJs Response Object
     */
    static ok (req, res) {
        res.statusCode = 200;
        res.end();
    }

    /**
     * handle ok with data
     * @function okWithData
     * @param {Object} req Node Request Object
     * @param {Object} res Node Response Object
     * @param {String} type Content-Type
     * @param {String} data Response Content
     */
    static okWithData (req, res, type, data) {
        res.setHeader('Content-Type', type);
        res.statusCode = 200;
        res.end(data);
    }

    /**
     * handle not found
     * @method notFound
     * @param {Object} req a NodeJs Request Object
     * @param {Object} res a NodeJs Response Object
     */
    static notFound (req, res) {
        res.statusCode = 404;
        res.end();
    }

    /**
     * handle not allowed Method
     * @method notAllowedMethod
     * @param {Object} req a NodeJs Request Object
     * @param {Object} res a NodeJs Response Object
     */
    static notAllowedMethod (req, res) {
        res.statusCode = 405;
        res.end();
    }

    /**
     * handle server error
     * @method internalError
     * @param {Object} req a NodeJs Request Object
     * @param {Object} res a NodeJs Response Object
     */
    static internalError (req, res) {
        res.statusCode = 500;
        res.end();
    }

    /**
     * handle client error
     * @method externalError
     * @param {Object} req a NodeJs Request Object
     * @param {Object} res a NodeJs Response Object
     */
    static externalError (req, res) {
        res.statusCode = 400;
        res.end();
    }

    /**
     * handle redirect
     * @method redirect
     * @param {Object} req a NodeJs Request Object
     * @param {Object} res a NodeJs Response Object
     * @param {String} location the redirect location
     */
    static redirect (req, res, location) {
        res.setHeader('Location', location);
        res.statusCode = 307;
        res.end();
    }
}
module.exports = RequestHelper;