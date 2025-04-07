"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.syntaxStringParse = exports.syntaxParse = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _es = require("../loader/es");

var _es2 = _interopRequireDefault(_es);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = require('loglevel').getLogger('vbda/parser/syntax');
function syntaxParse(templateOrBody, fields) {
    var isES = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    var fieldsToMap = _extends({}, fields);
    if (isES) {
        if (fields.query && fields.query !== '') {
            fieldsToMap.query = _es2.default.fulltextQueryParse(fields.query);
        } else {
            fieldsToMap.query = '*';
        }
    }
    //組ES語法
    var bReplaced = false; //紀錄是否有字串被取代
    if (/\${[^}|.]+}/.test(templateOrBody)) {
        var matches = templateOrBody.match(/\${[^}]+}/g); //取得${}
        _lodash2.default.forEach(matches, function (match) {
            var matchKey = match.match(/[^${]+[^}]/); //取得${}中的字串
            var replaceTo = _lodash2.default.get(fieldsToMap, matchKey[0], '');
            replaceTo = replaceTo.replace(/\"/g, '\\\"'); //若有雙引號的處理
            templateOrBody = templateOrBody.replace(match, replaceTo);
            if (replaceTo !== '' && replaceTo !== undefined) {
                bReplaced = true;
            }
        });
    }
    var result = {};
    if (bReplaced) {
        templateOrBody = templateOrBody.replace(/'/g, '"');
        var error = false;
        try {
            JSON.parse(templateOrBody);
        } catch (e) {
            alert('template format error');
            log.error(e);
            error = true;
        }
        if (!error) result = JSON.parse(templateOrBody);else {
            log.error('match template error,use default match all');
            result = { match_all: {} };
        }
    } else {
        log.error('match template error,use default match all');
        result = { match_all: {} };
    }
    log.info(result);
    return result;
}

function syntaxStringParse(templateOrBody, fields) {
    if (/\${[^}]+}/.test(templateOrBody)) {
        var matches = templateOrBody.match(/\${[^}]+}/g); //取得${}
        _lodash2.default.forEach(matches, function (match) {
            var matchKey = match.match(/[^${]+[^}]/); //取得${}中的字串
            var replaceTo = _lodash2.default.get(fields, matchKey[0], '');
            templateOrBody = templateOrBody.replace(match, replaceTo);
        });
    }
    return templateOrBody;
}

exports.syntaxParse = syntaxParse;
exports.syntaxStringParse = syntaxStringParse;