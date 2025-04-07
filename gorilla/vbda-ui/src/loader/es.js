import _ from 'lodash'
import moment from "moment";
import {syntaxParse} from "../parser/syntax";

import ah from 'react-ui/build/src/utils/ajax-helper'

let log = require('loglevel').getLogger('vbda/loader/es')

let API_PREFIX= '/api'

export function setupPrefix(prefix) {
    API_PREFIX = prefix
}

export function fulltextQueryParse(originalQueryString) {
    let queryString = ''
    let split = originalQueryString.split(" ");
    _.forEach(split, (string) => {
        switch (string) {
            case '&':
                queryString += ' AND'
                break;
            case '|':
                queryString += ' OR'
                break;
            case '':
                break;
            default:
                queryString += ' *' + string + '*'
                break;
        }
    })
    return queryString
}

export function findAll(originalQuery, searchCfg, dtId, dsId, apiPrefix) {
        // let queryString = ''
        // let originalQueryString = originalQuery.query
        // if (originalQueryString && originalQueryString !== '') {
        //     queryString = fulltextQueryParse(originalQueryString)
        // }
        // else
        //     queryString = originalQueryString
        // if (!(queryString && queryString !== '')) {
        //     queryString = '*'
        //     /*if(!sortBy){
        //         sortBy = '__receiveTime'
        //         sortDesc = true
        //     }*/
        // }
        let query = {
            query: originalQuery.query,
            time: {
                from: moment(originalQuery.time.from).utc().format('YYYY-MM-DDTHH:mm:ss.000') + 'Z',
                to: moment(originalQuery.time.to).utc().format('YYYY-MM-DDTHH:mm:ss.999') + 'Z'
            }
        }

        let timeStart = query.time.from
        let timeEnd = query.time.to

        return find({
            ds: dsId,
            dt: dtId,
            start: timeStart,
            end: timeEnd,
            fields: query,
            template:searchCfg.template,
            columns: [ '__s_uuid','__data_source','__data_type']
        }, apiPrefix)
}

export function find(params, apiPrefix=API_PREFIX) {
    const {
		ds: dataSource,
		dt: dataType,
		start: startDttm,
		end: endDttm,
		fields,
		template,
        sortBy,
        sortDesc,
        size = 10000,
        pageFrom,
        columns
	} = params
    log.info('find', params)

    //組ES語法
    let qureryString = template
    // let bReplaced = false//紀錄是否有字串被取代
    // if (/\${[^}|.]+}/.test(qureryString)) {
    //     let matches = qureryString.match(/\${[^}]+}/g)//取得${}
    //     _.forEach(matches, match=>{
    //         let matchKey = match.match(/[^${]+[^}]/)//取得${}中的字串
    //         let replaceTo = _.get(fields, matchKey[0], '')
    //         replaceTo = replaceTo.replace(/\"/g, '\\\"')//若有雙引號的處理
    //         qureryString = qureryString.replace(match, replaceTo)
    //         if (replaceTo !== '' && replaceTo !== undefined) { bReplaced = true }
    //     })
    // }
    // let query = {}
    // if (bReplaced) {
    //     qureryString = qureryString.replace(/'/g, '"')
    //     let error = false
    //     try {
    //         JSON.parse(qureryString)
    //     }
    //     catch (e) {
    //         alert('template format error')
    //         log.error(e)
    //         error = true
    //     }
    //     if (!error)
    //         query = JSON.parse(qureryString).query
    //     else {
    //         log.error('match template error,use default match all')
    //         query = {match_all: {}}
    //     }
    // }
    // else {
    //     log.error('match template error,use default match all')
    //     query = {match_all: {}}
    // }
    const query = syntaxParse(qureryString,fields).query
    // let sort ? sort : "__s_uuid"
    let statement = {query, size}
    statement.from = pageFrom ? pageFrom * size : 0
    if (sortBy !== undefined && sortDesc !== undefined) {
        statement.sort = [{[sortBy]: {order:sortDesc ? 'desc' : 'asc', unmapped_type : "date"}}]
    }
    if (columns) {
        statement._source = {includes:columns}
    }
    let request =
        {
            indexSources: [
                {
                    dataSource,
                    dataType
                }
            ],
            startDttm,
            endDttm,
            statement
        }
    if (startDttm && endDttm)
        request = {...request, startDttm, endDttm}


    return ah.one({
        url: `${apiPrefix}/events/_search`,
        type: 'POST',
        data: JSON.stringify(request),
        contentType: 'application/json'
        },
        {
            parseSuccess: (json) => json,
            parseFail: (json, text) => {
                return {code: json.code, message: _.get(json, ['reason', 'error', 'caused_by', 'reason'], json.message)}
            }
        }
    ) //portal serivce
}
export function eventCreate(dataSource, dataType, data) {
    let request = {
        dataSource,
        dataType,
        data
    }
    return ah.one({
        url: `${API_PREFIX}/events?refresh=true`,
        type: 'POST',
        data: JSON.stringify(request),
        contentType: 'application/json'
    })
}
export function eventUpdate(data) {
    let request = {}
    _.map(data, (val, key) => {
        if (key.match(/_.*/g) === null)
            request[key] = _.cloneDeep(val)
    })
    log.info('update event in :', data._index, data._id)
    log.info('output data:', request)
    return ah.one({
        url: `${API_PREFIX}/events/${data._index}/${data._id}?refresh=true`,
        type: 'PATCH',
        data: JSON.stringify(request),
        contentType: 'application/json'
    })

}
export function eventDelete(event) {
    log.info('delete event in :', event._index, event._id)
    return ah.one({url: `${API_PREFIX}/events/${event._index}/${event._id}?refresh=true`, type: 'DELETE'})
}
export function test() {
    log.info('test')
}

export default {
    fulltextQueryParse,
    find,
    eventCreate,
    eventUpdate,
    eventDelete,
    setupPrefix,
    test
}