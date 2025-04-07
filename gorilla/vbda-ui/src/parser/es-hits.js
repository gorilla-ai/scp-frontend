import _ from 'lodash'

/**
 * @module es-hits
 * @description ES hits parser
 */

/**
 * Parses ES response hits into standard object array.
 * @param {array.<object>} hits - ES hits
 * @param {array.<string>} columns - Which columns to retrieve?
 * @return {array.<object>}
 */
export default function (hits, columns) {
    return hits.map(hit=>{
        let {_id, _index, _type, _source} = hit
        if (columns) {
            _source = _.pick(_source, [...columns, '__s_uuid', '__data_type', '__data_source'])
        }
        return {_id, _index, _type, ..._source}
    })
}