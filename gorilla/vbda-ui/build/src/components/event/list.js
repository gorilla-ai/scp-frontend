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

var _popupDialog = require('react-ui/build/src/components/popup-dialog');

var _popupDialog2 = _interopRequireDefault(_popupDialog);

var _event = require('./event');

var _event2 = _interopRequireDefault(_event);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda-examples/event/list');

/**
 * EventList
 * @constructor
 * @param {string} [id] - EventList dom element #id
 * @param {string} [className] - Classname for the search
 * @param {string} lng -
 * @param {array.<object>} - data
 * @param {object} cfg -
 * @param {object} cfg.ds -
 * @param {object} cfg.dt -
 * @param {object} cfg.renders -
 *
 * @example

import EventList from 'vbda/components/list'

 */

var EventList = function (_React$Component) {
    _inherits(EventList, _React$Component);

    function EventList() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, EventList);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = EventList.__proto__ || Object.getPrototypeOf(EventList)).call.apply(_ref, [this].concat(args))), _this), _this.openEventDetails = function (event) {
            var _this$props = _this.props,
                cfg = _this$props.cfg,
                lng = _this$props.lng;


            _popupDialog2.default.alert({
                display: _react2.default.createElement(_event2.default, {
                    details: true,
                    lng: lng,
                    event: event,
                    cfg: cfg })
            });
        }, _this.renderEventSummary = function (event) {
            var _this$props2 = _this.props,
                cfg = _this$props2.cfg,
                lng = _this$props2.lng;


            return _react2.default.createElement(
                'span',
                {
                    key: event._id,
                    className: 'c-link',
                    onClick: _this.openEventDetails.bind(_this, event) },
                _react2.default.createElement(_event2.default, {
                    cfg: cfg,
                    lng: lng,
                    event: event })
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(EventList, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                cfg = _props.cfg,
                id = _props.id,
                className = _props.className,
                events = _props.events;


            if (!cfg || _lodash2.default.isEmpty(cfg)) {
                return _react2.default.createElement(
                    'div',
                    null,
                    'loading...'
                );
            }
            return _react2.default.createElement(
                'div',
                {
                    id: id,
                    className: (0, _classnames2.default)('c-vbda-events', className) },
                _lodash2.default.map(events, function (e) {
                    return _this2.renderEventSummary(e);
                })
            );
        }
    }]);

    return EventList;
}(_react2.default.Component);

EventList.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    lng: _propTypes2.default.string,
    events: _propTypes2.default.objectOf(_propTypes2.default.object),
    cfg: _propTypes2.default.shape({
        ds: _propTypes2.default.objectOf(_propTypes2.default.shape({
            display_name: _propTypes2.default.string,
            dt: _propTypes2.default.arrayOf(_propTypes2.default.string)
        })),
        dt: _propTypes2.default.objectOf(_propTypes2.default.shape({
            display_name: _propTypes2.default.string,
            renderSummary: _propTypes2.default.string,
            renderDetails: _propTypes2.default.string
        })),
        renders: _propTypes2.default.objectOf(_propTypes2.default.shape({
            type: _propTypes2.default.string, //React.PropTypes.oneOf(['detail','custom']),
            vis: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func])
        }))
    })
};
exports.default = EventList;