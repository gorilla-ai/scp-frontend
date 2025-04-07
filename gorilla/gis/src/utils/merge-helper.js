/**
 * A helper for merging global and self props
 *
 * @file   Functions related to symbol creation, update, and getter.
 * @author Liszt
 */

import _ from 'lodash'

/**
 * This is for merging global and local symbolProps or trackProps. Only object-props will be merged here,
 * As for other props, the former ones will be replaced by the later ones if they have different type.
 * E.g.,
 * {heatmap:{radisu:100}} and {heatmap:{intensity:0.5}} will merge as {heatmap:{radisu: 100,intensity:0.5}}
 * while {heatmap:{radisu:100}} and {heatmap:true} will merge as {heatmap:true} because the inputs have different type,
 * later props heatmap replace the former one
 *
 * @param {Object} props    Props to be merged with.
 * @param {Object} sources  All source props.
 *
 * @return {Object}    The merged props
 */

export function mergeProps({props:symbolProps, ...symbolData}, sources) {
    if (_.isArray(sources) && sources.length === 0) {
        return {}
    }

    const props = _.mergeWith({}, ...sources, (objVal, srcVal, key) => {
        if (key === 'className' && srcVal) {
            const srcStr = srcVal.replace(/\s{2,}/g, ' ').split(' ')
            objVal = objVal || []
            objVal = _.concat(objVal, srcStr)

            return objVal
        }
        else if (_.isPlainObject(objVal) && _.isPlainObject(srcVal)) {
            return {...objVal, ...srcVal}
        }
        else {
            return _.isBoolean(srcVal) ? srcVal : (srcVal || objVal)
        }
    })

    if (props.className) {
        props.className = _.chain(props.className).uniq().join(' ').value()
    }

    _.forEach(props, (prop, key) => {
        if (_.isFunction(prop)) {
            props[key] = prop({...symbolData, ...symbolProps})
        }
    })

    // These four types of props will be normalized as object here
    // icon will become { iconUrl:'...' } and label/tooltip/popup will be {content:'...'}
    _.forEach(['label', 'tooltip', 'popup', 'icon'], propKey => {
        if (props[propKey] && !_.isPlainObject(props[propKey])) {
            props[propKey] = propKey === 'icon' ?
                            { iconUrl:props[propKey] } :
                            { content:props[propKey] }
        }
    })

    return _.omitBy(props, _.isNil)
}