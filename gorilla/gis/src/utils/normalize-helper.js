import _ from 'lodash'

const SPECIAL = ['className', 'tooltip', 'popup', 'label', 'icon']
const RENDERABLES = [
    'tooltip',
    'popup',
    'label',
    'icon',
    'track',
    'cluster',
    'group',
    'type'
]

// For tooltip/popup/label/icon/track/cluster/group which is a function
export function normalizeRenderable(symbolData, srcProps={}, srcSelectedProps={}) {
    const tgtProps = _.cloneDeep(srcProps)
    const tgtSelected = _.cloneDeep(srcSelectedProps)

    const setRenderable = (src, key, {id, type, props, selected, selectedProps}) => {
        // 'type' may be from 'props' because it may be defined in symbolOptions, not symbol data itself
        const result = _.isFunction(src[key]) ?
                        src[key]({id, type:type || props.type, ...props, selected, selectedProps}) :
                        null

        // Only normalize the prop when src[key] returns a String, or a Boolean for cluster/group
        const shouldNormalize = _.isString(result) ||
                                (_.isPlainObject(result) && !_.includes(['track', 'cluster', 'group', 'type'], key)) ||
                                ((key === 'cluster' || key === 'group') && _.isBoolean(result))

        if (shouldNormalize) {
            _.set(src, key, result)
        }
    }

    _.forEach(RENDERABLES, prop => {
        setRenderable(tgtProps, prop, symbolData)
        setRenderable(tgtSelected, prop, symbolData)
    })

    return {
        props: tgtProps,
        selectedProps: tgtSelected
    }
}

/* Argument is an array of symbol props.className */
export function normalizeClassname(srcClasses) {
    let classNames = []

    if (_.isString(srcClasses)) {
        classNames = srcClasses.replace(/\s{2,}/g, ' ').split(' ')
    }
    else if ((_.isArray(srcClasses) && srcClasses.length === 0) || !srcClasses) {
        return null
    }
    else if (_.isArray(srcClasses) && srcClasses.length > 0) {
        classNames = _.reduce(srcClasses, (acc, el) => {
            el && acc.push(el.replace(/\s{2,}/g, ' '))
            return acc
        }, [])
    }

    return _.chain(classNames)
        .uniq()
        .join(' ')
        .value()
}

/* Argument is a symbol object */
export function normalizeIcon(icons) {
    if (_.isEmpty(icons) || !icons) {
        return {}
    }
    const result = _.reduce(icons, (acc, el) => {
        if (_.isString(el) && !acc.iconUrl) {
            acc.iconUrl = el
            return acc
        }

        if (_.isString(el)) {
            acc.iconUrl = el
        }
        else if (_.isPlainObject(el)) {
            acc = {...acc, ...el}
        }

        return acc
    }, {})

    return result
}

/* Argument is a symbol object and type of info, including 'tooltip', 'popup' and 'label' */
export function normalizeInfo(infos, typeOfInfo) {
    if (_.isEmpty(infos) || !infos) {
        return typeOfInfo === 'label' ? {content:'', className:''} : null
    }

    const result = _.reduce(infos, (acc, el) => {
        if ((_.isString(el) || _.isElement(el)) && !acc.content) {
            acc.content = el
            return acc
        }

        if (_.isString(el) || _.isElement(el)) {
            acc.content = el
        }
        else if (_.isPlainObject(el)) {
            acc = {...acc, ...el}

            // 'label' may have 'html' key
            acc.content = acc.html || acc.content || ''
            delete acc.html
        }

        return acc
    }, {})

    return (result.content && !_.isEmpty(result.content)) ? result : null
}

export function normalizeTrack(tracks) {

}

/* Arguments are symbol id, type, and an array of symbol props/selectedProps */
export default function normalizeProps(sources) {
    if (_.isArray(sources) && sources.length === 0) {
        return {}
    }

    const result = _.mergeWith({}, ...sources, (objVal, srcVal, key) => {
        if (key === 'className' && srcVal) {
            const srcStr = srcVal.replace(/\s{2,}/g, ' ').split(' ')
            objVal = objVal || []
            objVal = _.concat(objVal, srcStr)

            return objVal
        }
        else if (_.includes(SPECIAL, key)) {
            objVal = objVal || []
            objVal.push(srcVal)

            return objVal
        }
    })

    _.set(result, 'className', normalizeClassname(result.className))
    _.set(result, 'tooltip', normalizeInfo(result.tooltip, 'tooltip'))
    _.set(result, 'popup', normalizeInfo(result.popup, 'popup'))

    // For markers and spots
    if (result.icon || result.label) {
        _.set(result, 'icon', normalizeIcon(result.icon))
        _.set(result, 'label', normalizeInfo(result.label, 'label'))
    }

    return _.omitBy(result, _.isNil)
}