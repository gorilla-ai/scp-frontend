'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _ = require('lodash');

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

var esFormat = function esFormat(request, response, idSeparator) {
    if (!idSeparator) {
        idSeparator = '_';
    }

    var exploreRequest = function exploreRequest(obj) {
        var result = [];

        if (obj.aggs) {
            // For each agg labels
            _.forEach(obj.aggs, function (el, aggName) {
                var aggDets = {};

                // For each agg types. Look for non "aggs" children.
                // Non-Aggs children should be the aggregation type (dangerous assumption!)
                // Later we need to note all aggregation types.
                _.forEach(el, function (aggDetails, aggType) {
                    // Note field names
                    if (aggType != 'aggs') {
                        aggDets.field = aggDetails.field ? aggDetails.field : '';
                        aggDets.aggName = aggName;
                        aggDets.aggType = aggType;
                    }
                });

                // One level deeper
                aggDets.children = exploreRequest(el);

                result.push(aggDets);
            });
        }

        return result;
    };

    var exploreResponse = function exploreResponse(obj, fields) {
        var result = {};

        // Aggregation names from request body
        var aggNames = fields.map(function (el) {
            return el.aggName;
        });

        // For calculating others
        var totalAggValue = 0;
        var totalAggCount = 0;
        var aggField = '';

        // If it is tree root, go straight to the aggregations
        if (obj.aggregations) {
            obj = obj.aggregations;
        }

        // Explore each aggregation names
        aggNames.forEach(function (aggName) {
            // Current field properties
            var field = fields.find(function (field) {
                return field.aggName == aggName;
            });

            if (!obj[aggName].buckets) {
                // Leaf part, fill with values
                result[field.field] = obj[aggName].value;

                // Add field as key to 'others'
                aggField = field.field;
                result.others = _defineProperty({}, aggField, 0);
            } else {
                // Branch part, explore deeper buckets
                var buckets = obj[aggName].buckets;
                buckets.forEach(function (bucket) {
                    result[bucket.key] = exploreResponse(bucket, field.children);

                    // Retrieve sum of value for calculating others
                    _.forEach(result[bucket.key], function (el, key) {
                        if ((typeof el === 'undefined' ? 'undefined' : _typeof(el)) !== 'object' && key !== 'count') {
                            totalAggValue += el;
                        }
                    });

                    totalAggCount += bucket.doc_count;
                });
            }
        });

        result.count = obj.doc_count || 0;

        if (result.others && totalAggCount) {
            result.others.count = result.count - totalAggCount;
            result.others[aggField] = result[aggField] - totalAggValue;
        } else {
            // totalAggCount = 0 means reaching leaf, which doesn't need 'others'
            delete result.others;
        }

        return result;
    };

    var flatten = function flatten(respObj, fields, curObj) {
        if (!curObj) {
            curObj = {};
        }

        // Decide whether we push the object into the array
        var update = false;

        var aggNames = fields.map(function (el) {
            return el.aggName;
        });

        // Doc_count
        if (!aggNames.length) {
            update = true;
        }

        aggNames.forEach(function (aggName) {
            var field = fields.find(function (field) {
                return field.aggName == aggName;
            });

            _.forEach(respObj, function (el, key) {
                if ((typeof el === 'undefined' ? 'undefined' : _typeof(el)) === 'object' && el && field.children.length) {
                    curObj[aggName] = el[field.field] ? el[field.field] : key;
                    curObj[aggName + idSeparator + 'count'] = el.count;

                    // If the current level is still an object, go deeper
                    flatten(_.clone(el), field.children, _.clone(curObj));
                } else if (field.field == key) {
                    // Reached leaf, update the array
                    curObj[aggName] = el;
                    update = true;
                }
            });
        });

        if (update) {
            flatResult.push(curObj);
        }
    };

    // Field names, types, obtained from request body.
    var fields = exploreRequest(request);

    // Field values obtained from response body, combined with field names from request body.
    if (Array.isArray(response)) {
        response = response[0];
    }
    var result = exploreResponse(response, fields);

    // Flat format
    var flatResult = [];
    flatten(result, fields);

    return flatResult;
};

module.exports = esFormat;