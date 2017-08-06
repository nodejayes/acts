/**
 * starts multiple Instances of the Server when Cluster Mode is on
 * @module ActsCluster
 * @author Markus Gilg
 * @requires node_cluster
 * @requires node_os
 * @requires Logfile
 * @requires Configloader
 * @requires ObjectHelper
 * @requires ServerModule
 */
'use strict';

/**
 * Node Cluster Modul
 * @const {Object} CLUSTER
 * @private
 */
const CLUSTER = require('cluster');
/**
 * Node OS Modul
 * @const {Object} OS
 * @private
 */
const OS      = require('os');
/**
 * Logfile Namespace
 * @const {Object} LOGFILE
 * @private
 */
const LOGFILE = require('./logfile.module');
/**
 * Server Configuration
 * @const {Object} CFG
 * @private
 */
const CFG     = require('./configloader.module');
/**
 * ObjectHelper Namespace
 * @const {Object} OBJHELP
 * @private
 */
const OBJHELP = require('./../common/object.helper');
/**
 * Server Module Namespace
 * @const {Object} SERVER
 * @private
 */
const SERVER = require('./server.module');

/**
 * Logfile Instance Reference
 * @prop {Object} _logger
 * @private
 */
let _logger = null;

/**
 * restart Cluster Core when died
 * @event clusterCoreDied 
 * @private
 */
const clusterCoreDied = function (worker) {
  _logger.debug('worker ' + worker.process.pid + ' died, try to restart...');
  this.fork();
};

/**
 * log info when Cluster Cor goes online
 * @event clusterCoreOnline 
 * @private
 */
const clusterCoreOnline = function (worker) {
  _logger.info('worker ' + worker.process.pid + ' is online');
};

/**
 * init a Cluster or starts only one thread
 * @function initClusterCores
 * @private
 */
const initClusterCores = function () {
    // take config cores or cpu cores when config cores bigger
    const cpus = CFG.server.cluster.worker > OS.cpus().length ? OS.cpus().length : CFG.server.cluster.worker;
    if (cpus < CFG.server.cluster.worker) {
        _logger.info('to many workers reduce to cpu count');
    }
    _logger.debug('i want to start ' + cpus + ' worker');

    for (let i = 0; i < cpus; i++) {
        CLUSTER.fork();
    }

    CLUSTER.on('online', clusterCoreOnline);
    CLUSTER.on('death', clusterCoreDied.bind(CLUSTER));
};

class ActsCluster {
    constructor (workdir, cfg, plugins) {
        // overwrite cfg from input
        if (cfg) {
            OBJHELP.objectCombine(CFG, cfg);
        }
        CFG.serverdir = workdir;

        LOGFILE.init({
            logfilepath: CFG.server.logfile.file,
            maxfilesize: CFG.server.logfile.maxsize,
            loglevel: CFG.server.logfile.level
        });
        _logger = LOGFILE.getInstance();
        _logger.debug('initialization successfully');

        this.SERVER = new SERVER(CFG, plugins, _logger);
    }

    /**
     * running the Cluster when Cluster Mode is enabled
     * @function start
     * @param {Function} cb callback when Server is started 
     */
    start (cb) {
        if (CFG.server.cluster.active) {
            try {
                if (CLUSTER.isMaster) {
                    _logger.debug('clustermode active');
                    initClusterCores();
                } else {
                    this.SERVER.start(cb);
                }
            } catch (ex) {
                _logger.error(ex);
            }
        } else {
            _logger.debug('clustermode inactive, start one thread');
            this.SERVER.start(cb);
        }
    }
}
module.exports = ActsCluster;