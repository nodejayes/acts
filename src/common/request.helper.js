/**
 * Request Helper Functions
 * @module RequestHelper
 * @author Markus Gilg
 */
'use strict';

/**
 * handle ok
 * @method ok
 * @private
 * @param {Object} req a NodeJs Request Object
 * @param {Object} res a NodeJs Response Object
 */
const ok = function (req, res) {
  res.statusCode = 200;
  res.end();
};

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
    static ok (req, res) {

    }

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