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