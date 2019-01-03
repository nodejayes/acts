/**
 * Dynamic API Extension
 * @module DynamicApiExtension
 * @author Markus Gilg
 * @requires FileHelper
 * @requires RequestHelper
 */
'use strict';

/**
 * Files Helper Namespace
 * @const {Object} FILE
 * @private
 */
const FILE     = require('./../common/filesystem.helper');
/**
 * Request Helper Namespace
 * @const {Object} REQU
 * @private
 */
const REQU     = require('./../common/request.helper');
const PATH     = require('path');

const NOTALLOWED   = 'notallowed';
const INVALIDROUTE = 'invalidroute';

/**
 *
 * @function getObject
 * @private
 * @param {String} key
 * @param {Object} obj
 * @return {Any}
 */
const getObject = function (key, obj) {
    const keys = key.split('|');
    let currentPath = obj;
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] === '') {
            continue;
        }
        const isLast = i >= (keys.length - 1);
        if (typeof currentPath[keys[i]] === typeof undefined) {
            return null;
        }
        if (isLast) {
            return currentPath[keys[i]];
        } else {
            currentPath = currentPath[keys[i]];
        }
    }
    return null;
};

/**
 * @function createObject
 * @private
 * @param {String} key
 * @param {Object} obj
 * @param {Object} data
 */
const createObject = function (key, obj, data) {
    const keys = key.split('|');
    let currentPath = obj;
    for (let i = 0; i < keys.length; i++) {
        const isLast = i >= (keys.length - 1);
        // be sure that the key exists
        if (typeof currentPath[keys[i]] === typeof undefined) {
            currentPath[keys[i]] = {};
        }
        if (isLast) {
            currentPath[keys[i]] = data;
        } else {
            currentPath = currentPath[keys[i]];
        }
    }
};

/**
 *
 * @function deleteObject
 * @private
 * @param {String} key
 * @param {Object} obj
 */
const deleteObject = function (key, obj) {
    const keys = key.split('|');
    const currentPath = obj;
    for (let i = 0; i < keys.length; i++) {
        if (typeof currentPath[keys[i]] === typeof undefined) {
            return;
        }
        delete currentPath[keys[i]];
    }
};

/**
 * returns the name of the api by file
 * @function getApiName
 * @private
 * @param {String} path
 * @return {String}
 */
const getApiName = function (path) {
    let result = '';
    const tmpPath = path.split(FILE.pathSep);
    const tmpFolder = FILE.joinPath(this.privates.cfg.serverdir, this.privates.cfg.server.api.routepath)
        .split(FILE.pathSep);
    let i = 0;
    while (i < tmpPath.length) {
        if ((tmpFolder.length - 1) >= i) {
            i++;
            continue;
        }
        result += tmpPath[i] + '|';
        i++;
    }
    result = result.substr(0, result.length - 4);
    return result;
};

/**
 * @event onReload
 * @private
 * @param {Object} eve
 */
const onReload = function (eve) {
    if (eve === 'change') {
        delete require.cache[this.context.path];
        try {
            if (PATH.extname(absolutePath) === '.js' && PATH.extname(absolutePath).length === 3) {
                createObject(getApiName.bind(this.class)(this.context.path), this.class.privates.api, require(this.context.path));
            }
        } catch (e) {
            this.class.privates.logger.error(e);
            this.class.privates.logger.debug('remove route');
            deleteObject(getApiName.bind(this.class)(this.context.path), this.class.privates.api);
        }
        this.class.privates.logger.debug('update api ' + this.context.path);
    }
};

/**
 * @function realodContext
 * @private
 * @param {String} path
 * @return {Object}
 */
const reloadContext = function (path) {
    return {
        path: path,
        onReload: onReload
    };
};

const onWatchError = function () {
    // not implemented yet
};

/**
 * @function setReload
 * @private
 * @param {String} path
 * @return {Object}
 */
const setReload = function (path) {
    const ctx = reloadContext(path);
    const w = FILE.watch(path, {'encoding': 'buffer'}, ctx.onReload.bind({
        context: ctx,
        class: this
    }));
    // fix win32 crash on delete watching folder
    w.on('error', onWatchError);
    this.privates.watcherCache.push(w);
};

/**
 * @function watchFolder
 * @private
 * @param {String} path
 */
const watchFolder = function (path) {
    const w = FILE.watch(path);
    w.watchingPath = path;
    w.on('change', onChangeFolder.bind({
        watcher: w,
        class: this
    }));
    // fix win32 crash on delete watching folder
    w.on('error', onWatchError);
    this.privates.watcherCache.push(w);
};

/**
 * when a watcher folder changes
 * @event onChangeFolder
 * @private
 * @param {String} eve
 * @param {String} filename
 */
const onChangeFolder = function (eve, filename) {
    if (eve !== 'rename') {
        return;
    }
    const newfile = FILE.joinPath(this.watcher.watchingPath, filename);
    // look only for javascript files
    if (FILE.extname(newfile) !== '.js') {
        return;
    }
    this.class.privates.logger.debug('found ext: ' + FILE.extname(newfile));
    const CTX = this;
    FILE.getStatsAsync(newfile, function (err, stat) {
        setTimeout(function () { CTX.class.privates.logger.debug(CTX.class.privates.api); }, 50);
        if (err) {
            // file was deleted do unregister
            deleteObject(getApiName.bind(CTX.class)(newfile), CTX.class.privates.api);
        } else {
            if (stat.isDirectory(newfile)) {
                watchFolder.bind(CTX.class)(newfile);
                return;
            }
            // file was added do register
            try {
                if (PATH.extname(absolutePath) === '.js' && PATH.extname(absolutePath).length === 3) {
                    createObject(getApiName.bind(CTX.class)(newfile), CTX.class.privates.api, require(newfile));
                }
            } catch (e) {
                CTX.class.privates.logger.error(e);
            }
            setReload.bind(CTX.class)(newfile);
        }
    });
};

/**
 * load all API routes
 * @function readApiDirs
 * @private
 * @param {String} path
 */
const readApiDirs = function (path) {
    const apidirs = FILE.readDir(path, {'encoding': 'utf-8'});
    for (let i = 0; i < apidirs.length; i++) {
        const absolutePath = FILE.joinPath(path, apidirs[i]);
        const stats = FILE.getStats(absolutePath);
        if (stats.isDirectory()) {
            watchFolder.bind(this)(absolutePath);
            readApiDirs.bind(this)(absolutePath);
        } else {
            if (PATH.extname(absolutePath) === '.js' && PATH.extname(absolutePath).length === 3) {
                createObject(getApiName.bind(this)(absolutePath), this.privates.api, require(absolutePath));
            }
            if (this.privates.cfg.server.api.reload) {
                setReload.bind(this)(absolutePath);
            }
        }
        this.privates.logger.debug(absolutePath);
    }
};

/**
 * convert the url to file path
 * @function getFileName
 * @private
 * @param {Srting} path
 * @return {String}
 */
const getFileName = function (path) {
    this.privates.logger.debug('convert url to filepath ' + path);
    let result = '';
    let apifound = false;
    for (let i = 0; i < path.length; i++) {
        let tmpPath = path[i];
        if (tmpPath === this.privates.cfg.server.api.routealias && !apifound) {
            tmpPath = this.privates.cfg.server.api.routepath.split('/').join(FILE.pathSep);
            apifound = true;
        }
        result += tmpPath + FILE.pathSep;
    }
    if (result.length > 2) {
        result = result.substr(0, result.length - 1) + '.js';
    } else {
        this.privates.logger.warning('no valid route path');
        result = '';
    }
    result = this.privates.cfg.serverdir + result;
    return result;
};

/**
 * check if valid Route
 * @function checkRoute
 * @private
 * @param {String} path
 * @param {String} method
 * @return {Function}
 */
const checkRoute = function (path, method) {
    let result;
    this.privates.logger.debug('try to get route ' + method + ' ' + getApiName.bind(this)(path));
    // load the file and check the method
    var r = getObject(getApiName.bind(this)(path), this.privates.api);
    if (r !== null && typeof r[method] === 'function') {
        result = r[method];
    } else {
        this.privates.logger.warning('route is notallowed ' + path + ' ' + method);
        return NOTALLOWED;
    }
    return result;
};

/**
 * @function withoutParameter
 * @private
 * @param {String} path
 * @return {Object}
 */
const withoutParameter = function (path) {
    const POS = path.indexOf('?');
    this.privates.logger.debug('find ? on pos ' + POS + ' => ' + path);
    return POS > 0 ? path.substr(0, POS) : path;
};

/**
 * check if Method and Route is allowed
 * @function checkIfAllowed
 * @private
 * @param {Object} res Node Response Object
 * @param {String} method Http Method
 * @param {String} route Routepath
 * @return {Boolean} allowed?
 */
const checkIfAllowed = function (res, method, route) {
    if (this.privates.cfg.server.api.allowedMethods.indexOf(method) === -1 ||
        route === NOTALLOWED) {
        return false;
    }
    return true;
};

/**
 * check if Route is valid
 * @function checkIfInvalidRoute
 * @private
 * @param {Object} res Node Response Object
 * @param {String} path path to file
 * @param {String} route routepath
 * @return {Boolean} valid?
 */
const checkIfInvalidRoute = function (res, path, route) {
    if (typeof path !== typeof [] || path.length < 2 ||
        path[1] !== this.privates.cfg.server.api.routealias || route === INVALIDROUTE) {
        return false;
    }
    return true;
}

/**
 * runs a Route ans send Response
 * @function executeRoute
 * @private
 * @param {String} route
 * @param {Object} req
 * @param {Object} res
 * @param {Function} doafter
 * @param {Function} next
 */
const executeRoute = function (route, req, res, doafter, next) {
    const CTX = this;
    route(req, res, function (result) {
        CTX.privates.logger.debug('parse route result');
        let content = '';
        switch (CTX.privates.cfg.server.messageFormat) {
            case 'json':
                content = 'application/json';
                break;
            case 'string':
                content = 'text/plain';
                break;
            default:
        }

        try {
            REQU.okWithData(req, res, content, JSON.stringify(result));
        } catch (ex) {
            CTX.privates.logger.error(ex);
        }

        CTX.privates.logger.debug('sending result');
        if (typeof doafter === 'function') {
            doafter(req, res, result, function () {
                next();
            });
        } else {
            next();
        }
    });
};

/**
 * execute before handler in Route when exists
 * @function executeRouteAndDobefore
 * @private
 * @param {Function} dobefore
 * @param {String} route
 * @param {Object} req
 * @param {Object} res
 * @param {Function} doafter
 * @param {Function} next
 */
const executeRouteAndDobefore = function (dobefore, route, req, res, doafter, next) {
    const CTX = this;
    dobefore(req, res, function () {
        executeRoute.bind(CTX)(route, req, res, doafter, next);
    });
};

/**
 * initialize API Files watching
 * @function initWatching
 * @private
 */
const initWatching = function () {
    if (!this.privates.watching) {
        watchFolder.bind(this)(
            FILE.joinPath(this.privates.cfg.serverdir, this.privates.cfg.server.api.routepath));
        readApiDirs.bind(this)(
            FILE.joinPath(this.privates.cfg.serverdir, this.privates.cfg.server.api.routepath));
        this.privates.watching = true;
    }
};

/**
 * stop watching API Files
 * @function stopWatching
 * @private
 */
const stopWatching = function () {
    if (this.privates.watching) {
        for (let i = 0; i < this.privates.watcherCache.length; i++) {
            this.privates.watcherCache[i].close();
        }
        this.privates.watcherCache = [];
        this.privates.watching = false;
    }
};

class DynamicApiExtension {
    constructor (cfg, logger) {
        this.privates = {
            cfg: cfg,
            logger: logger,
            watching: false,
            watcherCache: [],
            api: []
        };
    }
    /**
     * handle a Request over Dynamic API
     * @function request
     * @param {Object} req Node Request Object
     * @param {Object} res Node Response Object
     * @param {Function} next Connect next Callback
     */
    request (req, res, next) {
        initWatching.bind(this)();

        const PATH     = withoutParameter.bind(this)(req.url).split('/');
        const FILENAME = getFileName.bind(this)(PATH);
        const METHOD   = req.method;
        const ROUTE    = checkRoute.bind(this)(FILENAME, METHOD);
        const DOBEFORE = checkRoute.bind(this)(FILENAME, 'BEFORE');
        const DOAFTER  = checkRoute.bind(this)(FILENAME, 'AFTER');

        if (checkIfAllowed.bind(this)(res, METHOD, ROUTE) === false) {
            next();
            return;
        }
        if (checkIfInvalidRoute.bind(this)(res, PATH, ROUTE) === false) {
            next();
            return;
        }

        this.privates.logger.debug('execute route method');
        if (typeof DOBEFORE === 'function') {
            executeRouteAndDobefore.bind(this)(DOBEFORE, ROUTE, req, res, DOAFTER, next);
        } else {
            executeRoute.bind(this)(ROUTE, req, res, DOAFTER, next);
        }
    }

    shutdown () {
        stopWatching.bind(this)();
    }
}
module.exports = DynamicApiExtension;
