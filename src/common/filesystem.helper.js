/**
 * Filesystem Helper Functions
 * @module FileSystemHelper
 * @author Markus Gilg
 * @requires node_fs
 * @requires node_path
 */
'use strict';

/**
 * Node FS Module
 * @const {Object} FS
 * @private
 */
const FS   = require('fs');
/**
 * Node Path Module
 * @const {Object} PATH
 * @private
 */
const PATH = require('path');

class FileSystemHelper {
    static get pathSep () { return PATH.sep; }

    static getFileContent () {
        return FS.readFileSync.apply(FS, arguments);
    }

    static readDir () {
        return FS.readdirSync.apply(FS, arguments);
    }

    static getStatsAsync () {
        return FS.stat.apply(FS, arguments);
    }

    static watch () {
        return FS.watch.apply(FS, arguments);
    }

    static getStats () {
        return FS.statSync.apply(FS, arguments);
    }

    static joinPath () {
        return PATH.join.apply(PATH, arguments);
    }

    /**
     * create path when not exists
     * @function createDirectoryRecursive
     * @param {String} path a Folder Path
     */
    static createDirectoryRecursive (path) {
        FS.stat(path, function (err) {
            if (err) {
                const levels = path.split(PATH.sep);
                let fullpath = "";
                for (let i = 0; i < levels.length; i++) {
                    const level = levels[i];
                    fullpath += level + PATH.sep;
                    try {
                        FS.statSync(fullpath);
                    } catch (err) {
                        FS.mkdirSync(fullpath);
                    }
                }
            }
        });
    }

    /**
     * 
     * @function folderDiff
     * @param {String} startfolder 
     * @param {String} currentfolder 
     */
    static folderDiff (startfolder, currentfolder) {
        let result = '';
        const TMPSTART = startfolder.split(PATH.sep);
        const TMPCURRENT = currentfolder.split(PATH.sep);
        if (TMPCURRENT.length < TMPSTART.length) {
            return result;
        }
        for (const I in TMPCURRENT) {
            if (TMPSTART.length > I) {
            continue;
            }
            result += TMPCURRENT[I] + '-';
        }
        return result;
    }

    static basename () {
        return PATH.basename.apply(PATH.basename, arguments);
    }

    static extname () {
        return PATH.extname.apply(PATH.extname, arguments);
    }
}
module.exports = FileSystemHelper;