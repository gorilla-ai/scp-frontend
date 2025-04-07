import _ from "lodash";
import esLoader from "../loader/es";

let log = require('loglevel').getLogger('vbda/parser/syntax')
function syntaxParse(templateOrBody, fields, isES=true) {
    const fieldsToMap = {...fields}
    if(isES){
        if (fields.query && fields.query !== '') {
            fieldsToMap.query = esLoader.fulltextQueryParse(fields.query)
        }
        else{
            fieldsToMap.query = '*'
        }
    }
    //組ES語法
    let bReplaced = false//紀錄是否有字串被取代
    if (/\${[^}|.]+}/.test(templateOrBody)) {
        let matches = templateOrBody.match(/\${[^}]+}/g)//取得${}
        _.forEach(matches, match => {
            let matchKey = match.match(/[^${]+[^}]/)//取得${}中的字串
            let replaceTo = _.get(fieldsToMap, matchKey[0], '')
            replaceTo = replaceTo.replace(/\"/g, '\\\"')//若有雙引號的處理
            templateOrBody = templateOrBody.replace(match, replaceTo)
            if (replaceTo !== '' && replaceTo !== undefined) {
                bReplaced = true
            }
        })
    }
    let result = {}
    if (bReplaced) {
        templateOrBody = templateOrBody.replace(/'/g, '"')
        let error = false
        try {
            JSON.parse(templateOrBody)
        }
        catch (e) {
            alert('template format error')
            log.error(e)
            error = true
        }
        if (!error)
            result = JSON.parse(templateOrBody)
        else {
            log.error('match template error,use default match all')
            result = {match_all: {}}
        }
    }
    else {
        log.error('match template error,use default match all')
        result = {match_all: {}}
    }
    log.info(result)
    return result
}

function syntaxStringParse(templateOrBody, fields) {
    if (/\${[^}]+}/.test(templateOrBody)) {
        let matches = templateOrBody.match(/\${[^}]+}/g)//取得${}
        _.forEach(matches, match => {
            let matchKey = match.match(/[^${]+[^}]/)//取得${}中的字串
            let replaceTo = _.get(fields, matchKey[0], '')
            templateOrBody = templateOrBody.replace(match, replaceTo)
        })
    }
    return templateOrBody
}


export {syntaxParse, syntaxStringParse}