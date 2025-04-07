const _ = require('lodash')

/**
 * @module es-agg
 * @description ES aggregation parser
 */

/**
 * Parses both request and response body of Elasticsearch query into Chart API Series' middle format.
 *
 * @param {Object} request The object containing query (and aggs) part of Elasticsearch request body. Only the aggs part will be used.
 * @param {Object} response One element from responses part of Elasticsearch response body. Currently only supports one response body. If an array is passed, only the first element will be used.
 * @param {string} [idSeparator=_] Separates aggregation ID with the aggregation field name.
 * @return {Object} Chart API Series formatted object.
 */

const esFormat = (request, response, idSeparator) => {
    if (!idSeparator) {
        idSeparator = '_'
    }

    let exploreRequest = obj => {
        let result = []

        if (obj.aggs) {
            // For each agg labels
            _.forEach(obj.aggs, (el, aggName) => {
                let aggDets = {}

                // For each agg types. Look for non "aggs" children.
                // Non-Aggs children should be the aggregation type (dangerous assumption!)
                // Later we need to note all aggregation types.
                _.forEach(el, (aggDetails, aggType) => {
                    // Note field names
                    if (aggType != 'aggs') {
                        aggDets.field = aggDetails.field ? aggDetails.field : ''
                        aggDets.aggName = aggName
                        aggDets.aggType = aggType
                    }
                })

                // One level deeper
                aggDets.children = exploreRequest(el)

                result.push(aggDets)
            })
        }

        return result
    }

    let exploreResponse = (obj, fields) => {
        let result = {}

        // Aggregation names from request body
        let aggNames = fields.map(el => el.aggName)

        // For calculating others
        let totalAggValue = 0
        let totalAggCount = 0
        let aggField = ''

        // If it is tree root, go straight to the aggregations
        if (obj.aggregations) {
            obj = obj.aggregations
        }

        // Explore each aggregation names
        aggNames.forEach(aggName => {
            // Current field properties
            let field = fields.find(field => field.aggName == aggName)

            if (!obj[aggName].buckets) {
                // Leaf part, fill with values
                result[field.field] = obj[aggName].value

                // Add field as key to 'others'
                aggField = field.field
                result.others = {
                    [aggField]: 0
                }
            }
            else {
                // Branch part, explore deeper buckets
                let buckets = obj[aggName].buckets
                buckets.forEach(bucket => {
                    result[bucket.key] = exploreResponse(bucket, field.children)

                    // Retrieve sum of value for calculating others
                    _.forEach(result[bucket.key], (el, key) => {
                        if (typeof el !== 'object' && key !== 'count') {
                            totalAggValue += el
                        }
                    })

                    totalAggCount += bucket.doc_count
                })
            }
        })

        result.count = obj.doc_count || 0

        if (result.others && totalAggCount) {
            result.others.count = result.count - totalAggCount
            result.others[aggField] = result[aggField] - totalAggValue
        }
        else {
            // totalAggCount = 0 means reaching leaf, which doesn't need 'others'
            delete result.others
        }

        return result
    }

    let flatten = (respObj, fields, curObj) => {
        if (!curObj) {
            curObj = {}
        }

        // Decide whether we push the object into the array
        let update = false

        let aggNames = fields.map(el => el.aggName)

        // Doc_count
        if (!aggNames.length) {
            update = true
        }

        aggNames.forEach(aggName => {
            let field = fields.find(field => field.aggName == aggName)

            _.forEach(respObj, (el, key) => {
                if (typeof el === 'object' && el && field.children.length) {
                    curObj[aggName] = el[field.field] ? el[field.field] : key
                    curObj[aggName+idSeparator+'count'] = el.count

                    // If the current level is still an object, go deeper
                    flatten(_.clone(el), field.children, _.clone(curObj))
                }
                else if (field.field == key) {
                    // Reached leaf, update the array
                    curObj[aggName] = el
                    update = true
                }
            })
        })

        if (update) {
            flatResult.push(curObj)
        }
    }

    // Field names, types, obtained from request body.
    let fields = exploreRequest(request)

    // Field values obtained from response body, combined with field names from request body.
    if (Array.isArray(response)) {
        response = response[0]
    }
    let result = exploreResponse(response, fields)

    // Flat format
    let flatResult = []
    flatten(result, fields)

    return flatResult
}

module.exports = esFormat