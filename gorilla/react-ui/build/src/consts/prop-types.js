'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LIST_PROP = exports.SIMPLE_OBJECT_PROP = exports.SIMPLE_ARRAY_PROP = exports.SIMPLE_VALUE_PROP = undefined;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A Simple value prop
 * @typedef {number | string} SIMPLE_VALUE_PROP
 */
/**
 * @module prop-types
 * @desc Defines commonly used prop types, as well as prop type generators
 */

var SIMPLE_VALUE_PROP = exports.SIMPLE_VALUE_PROP = _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]);

/**
 * An array of simple values prop
 * @typedef {SIMPLE_VALUE_PROP[]} SIMPLE_ARRAY_PROP
 * @example [1,2,3]
 * @example ['1','2']
 */
var SIMPLE_ARRAY_PROP = exports.SIMPLE_ARRAY_PROP = _propTypes2.default.arrayOf(SIMPLE_VALUE_PROP);

/**
 * An object of simple values prop
 * @typedef {Object.<SIMPLE_VALUE_PROP>} SIMPLE_OBJECT_PROP
 * @example {key1:1, key2:'val2'}
 */
var SIMPLE_OBJECT_PROP = exports.SIMPLE_OBJECT_PROP = _propTypes2.default.objectOf(SIMPLE_VALUE_PROP);

/**
 * A Renderable List
 * @typedef {Array<Object.<value:SIMPLE_VALUE_PROP, text:SIMPLE_VALUE_PROP>>} LIST_PROP
 * @example [{value:2,text:'this is 2'}]
 */
var LIST_PROP = exports.LIST_PROP = _propTypes2.default.arrayOf(_propTypes2.default.shape({
    value: SIMPLE_VALUE_PROP,
    text: SIMPLE_VALUE_PROP,
    children: _propTypes2.default.node
}));