import React from 'react'
// import Babel from 'babel-core'

let log = require('loglevel').getLogger('loader')

export function loadWidget(fileName) {
    try {
        let requireFile = require('widgetsPath/' + fileName);
        log.info('Widget Loaded', requireFile)
        return new Promise(resolve => {
            resolve(requireFile.default)
        })
    } catch (e) {
        log.error(`Load Widget [${fileName}] fail`)
        log.error(e)
        throw {message: `Load Widget [${fileName}] fail`}
    }
}

// export function loadWidgetTest(fileName) {
//     return new Promise(function (resolve, reject) {
//         var request = new XMLHttpRequest();
//
//         request.onload = function () {
//             if (request.status >= 200 && request.status < 400) {
//                 var remoteComponentSrc = request.responseText;
//                 eval(remoteComponentSrc)
//                 return resolve(eval(fileName));
//             } else {
//                 return reject();
//             }
//         };
//
//         request.open('GET', '/widget/' + fileName);
//         request.send();
//     });
// }

// export function loadWidgetTest(fileName) {
//     const url = '/widget/' + fileName
//     const windowRequire = require
//     return fetch(url)
//         .then(res => res.text())
//         .then(source => {
//             var exports = {}
//             function require(name) {
//                 // return require(name)
//                 let lib = windowRequire(name)
//                 log.info(lib)
//                 if (name === 'react')
//                     return lib
//                 else throw `You can't use modules other than "react" in remote component.`
//             }
//
//             log.info(source)
//             eval(source)
//             log.info(exports)
//             return exports.__esModule ? exports.default : exports
//         })
// }

export default {
    load: loadWidget,
    // loadWidgetTest
}