/**
 * Server Modul
 * @module ActsServer
 * @author Markus Gilg
 * @requires node_http
 * @requires node_https
 * @requires npm_connect
 * @requires npm_socket.io
 * @requires FileSystemHelper
 * @requires RequestHelper
 */
'use strict';

const CONNECT    = require('connect');
const IO         = require('socket.io');
const COMPRESS   = require("compression");
const HELM       = require("helmet");

let Websockets = null;
let Cors       = null;
let BodyParser = null;
let Redirect   = null;
let StaticFile = null;
let DynamicApi = null;
let Access     = null;
let FileSys    = null;
let Request    = null;
let App        = null;

let _cfg        = null;
let _core       = null;
let _logger     = null;
let _socketio   = null;
let _ssloptions = null;
let _plugins    = null;
let _http       = require('http');
let _access     = null;

/**
 * try to load all Plugins
 * @function loadPlugins
 * @private
 * @param {Array} plugins Array of Plugins to load 
 * @param {Object} server Server Instance
 * @param {Object} cfg Server Configuration
 */
const loadPlugins = function (plugins, server, cfg) {
    if (typeof plugins !== typeof [] || plugins.length < 1) {
        _logger.debug("no plugins loaded");
        return;
    }
    for (let i = 0, length = plugins.length; i < length; i++) {
        const plugin = plugins[i];
        try {
            require(plugin)(server, cfg);
            _logger.debug("plugin " + plugin + " successfully loaded");
        } catch (err) {
            _logger.debug("error while load plugin " + plugin);
            _logger.error(err);
        }
    }
};

/**
 * read the certificate Information when using ssl
 * @function handleSsl
 * @private
 */
const handleSsl = function () {
    if (_cfg.server.ssl.usessl) {
        _http = require('https');
        const cas = [];
        for (var i = 0, len = _cfg.server.ssl.certificationauthority.length; i < len; i++) {
            const obj = _cfg.server.ssl.certificationauthority[i];
            cas.push(FileSys.getFileContent(obj));
        }
        _ssloptions = {
            ca: cas,
            cert: FileSys.getFileContent(_cfg.server.ssl.certificate),
            key: FileSys.getFileContent(_cfg.server.ssl.privatekey)
        };
    }
};

/**
 * load the Default Modules
 * @method initStandardModules
 * @private
 */
const initStandardModules = function () {

    // Authentication
    if (_options !== null && typeof _options.authentication === 'function') {
        App.use(_options.authentication);
    }

    // helmet security
    App.use(HELM());

    // Cors Module first
    let tmpCors = new Cors(_cfg, _logger);
    App.use(tmpCors.checkRequest);

    // load redirect module
    let tmpRedirect = new Redirect(_cfg, _logger);
    App.use(tmpRedirect.handle);

    // parse request bodys
    let tmpParser = new BodyParser(_cfg, _logger);
    App.use(tmpParser.parse);

    // gzip compression
    if (_cfg.server.compress) {
        App.use(handleCompress);
    }

    // load plugins
    loadPlugins(_plugins, App, _cfg);

    // use folder for static files from config file
    let tmpStaticFile = new StaticFile(_cfg, _logger);
    App.use(tmpStaticFile.request);

    // use dynamic api
    let tmpDynamicApi = new DynamicApi(_cfg, _logger);
    App.use(tmpDynamicApi.request);
};

/**
 * log server Infos of current running Server
 * @event serverRunning
 * @private
 */
const serverRunning = function () {
    let folder = 'Server Folder: ' + _cfg.serverdir;
    let server = 'Server running ' + (_cfg.server.ssl.usessl ? 'https' : 'http') + '://' + _cfg.server.address + ':' + _cfg.server.port;
    if (_cfg.server.verbose === true) {
        console.info(folder);
    }
    _logger.info(folder);
    if (_cfg.server.verbose === true) {
        console.info(server);
    }
    _logger.info(server);
    if (typeof this === 'function') {
        this();
    }
};

/**
 * handle Client Connect
 * @event handleClientConnect
 * @private
 * @param {Object} socket Node Socket Object 
 */
const handleClientConnect = function (socket) {
    _logger.debug('socket connect ' + socket.remoteAddress);
    _access.onClientConnect(socket);
};

/**
 * handle CLient Errors
 * @event handleClientError
 * @private
 * @param {Object} err Error Object
 * @param {Object} socket Node Socket Object 
 */
const handleClientError = function (err, socket) {
    _logger.debug('client create a error');
    _logger.warning(err);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
};

/**
 * handle Server was closed
 * @event handleServerClose
 * @private
 */
const handleServerClose = function () {
  _logger.debug('server is shutting down');
};

/**
 * compress in gzip when activate
 * @event handleCompress
 * @private
 */
const handleCompress = function (req, res, next) {
    if (req.headers['accept-encoding'] === 'compress, gzip') {
        COMPRESS(_cfg)(req, res, next);
    } else {
        next();
    }
};

let _options = null;

/**
 * boot the Server
 * @function startServer
 * @param {Function} cb callback when Server is started
 */
const startServer = function (cb) {
    _logger.debug('try to start server');
    try {
        //start Server
        let server;
        if (_cfg.server.ssl.usessl) {
            _logger.debug('ssl was enabled', _ssloptions);
            server = _http.createServer(_ssloptions, App);
        } else {
            server = _http.createServer(App);
        }

        // create sockets
        if (_cfg.server.websockets.usewebsockets && _socketio === null) {
            _logger.debug('websockets was enabled');
            _socketio = IO(server);
            let tmpWebsockets = new Websockets(_cfg, _logger);
            _socketio.on('connection', tmpWebsockets.setEventsOnSocket);
        }

        // handle Server Events
        server.on('clientError', handleClientError);
        server.on('close', handleServerClose);
        server.on('connection', handleClientConnect);

        App.use(Request.notFound);

        server.listen(_cfg.server.port, _cfg.server.address, serverRunning.bind(cb));
        return server;
    } catch (ex) {
        _logger.error(ex);
    }
};

class ActsServer {
    constructor (cfg, plugins, logger) {
        Websockets = require('./../extensions/websocket.ext');
        Cors       = require("./../extensions/cors.ext");
        BodyParser = require("./../extensions/parser.ext");
        Redirect   = require("./../extensions/redirect.ext");
        StaticFile = require("./../extensions/staticfiles.ext");
        DynamicApi = require("./../extensions/dynamicapi.ext");
        Access     = require("./../extensions/accesshandler.ext");
        FileSys    = require('./../common/filesystem.helper');
        Request    = require('./../common/request.helper');
        App        = CONNECT();

        _logger = logger;
        _cfg = cfg;
        _plugins = plugins;
        _access = new Access(_cfg, _logger);

        FileSys.createDirectoryRecursive(FileSys.joinPath(_cfg.serverdir, _cfg.server.webroot));
        FileSys.createDirectoryRecursive(FileSys.joinPath(_cfg.serverdir, _cfg.server.api.routepath));
        FileSys.createDirectoryRecursive(FileSys.joinPath(_cfg.serverdir, _cfg.server.websockets.socketpath));
        handleSsl();
    }

    /**
     * Start the Server
     * @function start
     * @param {Function} cb callback when Server is started
     */
    start (cb, opts) {
        _options = opts || null;
        initStandardModules();
        return startServer(cb);
    }

    /**
     * delete all Submodules
     * 
     * @memberof ActsServer
     */
    shutdown () {
        Websockets = null;
        Cors       = null;
        BodyParser = null;
        Redirect   = null;
        StaticFile = null;
        DynamicApi = null;
        Access     = null;
        FileSys    = null;
        Request    = null;
        App        = null;
    }
}
module.exports = ActsServer;