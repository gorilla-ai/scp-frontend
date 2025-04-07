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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _reactUi = require('react-ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/components/analysis/events');

var Events = function (_React$Component) {
    _inherits(Events, _React$Component);

    function Events() {
        _classCallCheck(this, Events);

        return _possibleConstructorReturn(this, (Events.__proto__ || Object.getPrototypeOf(Events)).apply(this, arguments));
    }

    _createClass(Events, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                className = _props.className,
                eventsCfg = _props.eventsCfg,
                events = _props.events,
                selectable = _props.selectable,
                selected = _props.selected,
                onSelectionChange = _props.onSelectionChange;
            var dtCfg = eventsCfg.dt;

            var eventGroups = _lodash2.default.groupBy(events, '__data_type');

            return _react2.default.createElement(
                'div',
                { className: (0, _classnames2.default)('c-vbda-events', className) },
                _lodash2.default.map(eventGroups, function (groupEvents, dt) {
                    var fullLength = groupEvents.length === 1;
                    return _react2.default.createElement(
                        'fieldset',
                        { key: dt },
                        _react2.default.createElement(
                            'legend',
                            null,
                            dtCfg[dt].display_name || dt
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'c-flex fww' },
                            _lodash2.default.map(groupEvents, function (event) {
                                var Component = dtCfg[dt].handler.detail;
                                var eventId = event.__s_uuid;
                                return _react2.default.createElement(
                                    'div',
                                    { className: (0, _classnames2.default)('c-border c-flex c-padding event', { full: fullLength }), key: eventId },
                                    selectable && _react2.default.createElement(_reactUi.Checkbox, {
                                        checked: _lodash2.default.includes(selected, eventId),
                                        onChange: onSelectionChange.bind(null, eventId) }),
                                    _react2.default.createElement(Component, { event: event, dtCfg: dtCfg[dt], lng: _i18next2.default.language })
                                );
                            })
                        )
                    );
                })
            );
        }
    }]);

    return Events;
}(_react2.default.Component);

Events.propTypes = {
    className: _propTypes2.default.string,
    events: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.array]),
    eventsCfg: _propTypes2.default.object,
    selectable: _propTypes2.default.bool,
    selected: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onSelectionChange: _propTypes2.default.func
};
exports.default = Events;