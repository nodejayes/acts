/**
 * Acces Handler Extension
 * @module AccessHandlerExtension
 * @author Markus Gilg
 */
'use strict';

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
 * the Socket Cache Grouping by IP
 * @property _brain
 * @private
 */
let _brain = {};

/**
 * Builds a Unique ID for each Socket
 * Uses IP Address the Family and the Client Port
 * 
 * @function getUniqueId
 * @private
 * @param socket {Object} NodeJS Socket Object
 * @return {String} the generated UniqueId
 */
const getUniqueId = function (socket) {
    return socket._peername.address + socket._peername.family + socket._peername.port;
};

/**
 * close a NodeJS Socket and remove it from Cache
 * 
 * @function closeSocket
 * @private
 * @param socket {Object} NodeJS Socket Object
 */
const closeSocket = function (socket) {
    socket.end();
    forgotOne(socket);
};

/**
 * get the Index of a Socket from IP and UniqueId
 * 
 * @function getSocketById
 * @private
 * @param ip {String} the IP Address
 * @param id {String} the Socket UniqueId
 * @return {Integer} the Index of the Socket
 */
const getSocketById = function (ip, id) {
    if (typeof _brain[ip] === typeof undefined) {
        return null;
    }
    for (let i = 0; i < _brain[ip].length; i++) {
        const curr = _brain[ip][i];
        if (curr.id === id) {
            return i;
        }
    }
    return null;
};

/**
 * returns the oldest socket for this IP
 * 
 * @function getOldestSocket
 * @private
 * @param ip {String} the IP Address
 * @return {Object} NodeJS Socket Object
 */
const getOldestSocket = function (ip) {
    let found = null;
    let tmptime = 0;
    for (let i = 0; i < _brain[ip].length; i++) {
        const curr = _brain[ip][i];
        if (i === 0 || curr.time < tmptime) {
            tmptime = curr.time;
            found = curr.socket;
        }
    }
    return found;
};

/**
 * add a Socket to the Socket Cache
 * 
 * @function storeInBrain
 * @private
 * @param s {Object} NodeJS Socket Obejct
 */
const storeInBrain = function (s) {
    _logger.debug('add to Cache ' + s.remoteAddress);
    const tmp = {
        'id': getUniqueId(s),
        'socket': s,
        'time': new Date().getTime()
    };
    if (typeof _brain[s.remoteAddress] !== typeof []) {
        _brain[s.remoteAddress] = [];
    } else {
        if (_brain[s.remoteAddress].length >= _cfg.server.access.maxsocketperip) {
            closeSocket(getOldestSocket(s.remoteAddress));
        }
    }
    _brain[s.remoteAddress].push(tmp);
};

/**
 * removes a Socket from IP Cache
 * 
 * @function forgotOne
 * @private
 * @param s {Object} NodeJS Socket Object
 */
const forgotOne = function (s) {
    _logger.debug('remove ' + s.remoteAddress + ' from Cache');
    if (typeof _brain[s.remoteAddress] !== typeof undefined) {
        _brain[s.remoteAddress]
            .splice(getSocketById(s.remoteAddress, getUniqueId(s)), 1);
        if (_brain[s.remoteAddress].length <= 0) {
            delete _brain[s.remoteAddress];
        }
    }
};

/**
 * handle when Client lost Connection
 * 
 * @event onClientDisconnect
 * @private
 */
const onClientDisconnect = function () {
    forgotOne(this);
};

class AccessHandlerExtension {
    constructor (cfg, logger) {
        _cfg = cfg;
        _logger = logger;
    }

    /**
     * handle when Client connect
     * 
     * @function onClientConnect
     * @public
     * @param socket {Object} NodeJs Sockt Object
     */
    onClientConnect (socket) {
        _logger.debug('incomming ' + socket.remoteAddress + ' Peer: ' + getUniqueId(socket));
        socket.on('close', onClientDisconnect.bind(socket));
        storeInBrain(socket);
    };
}
module.exports = AccessHandlerExtension;