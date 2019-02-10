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
const COMPRESS   = require('compression');
const HELM       = require('helmet');
const _          = require('lodash');

const FileSys     = require('./../common/filesystem.helper');
const Request     = require('./../common/request.helper');
const Websocket   = require('./../extensions/websocket.ext');
const Cors        = require('./../extensions/cors.ext');
const BodyParser  = require('./../extensions/parser.ext');
const Redirect    = require('./../extensions/redirect.ext');
const StaticFile  = require('./../extensions/staticfiles.ext');
const DynamicApi  = require('./../extensions/dynamicapi.ext');
const Access      = require('./../extensions/accesshandler.ext');

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
        this.privates.logger.debug('no plugins loaded');
        return;
    }
    for (let i = 0, length = plugins.length; i < length; i++) {
        const plugin = plugins[i];
        try {
            let copyCfg = _.clone(cfg);
            let copyPluginCfg = _.clone(plugin.cfg);
            require(plugin.src)(server, Object.freeze(copyCfg), Object.freeze(copyPluginCfg));
            this.privates.logger.debug('plugin ' + plugin.src + ' successfully loaded');
        } catch (err) {
            this.privates.logger.debug('error while load plugin ' + plugin.src);
            this.privates.logger.error(err);
        }
    }
};

/**
 * read the certificate Information when using ssl
 * @function handleSsl
 * @private
 */
const handleSsl = function () {
    if (this.privates.cfg.server.ssl.usessl) {
        this.privates.http = require('https');
        this.privates.http.globalAgent.maxSockets = Infinity;
        const cas = [];
        for (var i = 0, len = this.privates.cfg.server.ssl.certificationauthority.length; i < len; i++) {
            const obj = this.privates.cfg.server.ssl.certificationauthority[i];
            cas.push(FileSys.getFileContent(obj));
        }
        this.privates.ssloptions = {
            ca: cas,
            cert: FileSys.getFileContent(this.privates.cfg.server.ssl.certificate),
            key: FileSys.getFileContent(this.privates.cfg.server.ssl.privatekey)
        };
    }
};

/**
 * compress in gzip when activate
 * @event handleCompress
 * @private
 */
const handleCompress = function (req, res, next) {
    if (req.headers['accept-encoding'] === 'compress, gzip') {
        COMPRESS(this.privates.cfg)(req, res, next);
    } else {
        next();
    }
};

/**
 * load the Default Modules
 * @method initStandardModules
 * @private
 */
const initStandardModules = function () {

    // Authentication
    if (this.privates.options !== null && typeof this.privates.options.authentication === 'function') {
        this.privates.app.use(this.privates.options.authentication);
    }

    // helmet security
    this.privates.app.use(HELM());

    // Cors Module first
    const TMPCORS = new Cors(this.privates.cfg, this.privates.logger);
    this.privates.app.use(TMPCORS.checkRequest.bind(TMPCORS));

    // load redirect module
    const TMPREDIRECT = new Redirect(this.privates.cfg, this.privates.logger);
    this.privates.app.use(TMPREDIRECT.handle.bind(TMPREDIRECT));

    // parse request bodys
    const TMPPARSER = new BodyParser(this.privates.cfg, this.privates.logger);
    this.privates.app.use(TMPPARSER.parse.bind(TMPPARSER));

    // gzip compression
    if (this.privates.cfg.server.compress) {
        this.privates.app.use(handleCompress.bind(this));
    }

    // load plugins
    loadPlugins.bind(this)(this.privates.plugins, this.privates.app, this.privates.cfg);

    // use folder for static files from config file
    const TMPSTATICFILE = new StaticFile(this.privates.cfg, this.privates.logger);
    this.privates.app.use(TMPSTATICFILE.request.bind(TMPSTATICFILE));

    // use dynamic api
    this.privates.dynamicapi = new DynamicApi(this.privates.cfg, this.privates.logger);
    this.privates.app.use(this.privates.dynamicapi.request.bind(this.privates.dynamicapi));

    // redirect not handled requests to the index.html
    // this handle scenarios with angular router
    this.privates.app.use((req, res, next) => {
        try {
            const INDEX_FILE = FileSys.joinPath(this.privates.cfg.serverdir, this.privates.cfg.server.webroot, 'index.html');
            const CONTENT = FileSys.getFileContent(INDEX_FILE);
            Request.okWithData(req, res, 'text/html', CONTENT.toString('utf-8'));
        } catch (err) {
            next();
        }
    });

    if (this.privates.options.hook) {
        this.privates.app.use(this.privates.options.hook);
    }
};

/**
 * log server Infos of current running Server
 * @event serverRunning
 * @private
 */
const serverRunning = function () {
    const FOLDER = 'Server Folder: ' + this.class.privates.cfg.serverdir;
    const SERVER = 'Server running ' + (this.class.privates.cfg.server.ssl.usessl ? 'https' : 'http') + '://' + this.class.privates.cfg.server.address + ':' + this.class.privates.cfg.server.port;
    if (this.class.privates.cfg.server.verbose === true) {
        console.info(FOLDER);
    }
    this.class.privates.logger.info(FOLDER);
    if (this.class.privates.cfg.server.verbose === true) {
        console.info(SERVER);
    }
    this.class.privates.logger.info(SERVER);
    if (typeof this.method === 'function') {
        this.method();
    }
};

/**
 * handle Client Connect
 * @event handleClientConnect
 * @private
 * @param {Object} socket Node Socket Object
 */
const handleClientConnect = function (socket) {
    this.privates.logger.debug('socket connect ' + socket.remoteAddress);
    this.privates.accessInstance.onClientConnect(socket);
};

/**
 * handle CLient Errors
 * @event handleClientError
 * @private
 * @param {Object} err Error Object
 * @param {Object} socket Node Socket Object
 */
const handleClientError = function (err, socket) {
    this.privates.logger.debug('client create a error');
    this.privates.logger.warning(err);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
};

/**
 * handle Server was closed
 * @event handleServerClose
 * @private
 */
const handleServerClose = function () {
  // nothing to do for now
};

/**
 * boot the Server
 * @function startServer
 * @param {Function} cb callback when Server is started
 */
const startServer = function (cb) {
    this.privates.logger.debug('try to start server');
    try {
        //start Server
        let server;
        if (this.privates.cfg.server.ssl.usessl) {
            this.privates.logger.debug('ssl was enabled', this.privates.ssloptions);
            server = this.privates.http.createServer(this.privates.ssloptions, this.privates.app);
        } else {
            server = this.privates.http.createServer(this.privates.app);
        }

        // create sockets
        if (this.privates.cfg.server.websockets.usewebsockets && this.privates.socketio === null) {
            this.privates.logger.debug('websockets was enabled');
            this.privates.socketio = IO(server);
            const TMPWEBSOCKETS = new Websocket(this.privates.cfg, this.privates.logger);
            this.privates.socketio.on('connection', TMPWEBSOCKETS.setEventsOnSocket.bind(TMPWEBSOCKETS));
        }

        // handle Server Events
        server.on('clientError', handleClientError.bind(this));
        server.on('close', handleServerClose.bind(this));
        server.on('connection', handleClientConnect.bind(this));

        this.privates.app.use(Request.notFound);

        server.listen(this.privates.cfg.server.port, this.privates.cfg.server.address, serverRunning.bind({
            method: cb,
            class: this
        }));
        return server;
    } catch (ex) {
        this.privates.logger.error(ex);
    }
};

class ActsServer {
    constructor (cfg, plugins, logger) {
        this.privates = {
            app: CONNECT(),
            http: require('http'),
            logger: logger,
            cfg: cfg,
            plugins: plugins,
            accessInstance: new Access(cfg, logger),
            socketio: null,
            ssloptions: null,
            dynamicapi: null
        };

        this.privates.http.globalAgent.maxSockets = Infinity;

        const WEBROOT_PATH = FileSys.joinPath(cfg.serverdir, cfg.server.webroot);
        const API_PATH = FileSys.joinPath(cfg.serverdir, cfg.server.api.routepath);
        const SOCKET_PATH = FileSys.joinPath(cfg.serverdir, cfg.server.websockets.socketpath);
        let paths = [WEBROOT_PATH, API_PATH, SOCKET_PATH];
        let i = 0;
        while (i < paths.length) {
            let checkPath = paths[i];
            if (!FileSys.exists(checkPath)) {
                FileSys.createDirectoryRecursive(checkPath);
            }
            i++;
        }
        handleSsl.bind(this)();
    }

    /**
     * Start the Server
     * @function start
     * @param {Function} cb callback when Server is started
     */
    start (cb, opts) {
        this.privates.options = opts || null;
        initStandardModules.bind(this)();
        return startServer.bind(this)(cb);
    }

    /**
     * delete all Submodules
     *
     * @memberof ActsServer
     */
    shutdown () {
        if (this.privates) {
            this.privates.dynamicapi.shutdown();
            delete this.privates;
        }
    }
}
module.exports = ActsServer;
