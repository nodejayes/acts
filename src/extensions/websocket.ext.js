'use strict';

const FILE = require('./../common/filesystem.helper');

let _cfg = null;
let _logger = null;

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
}
module.exports = WebsocketExtension;