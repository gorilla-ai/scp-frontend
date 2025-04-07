"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.findAll = exports.fulltextSearchWithSearchConfig = exports.fulltextSearch = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ajaxHelper = require("react-ui/build/src/utils/ajax-helper");

var _ajaxHelper2 = _interopRequireDefault(_ajaxHelper);

var _syntax = require("vbda/parser/syntax");

var _es = require("vbda/loader/es");

var _es2 = _interopRequireDefault(_es);

var _esHits = require("vbda/parser/es-hits");

var _esHits2 = _interopRequireDefault(_esHits);

var _moment = require("moment/moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @param dtCfg
 * the config of dt to search
 * @param fields
 * {query,time:{from,to}}
 * @param pageInfo
 * {size,pageFrom,sortBy,sortDesc}
 * @returns {*}
 */
function fulltextSearch(_ref) {
    var dtId = _ref.dtId,
        dtCfgs = _ref.dtCfgs,
        searches = _ref.searches,
        fields = _ref.fields,
        _ref$pageInfo = _ref.pageInfo,
        pageInfo = _ref$pageInfo === undefined ? { size: 0 } : _ref$pageInfo;

    var dtCfg = dtCfgs[dtId];
    var searchConfig = searches[dtCfg.fulltext_search];
    return fulltextSearchWithSearchConfig({ dtId: dtId, dsId: dtCfg.ds, searchConfig: searchConfig, fields: fields, pageInfo: pageInfo });
}

/**
 *
 * @param ds
 * @param searchConfig
 * @param fields
 * @param pageInfo
 * @returns {*}
 */
function fulltextSearchWithSearchConfig(_ref2) {
    var dtId = _ref2.dtId,
        dsId = _ref2.dsId,
        searchConfig = _ref2.searchConfig,
        fields = _ref2.fields,
        _ref2$pageInfo = _ref2.pageInfo,
        pageInfo = _ref2$pageInfo === undefined ? { size: 0 } : _ref2$pageInfo;

    switch (searchConfig.query_type) {
        case 'base_service':
        default:
            var template = searchConfig.template;
            return _es2.default.find(_extends({
                ds: dsId,
                dt: dtId,
                start: fields.time.from,
                end: fields.time.to,
                fields: fields,
                template: template
            }, pageInfo)).then(function (data) {
                return { total: data.hits.total, data: (0, _esHits2.default)(data.hits.hits) };
            });
        case 'json_request':
            var url = searchConfig.url,
                body = searchConfig.body;
            // if (fields.query === '*') {
            //     fields.query = ''
            // }

            if (pageInfo.sortBy === '__insertTime') {
                pageInfo.sortBy = undefined;
            }
            var query = (0, _syntax.syntaxParse)(body, fields, false);
            var size = pageInfo.size,
                pageFrom = pageInfo.pageFrom,
                sortBy = pageInfo.sortBy,
                sortDesc = pageInfo.sortDesc;

            var newPageInfo = { size: size };
            newPageInfo.from = pageFrom ? pageFrom * size + 1 : 1;
            if (sortBy !== undefined && sortDesc !== undefined) {
                newPageInfo.order = sortDesc ? 'desc' : 'asc';
                newPageInfo.orderfield = sortBy;
            }
            return _ajaxHelper2.default.one({
                url: url,
                type: 'POST',
                data: JSON.stringify(_extends({}, query, newPageInfo)),
                contentType: 'application/json'
            }).then(function (_ref3) {
                var searchResult = _ref3.searchResult,
                    total = _ref3.total;

                return { total: total, data: searchResult };
            });
        // return ah.one({
        //     url: url,
        //     type: 'POST',
        //     data: JSON.stringify(query),
        //     contentType: 'application/json'
        // })
        //     .then(res => {
        //         return {...res}
        //     })
    }
}

function findAll(originalQuery, searchConfig, dtId, dsId) {
    var fields = {
        query: originalQuery.query,
        time: {
            from: (0, _moment2.default)(originalQuery.time.from).utc().format('YYYY-MM-DDTHH:mm:ss.000') + 'Z',
            to: (0, _moment2.default)(originalQuery.time.to).utc().format('YYYY-MM-DDTHH:mm:ss.999') + 'Z'
        }
    };
    return fulltextSearchWithSearchConfig({ dtId: dtId, dsId: dsId, searchConfig: searchConfig, fields: fields, pageInfo: { size: 10000 } });
}
exports.fulltextSearch = fulltextSearch;
exports.fulltextSearchWithSearchConfig = fulltextSearchWithSearchConfig;
exports.findAll = findAll;