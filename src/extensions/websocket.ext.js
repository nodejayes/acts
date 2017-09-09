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
 * @const {object} FILE
 * @private
 */
const FILE  = require('./../common/filesystem.helper');
/**
 * Socket Cache Reference
 * @const {object} CACHE
 * @private
 */
const CACHE = require('./../common/socketcache.helper');

/**
 * read all Websocket Events
 * @function readEvents
 * @private
 * @param {object} socket Node Socket Object
 * @param {string} path current path
 * @param {string} startfolder parent folder 
 */
const readEvents = function (socket, path, startfolder) {
    startfolder = !startfolder ? path : startfolder;
    const files = FILE.readDir(path);
    for (let i = 0; i < files.length; i++) {
        const filename = files[i];
        const file = FILE.joinPath(path, filename);
        const stat = FILE.getStats(file);
        if (stat.isDirectory()) {
            this.privates.logger.debug('jump into folder ' + file);
            readEvents.bind(this)(socket, file, startfolder);
        } else {
            // Extension must be .js
            if (FILE.extname(filename) !== '.js') {
                continue;
            }
            var registerName = FILE.folderDiff(startfolder, path) + FILE.basename(filename, '.js');
            this.privates.logger.debug('register event from ' + file + ' as ' + registerName);
            socket.on(registerName, require(file));
        }
    }
};

class WebsocketExtension {
    constructor (cfg, logger) {
        this.privates = {
            /**
             * Server Configuration
             * @prop {object} cfg
             * @private
             */
            cfg: cfg,
            /**
             * Logwriter Instance
             * @prop {object} logger
             * @private
             */
            logger: logger
        };
    }

    /**
     * add Socket to Cache and Register Websocket Events
     * @function setEventsOnSocket
     * @param {object} socket Node Socket Object 
     */
    setEventsOnSocket (socket) {
        console.info('socket connect');
        if (!this.privates.cfg.serverdir) {
            return;
        }
        this.privates.logger.debug("register socket in cache " + socket.id);
        CACHE.addSocketIfNotExists(socket);
        socket.on("close", function (err) {
            if (err) {
                this.privates.logger.error(err);
            }
            this.privates.logger.debug("remove socket from cache " + this.id);
            CACHE.removeSocket(this);
        });
        this.privates.logger.debug("begin to register socket events");
        readEvents.bind(this)(socket, FILE.joinPath(this.privates.cfg.serverdir, this.privates.cfg.server.websockets.socketpath));
    }
}
module.exports = WebsocketExtension;