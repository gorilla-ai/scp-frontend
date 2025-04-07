import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import Highcharts from 'highcharts'
import HighchartsCustomEvents from 'highcharts-custom-events'

import toWidget from '../hoc/widget-provider'
import {multiTraverse} from '../utils/traversal'

import {DATA_ITEM_PROP, KEY_MAPPING_PROP} from '../consts/prop-types'

let log = require('loglevel').getLogger('chart/components/pie')

if (!Highcharts.Chart.prototype.customEvent) {
    HighchartsCustomEvents(Highcharts)
}

class BasePieChart extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(DATA_ITEM_PROP).isRequired,
        dataCfg: PropTypes.shape({
            splitChart: KEY_MAPPING_PROP,
            splitSlice: PropTypes.arrayOf(KEY_MAPPING_PROP).isRequired,
            sliceSize: KEY_MAPPING_PROP.isRequired
        }),
        keyLabels: DATA_ITEM_PROP,
        valueLabels: PropTypes.objectOf(DATA_ITEM_PROP),
        centerText: PropTypes.node,
        colors: PropTypes.object,
        legend: PropTypes.object,
        chart: PropTypes.object,
        holeSize: PropTypes.number,
        onTooltip: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
        onMouseOver: PropTypes.func,
        onClick: PropTypes.func,
        onContextMenu: PropTypes.func,
        onDoubleClick: PropTypes.func
    };

    static defaultProps = {
        legend: {},
        onTooltip: true,
        data: [],
        holeSize: 0
    };

    componentDidMount() {
        this.drawChart()
    }

    shouldComponentUpdate(nextProps) {
        this.reflowChart()
        return JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data)
    }

    componentDidUpdate() {
        this.drawChart()
    }

    // Parses this.props.data into hierarchical structure
    getChartData = () => {
        let series = []
        let {dataCfg:cfg, data:propData} = this.props
        let grouper = function grouper(data, keys, index) {
            let curkey = keys.shift()
            if (!keys.length) {
                return _.chain(data)
                    .groupBy(el => _.get(el, curkey))
                    .map(el => {
                        let clone = _.cloneDeep(_.head(el))
                        _.set(clone, cfg.sliceSize, _.sumBy(el, cfg.sliceSize))
                        // Add more attributes: _coords, _origData, _seriesKey, and _chartKey.
                        // _coords: Array of [x, y] coordinates
                        // _origData: Original data object
                        // _seriesKey: Array of key of series. Example, if year and actor is the split key, this array will be [1997, 'tom'] or [1990, 'nicole'], etc.
                        // _chartKey: key of the chart. Example, if director is the chart key, this array will be 'martin' or 'francis'.
                        clone._coords = [_.get(clone, curkey), _.get(clone, cfg.sliceSize)]
                        clone._origData = el
                        clone._seriesKey = index
                        // x key is also a seriesKey in piechart.
                        clone._seriesKey = [...clone._seriesKey, clone._coords[0]]
                        return clone
                    }).value()
            }
            // groupBy and mapValues will return an object with string type keys
            // If the key is a numerical value, it will be converted to string.
            // So when passing the keys to deeper loop, we "get" the keys again from the original data.
            return _.chain(data)
                .groupBy(el => _.get(el, curkey))
                .mapValues(dat => grouper(dat, _.clone(keys), [...index, _.get(_.head(dat), curkey)]))
                .value()
        }
        series = grouper(propData, _.compact(cfg.splitSlice), [])
        return series
    };

    setCenterText = (e) => {
        const chart = e.target
        const {centerText} = this.props
        const sqrt2 = Math.sqrt(2)
        const centerX = chart.series[0].center[0] + chart.plotLeft
        const centerY = chart.series[0].center[1] + chart.plotTop
        const radius = chart.series[0].data[0].shapeArgs.innerR
        const halfLength = radius/sqrt2
        const topLeftX = centerX-halfLength
        const topLeftY = centerY-halfLength
        const length = 2*halfLength
        const containerNode = this.chartNode.childNodes[0]

        if (chart.centerTitle) {
            containerNode.removeChild(chart.centerTitle)
        }

        let node = document.createElement('DIV')
        containerNode.appendChild(node)


        ReactDOM.render(
            <div
                style={{
                    position: 'absolute', left: topLeftX, top: topLeftY,
                    width: length, height: length,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
                {centerText}
            </div>,
            node
        )

        chart.centerTitle = node
    };

    // Call this after DOM is ready.
    // This function can be changed based on the Chart API.
    drawChart = () => {
        const {
            chart, legend, holeSize, colors, keyLabels, valueLabels, centerText, dataCfg: cfg,
            onTooltip, onClick, onDoubleClick, onContextMenu, onMouseOver,
            dataLabels = { enabled: false }, otherChartParams = {}
        } = this.props
        let chartData = this.getChartData(),
            labels = keyLabels,
            yLabel = _.get(keyLabels, cfg.sliceSize, cfg.sliceSize),
            sizes = [],
            seriesCount = cfg.splitSlice.length

        // Calculate size in a decreasing manner
        /*function sumDec(n) {
            if (n <= 1) return n
            return n + sumDec(n-1)
        }*/
        /*let denominator = sumDec(seriesCount),
            counter = 0*/

        // Dynamically set the size and inner size of the donut chart
        // Innermost slice is the biggest, and gradually becomes smaller until it reaches the outermost slice.
        /*sizes = cfg.splitSlice.map(() => ({
            size: ((denominator - sumDec(counter)) * 100 / denominator) + '%',
            innerSize: ((denominator - sumDec(++counter)) * 100 / denominator) + '%'
        }))*/
        sizes = _(cfg.splitSlice)
            .map((s, i) => {
                const size = (100-holeSize)/seriesCount
                return {
                    size: (holeSize+(size*(i+1))) + '%',
                    innerSize: (holeSize+(size*i)) + '%'
                }
            })
            .reverse()
            .value()

        let labelGenerator = function labelGenerator(values) {
            let slices = _.clone(cfg.splitSlice)
            slices = _.take(slices, values.length)
            return values.map(el => {
                let curkey = slices.shift()
                if (valueLabels) {
                    let vLabels = _.get(valueLabels, curkey)
                    return vLabels ? _.get(vLabels, el, el) : el
                }
                return el
            })
        }

        // Highchart params
        let chartParams = _.merge({
            chart: _.merge({
                type: 'pie',
                events: centerText ? {
                    load: this.setCenterText,
                    redraw: this.setCenterText
                } : {}
            }, chart),
            title: {text:''},
            credits: {
                enabled: false
            },
            legend: _.merge({
                align: 'right',
                layout: 'vertical',
                verticalAlign: 'top',
                labelFormatter() {
                    return labelGenerator(this._seriesKey).join(' - ')
                }
            }, legend),
            plotOptions: {
                pie: {
                    point: {
                        events: {

                            // Temporary fix for legend item
                            // We cannot allow any child-slice to be hidden since we will need to hide the entire slice.//WHY?
                            // legendItemClick(e) { e.preventDefault(); return false }
                        }
                    },
                    dataLabels,
                    showInLegend: true
                }
            }
        }, otherChartParams)

        // Callback functions' parameters
        let getEventParams = function getEventParams(scope) {
            if (!scope) { scope = 'point' }
            let point = this.point ? this.point : this
            let params = []
            // Parameters for point-scoped events
            switch (scope) {
                case 'point':
                    params = [
                        {
                            sliceSize: point.y,
                            percentage: point.percentage,
                            splitSlice: point._seriesKey,
                            matched: point._origData.length
                        },
                        point._origData,
                        {
                            dataCfg: _.clone(cfg),
                            keyLabels,
                            valueLabels
                        }
                    ]
                    params[2].dataCfg.splitSlice = _.take(params[2].dataCfg.splitSlice, params[0].splitSlice.length)
                    return params
                case 'series':
                    return []
                case 'chart':
                    return []
                default: return []
            }
        }

        // Callback function: Tooltip
        if (typeof onTooltip === 'function') {
            chartParams.tooltip = {
                formatter() {
                    return ReactDOMServer.renderToStaticMarkup(onTooltip.apply(this, getEventParams.call(this, 'point')))
                }
            }
        }
        else if (onTooltip) {
            // Default Tooltip
            chartParams.tooltip = {
                formatter() {
                    let labs = labelGenerator(this.point._seriesKey).join(' - ')
                    let defaultPointTooltip = <span><span style={{color:this.color}}>{'\u25CF'}</span> {yLabel}: <b>{this.y}</b><br /></span>
                    return ReactDOMServer.renderToStaticMarkup(<span><b>{this.series.name}</b><br />{labs}<br />{defaultPointTooltip}</span>)
                }
            }
        }

         // Custom click events
        let customEvents = function customEvents(funcType, scope, e) {
            if (typeof funcType !== 'function' || !funcType) {
                // We do not override
                return undefined
            }
            if (!scope) {
                scope = 'point'
            }
            e.preventDefault()
            // For pie, e does not contain point property. We need to get "this" to refer to point.
            // For future expansion, we may need to add series or chart scoped condition.
            return funcType.apply(this, getEventParams.call(this, scope))
        }
        // Supported point events
        let pointEvents = {
            click(e) { return customEvents.call(this, onClick, 'point', e) },
            dblclick(e) { return customEvents.call(this, onDoubleClick, 'point', e) },
            contextmenu(e) { return customEvents.call(this, onContextMenu, 'point', e) },
            // smallcaps because we are using highcharts custom events
            mouseover(e) { return customEvents.call(this, onMouseOver, 'point', e) }
        }
        if (!onClick) delete pointEvents.click
        if (!onDoubleClick) delete pointEvents.dblclick
        if (!onContextMenu) delete pointEvents.contextmenu
        if (!onMouseOver) delete pointEvents.mouseover

        // Convert chart data (hierarchical structure) to specific Highchart format.
        let getSeriesData = (data => {
            let seriesData = []
            let distribute = (val, keys) => {
                let curkey = keys.shift(),
                    ctr = keys.length,
                    curLabels = _.get(valueLabels, curkey)
                // Leaf part (outer part of the donut)
                if (!keys.length) {
                    const leafData = _.map(val, el => {
                        let leaf = _.cloneDeep(el)
                        leaf.y = el._coords[1]
                        leaf.color = multiTraverse(colors, [curkey, el._coords[0]], null)
                        leaf.name = curLabels && _.get(curLabels, el._coords[0]) ? _.get(curLabels, el._coords[0]) : el._seriesKey
                        if (!seriesData[ctr]) {
                            seriesData[ctr] = {
                                name: labels && _.get(labels, curkey) ? _.get(labels, curkey) : curkey,
                                data: [leaf],
                                size: sizes[ctr].size,
                                innerSize: sizes[ctr].innerSize,
                                point: { events:pointEvents }
                            }
                        }
                        else {
                            seriesData[ctr].data.push(leaf)
                        }
                        return {
                            y: _.get(leaf, 'y'),
                            count: 1,
                            els: [leaf],
                            _seriesKey: _.get(leaf, '_seriesKey')
                        }
                    })
                    return leafData
                }
                // Branch part (inner slices)
                let els = _.chain(val)
                    .map((el, name) => {
                        let children = distribute(el, _.clone(keys))
                        let {sum, count, leaves, _seriesKey} = _.reduce(children, (acc, child) => {
                            if (!acc._seriesKey.length) acc._seriesKey = _.take(child._seriesKey, child._seriesKey.length-1)
                            acc.sum += child.y
                            acc.count += child.count
                            acc.leaves = [...acc.leaves, ...child.els]
                            return acc
                        }, {sum:0, count:0, leaves:[], _seriesKey:[]})
                        return {
                            y: sum,
                            color: multiTraverse(colors, [curkey, name], null),
                            count,
                            els: leaves,
                            _origData: leaves,
                            name: curLabels && _.get(curLabels, name) ? _.get(curLabels, name) : name,
                            _seriesKey
                        }
                    }).value()
                if (!seriesData[ctr]) {
                    seriesData[ctr] = {
                        name: labels && _.get(labels, curkey) ? _.get(labels, curkey) : curkey,
                        data: els,
                        size: sizes[ctr].size,
                        innerSize: sizes[ctr].innerSize,
                        point: { events:pointEvents }
                    }
                }
                else {
                    seriesData[ctr].data.push(...els)
                }
                // Combine all the origData
                let aggEls = _.reduce(els, (acc, o) => {
                    acc = [...acc, ..._.get(o, '_origData')]
                    return acc
                }, [])
                return {
                    y: _.sumBy(els, 'y'),
                    count: _.sumBy(els, 'count'),
                    els: aggEls,
                    _seriesKey: _.get(_.head(els), '_seriesKey')
                }
            }
            distribute(data, _.clone(cfg.splitSlice))
            return seriesData
        })
        let seriesData = getSeriesData(chartData)
        chartParams.series = seriesData
        this.chart = Highcharts.chart(this.chartNode, chartParams)
    };

    reflowChart = () => {
        this.chart.reflow()
    };

    render() {
        return <div className='c-chart-pie' ref={node => { this.chartNode = node }} />
    }
}

/**
 * A React Pie Chart
 * @constructor
 * @param {string} [id] - Chart dom element #id
 * @param {string} [className] - Classname for the chart
 * @param {string} [title] - Title for the chart
 * @param {number} [holeSize=0] - Size of donut hole in percentage (eg 70)
 * @param {renderable} [centerText] - What to display in center of chart
 * @param {array} data - Data, see below example
 * @param {object} dataCfg - Mapping between data shape and chart
 * @param {string | array.<string>} [dataCfg.splitChart] - if specified, will split into multiple charts based on the given key/path
 * @param {array.<string | array.<string>>} dataCfg.splitSlice - Split into multiple layers based on the given key/path
 * @param {string | array.<string>} dataCfg.sliceSize - key/path to indicate the size of slice
 * @param {object} [keyLabels] - Key/label pairs for all the keys
 * @param {object} [valueLabels] - Value/label pairs for all the values
 * @param {object} [colors] - Colors for different slices
 * @param {object} [legend] - config for the legends, see Highcharts API {@link http://api.highcharts.com/highcharts/legend}
 * @param {boolean|function} [onTooltip=true] - Tooltip for the hovered slice, can be boolean or self defined rendering function as below
 * @param {object} onTooltip.eventInfo - statistics for this slice
 * @param {number} onTooltip.eventInfo.matched - number of data items associated with this slice
 * @param {string} onTooltip.eventInfo.splitChart - associated chart value
 * @param {array} onTooltip.eventInfo.splitSlice - array of group keys associated with this slice
 * @param {number} onTooltip.eventInfo.size - current slice size from **sliceSize**
 * @param {number} onTooltip.eventInfo.percentage - percentage of current slice size in relation to total size
 * @param {array.<object>} onTooltip.data - dataset of the current hovered slice
 * @param {object} onTooltip.cfg - data related cfg for this chart
 * @param {object} onTooltip.cfg.dataCfg
 * @param {object} [onTooltip.cfg.keyLabels]
 * @param {object} [onTooltip.cfg.valueLabels]
 * @param {function} [onMouseOver] - Function to call when mouse over, see onTooltip for callback function spec
 * @param {function} [onClick] - Function to call when clicked, see onTooltip for callback function spec
 * @param {function} [onContextMenu] - Function to call when right clicked, see onTooltip for callback function spec
 * @param {function} [onDoubleClick] - Function to call when double clicked, see onTooltip for callback function spec
 *
 * @example

import _ from 'lodash'
import PieChart from 'chart/components/pie'

const {data:DATA, keyLabels:KEY_LABELS, valueLabels:VALUE_LABELS} = {
    "data":[
        { "director":"martin", "actor":"tom", "movies":2, "tvs":1, "year":1990 },
        { "director":"martin", "actor":"tom", "movies":3, "tvs":2, "year":1990 },
        { "director":"martin", "actor":"tom", "movies":3, "year":1991 },
        { "director":"martin", "actor":"tom", "movies":2, "year":1992 },
        { "director":"martin", "actor":"tom", "movies":10, "year":1996 },
        { "director":"martin", "actor":"tom", "movies":2, "year":1997 },
        { "director":"martin", "actor":"tom", "movies":5, "year":2000 },
        { "director":"martin", "actor":"nicole", "movies":5, "year":1990 },
        { "director":"martin", "actor":"nicole", "movies":4, "year":1991 },
        { "director":"martin", "actor":"nicole", "movies":3, "year":1992 },
        { "director":"martin", "actor":"nicole", "movies":6, "year":1993 },
        { "director":"martin", "actor":"nicole", "movies":1, "year":1994 },
        { "director":"martin", "actor":"nicole", "movies":0, "year":1997 },
        { "director":"martin", "actor":"nicole", "movies":1, "year":2000 },
        { "director":"francis", "actor":"tom", "movies":4, "year":1990 },
        { "director":"francis", "actor":"tom", "movies":2, "year":1991 },
        { "director":"francis", "actor":"tom", "movies":7, "year":1992 },
        { "director":"francis", "actor":"tom", "movies":2, "year":1996 },
        { "director":"francis", "actor":"tom", "movies":1, "year":1997 },
        { "director":"francis", "actor":"tom", "movies":1, "year":2000 },
        { "director":"francis", "actor":"nicole", "movies":1, "year":1990 },
        { "director":"francis", "actor":"nicole", "movies":3, "year":1991 },
        { "director":"francis", "actor":"nicole", "movies":4, "year":1992 },
        { "director":"francis", "actor":"nicole", "movies":1, "year":1993 },
        { "director":"francis", "actor":"nicole", "movies":2, "year":1994 },
        { "director":"francis", "actor":"nicole", "movies":0, "year":1997 },
        { "director":"francis", "actor":"nicole", "movies":2, "year":2000 },
        { "director":"francis", "movies":2, "year":2000 },
        { "actor":"tom", "movies":2, "year":1994 },
        { "actor":"nicole", "movies":2, "year":2001 }
    ],
    "keyLabels":{
        "director": "Director",
        "actor": "Actor",
        "year": "Year"
    },
    "valueLabels":{
        "director": {"martin":"Martin Scorsese", "francis":"Francis Copola"},
        "actor": {"tom":"Tom Cruise", "nicole":"Nicole Kidman"}
    }
}

React.createClass({
    render() {
        return <div>
            <PieChart
                id='actor-pie-chart'
                title='Pie Charts By Year'
                data={DATA}
                keyLabels={KEY_LABELS}
                valueLabels={VALUE_LABELS}
                holeSize={70}
                dataCfg={{
                    splitChart: 'director',
                    splitSlice: ['year', 'actor'],
                    sliceSize: 'movies'
                }} />
            <PieChart
                id='pie-chart'
                title='Single Pie Chart'
                data={[
                    {name:'a',age:{band:30},occupation:'teacher',appears:10},
                    {name:'b',age:{band:40},occupation:'criminal',appears:15},
                    {name:'c',age:{band:40},occupation:'teacher',appears:15}
                ]}
                colors={{
                    age:{
                        band:{
                            30:'#c1b748',
                            40:'#2b908f'
                        }
                    },
                    occupation:{
                        teacher:'#f15c80',
                        criminal:'#8085e9'
                    }
                }}
                holeSize={70}
                centerText='Center'
                dataCfg={{
                    splitSlice: ['age.band', 'occupation'],
                    sliceSize: 'appears'
                }} />
        </div>
    }
})
 */
const PieChart = toWidget(BasePieChart)

export default PieChart
