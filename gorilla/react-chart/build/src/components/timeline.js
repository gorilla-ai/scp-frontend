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

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _vis = require('vis');

var _vis2 = _interopRequireDefault(_vis);

require('vis/dist/vis.css');

var _widgetProvider = require('../hoc/widget-provider');

var _widgetProvider2 = _interopRequireDefault(_widgetProvider);

var _propTypes3 = require('../consts/prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('chart/components/timeline');

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
                tooltip = _this$props.tooltip;


            var cfg = { dataCfg: dataCfg, keyLabels: keyLabels, valueLabels: valueLabels };

            var data = (0, _lodash2.default)(propData).map(function (el) {
                var eventInfo = {
                    matched: 1,
                    splitGroup: _lodash2.default.get(el, dataCfg.splitGroup),
                    timeStart: _lodash2.default.get(el, dataCfg.timeStart || 'timeStart'),
                    timeEnd: _lodash2.default.get(el, dataCfg.timeEnd || dataCfg.timeStart || 'timeStart'),
                    agg: (0, _lodash2.default)(el).pick(dataCfg.agg).values().map(_lodash2.default.toString).value()
                };

                var _tooltip$enabled = tooltip.enabled,
                    enableTooltip = _tooltip$enabled === undefined ? true : _tooltip$enabled,
                    tooltipFormatter = tooltip.formatter;

                var tooltipStr = enableTooltip ? _server2.default.renderToStaticMarkup(tooltipFormatter.apply(_this, [eventInfo, el, cfg])) : null;

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
                    title: tooltipStr,
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
                showTooltips: !!_this.props.tooltip,
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
    tooltip: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        formatter: _propTypes2.default.func
    }),
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
    tooltip: {
        enabled: true
    }
};
var Timeline = (0, _widgetProvider2.default)(BaseTimeline);

exports.default = Timeline;