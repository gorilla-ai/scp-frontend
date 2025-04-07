/**
  * @module download
  * @description A set of client-side download utils
  */

import _ from 'lodash'
import h2c from 'html2canvas'
import qs from 'query-string'

let log = require('loglevel').getLogger('utils/download')

const TYPES = {
    png: 'image/png',
    jpg: 'image/jpeg',
    gif: 'image/gif',
    tiff: 'image/tiff',
    json: 'text/json;charset=utf-8'
}

export function downloadDataUrl(dataUrl, filename='download', extension) {
    // Anchor
    let anchor = document.createElement('a')
    anchor.setAttribute('href', dataUrl)
    anchor.setAttribute('download', filename + '.' + extension)

    // Click event
    let event = document.createEvent('MouseEvent')
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0,
        false, false, false, false, 0, null)

    anchor.dispatchEvent(event)
    // document.removeChild(anchor)
    // delete anchor;
}

function downloadBlob(blob, filename='download', extension, mime='') {
    navigator.msSaveBlob(new Blob(
        Array.isArray(blob) ? blob : [blob],
        {type:TYPES[extension] || mime}
    ), filename+'.'+extension)
}

/**
 * Download by following a link
 * @param {string} url - url to download link
 * @param {string|object} params - params to supply to url
 *
 * @example
 * // will download file from link with date param
 * downloadLink('/get/my/link', {date:'2012-02-10'})
 */
export function downloadLink(url, params) {
    let paramsStr = ''
    if (_.isString(params)) {
        paramsStr = params
    }
    else if (_.isObject(params)) {
        paramsStr = qs.stringify(params)
    }

    let anchor = document.createElement('a')
    anchor.setAttribute('href', `${url}${paramsStr ? '?'+paramsStr : ''}`)
    anchor.setAttribute('target', '_blank')

    // Click event
    let event = document.createEvent('MouseEvent')
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0,
        false, false, false, false, 0, null)
    anchor.dispatchEvent(event)
}

/**
 * Download content as file (client side only)
 * Supports IE10+, chrome, firefox
 * @param {string | ArrayBuffer[] | ArrayBufferView[] | Blob[] | DOMString[]} content - content to save to file. If enable blob, it should be array of ArrayBuffer, ArrayBufferView, Blob, or (utf-8)DOMString
 * @param {string} filename - download as filename
 * @param {string} extension - file extension which supports png, jpg, gif, tiff, and json. For other extensions, use options.mime to customize when options.blob is false.
 * @param {object} [options] - download by BLob and its options
 * @param {boolean} [options.blob=false] - download by BLob?
 * @param {string} [options.mime=''] - MIME type of the content for the blob, e.g., 'text/plain;charset=UTF-8'.
 *
 * @example
 * // will download file json_file.json  containing {a:'b'} as content
 * let obj = {a:'b'}
 * downloadFile(JSON.stringify(obj),'json_file','json')
 *
 * // will download file text_file.txt containing 'plain text' as content
 * downloadFile('plain text','text_file','txt')
 */
export function downloadFile(content, filename, extension, options={blob:false, mime:''}) {
    if ('download' in document.createElement('a')) {
        const enableBlob = _.get(options, 'blob', false)
        const mime = _.get(options, 'mime', '')

        if (enableBlob) {
            const blob = new Blob(content, {type:mime || TYPES[extension]})

            const link = document.createElement('a')
            const url = window.URL.createObjectURL(blob)

            link.href = url
            link.download = `${filename}.${extension}`
            link.click()
        }
        else {
            downloadDataUrl(
                'data:'+(mime || TYPES[extension])+','+encodeURIComponent(content),
                filename,
                extension
            )
        }

        return null
    }
    else if (navigator.msSaveBlob) { // IE10+
        const mime = _.get(options, 'mime', '')
        return downloadBlob(content, filename, extension, mime)
    }
    else {
        log.error('file download from client side not supported')
        return null
    }
}

/**
 * Download using form submission to server
 * Supports IE9+, chrome, firefox
 * @param {string} url - download url
 * @param {object} data - key-value pair of data to submit
 *
 * @example

downloadWithForm('/api/url/filename', {key1:'val1', key2:'val2'})
 */
export function downloadWithForm(url, data) {
    // create form
    let form = document.createElement('form')
    form.action = url
    form.method = 'POST'
    // must set response to a different window (or iframe)
    // otherwise after download, in ie9 all future button clicks will trigger download again
    form.target = '_blank'

    // Add data to form
    _.forEach(data, (v, k)=> {
        let node = document.createElement('input')
        node.name = k
        node.value = v
        form.appendChild(node)
    })

    form.style.display = 'none'
    document.body.appendChild(form)

    // submit form
    form.submit()

    // Remove form after sent
    document.body.removeChild(form)
}

/**
 * Download HTML5 canvas as file
 * Supports IE10+, chrome, firefox
 * @param {node} canvas - HTML5 canvas image to save to file
 * @param {string} filename - download as filename
 * @param {string} extension - file extension
 *
 * @example
 * // will download file img_file.png with canvas image
 * downloadCanvas(canvas,'img_file','png')
 */
export function downloadCanvas(canvas, filename, extension='png') {
    if (navigator.msSaveBlob) { // IE10
        return downloadBlob(canvas.msToBlob(), filename, extension)
    }
    else {
        downloadDataUrl(canvas.toDataURL(TYPES[extension]), filename, extension)
        return null
    }
}

/**
 * Download HTML as png image
 * Supports IE9+, chrome, firefox
 * @param {string} dom=document.body - target DOM
 * @param {string} filename='download' - download as filename.png
 * @param {string} extension='png' - file extension
 *
 * @example
 * // will download file dom.png with content of '#domId'
 * downloadHtmlAsImage(document.getElementById('domId'),'dom')
 */
export function downloadHtmlAsImage(dom, filename, extension) {
    const target = dom || document.body
    h2c(target, {allowTaint:true, foreignObjectRendering:true})
        .then(canvas => {
            downloadCanvas(canvas, filename, extension)
        })
        .catch(err => {
            log.error(err.message)
        })
}
