/**
 * Socket Cache Helper
 * @module SocketCache
 * @author Markus Gilg
 */
'use strict';

const SOCKETS = [];

/**
 * return the Socket Identification
 * @function getSocketId
 * @private
 * @param {Object} socket Node Socket Object 
 * @return {Object} SocketId
 */
const getSocketId = function (socket) {
  // socket io sockets have a id node http sockets not!
  return socket.id;
};

/**
 * search a Socket in Cache
 * @function findSocket
 * @private
 * @param {Array} sockets cached Sockets Reference 
 * @param {Object} socket Socket to Search
 * @param {Boolean} getpos return Position or Socket
 * @return {Any} Position or Socket
 */
const findSocket = function (sockets, socket, getpos) {
    getpos = getpos !== true ? false : true;
    for (var i in sockets) {
        if (getSocketId(sockets[i]) === getSocketId(socket)) {
            return getpos ? parseInt(i) : sockets[i];
        }
    }
    return null;
};

class SocketCache {
    /**
     * Add Socket to the Cache
     * @function addSocketIfNotExists
     * @param {Object} socket NodeJs Socket Object
     */
    static addSocketIfNotExists (socket) {
        if (findSocket(SOCKETS, socket) === null) {
            SOCKETS.push(socket);
        }
    }

    /**
     * Remove Socket from Cache
     * @function removeSocket
     * @param {Object} socket NodeJs Socket Object
     */
    static removeSocket (socket) {
        var idx = findSocket(SOCKETS, socket, true);
        if (idx !== null) {
            SOCKETS.splice(idx, 1);
        }
    }

    /**
     * Returns the Socket or the index in Cache
     * @function getSocket
     * @param {Object} socket NodeJs Socket Object
     * @param {Boolean} getindex returns index of socket when true
     */
    static getSocket (socket, getindex) {
        return findSocket(SOCKETS, socket, getindex);
    }
}
module.exports = SocketCache;