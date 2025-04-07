'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _flatpickr = require('flatpickr');

var _flatpickr2 = _interopRequireDefault(_flatpickr);

var _flatpickrMin = require('flatpickr/dist/flatpickr.min.css');

var _flatpickrMin2 = _interopRequireDefault(_flatpickrMin);

var _zh = require('flatpickr/dist/l10n/zh');

var _popover = require('./popover');

var _popover2 = _interopRequireDefault(_popover);

var _propWire = require('../hoc/prop-wire');

var _propTypes3 = require('../consts/prop-types');

var _inputHelper = require('../utils/input-helper');

var _inputHelper2 = _interopRequireDefault(_inputHelper);

var _date = require('../utils/date');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // eslint-disable-line no-unused-vars

// Add more locales here


var log = require('loglevel').getLogger('react-ui/components/date-picker');

var DATE_TIME_SUFFIX = {
    daySuffix: /(st)|(nd)|(rd)|(th)/g,
    timeSuffix: /(AM)|(PM)/ig

    /**
     * A React DatePicker Component, containing validating the input date<br>
     * Uses [flatpickr]{@link https://chmln.github.io/flatpickr/#options}
     *
     * @constructor
     * @param {string} [id] - Container element #id
     * @param {string} [className] - Classname for the container
     * @param {string} [defaultValue] - Default selected date
     * @param {string} [value] - Current selected date
     * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
     * @param {*} valueLink.value - value to update
     * @param {function} valueLink.requestChange - function to request value change
     * @param {boolean} [allowKeyIn=true] - Allow user key in to the from/to input?
     * @param {boolean} [disabled=false] - Is this field disabled?
     * @param {boolean} [readOnly=false] - Is this field readonly?
     * @param {boolean} [required=false] - Is this field required?
     * @param {function} [onChange] - Callback function when date is changed. <br> Required when value prop is supplied
     * @param {string} onChange.value - current value
     * @param {object} onChange.eventInfo - event related info
     * @param {object} onChange.eventInfo.before - previously enetered value
     * @param {string} [dateFormat='Y-m-d'] - Date format. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
     * @param {string} [timeFormat='H:i'] - Time format. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
     * @param {boolean} [enableTime=false] - Enable selection and display of time
     * @param {boolean} [enableAMPM=false] - Enable AM/PM option on calendar
     * @param {string} [locale] - Datepicker locale. Values can be 'en', 'zh', etc. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
     * @param {fuction} [t] - Transform/translate error into readable message.<br>
     * @param {object} t.params - Parameters relevant to the error code
     * @param {string} t.params.field - offending field id
     * @param {string} t.params.value - offending field value
     * @param {string} t.params.pattern - pattern the value was supposed to follow
     *
     * @example
    // controlled
    
    import {DatePicker} from 'react-ui'
    
    React.createClass({
        getInitialState() {
            return {
                date: '2017-03-20',
                datetime: '2017-03-20 16:01'
            }
        },
        handleChange(field, value) {
            this.setState({[field]: value})
        },
        render() {
            let {date, datetime} = this.state;
            return <div className='c-form'>
                <div>
                    <label htmlFor='date'>Select Date</label>
                    <DatePicker id='date'
                        onChange={this.handleChange.bind(this,'date')}
                        value={date}
                        t={(code, params) => {
                            if (code === 'missing')
                                return `Please input date`
                            else {
                                return `Invalid date format. Should be ${params.pattern}`
                            }
                        }}/>
                </div>
                <div>
                    <label htmlFor='datetime'>Select Date Time</label>
                    <DatePicker id='datetime'
                        onChange={this.handleChange.bind(this,'datetime')}
                        enableTime={true}
                        value={datetime}
                        t={(code, params) => {
                            if (code === 'missing')
                                return `Please input date`
                            else {
                                return `Invalid date format. Should be ${params.pattern}`
                            }
                        }}/>
                </div>
            </div>
        }
    })
     */

};
var DatePicker = function (_React$Component) {
    _inherits(DatePicker, _React$Component);

    function DatePicker(props) {
        _classCallCheck(this, DatePicker);

        var _this = _possibleConstructorReturn(this, (DatePicker.__proto__ || Object.getPrototypeOf(DatePicker)).call(this, props));

        _this.strToTimestamp = function (str) {
            var enableTime = _this.props.enableTime;

            var parsedStr = str.replace(DATE_TIME_SUFFIX.daySuffix, '');
            var momentFormat = enableTime ? _this.FORMAT.date + ' ' + _this.FORMAT.time : _this.FORMAT.date;
            return (0, _moment2.default)(parsedStr, momentFormat).valueOf();
        };

        _this.handleChange = function () {
            var onChange = _this.props.onChange;

            onChange(_this.date.value);
        };

        _this.handleInputChange = function (evt) {
            var required = _this.props.required;

            var newDate = evt.target.value;

            // Remove the day suffix since Date can't resolve it
            var parseDate = _this.strToTimestamp(newDate);

            var isValid = _this.validateDateFormat(newDate);
            var errMsg = _this.generateErrorMsg(newDate);

            if (!isNaN(parseDate)) {
                // Move the calendar view to the current value's location
                _this.datePicker.jumpToDate(parseDate);

                if (isValid) {
                    _popover2.default.close();

                    // setDate() accepts date string & Date object
                    // If set the 2nd parameter as true, it will recursively call itself here
                    _this.datePicker.setDate(parseDate, false);
                    _this.handleChange();
                } else {
                    _popover2.default.open(evt, _react2.default.createElement(
                        'span',
                        null,
                        errMsg
                    ), { pointy: true });
                }
            } else {
                if (required || newDate !== '') {
                    _popover2.default.open(evt, _react2.default.createElement(
                        'span',
                        null,
                        errMsg
                    ), { pointy: true });
                } else {
                    _popover2.default.close();
                }
            }
        };

        _this.handleBlur = function (evt) {
            _popover2.default.close();

            var newDate = evt.target.value;

            var isValid = _this.validateDateFormat(newDate);
            var prevDate = _this.state.prevDate;
            var required = _this.props.required;


            if (isValid) {
                // Prevent requiring double-click when select date
                if (newDate !== prevDate) {
                    _this.datePicker.setDate(newDate);
                    _this.setState({ prevDate: newDate });
                }
            } else {
                // Reset to previous valid value
                if (required) {
                    _this.datePicker.setDate(prevDate);
                } else {
                    _this.datePicker.setDate('');
                    _this.handleChange();
                }
            }
        };

        _this.validateDateFormat = function (dateStr) {
            var enableTime = _this.props.enableTime;

            var isValid = false;

            if (enableTime) {
                isValid = (0, _moment2.default)(dateStr, _this.FORMAT.date + ' ' + _this.FORMAT.time, true).isValid();

                // Momentjs validation accepts single (a|A|p|P) for AM/PM
                // This is for ensuring user input complete 'AM/PM' term when AM/PM is enabled
                if (_this.FORMAT.time.indexOf('A') !== -1 && dateStr.search(DATE_TIME_SUFFIX.timeSuffix) === -1) {
                    isValid = false;
                }
            } else {
                isValid = (0, _moment2.default)(dateStr, '' + _this.FORMAT.date, true).isValid();
            }

            return isValid;
        };

        _this.generateErrorMsg = function (dateStr) {
            var _this$props = _this.props,
                id = _this$props.id,
                enableTime = _this$props.enableTime,
                required = _this$props.required,
                t = _this$props.t;

            var datePattern = _this.FORMAT.date,
                timePattern = _this.FORMAT.time.indexOf('A') !== -1 ? _this.FORMAT.time.replace('A', 'AM/PM') : _this.FORMAT.time;

            var pattern = enableTime ? datePattern + ' ' + timePattern : datePattern;

            return _inputHelper2.default.validateField(dateStr, { name: id, type: 'date', required: required, pattern: pattern }, t ? { et: t } : true);
        };

        var value = props.value;


        _this.state = {
            prevDate: value
        };
        return _this;
    }

    _createClass(DatePicker, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var _props = this.props,
                dateFormat = _props.dateFormat,
                timeFormat = _props.timeFormat,
                enableTime = _props.enableTime,
                enableAMPM = _props.enableAMPM,
                allowInput = _props.allowKeyIn,
                locale = _props.locale;


            var loc = null;
            switch (locale) {
                case 'zh':
                    loc = _zh.Mandarin;break;
                default:
                    loc = null;
            }

            this.FORMAT = (0, _date.flatpickrToMomentToken)(dateFormat, timeFormat, enableTime);

            if (enableTime) {
                dateFormat = dateFormat + ' ' + timeFormat;
            }

            this.datePicker = (0, _flatpickr2.default)(this.date, {
                enableTime: enableTime,
                allowInput: allowInput,
                dateFormat: dateFormat,
                locale: loc,
                time_24hr: !enableAMPM,
                onChange: function onChange() {
                    _this2.handleChange();
                }
            });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var value = nextProps.value,
                locale = nextProps.locale;


            var loc = null;
            switch (locale) {
                case 'zh':
                    loc = _zh.Mandarin;break;
                default:
                    loc = null;
            }

            this.datePicker.set('locale', loc);
            this.datePicker.setDate(this.strToTimestamp(value), false);
            this.setState({
                prevDate: value
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.datePicker.destroy();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props,
                id = _props2.id,
                value = _props2.value,
                className = _props2.className,
                readOnly = _props2.readOnly,
                disabled = _props2.disabled,
                required = _props2.required,
                allowKeyIn = _props2.allowKeyIn;


            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-date-picker', className) },
                _react2.default.createElement('input', {
                    id: id,
                    type: 'text',
                    ref: function ref(_ref) {
                        _this3.date = _ref;
                    },
                    disabled: disabled,
                    readOnly: readOnly,
                    required: required,
                    onChange: allowKeyIn ? this.handleInputChange : null,
                    onBlur: this.handleBlur,
                    defaultValue: value }),
                _react2.default.createElement('i', { className: 'fg fg-calendar', onClick: function onClick() {
                        _this3.date.focus();
                    } })
            );
        }
    }]);

    return DatePicker;
}(_react2.default.Component);

DatePicker.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    value: _propTypes3.SIMPLE_VALUE_PROP,
    allowKeyIn: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    readOnly: _propTypes2.default.bool,
    required: _propTypes2.default.bool,
    onChange: _propTypes2.default.func,
    dateFormat: _propTypes2.default.string,
    timeFormat: _propTypes2.default.string,
    enableTime: _propTypes2.default.bool,
    enableAMPM: _propTypes2.default.bool,
    locale: _propTypes2.default.string,
    t: _propTypes2.default.func
};
DatePicker.defaultProps = {
    dateFormat: 'Y-m-d',
    timeFormat: 'H:i',
    disabled: false,
    readOnly: false,
    required: false,
    allowKeyIn: true,
    enableTime: false,
    enableAMPM: false,
    locale: 'en'
};
exports.default = (0, _propWire.wireValue)(DatePicker);