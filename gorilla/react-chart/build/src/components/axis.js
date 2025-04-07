'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _highcharts = require('highcharts');

var _highcharts2 = _interopRequireDefault(_highcharts);

var _highchartsCustomEvents = require('highcharts-custom-events');

var _highchartsCustomEvents2 = _interopRequireDefault(_highchartsCustomEvents);

var _widgetProvider = require('../hoc/widget-provider');

var _widgetProvider2 = _interopRequireDefault(_widgetProvider);

var _propTypes3 = require('../consts/prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

if (!_highcharts2.default.Chart.prototype.customEvent) {
    (0, _highchartsCustomEvents2.default)(_highcharts2.default);
}

var BaseAxisChart = function (_React$Component) {
    _inherits(BaseAxisChart, _React$Component);

    function BaseAxisChart() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, BaseAxisChart);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = BaseAxisChart.__proto__ || Object.getPrototypeOf(BaseAxisChart)).call.apply(_ref, [this].concat(args))), _this), _this.getChartData = function () {
            var series = [];
            var _this$props = _this.props,
                cfg = _this$props.dataCfg,
                propData = _this$props.data;

            // SplitBars take y values from dynamic fields

            var splitSeriesFunc = function splitSeriesFunc(data, barKeys, xKey) {
                var bars = {};
                _lodash2.default.forEach(barKeys, function (el) {
                    // Aggregate y axis data using x axis
                    bars[el] = _lodash2.default.chain(data).groupBy(function (o) {
                        return _lodash2.default.get(o, xKey) + (_lodash2.default.get(o, cfg.splitSeries) ? ' ' + _lodash2.default.get(o, cfg.splitSeries) : '');
                    }).map(function (dat) {
                        var clone = _lodash2.default.cloneDeep(_lodash2.default.head(dat));
                        _lodash2.default.set(clone, el, _lodash2.default.sumBy(dat, el) ? _lodash2.default.sumBy(dat, el) : 0);
                        // Add more attributes: _coords, _origData, _seriesKey, and _chartKey.
                        // _coords: Array of [x, y] coordinates
                        // _origData: Original data object
                        // _seriesKey: key of series. Example, if actor is the split key, this array will be 'tom' or 'nicole'
                        // _chartKey: key of the chart. Example, if director is the chart key, this array will be 'martin' or 'francis'.
                        clone._coords = [_lodash2.default.get(clone, xKey), _lodash2.default.get(clone, el)];
                        clone._origData = dat;
                        clone._seriesKey = el;
                        return clone;
                    }).value();
                });
                return bars;
            };
            var splitSeriesKeyFunc = function splitSeriesKeyFunc(data, key) {
                return _lodash2.default.groupBy(data, function (el) {
                    return _lodash2.default.get(el, key);
                });
            };
            // Take x and y coordinates if y key is set.
            if (cfg.y) {
                // Aggregate y axis data using x axis
                series = _lodash2.default.chain(propData).groupBy(function (el) {
                    return _lodash2.default.get(el, cfg.x) + (_lodash2.default.get(el, cfg.splitSeries) ? ' ' + _lodash2.default.get(el, cfg.splitSeries) : '');
                }).map(function (el) {
                    var clone = _lodash2.default.cloneDeep(_lodash2.default.head(el));
                    _lodash2.default.set(clone, cfg.y, _lodash2.default.sumBy(el, cfg.y) ? _lodash2.default.sumBy(el, cfg.y) : 0);
                    clone._coords = [_lodash2.default.get(clone, cfg.x), _lodash2.default.get(clone, cfg.y)];
                    clone._origData = el;
                    clone._seriesKey = _lodash2.default.get(clone, cfg.splitSeries);
                    return clone;
                }).value();
            }
            // Start grouping by splitChartKey and splitSeriesKey
            if (cfg.y) {
                series = splitSeriesKeyFunc(series, cfg.splitSeries);
            } else if (cfg.splitSeries) {
                series = splitSeriesFunc(propData, cfg.splitSeries, cfg.x);
            }
            return series;
        }, _this.drawChart = function () {
            var chartData = _this.getChartData();
            var _this$props2 = _this.props,
                cfg = _this$props2.dataCfg,
                valueLabels = _this$props2.valueLabels,
                keyLabels = _this$props2.keyLabels,
                chartType = _this$props2.chartType,
                colors = _this$props2.colors,
                xAxis = _this$props2.xAxis,
                yAxis = _this$props2.yAxis,
                legend = _this$props2.legend,
                stacked = _this$props2.stacked,
                tooltip = _this$props2.tooltip,
                onClick = _this$props2.onClick,
                onDoubleClick = _this$props2.onDoubleClick,
                onContextMenu = _this$props2.onContextMenu,
                onMouseOver = _this$props2.onMouseOver,
                plotOptions = _this$props2.plotOptions,
                exporting = _this$props2.exporting,
                chart = _this$props2.chart,
                _this$props2$otherCha = _this$props2.otherChartParams,
                otherChartParams = _this$props2$otherCha === undefined ? {} : _this$props2$otherCha;

            var xLabels = _lodash2.default.get(valueLabels, cfg.x);
            var yLabels = _lodash2.default.get(valueLabels, cfg.y);
            // All charts produced by this component

            // Highchart params
            var chartParams = _lodash2.default.merge({
                chart: _lodash2.default.merge({
                    type: chartType
                }, chart),
                title: {
                    text: ''
                },
                credits: {
                    enabled: false
                },
                legend: _lodash2.default.merge({
                    align: 'right',
                    layout: 'vertical',
                    verticalAlign: 'top'
                }, legend),
                xAxis: _lodash2.default.merge({
                    type: 'linear'
                }, xAxis),
                yAxis: _lodash2.default.merge({
                    title: { text: '' }
                }, yAxis),
                exporting: exporting,
                plotOptions: plotOptions
            }, otherChartParams);

            var xType = chartParams.xAxis.type;
            if (xType === 'category') {
                var xCats = (0, _lodash2.default)(chartData).values().flatten().map(function (i) {
                    return _lodash2.default.get(i, cfg.x);
                }).uniq().map(function (i) {
                    return _lodash2.default.get(xLabels, i, i);
                }).value();

                chartParams.xAxis.categories = xCats;
            }

            // Callback functions' parameters
            var getEventParams = function getEventParams(scope) {
                if (!scope) {
                    scope = 'point';
                }
                var point = this.point ? this.point : this;

                // Parameters for point-scoped events
                switch (scope) {
                    case 'point':
                        return [{
                            x: xType === 'category' ? _lodash2.default.get(point, cfg.x) : point.x,
                            y: point.y,
                            matched: point._origData.length,
                            splitSeries: point._seriesKey
                        }, point._origData, {
                            dataCfg: _lodash2.default.clone(cfg),
                            keyLabels: keyLabels,
                            valueLabels: valueLabels,
                            xAxis: xAxis
                        }];
                    case 'series':
                        return [];
                    case 'chart':
                        return [];
                    default:
                        return [];
                }
            };

            // Callback function: Tooltip
            chartParams.tooltip = _extends({ enabled: true }, tooltip);

            var _chartParams$tooltip = chartParams.tooltip,
                formatter = _chartParams$tooltip.formatter,
                otherTooltipOptions = _objectWithoutProperties(_chartParams$tooltip, ['formatter']);

            if (formatter) {
                chartParams.tooltip.useHTML = true;
                chartParams.tooltip.formatter = function f() {
                    var params = getEventParams.call(this, 'point');
                    return _server2.default.renderToStaticMarkup(formatter.apply(this, [].concat(_toConsumableArray(params), [otherTooltipOptions])));
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
                // For point, e.point refers to the point (originally "this")
                // For column/bar chart, we can only get the point object by using "this"
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
                var labels = keyLabels;
                if (cfg.splitSeries) {
                    if (cfg.y) {
                        labels = _lodash2.default.get(valueLabels, cfg.splitSeries);
                    }
                    seriesData = _lodash2.default.map(data, function (seriesEl, seriesKey) {
                        return {
                            // Series level properties
                            name: labels && _lodash2.default.get(labels, seriesKey) ? _lodash2.default.get(labels, seriesKey) : seriesKey,
                            stacking: stacked ? 'normal' : null,
                            connectNulls: true, // Area chart only, connect graph line across null points.
                            data: _lodash2.default.chain(seriesEl).map(function (el) {
                                // Point level properties
                                var clone = _lodash2.default.cloneDeep(el);
                                // Add x, y, and name properties
                                if (xType !== 'category') {
                                    if (xType === 'datetime') {
                                        clone.x = Date.UTC.apply(Date, _toConsumableArray((0, _moment2.default)(el._coords[0]).toArray()));
                                    } else {
                                        clone.x = el._coords[0];
                                    }
                                }
                                clone.y = el._coords[1];
                                clone.name = xLabels ? _lodash2.default.get(xLabels, el._coords[0], el._coords[0]) : el._coords[0];
                                return clone;
                            }).sortBy('x').value(),
                            color: _lodash2.default.get(colors, seriesKey),
                            point: {
                                events: pointEvents
                            }
                        };
                    });
                } else {
                    var _labels = keyLabels;
                    // Single series only
                    seriesData = [{
                        name: _lodash2.default.get(_labels, cfg.y),
                        connectNulls: true,
                        data: _lodash2.default.chain(_lodash2.default.values(data)[0]).map(function (el) {
                            var clone = _lodash2.default.cloneDeep(el);
                            if (xType !== 'category') {
                                if (xType === 'datetime') {
                                    clone.x = Date.UTC.apply(Date, _toConsumableArray((0, _moment2.default)(el._coords[0]).toArray()));
                                } else {
                                    clone.x = el._coords[0];
                                }
                            }
                            clone.y = el._coords[1];
                            clone.name = xLabels ? _lodash2.default.get(xLabels, el._coords[0], el._coords[0]) : el._coords[0];
                            return clone;
                        }).sortBy('x').value(),
                        point: {
                            events: pointEvents
                        }
                    }];
                }
                return seriesData;
            };

            var seriesData = getSeriesData(chartData);
            chartParams.series = seriesData;
            _this.chart = _highcharts2.default.chart(_this.chartNode, chartParams);
        }, _this.reflowChart = function () {
            _this.chart.reflow();
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    // Parses this.props.data into hierarchical structure


    _createClass(BaseAxisChart, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.drawChart();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.drawChart();
        }

        // Call this after DOM is ready.
        // This function can be changed based on the Chart API.

    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
            this.reflowChart();
            return JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var chartType = this.props.chartType;

            return _react2.default.createElement('div', { className: 'c-chart-' + chartType, ref: function ref(node) {
                    _this2.chartNode = node;
                } });
        }
    }]);

    return BaseAxisChart;
}(_react2.default.Component);

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


BaseAxisChart.defaultProps = {
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
BaseAxisChart.propTypes = {
    stacked: _propTypes2.default.bool,
    chartType: _propTypes2.default.oneOf(['line', 'bar', 'column', 'area']),
    data: _propTypes2.default.arrayOf(_propTypes3.DATA_ITEM_PROP).isRequired,
    dataCfg: _propTypes2.default.shape({
        splitChart: _propTypes3.KEY_MAPPING_PROP,
        x: _propTypes3.KEY_MAPPING_PROP.isRequired,
        splitSeries: _propTypes2.default.oneOfType([_propTypes3.KEY_MAPPING_PROP, _propTypes2.default.arrayOf(_propTypes3.KEY_MAPPING_PROP)]),
        y: _propTypes3.KEY_MAPPING_PROP
    }).isRequired,
    keyLabels: _propTypes3.DATA_ITEM_PROP,
    valueLabels: _propTypes2.default.objectOf(_propTypes3.DATA_ITEM_PROP),
    colors: _propTypes2.default.object,
    exporting: _propTypes2.default.object,
    xAxis: _propTypes2.default.shape({
        title: _propTypes2.default.shape({
            text: _propTypes2.default.string
        }),
        type: _propTypes2.default.oneOf(['linear', 'logarithmic', 'datetime', 'category'])
    }),
    yAxis: _propTypes2.default.shape({
        title: _propTypes2.default.shape({
            text: _propTypes2.default.string
        })
    }),
    legend: _propTypes2.default.object,
    chart: _propTypes2.default.object,
    plotOptions: _propTypes2.default.object,
    tooltip: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        formatter: _propTypes2.default.func
    }),
    onMouseOver: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func
};
var AxisChart = (0, _widgetProvider2.default)(BaseAxisChart);

exports.default = AxisChart;