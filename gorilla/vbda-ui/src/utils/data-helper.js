import ah from "react-ui/build/src/utils/ajax-helper";
import {syntaxParse} from "vbda/parser/syntax";
import esLoader, {find} from "vbda/loader/es";
import parseEvents from "vbda/parser/es-hits";
import moment from "moment/moment";

/**
 *
 * @param dtCfg
 * the config of dt to search
 * @param fields
 * {query,time:{from,to}}
 * @param pageInfo
 * {size,pageFrom,sortBy,sortDesc}
 * @returns {*}
 */
function fulltextSearch({dtId, dtCfgs, searches, fields, pageInfo = {size: 0}}) {
    const dtCfg = dtCfgs[dtId]
    const searchConfig = searches [dtCfg.fulltext_search]
    return fulltextSearchWithSearchConfig({dtId, dsId:dtCfg.ds, searchConfig, fields, pageInfo})
}

/**
 *
 * @param ds
 * @param searchConfig
 * @param fields
 * @param pageInfo
 * @returns {*}
 */
function fulltextSearchWithSearchConfig({dtId, dsId, searchConfig, fields, pageInfo = {size: 0}}) {
    switch (searchConfig.query_type) {
        case 'base_service':
        default:
            let template = searchConfig.template
            return esLoader.find({
                ds: dsId,
                dt: dtId,
                start: fields.time.from,
                end: fields.time.to,
                fields,
                template,
                ...pageInfo
            })
                .then(data => {
                    return {total: data.hits.total, data: parseEvents(data.hits.hits)}
                })
        case 'json_request':
            const {url, body} = searchConfig
            // if (fields.query === '*') {
            //     fields.query = ''
            // }
            if (pageInfo.sortBy === '__insertTime') {
                pageInfo.sortBy = undefined
            }
            const query = syntaxParse(body, fields, false)
            const {size, pageFrom, sortBy, sortDesc} = pageInfo
            let newPageInfo = {size}
            newPageInfo.from = pageFrom ? pageFrom * size + 1 : 1
            if (sortBy !== undefined && sortDesc !== undefined) {
                newPageInfo.order = sortDesc ? 'desc' : 'asc'
                newPageInfo.orderfield = sortBy
            }
            return ah.one({
                url: url,
                type: 'POST',
                data: JSON.stringify({...query, ...newPageInfo}),
                contentType: 'application/json'
            })
                .then(({searchResult, total}) => {
                    return {total: total, data: searchResult}
                })
        // return ah.one({
        //     url: url,
        //     type: 'POST',
        //     data: JSON.stringify(query),
        //     contentType: 'application/json'
        // })
        //     .then(res => {
        //         return {...res}
        //     })
    }
}


function findAll(originalQuery, searchConfig, dtId, dsId) {
    let fields = {
        query: originalQuery.query,
        time: {
            from: moment(originalQuery.time.from).utc().format('YYYY-MM-DDTHH:mm:ss.000') + 'Z',
            to: moment(originalQuery.time.to).utc().format('YYYY-MM-DDTHH:mm:ss.999') + 'Z'
        }
    }
    return fulltextSearchWithSearchConfig({dtId, dsId, searchConfig, fields, pageInfo:{size:10000}})
}
export {fulltextSearch, fulltextSearchWithSearchConfig, findAll}