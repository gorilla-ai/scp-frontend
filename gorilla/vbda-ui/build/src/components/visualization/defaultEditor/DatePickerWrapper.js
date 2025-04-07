'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _datePicker = require('react-ui/build/src/components/date-picker');

var _datePicker2 = _interopRequireDefault(_datePicker);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DataPickerWrapper = _react2.default.createClass({
    displayName: 'DataPickerWrapper',

    propTypes: {},
    getDefaultProps: function getDefaultProps() {
        return {};
    },
    getInitialState: function getInitialState() {
        return {};
    },
    handleChange: function handleChange(value) {
        if (this.props.enableTime) value = (0, _moment2.default)(value).utcOffset('+0800').format('YYYY-MM-DDTHH:mm:ssZ');
        this.props.onChange(value);
    },
    render: function render() {
        // const value = moment(this.props.value).format('YYYY-MM-DD HH:mm:ss')
        return _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(_datePicker2.default, _extends({}, this.props, {
                onChange: this.handleChange
            }))
        );
    }
});

exports.default = DataPickerWrapper;