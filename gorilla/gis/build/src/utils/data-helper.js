"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValidArgType = isValidArgType;
exports.isMatch = isMatch;
exports.convertRawDataToSymbolObj = convertRawDataToSymbolObj;
exports.isBetween = isBetween;
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _moment = _interopRequireDefault(require("moment"));

var _gisException = require("./gis-exception");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var COMMON_VAR_TYPE = ['number', 'string', 'array', 'plainObject', 'function'];

var log = require('loglevel').getLogger('gis/utils/data-helper');
/**
 * Gets the appropriate validator to check data type.
 *
 * @param {String | String[]} type   The validator's primitive type, which is 'number', 'string', 'array', 'plainObject', 'function', or an array.
 *
 * @return {Function}  A lodash method or a validation function.
 */


function _getValidator(type) {
  if (_lodash["default"].includes(COMMON_VAR_TYPE, type)) {
    return _lodash["default"]["is".concat(_lodash["default"].upperFirst(type))];
  }

  if (_lodash["default"].isArray(type)) {
    return _isArrayOf;
  }

  log.warn(_gisException.GIS_ERROR.INVALID_ARGS, type, 'Please input one of the following argument to check type. ' + '\'number\', \'string\', \'array\', \'plainObject\', \'function\''); // A default validator

  return _lodash["default"].isNumber;
}
/**
 * Recursively checks the input data is array of target type, e.g., array of String.
 * It also handle the nested array.
 *
 * @param {type} array=[]   The input arguments are going to be validated.
 * @param {String} type     What's the primitive type of the array? E.g., Array of number.
 *
 * @return {Boolean}   Whether the input match the given primitive type?
 */


function _isArrayOf() {
  var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var type = arguments.length > 1 ? arguments[1] : undefined;
  var isValid = false;

  _lodash["default"].forEach(type, function (elm) {
    var validate = _getValidator(elm);

    isValid = array.length > 0 ? _lodash["default"].every(array, function (el) {
      return _lodash["default"].isArray(elm) ? validate(el, elm) : validate(el);
    }) : false;
    return !isValid;
  });

  return isValid;
}
/**
 * Checks arguments types.
 *
 * E.g., if there's a function foo(string/object/function *arg*), you can check arg's type with isValidArgType(arg, ['string', 'plainObject', 'function']).
 * Notice that type Object is written as 'plainObject' here.
 *
 * If you'd like to check *arg* is an array of specific primitive types, e.g. number[] or string[], you can check with isValidArgType(arg, [['number', 'string']]).
 * Notice that second parameter is a nested array. In this example, it will return true when the input is number[] or string[].
 *
 * @param {Number | Number[] | String | String[] | Object | Object[] | Function | Function[]} argument  The input arguments are going to be validated.
 * @param {String | String[]} [validType=['number', 'string', 'array', 'plainObject', 'function']]      What's the primitive type the argument should be?
 *
 * @return {Boolean}   Whether the argument match the given type?
 */


function isValidArgType(argument) {
  var validType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : COMMON_VAR_TYPE;
  var isValid = false;

  if (_lodash["default"].isString(validType)) {
    var validate = _getValidator(validType);

    isValid = validate(argument);
  } else if (_lodash["default"].isArray(validType)) {
    _lodash["default"].forEach(validType, function (el) {
      var validate = _getValidator(el);

      isValid = _lodash["default"].isArray(el) ? validate(argument, el) : validate(argument);
      return !isValid;
    });
  } else {
    log.warn(_gisException.GIS_ERROR.INVALID_ARGS, validType, 'The arguments should be (* argument, String/String[] validType?)');
  }

  return isValid;
}
/**
 * Checks if the global config, e.g., symbolOptions, should apply for the symbol.
 *
 * @param {Object} item                     The input arguments are going to be validated.
 * @param {Object} filter                   The filter used to validate the item.
 * @param {String | String[]} filter.id     The ids of symbols which should apply the global config.
 * @param {String | String[]} filter.type   The types of symbols which should apply the global config.
 * @param {Object} filter.data              The data of symbols which should apply the global config.
 * @param {String} filter.group             The group of symbols which should apply the global config.
 *
 * @return {Boolean}   Whether the item match the filter?
 */


function isMatch(item, filter) {
  var id = filter.id,
      type = filter.type,
      data = filter.data,
      group = filter.group;
  var match = id === item.id || _lodash["default"].isArray(id) && _lodash["default"].includes(id, item.id) || type && type === item.type || _lodash["default"].isArray(type) && _lodash["default"].includes(type, item.type) || !_lodash["default"].isEmpty(data) && _lodash["default"].isMatch(item.data, data) || group && group === item.group;
  return match;
}
/**
 * Converts data to the format GIS can handle.
 *
 * @param {Object} item     The GIS raw data
 *
 * @return {Object}    The formatted GIS data
 */


function convertRawDataToSymbolObj(item) {
  var id = item.id,
      type = item.type,
      selected = item.selected,
      selectedProps = item.selectedProps,
      props = _objectWithoutProperties(item, ["id", "type", "selected", "selectedProps"]);

  return {
    id: id,
    type: type,
    selected: selected,
    selectedProps: selectedProps,
    props: props
  };
}
/**
 * Checks if symbol's ts is within the GIS interval.
 *
 * @param {Number} time                     The timestamp of GIS.
 * @param {Number[]} interval               The GIS interval, which is [start, end].
 * @param {Boolean} [includeBoundary=true]  Should the interval contain the boundary?
 *
 * @return {Boolean}   Is the time within the interval?
 */


function isBetween(time, interval) {
  var includeBoundary = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var offset = includeBoundary ? 1 : 0;

  if (_lodash["default"].isArray(time)) {
    return _lodash["default"].some(time, function (t) {
      return (0, _moment["default"])(t).isBetween(interval[0] - offset, interval[1] + offset);
    });
  }

  return (0, _moment["default"])(time).isBetween(interval[0] - offset, interval[1] + offset);
}

var _default = {
  isValidArgType: isValidArgType,
  isMatch: isMatch,
  isBetween: isBetween,
  convertRawDataToSymbolObj: convertRawDataToSymbolObj
};
exports["default"] = _default;
//# sourceMappingURL=data-helper.js.map