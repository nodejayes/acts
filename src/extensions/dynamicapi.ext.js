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

const NOTALLOWED   = 'notallowed';
const INVALIDROUTE = 'invalidroute';

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
 * true when the server is watching the API Files
 * @prop {Boolean} _watching
 * @private
 */
let _watching = false;
/**
 * Array with watcher they watching API Files
 * @prop {Array} _watcherCache
 * @private
 */
let _watcherCache = [];
/**
 * API reference
 * @prop {Array} _api
 * @private
 */
let _api = [];

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

const onWatchError = function () {
  // not implemented yet
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
    const newfile = FILE.joinPath(this.watchingPath, filename);
    // look only for javascript files
    if (FILE.extname(newfile) !== '.js') {
        return;
    }
    _logger.debug('found ext: ' + FILE.extname(newfile));
    FILE.getStatsAsync(newfile, function (err, stat) {
        setTimeout(function () { _logger.debug(_api); }, 5000);
        if (err) {
            // file was deleted do unregister
            deleteObject(getApiName(newfile), _api);
        } else {
            if (stat.isDirectory(newfile)) {
                watchFolder(newfile);
                return;
            }
            // file was added do register
            try {
                createObject(getApiName(newfile), _api, require(newfile));
            } catch (e) {
                _logger.error(e);
            }
            setReload(newfile);
        }
    });
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
    const tmpFolder = FILE.joinPath(_cfg.serverdir, _cfg.server.api.routepath)
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
 * @function watchFolder
 * @private
 * @param {String} path
 */
const watchFolder = function (path) {
    const w = FILE.watch(path);
    w.watchingPath = path;
    w.on('change', onChangeFolder.bind(w));
    // fix win32 crash on delete watching folder
    w.on('error', onWatchError);
    _watcherCache.push(w);
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
            watchFolder(absolutePath);
            readApiDirs(absolutePath);
        } else {
            createObject(getApiName(absolutePath), _api, require(absolutePath));
            if (_cfg.server.api.reload) {
                setReload(absolutePath);
            }
        }
        _logger.debug(absolutePath);
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
    _logger.debug('convert url to filepath ' + path);
    let result = '';
    let apifound = false;
    for (let i = 0; i < path.length; i++) {
        let tmpPath = path[i];
        if (tmpPath === _cfg.server.api.routealias && !apifound) {
            tmpPath = _cfg.server.api.routepath.split('/').join(FILE.pathSep);
            apifound = true;
        }
        result += tmpPath + FILE.pathSep;
    }
    if (result.length > 2) {
        result = result.substr(0, result.length - 1) + '.js';
    } else {
        _logger.warning('no valid route path');
        result = '';
    }
    result = _cfg.serverdir + result;
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
    _logger.debug('try to get route ' + method + ' ' + getApiName(path));
    // load the file and check the method
    var r = getObject(getApiName(path), _api);
    if (r !== null && typeof r[method] === 'function') {
        result = r[method];
    } else {
        _logger.warning('route is notallowed ' + path + ' ' + method);
        return NOTALLOWED;
    }
    return result;
};

/**
 * @event onReload
 * @private
 * @param {Object} eve
 */
const onReload = function (eve) {
    if (eve === 'change') {
        delete require.cache[this.path];
        try {
            createObject(getApiName(this.path), _api, require(this.path));
        } catch (e) {
            _logger.error(e);
            _logger.debug('remove route');
            deleteObject(getApiName(this.path), _api);
        }
        _logger.debug('update api ' + this.path);
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
        'path': path,
        'onReload': onReload
    };
};

/**
 * @function setReload
 * @private
 * @param {String} path
 * @return {Object}
 */
const setReload = function (path) {
    const ctx = reloadContext(path);
    const w = FILE.watch(path, {'encoding': 'buffer'}, ctx.onReload.bind(ctx));
    // fix win32 crash on delete watching folder
    w.on('error', onWatchError);
    _watcherCache.push(w);
};

/**
 * @function withoutParameter
 * @private
 * @param {String} path
 * @return {Object} 
 */
const withoutParameter = function (path) {
    let pos = path.indexOf('?');
    _logger.debug('find ? on pos ' + pos + ' => ' + path);
    return pos > 0 ? path.substr(0, pos) : path;
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
    if (_cfg.server.api.allowedMethods.indexOf(method) === -1 || 
        route === NOTALLOWED) {
        _logger.warning('no allowed method or route');
        REQU.notAllowedMethod(undefined, res);
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
        path[1] !== _cfg.server.api.routealias || route === INVALIDROUTE) {
        _logger.warning('invalid route path');
        REQU.notFound(undefined, res);
        return false;
    }
    return true;
}

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
  dobefore(req, res, function () {
    executeRoute(route, req, res, doafter, next);
  });
};

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
    route(req, res, function (result) {
        _logger.debug('parse route result');
        let content = '';
        switch (_cfg.server.messageFormat) {
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
            _logger.error(ex);
        }

        _logger.debug('sending result');
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
 * initialize API Files watching
 * @function initWatching
 * @private
 */
const initWatching = function () {
    if (!_watching) {
        watchFolder(
            FILE.joinPath(_cfg.serverdir, _cfg.server.api.routepath));
        readApiDirs(
            FILE.joinPath(_cfg.serverdir, _cfg.server.api.routepath));
        _watching = true;
    }
};

/**
 * stop watching API Files
 * @function stopWatching
 * @private
 */
const stopWatching = function () {
    if (_watching) {
        for (let i = 0; i < _watcherCache.length; i++) {
            _watcherCache[i].close();
        }
        _watcherCache = [];
        _watching = false;
    }
};

class DynamicApiExtension {
    constructor (cfg, logger) {
        _cfg = cfg;
        _logger = logger;
    }
    /**
     * handle a Request over Dynamic API
     * @function request
     * @param {Object} req Node Request Object
     * @param {Object} res Node Response Object
     * @param {Function} next Connect next Callback 
     */
    request (req, res, next) {
        initWatching();
        let path = withoutParameter(req.url).split('/');
        let filename = getFileName(path);
        let method = req.method;
        let route = checkRoute(filename, method);
        let dobefore = checkRoute(filename, 'BEFORE');
        let doafter = checkRoute(filename, 'AFTER');
        
        if (checkIfAllowed(res, method, route) === false) {
            return;
        }
        if (checkIfInvalidRoute(res, path, route) === false) {
            return;
        }

        _logger.debug('execute route method');
        if (typeof dobefore === 'function') {
            executeRouteAndDobefore(dobefore, route, req, res, doafter, next);
        } else {
            executeRoute(route, req, res, doafter, next);
        }
    }
}
module.exports = DynamicApiExtension;