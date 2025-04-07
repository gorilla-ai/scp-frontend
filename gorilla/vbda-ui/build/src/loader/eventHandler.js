'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadEventHandler = loadEventHandler;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

var log = require('loglevel').getLogger('vbda/loader/handler');

function loadEventHandler(cfg) {
    var handlers = {};
    _lodash2.default.map(cfg.dt, function (_ref, dtName) {
        _objectDestructuringEmpty(_ref);

        _lodash2.default.set(cfg.dt, dtName + '.handler', {});
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
    });
    log.info('Handlers Loaded', handlers);
    return _objectPathImmutable2.default.set(cfg, 'handlers', handlers);
}

exports.default = {
    loadEventHandler: loadEventHandler
};