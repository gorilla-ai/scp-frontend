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

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _table = require('react-ui/build/src/components/table');

var _table2 = _interopRequireDefault(_table);

var _widgetProvider = require('../hoc/widget-provider');

var _widgetProvider2 = _interopRequireDefault(_widgetProvider);

var _traversal = require('../utils/traversal');

var _propTypes3 = require('../consts/prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//import PageNav from '../page-nav'

var log = require('loglevel').getLogger('chart/components/table');

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