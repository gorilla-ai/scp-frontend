'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AGG_TYPE_PROP = exports.KEY_MAPPING_PROP = exports.DATA_ITEM_PROP = undefined;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Data item prop
 */
/**
 * Defines commonly used prop types, as well as prop type generators
 */

var DATA_ITEM_PROP = exports.DATA_ITEM_PROP = _propTypes2.default.objectOf(_propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number, _propTypes2.default.object]));

/**
 * Single key mapping prop
 */
var KEY_MAPPING_PROP = exports.KEY_MAPPING_PROP = _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.string), _propTypes2.default.string]);

/**
 * Aggregation type
 */
var AGG_TYPE_PROP = exports.AGG_TYPE_PROP = _propTypes2.default.oneOf(['count', 'sum', 'avg']);