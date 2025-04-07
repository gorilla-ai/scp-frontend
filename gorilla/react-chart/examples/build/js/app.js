/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"app": 0
/******/ 	};
/******/
/******/ 	// script path function
/******/ 	function jsonpScriptSrc(chunkId) {
/******/ 		return __webpack_require__.p + "" + ({}[chunkId]||chunkId) + ".js"
/******/ 	}
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./src/app.js","vendor"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "../src/components/area.js":
/*!*********************************!*\
  !*** ../src/components/area.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _axis = __webpack_require__(/*! ./axis */ "../src/components/axis.js");

var _axis2 = _interopRequireDefault(_axis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('chart/components/area');

/**
 * A React Area Chart<br>
 * Essentially an AxisChart with chartType='area'.
 * See [AxisChart]{@link module:AxisChart} for API
 * @constructor
 * @example

import _ from 'lodash'
import AreaChart from 'chart/components/area'

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
        return <AreaChart
            className='c-test'
            title='Area Chart by Director'
            stacked
            data={DATA}
            keyLabels={KEY_LABELS}
            valueLabels={VALUE_LABELS}
            plotOptions={{series:{fillOpacity:0.4,marker:{enabled:false}}}}
            dataCfg={{
                splitChart: 'director',
                splitSeries: 'actor',
                x: 'year',
                y: 'movies'
            }} />
    }
})
 */
var AreaChart = function AreaChart(props) {
    return _react2.default.createElement(_axis2.default, _extends({}, props, { chartType: 'area' }));
};

exports.default = AreaChart;

/***/ }),

/***/ "../src/components/axis.js":
/*!*********************************!*\
  !*** ../src/components/axis.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _server = __webpack_require__(/*! react-dom/server */ "../node_modules/react-dom/server.browser.js");

var _server2 = _interopRequireDefault(_server);

var _highcharts = __webpack_require__(/*! highcharts */ "../node_modules/highcharts/highcharts.js");

var _highcharts2 = _interopRequireDefault(_highcharts);

var _highchartsCustomEvents = __webpack_require__(/*! highcharts-custom-events */ "../node_modules/highcharts-custom-events/js/customEvents.js");

var _highchartsCustomEvents2 = _interopRequireDefault(_highchartsCustomEvents);

var _widgetProvider = __webpack_require__(/*! ../hoc/widget-provider */ "../src/hoc/widget-provider.js");

var _widgetProvider2 = _interopRequireDefault(_widgetProvider);

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('chart/components/bar');

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
                onTooltip = _this$props2.onTooltip,
                onClick = _this$props2.onClick,
                onDoubleClick = _this$props2.onDoubleClick,
                onContextMenu = _this$props2.onContextMenu,
                onMouseOver = _this$props2.onMouseOver,
                plotOptions = _this$props2.plotOptions;

            var xLabels = _lodash2.default.get(valueLabels, cfg.x);

            // All charts produced by this component

            // Highchart params
            var chartParams = {
                chart: {
                    type: chartType
                },
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
                plotOptions: plotOptions
            };

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
                            valueLabels: valueLabels
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
            if (!onTooltip) {
                chartParams.tooltip = { enabled: false };
            } else if (typeof onTooltip === 'function') {
                chartParams.tooltip = {
                    formatter: function formatter() {
                        var params = getEventParams.call(this, 'point');
                        return _server2.default.renderToStaticMarkup(onTooltip.apply(this, params));
                    }
                };
            } else {
                chartParams.tooltip = { enabled: true };
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
                                    if (xType === 'datetime' && _lodash2.default.isString(el._coords[0])) {
                                        clone.x = parseInt(el._coords[0], 10);
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
                    // Single series only
                    seriesData = [{
                        connectNulls: true,
                        data: _lodash2.default.chain(_lodash2.default.values(data)[0]).map(function (el) {
                            var clone = _lodash2.default.cloneDeep(el);
                            if (xType !== 'category') {
                                if (xType === 'datetime' && _lodash2.default.isString(el._coords[0])) {
                                    clone.x = parseInt(el._coords[0], 10);
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

    _createClass(BaseAxisChart, [{
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
 * @param {object} [keyLabels] - Key/label pairs for all the keys, see below for example
 * @param {object} [valueLabels] - Value/label pairs for all the values, see below for example
 * @param {object} [colors] - Colors for different series
 * @param {object} [xAxis] - config for the X axis, see Highcharts API {@link http://api.highcharts.com/highcharts/xAxis}
 * @param {object} [yAxis] - config for the Y axis, see Highcharts API {@link http://api.highcharts.com/highcharts/yAxis}
 * @param {object} [legend] - config for the legends, see Highcharts API {@link http://api.highcharts.com/highcharts/legend}
 * @param {object} [plotOptions] - config for the plotOptions, see Highcharts API {@link http://api.highcharts.com/highcharts/plotOptions}
 * @param {boolean|function} [onTooltip=true] - Tooltip for the hovered item, can be boolean or self defined rendering function as below
 * @param {object} onTooltip.eventInfo - info on the hovered bar
 * @param {number} onTooltip.eventInfo.matched - number of data items associated with this bar
 * @param {string} onTooltip.eventInfo.splitChart - associated chart value
 * @param {string} onTooltip.eventInfo.x - associated x value
 * @param {string} onTooltip.eventInfo.splitSeries - associated series
 * @param {number} onTooltip.eventInfo.y - associated y value
 * @param {array.<object>} onTooltip.data - dataset of the current hovered bar
 * @param {object} onTooltip.cfg - data related cfg for this chart
 * @param {object} onTooltip.cfg.dataCfg
 * @param {object} [onTooltip.cfg.keyLabels]
 * @param {object} [onTooltip.cfg.valueLabels]
 * @param {function} [onMouseOver] - Function to call when mouse over, see onTooltip for callback function spec
 * @param {function} [onClick] - Function to call when clicked, see onTooltip for callback function spec
 * @param {function} [onContextMenu] - Function to call when right clicked, see onTooltip for callback function spec
 * @param {function} [onDoubleClick] - Function to call when double clicked, see onTooltip for callback function spec
 *
 */


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
    plotOptions: _propTypes2.default.object,
    onTooltip: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.bool]),
    onMouseOver: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func
};
BaseAxisChart.defaultProps = {
    stacked: false,
    chartType: 'line',
    onTooltip: true,
    data: [],
    colors: {},
    xAxis: {},
    yAxis: {},
    legend: {},
    plotOptions: {}
};
var AxisChart = (0, _widgetProvider2.default)(BaseAxisChart);

exports.default = AxisChart;

/***/ }),

/***/ "../src/components/bar.js":
/*!********************************!*\
  !*** ../src/components/bar.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _axis = __webpack_require__(/*! ./axis */ "../src/components/axis.js");

var _axis2 = _interopRequireDefault(_axis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('chart/components/bar');

/**
 * A React Bar Chart<br>
 * Essentially an AxisChart with chartType='bar'.
 * See [AxisChart]{@link module:AxisChart} for API
 * @constructor
 * @example

import _ from 'lodash'
import BarChart from 'chart/components/bar'

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
            <BarChart
                title='Actors by Year (column, stacked)'
                stacked
                vertical
                data={DATA}
                xAxis={{type:'category'}}
                keyLabels={KEY_LABELS}
                valueLabels={VALUE_LABELS}
                onTooltip={true}
                dataCfg={{
                    splitSeries: 'actor',
                    x: 'year',
                    y: 'movies'
                }} />
            <BarChart
                title='Actors by Year (bar, side by side)'
                data={DATA}
                keyLabels={KEY_LABELS}
                valueLabels={VALUE_LABELS}
                colors={{
                    tom:'#c1b748',
                    nicole:'#2b908f'
                }}
                dataCfg={{
                    splitSeries: 'actor',
                    x: 'year',
                    y: 'movies'
                }} />
        </div>
    }
})
 */
var BarChart = function BarChart(props) {
    var vertical = props.vertical;

    return _react2.default.createElement(_axis2.default, _extends({}, props, { chartType: vertical ? 'column' : 'bar' }));
};

exports.default = BarChart;

/***/ }),

/***/ "../src/components/dashboard.js":
/*!**************************************!*\
  !*** ../src/components/dashboard.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _reactGridLayout = __webpack_require__(/*! react-grid-layout */ "../node_modules/react-grid-layout/index.js");

var _reactGridLayout2 = _interopRequireDefault(_reactGridLayout);

__webpack_require__(/*! react-grid-layout/css/styles.css */ "../node_modules/react-grid-layout/css/styles.css");

__webpack_require__(/*! react-resizable/css/styles.css */ "../node_modules/react-resizable/css/styles.css");

var _propTypes3 = __webpack_require__(/*! react-ui/build/src/consts/prop-types */ "../node_modules/react-ui/build/src/consts/prop-types.js");

var _propTypes4 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GridLayout = (0, _reactGridLayout.WidthProvider)(_reactGridLayout2.default);

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('chart/components/dashboard');

/**
 * A React Dashboard
 * @constructor
 * @param {string} [id] - Dashboard dom element #id
 * @param {string} [className] - Classname for the dashboard
 * @param {renderable} children - Widgets definition
 * @param {array.<object>} [data] - Global data for the dashboard, note this may be overwritten by data in child widget
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
 * @param {number} [layoutCfg.cols=12] - Number of columns in dashboard
 * @param {number} [layoutCfg.rowHeight=200] - Unit row height of a grid, in pixel
 * @param {boolean} [layoutCfg.isDraggable=true] - Is the grids draggable
 * @param {boolean} [layoutCfg.isResizable=true] - Is the grids resizable
 * @param {function} [onFilter] - Global function to call when filter is updated
 * @param {object} onFilter.filter - filter parameters
 * @param {boolean|function} [onTooltip=true] - Global tooltip for the hovered item, can be boolean or self defined rendering function as below
 * @param {string} onTooltip.widgetId - hovered widget id
 * @param {object} onTooltip.eventInfo - info on the hovered item, see onTooltip API for individual charts
 * @param {array.<object>} onTooltip.data - dataset of the current hovered item
 * @param {object} onTooltip.cfg - data related cfg for this chart
 * @param {object} onTooltip.cfg.dataCfg
 * @param {object} [onTooltip.cfg.keyLabels]
 * @param {object} [onTooltip.cfg.valueLabels]
 * @param {function} [onMouseOver] - Global function to call when mouse over, see onTooltip for callback function spec
 * @param {function} [onClick] - Global function to call when clicked, see onTooltip for callback function spec
 * @param {function} [onContextMenu] - Global function to call when right clicked, see onTooltip for callback function spec
 * @param {function} [onDoubleClick] - Global function to call when double clicked, see onTooltip for callback function spec
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
            filter={filter}
            layoutCfg={{layout, cols:18}}>
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

        _initialiseProps.call(_this);

        var layout = [];

        if (props.layoutCfg) {
            layout = props.layoutCfg.layout.map(function (el, idx) {
                var child = props.children[idx];
                return _extends({ i: child.key ? '.$' + child.key : child.props.id + '/.' + idx }, el);
            });
        }

        _this.state = {
            filterables: {},
            layout: layout
        };
        return _this;
    }

    _createClass(Dashboard, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                filter = _props.filter,
                onFilter = _props.onFilter,
                keyLabels = _props.keyLabels,
                valueLabels = _props.valueLabels;

            var _ref = this.props.layoutCfg || {},
                _ref$cols = _ref.cols,
                cols = _ref$cols === undefined ? 12 : _ref$cols,
                _ref$rowHeight = _ref.rowHeight,
                rowHeight = _ref$rowHeight === undefined ? 200 : _ref$rowHeight,
                _ref$isDraggable = _ref.isDraggable,
                isDraggable = _ref$isDraggable === undefined ? true : _ref$isDraggable,
                _ref$isResizable = _ref.isResizable,
                isResizable = _ref$isResizable === undefined ? true : _ref$isResizable;

            var _state = this.state,
                filterables = _state.filterables,
                layout = _state.layout;


            var chartBoard = void 0;
            var chartGenerator = _react2.default.Children.map(this.props.children, function (child, idx) {
                // temporary workaround to fix chart data default to [] by defaultProps
                var childNoData = !child.props.data || child.props.data.length === 0;

                var propsToOverwrite = _lodash2.default.reduce(['data', 'keyLabels', 'valueLabels', 'onTooltip', 'onMouseOver', 'onClick', 'onDoubleClick', 'onContextMenu'], function (acc, p) {
                    if (_lodash2.default.has(_this2.props, p) && (!_lodash2.default.has(child.props, p) || p === 'data' && childNoData)) {
                        if (typeof _this2.props[p] === 'function') {
                            acc[p] = _this2.props[p].bind(null, child.props.id);
                        } else {
                            acc[p] = _this2.props[p];
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
                        layout: layout, cols: cols, rowHeight: rowHeight,
                        isDraggable: isDraggable, isResizable: isResizable,
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
        isResizable: _propTypes2.default.bool
    }),
    onFilter: _propTypes2.default.func,
    onTooltip: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.bool]),
    onMouseOver: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func
};

var _initialiseProps = function _initialiseProps() {
    var _this3 = this;

    this.handleUpdateFilter = function (eventInfo, matched, _ref2) {
        var dataCfg = _ref2.dataCfg;

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
        _this3.setState({ filterables: filter });
    };

    this.handleLayoutChange = function (layout) {
        _this3.setState({ layout: layout });
    };

    this.toggleFilter = function (key) {
        var _props2 = _this3.props,
            filter = _props2.filter,
            onFilter = _props2.onFilter;
        var filterables = _this3.state.filterables;


        if (_lodash2.default.has(filter, key)) {
            onFilter(_lodash2.default.omit(filter, key));
        } else {
            onFilter(_extends({}, filter, _defineProperty({}, key, filterables[key])));
        }
    };
};

exports.default = Dashboard;

/***/ }),

/***/ "../src/components/line.js":
/*!*********************************!*\
  !*** ../src/components/line.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _axis = __webpack_require__(/*! ./axis */ "../src/components/axis.js");

var _axis2 = _interopRequireDefault(_axis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('chart/components/line');

/**
 * A React Line Chart<br>
 * Essentially an AxisChart with chartType='line'.
 * See [AxisChart]{@link module:AxisChart} for API
 * @constructor
 * @example

import _ from 'lodash'
import LineChart from 'chart/components/line'

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
        return <LineChart
            title='Line Charts by Actor'
            stacked
            vertical
            data={DATA}
            keyLabels={KEY_LABELS}
            valueLabels={VALUE_LABELS}
            dataCfg={{
                splitChart: 'actor',
                splitSeries: 'director',
                x: 'year',
                y: 'movies'
            }} />
    }
})
 */
var LineChart = function LineChart(props) {
    return _react2.default.createElement(_axis2.default, _extends({}, props, { chartType: 'line' }));
};

exports.default = LineChart;

/***/ }),

/***/ "../src/components/pie.js":
/*!********************************!*\
  !*** ../src/components/pie.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _reactDom = __webpack_require__(/*! react-dom */ "../node_modules/react-dom/index.js");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _server = __webpack_require__(/*! react-dom/server */ "../node_modules/react-dom/server.browser.js");

var _server2 = _interopRequireDefault(_server);

var _highcharts = __webpack_require__(/*! highcharts */ "../node_modules/highcharts/highcharts.js");

var _highcharts2 = _interopRequireDefault(_highcharts);

var _highchartsCustomEvents = __webpack_require__(/*! highcharts-custom-events */ "../node_modules/highcharts-custom-events/js/customEvents.js");

var _highchartsCustomEvents2 = _interopRequireDefault(_highchartsCustomEvents);

var _widgetProvider = __webpack_require__(/*! ../hoc/widget-provider */ "../src/hoc/widget-provider.js");

var _widgetProvider2 = _interopRequireDefault(_widgetProvider);

var _traversal = __webpack_require__(/*! ../utils/traversal */ "../src/utils/traversal.js");

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('chart/components/pie');

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
                onMouseOver = _this$props2.onMouseOver;

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
            var chartParams = {
                chart: {
                    type: 'pie',
                    events: centerText ? {
                        load: _this.setCenterText,
                        redraw: _this.setCenterText
                    } : {}
                },
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
                                // We cannot allow any child-slice to be hidden since we will need to hide the entire slice.
                                legendItemClick: function legendItemClick(e) {
                                    e.preventDefault();return false;
                                }
                            }
                        },
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                }

                // Callback functions' parameters
            };var getEventParams = function getEventParams(scope) {
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

/***/ }),

/***/ "../src/components/table.js":
/*!**********************************!*\
  !*** ../src/components/table.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _table = __webpack_require__(/*! react-ui/build/src/components/table */ "../node_modules/react-ui/build/src/components/table.js");

var _table2 = _interopRequireDefault(_table);

var _widgetProvider = __webpack_require__(/*! ../hoc/widget-provider */ "../src/hoc/widget-provider.js");

var _widgetProvider2 = _interopRequireDefault(_widgetProvider);

var _traversal = __webpack_require__(/*! ../utils/traversal */ "../src/utils/traversal.js");

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//import PageNav from '../page-nav'

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('chart/components/table');

var BaseTableChart = function (_React$Component) {
    _inherits(BaseTableChart, _React$Component);

    function BaseTableChart() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, BaseTableChart);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = BaseTableChart.__proto__ || Object.getPrototypeOf(BaseTableChart)).call.apply(_ref, [this].concat(args))), _this), _this.handleEvent = function (eventType, table, rid, row) {
            var _this$props = _this.props,
                dataCfg = _this$props.dataCfg,
                keyLabels = _this$props.keyLabels,
                valueLabels = _this$props.valueLabels;
            var splitRow = dataCfg.splitRow,
                agg = dataCfg.agg;

            _this.props[eventType]({
                matched: row.__raw.length,
                splitRow: splitRow.map(function (k) {
                    return row[k];
                }),
                agg: agg.map(function (k) {
                    return row[k];
                })
            }, row.__raw, { dataCfg: dataCfg, keyLabels: keyLabels, valueLabels: valueLabels });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(BaseTableChart, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                title = _props.title,
                data = _props.data,
                _props$dataCfg = _props.dataCfg,
                splitRow = _props$dataCfg.splitRow,
                agg = _props$dataCfg.agg,
                keyLabels = _props.keyLabels,
                valueLabels = _props.valueLabels,
                onClick = _props.onClick,
                onDoubleClick = _props.onDoubleClick,
                onContextMenu = _props.onContextMenu;


            var aggregated = _lodash2.default.values(_lodash2.default.reduce(data, function (acc, item) {
                var keyObj = _lodash2.default.pick(item, splitRow);
                var key = JSON.stringify(keyObj);
                if (!acc[key]) {
                    acc[key] = _extends({}, keyObj, { __raw: [] });
                }
                _lodash2.default.forEach(agg, function (a) {
                    _lodash2.default.set(acc[key], a, _lodash2.default.get(acc[key], a, 0) + _lodash2.default.get(item, a, 0));
                });

                acc[key].__raw.push(item);

                return acc;
            }, []));

            return _react2.default.createElement(_table2.default, {
                key: id,
                id: id,
                className: 'c-chart-table fixed-header',
                caption: title,
                data: aggregated,
                fields: _lodash2.default.reduce([].concat(_toConsumableArray(splitRow), _toConsumableArray(agg)), function (acc, k) {
                    return _extends({}, acc, _defineProperty({}, k, {
                        label: _lodash2.default.get(keyLabels, k, k),
                        keyPath: k,
                        sortable: true,
                        formatter: function formatter(v) {
                            return (0, _traversal.multiTraverse)(valueLabels, [k, v], v);
                        }
                    }));
                }, {}),
                defaultSort: {
                    field: _lodash2.default.first(splitRow),
                    desc: false
                },
                onRowClick: onClick && this.handleEvent.bind(this, 'onClick', id),
                onRowDoubleClick: onDoubleClick && this.handleEvent.bind(this, 'onDoubleClick', id),
                onRowContextMenu: onContextMenu && this.handleEvent.bind(this, 'onContextMenu', id) });
        }
    }]);

    return BaseTableChart;
}(_react2.default.Component);

/**
 * A React Table Chart
 * @constructor
 * @param {string} [id] - Chart dom element #id
 * @param {string} [className] - Classname for the chart
 * @param {string} [title] - Title for the chart
 * @param {array} data - Data, see below example
 * @param {object} dataCfg - Mapping between data shape and chart
 * @param {string | array.<string>} [dataCfg.splitChart] - if specified, will split into multiple charts based on the given key/path
 * @param {array.<string | array.<string>>} dataCfg.splitRow - split into rows based on the given keys/paths
 * @param {array.<string | array.<string>>} [dataCfg.agg] - if specified, columns to aggregate
 * @param {object} [keyLabels] - Key/label pairs for all the keys, see below for example
 * @param {object} [valueLabels] - Value/label pairs for all the values, see below for example
 * @param {function} [onClick] - Function to call when clicked
 * @param {object} onClick.eventInfo - info on the clicked row
 * @param {number} onClick.eventInfo.matched - number of data items associated with this row
 * @param {string} onClick.eventInfo.splitChart - associated table value
 * @param {string} onClick.eventInfo.splitRow - associated row
 * @param {string} onClick.eventInfo.agg - associated aggregation
 * @param {object} onClick.data - data of the current hovered item
 * @param {object} onClick.cfg - data related cfg for this chart
 * @param {object} onClick.cfg.dataCfg
 * @param {object} [onClick.cfg.keyLabels]
 * @param {object} [onClick.cfg.valueLabels]
 * @param {function} [onContextMenu] - Function to call when right clicked, see onClick for callback function spec
 * @param {function} [onDoubleClick] - Function to call when double clicked, see onClick for callback function spec
 *
 * @example

import TableChart from 'chart/components/table'

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
    handleClick(eventInfo, data, {dataCfg, keyLabels, valueLabels}) {

    },
    render() {
        return <TableChart
            id='director-split-actor-chart'
            className='c-flex'
            data={DATA}
            dataCfg={{
                splitChart: 'director',
                splitRow: ['actor', 'year'],
                agg: ['movies', 'tvs']
            }}
            keyLabels={KEY_LABELS}
            valueLabels={VALUE_LABELS}
            onClick={this.handleClick} />
    }
})
 */


BaseTableChart.propTypes = {
    id: _propTypes2.default.string,
    title: _propTypes2.default.node,
    data: _propTypes2.default.arrayOf(_propTypes3.DATA_ITEM_PROP).isRequired,
    dataCfg: _propTypes2.default.shape({
        splitRow: _propTypes2.default.arrayOf(_propTypes3.KEY_MAPPING_PROP).isRequired,
        agg: _propTypes2.default.arrayOf(_propTypes3.KEY_MAPPING_PROP)
        //pageSize: React.PropTypes.number
    }),
    keyLabels: _propTypes3.DATA_ITEM_PROP,
    valueLabels: _propTypes2.default.objectOf(_propTypes3.DATA_ITEM_PROP),
    onClick: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func
};
BaseTableChart.defaultProps = {
    data: [] /*,
             pageSize:10*/
};
var TableChart = (0, _widgetProvider2.default)(BaseTableChart);

exports.default = TableChart;

/***/ }),

/***/ "../src/components/timeline.js":
/*!*************************************!*\
  !*** ../src/components/timeline.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _server = __webpack_require__(/*! react-dom/server */ "../node_modules/react-dom/server.browser.js");

var _server2 = _interopRequireDefault(_server);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _jquery = __webpack_require__(/*! jquery */ "../node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _vis = __webpack_require__(/*! vis */ "../node_modules/vis/dist/vis.js");

var _vis2 = _interopRequireDefault(_vis);

__webpack_require__(/*! vis/dist/vis.css */ "../node_modules/vis/dist/vis.css");

var _widgetProvider = __webpack_require__(/*! ../hoc/widget-provider */ "../src/hoc/widget-provider.js");

var _widgetProvider2 = _interopRequireDefault(_widgetProvider);

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('chart/components/timeline');

// const TIME_MARGIN = 3600000
var TIME_MARGIN = 0;

// Determine the group display color, '#001B34' is from the react-ui dark color
var DEFAULT_COLOR = '#001B34';

var OPTIONS = {
    stack: false,
    showCurrentTime: false,
    showMajorLabels: false,
    selectable: false,
    tooltip: {
        followMouse: true,
        overflowMethod: 'flip'
    },
    margin: 0
};

var BaseTimeline = function (_React$Component) {
    _inherits(BaseTimeline, _React$Component);

    function BaseTimeline() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, BaseTimeline);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = BaseTimeline.__proto__ || Object.getPrototypeOf(BaseTimeline)).call.apply(_ref, [this].concat(args))), _this), _this.parseChartData = function () {
            var _this$props = _this.props,
                propData = _this$props.data,
                dataCfg = _this$props.dataCfg,
                colors = _this$props.colors,
                keyLabels = _this$props.keyLabels,
                valueLabels = _this$props.valueLabels,
                onTooltip = _this$props.onTooltip;


            var cfg = { dataCfg: dataCfg, keyLabels: keyLabels, valueLabels: valueLabels };

            var data = (0, _lodash2.default)(propData).map(function (el) {
                var eventInfo = {
                    matched: 1,
                    splitGroup: _lodash2.default.get(el, dataCfg.splitGroup),
                    timeStart: _lodash2.default.get(el, dataCfg.timeStart || 'timeStart'),
                    timeEnd: _lodash2.default.get(el, dataCfg.timeEnd || dataCfg.timeStart || 'timeStart'),
                    agg: (0, _lodash2.default)(el).pick(dataCfg.agg).values().map(_lodash2.default.toString).value()
                };

                var tooltip = onTooltip ? _server2.default.renderToStaticMarkup(onTooltip.apply(_this, [eventInfo, el, cfg])) : null;

                var color = DEFAULT_COLOR;
                if (_lodash2.default.isFunction(colors)) {
                    color = colors(eventInfo, el, cfg);
                } else if (_lodash2.default.isPlainObject(colors)) {
                    color = _lodash2.default.findLast(colors, function (c, k) {
                        return el[k] > 0;
                    }) || _lodash2.default.head(_lodash2.default.values(colors));
                }

                return {
                    // *id* is for get origin data later
                    id: Math.random().toString(36).substr(2, 9),
                    className: el.className || '',
                    start: _lodash2.default.get(el, dataCfg.timeStart || 'timeStart'),
                    end: _lodash2.default.get(el, dataCfg.timeEnd) || _lodash2.default.get(el, dataCfg.timeStart || 'timeStart'),
                    // group-key will map the id value in *groups*
                    group: _lodash2.default.get(el, dataCfg.splitGroup),
                    type: el.type || 'range',
                    style: 'background-color: ' + color + '; opacity: 0.5;',
                    title: '' + tooltip,
                    // *_origData* is a custom key
                    _origData: el
                };
            }).orderBy(['start', 'end']).value();

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

            return data;
        }, _this.drawChart = function () {
            var _this$props2 = _this.props,
                dataCfg = _this$props2.dataCfg,
                colors = _this$props2.colors,
                verticalScroll = _this$props2.verticalScroll,
                showEmptyGroup = _this$props2.showEmptyGroup,
                keyLabels = _this$props2.keyLabels,
                valueLabels = _this$props2.valueLabels,
                onMouseOver = _this$props2.onMouseOver,
                onClick = _this$props2.onClick,
                onContextMenu = _this$props2.onContextMenu,
                onDoubleClick = _this$props2.onDoubleClick,
                onRangeChanged = _this$props2.onRangeChanged;


            var data = _this.parseChartData();
            var groups = (0, _lodash2.default)(data).groupBy('group').map(function (elm, key) {
                var content = _lodash2.default.chain(valueLabels).get(dataCfg.splitGroup).get(key).value() || key;
                var merged = _lodash2.default.reduce(elm, function (acc, el) {
                    var aggObj = _lodash2.default.pick(el._origData, dataCfg.agg);
                    _lodash2.default.forEach(aggObj, function (e, k) {
                        acc[k] = _lodash2.default.isNil(acc[k]) ? e : acc[k] + e;
                    });

                    return acc;
                }, {});
                var count = _lodash2.default.chain(merged).values().sum().value();

                // Determine the group display color, '#001B34' is from the react-ui dark color
                var color = DEFAULT_COLOR;
                if (_lodash2.default.isFunction(colors)) {
                    var eventInfo = {
                        matched: elm.length,
                        splitGroup: key,
                        timeStart: elm[0].start,
                        timeEnd: elm[elm.length - 1].end,
                        agg: (0, _lodash2.default)(merged).values().map(_lodash2.default.toString).value()
                    };

                    color = colors(eventInfo, merged, { dataCfg: dataCfg, keyLabels: keyLabels, valueLabels: valueLabels });
                } else if (_lodash2.default.isPlainObject(colors)) {
                    color = _lodash2.default.findLast(colors, function (c, k) {
                        return merged[k] > 0;
                    });
                }

                var sumSpan = count > 0 ? '<span class=\'tl-group-sum\' style="background:' + color + ';">' + count + '</span>' : '';

                return {
                    // *id* is for mapping group in Vis timeline
                    // *content* is group text on timeline left side
                    id: key,
                    // Developer can adjust group's style via its className.
                    // For the row height, need to adjust height of
                    // (.vis-label .vis-inner) and (.vis-item.vis-range)
                    // Accurate selector is preferable.
                    className: key,
                    content: '<span class="tl-group-label">' + content + '</span> ' + sumSpan,
                    visible: count > 0 || showEmptyGroup,
                    // *count* is a custom key
                    count: count
                };
            }).orderBy('id').values().value();

            // For removing the empty group's data
            var hiddenGroup = (0, _lodash2.default)(groups).filter(function (el) {
                return el.count === 0;
            }).map('id').value();

            var bindEvent = function bindEvent(chart, events) {
                chart.off('click');
                _lodash2.default.forEach(events, function (el, key) {
                    chart.on(key, function (tlProps) {
                        // Only items' events can be triggered
                        if (key !== 'rangechanged' && tlProps.what === 'item') {
                            var origData = _lodash2.default.find(data, { id: tlProps.item })._origData;
                            var eventInfo = {
                                matched: 1,
                                splitGroup: tlProps.group,
                                agg: dataCfg.agg
                            };

                            el(eventInfo, origData, { dataCfg: dataCfg, keyLabels: keyLabels, valueLabels: valueLabels });
                        } else if (key === 'rangechanged') {
                            var _origData = _lodash2.default.map(data, function (d) {
                                return d._origData;
                            });
                            var _eventInfo = {
                                matched: data.length,
                                agg: dataCfg.agg,
                                timeStart: new Date(tlProps.start).getTime(),
                                timeEnd: new Date(tlProps.end).getTime()
                            };

                            el(_eventInfo, _origData, { dataCfg: dataCfg, keyLabels: keyLabels, valueLabels: valueLabels });
                        }

                        if (tlProps.event) {
                            tlProps.event.preventDefault();
                        }
                    });
                });
            };

            var events = _lodash2.default.pickBy({
                mouseOver: onMouseOver,
                click: onClick,
                contextmenu: onContextMenu,
                doubleClick: onDoubleClick,
                rangechanged: onRangeChanged
            }, _lodash2.default.isFunction);

            var options = _extends({}, OPTIONS, {
                verticalScroll: verticalScroll,
                showTooltips: !!_this.props.onTooltip,
                max: _lodash2.default.last(data).end + TIME_MARGIN,
                min: _lodash2.default.head(data).start - TIME_MARGIN

                // Remove the empty group's data
            });if (!_lodash2.default.isEmpty(hiddenGroup) && showEmptyGroup) {
                _lodash2.default.remove(data, function (el) {
                    return _lodash2.default.indexOf(hiddenGroup, el.group) !== -1;
                });
            }
            // let data1 = _.map(data, el => {
            //     return _.filter(el, (el) => {
            //         return _.indexOf(hiddenGroup, el.group) !== -1 && el.type !== 'background'
            //     })
            // })
            if (!_this.chart) {
                _this.chart = new _vis2.default.Timeline(_this.chartNode, data, groups, options);
                _this._groups = groups;
            } else {
                if (_lodash2.default.isEqual(_this._groups, groups)) {
                    _this.chart.setData({
                        // groups: groups,
                        items: data
                    });
                    _this.chart.setOptions(options);
                } else {
                    _this.chart.destroy();
                    _this.chart = new _vis2.default.Timeline(_this.chartNode, data, groups, options);
                    _this._groups = groups;
                }
            }

            // Bind events
            bindEvent(_this.chart, events);
            // Show hover style when hover on a row
            _lodash2.default.forEach(groups, function (el) {
                (0, _jquery2.default)('.' + CSS.escape(el.className)).hover(function () {
                    (0, _jquery2.default)('.' + CSS.escape(el.className)).toggleClass('js-hovered');
                });
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(BaseTimeline, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var onChanged = this.props.onChanged;

            this.drawChart();
            if (onChanged) {
                this.chart.on('changed', onChanged);
            }
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
            return JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.drawChart();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement('div', { className: 'c-chart-timeline', ref: function ref(node) {
                    _this2.chartNode = node;
                } });
        }
    }]);

    return BaseTimeline;
}(_react2.default.Component);

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
 * @param {object} [keyLabels] - Key/label pairs for all the keys
 * @param {object} [valueLabels] - Value/label pairs for all the values
 * @param {object | function} [colors] - Colors for different aggregations. For function type, see onTooltip for callback function spec
 * @param {bool} [verticalScroll=false] - Show vertical scrollbar?
 * @param {bool} [showEmptyGroup=true] - Show groups which data are empty?
 * @param {object} [legend] - config for the legends, see Highcharts API {@link http://api.highcharts.com/highcharts/legend}
 * @param {boolean|function} [onTooltip=true] - Tooltip for the hovered bar, can be boolean or self defined rendering function as below
 * @param {object} onTooltip.eventInfo - statistics for this bar
 * @param {number} onTooltip.eventInfo.matched - number of data items associated with this bar
 * @param {string} onTooltip.eventInfo.splitChart - associated chart value
 * @param {array} onTooltip.eventInfo.splitGroup - associated group value
 * @param {number} onTooltip.eventInfo.timeStart - associated timeStart timestamp value
 * @param {number} onTooltip.eventInfo.timeEnd - associated timeEnd timestamp value
 * @param {array.<string>} onTooltip.eventInfo.agg - array of aggregated counts
 * @param {object} onTooltip.data - data of the current hovered bar
 * @param {object} onTooltip.cfg - data related cfg for this chart
 * @param {object} onTooltip.cfg.dataCfg
 * @param {object} [onTooltip.cfg.keyLabels]
 * @param {object} [onTooltip.cfg.valueLabels]
 * @param {function} [onMouseOver] - Function to call when mouse over, see onTooltip for callback function spec
 * @param {function} [onClick] - Function to call when clicked, see onTooltip for callback function spec
 * @param {function} [onContextMenu] - Function to call when right clicked, see onTooltip for callback function spec
 * @param {function} [onDoubleClick] - Function to call when double clicked, see onTooltip for callback function spec
 * @param {function} [onRangeChanged] - Function to call when window range changed, see onTooltip for callback function spec
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


BaseTimeline.propTypes = {
    data: _propTypes2.default.arrayOf(_propTypes2.default.object).isRequired,
    dataCfg: _propTypes2.default.shape({
        splitChart: _propTypes3.KEY_MAPPING_PROP,
        splitGroup: _propTypes3.KEY_MAPPING_PROP.isRequired,
        timeStart: _propTypes3.KEY_MAPPING_PROP.isRequired,
        timeEnd: _propTypes3.KEY_MAPPING_PROP,
        agg: _propTypes2.default.arrayOf(_propTypes3.KEY_MAPPING_PROP)
    }),
    keyLabels: _propTypes3.DATA_ITEM_PROP,
    valueLabels: _propTypes2.default.objectOf(_propTypes3.DATA_ITEM_PROP),
    colors: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.object]),
    verticalScroll: _propTypes2.default.bool,
    showEmptyGroup: _propTypes2.default.bool,
    /* 'background' is for TIMAP. Can be extent in the future...... */
    // background: PropTypes.bool,
    // legend: PropTypes.object,
    onTooltip: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.bool]),
    onMouseOver: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func,
    onRangeChanged: _propTypes2.default.func,
    onChanged: _propTypes2.default.func
};
BaseTimeline.defaultProps = {
    data: [],
    verticalScroll: false,
    showEmptyGroup: true,
    // background: false,
    onTooltip: true
};
var Timeline = (0, _widgetProvider2.default)(BaseTimeline);

exports.default = Timeline;

/***/ }),

/***/ "../src/consts/prop-types.js":
/*!***********************************!*\
  !*** ../src/consts/prop-types.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AGG_TYPE_PROP = exports.KEY_MAPPING_PROP = exports.DATA_ITEM_PROP = undefined;

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Data item prop
 */
/**
 * Defines commonly used prop types, as well as prop type generators
 */

var DATA_ITEM_PROP = exports.DATA_ITEM_PROP = _propTypes2.default.objectOf(_propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number, _propTypes2.default.object]));

/**
 * Single key mapping prop
 */
var KEY_MAPPING_PROP = exports.KEY_MAPPING_PROP = _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.string), _propTypes2.default.string]);

/**
 * Aggregation type
 */
var AGG_TYPE_PROP = exports.AGG_TYPE_PROP = _propTypes2.default.oneOf(['count', 'sum', 'avg']);

/***/ }),

/***/ "../src/hoc/split-charts.js":
/*!**********************************!*\
  !*** ../src/hoc/split-charts.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = splitCharts;

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('chart/hoc/split-charts');

var COLORS = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1', '#b09901', '#06ce72', '#477e58', '#c26a6e', '#c1b748'];

function splitCharts(Component) {
    var _class, _temp2;

    return _temp2 = _class = function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class() {
            var _ref;

            var _temp, _this, _ret;

            _classCallCheck(this, _class);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args))), _this), _this.getChartTitle = function (labels, splitChartPath, chartKey) {
                if (chartKey == null || chartKey === 'undefined') {
                    return 'others';
                }
                return _lodash2.default.reduce([splitChartPath, chartKey], function (acc, path) {
                    return _lodash2.default.get(acc, path, chartKey);
                }, labels);
            }, _this.getAxisChartColors = function () {
                var _this$props = _this.props,
                    data = _this$props.data,
                    _this$props$dataCfg = _this$props.dataCfg,
                    y = _this$props$dataCfg.y,
                    splitSeries = _this$props$dataCfg.splitSeries;

                // Case 1: Not split by series (ie each split chart only has 1 series)
                // Case 2: Y is not given (use splitSeries as key)
                // Case 3: Both splitSeries & y given
                // For 1 & 2, don't need to sync coloring across charts, just use HightChart default

                if (splitSeries && y) {
                    var keys = (0, _lodash2.default)(data).map(function (i) {
                        return _lodash2.default.get(i, splitSeries);
                    }).uniq().value();
                    return _lodash2.default.zipObject(keys, COLORS);
                }
                return null;
            }, _this.getPieChartColors = function () {
                var _this$props2 = _this.props,
                    data = _this$props2.data,
                    splitSlice = _this$props2.dataCfg.splitSlice;

                var colorIdx = 0;
                var colors = _lodash2.default.reduce(splitSlice, function (acc, slicePath) {
                    var keys = (0, _lodash2.default)(data).map(function (i) {
                        return _lodash2.default.get(i, slicePath);
                    }).uniq().value();
                    var numColors = keys.length;
                    _lodash2.default.set(acc, slicePath, _lodash2.default.zipObject(keys, COLORS.slice(colorIdx, colorIdx + numColors)));
                    colorIdx += numColors;
                    return acc;
                }, {});
                return colors;
            }, _this.renderChart = function (id, data) {
                var _this$props3 = _this.props,
                    keyLabels = _this$props3.keyLabels,
                    valueLabels = _this$props3.valueLabels,
                    dataCfg = _this$props3.dataCfg,
                    colors = _this$props3.colors;
                var splitChart = dataCfg.splitChart;

                var title = _this.getChartTitle(valueLabels, splitChart, id);

                var propsToOverwrite = _lodash2.default.reduce(['onTooltip', 'onMouseOver', 'onClick', 'onDoubleClick', 'onContextMenu'], function (acc, p) {
                    if (_lodash2.default.has(_this.props, p)) {
                        if (typeof _this.props[p] === 'function') {
                            acc[p] = function (eventInfo, matched, cfg) {
                                return _this.props[p](_extends({ splitChart: id }, eventInfo), matched, cfg);
                            };
                        }
                    }
                    return acc;
                }, {});

                switch (Component.displayName) {
                    case 'BaseTableChart':
                    case 'BaseTimeline':
                        propsToOverwrite.title = title;
                        break;
                    case 'BasePieChart':
                        propsToOverwrite.colors = colors || _this.getPieChartColors();
                        propsToOverwrite.centerText = title;
                        break;
                    /*case 'BarChart':
                    case 'LineChart':
                    case 'AreaChart':*/
                    case 'BaseAxisChart':
                        propsToOverwrite.colors = colors || _this.getAxisChartColors();
                        //propsToOverwrite.yAxis = {...this.props.yAxis, title}
                        propsToOverwrite.yAxis = _lodash2.default.merge({ title: { text: title } }, _this.props.yAxis);

                        break;
                    default:
                        break;
                }
                return _react2.default.createElement(Component, _extends({}, _this.props, {
                    key: id,
                    id: id,
                    data: data,
                    dataCfg: dataCfg,
                    keyLabels: keyLabels,
                    valueLabels: valueLabels
                }, propsToOverwrite));
            }, _temp), _possibleConstructorReturn(_this, _ret);
        }

        _createClass(_class, [{
            key: 'render',
            value: function render() {
                var _this2 = this;

                var _props = this.props,
                    data = _props.data,
                    splitChart = _props.dataCfg.splitChart;


                if (splitChart) {
                    return _react2.default.createElement(
                        'div',
                        { className: 'c-chart-split' },
                        (0, _lodash2.default)(data).groupBy(function (item) {
                            return _lodash2.default.get(item, splitChart);
                        }).map(function (v, k) {
                            return _this2.renderChart(k, v);
                        }).value()
                    );
                } else {
                    return _react2.default.createElement(Component, this.props);
                }
            }
        }]);

        return _class;
    }(_react2.default.Component), _class.propTypes = {
        data: _propTypes2.default.arrayOf(_propTypes3.DATA_ITEM_PROP).isRequired,
        dataCfg: _propTypes2.default.shape({
            splitChart: _propTypes3.KEY_MAPPING_PROP
        }),
        keyLabels: _propTypes3.DATA_ITEM_PROP,
        valueLabels: _propTypes2.default.objectOf(_propTypes3.DATA_ITEM_PROP),
        colors: _propTypes2.default.object
    }, _temp2;
}

/***/ }),

/***/ "../src/hoc/widget-provider.js":
/*!*************************************!*\
  !*** ../src/hoc/widget-provider.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _splitCharts = __webpack_require__(/*! ./split-charts */ "../src/hoc/split-charts.js");

var _splitCharts2 = _interopRequireDefault(_splitCharts);

var _traversal = __webpack_require__(/*! ../utils/traversal */ "../src/utils/traversal.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('chart/hoc/widget-provider');

function renderTooltip(eventInfo, matched, _ref) {
    var dataCfg = _ref.dataCfg,
        keyLabels = _ref.keyLabels,
        valueLabels = _ref.valueLabels;

    var fields = _lodash2.default.reduce(dataCfg, function (acc, keys, i) {
        var event = eventInfo[i];
        if (i === 'splitSlice' || i === 'agg') {
            _lodash2.default.forEach(keys, function (k, j) {
                acc.push({ key: k, value: event[j] });
            });
        } else if (!dataCfg.y && i === 'splitSeries') {
            acc.push({ key: event, value: eventInfo.y });
        } else {
            acc.push({ key: keys, value: event });
        }
        return acc;
    }, []);
    return _react2.default.createElement(
        'span',
        null,
        _lodash2.default.map(fields, function (_ref2) {
            var key = _ref2.key,
                value = _ref2.value;

            return _react2.default.createElement(
                'span',
                { key: key },
                _lodash2.default.get(keyLabels, key, key),
                ':',
                (0, _traversal.multiTraverse)(valueLabels, [key, value], value),
                _react2.default.createElement('br', null)
            );
        })
    );
}

var toWidget = function toWidget(BaseComponent) {
    var SplitComponent = (0, _splitCharts2.default)(BaseComponent);

    return function (props) {
        var id = props.id,
            className = props.className,
            title = props.title,
            chartProps = _objectWithoutProperties(props, ['id', 'className', 'title']);

        var Component = chartProps.dataCfg.splitChart ? SplitComponent : BaseComponent;
        var defaultTooltip = chartProps.onTooltip == null || chartProps.onTooltip === true;

        return _react2.default.createElement(
            'div',
            { id: id, className: (0, _classnames2.default)('c-chart', className) },
            title && _react2.default.createElement(
                'header',
                null,
                title
            ),
            _react2.default.createElement(Component, _extends({}, chartProps, { onTooltip: defaultTooltip ? renderTooltip : chartProps.onTooltip }))
        );
    };
};

exports.default = toWidget;

/***/ }),

/***/ "../src/utils/traversal.js":
/*!*********************************!*\
  !*** ../src/utils/traversal.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.multiTraverse = multiTraverse;

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function multiTraverse(obj, paths, defaultValue) {
    return _lodash2.default.reduce(paths, function (acc, path) {
        return _lodash2.default.get(acc, path, defaultValue);
    }, obj);
}

exports.default = {
    multiTraverse: multiTraverse
};

/***/ }),

/***/ "./mock/imdb-key.json":
/*!****************************!*\
  !*** ./mock/imdb-key.json ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {"data":[{"director":"martin","tom":2,"nicole":5,"year":1990},{"director":"martin","tom":3,"nicole":4,"year":1991},{"director":"martin","tom":2,"nicole":3,"year":1992},{"director":"martin","nicole":6,"year":1993},{"director":"martin","nicole":1,"year":1994},{"director":"martin","tom":10,"year":1996},{"director":"martin","tom":2,"nicole":0,"year":1997},{"director":"martin","tom":5,"nicole":1,"year":2000},{"director":"francis","tom":4,"nicole":1,"year":1990},{"director":"francis","tom":2,"nicole":3,"year":1991},{"director":"francis","tom":7,"nicole":4,"year":1992},{"director":"francis","nicole":1,"year":1993},{"director":"francis","nicole":2,"year":1994},{"director":"francis","tom":2,"year":1996},{"director":"francis","tom":1,"nicole":0,"year":1997},{"director":"francis","tom":1,"nicole":2,"year":2000},{"tom":1,"nicole":2,"year":2000}],"dataCfg":{"splitChart":"director","x":"year","splitLine":["tom","nicole"]},"keyLabels":{"director":"Director","actor":"Actor","movies":"# movies","year":"Year","tom":"Tom Cruise","nicole":"Nicole Kidman"},"valueLabels":{"director":{"martin":"Martin Scorses","francis":"Francis Copola"}}}

/***/ }),

/***/ "./mock/imdb-nested.json":
/*!*******************************!*\
  !*** ./mock/imdb-nested.json ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {"data":[{"director":"martin","actor":{"imdb.id":"tom","tomato.id":"1"},"movies":1,"tvs":0,"produced":{"year":1990}},{"director":"martin","actor":{"imdb.id":"tom","tomato.id":"1"},"movies":2,"tvs":4,"produced":{"year":1990}},{"director":"francis","actor":{"imdb.id":"tom","tomato.id":"1"},"movies":3,"produced":{"year":1991}},{"director":"francis","actor":{"imdb.id":"tom","tomato.id":"1"},"movies":2,"produced":{"year":1992}},{"director":"francis","actor":{"imdb.id":"tom","tomato.id":"1"},"movies":10,"produced":{"year":1996}},{"director":"francis","actor":{"imdb.id":"tom","tomato.id":"1"},"movies":2,"produced":{"year":1997}},{"director":"francis","actor":{"imdb.id":"tom","tomato.id":"1"},"movies":5,"produced":{"year":2000}},{"director":"martin","actor":{"imdb.id":"nicole","tomato.id":"2"},"movies":5,"produced":{"year":1990}},{"director":"martin","actor":{"imdb.id":"nicole","tomato.id":"2"},"movies":4,"produced":{"year":1991}},{"director":"martin","actor":{"imdb.id":"nicole","tomato.id":"2"},"movies":3,"produced":{"year":1992}},{"director":"francis","actor":{"imdb.id":"nicole","tomato.id":"2"},"movies":6,"produced":{"year":1993}},{"director":"francis","actor":{"imdb.id":"nicole","tomato.id":"2"},"movies":1,"produced":{"year":1994}},{"director":"francis","actor":{"imdb.id":"nicole","tomato.id":"2"},"movies":0,"produced":{"year":1997}},{"director":"francis","actor":{"imdb.id":"nicole","tomato.id":"2"},"movies":1,"produced":{"year":2000}}],"keyLabels":{"director":"Director","actor":{"imdb.id":"Actor"},"movies":"# movies","produced.year":"Year"},"valueLabels":{"director":{"martin":"Martin Scorsese","francis":"Francis Copola"},"actor":{"imdb.id":{"tom":"Tom Cruise","nicole":"Nicole Kidman"}}}}

/***/ }),

/***/ "./mock/imdb.json":
/*!************************!*\
  !*** ./mock/imdb.json ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {"data":[{"director":"martin","actor":"tom","movies":2,"tvs":1,"year":1990,"timeStart":1501731024000,"timeEnd":1501731224000},{"director":"martin","actor":"tom","movies":3,"tvs":2,"year":1990,"timeStart":1501731299000,"timeEnd":1501731324000},{"director":"martin","actor":"tom","movies":3,"year":1991,"timeStart":1501731424000,"timeEnd":1501731524000},{"director":"martin","actor":"tom","movies":2,"year":1992,"timeStart":1501731524000,"timeEnd":1501731724000},{"director":"martin","actor":"tom","movies":10,"year":1996,"timeStart":1501730184000,"timeEnd":1501732224000},{"director":"martin","actor":"tom","movies":2,"year":1997,"timeStart":1501732324000,"timeEnd":1501732424000},{"director":"martin","actor":"tom","movies":5,"year":2000,"timeStart":1501732624000,"timeEnd":1501732724000},{"director":"martin","actor":"nicole","movies":5,"year":1990,"timeStart":1501733324000,"timeEnd":1501733624000},{"director":"martin","actor":"nicole","movies":4,"year":1991,"timeStart":1501734424000,"timeEnd":1501736624000},{"director":"martin","actor":"nicole","movies":3,"year":1992,"timeStart":1501735524000,"timeEnd":1501735624000},{"director":"martin","actor":"nicole","movies":6,"year":1993,"timeStart":1501710924000,"timeEnd":1501720924000},{"director":"martin","actor":"nicole","movies":1,"year":1994,"timeStart":1501720924000,"timeEnd":1501730924000},{"director":"martin","actor":"nicole","movies":0,"year":1997,"timeStart":1501730924000,"timeEnd":1501750924000},{"director":"martin","actor":"nicole","movies":1,"year":2000,"timeStart":1501760924000,"timeEnd":1501737924000},{"director":"francis","actor":"tom","movies":4,"year":1990,"timeStart":1501736924000,"timeEnd":1501738924000},{"director":"francis","actor":"tom","movies":2,"year":1991,"timeStart":1501760924000,"timeEnd":1501770924000},{"director":"francis","actor":"tom","movies":7,"year":1992,"timeStart":1501710924000,"timeEnd":1501720924000},{"director":"francis","actor":"tom","movies":2,"year":1996,"timeStart":1501730926000,"timeEnd":1501734924000},{"director":"francis","actor":"tom","movies":1,"year":1997,"timeStart":1501730944000,"timeEnd":1501730974000},{"director":"francis","actor":"tom","movies":1,"year":2000,"timeStart":1501730944000,"timeEnd":1501730984000},{"director":"francis","actor":"nicole","movies":1,"year":1990,"timeStart":1501730904000,"timeEnd":1501730924000},{"director":"francis","actor":"nicole","movies":3,"year":1991,"timeStart":1501732924000,"timeEnd":1501736924000},{"director":"francis","actor":"nicole","movies":4,"year":1992,"timeStart":1501734924000,"timeEnd":1501736924000},{"director":"francis","actor":"nicole","movies":1,"year":1993,"timeStart":1501737924000,"timeEnd":1501739924000},{"director":"francis","actor":"nicole","movies":2,"year":1994,"timeStart":1501732924000,"timeEnd":1501736924000},{"director":"francis","actor":"nicole","movies":1,"year":1997,"timeStart":1501720924000,"timeEnd":1501730924000},{"director":"francis","actor":"nicole","movies":2,"year":2000,"timeStart":1501730924000,"timeEnd":1501770924000},{"director":"francis","movies":2,"year":2000,"timeStart":1501730924000,"timeEnd":1501780924000},{"actor":"tom","movies":2,"year":1994,"timeStart":1501330924000,"timeEnd":1501730924000},{"actor":"nicole","movies":2,"year":2001,"timeStart":1501230924000,"timeEnd":1501230924000}],"keyLabels":{"director":"Director","actor":"Actor","year":"Year","timeStart":"Start","timeEnd":"End"},"valueLabels":{"director":{"martin":"Martin Scorsese","francis":"Francis Copola"},"actor":{"tom":"Tom Cruise","nicole":"Nicole Kidman"}}}

/***/ }),

/***/ "./node_modules/moment/locale sync recursive ^\\.\\/.*$":
/*!**************************************************!*\
  !*** ./node_modules/moment/locale sync ^\.\/.*$ ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./af": "./node_modules/moment/locale/af.js",
	"./af.js": "./node_modules/moment/locale/af.js",
	"./ar": "./node_modules/moment/locale/ar.js",
	"./ar-dz": "./node_modules/moment/locale/ar-dz.js",
	"./ar-dz.js": "./node_modules/moment/locale/ar-dz.js",
	"./ar-kw": "./node_modules/moment/locale/ar-kw.js",
	"./ar-kw.js": "./node_modules/moment/locale/ar-kw.js",
	"./ar-ly": "./node_modules/moment/locale/ar-ly.js",
	"./ar-ly.js": "./node_modules/moment/locale/ar-ly.js",
	"./ar-ma": "./node_modules/moment/locale/ar-ma.js",
	"./ar-ma.js": "./node_modules/moment/locale/ar-ma.js",
	"./ar-sa": "./node_modules/moment/locale/ar-sa.js",
	"./ar-sa.js": "./node_modules/moment/locale/ar-sa.js",
	"./ar-tn": "./node_modules/moment/locale/ar-tn.js",
	"./ar-tn.js": "./node_modules/moment/locale/ar-tn.js",
	"./ar.js": "./node_modules/moment/locale/ar.js",
	"./az": "./node_modules/moment/locale/az.js",
	"./az.js": "./node_modules/moment/locale/az.js",
	"./be": "./node_modules/moment/locale/be.js",
	"./be.js": "./node_modules/moment/locale/be.js",
	"./bg": "./node_modules/moment/locale/bg.js",
	"./bg.js": "./node_modules/moment/locale/bg.js",
	"./bm": "./node_modules/moment/locale/bm.js",
	"./bm.js": "./node_modules/moment/locale/bm.js",
	"./bn": "./node_modules/moment/locale/bn.js",
	"./bn.js": "./node_modules/moment/locale/bn.js",
	"./bo": "./node_modules/moment/locale/bo.js",
	"./bo.js": "./node_modules/moment/locale/bo.js",
	"./br": "./node_modules/moment/locale/br.js",
	"./br.js": "./node_modules/moment/locale/br.js",
	"./bs": "./node_modules/moment/locale/bs.js",
	"./bs.js": "./node_modules/moment/locale/bs.js",
	"./ca": "./node_modules/moment/locale/ca.js",
	"./ca.js": "./node_modules/moment/locale/ca.js",
	"./cs": "./node_modules/moment/locale/cs.js",
	"./cs.js": "./node_modules/moment/locale/cs.js",
	"./cv": "./node_modules/moment/locale/cv.js",
	"./cv.js": "./node_modules/moment/locale/cv.js",
	"./cy": "./node_modules/moment/locale/cy.js",
	"./cy.js": "./node_modules/moment/locale/cy.js",
	"./da": "./node_modules/moment/locale/da.js",
	"./da.js": "./node_modules/moment/locale/da.js",
	"./de": "./node_modules/moment/locale/de.js",
	"./de-at": "./node_modules/moment/locale/de-at.js",
	"./de-at.js": "./node_modules/moment/locale/de-at.js",
	"./de-ch": "./node_modules/moment/locale/de-ch.js",
	"./de-ch.js": "./node_modules/moment/locale/de-ch.js",
	"./de.js": "./node_modules/moment/locale/de.js",
	"./dv": "./node_modules/moment/locale/dv.js",
	"./dv.js": "./node_modules/moment/locale/dv.js",
	"./el": "./node_modules/moment/locale/el.js",
	"./el.js": "./node_modules/moment/locale/el.js",
	"./en-au": "./node_modules/moment/locale/en-au.js",
	"./en-au.js": "./node_modules/moment/locale/en-au.js",
	"./en-ca": "./node_modules/moment/locale/en-ca.js",
	"./en-ca.js": "./node_modules/moment/locale/en-ca.js",
	"./en-gb": "./node_modules/moment/locale/en-gb.js",
	"./en-gb.js": "./node_modules/moment/locale/en-gb.js",
	"./en-ie": "./node_modules/moment/locale/en-ie.js",
	"./en-ie.js": "./node_modules/moment/locale/en-ie.js",
	"./en-il": "./node_modules/moment/locale/en-il.js",
	"./en-il.js": "./node_modules/moment/locale/en-il.js",
	"./en-nz": "./node_modules/moment/locale/en-nz.js",
	"./en-nz.js": "./node_modules/moment/locale/en-nz.js",
	"./eo": "./node_modules/moment/locale/eo.js",
	"./eo.js": "./node_modules/moment/locale/eo.js",
	"./es": "./node_modules/moment/locale/es.js",
	"./es-do": "./node_modules/moment/locale/es-do.js",
	"./es-do.js": "./node_modules/moment/locale/es-do.js",
	"./es-us": "./node_modules/moment/locale/es-us.js",
	"./es-us.js": "./node_modules/moment/locale/es-us.js",
	"./es.js": "./node_modules/moment/locale/es.js",
	"./et": "./node_modules/moment/locale/et.js",
	"./et.js": "./node_modules/moment/locale/et.js",
	"./eu": "./node_modules/moment/locale/eu.js",
	"./eu.js": "./node_modules/moment/locale/eu.js",
	"./fa": "./node_modules/moment/locale/fa.js",
	"./fa.js": "./node_modules/moment/locale/fa.js",
	"./fi": "./node_modules/moment/locale/fi.js",
	"./fi.js": "./node_modules/moment/locale/fi.js",
	"./fo": "./node_modules/moment/locale/fo.js",
	"./fo.js": "./node_modules/moment/locale/fo.js",
	"./fr": "./node_modules/moment/locale/fr.js",
	"./fr-ca": "./node_modules/moment/locale/fr-ca.js",
	"./fr-ca.js": "./node_modules/moment/locale/fr-ca.js",
	"./fr-ch": "./node_modules/moment/locale/fr-ch.js",
	"./fr-ch.js": "./node_modules/moment/locale/fr-ch.js",
	"./fr.js": "./node_modules/moment/locale/fr.js",
	"./fy": "./node_modules/moment/locale/fy.js",
	"./fy.js": "./node_modules/moment/locale/fy.js",
	"./gd": "./node_modules/moment/locale/gd.js",
	"./gd.js": "./node_modules/moment/locale/gd.js",
	"./gl": "./node_modules/moment/locale/gl.js",
	"./gl.js": "./node_modules/moment/locale/gl.js",
	"./gom-latn": "./node_modules/moment/locale/gom-latn.js",
	"./gom-latn.js": "./node_modules/moment/locale/gom-latn.js",
	"./gu": "./node_modules/moment/locale/gu.js",
	"./gu.js": "./node_modules/moment/locale/gu.js",
	"./he": "./node_modules/moment/locale/he.js",
	"./he.js": "./node_modules/moment/locale/he.js",
	"./hi": "./node_modules/moment/locale/hi.js",
	"./hi.js": "./node_modules/moment/locale/hi.js",
	"./hr": "./node_modules/moment/locale/hr.js",
	"./hr.js": "./node_modules/moment/locale/hr.js",
	"./hu": "./node_modules/moment/locale/hu.js",
	"./hu.js": "./node_modules/moment/locale/hu.js",
	"./hy-am": "./node_modules/moment/locale/hy-am.js",
	"./hy-am.js": "./node_modules/moment/locale/hy-am.js",
	"./id": "./node_modules/moment/locale/id.js",
	"./id.js": "./node_modules/moment/locale/id.js",
	"./is": "./node_modules/moment/locale/is.js",
	"./is.js": "./node_modules/moment/locale/is.js",
	"./it": "./node_modules/moment/locale/it.js",
	"./it.js": "./node_modules/moment/locale/it.js",
	"./ja": "./node_modules/moment/locale/ja.js",
	"./ja.js": "./node_modules/moment/locale/ja.js",
	"./jv": "./node_modules/moment/locale/jv.js",
	"./jv.js": "./node_modules/moment/locale/jv.js",
	"./ka": "./node_modules/moment/locale/ka.js",
	"./ka.js": "./node_modules/moment/locale/ka.js",
	"./kk": "./node_modules/moment/locale/kk.js",
	"./kk.js": "./node_modules/moment/locale/kk.js",
	"./km": "./node_modules/moment/locale/km.js",
	"./km.js": "./node_modules/moment/locale/km.js",
	"./kn": "./node_modules/moment/locale/kn.js",
	"./kn.js": "./node_modules/moment/locale/kn.js",
	"./ko": "./node_modules/moment/locale/ko.js",
	"./ko.js": "./node_modules/moment/locale/ko.js",
	"./ky": "./node_modules/moment/locale/ky.js",
	"./ky.js": "./node_modules/moment/locale/ky.js",
	"./lb": "./node_modules/moment/locale/lb.js",
	"./lb.js": "./node_modules/moment/locale/lb.js",
	"./lo": "./node_modules/moment/locale/lo.js",
	"./lo.js": "./node_modules/moment/locale/lo.js",
	"./lt": "./node_modules/moment/locale/lt.js",
	"./lt.js": "./node_modules/moment/locale/lt.js",
	"./lv": "./node_modules/moment/locale/lv.js",
	"./lv.js": "./node_modules/moment/locale/lv.js",
	"./me": "./node_modules/moment/locale/me.js",
	"./me.js": "./node_modules/moment/locale/me.js",
	"./mi": "./node_modules/moment/locale/mi.js",
	"./mi.js": "./node_modules/moment/locale/mi.js",
	"./mk": "./node_modules/moment/locale/mk.js",
	"./mk.js": "./node_modules/moment/locale/mk.js",
	"./ml": "./node_modules/moment/locale/ml.js",
	"./ml.js": "./node_modules/moment/locale/ml.js",
	"./mn": "./node_modules/moment/locale/mn.js",
	"./mn.js": "./node_modules/moment/locale/mn.js",
	"./mr": "./node_modules/moment/locale/mr.js",
	"./mr.js": "./node_modules/moment/locale/mr.js",
	"./ms": "./node_modules/moment/locale/ms.js",
	"./ms-my": "./node_modules/moment/locale/ms-my.js",
	"./ms-my.js": "./node_modules/moment/locale/ms-my.js",
	"./ms.js": "./node_modules/moment/locale/ms.js",
	"./mt": "./node_modules/moment/locale/mt.js",
	"./mt.js": "./node_modules/moment/locale/mt.js",
	"./my": "./node_modules/moment/locale/my.js",
	"./my.js": "./node_modules/moment/locale/my.js",
	"./nb": "./node_modules/moment/locale/nb.js",
	"./nb.js": "./node_modules/moment/locale/nb.js",
	"./ne": "./node_modules/moment/locale/ne.js",
	"./ne.js": "./node_modules/moment/locale/ne.js",
	"./nl": "./node_modules/moment/locale/nl.js",
	"./nl-be": "./node_modules/moment/locale/nl-be.js",
	"./nl-be.js": "./node_modules/moment/locale/nl-be.js",
	"./nl.js": "./node_modules/moment/locale/nl.js",
	"./nn": "./node_modules/moment/locale/nn.js",
	"./nn.js": "./node_modules/moment/locale/nn.js",
	"./pa-in": "./node_modules/moment/locale/pa-in.js",
	"./pa-in.js": "./node_modules/moment/locale/pa-in.js",
	"./pl": "./node_modules/moment/locale/pl.js",
	"./pl.js": "./node_modules/moment/locale/pl.js",
	"./pt": "./node_modules/moment/locale/pt.js",
	"./pt-br": "./node_modules/moment/locale/pt-br.js",
	"./pt-br.js": "./node_modules/moment/locale/pt-br.js",
	"./pt.js": "./node_modules/moment/locale/pt.js",
	"./ro": "./node_modules/moment/locale/ro.js",
	"./ro.js": "./node_modules/moment/locale/ro.js",
	"./ru": "./node_modules/moment/locale/ru.js",
	"./ru.js": "./node_modules/moment/locale/ru.js",
	"./sd": "./node_modules/moment/locale/sd.js",
	"./sd.js": "./node_modules/moment/locale/sd.js",
	"./se": "./node_modules/moment/locale/se.js",
	"./se.js": "./node_modules/moment/locale/se.js",
	"./si": "./node_modules/moment/locale/si.js",
	"./si.js": "./node_modules/moment/locale/si.js",
	"./sk": "./node_modules/moment/locale/sk.js",
	"./sk.js": "./node_modules/moment/locale/sk.js",
	"./sl": "./node_modules/moment/locale/sl.js",
	"./sl.js": "./node_modules/moment/locale/sl.js",
	"./sq": "./node_modules/moment/locale/sq.js",
	"./sq.js": "./node_modules/moment/locale/sq.js",
	"./sr": "./node_modules/moment/locale/sr.js",
	"./sr-cyrl": "./node_modules/moment/locale/sr-cyrl.js",
	"./sr-cyrl.js": "./node_modules/moment/locale/sr-cyrl.js",
	"./sr.js": "./node_modules/moment/locale/sr.js",
	"./ss": "./node_modules/moment/locale/ss.js",
	"./ss.js": "./node_modules/moment/locale/ss.js",
	"./sv": "./node_modules/moment/locale/sv.js",
	"./sv.js": "./node_modules/moment/locale/sv.js",
	"./sw": "./node_modules/moment/locale/sw.js",
	"./sw.js": "./node_modules/moment/locale/sw.js",
	"./ta": "./node_modules/moment/locale/ta.js",
	"./ta.js": "./node_modules/moment/locale/ta.js",
	"./te": "./node_modules/moment/locale/te.js",
	"./te.js": "./node_modules/moment/locale/te.js",
	"./tet": "./node_modules/moment/locale/tet.js",
	"./tet.js": "./node_modules/moment/locale/tet.js",
	"./tg": "./node_modules/moment/locale/tg.js",
	"./tg.js": "./node_modules/moment/locale/tg.js",
	"./th": "./node_modules/moment/locale/th.js",
	"./th.js": "./node_modules/moment/locale/th.js",
	"./tl-ph": "./node_modules/moment/locale/tl-ph.js",
	"./tl-ph.js": "./node_modules/moment/locale/tl-ph.js",
	"./tlh": "./node_modules/moment/locale/tlh.js",
	"./tlh.js": "./node_modules/moment/locale/tlh.js",
	"./tr": "./node_modules/moment/locale/tr.js",
	"./tr.js": "./node_modules/moment/locale/tr.js",
	"./tzl": "./node_modules/moment/locale/tzl.js",
	"./tzl.js": "./node_modules/moment/locale/tzl.js",
	"./tzm": "./node_modules/moment/locale/tzm.js",
	"./tzm-latn": "./node_modules/moment/locale/tzm-latn.js",
	"./tzm-latn.js": "./node_modules/moment/locale/tzm-latn.js",
	"./tzm.js": "./node_modules/moment/locale/tzm.js",
	"./ug-cn": "./node_modules/moment/locale/ug-cn.js",
	"./ug-cn.js": "./node_modules/moment/locale/ug-cn.js",
	"./uk": "./node_modules/moment/locale/uk.js",
	"./uk.js": "./node_modules/moment/locale/uk.js",
	"./ur": "./node_modules/moment/locale/ur.js",
	"./ur.js": "./node_modules/moment/locale/ur.js",
	"./uz": "./node_modules/moment/locale/uz.js",
	"./uz-latn": "./node_modules/moment/locale/uz-latn.js",
	"./uz-latn.js": "./node_modules/moment/locale/uz-latn.js",
	"./uz.js": "./node_modules/moment/locale/uz.js",
	"./vi": "./node_modules/moment/locale/vi.js",
	"./vi.js": "./node_modules/moment/locale/vi.js",
	"./x-pseudo": "./node_modules/moment/locale/x-pseudo.js",
	"./x-pseudo.js": "./node_modules/moment/locale/x-pseudo.js",
	"./yo": "./node_modules/moment/locale/yo.js",
	"./yo.js": "./node_modules/moment/locale/yo.js",
	"./zh-cn": "./node_modules/moment/locale/zh-cn.js",
	"./zh-cn.js": "./node_modules/moment/locale/zh-cn.js",
	"./zh-hk": "./node_modules/moment/locale/zh-hk.js",
	"./zh-hk.js": "./node_modules/moment/locale/zh-hk.js",
	"./zh-tw": "./node_modules/moment/locale/zh-tw.js",
	"./zh-tw.js": "./node_modules/moment/locale/zh-tw.js"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	var module = __webpack_require__(id);
	return module;
}
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error('Cannot find module "' + req + '".');
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return id;
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "./node_modules/moment/locale sync recursive ^\\.\\/.*$";

/***/ }),

/***/ "./src/app.js":
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");

var _reactRouter = __webpack_require__(/*! react-router */ "./node_modules/react-router/es/index.js");

var _loglevel = __webpack_require__(/*! loglevel */ "./node_modules/loglevel/lib/loglevel.js");

var _loglevel2 = _interopRequireDefault(_loglevel);

var _client = __webpack_require__(/*! loglevel-prefix-persist/client */ "./node_modules/loglevel-prefix-persist/client.js");

var _client2 = _interopRequireDefault(_client);

__webpack_require__(/*! purecss/build/pure-min.css */ "./node_modules/purecss/build/pure-min.css");

__webpack_require__(/*! react-ui/build/css/react-ui.css */ "../node_modules/react-ui/build/css/react-ui.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import 'react-chart/build/css/react-chart.css'

var initialState = JSON.parse(document.getElementById('initial-state').innerHTML);

var cfg = initialState.envCfg;


var log = (0, _client2.default)(cfg.env, _loglevel2.default, cfg.log);

var Routes = __webpack_require__(/*! ./routes */ "./src/routes.js").default;

(0, _reactDom.render)(_react2.default.createElement(
    _reactRouter.Router,
    { history: _reactRouter.browserHistory },
    Routes
), document.getElementById('app-container'));

/***/ }),

/***/ "./src/charts.js":
/*!***********************!*\
  !*** ./src/charts.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _jquery = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _queryString = __webpack_require__(/*! query-string */ "./node_modules/query-string/index.js");

var _queryString2 = _interopRequireDefault(_queryString);

var _area = __webpack_require__(/*! chart/components/area */ "../src/components/area.js");

var _area2 = _interopRequireDefault(_area);

var _bar = __webpack_require__(/*! chart/components/bar */ "../src/components/bar.js");

var _bar2 = _interopRequireDefault(_bar);

var _line = __webpack_require__(/*! chart/components/line */ "../src/components/line.js");

var _line2 = _interopRequireDefault(_line);

var _pie = __webpack_require__(/*! chart/components/pie */ "../src/components/pie.js");

var _pie2 = _interopRequireDefault(_pie);

var _timeline = __webpack_require__(/*! chart/components/timeline */ "../src/components/timeline.js");

var _timeline2 = _interopRequireDefault(_timeline);

var _ajaxHelper = __webpack_require__(/*! react-ui/build/src/utils/ajax-helper */ "../node_modules/react-ui/build/src/utils/ajax-helper.js");

var _ajaxHelper2 = _interopRequireDefault(_ajaxHelper);

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

var _imdb = __webpack_require__(/*! ../mock/imdb.json */ "./mock/imdb.json");

var _imdb2 = _interopRequireDefault(_imdb);

var _imdbKey = __webpack_require__(/*! ../mock/imdb-key.json */ "./mock/imdb-key.json");

var _imdbKey2 = _interopRequireDefault(_imdbKey);

var _imdbNested = __webpack_require__(/*! ../mock/imdb-nested.json */ "./mock/imdb-nested.json");

var _imdbNested2 = _interopRequireDefault(_imdbNested);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Examples = {};

var DATA = _imdb2.default.data,
    KEY_LABELS = _imdb2.default.keyLabels,
    VALUE_LABELS = _imdb2.default.valueLabels;
var DATA2 = _imdbKey2.default.data,
    KEY_LABELS2 = _imdbKey2.default.keyLabels,
    VALUE_LABELS2 = _imdbKey2.default.valueLabels;
var DATA3 = _imdbNested2.default.data,
    KEY_LABELS3 = _imdbNested2.default.keyLabels,
    VALUE_LABELS3 = _imdbNested2.default.valueLabels;


Examples.BarChart = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_bar2.default, {
                    title: 'Simple minimal bars',
                    data: DATA3,
                    keyLabels: KEY_LABELS3,
                    valueLabels: VALUE_LABELS3,
                    xAxis: { lineWidth: 0, tickWidth: 0, type: 'category' },
                    yAxis: { visible: false },
                    legend: { enabled: false },
                    dataCfg: {
                        x: ['actor', 'imdb.id'],
                        y: 'movies'
                    } }),
                _react2.default.createElement(_bar2.default, {
                    title: 'Actors by Year (column, stacked)',
                    stacked: true,
                    vertical: true,
                    data: DATA,
                    keyLabels: KEY_LABELS,
                    valueLabels: VALUE_LABELS,
                    onTooltip: true,
                    dataCfg: {
                        splitSeries: 'actor',
                        x: 'year',
                        y: 'movies'
                    } }),
                _react2.default.createElement(_bar2.default, {
                    title: 'Actors by Year (bar, side by side)',
                    data: DATA,
                    keyLabels: KEY_LABELS,
                    valueLabels: VALUE_LABELS,
                    colors: {
                        tom: '#c1b748',
                        nicole: '#2b908f'
                    },
                    dataCfg: {
                        splitSeries: 'actor',
                        x: 'year',
                        y: 'movies'
                    } }),
                _react2.default.createElement(_bar2.default, {
                    title: 'Actors by Director (bar key as series name)',
                    vertical: true,
                    data: DATA2,
                    keyLabels: KEY_LABELS2,
                    valueLabels: VALUE_LABELS2,
                    colors: {
                        tom: '#c1b748',
                        nicole: '#2b908f'
                    },
                    dataCfg: {
                        splitChart: 'director',
                        splitSeries: ['nicole', 'tom'],
                        x: 'year'
                    } })
            );
        }
    }]);

    return _class2;
}(_react2.default.Component);

Examples.AreaChart = function (_React$Component2) {
    _inherits(_class4, _React$Component2);

    function _class4() {
        var _ref2;

        var _temp2, _this2, _ret2;

        _classCallCheck(this, _class4);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_ref2 = _class4.__proto__ || Object.getPrototypeOf(_class4)).call.apply(_ref2, [this].concat(args))), _this2), _this2.state = {}, _temp2), _possibleConstructorReturn(_this2, _ret2);
    }

    _createClass(_class4, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(_area2.default, {
                className: 'c-test',
                title: 'Area Chart by Director',
                stacked: true,
                data: DATA,
                keyLabels: KEY_LABELS,
                valueLabels: VALUE_LABELS,
                plotOptions: { series: { fillOpacity: 0.4, marker: { enabled: false } } },
                dataCfg: {
                    splitChart: 'director',
                    splitSeries: 'actor',
                    x: 'year',
                    y: 'movies'
                } });
        }
    }]);

    return _class4;
}(_react2.default.Component);

Examples.PieChart = function (_React$Component3) {
    _inherits(_class6, _React$Component3);

    function _class6() {
        var _ref3;

        var _temp3, _this3, _ret3;

        _classCallCheck(this, _class6);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this3 = _possibleConstructorReturn(this, (_ref3 = _class6.__proto__ || Object.getPrototypeOf(_class6)).call.apply(_ref3, [this].concat(args))), _this3), _this3.state = {}, _temp3), _possibleConstructorReturn(_this3, _ret3);
    }

    _createClass(_class6, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_pie2.default, {
                    title: 'Pie Charts By Director',
                    data: DATA3,
                    keyLabels: KEY_LABELS3,
                    valueLabels: VALUE_LABELS3,
                    holeSize: 70,
                    dataCfg: {
                        splitChart: 'director',
                        splitSlice: ['produced.year', ['actor', 'imdb.id']],
                        sliceSize: 'movies'
                    } }),
                _react2.default.createElement(_pie2.default, {
                    title: 'Single Pie Chart',
                    data: [{ name: 'a', age: { band: 30 }, occupation: 'teacher', appears: 10 }, { name: 'b', age: { band: 40 }, occupation: 'criminal', appears: 15 }, { name: 'c', age: { band: 40 }, occupation: 'teacher', appears: 15 }],
                    colors: {
                        age: {
                            band: {
                                30: '#c1b748',
                                40: '#2b908f'
                            }
                        },
                        occupation: {
                            teacher: '#f15c80',
                            criminal: '#8085e9'
                        }
                    },
                    holeSize: 70,
                    centerText: _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'b',
                            null,
                            'Center'
                        ),
                        'Text'
                    ),
                    keyLabels: {
                        age: {
                            band: 'Age Range'
                        }
                    },
                    dataCfg: {
                        splitSlice: [['age', 'band'], 'occupation'],
                        sliceSize: 'appears'
                    } }),
                _react2.default.createElement(_pie2.default, {
                    title: 'Single Pie Chart 2',
                    data: [{ name: 'a', count: 20 }, { name: 'b', count: 80 }],
                    colors: {
                        name: {
                            a: '#c1b748',
                            b: '#2b908f'
                        }
                    },
                    holeSize: 70,
                    centerText: '80%',
                    dataCfg: {
                        splitSlice: ['name'],
                        sliceSize: 'count'
                    } })
            );
        }
    }]);

    return _class6;
}(_react2.default.Component);

Examples.LineChart = function (_React$Component4) {
    _inherits(_class8, _React$Component4);

    function _class8() {
        var _ref4;

        var _temp4, _this4, _ret4;

        _classCallCheck(this, _class8);

        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        return _ret4 = (_temp4 = (_this4 = _possibleConstructorReturn(this, (_ref4 = _class8.__proto__ || Object.getPrototypeOf(_class8)).call.apply(_ref4, [this].concat(args))), _this4), _this4.state = {}, _temp4), _possibleConstructorReturn(_this4, _ret4);
    }

    _createClass(_class8, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(_line2.default, {
                title: 'Line Charts by Actor',
                stacked: true,
                vertical: true,
                data: DATA,
                keyLabels: KEY_LABELS,
                valueLabels: VALUE_LABELS,
                dataCfg: {
                    splitChart: 'actor',
                    splitSeries: 'director',
                    x: 'year',
                    y: 'movies'
                } });
        }
    }]);

    return _class8;
}(_react2.default.Component);

Examples.Timeline = function (_React$Component5) {
    _inherits(_class10, _React$Component5);

    function _class10() {
        var _ref5;

        var _temp5, _this5, _ret5;

        _classCallCheck(this, _class10);

        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
        }

        return _ret5 = (_temp5 = (_this5 = _possibleConstructorReturn(this, (_ref5 = _class10.__proto__ || Object.getPrototypeOf(_class10)).call.apply(_ref5, [this].concat(args))), _this5), _this5.state = {
            eventInfo: {},
            data: {},
            dataCfg: {}
        }, _this5.handleClick = function (eventInfo, data, _ref6) {
            var dataCfg = _ref6.dataCfg,
                keyLabels = _ref6.keyLabels,
                valueLabels = _ref6.valueLabels;

            _this5.setState({
                eventInfo: eventInfo,
                data: data,
                dataCfg: dataCfg
            });
        }, _this5.handleRangeChanged = function (eventInfo, data, _ref7) {
            var dataCfg = _ref7.dataCfg,
                keyLabels = _ref7.keyLabels,
                valueLabels = _ref7.valueLabels;

            _this5.setState({
                eventInfo: eventInfo,
                data: data,
                dataCfg: dataCfg
            });
        }, _temp5), _possibleConstructorReturn(_this5, _ret5);
    }

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


    _createClass(_class10, [{
        key: 'render',
        value: function render() {
            var _this6 = this;

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_timeline2.default, {
                    ref: function ref(node) {
                        _this6.chartNode = node;
                    },
                    id: 'actor-timeline',
                    title: 'Actor Timeline',
                    data: DATA,
                    keyLabels: KEY_LABELS,
                    valueLabels: VALUE_LABELS,
                    dataCfg: {
                        splitGroup: 'actor',
                        timeStart: 'timeStart',
                        timeEnd: 'timeEnd',
                        agg: ['movies', 'tvs']
                    },
                    colors: {
                        movies: '#c1b748',
                        tvs: '#2b908f'
                    }
                    // colors={this.renderColor}
                    , verticalScroll: true,
                    onClick: this.handleClick,
                    onRangeChanged: this.handleRangeChanged })
            );
        }
    }]);

    return _class10;
}(_react2.default.Component);

var _class11 = function (_React$Component6) {
    _inherits(_class11, _React$Component6);

    function _class11() {
        _classCallCheck(this, _class11);

        return _possibleConstructorReturn(this, (_class11.__proto__ || Object.getPrototypeOf(_class11)).apply(this, arguments));
    }

    _createClass(_class11, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                _lodash2.default.map(Examples, function (example, key) {
                    return _react2.default.createElement((0, _exampleFactory2.default)(example, key), { key: key });
                })
            );
        }
    }]);

    return _class11;
}(_react2.default.Component);

exports.default = _class11;

/***/ }),

/***/ "./src/dashboard.js":
/*!**************************!*\
  !*** ./src/dashboard.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _bluebird = __webpack_require__(/*! bluebird */ "./node_modules/bluebird/js/browser/bluebird.js");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _bar = __webpack_require__(/*! chart/components/bar */ "../src/components/bar.js");

var _bar2 = _interopRequireDefault(_bar);

var _line = __webpack_require__(/*! chart/components/line */ "../src/components/line.js");

var _line2 = _interopRequireDefault(_line);

var _pie = __webpack_require__(/*! chart/components/pie */ "../src/components/pie.js");

var _pie2 = _interopRequireDefault(_pie);

var _area = __webpack_require__(/*! chart/components/area */ "../src/components/area.js");

var _area2 = _interopRequireDefault(_area);

var _table = __webpack_require__(/*! chart/components/table */ "../src/components/table.js");

var _table2 = _interopRequireDefault(_table);

var _dashboard = __webpack_require__(/*! chart/components/dashboard */ "../src/components/dashboard.js");

var _dashboard2 = _interopRequireDefault(_dashboard);

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

var _imdb = __webpack_require__(/*! ../mock/imdb.json */ "./mock/imdb.json");

var _imdb2 = _interopRequireDefault(_imdb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Examples = {};

var DATA = _imdb2.default.data,
    KEY_LABELS = _imdb2.default.keyLabels,
    VALUE_LABELS = _imdb2.default.valueLabels;


Examples.Dashboard = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            filter: {},
            event: {}
        }, _this.handleFilter = function (filter) {
            _this.setState({ filter: filter });
        }, _this.handleDoubleClick = function (widgetId, eventInfo, data, cfg) {
            _this.setState({ event: { type: 'global double-click', widgetId: widgetId, eventInfo: eventInfo, data: data, cfg: cfg } });
        }, _this.handleContextMenu = function (widgetId, eventInfo, data, cfg) {
            _this.setState({ event: { type: 'global right-click', widgetId: widgetId, eventInfo: eventInfo, data: data, cfg: cfg } });
        }, _this.handleActorChartDoubleClick = function (eventInfo, data, cfg) {
            _this.setState({ event: { type: 'child double-click', eventInfo: eventInfo, data: data, cfg: cfg } });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            var filter = this.state.filter;

            // Set charts' layout, the order need to be same as the order in DOM
            // Remember to properly set the layout, or it may crash

            var layout = [{ x: 0, y: 0, w: 9, h: 2 }, { x: 9, y: 0, w: 9, h: 4 }, { x: 0, y: 2, w: 9, h: 6 }, { x: 0, y: 8, w: 18, h: 2 }, { x: 9, y: 4, w: 9, h: 4 }];

            return _react2.default.createElement(
                _dashboard2.default,
                {
                    data: DATA,
                    keyLabels: KEY_LABELS,
                    valueLabels: VALUE_LABELS,
                    onDoubleClick: this.handleDoubleClick,
                    onContextMenu: this.handleContextMenu,
                    onFilter: this.handleFilter,
                    filter: filter,
                    layoutCfg: { layout: layout, cols: 18 } },
                _react2.default.createElement(_table2.default, {
                    id: 'actor-chart',
                    title: 'Directors table',
                    dataCfg: {
                        splitChart: 'director',
                        splitRow: ['actor'],
                        agg: ['movies', 'tvs']
                    },
                    onDoubleClick: this.handleActorChartDoubleClick }),
                _react2.default.createElement(_area2.default, {
                    id: 'director-split-actor-area-chart',
                    className: 'c-test',
                    title: 'Area Chart by Director',
                    dataCfg: {
                        splitChart: 'director',
                        splitSeries: 'actor',
                        x: 'year',
                        y: 'movies'
                    } }),
                _react2.default.createElement(_pie2.default, {
                    id: 'actor-pie-chart',
                    title: 'Pie Charts By Year',
                    holeSize: 70,
                    dataCfg: {
                        splitChart: 'year',
                        splitSlice: ['director', 'actor'],
                        sliceSize: 'movies'
                    } }),
                _react2.default.createElement(_bar2.default, {
                    id: 'actor-bar-chart',
                    title: 'Actors by Year',
                    stacked: true,
                    vertical: true,
                    dataCfg: {
                        splitSeries: 'actor',
                        x: 'year',
                        y: 'movies'
                    } }),
                _react2.default.createElement(_line2.default, {
                    id: 'director-split-actor-line-chart',
                    title: 'Line Charts by Actor',
                    stacked: true,
                    vertical: true,
                    dataCfg: {
                        splitChart: 'actor',
                        splitSeries: 'director',
                        x: 'year',
                        y: 'movies'
                    } })
            );
        }
    }]);

    return _class2;
}(_react2.default.Component);

var _class3 = function (_React$Component2) {
    _inherits(_class3, _React$Component2);

    function _class3() {
        _classCallCheck(this, _class3);

        return _possibleConstructorReturn(this, (_class3.__proto__ || Object.getPrototypeOf(_class3)).apply(this, arguments));
    }

    _createClass(_class3, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'example-tabs' },
                _lodash2.default.map(Examples, function (example, key) {
                    return _react2.default.createElement((0, _exampleFactory2.default)(example, key), { key: key });
                })
            );
        }
    }]);

    return _class3;
}(_react2.default.Component);

exports.default = _class3;

/***/ }),

/***/ "./src/example-factory.js":
/*!********************************!*\
  !*** ./src/example-factory.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (Component, title) {
    return function (_React$Component) {
        _inherits(_class2, _React$Component);

        function _class2() {
            var _ref;

            var _temp, _this, _ret;

            _classCallCheck(this, _class2);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _this.updateStateInfo = function () {
                if (JSON.stringify(_this.component.state || {}) !== JSON.stringify(_this.state)) {
                    _this.setState(_this.component.state || {});
                }
            }, _temp), _possibleConstructorReturn(_this, _ret);
        }

        _createClass(_class2, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                this.interval = setInterval(function () {
                    _this2.updateStateInfo();
                }, 500);
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                clearInterval(this.interval);
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                return _react2.default.createElement(
                    'fieldset',
                    null,
                    _react2.default.createElement(
                        'legend',
                        null,
                        title
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'example' },
                        _react2.default.createElement(
                            'div',
                            { className: 'demo' },
                            _react2.default.createElement(Component, { ref: function ref(_ref2) {
                                    _this3.component = _ref2;
                                } })
                        ),
                        _react2.default.createElement(
                            'pre',
                            { className: 'state' },
                            JSON.stringify(this.state, null, '  ')
                        )
                    )
                );
            }
        }]);

        return _class2;
    }(_react2.default.Component);
};

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/***/ }),

/***/ "./src/routes.js":
/*!***********************!*\
  !*** ./src/routes.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _reactRouter = __webpack_require__(/*! react-router */ "./node_modules/react-router/es/index.js");

var _charts = __webpack_require__(/*! ./charts */ "./src/charts.js");

var _charts2 = _interopRequireDefault(_charts);

var _table = __webpack_require__(/*! ./table */ "./src/table.js");

var _table2 = _interopRequireDefault(_table);

var _dashboard = __webpack_require__(/*! ./dashboard */ "./src/dashboard.js");

var _dashboard2 = _interopRequireDefault(_dashboard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
//import Heatmap from './heatmap'


var MENU = {
    charts: { component: _charts2.default, title: 'Charts' },
    table: { component: _table2.default, title: 'Table' },
    // heatmap: {component:Heatmap, title:'Heatmap'},
    dashboard: { component: _dashboard2.default, title: 'Dashboard' }
};

var NoMatch = function NoMatch() {
    return _react2.default.createElement(
        'div',
        null,
        'Page Not Found!'
    );
};

var Examples = function (_React$Component) {
    _inherits(Examples, _React$Component);

    function Examples() {
        _classCallCheck(this, Examples);

        return _possibleConstructorReturn(this, (Examples.__proto__ || Object.getPrototypeOf(Examples)).apply(this, arguments));
    }

    _createClass(Examples, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'g-app' },
                _react2.default.createElement(
                    'div',
                    { id: 'g-header' },
                    _react2.default.createElement(
                        'ul',
                        { id: 'g-menu' },
                        _lodash2.default.map(MENU, function (_ref, tag) {
                            var title = _ref.title,
                                component = _ref.component;
                            return _react2.default.createElement(
                                _reactRouter.Link,
                                { key: tag, activeClassName: 'current', to: { pathname: tag } },
                                title
                            );
                        }),
                        _react2.default.createElement(
                            'li',
                            null,
                            _react2.default.createElement(
                                'a',
                                { href: '/docs', target: '_blank' },
                                'API Documentation'
                            )
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    this.props.children
                )
            );
        }
    }]);

    return Examples;
}(_react2.default.Component);

Examples.propTypes = {
    children: _propTypes2.default.node
};


var Routes = _react2.default.createElement(
    _reactRouter.Route,
    { path: '/', component: Examples },
    _lodash2.default.map(MENU, function (_ref2, tag) {
        var component = _ref2.component;
        return _react2.default.createElement(_reactRouter.Route, { key: tag, path: tag, component: component });
    }),
    _react2.default.createElement(_reactRouter.Route, { path: '*', component: NoMatch })
);

exports.default = Routes;

/***/ }),

/***/ "./src/table.js":
/*!**********************!*\
  !*** ./src/table.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _table = __webpack_require__(/*! chart/components/table */ "../src/components/table.js");

var _table2 = _interopRequireDefault(_table);

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

var _imdb = __webpack_require__(/*! ../mock/imdb.json */ "./mock/imdb.json");

var _imdb2 = _interopRequireDefault(_imdb);

var _imdbNested = __webpack_require__(/*! ../mock/imdb-nested.json */ "./mock/imdb-nested.json");

var _imdbNested2 = _interopRequireDefault(_imdbNested);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DATA = _imdb2.default.data,
    KEY_LABELS = _imdb2.default.keyLabels,
    VALUE_LABELS = _imdb2.default.valueLabels;
var DATA2 = _imdbNested2.default.data,
    KEY_LABELS2 = _imdbNested2.default.keyLabels,
    VALUE_LABELS2 = _imdbNested2.default.valueLabels;


var Examples = {};

Examples.SplitTableChart = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.handleClick = function (eventInfo, matched, cfg) {
            _this.setState({ eventInfo: eventInfo, matched: matched });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(_table2.default, {
                id: 'director-split-actor-chart',
                className: 'c-flex',
                data: DATA,
                dataCfg: {
                    splitChart: 'director',
                    splitRow: ['actor', 'year'],
                    agg: ['movies', 'tvs']
                },
                keyLabels: KEY_LABELS,
                valueLabels: VALUE_LABELS,
                onClick: this.handleClick });
        }
    }]);

    return _class2;
}(_react2.default.Component);

Examples.TableChart = function (_React$Component2) {
    _inherits(_class4, _React$Component2);

    function _class4() {
        var _ref2;

        var _temp2, _this2, _ret2;

        _classCallCheck(this, _class4);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_ref2 = _class4.__proto__ || Object.getPrototypeOf(_class4)).call.apply(_ref2, [this].concat(args))), _this2), _this2.handleClick = function (eventInfo, matched, cfg) {
            _this2.setState({ matched: matched });
        }, _temp2), _possibleConstructorReturn(_this2, _ret2);
    }

    _createClass(_class4, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(_table2.default, {
                id: 'actor-chart',
                title: 'Actors',
                data: DATA2,
                dataCfg: {
                    splitRow: [['actor', 'imdb.id']],
                    agg: ['movies', 'tvs']
                },
                keyLabels: KEY_LABELS2,
                valueLabels: VALUE_LABELS2,
                onClick: this.handleClick });
        }
    }]);

    return _class4;
}(_react2.default.Component);

var _class5 = function (_React$Component3) {
    _inherits(_class5, _React$Component3);

    function _class5() {
        _classCallCheck(this, _class5);

        return _possibleConstructorReturn(this, (_class5.__proto__ || Object.getPrototypeOf(_class5)).apply(this, arguments));
    }

    _createClass(_class5, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                _lodash2.default.map(Examples, function (example, key) {
                    return _react2.default.createElement((0, _exampleFactory2.default)(example, key), { key: key });
                })
            );
        }
    }]);

    return _class5;
}(_react2.default.Component);

exports.default = _class5;

/***/ })

/******/ });
//# sourceMappingURL=app.js.map