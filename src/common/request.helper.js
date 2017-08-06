/**
 * Request Helper Functions
 * @module RequestHelper
 * @author Markus Gilg
 */
'use strict';

/**
 * handle not found
 * @method notFound
 * @private
 * @param {Object} req a NodeJs Request Object
 * @param {Object} res a NodeJs Response Object
 */
const notFound = function (req, res) {
  res.statusCode = 404;
  res.end();
};

/**
 * handle server error
 * @method internalError
 * @private
 * @param {Object} req a NodeJs Request Object
 * @param {Object} res a NodeJs Response Object
 */
const internalError = function (req, res) {
  res.statusCode = 500;
  res.end();
};

/**
 * handle client error
 * @method externalError
 * @private
 * @param {Object} req a NodeJs Request Object
 * @param {Object} res a NodeJs Response Object
 */
const internalError = function (req, res) {
  res.statusCode = 400;
  res.end();
};

class RequestHelper {
    static notFound (req, res) {
        return notFound(req, res);
    }

    static internalError (req, res) {
        return internalError(req, res);
    }

    static externalError (req, res) {
        return externalError(req, res);
    }
}
module.exports = RequestHelper;