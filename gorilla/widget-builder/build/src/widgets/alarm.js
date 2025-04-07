'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _reactNotificationSystem = require('react-notification-system');

var _reactNotificationSystem2 = _interopRequireDefault(_reactNotificationSystem);

var _widget = require('../loaders/widget');

var _widget2 = _interopRequireDefault(_widget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('alarm');

var ICON_CLASS = {
    "success": "fg-chat-2",
    "info": "fg-chat-2",
    "error": "fg-alert-2",
    "warning": "fg-alert-1"

    /**
     * Alarm
     * @constructor
     * @param {string} type - real-time data get way. 'polling' | 'webSocket'
     * @param {object} options - setting for type
     * @param {object} options.wsUrl - [webSocket] webSocket url
     * @param {object} options.query - [polling] ajax query format
     * @param {string} options.query.url - [polling] request url
     * @param {string} options.query.type - [polling] request type
     * @param {string} [options.query.data] - [polling] request body
     * @param {object} [options.delay] - [polling] polling delay seconds
     * @param {string} [options.startDttmKey] - [polling]
     * @param {string} [options.endDttmKey] - [polling]
     * @param {string} [options.timeFormat] - [polling]
     * @param {string} [options.selectKey] - [polling, webSocket] select the data array key path
     * @param {object} dataCfg.messageType - define the message type setting
     * @param {string} dataCfg.messageType.key
     * @param {object} dataCfg.messageType.valueMapping - value/type pairs for all the value, type support ['success', 'info', 'warning', 'error']
     * @param {string} dataCfg.titleKey - define the title in data
     * @param {string} dataCfg.messageKey - define the message in data
     * @param {int} autoDismiss - delay in seconds for the notification go away. Set this to 0 to not auto-dismiss the notification
     * @param {string} position - Position of the notification. Available: tr (top right), tl (top left), tc (top center), br (bottom right), bl (bottom left), bc (bottom center)
     */
};
var Alarm = function (_React$Component) {
    _inherits(Alarm, _React$Component);

    function Alarm(props) {
        _classCallCheck(this, Alarm);

        var _this = _possibleConstructorReturn(this, (Alarm.__proto__ || Object.getPrototypeOf(Alarm)).call(this, props));

        _this.state = {};
        _this.loadPollingData = _this.loadPollingData.bind(_this);
        _this.addNotifications = _this.addNotifications.bind(_this);
        return _this;
    }

    _createClass(Alarm, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.init();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            if (!_lodash2.default.isEqual(prevProps, this.props)) this.init();
        }
    }, {
        key: 'init',
        value: function init() {
            var type = this.props.type;

            if (type === 'polling') {
                this.setPolling();
            } else if (type === 'webSocket') {
                this.setWebSocket();
            } else log.error('not support type of alarm');
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var _state = this.state,
                intervalId = _state.intervalId,
                socket = _state.socket;

            if (intervalId) clearInterval(this.state.intervalId);else if (socket) socket.close();
        }
    }, {
        key: 'setPolling',
        value: function setPolling() {
            var _props$options$delay = this.props.options.delay,
                delay = _props$options$delay === undefined ? 5 : _props$options$delay;

            var intervalId = setInterval(this.loadPollingData, delay * 1000);
            var socket = this.state.socket;
            // clear setting if need

            if (socket) socket.close();
            this.setState({ intervalId: intervalId, socket: null });
        }
    }, {
        key: 'setWebSocket',
        value: function setWebSocket() {
            var _this2 = this;

            var wsUrl = this.props.options.wsUrl;

            if (!wsUrl) {
                this.addNotification({
                    messageType: 'error',
                    message: 'WebSocket Url Setting Error!',
                    title: 'Error',
                    autoDismiss: 0
                });
                return;
            }
            // Open a connection
            var socket = new WebSocket('ws://' + wsUrl.replace('ws://', ''));

            // When a connection is made
            socket.onopen = function () {
                console.log('Opened connection');
            };
            // When data is received
            socket.onmessage = function (event) {
                try {
                    var data = JSON.parse(event.data);
                    _this2.addNotifications(data);
                } catch (e) {}
            };
            socket.onerror = function (event) {
                console.error("WebSocket error observed:", event);
                _this2.addNotification({
                    messageType: 'error',
                    message: 'WebSocket Connect Failed!',
                    title: 'Error',
                    autoDismiss: 0
                });
            };
            var intervalId = this.state.intervalId;
            //clear setting if need

            if (intervalId) clearInterval(this.state.intervalId);
            this.setState({ socket: socket, intervalId: null });
        }
    }, {
        key: 'loadPollingData',
        value: function loadPollingData() {
            var _extends2;

            var _props$options = this.props.options,
                query = _props$options.query,
                _props$options$startD = _props$options.startDttmKey,
                startDttmKey = _props$options$startD === undefined ? 'startDttm' : _props$options$startD,
                _props$options$endDtt = _props$options.endDttmKey,
                endDttmKey = _props$options$endDtt === undefined ? 'endDttm' : _props$options$endDtt,
                _props$options$timeFo = _props$options.timeFormat,
                timeFormat = _props$options$timeFo === undefined ? 'YYYY-MM-DDTHH:mm:ss.SS[Z]' : _props$options$timeFo,
                selectKey = _props$options.selectKey,
                _props$options$delay2 = _props$options.delay,
                delay = _props$options$delay2 === undefined ? 5 : _props$options$delay2;

            var ajaxRequest = _extends({}, query);

            ajaxRequest.data = _extends({}, ajaxRequest.data, (_extends2 = {}, _defineProperty(_extends2, startDttmKey, (0, _moment2.default)().subtract(delay, 'seconds').utc().format(timeFormat)), _defineProperty(_extends2, endDttmKey, (0, _moment2.default)().utc().format(timeFormat)), _extends2));
            this.loadDataWithQueryConfig({ query: ajaxRequest, selectKey: selectKey });
        }
    }, {
        key: 'loadDataWithQueryConfig',
        value: function loadDataWithQueryConfig(_ref) {
            var _this3 = this;

            var ajaxRequest = _ref.query,
                selectKey = _ref.selectKey;

            _widget2.default.loadDataWithQueryConfig({ query: ajaxRequest, selectKey: selectKey }).then(function (data) {
                _this3.addNotifications(data);
            }).catch(function (error) {
                log.error('Load Polling Data Fail.', error);
            });
        }
    }, {
        key: 'addNotifications',
        value: function addNotifications(data) {
            var _this4 = this;

            log.info('Add notifications.', data);
            _lodash2.default.forEach(data, function (data) {
                var _props = _this4.props,
                    _props$dataCfg = _props.dataCfg,
                    titleKey = _props$dataCfg.titleKey,
                    messageKey = _props$dataCfg.messageKey,
                    _props$autoDismiss = _props.autoDismiss,
                    autoDismiss = _props$autoDismiss === undefined ? 2 : _props$autoDismiss;

                var _$get = _lodash2.default.get(_this4.props, 'dataCfg.messageType', {}),
                    messageTypeReference = _$get.key,
                    messageTypeValueMapping = _$get.valueMapping;

                var messageType = 'info';
                if (messageTypeReference && messageTypeValueMapping) messageType = _lodash2.default.get(messageTypeValueMapping, data[messageTypeReference], 'info');
                var title = _lodash2.default.get(data, titleKey, null);
                var message = _lodash2.default.get(data, messageKey, null);
                _this4.addNotification({
                    messageType: messageType,
                    message: message,
                    title: title,
                    autoDismiss: autoDismiss,
                    position: 'br'
                });
            });
            this.setState({ data: data });
        }
    }, {
        key: 'addNotification',
        value: function addNotification(_ref2) {
            var messageType = _ref2.messageType,
                title = _ref2.title,
                message = _ref2.message,
                autoDismiss = _ref2.autoDismiss,
                _ref2$position = _ref2.position,
                position = _ref2$position === undefined ? 'br' : _ref2$position;

            var content = _react2.default.createElement(
                'div',
                { className: 'notification-content' },
                _react2.default.createElement(
                    'div',
                    { className: 'notification-custom-icon' },
                    _react2.default.createElement('i', { className: (0, _classnames2.default)("fg", ICON_CLASS[messageType]) })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'notification-custom-content' },
                    title && _react2.default.createElement(
                        'h4',
                        { className: 'title' },
                        title
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'message' },
                        message
                    )
                )
            );
            this.notificationSystem.addNotification({
                message: content,
                level: messageType,
                autoDismiss: autoDismiss,
                position: position
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_reactNotificationSystem2.default, { ref: function ref(element) {
                        _this5.notificationSystem = element;
                    } })
            );
        }
    }]);

    return Alarm;
}(_react2.default.Component);

exports.default = Alarm;