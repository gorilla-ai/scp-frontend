import _ from 'lodash'
import im from 'object-path-immutable'

let log = require('loglevel').getLogger('vbda/loader/handler')

export function loadEventHandler(cfg) {
    let handlers = {}
    _.map(cfg.dt, ({}, dtName) => {
        _.set(cfg.dt, `${dtName}.handler`, {})
        // try {
        //     let requireFile = require(`pluginsPath/handlers/${dtName}_editor`);
        //     _.set(cfg.dt, `${dtName}.handler.editor`, requireFile.default)
        // }
        // catch (e) {
        //     // log.info('loadEventHandler', `load ${dtName} edit handler fail`)
        //     try {
        //         let detailFile = require(`vbda/components/visualization/defaultEditor`);
        //         _.set(cfg.dt, `${dtName}.handler.editor`, detailFile.default)
        //     }
        //     catch (e) {
        //         log.error('loadEventHandler', `default editor missing`)
        //     }
        // }
        // try {
        //     let detailFile = require(`pluginsPath/handlers/${dtName}_detail`);
        //     _.set(cfg.dt, `${dtName}.handler.detail`, detailFile.default)
        // }
        // catch (e) {
        //     // log.info('loadEventHandler', `${dtName} detail handler not setting use default`)
        //     try {
        //         let detailFile = require(`vbda/components/visualization/defaultDetail`);
        //         _.set(cfg.dt, `${dtName}.handler.detail`, detailFile.default)
        //     }
        //     catch (e) {
        //         log.error('loadEventHandler', `default detail missing`)
        //     }
        // }
    })
    log.info('Handlers Loaded', handlers)
    return im.set(cfg, `handlers`, handlers)
}

export default {
    loadEventHandler: loadEventHandler
}