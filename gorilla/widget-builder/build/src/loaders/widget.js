'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.setupConfigService = setupConfigService;
exports.setWidgetLocales = setWidgetLocales;
exports.getWidgetLocales = getWidgetLocales;
exports.setWidgetDependency = setWidgetDependency;
exports.loadWidget = loadWidget;
exports.loadWidgetSync = loadWidgetSync;
exports.loadSource = loadSource;
exports.loadConfigById = loadConfigById;
exports.loadWidgetConfigByUrl = loadWidgetConfigByUrl;
exports.loadDataWithQueryConfig = loadDataWithQueryConfig;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _reactUi = require('react-ui');

var _reactUi2 = _interopRequireDefault(_reactUi);

var _reactChart = require('react-chart');

var _reactChart2 = _interopRequireDefault(_reactChart);

var _ajaxHelper = require('react-ui/build/src/utils/ajax-helper');

var _ajaxHelper2 = _interopRequireDefault(_ajaxHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
// import Babel from 'babel-core'


var log = require('loglevel').getLogger('loader');

var CONFIG_SERVICE = '/api/config_service/configurations';
var lng = 'zh';

function setupConfigService(url) {
    CONFIG_SERVICE = url + '/config_service/configurations';
}
var ALL_DEPENDENCY = {};

function setWidgetLocales(locale) {
    lng = locale;
}

function getWidgetLocales() {
    return lng;
}

function setWidgetDependency(dependency) {
    _lodash2.default.forEach(dependency, function (dependency, name) {
        log.info('dependency setup ', name);
    });
    ALL_DEPENDENCY = dependency;
    ALL_DEPENDENCY['default'] = {
        Dashboard: require('../widgets/Dashboard').default,
        alarm: require('../widgets/alarm').default
    };
}

function loadWidget(fileName) {
    try {
        var requireFile = loadWidgetSync(fileName);
        return new _bluebird2.default(function (resolve) {
            resolve(requireFile);
        });
    } catch (e) {
        log.error(e);
        throw { message: e.message ? e.message : 'Load Widget [' + fileName + '] fail' };
    }
}

function loadWidgetSync(fileName) {
    try {
        var requireFile = void 0;
        var packageName = fileName.split('/')[0];
        var widgetName = fileName.split('/')[1];

        if (!_lodash2.default.isEmpty(ALL_DEPENDENCY)) {
            requireFile = ALL_DEPENDENCY[packageName][widgetName];
        } else if (_lodash2.default.startsWith(fileName, 'react-ui/')) {
            requireFile = _reactUi2.default[fileName.split('/')[1]];
        } else if (_lodash2.default.startsWith(fileName, 'react-chart/')) {
            requireFile = _reactChart2.default[fileName.split('/')[1]];
        } else if (_lodash2.default.startsWith(fileName, 'default/')) {
            requireFile = require('../widgets/' + fileName.split('/')[1]).default;
        } else {
            // requireFile = require('widgetsPath/' + fileName).default;
            throw { message: 'Widget [' + fileName + '] not found' };
        }
        if (_lodash2.default.isNil(requireFile)) throw { message: 'Widget [' + fileName + '] not found'
            // log.info(`Widget Loaded [${fileName}]`)
        };requireFile.displayName = fileName;
        return requireFile;
    } catch (e) {
        log.error(e);
        throw { message: e.message ? e.message : 'Load Widget [' + fileName + '] fail' };
    }
}

/**
 * @param query
 * @param query.url
 * @param query.data
 * @param query.type
 * @param isMulti boolean
 * @param selectKey
 * @param key
 * @returns {*}
 */
function loadSource(_ref) {
    var query = _ref.query,
        _ref$isMulti = _ref.isMulti,
        isMulti = _ref$isMulti === undefined ? false : _ref$isMulti,
        _ref$selectKey = _ref.selectKey,
        selectKey = _ref$selectKey === undefined ? null : _ref$selectKey;
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    // if (!_.isNil(query.data) && !_.isEmpty(query.data)) {
    if (_lodash2.default.isNil(query.data) || _lodash2.default.isEmpty(query.data)) query.data = {};
    if (isMulti) {
        var formJson = _lodash2.default.mapValues(query.data, function (v, k) {
            if (v.type === 'file' || _lodash2.default.isString(v)) {
                return v;
            } else {
                return JSON.stringify(v);
            }
        });
        return _ajaxHelper2.default.multi(query.url, formJson).then(function (data) {
            return key ? _defineProperty({}, key, data) : data;
        });
    } else {
        var type = query.type ? query.type : 'post';
        type = _lodash2.default.upperCase(type);
        var data = query.data;
        var contentType = null;
        switch (type) {
            case 'GET':
                break;
            default:
                //others
                data = JSON.stringify(data);
                contentType = 'application/json';
        }
        var req = {
            contentType: contentType,
            type: type,
            url: query.url,
            data: data
        };
        return _ajaxHelper2.default.one(req).then(function (data) {
            if (selectKey) {
                data = _lodash2.default.get(data, selectKey);
            }
            return key ? _defineProperty({}, key, data) : data;
        });
    }
    // }
    // else {
    // const defaultReq = {
    //     contentType: 'application/json',
    //     type: query.type ? query.type : 'get'
    // }
    // const req = _.assign(defaultReq, query)
    // return ah.one(req)
    //     .then(data => {
    //         if(selectKey){
    //             data = _.get(data,selectKey)
    //         }
    //         log.info(data)
    //         return key?{[key]:data}:data
    //     })
    // }
}

/**
 * @param id
 * @returns {*}
 */
function loadConfigById(id) {
    var type = 'widget';
    if (id.indexOf('dashboard/') !== -1) {
        id = _lodash2.default.replace(id, 'dashboard/', '');
        type = 'dashboard';
    }
    return _ajaxHelper2.default.one(CONFIG_SERVICE + '/' + type + '?id=' + id).then(function (data) {
        return JSON.parse(data.data);
        // return data
    });
}
/**
 * @param url
 * @returns {*}
 */
function loadWidgetConfigByUrl(url) {
    return _ajaxHelper2.default.one(url).then(function (data) {
        return data;
    });
}

// export function loadStoreData(config) {//針對單一store load，可先判斷是否重新讀取，取得的值放在哪也應由呼叫的一方判斷
//     log.info('load store data BEGIN')
//     const {selectKey, query} = config
//     const type = _.upperCase(query.type ? query.type : (query.data ? "POST" : 'GET'))
//     let ajaxRequst = {
//         type,
//         url: query.url
//     }
//     switch (type) {
//         case 'GET':
//         default:
//             break;
//         case 'POST': //others
//             ajaxRequst = {
//                 ...ajaxRequst,
//                 data: JSON.stringify(query.data),
//                 contentType: 'application/json'
//             }
//             break;
//     }
//     log.info(`load store with`, ajaxRequst)
//     return ah.one(ajaxRequst, {showProgress: false})
//         .then(data => {
//             if (selectKey) {
//                 data = _.get(data, selectKey)
//             }
//             log.info(`store loaded success.`, data)
//             return data
//         })
//         .catch((error) => {
//             log.error(`store loaded fail.`, error)
//             throw error
//         })
// }
/**
 *
 * @param {object} config
 * @param {object} [config.selectKey]
 * @param {object} config.query - ajax query format
 * @param {string} config.query.url - request url
 * @param {string} config.query.type - request type 'get' | 'post'
 * @param {string} [config.query.data] - request body
 * @param options
 * @returns {Promise}
 */
function loadDataWithQueryConfig(config) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    //針對單一store load，可先判斷是否重新讀取，取得的值放在哪也應由呼叫的一方判斷
    log.info('Load Data Begin');
    var selectKey = config.selectKey,
        query = config.query;
    var _options$showProgress = options.showProgress,
        showProgress = _options$showProgress === undefined ? false : _options$showProgress;

    var type = _lodash2.default.upperCase(query.type ? query.type : query.data ? "POST" : 'GET');
    var ajaxRequest = {
        type: type,
        url: query.url
    };
    switch (type) {
        case 'GET':
        default:
            ajaxRequest = _extends({}, ajaxRequest, {
                data: query.data
            });
            break;
        case 'POST':
            //others
            ajaxRequest = _extends({}, ajaxRequest, {
                data: JSON.stringify(query.data),
                contentType: 'application/json'
            });
            break;
    }
    log.info('Load Data With', ajaxRequest);
    return _ajaxHelper2.default.one(ajaxRequest, { showProgress: showProgress }).then(function (data) {
        if (selectKey) {
            data = _lodash2.default.get(data, selectKey);
        }
        log.info('Load Data Success.', data);
        return data;
    }).catch(function (error) {
        log.error('Load Data Failed.', error);
        throw error;
    });
}

exports.default = {
    load: loadWidget,
    loadWidgetSync: loadWidgetSync,
    loadSource: loadSource,
    loadConfigById: loadConfigById,
    loadWidgetConfigByUrl: loadWidgetConfigByUrl,
    loadDataWithQueryConfig: loadDataWithQueryConfig,
    setWidgetDependency: setWidgetDependency,
    setWidgetLocales: setWidgetLocales,
    getWidgetLocales: getWidgetLocales
};