'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _splitCharts = require('./split-charts');

var _splitCharts2 = _interopRequireDefault(_splitCharts);

var _traversal = require('../utils/traversal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var log = require('loglevel').getLogger('chart/hoc/widget-provider');

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