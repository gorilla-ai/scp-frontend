import React from 'react'
import _ from 'lodash'
import Promise from 'bluebird'
// import Babel from 'babel-core'
import ReactUi from 'react-ui'
import ReactChart from 'react-chart'
import ah from "react-ui/build/src/utils/ajax-helper";

let log = require('loglevel').getLogger('loader')

let CONFIG_SERVICE = '/api/config_service/configurations'
let lng = 'zh';

export function setupConfigService(url) {
    CONFIG_SERVICE = url + '/config_service/configurations'
}
let ALL_DEPENDENCY = {}

export function setWidgetLocales(locale){
    lng = locale;
}

export function getWidgetLocales(){
    return lng;
}

export function setWidgetDependency(dependency){
    _.forEach(dependency, (dependency, name)=>{
        log.info('dependency setup ', name)
    })
    ALL_DEPENDENCY = dependency
    ALL_DEPENDENCY['default'] = {
        Dashboard: require('../widgets/Dashboard').default,
        alarm: require('../widgets/alarm').default,
    };
}

export function loadWidget(fileName) {
    try {
        let requireFile = loadWidgetSync(fileName)
        return new Promise(resolve => {
            resolve(requireFile)
        })
    } catch (e) {
        log.error(e)
        throw {message: e.message ? e.message : `Load Widget [${fileName}] fail`}
    }
}

export function loadWidgetSync(fileName) {
    try {
        let requireFile
        const packageName = fileName.split('/')[0]
        const widgetName = fileName.split('/')[1]

        if (!_.isEmpty(ALL_DEPENDENCY)) {
            requireFile = ALL_DEPENDENCY[packageName][widgetName]
        }
        else if (_.startsWith(fileName, 'react-ui/')) {
            requireFile = ReactUi[fileName.split('/')[1]]
        } else if (_.startsWith(fileName, 'react-chart/')) {
            requireFile = ReactChart[fileName.split('/')[1]]
        }
        else if (_.startsWith(fileName, 'default/')) {
            requireFile = require('../widgets/' + fileName.split('/')[1]).default;
        }
        else {
            // requireFile = require('widgetsPath/' + fileName).default;
            throw {message: `Widget [${fileName}] not found`}
        }
        if (_.isNil(requireFile))
            throw {message: `Widget [${fileName}] not found`}
        // log.info(`Widget Loaded [${fileName}]`)
        requireFile.displayName = fileName
        return requireFile
    } catch (e) {
        log.error(e)
        throw {message: e.message ? e.message : `Load Widget [${fileName}] fail`}
    }
}

/**
 * @param query
 * @param query.url
 * @param query.data
 * @param query.type
 * @param isMulti boolean
 * @param selectKey
 * @param key
 * @returns {*}
 */
export function loadSource({query, isMulti = false, selectKey = null}, key = null) {
    // if (!_.isNil(query.data) && !_.isEmpty(query.data)) {
    if (_.isNil(query.data) || _.isEmpty(query.data))
        query.data = {}
    if (isMulti) {
        const formJson = _.mapValues(query.data, (v, k) => {
            if (v.type === 'file' || _.isString(v)) {
                return v
            }
            else {
                return JSON.stringify(v)
            }
        })
        return ah.multi(query.url, formJson)
            .then(data => {
                return key?{[key]:data}:data
            })

    }
    else {
        let type = query.type ? query.type : 'post'
        type = _.upperCase(type)
        let data = query.data
        let contentType = null
        switch (type) {
            case 'GET':
                break;
            default: //others
                data = JSON.stringify(data)
                contentType = 'application/json'
        }
        const req = {
            contentType,
            type: type,
            url: query.url,
            data: data
        }
        return ah.one(req)
            .then(data => {
                if(selectKey){
                    data = _.get(data,selectKey)
                }
                return key?{[key]:data}:data
            })
    }
    // }
    // else {
    // const defaultReq = {
    //     contentType: 'application/json',
    //     type: query.type ? query.type : 'get'
    // }
    // const req = _.assign(defaultReq, query)
    // return ah.one(req)
    //     .then(data => {
    //         if(selectKey){
    //             data = _.get(data,selectKey)
    //         }
    //         log.info(data)
    //         return key?{[key]:data}:data
    //     })
    // }
}

/**
 * @param id
 * @returns {*}
 */
export function loadConfigById(id) {
    let type = 'widget'
    if(id.indexOf('dashboard/')!==-1){
        id = _.replace(id,'dashboard/', '')
        type = 'dashboard'
    }
    return ah.one(`${CONFIG_SERVICE}/${type}?id=${id}`)
        .then(data => {
            return JSON.parse(data.data)
            // return data
        })
}
/**
 * @param url
 * @returns {*}
 */
export function loadWidgetConfigByUrl(url) {
    return ah.one(url)
        .then(data => {
            return data
        })
}

// export function loadStoreData(config) {//針對單一store load，可先判斷是否重新讀取，取得的值放在哪也應由呼叫的一方判斷
//     log.info('load store data BEGIN')
//     const {selectKey, query} = config
//     const type = _.upperCase(query.type ? query.type : (query.data ? "POST" : 'GET'))
//     let ajaxRequst = {
//         type,
//         url: query.url
//     }
//     switch (type) {
//         case 'GET':
//         default:
//             break;
//         case 'POST': //others
//             ajaxRequst = {
//                 ...ajaxRequst,
//                 data: JSON.stringify(query.data),
//                 contentType: 'application/json'
//             }
//             break;
//     }
//     log.info(`load store with`, ajaxRequst)
//     return ah.one(ajaxRequst, {showProgress: false})
//         .then(data => {
//             if (selectKey) {
//                 data = _.get(data, selectKey)
//             }
//             log.info(`store loaded success.`, data)
//             return data
//         })
//         .catch((error) => {
//             log.error(`store loaded fail.`, error)
//             throw error
//         })
// }
/**
 *
 * @param {object} config
 * @param {object} [config.selectKey]
 * @param {object} config.query - ajax query format
 * @param {string} config.query.url - request url
 * @param {string} config.query.type - request type 'get' | 'post'
 * @param {string} [config.query.data] - request body
 * @param options
 * @returns {Promise}
 */
export function loadDataWithQueryConfig(config, options = {}) {//針對單一store load，可先判斷是否重新讀取，取得的值放在哪也應由呼叫的一方判斷
    log.info('Load Data Begin')
    const {selectKey, query} = config
    const {showProgress = false} = options
    const type = _.upperCase(query.type ? query.type : (query.data ? "POST" : 'GET'))
    let ajaxRequest = {
        type,
        url: query.url
    }
    switch (type) {
        case 'GET':
        default:
            ajaxRequest = {
                ...ajaxRequest,
                data: query.data
            }
            break;
        case 'POST': //others
            ajaxRequest = {
                ...ajaxRequest,
                data: JSON.stringify(query.data),
                contentType: 'application/json'
            }
            break;
    }
    log.info(`Load Data With`, ajaxRequest)
    return ah.one(ajaxRequest, {showProgress})
        .then(data => {
            if (selectKey) {
                data = _.get(data, selectKey)
            }
            log.info(`Load Data Success.`, data)
            return data
        })
        .catch((error) => {
            log.error(`Load Data Failed.`, error)
            throw error
        })
}

export default {
    load: loadWidget,
    loadWidgetSync,
    loadSource,
    loadConfigById,
    loadWidgetConfigByUrl,
    loadDataWithQueryConfig,
    setWidgetDependency,
    setWidgetLocales,
    getWidgetLocales
}
