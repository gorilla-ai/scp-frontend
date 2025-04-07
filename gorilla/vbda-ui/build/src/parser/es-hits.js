'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (hits, columns) {
    return hits.map(function (hit) {
        var _id = hit._id,
            _index = hit._index,
            _type = hit._type,
            _source = hit._source;

        if (columns) {
            _source = _lodash2.default.pick(_source, [].concat(_toConsumableArray(columns), ['__s_uuid', '__data_type', '__data_source']));
        }
        return _extends({ _id: _id, _index: _index, _type: _type }, _source);
    });
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * @module es-hits
 * @description ES hits parser
 */

/**
 * Parses ES response hits into standard object array.
 * @param {array.<object>} hits - ES hits
 * @param {array.<string>} columns - Which columns to retrieve?
 * @return {array.<object>}
 */