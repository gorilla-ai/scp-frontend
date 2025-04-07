/**
  * @module input-helper
  * @description A set of input related utilities such as validation, retrieval
  */

import _ from 'lodash'
import _str from 'underscore.string'
import path from 'path'
import $ from 'jquery'

import eh from './error-helper'

let log = require('loglevel').getLogger('core/utils/input-helper')


const UNIT_BYTE = 1024 * 1024


/**
 * Is the given value an integer (or integer like string)?
 * @param {integer|string} n - input
 * @return {boolean}
 *
 * @example
 * isInteger(1) === isInteger('1') === true
 * isInteger(1.2) === isIntger('1.2') === false
 */
export function isInteger(n) {
    return !isNaN(n) && Number(n)%1===0
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
export function retrieveFormData(node) {
    let inputs = $(node).find('input:text, input:checkbox, input:password, input:file, select, textarea')

    let result = {}
    if (inputs.length>0) {
        result = _.reduce(inputs, (acc, input) => {
            let {value, type, id, name} = input

            if (type==='checkbox') {
                value = input.checked
            }
            else if (type==='file') {
                value = input.files[0]
            }

            acc[id || name] = value
            return acc
        }, {})
    }
    return result
}


export function getErrorMessage(errors, options) {
    if (!errors || errors.length===0) {
        return null
    }

    if (!_.isArray(errors)) {
        errors = [errors]
    }
    return eh.getMsg(errors, options)
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
export function validateField(value, {name:field, type:inputType='text', required=false, pattern, patternReadable, extension, min, max}, tOptions={}) {
    let errCode = ''
    let errParams = {}

    if (value==null || _str.isBlank(value)) {
        if (required) {
            errCode = 'missing'
        }
    }
    else if (pattern) {
        if (
            (pattern instanceof RegExp && !pattern.test(value)) ||
            (_.isString(pattern) && !new RegExp(pattern).test(value))
        ) {
            errCode = 'no-match'
            errParams = {pattern:patternReadable || pattern}
        }
    }
    else if (inputType==='number' || inputType==='integer') {
        if (inputType==='integer' && !isInteger(value)) {
            errCode = 'not-int'
        }
        else if (inputType==='number' && isNaN(value)) {
            errCode = 'not-num'
        }
        else {
            let parsedValue = parseFloat(value)
            let hasMin = (min!=null)
            let hasMax = (max!=null)
            if ((hasMin && (parsedValue < min)) || (hasMax && parsedValue > max)) {
                errCode = 'out-of-bound'
                errParams = {min:(hasMin?min:''), max:(hasMax?max:'')}
            }
        }
    }
    else if (inputType==='file') {
        const extName = _.toLower(path.extname(value.name))
        const mimeType = value.type

        if (max && value.size > max * UNIT_BYTE) {
            errCode = 'file-too-large'
            errParams = {
                max
            }
        }
        else if (extension) {
            if (Array.isArray(extension)) {
                const lowerCaseExt = _.map(extension, _.toLower)
                const isPass = _.some(lowerCaseExt, el => {
                    return (el === extName)
                        || (el === mimeType)
                        || (RegExp(/^[\w\d]+\/\*$/).test(el) && RegExp(el).test(mimeType))
                })

                if (!isPass) {
                    errCode = 'file-wrong-format'
                    errParams = {
                        extension: lowerCaseExt.toString()
                    }
                }
            }
            else {
                const lowerCaseExt = _.toLower(extension)
                const isRangedExt = RegExp(/^[\w\d]+\/\*$/).test(lowerCaseExt)

                const isPass = (extName === lowerCaseExt)
                            || (mimeType === lowerCaseExt)
                            || (isRangedExt && RegExp(lowerCaseExt).test(mimeType))

                if (!isPass) {
                    errCode = 'file-wrong-format'
                    errParams = {
                        extension: lowerCaseExt
                    }
                }
            }
        }
    }

    let error = null
    if (errCode) {
        error = {code:errCode, params:{field, value, ...errParams}}
    }

    if (tOptions) {
        return getErrorMessage(error, tOptions)
    }

    return error
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
export function validateData(data, format, tOptions={}) {
    log.debug('validateData', data, format)
    let result = _.reduce(data, (acc, v, k) => {
        // if all fields use different format, then format[k] is used as validation
        // otherwise assume format is a global format
        let formatToCheck = format[k] || format

        if (!_.isArray(v)) {
            v = [v]
        }

        if (formatToCheck.required && v.length <= 0) {
            log.warn('validateData::array input required', k)
            acc.push({code:'missing', params:{field:k}})
        }
        else {
            _.forEach(v, item => {
                let err = validateField(item, {name:k, ...formatToCheck}, false)
                if (err) {
                    acc.push(err)
                }
            })
        }

        return acc
    }, [])

    if (result.length <= 0) {
        result = null
    }
    log.debug('validateData::result', result)

    if (tOptions) {
        return getErrorMessage(result, tOptions)
    }

    return result
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
export function validateForm(node, format, tOptions) {
    let data = retrieveFormData(node)
    return validateData(data, format, tOptions)
}


export default {
    retrieveFormData,
    validateField,
    validateForm,
    validateData,
    getErrorMessage
}