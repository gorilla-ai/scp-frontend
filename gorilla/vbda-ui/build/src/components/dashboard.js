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

var _propTypes3 = require('react-chart/build/src/consts/prop-types');

var _dashboard = require('react-chart/build/src/components/dashboard');

var _dashboard2 = _interopRequireDefault(_dashboard);

var _chart = require('./visualization/chart');

var _chart2 = _interopRequireDefault(_chart);

var _esAgg = require('../parser/es-agg');

var _esAgg2 = _interopRequireDefault(_esAgg);

var _ajaxHelper = require('react-ui/build/src/utils/ajax-helper');

var _ajaxHelper2 = _interopRequireDefault(_ajaxHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/components/dashboard');

/**
 * VBDA dashboard
 * @constructor
 * @param {string} [id] - Dashboard dom element #id
 * @param {string} [className] - Classname for the dashboard
 * @param {object} [cfg] - Config for this dashboard
 *
 * @example

import cfg from '../mock/dashboard.json'
import Dashboard from 'vbda/components/dashboard'

React.createClass({
    render() {
        return <Dashboard
            cfg={config}
            url='/api/vbda/es'
            lng='en_us' />
    }
})

 */

var Dashboard = function (_React$Component) {
    _inherits(Dashboard, _React$Component);

    function Dashboard() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Dashboard);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Dashboard.__proto__ || Object.getPrototypeOf(Dashboard)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            data: {}
        }, _this.renderWidget = function (id, cfg, data) {
            if (!data) {
                return _react2.default.createElement(
                    'div',
                    { id: id, key: id },
                    'No data for ',
                    id
                );
            }

            var lng = _this.props.lng;

            var search = cfg.search,
                name = cfg.title,
                chartType = cfg.type,
                others = _objectWithoutProperties(cfg, ['search', 'title', 'type']);

            log.info('parsed', (0, _esAgg2.default)(search.body, data));

            return _react2.default.createElement(_chart2.default, {
                id: id,
                key: id,
                lng: lng,
                data: (0, _esAgg2.default)(search.body, data),
                cfg: _extends({
                    name: name, chartType: chartType }, others) });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Dashboard, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var _props$cfg = this.props.cfg,
                query = _props$cfg.query,
                widgets = _props$cfg.widgets;


            _ajaxHelper2.default.all(_lodash2.default.map(widgets, function (v) {
                return {
                    type: 'POST',
                    url: '/api/vbda/es',
                    data: {
                        search: JSON.stringify(_lodash2.default.merge({ body: { query: query } }, v.search))
                    }
                };
            })).then(function (data) {
                log.info('load done', data);
                var i = 0;
                var result = _lodash2.default.mapValues(widgets, function (v, k) {
                    return data[i++];
                });
                _this2.setState({ data: result });
            }).catch(function (err) {
                log.error(err.message);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props$cfg2 = this.props.cfg,
                widgets = _props$cfg2.widgets,
                layout = _props$cfg2.layout;
            var data = this.state.data;

            var longest = _lodash2.default.maxBy(_lodash2.default.values(layout), function (l) {
                return l.x + l.w;
            });
            return _react2.default.createElement(
                _dashboard2.default,
                {
                    layoutCfg: {
                        cols: longest.x + longest.w,
                        layout: _lodash2.default.map(widgets, function (w, key) {
                            return layout[key];
                        })
                    } },
                _lodash2.default.map(widgets, function (w, key) {
                    return _this3.renderWidget(key, w, data[key]);
                })
            );
        }
    }]);

    return Dashboard;
}(_react2.default.Component);

Dashboard.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    lng: _propTypes2.default.string,
    url: _propTypes2.default.string,
    cfg: _propTypes2.default.shape({
        title: _propTypes2.default.string,
        query: _propTypes2.default.object,
        layout: _propTypes2.default.objectOf(_propTypes2.default.shape({
            x: _propTypes2.default.number,
            y: _propTypes2.default.number,
            w: _propTypes2.default.number,
            h: _propTypes2.default.number
        })),
        widgets: _propTypes2.default.objectOf(_propTypes2.default.shape({
            search: _propTypes2.default.shape({
                index: _propTypes2.default.string.isRequired,
                type: _propTypes2.default.string,
                body: _propTypes2.default.object
            }),
            type: _propTypes2.default.string,
            style: _propTypes2.default.object,
            title: _propTypes2.default.string,
            dataCfg: _propTypes2.default.object,
            keyLocales: _propTypes2.default.objectOf(_propTypes3.DATA_ITEM_PROP),
            valueLocales: _propTypes2.default.objectOf(_propTypes2.default.objectOf(_propTypes3.DATA_ITEM_PROP))
        })).isRequired
    }).isRequired
};
exports.default = Dashboard;