'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                    * @module input-helper
                                                                                                                                                                                                                                                                    * @description A set of input related utilities such as validation, retrieval
                                                                                                                                                                                                                                                                    */

exports.isInteger = isInteger;
exports.retrieveFormData = retrieveFormData;
exports.getErrorMessage = getErrorMessage;
exports.validateField = validateField;
exports.validateData = validateData;
exports.validateForm = validateForm;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _underscore = require('underscore.string');

var _underscore2 = _interopRequireDefault(_underscore);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _errorHelper = require('./error-helper');

var _errorHelper2 = _interopRequireDefault(_errorHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = require('loglevel').getLogger('core/utils/input-helper');

var UNIT_BYTE = 1024 * 1024;

/**
 * Is the given value an integer (or integer like string)?
 * @param {integer|string} n - input
 * @return {boolean}
 *
 * @example
 * isInteger(1) === isInteger('1') === true
 * isInteger(1.2) === isIntger('1.2') === false
 */
function isInteger(n) {
    return !isNaN(n) && Number(n) % 1 === 0;
}

/**
 * Retrieve all inputs within dom element.<br/>
 * Currently detected elements are:
 * * input[type='text']
 * * input[type='checkbox']
 * * input[type='file']
 * * select
 * * textarea
 *
 * @param {HTMLElement} node - dom element
 * @return {object} Result in key-value pair
 *
 * @example
 * // node = <div><input id='a'/><select name='b'>...</select></div>
 * let data = retrieveFormData(node)
 * // data = { a:'1', b:'2' }
 */
function retrieveFormData(node) {
    var inputs = (0, _jquery2.default)(node).find('input:text, input:checkbox, input:password, input:file, select, textarea');

    var result = {};
    if (inputs.length > 0) {
        result = _lodash2.default.reduce(inputs, function (acc, input) {
            var value = input.value,
                type = input.type,
                id = input.id,
                name = input.name;


            if (type === 'checkbox') {
                value = input.checked;
            } else if (type === 'file') {
                value = input.files[0];
            }

            acc[id || name] = value;
            return acc;
        }, {});
    }
    return result;
}

function getErrorMessage(errors, options) {
    if (!errors || errors.length === 0) {
        return null;
    }

    if (!_lodash2.default.isArray(errors)) {
        errors = [errors];
    }
    return _errorHelper2.default.getMsg(errors, options);
}

/**
 * Validate field given type/required/validate information
 * @param {number|string} value - value to validate
 * @param {Object} format - format to check value against
 * @param {string} format.name field name
 * @param {'text'|'number'|'integer'|'file'} [format.type='text']
 * @param {boolean} [format.required=false] is this field mandatory?
 * @param {RegExp|string} [format.pattern] validate using regexp pattern
 * @param {string} [format.patternReadable] readable error message for pattern
 * @param {string | Array.<string>} [format.extension] accepted file extension (when type=file)
 * @param {number} [format.min] min value (when type=number|integer)
 * @param {number} [format.max] max value (when type=number|integer|file)
 * @param {boolean|Object} [tOptions=true] - translator options
 * @param {function} [tOptions.et=default error translator] - error translator function
 * @param {function} [tOptions.ft] - field translator function
 * @return {Object<{code:string, params:{field:string,value:(string|object),min:number,max:number,pattern:string,extension:string}}>} returns error object if tOptions=false
 * @return {string} returns translated error message if tOptions is specified
 *
 * @example
 * let error = validateField(7, {name:'field_name',type:'interger',max:6}, false)
 * // error == {code:'out-of-bound', params:{field:'field_name',value:7,max:6}}
 *
 * let error = validateField('07123456', {name:'field_name', pattern:/^[0-9]{10}$/, patternReadable:'not a valid mobile phone #'}, false)
 * // error == {code:'no-match', params:{field:'field_name', value:'07123456', pattern:'not a valid mobile phone #'}}
 *
 * let error = validateField(file, {name: 'file_input', type: 'file', required: true, max: 10}, false)
 * // error == {code: 'file-too-large', params: {field: 'file_input', size: 10, value: File}}
 */
function validateField(value, _ref) {
    var field = _ref.name,
        _ref$type = _ref.type,
        inputType = _ref$type === undefined ? 'text' : _ref$type,
        _ref$required = _ref.required,
        required = _ref$required === undefined ? false : _ref$required,
        pattern = _ref.pattern,
        patternReadable = _ref.patternReadable,
        extension = _ref.extension,
        min = _ref.min,
        max = _ref.max;
    var tOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var errCode = '';
    var errParams = {};

    if (value == null || _underscore2.default.isBlank(value)) {
        if (required) {
            errCode = 'missing';
        }
    } else if (pattern) {
        if (pattern instanceof RegExp && !pattern.test(value) || _lodash2.default.isString(pattern) && !new RegExp(pattern).test(value)) {
            errCode = 'no-match';
            errParams = { pattern: patternReadable || pattern };
        }
    } else if (inputType === 'number' || inputType === 'integer') {
        if (inputType === 'integer' && !isInteger(value)) {
            errCode = 'not-int';
        } else if (inputType === 'number' && isNaN(value)) {
            errCode = 'not-num';
        } else {
            var parsedValue = parseFloat(value);
            var hasMin = min != null;
            var hasMax = max != null;
            if (hasMin && parsedValue < min || hasMax && parsedValue > max) {
                errCode = 'out-of-bound';
                errParams = { min: hasMin ? min : '', max: hasMax ? max : '' };
            }
        }
    } else if (inputType === 'file') {
        var extName = _lodash2.default.toLower(_path2.default.extname(value.name));
        var mimeType = value.type;

        if (max && value.size > max * UNIT_BYTE) {
            errCode = 'file-too-large';
            errParams = {
                max: max
            };
        } else if (extension) {
            if (Array.isArray(extension)) {
                var lowerCaseExt = _lodash2.default.map(extension, _lodash2.default.toLower);
                var isPass = _lodash2.default.some(lowerCaseExt, function (el) {
                    return el === extName || el === mimeType || RegExp(/^[\w\d]+\/\*$/).test(el) && RegExp(el).test(mimeType);
                });

                if (!isPass) {
                    errCode = 'file-wrong-format';
                    errParams = {
                        extension: lowerCaseExt.toString()
                    };
                }
            } else {
                var _lowerCaseExt = _lodash2.default.toLower(extension);
                var isRangedExt = RegExp(/^[\w\d]+\/\*$/).test(_lowerCaseExt);

                var _isPass = extName === _lowerCaseExt || mimeType === _lowerCaseExt || isRangedExt && RegExp(_lowerCaseExt).test(mimeType);

                if (!_isPass) {
                    errCode = 'file-wrong-format';
                    errParams = {
                        extension: _lowerCaseExt
                    };
                }
            }
        }
    }

    var error = null;
    if (errCode) {
        error = { code: errCode, params: _extends({ field: field, value: value }, errParams) };
    }

    if (tOptions) {
        return getErrorMessage(error, tOptions);
    }

    return error;
}

/**
 * Validate data input(s) against given format.<br/>
 *
 * @param {object} data - key-value pairs
 * @param {object} format - format to check
 * @param {boolean|Object} [tOptions=true] - translator options
 * @param {function} [tOptions.et=default error translator] - error translator function
 * @param {function} [tOptions.ft] - field translator function
 * @return {Array.<error>} Array of errors if tOptions=false. See [validateField]{@link module:input-helper.validateField}
 * @return {string} returns translated error message if tOptions is specified
 *
 * @example
 * let data = {'key1':'value1', 'key2':7, 'key3':3}
 * let format = { required:true, type:'integer', max:6 }
 * let errors = validateData(data, format, false)
 * // errors == [
 * //   {code:'not-int', params:{field:'key1',value:'value1'}},
 * //   {code:'out-of-bound', params:{field:'key2', value:7, max:6}}
 * // ]
 *
 */
function validateData(data, format) {
    var tOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    log.debug('validateData', data, format);
    var result = _lodash2.default.reduce(data, function (acc, v, k) {
        // if all fields use different format, then format[k] is used as validation
        // otherwise assume format is a global format
        var formatToCheck = format[k] || format;

        if (!_lodash2.default.isArray(v)) {
            v = [v];
        }

        if (formatToCheck.required && v.length <= 0) {
            log.warn('validateData::array input required', k);
            acc.push({ code: 'missing', params: { field: k } });
        } else {
            _lodash2.default.forEach(v, function (item) {
                var err = validateField(item, _extends({ name: k }, formatToCheck), false);
                if (err) {
                    acc.push(err);
                }
            });
        }

        return acc;
    }, []);

    if (result.length <= 0) {
        result = null;
    }
    log.debug('validateData::result', result);

    if (tOptions) {
        return getErrorMessage(result, tOptions);
    }

    return result;
}

/**
 * Validate form input(s) contained in specified dom node against given format.<br/>
 *
 * @param {HTMLElement} node - dom element containing form inputs
 * @param {object} format - format to check
 * @param {boolean|Object} [tOptions=true] - translator options
 * @param {function} [tOptions.et=default error translator] - error translator function
 * @param {function} [tOptions.ft] - field translator function
 * @return {Array.<error>} Array of errors if tOptions=false. See [validateField]{@link module:input-helper.validateField}
 * @return {string} returns translated error message if tOptions is specified
 *
 */
function validateForm(node, format, tOptions) {
    var data = retrieveFormData(node);
    return validateData(data, format, tOptions);
}

exports.default = {
    retrieveFormData: retrieveFormData,
    validateField: validateField,
    validateForm: validateForm,
    validateData: validateData,
    getErrorMessage: getErrorMessage
};