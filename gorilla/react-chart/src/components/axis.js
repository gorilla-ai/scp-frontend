import PropTypes from 'prop-types';
import React from 'react'
import moment from 'moment'
import _ from 'lodash'

import ReactDOMServer from 'react-dom/server'
import Highcharts from 'highcharts'
import HighchartsCustomEvents from 'highcharts-custom-events'
import toWidget from '../hoc/widget-provider'
import {DATA_ITEM_PROP, KEY_MAPPING_PROP} from '../consts/prop-types'

if (!Highcharts.Chart.prototype.customEvent) {
    HighchartsCustomEvents(Highcharts)
}

class BaseAxisChart extends React.Component {
    static defaultProps = {
        stacked: false,
        chartType: 'line',
        tooltip: {
            enabled: true
        },
        data: [],
        colors: {},
        xAxis: {},
        yAxis: {},
        legend: {},
        plotOptions: {}
    };

    static propTypes = {
        stacked: PropTypes.bool,
        chartType: PropTypes.oneOf(['line', 'bar', 'column', 'area']),
        data: PropTypes.arrayOf(DATA_ITEM_PROP).isRequired,
        dataCfg: PropTypes.shape({
            splitChart: KEY_MAPPING_PROP,
            x: KEY_MAPPING_PROP.isRequired,
            splitSeries: PropTypes.oneOfType([
                KEY_MAPPING_PROP,
                PropTypes.arrayOf(KEY_MAPPING_PROP)
            ]),
            y: KEY_MAPPING_PROP
        }).isRequired,
        keyLabels: DATA_ITEM_PROP,
        valueLabels: PropTypes.objectOf(DATA_ITEM_PROP),
        colors: PropTypes.object,
        exporting: PropTypes.object,
        xAxis: PropTypes.shape({
            title: PropTypes.shape({
                text: PropTypes.string
            }),
            type: PropTypes.oneOf(['linear', 'logarithmic', 'datetime', 'category'])
        }),
        yAxis: PropTypes.shape({
            title: PropTypes.shape({
                text: PropTypes.string
            })
        }),
        legend: PropTypes.object,
        chart: PropTypes.object,
        plotOptions: PropTypes.object,
        tooltip: PropTypes.shape({
            enabled: PropTypes.bool,
            formatter: PropTypes.func
        }),
        onMouseOver: PropTypes.func,
        onClick: PropTypes.func,
        onContextMenu: PropTypes.func,
        onDoubleClick: PropTypes.func
    };

    // Parses this.props.data into hierarchical structure
    getChartData = () => {
        let series = []
        let {dataCfg:cfg, data:propData} = this.props

        // SplitBars take y values from dynamic fields
        let splitSeriesFunc = (data, barKeys, xKey) => {
            let bars = {}
            _.forEach(barKeys, el => {
                // Aggregate y axis data using x axis
                bars[el] = _.chain(data)
                    .groupBy(o => _.get(o, xKey) +
                        (_.get(o, cfg.splitSeries) ? ' ' + _.get(o, cfg.splitSeries) : ''))
                    .map(dat => {
                        let clone = _.cloneDeep(_.head(dat))
                        _.set(clone, el, _.sumBy(dat, el) ? _.sumBy(dat, el) : 0)
                        // Add more attributes: _coords, _origData, _seriesKey, and _chartKey.
                        // _coords: Array of [x, y] coordinates
                        // _origData: Original data object
                        // _seriesKey: key of series. Example, if actor is the split key, this array will be 'tom' or 'nicole'
                        // _chartKey: key of the chart. Example, if director is the chart key, this array will be 'martin' or 'francis'.
                        clone._coords = [_.get(clone, xKey), _.get(clone, el)]
                        clone._origData = dat
                        clone._seriesKey = el
                        return clone
                    }).value()
            })
            return bars
        }
        let splitSeriesKeyFunc = (data, key) => _.groupBy(data, el => _.get(el, key))
        // Take x and y coordinates if y key is set.
        if (cfg.y) {
            // Aggregate y axis data using x axis
            series = _.chain(propData)
                .groupBy(el => _.get(el, cfg.x) +
                    (_.get(el, cfg.splitSeries) ? ' ' + _.get(el, cfg.splitSeries) : ''))
                .map(el => {
                    let clone = _.cloneDeep(_.head(el))
                    _.set(clone, cfg.y, _.sumBy(el, cfg.y) ? _.sumBy(el, cfg.y) : 0)
                    clone._coords = [_.get(clone, cfg.x), _.get(clone, cfg.y)]
                    clone._origData = el
                    clone._seriesKey = _.get(clone, cfg.splitSeries)
                    return clone
                }).value()
        }
        // Start grouping by splitChartKey and splitSeriesKey
        if (cfg.y) {
            series = splitSeriesKeyFunc(series, cfg.splitSeries)
        }
        else if (cfg.splitSeries) {
            series = splitSeriesFunc(propData, cfg.splitSeries, cfg.x)
        }
        return series
    };

    componentDidMount() {
        this.drawChart()
    }

    componentDidUpdate() {
        this.drawChart()
    }

    // Call this after DOM is ready.
    // This function can be changed based on the Chart API.
    drawChart = () => {
        let chartData = this.getChartData()
        let {
            dataCfg: cfg, valueLabels, keyLabels, chartType,
            colors, xAxis, yAxis, legend, stacked, tooltip,
            onClick, onDoubleClick, onContextMenu, onMouseOver,
            plotOptions, exporting, chart, otherChartParams = {}
        } = this.props
        let xLabels = _.get(valueLabels, cfg.x)
        let yLabels = _.get(valueLabels, cfg.y)
        // All charts produced by this component

        // Highchart params
        let chartParams = _.merge({
            chart: _.merge({
                type: chartType
            }, chart),
            title: {
                text: ''
            },
            credits: {
                enabled: false
            },
            legend: _.merge({
                align: 'right',
                layout: 'vertical',
                verticalAlign: 'top'
            }, legend),
            xAxis: _.merge({
                type: 'linear'
            }, xAxis),
            yAxis: _.merge({
                title: {text:''}
            }, yAxis),
            exporting,
            plotOptions
        }, otherChartParams)

        const xType = chartParams.xAxis.type
        if (xType === 'category') {
            const xCats = _(chartData)
                .values()
                .flatten()
                .map(i=>_.get(i, cfg.x))
                .uniq()
                .map(i=>_.get(xLabels, i, i))
                .value()

            chartParams.xAxis.categories = xCats
        }

        // Callback functions' parameters
        let getEventParams = function getEventParams(scope) {
            if (!scope) { scope = 'point' }
            let point = this.point ? this.point : this

            // Parameters for point-scoped events
            switch (scope) {
                case 'point':
                    return [
                        {
                            x: xType === 'category' ? _.get(point, cfg.x) : point.x,
                            y: point.y,
                            matched: point._origData.length,
                            splitSeries: point._seriesKey
                        },
                        point._origData,
                        {
                            dataCfg: _.clone(cfg),
                            keyLabels,
                            valueLabels,
                            xAxis
                        }
                    ]
                case 'series':
                    return []
                case 'chart':
                    return []
                default: return []
            }
        }

        // Callback function: Tooltip
        chartParams.tooltip = {enabled:true, ...tooltip}
        const {formatter, ...otherTooltipOptions} = chartParams.tooltip
        if (formatter) {
            chartParams.tooltip.useHTML = true
            chartParams.tooltip.formatter = function f() {
                const params = getEventParams.call(this, 'point')
                return ReactDOMServer.renderToStaticMarkup(formatter.apply(this, [...params, otherTooltipOptions]))
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
            // For point, e.point refers to the point (originally "this")
            // For column/bar chart, we can only get the point object by using "this"
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
            let labels = keyLabels
            if (cfg.splitSeries) {
                if (cfg.y) {
                    labels = _.get(valueLabels, cfg.splitSeries)
                }
                seriesData = _.map(data, (seriesEl, seriesKey) => ({
                    // Series level properties
                    name: labels && _.get(labels, seriesKey) ? _.get(labels, seriesKey) : seriesKey,
                    stacking: stacked ? 'normal' : null,
                    connectNulls: true, // Area chart only, connect graph line across null points.
                    data: _.chain(seriesEl)
                        .map(el => {
                            // Point level properties
                            let clone = _.cloneDeep(el)
                            // Add x, y, and name properties
                            if (xType !== 'category') {
                                if (xType === 'datetime') {
                                    clone.x = Date.UTC(...moment(el._coords[0]).toArray())
                                }
                                else {
                                    clone.x = el._coords[0]
                                }
                            }
                            clone.y = el._coords[1]
                            clone.name = xLabels ? _.get(xLabels, el._coords[0], el._coords[0]) : el._coords[0]
                            return clone
                        })
                        .sortBy('x')
                        .value(),
                    color: _.get(colors, seriesKey),
                    point: {
                        events: pointEvents
                    }
                }))
            }
            else {
                let labels = keyLabels
                // Single series only
                seriesData = [{
                    name: _.get(labels, cfg.y),
                    connectNulls: true,
                    data: _.chain(_.values(data)[0])
                        .map(el => {
                            let clone = _.cloneDeep(el)
                            if (xType !== 'category') {
                                if (xType === 'datetime') {
                                    clone.x = Date.UTC(...moment(el._coords[0]).toArray())
                                }
                                else {
                                    clone.x = el._coords[0]
                                }
                            }
                            clone.y = el._coords[1]
                            clone.name = xLabels ? _.get(xLabels, el._coords[0], el._coords[0]) : el._coords[0]
                            return clone
                        })
                        .sortBy('x')
                        .value(),
                    point: {
                        events: pointEvents
                    }
                }]
            }
            return seriesData
        })

        let seriesData = getSeriesData(chartData)
        chartParams.series = seriesData
        this.chart = Highcharts.chart(this.chartNode, chartParams)
    };

    reflowChart = () => {
        this.chart.reflow()
    };

    shouldComponentUpdate(nextProps) {
        this.reflowChart()
        return JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data)
    }

    render() {
        const {chartType} = this.props
        return <div className={`c-chart-${chartType}`} ref={node => { this.chartNode = node }} />
    }
}


/**
 * A React Axis Chart for Line, Bar, Column, and Area chart
 * @alias module:AxisChart
 * @constructor
 * @param {string} [id] - Chart dom element #id
 * @param {string} [className] - Classname for the chart
 * @param {string} [title] - Title for the chart
 * @param {string} [chartType] - "bar", "column", "line", or "area"
 * @param {boolean} [stacked] - BarChart only, whether the bars are stacked instead of side-by side.
 * @param {array} data - Data, see below example
 * @param {object} dataCfg - Mapping between data shape and chart
 * @param {string | array.<string>} [dataCfg.splitChart] - if specified, will split into multiple charts based on the given key/path
 * @param {string | array.<string>} dataCfg.x - key/path for the x axis
 * @param {string | array.<string> | array.<array.<string>>} [dataCfg.splitSeries] - if specified, will split into different bars based on the given key/path
 * @param {string | array.<string>} [dataCfg.y] - key for the y axis, if not provided, then **splitSeries** is assumed to contain y value
 * @param {renderable} [placeholder='No Data Available'] - Placeholder to show when no data is present
 * @param {object} [keyLabels] - Key/label pairs for all the keys, see below for example
 * @param {object} [valueLabels] - Value/label pairs for all the values, see below for example
 * @param {object} [colors] - Colors for different series
 * @param {object} [xAxis] - config for the X axis, see Highcharts API {@link http://api.highcharts.com/highcharts/xAxis}
 * @param {object} [yAxis] - config for the Y axis, see Highcharts API {@link http://api.highcharts.com/highcharts/yAxis}
 *@param {object} [exporting] - config for exporting function(offline), need to include jspdf.js and svgpdf.js in lib,see Highcharts API {@link http://api.highcharts.com/highcharts/yAxis}
 * @param {object} [legend] - config for the legends, see Highcharts API {@link http://api.highcharts.com/highcharts/legend}
 * @param {object} [plotOptions] - config for the plotOptions, see Highcharts API {@link http://api.highcharts.com/highcharts/plotOptions}
 * @param {object} [tooltip] - Tooltip for the hovered item
 * @param {boolean} [tooltip.enabled=true] - enable tooltip?
 * @param {function} [tooltip.formatter] - self defined rendering function as below
 * @param {object} tooltip.formatter.eventInfo - info on the hovered bar
 * @param {number} tooltip.formatter.eventInfo.matched - number of data items associated with this bar
 * @param {string} tooltip.formatter.eventInfo.splitChart - associated chart value
 * @param {string} tooltip.formatter.eventInfo.x - associated x value
 * @param {string} tooltip.formatter.eventInfo.splitSeries - associated series
 * @param {number} tooltip.formatter.eventInfo.y - associated y value
 * @param {array.<object>} tooltip.formatter.data - dataset of the current hovered bar
 * @param {object} tooltip.formatter.cfg - data related cfg for this chart
 * @param {object} tooltip.formatter.cfg.dataCfg
 * @param {object} [tooltip.formatter.cfg.keyLabels]
 * @param {object} [tooltip.formatter.cfg.valueLabels]
 * @param {function} [onMouseOver] - Function to call when mouse over, see tooltip.formatter for callback function spec
 * @param {function} [onClick] - Function to call when clicked, see tooltip.formatter for callback function spec
 * @param {function} [onContextMenu] - Function to call when right clicked, see tooltip.formatter for callback function spec
 * @param {function} [onDoubleClick] - Function to call when double clicked, see tooltip.formatter for callback function spec
 *
 */
const AxisChart = toWidget(BaseAxisChart)

export default AxisChart
