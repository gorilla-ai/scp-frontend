/**
  * @module error-helper
  * @description Error message helpers
  */

import _ from 'lodash'

let log = require('loglevel').getLogger('core/utils/error-helper')

const defaultEt = (codes, params={})=>`Error: ${codes} - ${JSON.stringify(_.values(params))}`


function _getMsg({code, params={}, message}, options={}) {
    const {
        et=defaultEt,
        ft
    } = options

    let msg = ''

    // try to localize 'field' parameter if exists
    if (params.field && ft) {
        msg += ft('fields.'+params.field) + ': '
    }
    return msg + et([''+code, '-1'], {code, ...params, message})
}


export function getSystemMsg(et=defaultEt) {
    return et('-1')
}

/**
 * Converts error object(s) into an error message
 * @param {array.<Object>} errors - array of errors
 * @param {Object} [options] - options
 * @param {function} [options.et] - error translator
 * @param {function} [options.ft] - field translator
 * @return {string} error message
 *
 */
export function getMsg(errors, options={}) {
    if (!errors || errors.length === 0) {
        return getSystemMsg()
    }
    return _.map(errors, (error) => _getMsg(error, options)).join('<br/>')
}


class ErrorHandler {
    constructor(id, options={}) {
        this.id = id
        const {
            et=defaultEt
        } = options

        this.setupErrorTranslate(et)
    }

    setupErrorTranslate(et) {
        this.et = et
    }

    getSystemMsg() {
        return getSystemMsg(this.et)
    }

    getMsg(errors, options={}) {
        options = (_.isObject(options)) ? options : {}
        return getMsg(errors, {et:this.et, ...options})
    }
}

ErrorHandler.instances = {}

/**
 * Create a new error handler instance
 * @param {string} id - instance id, may be used to retrieve instance in future calls
 * @param {Object} [options] - options
 * @param {function} [options.et] - error translator
 * @return {Object} created error handler instance object
 *
 */
export function createInstance(id, options) {
    if (ErrorHandler.instances[id]) {
        log.error(`Cannot create instance, instance with id ${id} already exists`)
        return null
    }

    const newInstance = new ErrorHandler(id, options)
    ErrorHandler.instances[id] = newInstance
    return newInstance
}

/**
 * Retrieves error handler instance
 * @param {string} id - instance id, may be used to retrieve instance in future calls
 * @return {Object} error handler instance object
 *
 * @example
 * const moduleErrorHandler = getInstance('module-id')
 */
export function getInstance(id) {
    return ErrorHandler.instances[id]
}

const eh = createInstance('global')

export default eh