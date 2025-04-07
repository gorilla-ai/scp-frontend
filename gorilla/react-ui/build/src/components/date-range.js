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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // eslint-disable-line no-unused-vars

// Add more locales here


var log = require('loglevel').getLogger('react-ui/components/date-range');

var DATE_PROP_TYPE = _propTypes2.default.shape({
    from: _propTypes3.SIMPLE_VALUE_PROP,
    to: _propTypes3.SIMPLE_VALUE_PROP
});

var DATE_TIME_SUFFIX = {
    daySuffix: /(st)|(nd)|(rd)|(th)/g,
    timeSuffix: /(AM)|(PM)/ig

    /**
     * A React DateRange Component, containing a 'from' date input and a 'to' date input<br>
     * Uses [flatpickr]{@link https://chmln.github.io/flatpickr/#options}
     *
     * @constructor
     * @param {string} [id] - Container element #id
     * @param {string} [className] - Classname for the container
     * @param {object} [defaultValue] - Default selected range
     * @param {string} defaultValue.from - Default selected from
     * @param {string} defaultValue.to - Default selected to
     * @param {object} [value] - Current selected range
     * @param {string} value.from - Current selected from
     * @param {string} value.to - Current selected to
     * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
     * @param {*} valueLink.value - value to update
     * @param {function} valueLink.requestChange - function to request value change
     * @param {boolean} [allowKeyIn=true] - Allow user key in to the from/to input?
     * @param {boolean} [disabled=false] - Is this field disabled?
     * @param {boolean} [readOnly=false] - Is this field readonly?
     * @param {boolean} [required=false] - Is this field required?
     * @param {function} [onChange] - Callback function when from/to is changed. <br> Required when value prop is supplied
     * @param {object} onChange.value - current value
     * @param {string} onChange.value.from - current from
     * @param {string} onChange.value.to - current to
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
    
    import {DateRange} from 'react-ui'
    
    React.createClass({
        getInitialState() {
            return {
                date:{
                    from:'2012-04-26',
                    to:'2012-10-26'
                },
                datetime:{
                    from:'2012-10-26 12:00',
                    to:'2012-10-26 17:00'
                }
            }
        },
        handleChange(field, value) {
            this.setState({[field]:value})
        },
        render() {
            let {date, datetime} = this.state;
            return <div className='c-form'>
                <div>
                    <label htmlFor='date'>Select Date Range</label>
                    <DateRange id='date'
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
                    <label htmlFor='datetime'>Select Date Time Range</label>
                    <DateRange id='datetime'
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
var DateRange = function (_React$Component) {
    _inherits(DateRange, _React$Component);

    function DateRange(props) {
        _classCallCheck(this, DateRange);

        var _this = _possibleConstructorReturn(this, (DateRange.__proto__ || Object.getPrototypeOf(DateRange)).call(this, props));

        _this.strToTimestamp = function (str) {
            var enableTime = _this.props.enableTime;

            var parsedStr = str.replace(DATE_TIME_SUFFIX.daySuffix, '');
            var momentFormat = enableTime ? _this.FORMAT.date + ' ' + _this.FORMAT.time : _this.FORMAT.date;
            return (0, _moment2.default)(parsedStr, momentFormat).valueOf();
        };

        _this.handleChange = function () {
            var onChange = _this.props.onChange;

            onChange({ from: _this.dateFrom.value, to: _this.dateTo.value });
        };

        _this.handleInputChange = function (type, evt) {
            var required = _this.props.required;

            var newDate = evt.target.value;

            // Remove the day suffix since Date can't resolve it
            var parseDate = _this.strToTimestamp(newDate);

            var isValid = _this.validateDateFormat(newDate);
            var errMsg = _this.generateErrorMsg(type, newDate);

            if (!isNaN(parseDate)) {
                // Move the calendar view to the current value's location
                _this.datePicker[type].jumpToDate(parseDate);

                if (isValid) {
                    _popover2.default.closeId('err-' + type);

                    // setDate() accepts date string & Date object
                    // If set the 2nd parameter as true, it will recursively call itself here
                    _this.datePicker[type].setDate(parseDate, false);
                    _this.handleChange();

                    _this.checkCross(type);
                } else {
                    _popover2.default.openId('err-' + type, evt, _react2.default.createElement(
                        'span',
                        null,
                        errMsg
                    ), { pointy: true });
                }
            } else {
                if (required || newDate !== '') {
                    _popover2.default.openId('err-' + type, evt, _react2.default.createElement(
                        'span',
                        null,
                        errMsg
                    ), { pointy: true });
                } else {
                    _popover2.default.closeId('err-' + type);
                }
            }
        };

        _this.handleBlur = function (type, evt) {
            _popover2.default.closeId('err-' + type);

            var newDate = evt.target.value;

            var isValid = _this.validateDateFormat(newDate);
            var field = type === 'from' ? 'prevFrom' : 'prevTo';
            var prevDate = type === 'from' ? _this.state.prevFrom : _this.state.prevTo;
            var required = _this.props.required;


            if (isValid) {
                // Prevent requiring double-click when select date
                if (newDate !== prevDate) {
                    _this.datePicker[type].setDate(newDate);
                    _this.setState(_defineProperty({}, field, newDate));
                }

                _this.checkCross(type);
            } else {
                // Reset to previous valid value
                if (required) {
                    _this.datePicker[type].setDate(prevDate);
                } else {
                    _this.datePicker[type].setDate('');
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

        _this.checkCross = function (type) {
            var dateFrom = _this.strToTimestamp(_this.dateFrom.value),
                dateTo = _this.strToTimestamp(_this.dateTo.value);

            if (dateFrom !== dateTo) {
                if (type === 'from') {
                    var isAfter = (0, _moment2.default)(dateFrom).isAfter(dateTo);

                    if (isAfter) {
                        _this.datePicker.to.setDate(dateFrom, false);
                        _this.handleChange();
                    }
                } else {
                    var isBefore = (0, _moment2.default)(dateTo).isBefore(dateFrom);

                    if (isBefore) {
                        _this.datePicker.from.setDate(dateTo, false);
                        _this.handleChange();
                    }
                }
            }
        };

        _this.generateErrorMsg = function (type, dateStr) {
            var _this$props = _this.props,
                id = _this$props.id,
                enableTime = _this$props.enableTime,
                required = _this$props.required,
                t = _this$props.t;

            var datePattern = _this.FORMAT.date,
                timePattern = _this.FORMAT.time.indexOf('A') !== -1 ? _this.FORMAT.time.replace('A', 'AM/PM') : _this.FORMAT.time;

            var pattern = enableTime ? datePattern + ' ' + timePattern : datePattern;

            return _inputHelper2.default.validateField(dateStr, { name: id + '-' + type, type: 'date', required: required, pattern: pattern }, t ? { et: t } : true);
        };

        var value = props.value;


        _this.state = {
            prevFrom: value.from,
            prevTo: value.to
        };
        return _this;
    }

    _createClass(DateRange, [{
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

            this.datePicker = {
                from: (0, _flatpickr2.default)(this.dateFrom, {
                    enableTime: enableTime,
                    allowInput: allowInput,
                    dateFormat: dateFormat,
                    locale: loc,
                    time_24hr: !enableAMPM,
                    onChange: function onChange() {
                        _this2.checkCross('from');
                        _this2.handleChange();
                    }
                }),
                to: (0, _flatpickr2.default)(this.dateTo, {
                    enableTime: enableTime,
                    allowInput: allowInput,
                    dateFormat: dateFormat,
                    locale: loc,
                    time_24hr: !enableAMPM,
                    onChange: function onChange() {
                        _this2.checkCross('to');
                        _this2.handleChange();
                    }
                })
            };
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

            this.datePicker.from.set('locale', loc);
            this.datePicker.to.set('locale', loc);
            this.datePicker.from.setDate(this.strToTimestamp(value.from), false);
            this.datePicker.to.setDate(this.strToTimestamp(value.to), false);

            this.setState({
                prevFrom: value.from,
                prevTo: value.to
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.datePicker.from.destroy();
            this.datePicker.to.destroy();
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
                allowKeyIn = _props2.allowKeyIn,
                autoComplete = _props2.autoComplete;


            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-date-range', className) },
                _react2.default.createElement(
                    'span',
                    { className: 'c-date-picker' },
                    _react2.default.createElement('input', {
                        id: id + '-from',
                        type: 'text',
                        ref: function ref(_ref) {
                            _this3.dateFrom = _ref;
                        },
                        disabled: disabled,
                        readOnly: readOnly,
                        required: required,
                        onChange: allowKeyIn ? this.handleInputChange.bind(this, 'from') : null,
                        onBlur: this.handleBlur.bind(this, 'from'),
                        defaultValue: value.from,
                        autoComplete: autoComplete }),
                    _react2.default.createElement('i', { className: 'fg fg-calendar', onClick: function onClick() {
                            _this3.dateFrom.focus();
                        } })
                ),
                _react2.default.createElement(
                    'span',
                    { className: 'between' },
                    '~'
                ),
                _react2.default.createElement(
                    'span',
                    { className: 'c-date-picker' },
                    _react2.default.createElement('input', {
                        id: id + '-to',
                        type: 'text',
                        ref: function ref(_ref2) {
                            _this3.dateTo = _ref2;
                        },
                        disabled: disabled,
                        readOnly: readOnly,
                        required: required,
                        onChange: allowKeyIn ? this.handleInputChange.bind(this, 'to') : null,
                        onBlur: this.handleBlur.bind(this, 'to'),
                        defaultValue: value.to,
                        autoComplete: autoComplete }),
                    _react2.default.createElement('i', { className: 'fg fg-calendar', onClick: function onClick() {
                            _this3.dateTo.focus();
                        } })
                )
            );
        }
    }]);

    return DateRange;
}(_react2.default.Component);

DateRange.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    value: DATE_PROP_TYPE,
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
    autoComplete: _propTypes2.default.string,
    t: _propTypes2.default.func
};
DateRange.defaultProps = {
    dateFormat: 'Y-m-d',
    timeFormat: 'H:i',
    disabled: false,
    readOnly: false,
    required: false,
    allowKeyIn: true,
    enableTime: false,
    enableAMPM: false,
    locale: 'en',
    autoComplete: 'off'
};
exports.default = (0, _propWire.wire)(DateRange, 'value', {});