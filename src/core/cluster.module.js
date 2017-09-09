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
 * restart Cluster Core when died
 * @event clusterCoreDied 
 * @private
 */
const clusterCoreDied = function (worker) {
  this.privates.logger.debug('worker ' + worker.process.pid + ' died, try to restart...');
  this.original.fork();
};

/**
 * log info when Cluster Cor goes online
 * @event clusterCoreOnline 
 * @private
 */
const clusterCoreOnline = function (worker) {
    this.privates.logger.info('worker ' + worker.process.pid + ' is online');
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
        this.privates.logger.info('to many workers reduce to cpu count');
    }
    this.privates.logger.debug('i want to start ' + cpus + ' worker');

    for (let i = 0; i < cpus; i++) {
        CLUSTER.fork();
    }

    CLUSTER.on('online', clusterCoreOnline.bind(this));
    CLUSTER.on('death', clusterCoreDied.bind({
        original: CLUSTER,
        privates: this.privates
    }));
};

class ActsCluster {
    constructor (workdir, cfg, plugins) {
        // overwrite cfg from input
        if (cfg) {
            OBJHELP.objectCombine(CFG, cfg);
        }
        CFG.serverdir = workdir;

        const LOG = new LOGFILE({
            logfilepath: CFG.server.logfile.file,
            maxfilesize: CFG.server.logfile.maxsize,
            loglevel: CFG.server.logfile.level
        });
        LOG.init();
        this.privates = {
            logger: LOG.getInstance(),
            authenticate: null,
            instances: []
        };
        this.privates.logger.debug('initialization successfully');

        this.SERVER = new SERVER(CFG, plugins, this.privates.logger);
    }

    /**
     * running the Cluster when Cluster Mode is enabled
     * @function start
     * @param {Function} cb callback when Server is started 
     */
    start (cb) {
        const OPTIONS = {
            authentication: this.privates.authenticate
        };
        if (CFG.server.cluster.active) {
            try {
                if (CLUSTER.isMaster) {
                    this.privates.logger.debug('clustermode active');
                    initClusterCores.bind(this)();
                } else {
                    this.privates.instances.push(this.SERVER.start(cb, OPTIONS));
                }
            } catch (ex) {
                this.privates.logger.error(ex);
            }
        } else {
            this.privates.logger.debug('clustermode inactive, start one thread');
            this.privates.instances.push(this.SERVER.start(cb, OPTIONS));
        }
    }

    /**
     * shutdown all Server instances
     * 
     * @memberof ActsCluster
     */
    shutdownInstances () {
        if (!this.privates.instances || this.privates.instances.length < 1) {
            return;
        }
        if (CFG.server.verbose === true) {
            console.info('server is shutting down...');
        }
        this.privates.instances.forEach(i => i.close());
        this.SERVER.shutdown();
        this.privates.authenticate = null;
    }

    /**
     * set the authentication method
     * 
     * @param {function} method 
     * @memberof ActsCluster
     */
    setAuthentication (method) {
        this.privates.authenticate = method;
    }
}
module.exports = ActsCluster;