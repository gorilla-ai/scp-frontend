import _ from 'lodash'
import moment from 'moment'

import {default as ah} from 'core/utils/ajax-helper'

import SERVICES from 'app/consts/web-services'
import {getSession} from 'app/redux'


const log = require('loglevel').getLogger('utils/api-helper')

export const CONFIG_TYPE = {
    WIDGET: "widget",
    PLUGIN: "plugin",
    DASHBOARD: "dashboard"
}

let CONFIG_SERVICE = '/api/config_service/configurations'

export function setupConfigService(url) {
    CONFIG_SERVICE = url + '/config_service/configurations'
}

export function saveLog({module, actionType, actionId, params, success}) {
    const {id, username, name} = getSession()
    const data = {
        moduleid: module,
        timestamp: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
        sourceid: actionType,
        sourcename: actionType,
        actionid: actionId,
        actiondesc: JSON.stringify(params),
        target: 'na',
        account: username,
        userid: id,
        username: name,
        ip: 'na',
        actionresult: success?0:1,
        severity: 1
    }
    log.info('saveLog', data)
    return ah.one({
        url: `${SERVICES.AUDIT}/logs`,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json'
    }, {
        showProgress: false // silently save logs
    })
}

export function getUIFrameworkConfig(url = '/api/configuration_service/ui_framework') {
    return ah.one({
        url: url,
        contentType: 'application/json'
    })
}
// export function getUIFrameworkConfig() {
//     return ah.one({
//         url: '/api/kirk_service/allEnter'
//     })
// }

/**
 *
 * @param configType: widget plugin dashboard
 * @param data
 * data(不帶時則會取全部):
 {
     "constraintField1":value,
     "constraintField2":value
 }
 * @param mode:history(不帶時取現行，帶時取歷史資料)
 * @param size
 * @param without_value
 * @param field 要搜尋的欄位
 * @param ajaxOptions
 * @returns {*}
 */
export function getConfigList(configType, {data={}, mode = 'current', size = 10000, without_value=false, field=undefined}, ajaxOptions) {
    log.info(configType)
    // const multiPart = new FormData()
    // if (data)
    //     multiPart.append('data', JSON.stringify(data))
    // multiPart.append('mode', mode)
    // multiPart.append('size', size.toString())
    const request = {
        data, mode, size, without_value, field
    }
    return ah.one({
        url: `${CONFIG_SERVICE}/${configType}/_search`,
        type: 'POST',
        // data: multiPart,
        // processData: false,
        // contentType: false,
        data: JSON.stringify(request),
        contentType: 'application/json',
    }, ajaxOptions)
}
