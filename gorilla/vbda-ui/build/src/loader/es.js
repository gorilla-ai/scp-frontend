"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.setupPrefix = setupPrefix;
exports.fulltextQueryParse = fulltextQueryParse;
exports.findAll = findAll;
exports.find = find;
exports.eventCreate = eventCreate;
exports.eventUpdate = eventUpdate;
exports.eventDelete = eventDelete;
exports.test = test;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _syntax = require("../parser/syntax");

var _ajaxHelper = require("react-ui/build/src/utils/ajax-helper");

var _ajaxHelper2 = _interopRequireDefault(_ajaxHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var log = require('loglevel').getLogger('vbda/loader/es');

var API_PREFIX = '/api';

function setupPrefix(prefix) {
    API_PREFIX = prefix;
}

function fulltextQueryParse(originalQueryString) {
    var queryString = '';
    var split = originalQueryString.split(" ");
    _lodash2.default.forEach(split, function (string) {
        switch (string) {
            case '&':
                queryString += ' AND';
                break;
            case '|':
                queryString += ' OR';
                break;
            case '':
                break;
            default:
                queryString += ' *' + string + '*';
                break;
        }
    });
    return queryString;
}

function findAll(originalQuery, searchCfg, dtId, dsId, apiPrefix) {
    // let queryString = ''
    // let originalQueryString = originalQuery.query
    // if (originalQueryString && originalQueryString !== '') {
    //     queryString = fulltextQueryParse(originalQueryString)
    // }
    // else
    //     queryString = originalQueryString
    // if (!(queryString && queryString !== '')) {
    //     queryString = '*'
    //     /*if(!sortBy){
    //         sortBy = '__receiveTime'
    //         sortDesc = true
    //     }*/
    // }
    var query = {
        query: originalQuery.query,
        time: {
            from: (0, _moment2.default)(originalQuery.time.from).utc().format('YYYY-MM-DDTHH:mm:ss.000') + 'Z',
            to: (0, _moment2.default)(originalQuery.time.to).utc().format('YYYY-MM-DDTHH:mm:ss.999') + 'Z'
        }
    };

    var timeStart = query.time.from;
    var timeEnd = query.time.to;

    return find({
        ds: dsId,
        dt: dtId,
        start: timeStart,
        end: timeEnd,
        fields: query,
        template: searchCfg.template,
        columns: ['__s_uuid', '__data_source', '__data_type']
    }, apiPrefix);
}

function find(params) {
    var apiPrefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : API_PREFIX;
    var dataSource = params.ds,
        dataType = params.dt,
        startDttm = params.start,
        endDttm = params.end,
        fields = params.fields,
        template = params.template,
        sortBy = params.sortBy,
        sortDesc = params.sortDesc,
        _params$size = params.size,
        size = _params$size === undefined ? 10000 : _params$size,
        pageFrom = params.pageFrom,
        columns = params.columns;

    log.info('find', params);

    //組ES語法
    var qureryString = template;
    // let bReplaced = false//紀錄是否有字串被取代
    // if (/\${[^}|.]+}/.test(qureryString)) {
    //     let matches = qureryString.match(/\${[^}]+}/g)//取得${}
    //     _.forEach(matches, match=>{
    //         let matchKey = match.match(/[^${]+[^}]/)//取得${}中的字串
    //         let replaceTo = _.get(fields, matchKey[0], '')
    //         replaceTo = replaceTo.replace(/\"/g, '\\\"')//若有雙引號的處理
    //         qureryString = qureryString.replace(match, replaceTo)
    //         if (replaceTo !== '' && replaceTo !== undefined) { bReplaced = true }
    //     })
    // }
    // let query = {}
    // if (bReplaced) {
    //     qureryString = qureryString.replace(/'/g, '"')
    //     let error = false
    //     try {
    //         JSON.parse(qureryString)
    //     }
    //     catch (e) {
    //         alert('template format error')
    //         log.error(e)
    //         error = true
    //     }
    //     if (!error)
    //         query = JSON.parse(qureryString).query
    //     else {
    //         log.error('match template error,use default match all')
    //         query = {match_all: {}}
    //     }
    // }
    // else {
    //     log.error('match template error,use default match all')
    //     query = {match_all: {}}
    // }
    var query = (0, _syntax.syntaxParse)(qureryString, fields).query;
    // let sort ? sort : "__s_uuid"
    var statement = { query: query, size: size };
    statement.from = pageFrom ? pageFrom * size : 0;
    if (sortBy !== undefined && sortDesc !== undefined) {
        statement.sort = [_defineProperty({}, sortBy, { order: sortDesc ? 'desc' : 'asc', unmapped_type: "date" })];
    }
    if (columns) {
        statement._source = { includes: columns };
    }
    var request = {
        indexSources: [{
            dataSource: dataSource,
            dataType: dataType
        }],
        startDttm: startDttm,
        endDttm: endDttm,
        statement: statement
    };
    if (startDttm && endDttm) request = _extends({}, request, { startDttm: startDttm, endDttm: endDttm });

    return _ajaxHelper2.default.one({
        url: apiPrefix + "/events/_search",
        type: 'POST',
        data: JSON.stringify(request),
        contentType: 'application/json'
    }, {
        parseSuccess: function parseSuccess(json) {
            return json;
        },
        parseFail: function parseFail(json, text) {
            return { code: json.code, message: _lodash2.default.get(json, ['reason', 'error', 'caused_by', 'reason'], json.message) };
        }
    }); //portal serivce
}
function eventCreate(dataSource, dataType, data) {
    var request = {
        dataSource: dataSource,
        dataType: dataType,
        data: data
    };
    return _ajaxHelper2.default.one({
        url: API_PREFIX + "/events?refresh=true",
        type: 'POST',
        data: JSON.stringify(request),
        contentType: 'application/json'
    });
}
function eventUpdate(data) {
    var request = {};
    _lodash2.default.map(data, function (val, key) {
        if (key.match(/_.*/g) === null) request[key] = _lodash2.default.cloneDeep(val);
    });
    log.info('update event in :', data._index, data._id);
    log.info('output data:', request);
    return _ajaxHelper2.default.one({
        url: API_PREFIX + "/events/" + data._index + "/" + data._id + "?refresh=true",
        type: 'PATCH',
        data: JSON.stringify(request),
        contentType: 'application/json'
    });
}
function eventDelete(event) {
    log.info('delete event in :', event._index, event._id);
    return _ajaxHelper2.default.one({ url: API_PREFIX + "/events/" + event._index + "/" + event._id + "?refresh=true", type: 'DELETE' });
}
function test() {
    log.info('test');
}

exports.default = {
    fulltextQueryParse: fulltextQueryParse,
    find: find,
    eventCreate: eventCreate,
    eventUpdate: eventUpdate,
    eventDelete: eventDelete,
    setupPrefix: setupPrefix,
    test: test
};