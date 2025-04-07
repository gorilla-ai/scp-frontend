'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactGridLayout = require('react-grid-layout');

var _reactGridLayout2 = _interopRequireDefault(_reactGridLayout);

require('react-grid-layout/css/styles.css');

require('react-resizable/css/styles.css');

var _propTypes3 = require('react-ui/build/src/consts/prop-types');

var _propWire = require('react-ui/build/src/hoc/prop-wire');

var _propTypes4 = require('../consts/prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GridLayout = (0, _reactGridLayout.WidthProvider)(_reactGridLayout2.default);

var log = require('loglevel').getLogger('chart/components/dashboard');

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

var Dashboard = function (_React$Component) {
    _inherits(Dashboard, _React$Component);

    function Dashboard(props) {
        _classCallCheck(this, Dashboard);

        var _this = _possibleConstructorReturn(this, (Dashboard.__proto__ || Object.getPrototypeOf(Dashboard)).call(this, props));

        _this.state = { filterables: {} };

        _this.handleUpdateFilter = _this.handleUpdateFilter.bind(_this);
        _this.handleLayoutChange = _this.handleLayoutChange.bind(_this);
        _this.toggleFilter = _this.toggleFilter.bind(_this);
        return _this;
    }

    _createClass(Dashboard, [{
        key: 'handleUpdateFilter',
        value: function handleUpdateFilter(eventInfo, matched, _ref) {
            var dataCfg = _ref.dataCfg;

            var filter = _lodash2.default.reduce(dataCfg, function (acc, keys, i) {
                if (i !== 'agg' && i !== 'y' && i !== 'sliceSize') {
                    var event = eventInfo[i];
                    if (_lodash2.default.isArray(keys)) {
                        _lodash2.default.forEach(keys, function (k, j) {
                            acc[k] = event[j];
                        });
                    } else {
                        acc[keys] = event;
                    }
                }
                return acc;
            }, {});
            this.setState({ filterables: filter });
        }
    }, {
        key: 'handleLayoutChange',
        value: function handleLayoutChange(layout) {
            var onLayoutChange = this.props.onLayoutChange;


            if (onLayoutChange) {
                var formattedLayout = _lodash2.default.map(layout, function (el) {
                    return _lodash2.default.chain(el).pick(['x', 'y', 'h', 'w', 'mixH', 'maxH', 'minW', 'maxW', 'static', 'isDraggable', 'isResizable', 'verticalCompact']).omitBy(_lodash2.default.isNil).value();
                });

                onLayoutChange(formattedLayout);
            }
        }
    }, {
        key: 'toggleFilter',
        value: function toggleFilter(key) {
            var _props = this.props,
                filter = _props.filter,
                onFilter = _props.onFilter;
            var filterables = this.state.filterables;


            if (_lodash2.default.has(filter, key)) {
                onFilter(_lodash2.default.omit(filter, key));
            } else {
                onFilter(_extends({}, filter, _defineProperty({}, key, filterables[key])));
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props2 = this.props,
                id = _props2.id,
                className = _props2.className,
                filter = _props2.filter,
                onFilter = _props2.onFilter,
                keyLabels = _props2.keyLabels,
                valueLabels = _props2.valueLabels;

            var _ref2 = this.props.layoutCfg || {},
                _ref2$cols = _ref2.cols,
                cols = _ref2$cols === undefined ? 12 : _ref2$cols,
                _ref2$rowHeight = _ref2.rowHeight,
                rowHeight = _ref2$rowHeight === undefined ? 200 : _ref2$rowHeight,
                _ref2$isDraggable = _ref2.isDraggable,
                isDraggable = _ref2$isDraggable === undefined ? true : _ref2$isDraggable,
                _ref2$isResizable = _ref2.isResizable,
                isResizable = _ref2$isResizable === undefined ? true : _ref2$isResizable,
                _ref2$verticalCompact = _ref2.verticalCompact,
                verticalCompact = _ref2$verticalCompact === undefined ? true : _ref2$verticalCompact,
                _ref2$layout = _ref2.layout,
                layout = _ref2$layout === undefined ? [] : _ref2$layout;

            var filterables = this.state.filterables;

            // Format the layout config for React Grid Layout

            var display = _lodash2.default.map(layout, function (el, idx) {
                var child = _this2.props.children[idx];
                return _extends({ i: child.key ? '.$' + child.key : child.props.id + '/.' + idx }, el);
            });

            var chartBoard = void 0;
            var chartGenerator = _react2.default.Children.map(this.props.children, function (child, idx) {
                // temporary workaround to fix chart data default to [] by defaultProps
                var childNoData = !child.props.data || child.props.data.length === 0;

                var propsToOverwrite = _lodash2.default.reduce(['placeholder', 'data', 'keyLabels', 'valueLabels', 'tooltip.formatter', 'onMouseOver', 'onClick', 'onDoubleClick', 'onContextMenu'], function (acc, p) {
                    if (_lodash2.default.has(_this2.props, p) && (!_lodash2.default.has(child.props, p) || p === 'data' && childNoData)) {
                        var prop = _lodash2.default.get(_this2.props, p);
                        if (typeof prop === 'function') {
                            _lodash2.default.set(acc, p, prop.bind(null, child.props.id));
                        } else {
                            _lodash2.default.set(acc, p, prop);
                        }
                    }
                    return acc;
                }, {});

                if (onFilter) {
                    propsToOverwrite.onClick = _this2.handleUpdateFilter;
                }

                if (!_lodash2.default.isEmpty(filter)) {
                    propsToOverwrite.data = _lodash2.default.filter(childNoData ? _this2.props.data : child.props.data, filter);
                }

                propsToOverwrite.className = child.props.className ? child.props.className + ' ' : '';
                if (layout.length > 0 && layout[idx].w <= cols / 2) {
                    propsToOverwrite.className += 'column';
                }

                return _react2.default.createElement(
                    'div',
                    { key: child.props.id },
                    _react2.default.cloneElement(child, propsToOverwrite)
                );
            });

            if (this.props.layoutCfg) {
                chartBoard = _react2.default.createElement(
                    GridLayout,
                    {
                        className: 'widgets',
                        layout: display, cols: cols, rowHeight: rowHeight,
                        isDraggable: isDraggable, isResizable: isResizable,
                        verticalCompact: verticalCompact,
                        onLayoutChange: this.handleLayoutChange },
                    chartGenerator
                );
            } else {
                chartBoard = _react2.default.createElement(
                    'div',
                    { className: 'widgets' },
                    chartGenerator
                );
            }

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-chart-dashboard', className) },
                !_lodash2.default.isEmpty(filterables) && _react2.default.createElement(
                    'div',
                    { className: 'filter c-flex' },
                    _lodash2.default.map(filterables, function (value, key) {
                        return _react2.default.createElement(
                            'span',
                            { key: key, className: (0, _classnames2.default)('c-link', { active: _lodash2.default.has(filter, key) }), onClick: _this2.toggleFilter.bind(_this2, key) },
                            _react2.default.createElement(
                                'span',
                                { className: 'key' },
                                _lodash2.default.get(keyLabels, key, key)
                            ),
                            _react2.default.createElement(
                                'span',
                                { className: 'value' },
                                _lodash2.default.get(valueLabels, [key, value], value)
                            )
                        );
                    })
                ),
                chartBoard
            );
        }
    }]);

    return Dashboard;
}(_react2.default.Component);

Dashboard.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    children: _propTypes2.default.node,
    data: _propTypes2.default.arrayOf(_propTypes4.DATA_ITEM_PROP),
    placeholder: _propTypes2.default.node,
    keyLabels: _propTypes4.DATA_ITEM_PROP,
    valueLabels: _propTypes2.default.objectOf(_propTypes4.DATA_ITEM_PROP),
    filter: _propTypes3.SIMPLE_OBJECT_PROP,
    layoutCfg: _propTypes2.default.shape({
        layout: _propTypes2.default.arrayOf(_propTypes2.default.shape({
            x: _propTypes2.default.number,
            y: _propTypes2.default.number,
            w: _propTypes2.default.number,
            h: _propTypes2.default.number,
            minW: _propTypes2.default.number,
            maxW: _propTypes2.default.number,
            minH: _propTypes2.default.number,
            maxH: _propTypes2.default.number,
            static: _propTypes2.default.bool,
            isDraggable: _propTypes2.default.bool,
            isResizable: _propTypes2.default.bool
        })).isRequired,
        cols: _propTypes2.default.number,
        rowHeight: _propTypes2.default.number,
        isDraggable: _propTypes2.default.bool,
        isResizable: _propTypes2.default.bool,
        verticalCompact: _propTypes2.default.bool
    }),
    onFilter: _propTypes2.default.func,
    tooltip: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        formatter: _propTypes2.default.func
    }),
    onMouseOver: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func,
    onLayoutChange: _propTypes2.default.func
};

Dashboard.defaultProps = {
    id: '',
    className: '',
    data: []
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
};exports.default = (0, _propWire.wire)(Dashboard, 'layoutCfg.layout', [], 'onLayoutChange');