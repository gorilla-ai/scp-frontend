/**
 * This file is for handling data-related issue, e.g,. convert gis input to {id, type, props...};
 * or validate the input data-type, e.g., validate the input is a String or not.
 *
 * @file   Functions related to data-handling.
 * @author Liszt
 */

import _ from 'lodash';
import moment from 'moment';

import { GIS_ERROR as ERROR } from './gis-exception';

const COMMON_VAR_TYPE = ['number', 'string', 'array', 'plainObject', 'function'];

const log = require('loglevel').getLogger('gis/utils/data-helper');


/**
 * Gets the appropriate validator to check data type.
 *
 * @param {String | String[]} type   The validator's primitive type, which is 'number', 'string', 'array', 'plainObject', 'function', or an array.
 *
 * @return {Function}  A lodash method or a validation function.
 */
function _getValidator(type) {
  if (_.includes(COMMON_VAR_TYPE, type)) {
    return _[`is${_.upperFirst(type)}`];
  }

  if (_.isArray(type)) {
    return _isArrayOf;
  }

  log.warn(
    ERROR.INVALID_ARGS,
    type,
    'Please input one of the following argument to check type. '
    + '\'number\', \'string\', \'array\', \'plainObject\', \'function\''
  );

  // A default validator
  return _.isNumber;
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
function _isArrayOf(array = [], type) {
  let isValid = false;

  _.forEach(type, (elm) => {
    const validate = _getValidator(elm);

    isValid = array.length > 0
      ? _.every(array, el => (_.isArray(elm) ? validate(el, elm) : validate(el)))
      : false;

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
export function isValidArgType(argument, validType = COMMON_VAR_TYPE) {
  let isValid = false;

  if (_.isString(validType)) {
    const validate = _getValidator(validType);
    isValid = validate(argument);
  } else if (_.isArray(validType)) {
    _.forEach(validType, (el) => {
      const validate = _getValidator(el);
      isValid = _.isArray(el)
        ? validate(argument, el)
        : validate(argument);

      return !isValid;
    });
  } else {
    log.warn(ERROR.INVALID_ARGS, validType, 'The arguments should be (* argument, String/String[] validType?)');
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
export function isMatch(item, filter) {
  const {
    id,
    type,
    data,
    group
  } = filter;
  const match = id === item.id
        || (_.isArray(id) && _.includes(id, item.id))
        || (type && type === item.type)
        || (_.isArray(type) && _.includes(type, item.type))
        || (!_.isEmpty(data) && _.isMatch(item.data, data))
        || (group && group === item.group);

  return match;
}

/**
 * Converts data to the format GIS can handle.
 *
 * @param {Object} item     The GIS raw data
 *
 * @return {Object}    The formatted GIS data
 */
export function convertRawDataToSymbolObj(item) {
  const {
    id,
    type,
    selected,
    selectedProps,
    ...props
  } = item;

  return {
    id,
    type,
    selected,
    selectedProps,
    props
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
export function isBetween(time, interval, includeBoundary = true) {
  const offset = includeBoundary ? 1 : 0;

  if (_.isArray(time)) {
    return _.some(time, t => (moment(t).isBetween(interval[0] - offset, interval[1] + offset)));
  }

  return moment(time).isBetween(interval[0] - offset, interval[1] + offset);
}

export default {
  isValidArgType,
  isMatch,
  isBetween,
  convertRawDataToSymbolObj
};
