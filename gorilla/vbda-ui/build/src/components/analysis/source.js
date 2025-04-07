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

var _reactUi = require('react-ui');

var _labels = require('./labels');

var _labels2 = _interopRequireDefault(_labels);

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _analyzer = require('../../analyzer');

var _localeProvider = require('../../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/components/analysis/source');

var lt = global.vbdaI18n.getFixedT(null, 'analysis');
var gt = global.vbdaI18n.getFixedT(null, 'vbda');

var Source = function (_React$Component) {
    _inherits(Source, _React$Component);

    function Source() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Source);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Source.__proto__ || Object.getPrototypeOf(Source)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            source: {},
            currentLabel: null,
            selectedEvents: []
        }, _this.analyzeEvents = function (events) {
            var _this$props = _this.props,
                eventsCfg = _this$props.eventsCfg,
                analyzeCfg = _this$props.analyze;
            var currentLabel = _this.state.currentLabel;


            _reactUi.Progress.startSpin();
            var source = (0, _analyzer.analyze)(events, eventsCfg, _extends({}, analyzeCfg, { analyzeLinks: false }));
            _reactUi.Progress.done();
            _this.setState({
                source: source,
                currentLabel: currentLabel && _lodash2.default.has(source.labels, currentLabel) ? currentLabel : null
            });
        }, _this.handleLabelClick = function (labelId) {
            _this.setState({ currentLabel: labelId });
        }, _this.handleEventToggle = function (eventId, selected) {
            var selectedEvents = _this.state.selectedEvents;

            var newSelectedEvents = selected ? [].concat(_toConsumableArray(selectedEvents), [eventId]) : _lodash2.default.without(selectedEvents, eventId);
            _this.setState({ selectedEvents: newSelectedEvents });
        }, _this.renderEvents = function () {
            var _this$props2 = _this.props,
                eventsCfg = _this$props2.eventsCfg,
                events = _this$props2.events,
                selectable = _this$props2.selectable;
            var _this$state = _this.state,
                _this$state$source = _this$state.source,
                labels = _this$state$source.labels,
                nodes = _this$state$source.nodes,
                currentLabelId = _this$state.currentLabel,
                selectedEvents = _this$state.selectedEvents;


            var currentLabel = labels[currentLabelId];
            var currentEvents = currentLabel ? _lodash2.default.pick(events, nodes[currentLabel.nodeId].events) : {};

            return _react2.default.createElement(_events2.default, {
                className: 'content h0',
                events: currentEvents,
                eventsCfg: eventsCfg,
                selectable: selectable,
                selected: selectedEvents,
                onSelectionChange: _this.handleEventToggle });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Source, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            setTimeout(function () {
                _this2.analyzeEvents(_this2.props.events);
            }, 0);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (this.props.events !== nextProps.events) {
                this.analyzeEvents(nextProps.events);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                eventsCfg = _props.eventsCfg,
                className = _props.className,
                action = _props.action;
            var _state = this.state,
                source = _state.source,
                currentLabel = _state.currentLabel,
                selectedEvents = _state.selectedEvents;


            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)(className, 'c-flex c-join vertical c-vbda-source') },
                _react2.default.createElement(
                    'div',
                    { className: 'c-box labels fixed' },
                    _react2.default.createElement(
                        'header',
                        null,
                        lt('hdr-intel-list')
                    ),
                    _lodash2.default.isEmpty(source) ? _react2.default.createElement(
                        'div',
                        { className: 'content' },
                        gt('txt-loading')
                    ) : _react2.default.createElement(_labels2.default, {
                        className: 'content nopad',
                        source: source,
                        sourceCfg: eventsCfg,
                        hilited: [currentLabel],
                        onClick: this.handleLabelClick })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'c-box grow source' },
                    _react2.default.createElement(
                        'header',
                        { className: 'c-flex aic' },
                        lt('hdr-source'),
                        action && _react2.default.createElement(
                            'button',
                            { className: (0, _classnames2.default)('end', action.className), onClick: action.handler.bind(null, selectedEvents) },
                            action.text
                        )
                    ),
                    !_lodash2.default.isEmpty(source) && this.renderEvents()
                )
            );
        }
    }]);

    return Source;
}(_react2.default.Component);

Source.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    events: _propTypes2.default.objectOf(_propTypes2.default.object),
    eventsCfg: _propTypes2.default.shape({
        dt: _propTypes2.default.object
    }).isRequired,
    analyze: _propTypes2.default.object,
    selectable: _propTypes2.default.bool,
    action: _propTypes2.default.shape({
        className: _propTypes2.default.string,
        text: _propTypes2.default.node,
        handler: _propTypes2.default.func
    })
};
Source.defaultProps = {
    events: {},
    eventsCfg: {},
    analyze: {},
    selectable: false
};
exports.default = (0, _localeProvider2.default)(Source);