/**
  * @module ajax-helper
  * @description Ajax utilities for request
  */

import _ from 'lodash'
import Promise from 'bluebird'
import $ from 'jquery'
import path from 'path'

import Progress from '../components/progress'
import {default as globalEh, createInstance as createEh} from './error-helper'

const log = require('loglevel').getLogger('core/utils/ajax-helper')

const defaultFailParser = (json, text)=>{
    if (json) {
        const {code, message, errors} = json
        return {
            code,
            message,
            errors
        }
    }

    if (text) {
        return {
            message: text
        }
    }

    return {}
}

const defaultSuccessParser = (json)=>{
    return json
}

const defaultGt = (code)=>{
    const mapping = {
        'txt-uploading': 'Uploading...',
        'txt-uploaded': 'Done'
    }
    return mapping[code] || code
}


/**
 * Send one ajax request
 * @param {string|Object} req - url string or jquery request object
 * @param {Object} [options] - options
 * @param {boolean} [options.showProgress=true] - whether blocking spinner will be shown during request (before response is received)
 * @param {string} [options.prefix] - prefix to prepend to requested url
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @param {function} [options.eh] - error handler instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.et] - error translator function for translating error
 * @param {function} [options.ft] - field translator function for translating field name upon receiving error
 * @return {Object} Promise object
 *
 * @example
 *
 * // use default parsers
 * ah.one('/url/...')
 *     .then(data=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 *
 * // use customized parsers
 * ah.one('/url/...', {
 *     parseSuccess:(json)=>json.data,
 *     parseFail:(json, text)=>({code:json.errCode, message:json.errMessage})
 * })
 *     .then(data=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 */
export function one(req, options={}) {
    const {
        showProgress=true,
        prefix,
        parseFail=defaultFailParser,
        parseSuccess=defaultSuccessParser,
        eh=globalEh
    } = options

    showProgress && Progress.startSpin()

    if (_.isString(req)) {
        req = {
            url: req
        }
    }

    if (prefix) {
        req = {
            ...req,
            url: path.join(prefix, req.url)
        }
    }

    return Promise.resolve($.ajax({type:'GET', ...req}))
        .catch(xhr => {
            showProgress && Progress.done()

            const {code, message, errors} = parseFail(xhr.responseJSON, xhr.responseText, xhr.status)
            const tOptions = _.pick(options, ['et', 'ft'])
            if (!errors || errors.length === 0) {
                throw new Error(eh.getMsg([{code, message}], tOptions))
            }
            else {
                throw new Error(eh.getMsg(errors, tOptions))
            }
        })
        .then(res => {
            showProgress && Progress.done()
            return parseSuccess(res)
        })
}


/**
 * Send multiple ajax requests all at once
 * @param {array.<string|Object>} req - array of url strings or jquery request objects
 * @param {Object} [options] - options
 * @param {boolean} [options.showProgress=true] - whether blocking spinner will be shown during request (before response is received)
 * @param {string} [options.prefix] - prefix to prepend to requested urls
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @param {function} [options.eh] - error handler instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.et] - error translator function for translating error
 * @param {function} [options.ft] - field translator function for translating field name upon receiving error
 * @return {Object} Promise object
 *
 * @example
 *
 * ah.all([
 *     '/url/...',
 *     {type:'GET', url:'/url2/...', data:{key:'value'}}
 * ])
 *     .then(([data1, data2])=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 */
export function all(reqArr, options={}) {
    const {
        showProgress=true
    } = options

    showProgress && Progress.startSpin()

    return Promise.map(reqArr, (reqItem) => {
        return one(reqItem, {...options, showProgress:false})
    })
        .then(result => {
            showProgress && Progress.done()

            return result
        })
        .catch(e => {
            showProgress && Progress.done()

            throw new Error(e)
        })
}

/**
 * Send multiple ajax requests in sequence (send subsequest request upon completion of previous request)
 * @param {array.<string|Object>} req - array of url strings or jquery request objects
 * @param {Object} [options] - options
 * @param {boolean} [options.showProgress=true] - whether blocking spinner will be shown during request (before response is received)
 * @param {string} [options.prefix] - prefix to prepend to requested urls
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @param {function} [options.eh] - error handler instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.et] - error translator function for translating error
 * @param {function} [options.ft] - field translator function for translating field name upon receiving error
 * @return {Object} Promise object
 *
 * @example
 * ah.series([
 *     '/url/...',
 *     {type:'GET', url:'/url2/...', data:{key:'value'}}
 * ])
 *     .then(([data1, data2])=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 *
 */
export function series(reqArr, options={}) {
    const {
        showProgress=true
    } = options

    showProgress && Progress.startSpin()

    return Promise.reduce(reqArr, (values, reqItem) => {
        return one(reqItem, {...options, showProgress:false})
            .then(value => {
                values.push(value)
                return values
            })
    }, [])
        .then(result => {
            showProgress && Progress.done()

            return result
        })
        .catch(e => {
            showProgress && Progress.done()

            throw new Error(e)
        })
}


/**
 * Send multi part ajax request
 * @param {url} req - url string
 * @param {Object} data - key-value pairs of input elements or raw data
 * @param {Object} [options] - options
 * @param {boolean} [options.showProgress=true] - whether blocking spinner will be shown during request (before response is received)
 * @param {string} [options.prefix] - prefix to prepend to requested url
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @param {function} [options.eh] - error handler instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.et] - error translator function for translating error
 * @param {function} [options.ft] - field translator function for translating field name upon receiving error
 * @return {Object} Promise object
 *
 * @example
 * ah.multi(
 *     '/url/...',
 *     {key:'value',file:FILE} // file is HTMLInputElement
 * )
 *     .then(data=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 */
export function multi(url, data, options={}) {
    const {
        showProgress=true,
        prefix,
        parseFail=defaultFailParser,
        parseSuccess=defaultSuccessParser,
        gt=defaultGt,
        eh=globalEh
    } = options

    const hasFile = _.some(data, (v)=>v instanceof HTMLInputElement && v.type==='file')

    if (showProgress) {
        if (hasFile) {
            Progress.startProgress(gt('txt-uploading'))
        }
        else {
            Progress.startSpin()
        }
    }

    let p, result

    if (prefix) {
        url = path.join(prefix, url)
    }

    if (window.FormData) {
        let formData = new FormData()

        _.forEach(data, (v, k)=>{
            if (v instanceof HTMLInputElement) {
                if (v.type==='file') {
                    formData.append(k, v.files[0])
                }
                else {
                    formData.append(k, v.value)
                }
            }
            else {
                formData.append(k, v)
            }
        })

        p = one({
            url,
            type: 'POST',
            contentType: false,
            processData: false,
            data: formData,
            progress: showProgress && hasFile && ((loaded, total) => {
                Progress.setProgress(loaded, total)
            })
        }, {...options, showProgress:false})
    }
    else {
        p = new Promise((resolve, reject) => {
            // Let's create the iFrame used to send our data
            let iframe = document.createElement('iframe')
            iframe.name = 'multi'

            // Next, attach the iFrame to the main document
            iframe.style.display = 'none'
            document.body.appendChild(iframe)

            // Define what should happen when the response is loaded
            iframe.addEventListener('load', () => {
                // iframe.contentWindow.document - for IE<7
                let doc = iframe.contentDocument
                let innerHTML = doc.body.innerHTML

                //plain text response may be  wrapped  in <pre> tag
                if (innerHTML.slice(0, 5).toLowerCase() === '<pre>' && innerHTML.slice(-6).toLowerCase() === '</pre>') {
                    innerHTML = doc.body.firstChild.firstChild.nodeValue
                }

                // Remove iframe after receiving response
                document.body.removeChild(iframe)

                let json
                try {
                    json = JSON.parse(innerHTML)

                    let {code, message, errors} = parseFail(json)

                    if (code === 0) {
                        resolve(parseSuccess(json))
                    }
                    else {
                        const tOptions = _.pick(options, ['et', 'ft'])
                        if (!errors || errors.length === 0) {
                            reject(new Error(eh.getMsg([{code, message}], tOptions)))
                        }
                        else {
                            reject(new Error(eh.getMsg(errors, tOptions)))
                        }
                    }
                }
                catch (e) {
                    reject(e)
                }
            })

            // create form
            let form = document.createElement('form')
            form.action = url
            form.method = 'POST'
            form.enctype = 'multipart/form-data' // others
            form.encoding = 'multipart/form-data' // in IE
            form.target = iframe.name

            // Add data to form
            _.forEach(data, (v, k)=> {
                let node = document.createElement('input')
                node.name = k

                if (v instanceof HTMLInputElement) {
                    if (v.type==='file') {
                        node = $(v).clone(true)
                        v.name = k
                        $(v).hide()
                        node.insertAfter(v)
                        form.appendChild(v)
                    }
                    else {
                        node.value = v.value
                        form.appendChild(node.cloneNode())
                    }
                }
                else {
                    node.value = v
                    form.appendChild(node.cloneNode())
                }
            })

            form.style.display = 'none'
            document.body.appendChild(form)

            // submit form
            form.submit()

            // Remove form after sent
            document.body.removeChild(form)
        })
    }

    return p
        .then(res => {
            showProgress && hasFile && Progress.set(gt('txt-uploaded'))
            result = res
            return Promise.delay(1000)
        })
        .then(() => {
            showProgress && Progress.done()
            return result
        })
        .catch(err => {
            showProgress && Progress.done()
            throw err
        })
}


class Ajaxer {
    constructor(id, options={}) {
        this.id = id
        const {
            prefix,
            parseFail=defaultFailParser,
            parseSuccess=defaultSuccessParser,
            et
        } = options

        this.setupPrefix(prefix)
        this.setupResponseParser(parseFail, parseSuccess)
        this.setupErrorHandler(et)
    }

    setupPrefix(prefix) {
        this.prefix = prefix
    }

    setupResponseParser(parseFail, parseSuccess) {
        if (parseFail) {
            this.parseFail = parseFail
        }
        if (parseSuccess) {
            this.parseSuccess = parseSuccess
        }
    }

    setupErrorHandler(et) {
        if (et) {
            this.eh = createEh(`${this.id}-eh`, {et})
        }
        else {
            this.eh = globalEh
        }
    }

    one(req, options={}) {
        return one(req, {
            prefix: this.prefix,
            parseFail: this.parseFail,
            parseSuccess: this.parseSuccess,
            eh: this.eh,
            ...options
        })
    }

    all(reqArr, options={}) {
        return all(reqArr, {
            prefix: this.prefix,
            parseFail: this.parseFail,
            parseSuccess: this.parseSuccess,
            eh: this.eh,
            ...options
        })
    }

    series(reqArr, options={}) {
        return series(reqArr, {
            prefix: this.prefix,
            parseFail: this.parseFail,
            parseSuccess: this.parseSuccess,
            eh: this.eh,
            ...options
        })
    }

    multi(url, data, options={}) {
        return multi(url, data, {
            prefix: this.prefix,
            parseFail: this.parseFail,
            parseSuccess: this.parseSuccess,
            eh: this.eh,
            ...options
        })
    }

}

Ajaxer.instances = {}


/**
 * Create a new ajax handler instance
 * @param {string} id - instance id, may be used to retrieve instance in future calls
 * @param {Object} [options] - options
 * @param {function} [options.eh] - error handler instance used by this instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @return {Object} created ajax handler instance object
 *
 * @example
 *
 * const moduleAjaxer = createInstance(
 *     'module-id',
 *     {
 *         parseSuccess:(json)=>json.data,
 *         parseFail:(json, text)=>({code:json.errCode, message:json.errMessage})
 *     }
 * )
 */
export function createInstance(id, options={}) {
    if (Ajaxer.instances[id]) {
        log.error(`Cannot create instance, instance with id ${id} already exists`)
        return null
    }

    const newInstance = new Ajaxer(id, options)
    Ajaxer.instances[id] = newInstance
    return newInstance
}

/**
 * Retrieves ajax handler instance
 * @param {string} id - instance id, may be used to retrieve instance in future calls
 * @return {Object} ajax handler instance object
 *
 * @example
 * const moduleAjaxer = getInstance('module-id')
 */
export function getInstance(id) {
    return Ajaxer.instances[id]
}

const ah = createInstance('global')

export default ah