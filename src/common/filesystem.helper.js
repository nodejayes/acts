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

/**
 * create path when not exists
 * @method createDirectoryRecursive
 * @param {String} path a Folder Path
 */
const createDirectoryRecursive = function (path) {
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
};

/**
 * 
 * @function folderDiff
 * @param {String} startfolder 
 * @param {String} currentfolder 
 */
const folderDiff = function (startfolder, currentfolder) {
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
};

class FileSystemHelper {
    static getFileContent () {
        return FS.readFileSync.apply(arguments);
    }

    static readDir () {
        return FS.readdirSync.apply(arguments);
    }

    static getStats () {
        return FS.statSync.apply(arguments);
    }

    static joinPath () {
        return PATH.join.apply(PATH.join, arguments);
    }

    static createDirectoryRecursive (path) {
        createDirectoryRecursive(path);
    }

    static folderDiff (startfolder, currentfolder) {
        return folderDiff(startfolder, currentfolder);
    }

    static basename () {
        return PATH.basename.apply(arguments);
    }

    static extname () {
        return PATH.extname.apply(arguments);
    }
}
module.exports = FileSystemHelper;