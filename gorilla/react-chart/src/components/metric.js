import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import toWidget from '../hoc/widget-provider'
import {multiTraverse} from '../utils/traversal'

import {DATA_ITEM_PROP, KEY_MAPPING_PROP} from '../consts/prop-types'

let log = require('loglevel').getLogger('chart/components/metric')

const GROUP_PROP_TYPE = PropTypes.shape({
    header: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.node,
        PropTypes.func
    ]),
    vertical: PropTypes.bool
})

class BaseMetricChart extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        title: PropTypes.node,
        data: PropTypes.arrayOf(DATA_ITEM_PROP).isRequired,
        dataCfg: PropTypes.shape({
            splitGroup: PropTypes.arrayOf(KEY_MAPPING_PROP),
            agg: PropTypes.oneOfType([
                PropTypes.arrayOf(KEY_MAPPING_PROP),
                PropTypes.func
            ]).isRequired
        }),
        group: GROUP_PROP_TYPE,
        groups: PropTypes.shape({
            list: PropTypes.oneOfType([
                PropTypes.array,
                PropTypes.func
            ]),
            sort: PropTypes.arrayOf(PropTypes.shape({
                field: PropTypes.string,
                desc: PropTypes.bool
            })),
            main: PropTypes.shape({
                group: GROUP_PROP_TYPE
            }),
            sub: PropTypes.shape({
                className: PropTypes.string,
                title: PropTypes.node,
                group: GROUP_PROP_TYPE
            })
        }),
        keyLabels: DATA_ITEM_PROP,
        valueLabels: PropTypes.objectOf(DATA_ITEM_PROP),
        onClick: PropTypes.func,
        onContextMenu: PropTypes.func,
        onDoubleClick: PropTypes.func
    };

    static defaultProps = {
        data: [],
        group: {},
        groups: {},
        keyLabels: {},
        valueLabels: {}
    };

    getDefaultHeader = (obj) => { // Get default header if not provided
        const {dataCfg, valueLabels} = this.props
        const splitGroup = dataCfg.splitGroup
        let header = ''

        if (splitGroup) {
            _.forEach(splitGroup, val => {
                let data = _.get(obj, val)
                const mappedHeader = multiTraverse(valueLabels, [val, data]) // Map the header with the value labels

                if (mappedHeader) {
                    data = mappedHeader
                }
                header += data + ' - '
            })
            header = header.slice(0, -3)
        }

        if (_.isNumber(header)) { // Convert Number to String for '0' case
            header = header.toString()
        }

        return header
    };

    getGroupHeader = (mainHeader, header) => { // Determine the header for different cases (global, main and sub)
        let newHeader = ''

        if (header === false) {
            return false
        }

        if (!header && mainHeader === false) {
            return false
        }

        if (header === true || !header) {
            if (mainHeader) {
                newHeader = mainHeader
            }
        }
        else {
            newHeader = header
        }

        return newHeader
    };

    getGroupVertical = (group, globalVertical) => {
        if (group || group === false) {
            return group
        }
        else {
            return globalVertical
        }
    };

    getMatchedData = (customGroupList) => {
        const {data, dataCfg} = this.props
        const groupBy = dataCfg.splitGroup[0]
        let aggregated = []
        let splitGroupArr = []
        let currentValue = ''
        let groupedData = {}

        _.forEach(data, item => {
            if (_.get(item, groupBy) && _.get(item, groupBy).toString() !== currentValue) {
                currentValue = _.get(item, groupBy)
                splitGroupArr.push(currentValue)
            }
        })

        if (_.isArray(customGroupList) && !_.isEmpty(customGroupList)) {
            splitGroupArr = customGroupList
        }

        groupedData = _.omit(_.groupBy(data, item => {
            return _.get(item, groupBy)
        }), ['undefined'])

        _.forEach(splitGroupArr, val => {
            aggregated.push(groupedData[val])
        })

        return {
            groupedData,
            aggregated
        }
    };

    handleOnClick = (infoData, data, configData, evt) => {
        this.props.onClick && this.props.onClick(infoData, data, configData, evt)
    };

    handleOnContextMenu = (infoData, data, configData, evt) => {
        this.props.onContextMenu && this.props.onContextMenu(infoData, data, configData, evt)
    };

    handleOnDoubleClick = (infoData, data, configData, evt) => {
        this.props.onDoubleClick && this.props.onDoubleClick(infoData, data, configData, evt)
    };

    renderGroup = (group, groupMatched, vertical, header, globalClass, customClass, index) => {
        const {dataCfg, dataCfg:{splitGroup, agg}, keyLabels, valueLabels, onClick, onContextMenu, onDoubleClick} = this.props
        const headerFunction = (typeof header === 'function')
        const aggFunction = (typeof agg === 'function')
        const configData = {
            dataCfg,
            keyLabels,
            valueLabels
        }
        let infoData = {}
        let data = []
        let formattedData = []

        globalClass = globalClass ? ' ' + globalClass : ''
        customClass = customClass ? ' ' + customClass : ''

        if (group[0]) { // When the group is an array
            if (splitGroup) {
                data = groupMatched[_.get(group[0], splitGroup[0])]

                if (splitGroup.length > 1) {
                    let dataObj = {}

                    _.forEach(splitGroup, (val, i) => {
                        if (i !== 0) {
                            _.set(dataObj, val, _.get(group[0], val))
                        }
                    })
                    data = _.filter(data, dataObj)
                }
            }
        }
        else { // When the group is an object
            if (splitGroup) {
                let dataObj = {}
                let matchStr = ''

                _.forEach(splitGroup, (val, i) => {
                    const dataVal = _.get(group, val)

                    if (val.length === 0 && i !== 0) {
                        dataObj[val] = dataVal
                    }

                    if (val.length > 0) {
                        if (i === 0) {
                            matchStr = dataVal
                        }
                        else {
                            _.set(dataObj, val, dataVal)
                        }
                    }
                })

                if (matchStr) {
                    data = _.filter(groupMatched[matchStr], dataObj)
                }
                else {
                    data = _.filter(groupMatched[group[splitGroup[0]]], dataObj)
                }

                if (data.length === 0) {
                    return
                }
            }
            group = [group]
        }

        if (!splitGroup) {
            data = groupMatched
        }

        infoData = {
            isMainGroup: typeof index === 'undefined',
            matched: data.length
        }

        if (!header && header !== false && splitGroup) {
            header = this.getDefaultHeader(group[0])
        }

        _.forEach(group, val => {
            formattedData.push(_.pick(val, agg)) // Filter out the keys that are not in agg
        })

        if (splitGroup) {
            let splitGroupValue = []

            _.forEach(splitGroup, val => {
                splitGroupValue.push(_.get(group[0], val))
            })

            infoData = {
                ...infoData,
                splitGroup: splitGroupValue
            }
        }

        if (agg && !aggFunction) {
            let aggValue = []

            _.forEach(agg, val => {
                aggValue.push(_.get(formattedData[0], val))
            })

            infoData = {
                ...infoData,
                agg: aggValue
            }
        }

        if (headerFunction) { // If custom header function is provided
            header = header(infoData, data, configData)
        }

        return (
            <div
                className={cx('group-parent' + globalClass + customClass, {vertical})}
                key={index}>
                {header && !header.type &&
                    <header
                        onClick={onClick ? this.handleOnClick.bind(this, infoData, data, configData) : null}
                        onContextMenu={onContextMenu ? this.handleOnContextMenu.bind(this, infoData, data, configData) : null}
                        onDoubleClick={onDoubleClick ? this.handleOnDoubleClick.bind(this, infoData, data, configData) : null}>
                        {header}</header>
                }
                {header && header.type === 'img' &&
                    <header
                        onClick={onClick ? this.handleOnClick.bind(this, infoData, data, configData) : null}
                        onContextMenu={onContextMenu ? this.handleOnContextMenu.bind(this, infoData, data, configData) : null}
                        onDoubleClick={onDoubleClick ? this.handleOnDoubleClick.bind(this, infoData, data, configData) : null}>
                        <img src={header.props.src} title={header.props.title} alt={header.props.title} /></header>
                }
                <div className='group'>
                    {aggFunction &&
                        <div
                            onClick={onClick ? this.handleOnClick.bind(this, infoData, data, configData) : null}
                            onContextMenu={onContextMenu ? this.handleOnContextMenu.bind(this, infoData, data, configData) : null}
                            onDoubleClick={onDoubleClick ? this.handleOnDoubleClick.bind(this, infoData, data, configData) : null}>
                            {agg(infoData, data, configData)}
                        </div>
                    }

                    {!aggFunction &&
                        _.keys(formattedData[0]).map((key, i) => {
                            return this.renderItem(formattedData[0], infoData, data, configData, key, i)
                        })
                    }
                </div>
            </div>
        )
    };

    renderItem = (item, infoData, data, configData, key, index) => {
        const {dataCfg, keyLabels, valueLabels, onClick, onContextMenu, onDoubleClick} = this.props
        let value = ''
        let origKey = key
        let pathArr = []
        let newInfoData = {...infoData}

        if (typeof item[key] === 'string' || typeof item[key] === 'number') {
            value = item[key]
        }
        else {
            if (typeof item === 'object') {
                origKey = dataCfg.agg[0]
                value = _.get(item, origKey)
            }
            else {
                pathArr.push(key)
                pathArr.push(_.keys(item[key]).toString())
                pathArr.push(_.get(item, pathArr))
                value = multiTraverse(valueLabels, pathArr)
            }
        }
        key = keyLabels[key] ? keyLabels[key] : key
        newInfoData.aggKey = origKey

        return (
            <div
                className='item'
                key={index}
                onClick={onClick ? this.handleOnClick.bind(this, newInfoData, data, configData) : null}
                onContextMenu={onContextMenu ? this.handleOnContextMenu.bind(this, newInfoData, data, configData) : null}
                onDoubleClick={onDoubleClick ? this.handleOnDoubleClick.bind(this, newInfoData, data, configData) : null}>
                <span className='value'>{value}</span>
                <span className='label'>{key}</span>
            </div>
        )
    };

    render() {
        const {id, title, data, dataCfg:{splitGroup, agg}, group, groups} = this.props
        let mainData = {}
        let customGroupList = ''
        let aggregated = []
        let groupedData = {}
        let subAggregated = []
        let globalVertical = ''
        let globalClass = ''
        let mainHeader = ''
        let mainVertical = ''
        let mainGroupClass = ''
        let subTitle = ''
        let subClass = ''
        let subHeader = ''
        let subVertical = ''
        let subGroupClass = ''

        if (groups.list) {
            if (typeof groups.list === 'function') {
                customGroupList = groups.list()
            }
            else {
                customGroupList = groups.list
            }
        }

        if (typeof agg === 'function') { // If custom agg function is provided
            mainData = this.getMatchedData(customGroupList)
            aggregated = mainData.aggregated
            groupedData = mainData.groupedData
        }
        else {
            const groupBy = splitGroup

            aggregated = _.values(_.reduce(data, (acc, item) => {
                let keyObj = _.pick(item, groupBy)
                let key = JSON.stringify(keyObj)

                if (!acc[key]) {
                    acc[key] = {...keyObj, __raw:[]}
                }

                _.forEach(agg, val => {
                    _.set(acc[key], val, _.get(acc[key], val, 0) + _.get(item, val, 0))
                })

                acc[key].__raw.push(item)

                return acc
            }, []))

            if (_.isArray(customGroupList) && !_.isEmpty(customGroupList)) {
                const splitGroupArr = customGroupList
                let dataObj = {}
                let newAggregated = []

                _.forEach(splitGroupArr, item => {
                    _.forEach(groupBy, (val, i) => {
                        _.set(dataObj, val, item[i])
                    })
                    newAggregated.push(_.filter(aggregated, dataObj))
                })
                aggregated = newAggregated
            }

            if (groupBy) {
                mainData = this.getMatchedData(customGroupList)
                groupedData = mainData.groupedData
            }
            else {
                groupedData = data
            }
        }

        if (groups.sort) {
            const sortOption = groups.sort
            let field = []
            let desc = []

            _.forEach(sortOption, item => {
                field.push(item.field)

                if (item.desc) {
                    desc.push('desc')
                }
                else {
                    desc.push('asc')
                }
            })
            aggregated = _.orderBy(aggregated, field, desc)
        }

        // For global group
        mainHeader = this.getGroupHeader('', group.header)
        globalVertical = this.getGroupVertical(group.vertical, true)
        mainVertical = globalVertical

        if (group.className) {
            globalClass = group.className
        }

        if (aggregated.length > 1) {
            subAggregated = _.cloneDeep(aggregated)
            subAggregated.shift()

            if (!_.isEmpty(groups)) {
                if (groups.main && groups.main.group) { // For main group
                    mainHeader = this.getGroupHeader(mainHeader, groups.main.group.header)
                    mainVertical = this.getGroupVertical(groups.main.group.vertical, globalVertical)
                    mainGroupClass = groups.main.group.className
                }

                if (groups.sub) { // For sub group
                    subTitle = groups.sub.title ? groups.sub.title : ''
                    subClass = groups.sub.className

                    if (groups.sub.group) {
                        subHeader = this.getGroupHeader(mainHeader, groups.sub.group.header)
                        subVertical = this.getGroupVertical(groups.sub.group.vertical, globalVertical)
                        subGroupClass = groups.sub.group.className
                    }
                    else {
                        subHeader = mainHeader
                        subVertical = globalVertical
                    }
                }
            }
        }

        subClass = subClass ? ' ' + subClass : ''

        return <div id={id} className='c-chart-metric'>
            {title &&
                <div className='chart-title'>{title}</div>
            }
            <div className='content'>
                {!_.isEmpty(aggregated) &&
                    <div className='main-container'>
                        {this.renderGroup(aggregated[0], groupedData, mainVertical, mainHeader, globalClass, mainGroupClass)}
                    </div>
                }

                {!_.isEmpty(subAggregated) &&
                    <div className={'sub-container' + subClass}>
                        {subTitle &&
                            <div className='sub-title'>{subTitle}</div>
                        }
                        <div className='sub-content'>
                            {
                                subAggregated.map((val, index) => {
                                    return this.renderGroup(val, groupedData, subVertical, subHeader, globalClass, subGroupClass, index)
                                })
                            }
                        </div>
                    </div>
                }
            </div>
        </div>
    }
}


/**
 * A React Metric Chart
 * @constructor
 * @param {string} [id] - Chart dom element #id
 * @param {string} [className] - Classname for the chart
 * @param {renderable} [title] - Title for the chart
 * @param {array} data - Data, see below example
 * @param {object} dataCfg - Mapping between data shape and chart
 * @param {string | array.<string>} [dataCfg.splitChart] - if specified, will split into multiple charts based on the given key/path
 * @param {array.<string | array.<string>>} [dataCfg.splitGroup] - if specified, split into multiple metric groups based on the given keys/paths
 * @param {array.<string | array.<string>> | function} dataCfg.agg - aggregation setting
 * * array - specify aggregation columns
 * * function - function returning customized aggrgated value, given params (info, data, cfg) (see onClick event below)
 * @param {object} [group] - global metric group setting
 * @param {boolean | renderable | function} [group.header] - group header to show at the top of the group
 * * absent - default to corresponding value derived from *splitGroup* prop
 * * boolean - show/hide header
 * * renderable - static header
 * * function - function returning customized header, given params (info, data, cfg) (see onClick event below)
 * @param {boolean} [group.vertical=true] - whether group items are displayed in vertical layout
 * @param {object} [groups] - metric groups setting
 * @param {array} [groups.sort] - metric groups sort order
 * @param {array | function} [groups.list] - metric groups list
 * @param {object} [groups.main] - metric main group setting
 * @param {object} [groups.main.group] - group setting for main group, will overwrite global *group* prop if present
 * @param {object} [groups.sub] - metric subgroups setting
 * @param {string} [groups.sub.className] - className for subgroups container
 * @param {renderable} [groups.sub.title] - title for subgroups container
 * @param {object} [groups.sub.group] - group setting to apply to individual group in subgroups, will overwrite global *group* prop if present
 * @param {object} [keyLabels] - Key/label pairs for all the keys, see below for example
 * @param {object} [valueLabels] - Value/label pairs for all the values, see below for example
 * @param {function} [onClick] - Function to call when clicked
 * @param {object} onClick.eventInfo - info on the clicked item
 * @param {number} onClick.eventInfo.matched - number of data items associated with this item
 * @param {string} onClick.eventInfo.splitChart - associated chart value
 * @param {array} onClick.eventInfo.splitGroup - associated group value
 * @param {array} onClick.eventInfo.agg - associated aggregation value
 * @param {object} onClick.data - data of the current hovered item
 * @param {object} onClick.cfg - data related cfg for this chart
 * @param {object} onClick.cfg.dataCfg
 * @param {object} [onClick.cfg.keyLabels]
 * @param {object} [onClick.cfg.valueLabels]
 * @param {function} [onContextMenu] - Function to call when right clicked, see onClick for callback function spec
 * @param {function} [onDoubleClick] - Function to call when double clicked, see onClick for callback function spec
 *
 * @example
//
 */
const MetricChart = toWidget(BaseMetricChart)

export default MetricChart