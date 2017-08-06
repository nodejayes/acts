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
        return FS.readFileSync.apply(arguments);
    }

    static readDir () {
        return FS.readdirSync.apply(arguments);
    }

    static getStatsAsync () {
        return FS.stat.apply(arguments);
    }

    static watch () {
        return FS.watch.apply(arguments);
    }

    static getStats () {
        return FS.statSync.apply(arguments);
    }

    static joinPath () {
        return PATH.join.apply(PATH.join, arguments);
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
        let tmpstart = startfolder.split(PATH.sep);
        let tmpcurrent = currentfolder.split(PATH.sep);
        if (tmpcurrent.length < tmpstart) {
            return result;
        }
        for (let i in tmpcurrent) {
            if (tmpstart.length > i) {
            continue;
            }
            result += tmpcurrent[i] + '-';
        }
        return result;
    }

    static basename () {
        return PATH.basename.apply(arguments);
    }

    static extname () {
        return PATH.extname.apply(arguments);
    }
}
module.exports = FileSystemHelper;