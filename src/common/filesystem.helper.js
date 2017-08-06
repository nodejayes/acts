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

class FileSystemHelper {
    static getFileContent (path, encoding = 'utf8') {
        return FS.readFileSync(path, encoding);
    }

    static joinPath () {
        return PATH.join.apply(PATH.join, arguments);
    }

    static createDirectoryRecursive (path) {
        createDirectoryRecursive(path);
    }
}
module.exports = FileSystemHelper;