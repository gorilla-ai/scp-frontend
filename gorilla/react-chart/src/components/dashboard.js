import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'
import ReactGridLayout, {WidthProvider} from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import { SIMPLE_OBJECT_PROP } from 'react-ui/build/src/consts/prop-types'
import {wire} from 'react-ui/build/src/hoc/prop-wire'
import {DATA_ITEM_PROP} from '../consts/prop-types'

const GridLayout = WidthProvider(ReactGridLayout)

let log = require('loglevel').getLogger('chart/components/dashboard')

/**
 * A React Dashboard
 * @constructor
 * @param {string} [id] - Dashboard dom element #id
 * @param {string} [className] - Classname for the dashboard
 * @param {renderable} children - Widgets definition
 * @param {array.<object>} [data] - Global data for the dashboard, note this may be overwritten by data in child widget
 * @param {renderable} [placeholder] - Placeholder for all charts, will be overwritten by individual chart placeholders
 * @param {object} [keyLabels] - Global Key/label pairs for all the keys, note this may be overwritten by data in child widget
 * @param {object} [valueLabels] - Global Value/label pairs for all the values, note this may be overwritten by data in child widget
 * @param {object} [filter] - Filter to apply to data
 * @param {object} [layoutCfg] - Dashboard layout config
 * @param {array.<object>} layoutCfg.layout - The arrangement of charts in dashborad
 * @param {number} layoutCfg.layout.x - x position of the grid, in grid unit
 * @param {number} layoutCfg.layout.y - y position of the grid, in grid unit
 * @param {number} layoutCfg.layout.w - The width of the grid, in grid unit
 * @param {number} layoutCfg.layout.h - The height of the grid, in grid unit
 * @param {number} [layoutCfg.layout.minW=0] - The min width of the grid, in grid unit
 * @param {number} [layoutCfg.layout.maxW=Infinity] - The max width of the grid, in grid unit
 * @param {number} [layoutCfg.layout.minH=0] - The min height of the grid, in grid unit
 * @param {number} [layoutCfg.layout.maxH=Infinity] - The max height of the grid, in grid unit
 * @param {boolean} [layoutCfg.layout.static=false] - If true, this grid can't be resized and dragged
 * @param {boolean} [layoutCfg.layout.isDraggable=true] - Is this grid draggable
 * @param {boolean} [layoutCfg.layout.isResizable=true] - Is this grid resizable
 * @param {boolean} [layoutCfg.layout.verticalCompact=true] - Is auto move grids to fill the upper space
 * @param {number} [layoutCfg.cols=12] - Number of columns in dashboard
 * @param {number} [layoutCfg.rowHeight=200] - Unit row height of a grid, in pixel
 * @param {boolean} [layoutCfg.isDraggable=true] - Is the grids draggable
 * @param {boolean} [layoutCfg.isResizable=true] - Is the grids resizable
 * @param {object} [defaultLayoutcfg] - Dashboard default layout config
 * @param {array.<object>} [defaultLayoutcfg.layout] - The default arrangement of charts in dashborad. See layoutCfg.layout.
 * @param {function} [onFilter] - Global function to call when filter is updated
 * @param {object} onFilter.filter - filter parameters
 * @param {object} [tooltip] - Global tooltip for the hovered item
 * @param {boolean} [tooltip.enabled=true] - Show tooltip?
 * @param {object} [tooltip.formatter] - self defined rendering function as below
 * @param {string} tooltip.formatter.widgetId - hovered widget id
 * @param {object} tooltip.formatter.eventInfo - info on the hovered item, see tooltip API for individual charts
 * @param {array.<object>} tooltip.formatter.data - dataset of the current hovered item
 * @param {object} tooltip.formatter.cfg - data related cfg for this chart
 * @param {object} tooltip.formatter.cfg.dataCfg
 * @param {object} [tooltip.formatter.cfg.keyLabels]
 * @param {object} [tooltip.formatter.cfg.valueLabels]
 * @param {function} [onMouseOver] - Global function to call when mouse over, see tooltip.formatter for callback function spec
 * @param {function} [onClick] - Global function to call when clicked, see tooltip.formatter for callback function spec
 * @param {function} [onContextMenu] - Global function to call when right clicked, see tooltip.formatter for callback function spec
 * @param {function} [onDoubleClick] - Global function to call when double clicked, see tooltip.formatter for callback function spec
 * @param {function} [onLayoutChange] - Global function to call when layout changed
 * @param {array.<object>} [onLayoutChange.layout] - Layout config for each grid. See layoutCfg.layout
 *
 * @example

import BarChart from 'chart/components/bar'
import LineChart from 'chart/components/line'
import PieChart from 'chart/components/pie'
import AreaChart from 'chart/components/area'
import SummaryTable from 'chart/components/table'
import Dashboard from 'chart/components/dashboard'

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
    getInitialState() {
        return {
            filter: {},
            event: {}
        }
    },
    handleFilter(filter) {
        this.setState({filter})
    },
    handleDoubleClick(widgetId, eventInfo, data, cfg) {
        this.setState({event:{type:'global double-click', widgetId, eventInfo, data, cfg}})
    },
    handleContextMenu(widgetId, eventInfo, data, cfg) {
        this.setState({event:{type:'global right-click', widgetId, eventInfo, data, cfg}})
    },
    handleActorChartDoubleClick(eventInfo, data, cfg) {
        this.setState({event:{type:'child double-click', eventInfo, data, cfg}})
    },
    handleLayoutChange(layout) {
        this.setState({event:{type:'layout-change', layout}})
    },
    render() {
        const {filter} = this.state

        // Set charts' layout, the order need to be same as the order in DOM
        // Remember to properly set the layout, or it may crash
        const layout = [
            {x:0, y:0, w:9, h:2},
            {x:9, y:0, w:9, h:4},
            {x:0, y:2, w:9, h:6},
            {x:0, y:8, w:18, h:2},
            {x:9, y:4, w:9, h:4}
        ]

        return <Dashboard
            data={DATA}
            keyLabels={KEY_LABELS}
            valueLabels={VALUE_LABELS}
            onDoubleClick={this.handleDoubleClick}
            onContextMenu={this.handleContextMenu}
            onFilter={this.handleFilter}
            onLayoutChange={this.handleLayoutChange}
            filter={filter}
            layoutCfg={{cols:18}}
            defaultLayoutcfg={{layout}}>
            <SummaryTable
                id='actor-chart'
                title='Directors table'
                dataCfg={{
                    splitChart: 'director',
                    splitRow: [ 'actor'],
                    agg: ['movies', 'tvs']
                }}
                onDoubleClick={this.handleActorChartDoubleClick} />
            <AreaChart
                id='director-split-actor-area-chart'
                className='c-test'
                title='Area Chart by Director'
                dataCfg={{
                    splitChart: 'director',
                    splitSeries: 'actor',
                    x: 'year',
                    y: 'movies'
                }} />
            <PieChart
                id='actor-pie-chart'
                title='Pie Charts By Year'
                holeSize={70}
                dataCfg={{
                    splitChart: 'year',
                    splitSlice: ['director', 'actor'],
                    sliceSize: 'movies'
                }} />
            <BarChart
                id='actor-bar-chart'
                title='Actors by Year'
                stacked
                vertical
                dataCfg={{
                    splitSeries: 'actor',
                    x: 'year',
                    y: 'movies'
                }} />
            <LineChart
                id='director-split-actor-line-chart'
                title='Line Charts by Actor'
                stacked
                vertical
                dataCfg={{
                    splitChart: 'actor',
                    splitSeries: 'director',
                    x: 'year',
                    y: 'movies'
                }} />
        </Dashboard>
    }
})
*/

class Dashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = { filterables: {} }

        this.handleUpdateFilter = this.handleUpdateFilter.bind(this)
        this.handleLayoutChange = this.handleLayoutChange.bind(this)
        this.toggleFilter = this.toggleFilter.bind(this)
    }

    handleUpdateFilter(eventInfo, matched, {dataCfg}) {
        const filter = _.reduce(dataCfg, (acc, keys, i)=>{
            if (i!=='agg' && i!=='y' && i!=='sliceSize') {
                const event = eventInfo[i]
                if (_.isArray(keys)) {
                    _.forEach(keys, (k, j)=>{
                        acc[k] = event[j]
                    })
                }
                else {
                    acc[keys] = event
                }
            }
            return acc
        }, {})
        this.setState({filterables:filter})
    }

    handleLayoutChange(layout) {
        const {onLayoutChange} = this.props

        if (onLayoutChange) {
            const formattedLayout = _.map(layout, el => {
                return _.chain(el)
                    .pick(['x', 'y', 'h', 'w', 'mixH', 'maxH', 'minW', 'maxW', 'static', 'isDraggable', 'isResizable', 'verticalCompact'])
                    .omitBy(_.isNil)
                    .value()
            })

            onLayoutChange(formattedLayout)
        }
    }

    toggleFilter(key) {
        const {filter, onFilter} = this.props
        const {filterables} = this.state

        if (_.has(filter, key)) {
            onFilter(_.omit(filter, key))
        }
        else {
            onFilter({...filter, [key]:filterables[key]})
        }
    }

    render() {
        const {id, className, filter, onFilter, keyLabels, valueLabels} = this.props
        const {cols=12, rowHeight=200, isDraggable=true, isResizable=true, verticalCompact=true, layout=[]} = this.props.layoutCfg || {}
        const {filterables} = this.state

        // Format the layout config for React Grid Layout
        const display = _.map(layout, (el, idx) => {
            const child = this.props.children[idx]
            return {i:child.key ? `.$${child.key}` : `${child.props.id}/.${idx}`, ...el}
        })

        let chartBoard
        let chartGenerator = React.Children.map(this.props.children, (child, idx) => {
            // temporary workaround to fix chart data default to [] by defaultProps
            const childNoData = (!child.props.data || child.props.data.length===0)

            let propsToOverwrite = _.reduce(['placeholder', 'data', 'keyLabels', 'valueLabels', 'tooltip.formatter', 'onMouseOver', 'onClick', 'onDoubleClick', 'onContextMenu'], (acc, p)=>{
                if (_.has(this.props, p) && (!_.has(child.props, p) || (p==='data'&&childNoData))) {
                    const prop = _.get(this.props, p)
                    if (typeof prop === 'function') {
                        _.set(acc, p, prop.bind(null, child.props.id))
                    }
                    else {
                        _.set(acc, p, prop)
                    }
                }
                return acc
            }, {})

            if (onFilter) {
                propsToOverwrite.onClick = this.handleUpdateFilter
            }

            if (!_.isEmpty(filter)) {
                propsToOverwrite.data = _.filter(childNoData ? this.props.data : child.props.data, filter)
            }

            propsToOverwrite.className = child.props.className ? `${child.props.className} ` : ''
            if (layout.length > 0 && layout[idx].w <= cols/2) {
                propsToOverwrite.className += 'column'
            }

            return <div key={child.props.id}>{React.cloneElement(child, propsToOverwrite)}</div>
        })

        if (this.props.layoutCfg) {
            chartBoard = <GridLayout
                className='widgets'
                layout={display} cols={cols} rowHeight={rowHeight}
                isDraggable={isDraggable} isResizable={isResizable}
                verticalCompact={verticalCompact}
                onLayoutChange={this.handleLayoutChange}>
                { chartGenerator }
            </GridLayout>
        }
        else {
            chartBoard = <div className='widgets'>
                {chartGenerator}
            </div>
        }

        return <div id={id} className={cx('c-chart-dashboard', className)}>
            { !_.isEmpty(filterables) &&
                <div className='filter c-flex'>
                    {
                        _.map(filterables, (value, key)=>{
                            return <span key={key} className={cx('c-link', {active:_.has(filter, key)})} onClick={this.toggleFilter.bind(this, key)}>
                                <span className='key'>{_.get(keyLabels, key, key)}</span>
                                <span className='value'>{_.get(valueLabels, [key, value], value)}</span>
                            </span>
                        })
                    }
                </div>
            }

            {chartBoard}
        </div>
    }
}

Dashboard.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
    data: PropTypes.arrayOf(DATA_ITEM_PROP),
    placeholder: PropTypes.node,
    keyLabels: DATA_ITEM_PROP,
    valueLabels: PropTypes.objectOf(DATA_ITEM_PROP),
    filter: SIMPLE_OBJECT_PROP,
    layoutCfg: PropTypes.shape({
        layout: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
            w: PropTypes.number,
            h: PropTypes.number,
            minW: PropTypes.number,
            maxW: PropTypes.number,
            minH: PropTypes.number,
            maxH: PropTypes.number,
            static: PropTypes.bool,
            isDraggable: PropTypes.bool,
            isResizable: PropTypes.bool
        })).isRequired,
        cols: PropTypes.number,
        rowHeight: PropTypes.number,
        isDraggable: PropTypes.bool,
        isResizable: PropTypes.bool,
        verticalCompact: PropTypes.bool
    }),
    onFilter: PropTypes.func,
    tooltip: PropTypes.shape({
        enabled: PropTypes.bool,
        formatter: PropTypes.func
    }),
    onMouseOver: PropTypes.func,
    onClick: PropTypes.func,
    onContextMenu: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onLayoutChange: PropTypes.func
}

Dashboard.defaultProps = {
    id: '',
    className: '',
    data: []
}
/*
const Dashboard = React.createClass({
    propTypes: {
        id: PropTypes.string,
        className: PropTypes.string,
        children: PropTypes.node,
        data: PropTypes.arrayOf(DATA_ITEM_PROP),
        placeholder: PropTypes.node,
        keyLabels: DATA_ITEM_PROP,
        valueLabels: PropTypes.objectOf(DATA_ITEM_PROP),
        filter: SIMPLE_OBJECT_PROP,
        layoutCfg: PropTypes.shape({
            layout: PropTypes.arrayOf(PropTypes.shape({
                x: PropTypes.number,
                y: PropTypes.number,
                w: PropTypes.number,
                h: PropTypes.number,
                minW: PropTypes.number,
                maxW: PropTypes.number,
                minH: PropTypes.number,
                maxH: PropTypes.number,
                static: PropTypes.bool,
                isDraggable: PropTypes.bool,
                isResizable: PropTypes.bool
            })).isRequired,
            cols: PropTypes.number,
            rowHeight: PropTypes.number,
            isDraggable: PropTypes.bool,
            isResizable: PropTypes.bool,
            verticalCompact: PropTypes.bool
        }),
        onFilter: PropTypes.func,
        tooltip: PropTypes.shape({
            enabled: PropTypes.bool,
            formatter: PropTypes.func
        }),
        onMouseOver: PropTypes.func,
        onClick: PropTypes.func,
        onContextMenu: PropTypes.func,
        onDoubleClick: PropTypes.func,
        onLayoutChange: PropTypes.func
    },
    getInitialState() {
        return {
            filterables: {}
        }
    },
    handleUpdateFilter(eventInfo, matched, {dataCfg}) {
        const filter = _.reduce(dataCfg, (acc, keys, i)=>{
            if (i!=='agg' && i!=='y' && i!=='sliceSize') {
                const event = eventInfo[i]
                if (_.isArray(keys)) {
                    _.forEach(keys, (k, j)=>{
                        acc[k] = event[j]
                    })
                }
                else {
                    acc[keys] = event
                }
            }
            return acc
        }, {})
        this.setState({filterables:filter})
    },
    handleLayoutChange(layout) {
        const {onLayoutChange} = this.props

        if (onLayoutChange) {
            const formattedLayout = _.map(layout, el => {
                return _.chain(el)
                    .pick(['x', 'y', 'h', 'w', 'mixH', 'maxH', 'minW', 'maxW', 'static', 'isDraggable', 'isResizable', 'verticalCompact'])
                    .omitBy(_.isNil)
                    .value()
            })

            onLayoutChange(formattedLayout)
        }
    },
    toggleFilter(key) {
        const {filter, onFilter} = this.props
        const {filterables} = this.state

        if (_.has(filter, key)) {
            onFilter(_.omit(filter, key))
        }
        else {
            onFilter({...filter, [key]:filterables[key]})
        }
    },
    render() {
        const {id, className, filter, onFilter, keyLabels, valueLabels} = this.props
        const {cols=12, rowHeight=200, isDraggable=true, isResizable=true, verticalCompact=true, layout=[]} = this.props.layoutCfg || {}
        const {filterables} = this.state

        // Format the layout config for React Grid Layout
        const display = _.map(layout, (el, idx) => {
            const child = this.props.children[idx]
            return {i:child.key ? `.$${child.key}` : `${child.props.id}/.${idx}`, ...el}
        })

        let chartBoard
        let chartGenerator = React.Children.map(this.props.children, (child, idx) => {
            // temporary workaround to fix chart data default to [] by defaultProps
            const childNoData = (!child.props.data || child.props.data.length===0)

            let propsToOverwrite = _.reduce(['placeholder', 'data', 'keyLabels', 'valueLabels', 'tooltip.formatter', 'onMouseOver', 'onClick', 'onDoubleClick', 'onContextMenu'], (acc, p)=>{
                if (_.has(this.props, p) && (!_.has(child.props, p) || (p==='data'&&childNoData))) {
                    const prop = _.get(this.props, p)
                    if (typeof prop === 'function') {
                        _.set(acc, p, prop.bind(null, child.props.id))
                    }
                    else {
                        _.set(acc, p, prop)
                    }
                }
                return acc
            }, {})

            if (onFilter) {
                propsToOverwrite.onClick = this.handleUpdateFilter
            }

            if (!_.isEmpty(filter)) {
                propsToOverwrite.data = _.filter(childNoData ? this.props.data : child.props.data, filter)
            }

            propsToOverwrite.className = child.props.className ? `${child.props.className} ` : ''
            if (layout.length > 0 && layout[idx].w <= cols/2) {
                propsToOverwrite.className += 'column'
            }

            return <div key={child.props.id}>{React.cloneElement(child, propsToOverwrite)}</div>
        }
        )

        if (this.props.layoutCfg) {
            chartBoard = <GridLayout
                className='widgets'
                layout={display} cols={cols} rowHeight={rowHeight}
                isDraggable={isDraggable} isResizable={isResizable}
                verticalCompact={verticalCompact}
                onLayoutChange={this.handleLayoutChange}>
                {
                    chartGenerator
                }
            </GridLayout>
        }
        else {
            chartBoard = <div className='widgets'>
                {chartGenerator}
            </div>
        }

        return <div id={id} className={cx('c-chart-dashboard', className)}>
            { !_.isEmpty(filterables) &&
                <div className='filter c-flex'>
                    {
                        _.map(filterables, (value, key)=>{
                            return <span key={key} className={cx('c-link', {active:_.has(filter, key)})} onClick={this.toggleFilter.bind(this, key)}>
                                <span className='key'>{_.get(keyLabels, key, key)}</span>
                                <span className='value'>{_.get(valueLabels, [key, value], value)}</span>
                            </span>
                        })
                    }
                </div>
            }

            {chartBoard}
        </div>
    }
})
*/
export default wire(Dashboard, 'layoutCfg.layout', [], 'onLayoutChange')