'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _highcharts = require('highcharts');

var _highcharts2 = _interopRequireDefault(_highcharts);

var _highchartsCustomEvents = require('highcharts-custom-events');

var _highchartsCustomEvents2 = _interopRequireDefault(_highchartsCustomEvents);

var _widgetProvider = require('../hoc/widget-provider');

var _widgetProvider2 = _interopRequireDefault(_widgetProvider);

var _traversal = require('../utils/traversal');

var _propTypes3 = require('../consts/prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('chart/components/pie');

if (!_highcharts2.default.Chart.prototype.customEvent) {
    (0, _highchartsCustomEvents2.default)(_highcharts2.default);
}

var BasePieChart = function (_React$Component) {
    _inherits(BasePieChart, _React$Component);

    function BasePieChart() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, BasePieChart);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = BasePieChart.__proto__ || Object.getPrototypeOf(BasePieChart)).call.apply(_ref, [this].concat(args))), _this), _this.getChartData = function () {
            var series = [];
            var _this$props = _this.props,
                cfg = _this$props.dataCfg,
                propData = _this$props.data;

            var grouper = function grouper(data, keys, index) {
                var curkey = keys.shift();
                if (!keys.length) {
                    return _lodash2.default.chain(data).groupBy(function (el) {
                        return _lodash2.default.get(el, curkey);
                    }).map(function (el) {
                        var clone = _lodash2.default.cloneDeep(_lodash2.default.head(el));
                        _lodash2.default.set(clone, cfg.sliceSize, _lodash2.default.sumBy(el, cfg.sliceSize));
                        // Add more attributes: _coords, _origData, _seriesKey, and _chartKey.
                        // _coords: Array of [x, y] coordinates
                        // _origData: Original data object
                        // _seriesKey: Array of key of series. Example, if year and actor is the split key, this array will be [1997, 'tom'] or [1990, 'nicole'], etc.
                        // _chartKey: key of the chart. Example, if director is the chart key, this array will be 'martin' or 'francis'.
                        clone._coords = [_lodash2.default.get(clone, curkey), _lodash2.default.get(clone, cfg.sliceSize)];
                        clone._origData = el;
                        clone._seriesKey = index;
                        // x key is also a seriesKey in piechart.
                        clone._seriesKey = [].concat(_toConsumableArray(clone._seriesKey), [clone._coords[0]]);
                        return clone;
                    }).value();
                }
                // groupBy and mapValues will return an object with string type keys
                // If the key is a numerical value, it will be converted to string.
                // So when passing the keys to deeper loop, we "get" the keys again from the original data.
                return _lodash2.default.chain(data).groupBy(function (el) {
                    return _lodash2.default.get(el, curkey);
                }).mapValues(function (dat) {
                    return grouper(dat, _lodash2.default.clone(keys), [].concat(_toConsumableArray(index), [_lodash2.default.get(_lodash2.default.head(dat), curkey)]));
                }).value();
            };
            series = grouper(propData, _lodash2.default.compact(cfg.splitSlice), []);
            return series;
        }, _this.setCenterText = function (e) {
            var chart = e.target;
            var centerText = _this.props.centerText;

            var sqrt2 = Math.sqrt(2);
            var centerX = chart.series[0].center[0] + chart.plotLeft;
            var centerY = chart.series[0].center[1] + chart.plotTop;
            var radius = chart.series[0].data[0].shapeArgs.innerR;
            var halfLength = radius / sqrt2;
            var topLeftX = centerX - halfLength;
            var topLeftY = centerY - halfLength;
            var length = 2 * halfLength;
            var containerNode = _this.chartNode.childNodes[0];

            if (chart.centerTitle) {
                containerNode.removeChild(chart.centerTitle);
            }

            var node = document.createElement('DIV');
            containerNode.appendChild(node);

            _reactDom2.default.render(_react2.default.createElement(
                'div',
                {
                    style: {
                        position: 'absolute', left: topLeftX, top: topLeftY,
                        width: length, height: length,
                        display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' } },
                centerText
            ), node);

            chart.centerTitle = node;
        }, _this.drawChart = function () {
            var _this$props2 = _this.props,
                chart = _this$props2.chart,
                legend = _this$props2.legend,
                holeSize = _this$props2.holeSize,
                colors = _this$props2.colors,
                keyLabels = _this$props2.keyLabels,
                valueLabels = _this$props2.valueLabels,
                centerText = _this$props2.centerText,
                cfg = _this$props2.dataCfg,
                onTooltip = _this$props2.onTooltip,
                onClick = _this$props2.onClick,
                onDoubleClick = _this$props2.onDoubleClick,
                onContextMenu = _this$props2.onContextMenu,
                onMouseOver = _this$props2.onMouseOver,
                _this$props2$dataLabe = _this$props2.dataLabels,
                dataLabels = _this$props2$dataLabe === undefined ? { enabled: false } : _this$props2$dataLabe,
                _this$props2$otherCha = _this$props2.otherChartParams,
                otherChartParams = _this$props2$otherCha === undefined ? {} : _this$props2$otherCha;

            var chartData = _this.getChartData(),
                labels = keyLabels,
                yLabel = _lodash2.default.get(keyLabels, cfg.sliceSize, cfg.sliceSize),
                sizes = [],
                seriesCount = cfg.splitSlice.length;

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
            sizes = (0, _lodash2.default)(cfg.splitSlice).map(function (s, i) {
                var size = (100 - holeSize) / seriesCount;
                return {
                    size: holeSize + size * (i + 1) + '%',
                    innerSize: holeSize + size * i + '%'
                };
            }).reverse().value();

            var labelGenerator = function labelGenerator(values) {
                var slices = _lodash2.default.clone(cfg.splitSlice);
                slices = _lodash2.default.take(slices, values.length);
                return values.map(function (el) {
                    var curkey = slices.shift();
                    if (valueLabels) {
                        var vLabels = _lodash2.default.get(valueLabels, curkey);
                        return vLabels ? _lodash2.default.get(vLabels, el, el) : el;
                    }
                    return el;
                });
            };

            // Highchart params
            var chartParams = _lodash2.default.merge({
                chart: _lodash2.default.merge({
                    type: 'pie',
                    events: centerText ? {
                        load: _this.setCenterText,
                        redraw: _this.setCenterText
                    } : {}
                }, chart),
                title: { text: '' },
                credits: {
                    enabled: false
                },
                legend: _lodash2.default.merge({
                    align: 'right',
                    layout: 'vertical',
                    verticalAlign: 'top',
                    labelFormatter: function labelFormatter() {
                        return labelGenerator(this._seriesKey).join(' - ');
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
                        dataLabels: dataLabels,
                        showInLegend: true
                    }
                }
            }, otherChartParams);

            // Callback functions' parameters
            var getEventParams = function getEventParams(scope) {
                if (!scope) {
                    scope = 'point';
                }
                var point = this.point ? this.point : this;
                var params = [];
                // Parameters for point-scoped events
                switch (scope) {
                    case 'point':
                        params = [{
                            sliceSize: point.y,
                            percentage: point.percentage,
                            splitSlice: point._seriesKey,
                            matched: point._origData.length
                        }, point._origData, {
                            dataCfg: _lodash2.default.clone(cfg),
                            keyLabels: keyLabels,
                            valueLabels: valueLabels
                        }];
                        params[2].dataCfg.splitSlice = _lodash2.default.take(params[2].dataCfg.splitSlice, params[0].splitSlice.length);
                        return params;
                    case 'series':
                        return [];
                    case 'chart':
                        return [];
                    default:
                        return [];
                }
            };

            // Callback function: Tooltip
            if (typeof onTooltip === 'function') {
                chartParams.tooltip = {
                    formatter: function formatter() {
                        return _server2.default.renderToStaticMarkup(onTooltip.apply(this, getEventParams.call(this, 'point')));
                    }
                };
            } else if (onTooltip) {
                // Default Tooltip
                chartParams.tooltip = {
                    formatter: function formatter() {
                        var labs = labelGenerator(this.point._seriesKey).join(' - ');
                        var defaultPointTooltip = _react2.default.createElement(
                            'span',
                            null,
                            _react2.default.createElement(
                                'span',
                                { style: { color: this.color } },
                                '\u25CF'
                            ),
                            ' ',
                            yLabel,
                            ': ',
                            _react2.default.createElement(
                                'b',
                                null,
                                this.y
                            ),
                            _react2.default.createElement('br', null)
                        );
                        return _server2.default.renderToStaticMarkup(_react2.default.createElement(
                            'span',
                            null,
                            _react2.default.createElement(
                                'b',
                                null,
                                this.series.name
                            ),
                            _react2.default.createElement('br', null),
                            labs,
                            _react2.default.createElement('br', null),
                            defaultPointTooltip
                        ));
                    }
                };
            }

            // Custom click events
            var customEvents = function customEvents(funcType, scope, e) {
                if (typeof funcType !== 'function' || !funcType) {
                    // We do not override
                    return undefined;
                }
                if (!scope) {
                    scope = 'point';
                }
                e.preventDefault();
                // For pie, e does not contain point property. We need to get "this" to refer to point.
                // For future expansion, we may need to add series or chart scoped condition.
                return funcType.apply(this, getEventParams.call(this, scope));
            };
            // Supported point events
            var pointEvents = {
                click: function click(e) {
                    return customEvents.call(this, onClick, 'point', e);
                },
                dblclick: function dblclick(e) {
                    return customEvents.call(this, onDoubleClick, 'point', e);
                },
                contextmenu: function contextmenu(e) {
                    return customEvents.call(this, onContextMenu, 'point', e);
                },

                // smallcaps because we are using highcharts custom events
                mouseover: function mouseover(e) {
                    return customEvents.call(this, onMouseOver, 'point', e);
                }
            };
            if (!onClick) delete pointEvents.click;
            if (!onDoubleClick) delete pointEvents.dblclick;
            if (!onContextMenu) delete pointEvents.contextmenu;
            if (!onMouseOver) delete pointEvents.mouseover;

            // Convert chart data (hierarchical structure) to specific Highchart format.
            var getSeriesData = function getSeriesData(data) {
                var seriesData = [];
                var distribute = function distribute(val, keys) {
                    var curkey = keys.shift(),
                        ctr = keys.length,
                        curLabels = _lodash2.default.get(valueLabels, curkey);
                    // Leaf part (outer part of the donut)
                    if (!keys.length) {
                        var leafData = _lodash2.default.map(val, function (el) {
                            var leaf = _lodash2.default.cloneDeep(el);
                            leaf.y = el._coords[1];
                            leaf.color = (0, _traversal.multiTraverse)(colors, [curkey, el._coords[0]], null);
                            leaf.name = curLabels && _lodash2.default.get(curLabels, el._coords[0]) ? _lodash2.default.get(curLabels, el._coords[0]) : el._seriesKey;
                            if (!seriesData[ctr]) {
                                seriesData[ctr] = {
                                    name: labels && _lodash2.default.get(labels, curkey) ? _lodash2.default.get(labels, curkey) : curkey,
                                    data: [leaf],
                                    size: sizes[ctr].size,
                                    innerSize: sizes[ctr].innerSize,
                                    point: { events: pointEvents }
                                };
                            } else {
                                seriesData[ctr].data.push(leaf);
                            }
                            return {
                                y: _lodash2.default.get(leaf, 'y'),
                                count: 1,
                                els: [leaf],
                                _seriesKey: _lodash2.default.get(leaf, '_seriesKey')
                            };
                        });
                        return leafData;
                    }
                    // Branch part (inner slices)
                    var els = _lodash2.default.chain(val).map(function (el, name) {
                        var children = distribute(el, _lodash2.default.clone(keys));

                        var _$reduce = _lodash2.default.reduce(children, function (acc, child) {
                            if (!acc._seriesKey.length) acc._seriesKey = _lodash2.default.take(child._seriesKey, child._seriesKey.length - 1);
                            acc.sum += child.y;
                            acc.count += child.count;
                            acc.leaves = [].concat(_toConsumableArray(acc.leaves), _toConsumableArray(child.els));
                            return acc;
                        }, { sum: 0, count: 0, leaves: [], _seriesKey: [] }),
                            sum = _$reduce.sum,
                            count = _$reduce.count,
                            leaves = _$reduce.leaves,
                            _seriesKey = _$reduce._seriesKey;

                        return {
                            y: sum,
                            color: (0, _traversal.multiTraverse)(colors, [curkey, name], null),
                            count: count,
                            els: leaves,
                            _origData: leaves,
                            name: curLabels && _lodash2.default.get(curLabels, name) ? _lodash2.default.get(curLabels, name) : name,
                            _seriesKey: _seriesKey
                        };
                    }).value();
                    if (!seriesData[ctr]) {
                        seriesData[ctr] = {
                            name: labels && _lodash2.default.get(labels, curkey) ? _lodash2.default.get(labels, curkey) : curkey,
                            data: els,
                            size: sizes[ctr].size,
                            innerSize: sizes[ctr].innerSize,
                            point: { events: pointEvents }
                        };
                    } else {
                        var _seriesData$ctr$data;

                        (_seriesData$ctr$data = seriesData[ctr].data).push.apply(_seriesData$ctr$data, _toConsumableArray(els));
                    }
                    // Combine all the origData
                    var aggEls = _lodash2.default.reduce(els, function (acc, o) {
                        acc = [].concat(_toConsumableArray(acc), _toConsumableArray(_lodash2.default.get(o, '_origData')));
                        return acc;
                    }, []);
                    return {
                        y: _lodash2.default.sumBy(els, 'y'),
                        count: _lodash2.default.sumBy(els, 'count'),
                        els: aggEls,
                        _seriesKey: _lodash2.default.get(_lodash2.default.head(els), '_seriesKey')
                    };
                };
                distribute(data, _lodash2.default.clone(cfg.splitSlice));
                return seriesData;
            };
            var seriesData = getSeriesData(chartData);
            chartParams.series = seriesData;
            _this.chart = _highcharts2.default.chart(_this.chartNode, chartParams);
        }, _this.reflowChart = function () {
            _this.chart.reflow();
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(BasePieChart, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.drawChart();
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
            this.reflowChart();
            return JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.drawChart();
        }

        // Parses this.props.data into hierarchical structure


        // Call this after DOM is ready.
        // This function can be changed based on the Chart API.

    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement('div', { className: 'c-chart-pie', ref: function ref(node) {
                    _this2.chartNode = node;
                } });
        }
    }]);

    return BasePieChart;
}(_react2.default.Component);

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


BasePieChart.propTypes = {
    data: _propTypes2.default.arrayOf(_propTypes3.DATA_ITEM_PROP).isRequired,
    dataCfg: _propTypes2.default.shape({
        splitChart: _propTypes3.KEY_MAPPING_PROP,
        splitSlice: _propTypes2.default.arrayOf(_propTypes3.KEY_MAPPING_PROP).isRequired,
        sliceSize: _propTypes3.KEY_MAPPING_PROP.isRequired
    }),
    keyLabels: _propTypes3.DATA_ITEM_PROP,
    valueLabels: _propTypes2.default.objectOf(_propTypes3.DATA_ITEM_PROP),
    centerText: _propTypes2.default.node,
    colors: _propTypes2.default.object,
    legend: _propTypes2.default.object,
    chart: _propTypes2.default.object,
    holeSize: _propTypes2.default.number,
    onTooltip: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.bool]),
    onMouseOver: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func
};
BasePieChart.defaultProps = {
    legend: {},
    onTooltip: true,
    data: [],
    holeSize: 0
};
var PieChart = (0, _widgetProvider2.default)(BasePieChart);

exports.default = PieChart;