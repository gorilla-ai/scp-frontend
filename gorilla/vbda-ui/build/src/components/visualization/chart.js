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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _pie = require('react-chart/build/src/components/pie');

var _pie2 = _interopRequireDefault(_pie);

var _area = require('react-chart/build/src/components/area');

var _area2 = _interopRequireDefault(_area);

var _bar = require('react-chart/build/src/components/bar');

var _bar2 = _interopRequireDefault(_bar);

var _line = require('react-chart/build/src/components/line');

var _line2 = _interopRequireDefault(_line);

var _table = require('react-chart/build/src/components/table');

var _table2 = _interopRequireDefault(_table);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/components/visualization/chart');

/**
 * Result Chart
 * @constructor
 * @param {string} [id] - Chart dom element #id
 * @param {string} [className] - Classname for the chart
 * @param {string} lng -
 * @param {array.<object>} data -
 * @param {object} cfg -
 * @param {string} cfg.name -
 * @param {'pie'|'area'|'line'|'bar'|'table'} cfg.chartType -
 * @param {object} cfg.dataCfg -
 * @param {object} [cfg.keyLocales] -
 * @param {object} [cfg.valueLocales] -
 *
 * @example

import _ from 'lodash'
import Chart from 'vbda/components/visualization/chart'

React.createClass({
    getInitialState() {
        return {
            data:[
                {_id:'xxxx',_index:'netflow-out-...', type:'logs', _source:{}},
                {_id:'yyyy',_index:'netflow-out-...', type:'logs', _source:{}}
            ]
        }
    },
    render() {
        const {data} = this.state
        return <Chart
            id='t1'
            lng='en_us'
            data={data}
            cfg={{
                chartType:'pie',
                name:'Netflow Pie',
                dataCfg:{
                    splitSlice:[
                        '_source.geoip_src_ipv4_dst_addr.country_name',
                        '_source.geoip_src_ipv4_dst_addr.city_name'
                    ],
                    sliceSize:'_source.netflow.in_pkts'
                },
                keyLocales:{
                    zh:{
                        '_source.geoip_src_ipv4_dst_addr.country_name':'國家',
                        '_source.geoip_src_ipv4_dst_addr.city_name':'城市',
                        '_source.netflow.in_pkts':'流量'
                    },
                    en:{
                        '_source.geoip_src_ipv4_dst_addr.country_name':'Country',
                        '_source.geoip_src_ipv4_dst_addr.city_name':'City',
                        '_source.netflow.in_pkts':'Traffic'
                    }
                },
                valueLocales:{
                    zh:{
                        '_source.geoip_src_ipv4_dst_addr.country_name':{
                          'Taiwan':'台灣'
                        }
                    }
                }
            }} />
    }
})
 */

var Chart = function (_React$Component) {
    _inherits(Chart, _React$Component);

    function Chart() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Chart);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Chart.__proto__ || Object.getPrototypeOf(Chart)).call.apply(_ref, [this].concat(args))), _this), _this.handleClick = function (eventInfo, data, cfg) {
            var onClick = _this.props.onClick;

            onClick && onClick(data);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Chart, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                className = _props.className,
                data = _props.data,
                cfg = _props.cfg,
                lng = _props.lng;

            var chartType = cfg.chartType,
                name = cfg.name,
                dataCfg = cfg.dataCfg,
                _cfg$keyLocales = cfg.keyLocales,
                keyLocales = _cfg$keyLocales === undefined ? {} : _cfg$keyLocales,
                _cfg$valueLocales = cfg.valueLocales,
                valueLocales = _cfg$valueLocales === undefined ? {} : _cfg$valueLocales,
                others = _objectWithoutProperties(cfg, ['chartType', 'name', 'dataCfg', 'keyLocales', 'valueLocales']);

            var Component = void 0;
            switch (chartType) {
                case 'pie':
                    Component = _pie2.default;break;
                case 'area':
                    Component = _area2.default;break;
                case 'line':
                    Component = _line2.default;break;
                case 'bar':
                    Component = _bar2.default;break;
                case 'table':
                    Component = _table2.default;break;
                default:
                    return _react2.default.createElement(
                        'div',
                        { className: 'c-error' },
                        'Chart type ',
                        chartType,
                        ' not supported'
                    );
            }

            var props = _extends({
                id: id,
                className: (0, _classnames2.default)('c-vbda-chart', className),
                data: data, //parseAgg(agg, data),
                title: name,
                dataCfg: dataCfg,
                keyLabels: keyLocales[lng],
                valueLabels: valueLocales[lng],
                onClick: this.handleClick
            }, others);
            return _react2.default.createElement(Component, props);
        }
    }]);

    return Chart;
}(_react2.default.Component);

Chart.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    lng: _propTypes2.default.string,
    data: _propTypes2.default.arrayOf(_propTypes2.default.object),
    cfg: _propTypes2.default.shape({
        //agg: React.PropTypes.object,
        name: _propTypes2.default.string,
        chartType: _propTypes2.default.oneOf(['pie', 'area', 'line', 'bar', 'table']),
        dataCfg: _propTypes2.default.object,
        keyLocales: _propTypes2.default.objectOf(_propTypes2.default.object),
        valueLocales: _propTypes2.default.objectOf(_propTypes2.default.objectOf(_propTypes2.default.object))
    })
};
Chart.defaultProps = {};
exports.default = Chart;