/**
 * Acces Handler Extension
 * @module AccessHandlerExtension
 * @author Markus Gilg
 */
'use strict';

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
 * get the Index of a Socket from IP and UniqueId
 * 
 * @function getSocketById
 * @private
 * @param ip {String} the IP Address
 * @param id {String} the Socket UniqueId
 * @return {Integer} the Index of the Socket
 */
const getSocketById = function (ip, id) {
    if (typeof this.privates.brain[ip] === typeof undefined) {
        return null;
    }
    for (let i = 0; i < this.privates.brain[ip].length; i++) {
        const curr = this.privates.brain[ip][i];
        if (curr.id === id) {
            return i;
        }
    }
    return null;
};

/**
 * removes a Socket from IP Cache
 * 
 * @function forgotOne
 * @private
 * @param s {Object} NodeJS Socket Object
 */
const forgotOne = function (s) {
    this.privates.logger.debug('remove ' + s.remoteAddress + ' from Cache');
    if (typeof this.privates.brain[s.remoteAddress] !== typeof undefined) {
        this.privates.brain[s.remoteAddress]
            .splice(getSocketById.bind(this)(s.remoteAddress, getUniqueId(s)), 1);
        if (this.privates.brain[s.remoteAddress].length <= 0) {
            delete this.privates.brain[s.remoteAddress];
        }
    }
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
    forgotOne.bind(this)(socket);
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
    for (let i = 0; i < this.privates.brain[ip].length; i++) {
        const curr = this.privates.brain[ip][i];
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
    this.privates.logger.debug('add to Cache ' + s.remoteAddress);
    const tmp = {
        'id': getUniqueId(s),
        'socket': s,
        'time': new Date().getTime()
    };
    if (typeof this.privates.brain[s.remoteAddress] !== typeof []) {
        this.privates.brain[s.remoteAddress] = [];
    } else {
        if (this.privates.brain[s.remoteAddress].length >= this.privates.cfg.server.access.maxsocketperip) {
            closeSocket.bind(this)(getOldestSocket.bind(this)(s.remoteAddress));
        }
    }
    this.privates.brain[s.remoteAddress].push(tmp);
};

/**
 * handle when Client lost Connection
 * 
 * @event onClientDisconnect
 * @private
 */
const onClientDisconnect = function () {
    forgotOne.bind(this.class)(this.socket);
};

class AccessHandlerExtension {
    constructor (cfg, logger) {
        this.privates = {
            cfg: cfg,
            logger: logger,
            brain: {}
        };
    }

    /**
     * handle when Client connect
     * 
     * @function onClientConnect
     * @public
     * @param socket {Object} NodeJs Sockt Object
     */
    onClientConnect (socket) {
        this.privates.logger.debug('incomming ' + socket.remoteAddress + ' Peer: ' + getUniqueId(socket));
        socket.on('close', onClientDisconnect.bind({
            socket: socket,
            class: this
        }));
        storeInBrain.bind(this)(socket);
    };
}
module.exports = AccessHandlerExtension;