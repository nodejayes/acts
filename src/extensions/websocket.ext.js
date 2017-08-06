/**
 * Websocket Extension
 * @module WebsocketExtension
 * @author Markus Gilg
 * @requires FilesystemHelper
 * @requires SocketCache
 */
'use strict';

/**
 * File System Helper Reference
 * @const {Object} FILE
 * @private
 */
const FILE  = require('./../common/filesystem.helper');
/**
 * Socket Cache Reference
 * @const {Object} CACHE
 * @private
 */
const CACHE = require('./../common/socketcache.helper');

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
 * read all Websocket Events
 * @function readEvents
 * @private
 * @param {Object} socket Node Socket Object
 * @param {String} path current path
 * @param {String} startfolder parent folder 
 */
const readEvents = function (socket, path, startfolder) {
    startfolder = !startfolder ? path : startfolder;
    const files = FILE.readDir(path);
    for (let i = 0; i < files.length; i++) {
        const filename = files[i];
        const file = FILE.joinPath(path, filename);
        const stat = FILE.getStats(file);
        if (stat.isDirectory()) {
            _logger.debug('jump into folder ' + file);
            readEvents(socket, file, startfolder);
        } else {
            // Extension must be .js
            if (FILE.extname(filename) !== '.js') {
                continue;
            }
            var registerName = FILE.folderDiff(startfolder, path) + FILE.basename(filename, '.js');
            _logger.debug('register event from ' + file + ' as ' + registerName);
            socket.on(registerName, require(file));
        }
    }
};

class WebsocketExtension {
    constructor (cfg, logger) {
        _cfg = cfg;
        _logger = logger;
    }

    /**
     * add Socket to Cache and Register Websocket Events
     * @function setEventsOnSocket
     * @param {Object} socket Node Socket Object 
     */
    setEventsOnSocket (socket) {
        if (!_cfg.serverdir) {
            return;
        }
        _logger.debug("register socket in cache " + socket.id);
        CACHE.addSocketIfNotExists(socket);
        socket.on("close", function (err) {
            if (err) {
                _logger.error(err);
            }
            _logger.debug("remove socket from cache " + this.id);
            CACHE.removeSocket(this);
        });
        _logger.debug("begin to register socket events");
        readEvents(socket, FILE.joinPath(_cfg.serverdir, _cfg.server.websockets.socketpath));
    }
}
module.exports = WebsocketExtension;