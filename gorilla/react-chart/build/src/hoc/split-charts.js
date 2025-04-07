'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = splitCharts;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes3 = require('../consts/prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('chart/hoc/split-charts');

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