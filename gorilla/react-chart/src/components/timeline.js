import React from 'react'
import PropTypes from 'prop-types'
import ReactDOMServer from 'react-dom/server'
import _ from 'lodash'
import $ from 'jquery'
import Vis from 'vis'
import 'vis/dist/vis.css'

import toWidget from '../hoc/widget-provider'

import {DATA_ITEM_PROP, KEY_MAPPING_PROP} from '../consts/prop-types'

let log = require('loglevel').getLogger('chart/components/timeline')

// const TIME_MARGIN = 3600000
const TIME_MARGIN = 0

// Determine the group display color, '#001B34' is from the react-ui dark color
const DEFAULT_COLOR = '#001B34'

const OPTIONS = {
    stack: false,
    showCurrentTime: false,
    showMajorLabels: false,
    selectable: false,
    tooltip: {
        followMouse: true,
        overflowMethod: 'flip'
    },
    margin: 0
}

class BaseTimeline extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.object).isRequired,
        dataCfg: PropTypes.shape({
            splitChart: KEY_MAPPING_PROP,
            splitGroup: KEY_MAPPING_PROP.isRequired,
            timeStart: KEY_MAPPING_PROP.isRequired,
            timeEnd: KEY_MAPPING_PROP,
            agg: PropTypes.arrayOf(KEY_MAPPING_PROP)
        }),
        keyLabels: DATA_ITEM_PROP,
        valueLabels: PropTypes.objectOf(DATA_ITEM_PROP),
        colors: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
        verticalScroll: PropTypes.bool,
        showEmptyGroup: PropTypes.bool,
        /* 'background' is for TIMAP. Can be extent in the future...... */
        // background: PropTypes.bool,
        // legend: PropTypes.object,
        tooltip: PropTypes.shape({
            enabled: PropTypes.bool,
            formatter: PropTypes.func
        }),
        onMouseOver: PropTypes.func,
        onClick: PropTypes.func,
        onContextMenu: PropTypes.func,
        onDoubleClick: PropTypes.func,
        onRangeChanged: PropTypes.func,
        onChanged: PropTypes.func
    };

    static defaultProps = {
        data: [],
        verticalScroll: false,
        showEmptyGroup: true,
        // background: false,
        tooltip: {
            enabled: true
        }
    };

    componentDidMount() {
        const { onChanged } = this.props
        this.drawChart()
        if (onChanged) {
            this.chart.on('changed', onChanged)
        }
    }

    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data)
    }

    componentDidUpdate() {
        this.drawChart()
    }

    parseChartData = () => {
        const {data: propData, dataCfg, colors,
            keyLabels, valueLabels, tooltip
            //, background
        } = this.props

        const cfg = {dataCfg, keyLabels, valueLabels}

        const data = _(propData)
            .map(el => {
                const eventInfo = {
                    matched: 1,
                    splitGroup: _.get(el, dataCfg.splitGroup),
                    timeStart: _.get(el, dataCfg.timeStart || 'timeStart'),
                    timeEnd: _.get(el, dataCfg.timeEnd || dataCfg.timeStart || 'timeStart'),
                    agg: _(el).pick(dataCfg.agg).values().map(_.toString).value()
                }

                const {enabled:enableTooltip=true, formatter:tooltipFormatter} = tooltip
                const tooltipStr = enableTooltip
                                ? ReactDOMServer.renderToStaticMarkup(tooltipFormatter.apply(this, [eventInfo, el, cfg]))
                                : null

                let color = DEFAULT_COLOR
                if (_.isFunction(colors)) {
                    color = colors(eventInfo, el, cfg)
                }
                else if (_.isPlainObject(colors)) {
                    color = _.findLast(colors, (c, k) => (el[k] > 0)) || _.head(_.values(colors))
                }

                return {
                    // *id* is for get origin data later
                    id: Math.random().toString(36).substr(2, 9),
                    className: el.className || '',
                    start: _.get(el, dataCfg.timeStart || 'timeStart'),
                    end: _.get(el, dataCfg.timeEnd) || _.get(el, dataCfg.timeStart || 'timeStart'),
                    // group-key will map the id value in *groups*
                    group: _.get(el, dataCfg.splitGroup),
                    type: el.type || 'range',
                    style: `background-color: ${color}; opacity: 0.5;`,
                    title: tooltipStr,
                    // *_origData* is a custom key
                    _origData: el
                }
            })
            .orderBy(['start', 'end'])
            .value()

        // if (background) {
        //     const start = _.head(data).start
        //     const end = _.last(data).end

        //     data.push({
        //         // *id* is for get origin data later
        //         id: 'timeline-background',
        //         start,
        //         end,
        //         type: 'background',
        //         // style: `background-color: ${color};`
        //         /* editable seems not work with type background...... */
        //         // editable: { updateTime:true }
        //     })
        // }

        return data
    };

    drawChart = () => {
        const {
            dataCfg, colors, verticalScroll, showEmptyGroup, keyLabels, valueLabels,
            onMouseOver, onClick, onContextMenu, onDoubleClick, onRangeChanged
        } = this.props

        const data = this.parseChartData()
        const groups = _(data)
            .groupBy('group')
            .map((elm, key) => {
                const content = _.chain(valueLabels).get(dataCfg.splitGroup).get(key).value() || key
                const merged = _.reduce(elm, (acc, el) => {
                    const aggObj = _.pick(el._origData, dataCfg.agg)
                    _.forEach(aggObj, (e, k) => {
                        acc[k] = _.isNil(acc[k]) ? e : acc[k] + e
                    })

                    return acc
                }, {})
                const count = _.chain(merged).values().sum().value()

                // Determine the group display color, '#001B34' is from the react-ui dark color
                let color = DEFAULT_COLOR
                if (_.isFunction(colors)) {
                    const eventInfo = {
                        matched: elm.length,
                        splitGroup: key,
                        timeStart: elm[0].start,
                        timeEnd: elm[elm.length - 1].end,
                        agg: _(merged).values().map(_.toString).value()
                    }

                    color = colors(eventInfo, merged, {dataCfg, keyLabels, valueLabels})
                }
                else if (_.isPlainObject(colors)) {
                    color = _.findLast(colors, (c, k) => (merged[k] > 0))
                }

                const sumSpan = count > 0
                                ? `<span class='tl-group-sum' style="background:${color};">${count}</span>`
                                : ''

                return {
                    // *id* is for mapping group in Vis timeline
                    // *content* is group text on timeline left side
                    id: key,
                    // Developer can adjust group's style via its className.
                    // For the row height, need to adjust height of
                    // (.vis-label .vis-inner) and (.vis-item.vis-range)
                    // Accurate selector is preferable.
                    className: key,
                    content: `<span class="tl-group-label">${content}</span> ${sumSpan}`,
                    visible: (count > 0) || showEmptyGroup,
                    // *count* is a custom key
                    count
                }
            })
            .orderBy('id')
            .values()
            .value()

        // For removing the empty group's data
        const hiddenGroup = _(groups)
                            .filter(el => el.count === 0)
                            .map('id')
                            .value()

        const bindEvent = function bindEvent(chart, events) {
            chart.off('click')
            _.forEach(events, (el, key) => {
                chart.on(key, tlProps => {
                    // Only items' events can be triggered
                    if (key !== 'rangechanged' && tlProps.what === 'item') {
                        const origData = _.find(data, {id:tlProps.item})._origData
                        const eventInfo = {
                            matched: 1,
                            splitGroup: tlProps.group,
                            agg: dataCfg.agg
                        }

                        el(eventInfo, origData, {dataCfg, keyLabels, valueLabels})
                    }
                    else if (key === 'rangechanged') {
                        const origData = _.map(data, d => { return d._origData })
                        const eventInfo = {
                            matched: data.length,
                            agg: dataCfg.agg,
                            timeStart: new Date(tlProps.start).getTime(),
                            timeEnd: new Date(tlProps.end).getTime()
                        }

                        el(eventInfo, origData, {dataCfg, keyLabels, valueLabels})
                    }

                    if (tlProps.event) {
                        tlProps.event.preventDefault()
                    }
                })
            })
        }

        const events = _.pickBy({
            mouseOver: onMouseOver,
            click: onClick,
            contextmenu: onContextMenu,
            doubleClick: onDoubleClick,
            rangechanged: onRangeChanged
        }, _.isFunction)

        const options = {
            ...OPTIONS,
            verticalScroll,
            showTooltips: !!this.props.tooltip,
            max: _.last(data).end + TIME_MARGIN,
            min: _.head(data).start - TIME_MARGIN
        }

        // Remove the empty group's data
        if (!_.isEmpty(hiddenGroup) && showEmptyGroup) {
            _.remove(data, el => { return _.indexOf(hiddenGroup, el.group) !== -1 })
        }
        // let data1 = _.map(data, el => {
        //     return _.filter(el, (el) => {
        //         return _.indexOf(hiddenGroup, el.group) !== -1 && el.type !== 'background'
        //     })
        // })
        if (!this.chart) {
            this.chart = new Vis.Timeline(this.chartNode, data, groups, options)
            this._groups = groups
        }
        else {
            if (_.isEqual(this._groups, groups)) {
                this.chart.setData({
                    // groups: groups,
                    items: data
                })
                this.chart.setOptions(options)
            }
            else {
                this.chart.destroy()
                this.chart = new Vis.Timeline(this.chartNode, data, groups, options)
                this._groups = groups
            }
        }

        // Bind events
        bindEvent(this.chart, events)
        // Show hover style when hover on a row
        _.forEach(groups, el => {
            $(`.${CSS.escape(el.className)}`).hover(() => {
                $(`.${CSS.escape(el.className)}`).toggleClass('js-hovered')
            })
        })
    };

    render() {
        return <div className='c-chart-timeline' ref={node => { this.chartNode = node }} />
    }
}

/**
 * A React Timeline Chart
 * @constructor
 * @param {string} [id] - Chart dom element #id
 * @param {string} [className] - Classname for the chart
 * @param {string} [title] - Title for the chart
 * @param {array} data - Data, see below example
 * @param {object} dataCfg - Mapping between data shape and chart
 * @param {string | array.<string>} [dataCfg.splitChart] - if specified, will split into multiple charts based on the given key/path
 * @param {string | array.<string>} dataCfg.splitGroup - key/path to indiciate group
 * @param {string | array.<string>} dataCfg.timeStart - key/path to indicate the start of the range
 * @param {string | array.<string>} [dataCfg.timeEnd=timeStart] - key/path to indicate the end of range
 * @param {array.<string | array.<string>>} [dataCfg.agg] - if specified, fields to aggregate count for
 * @param {renderable} [placeholder='No Data Available'] - Placeholder to show when no data is present
 * @param {object} [keyLabels] - Key/label pairs for all the keys
 * @param {object} [valueLabels] - Value/label pairs for all the values
 * @param {object | function} [colors] - Colors for different aggregations. For function type, see tooltip for callback function spec
 * @param {bool} [verticalScroll=false] - Show vertical scrollbar?
 * @param {bool} [showEmptyGroup=true] - Show groups which data are empty?
 * @param {object} [legend] - config for the legends, see Highcharts API {@link http://api.highcharts.com/highcharts/legend}
 * @param {object} [tooltip] - Tooltip for the hovered item
 * @param {boolean} [tooltip.enabled=true] - enable tooltip?
 * @param {function} [tooltip.formatter] - self defined rendering function as below
 * @param {object} tooltip.formatter.eventInfo - statistics for this bar
 * @param {number} tooltip.formatter.eventInfo.matched - number of data items associated with this bar
 * @param {string} tooltip.formatter.eventInfo.splitChart - associated chart value
 * @param {array} tooltip.formatter.eventInfo.splitGroup - associated group value
 * @param {number} tooltip.formatter.eventInfo.timeStart - associated timeStart timestamp value
 * @param {number} tooltip.formatter.eventInfo.timeEnd - associated timeEnd timestamp value
 * @param {array.<string>} tooltip.formatter.eventInfo.agg - array of aggregated counts
 * @param {object} tooltip.formatter.data - data of the current hovered bar
 * @param {object} tooltip.formatter.cfg - data related cfg for this chart
 * @param {object} tooltip.formatter.cfg.dataCfg
 * @param {object} [tooltip.formatter.cfg.keyLabels]
 * @param {object} [tooltip.formatter.cfg.valueLabels]
 * @param {function} [onMouseOver] - Function to call when mouse over, see tooltip.formatter for callback function spec
 * @param {function} [onClick] - Function to call when clicked, see tooltip.formatter for callback function spec
 * @param {function} [onContextMenu] - Function to call when right clicked, see tooltip.formatter for callback function spec
 * @param {function} [onDoubleClick] - Function to call when double clicked, see tooltip.formatter for callback function spec
 * @param {function} [onRangeChanged] - Function to call when window range changed, see tooltip.formatter for callback function spec
 * @example

import _ from 'lodash'
import Timeline from 'chart/components/timeline'

const {data:DATA, keyLabels:KEY_LABELS, valueLabels:VALUE_LABELS} = {
    "data":[
        { "director":"martin", "actor":"tom", "movies":2, "tvs":1, "year":1990, "timeStart":1501731024000, "timeEnd":1501731224000, "type":"background", "className":"tom-bg" },
        { "director":"martin", "actor":"tom", "movies":3, "tvs":2, "year":1990, "timeStart":1501731299000, "timeEnd":1501731324000 },
        { "director":"martin", "actor":"tom", "movies":3, "year":1991, "timeStart":1501731424000, "timeEnd":1501731524000 },
        { "director":"martin", "actor":"tom", "movies":2, "year":1992, "timeStart":1501731524000, "timeEnd":1501731724000 },
        { "director":"martin", "actor":"tom", "movies":10, "year":1996, "timeStart":1501730184000, "timeEnd":1501732224000 },
        { "director":"martin", "actor":"tom", "movies":2, "year":1997, "timeStart":1501732324000, "timeEnd":1501732424000 },
        { "director":"martin", "actor":"tom", "movies":5, "year":2000, "timeStart":1501732624000, "timeEnd":1501732724000 },
        { "director":"martin", "actor":"nicole", "movies":5, "year":1990, "timeStart":1501733324000, "timeEnd":1501733624000, "className":"nicole-bg" },
        { "director":"martin", "actor":"nicole", "movies":4, "year":1991, "timeStart":1501734424000, "timeEnd":1501736624000 },
        { "director":"martin", "actor":"nicole", "movies":3, "year":1992, "timeStart":1501735524000, "timeEnd":1501735624000, "type":"background" },
        { "director":"martin", "actor":"nicole", "movies":6, "year":1993, "timeStart":1501710924000, "timeEnd":1501720924000 },
        { "director":"martin", "actor":"nicole", "movies":1, "year":1994, "timeStart":1501720924000, "timeEnd":1501730924000 },
        { "director":"martin", "actor":"nicole", "movies":0, "year":1997, "timeStart":1501730924000, "timeEnd":1501750924000 },
        { "director":"martin", "actor":"nicole", "movies":1, "year":2000, "timeStart":1501760924000, "timeEnd":1501737924000 },
        { "director":"francis", "actor":"tom", "movies":4, "year":1990, "timeStart":1501736924000, "timeEnd":1501738924000 },
        { "director":"francis", "actor":"tom", "movies":2, "year":1991, "timeStart":1501760924000, "timeEnd":1501770924000 },
        { "director":"francis", "actor":"tom", "movies":7, "year":1992, "timeStart":1501710924000, "timeEnd":1501720924000 },
        { "director":"francis", "actor":"tom", "movies":2, "year":1996, "timeStart":1501730926000, "timeEnd":1501734924000 },
        { "director":"francis", "actor":"tom", "movies":1, "year":1997, "timeStart":1501730944000, "timeEnd":1501730974000 },
        { "director":"francis", "actor":"tom", "movies":1, "year":2000, "timeStart":1501730944000, "timeEnd":1501730984000 },
        { "director":"francis", "actor":"nicole", "movies":1, "year":1990, "timeStart":1501730904000, "timeEnd":1501730924000 },
        { "director":"francis", "actor":"nicole", "movies":3, "year":1991, "timeStart":1501732924000, "timeEnd":1501736924000 },
        { "director":"francis", "actor":"nicole", "movies":4, "year":1992, "timeStart":1501734924000, "timeEnd":1501736924000 },
        { "director":"francis", "actor":"nicole", "movies":1, "year":1993, "timeStart":1501737924000, "timeEnd":1501739924000 },
        { "director":"francis", "actor":"nicole", "movies":2, "year":1994, "timeStart":1501732924000, "timeEnd":1501736924000 },
        { "director":"francis", "actor":"nicole", "movies":1, "year":1997, "timeStart":1501720924000, "timeEnd":1501730924000 },
        { "director":"francis", "actor":"nicole", "movies":2, "year":2000, "timeStart":1501730924000, "timeEnd":1501770924000 },
        { "director":"francis", "movies":2, "year":2000, "timeStart":1501730924000, "timeEnd":1501780924000 },
        { "actor":"tom", "movies":2, "year":1994, "timeStart":1501330924000, "timeEnd":1501730924000 },
        { "actor":"nicole", "movies":2, "year":2001, "timeStart":1501230924000, "timeEnd":1501230924000 }
    ],
    "keyLabels":{
        "director": "Director",
        "actor": "Actor",
        "year": "Year",
        "timeStart": "Start",
        "timeEnd": "End"
    },
    "valueLabels":{
        "director": {"martin":"Martin Scorsese", "francis":"Francis Copola"},
        "actor": {"tom":"Tom Cruise", "nicole":"Nicole Kidman"}
    }
}

React.createClass({
    getInitialState() {
        return {
            eventInfo: {},
            data: {},
            dataCfg: {}
        }
    },
    handleClick(eventInfo, data, {dataCfg, keyLabels, valueLabels}) {
        this.setState({
            eventInfo,
            data,
            dataCfg
        })
    },
    // Example of generate color by function
    // renderColor(eventInfo, data, {dataCfg, keyLabels, valueLabels}) {
    //     let color = '#001B34'
    //     if (data.tvs) {
    //         color = '#2b908f'
    //     }
    //     else if (data.movies) {
    //         color = '#c1b748'
    //     }

    //     return color
    // },
    render() {
        return <div>
            <Timeline
                id='actor-timeline'
                title='Actor Timeline'
                data={DATA}
                keyLabels={KEY_LABELS}
                valueLabels={VALUE_LABELS}
                dataCfg={{
                    splitGroup: 'actor',
                    timeStart: 'timeStart',
                    timeEnd: 'timeEnd',
                    agg: ['movies','tvs']
                }}
                colors={{
                    movies: '#c1b748',
                    tvs: '#2b908f'
                }}
                // colors={this.renderColor}
                verticalScroll={true}
                onClick={this.handleClick} />
        </div>
    }
})
 */
const Timeline = toWidget(BaseTimeline)

export default Timeline