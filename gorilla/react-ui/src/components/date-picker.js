import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import Moment from 'moment'
import flatpickr from 'flatpickr'
import flatpickrStyles from 'flatpickr/dist/flatpickr.min.css' // eslint-disable-line no-unused-vars

// Add more locales here
import {Mandarin as zh} from 'flatpickr/dist/l10n/zh'

import Popover from './popover'
import {wireValue} from '../hoc/prop-wire'
import { SIMPLE_VALUE_PROP } from '../consts/prop-types'
import ih from '../utils/input-helper'
import {flatpickrToMomentToken} from '../utils/date'

let log = require('loglevel').getLogger('react-ui/components/date-picker')


const DATE_TIME_SUFFIX = {
    daySuffix: /(st)|(nd)|(rd)|(th)/g,
    timeSuffix: /(AM)|(PM)/ig
}

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

class DatePicker extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        value: SIMPLE_VALUE_PROP,
        allowKeyIn: PropTypes.bool,
        disabled: PropTypes.bool,
        readOnly: PropTypes.bool,
        required: PropTypes.bool,
        onChange: PropTypes.func,
        dateFormat: PropTypes.string,
        timeFormat: PropTypes.string,
        enableTime: PropTypes.bool,
        enableAMPM: PropTypes.bool,
        locale: PropTypes.string,
        t: PropTypes.func
    };

    static defaultProps = {
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

    constructor(props) {
        super(props);
        let {value} = props

        this.state = {
            prevDate: value
        };
    }

    componentDidMount() {
        let {dateFormat, timeFormat, enableTime, enableAMPM, allowKeyIn:allowInput, locale} = this.props

        let loc = null
        switch (locale) {
            case 'zh': loc = zh; break
            default: loc = null
        }

        this.FORMAT = flatpickrToMomentToken(dateFormat, timeFormat, enableTime)

        if (enableTime) {
            dateFormat = dateFormat + ' ' + timeFormat
        }

        this.datePicker = flatpickr(this.date, {
            enableTime,
            allowInput,
            dateFormat,
            locale: loc,
            time_24hr: !enableAMPM,
            onChange: ()=>{
                this.handleChange()
            }
        })
    }

    componentWillReceiveProps(nextProps) {
        let {value, locale} = nextProps

        let loc = null
        switch (locale) {
            case 'zh': loc = zh; break
            default: loc = null
        }

        this.datePicker.set('locale', loc)
        this.datePicker.setDate(this.strToTimestamp(value), false)
        this.setState({
            prevDate: value
        })
    }

    componentWillUnmount() {
        this.datePicker.destroy()
    }

    strToTimestamp = (str) => {
        const {enableTime} = this.props
        const parsedStr = str.replace(DATE_TIME_SUFFIX.daySuffix, '')
        const momentFormat = enableTime ? `${this.FORMAT.date} ${this.FORMAT.time}` : this.FORMAT.date
        return Moment(parsedStr, momentFormat).valueOf()
    };

    handleChange = () => {
        let {onChange} = this.props
        onChange(this.date.value)
    };

    handleInputChange = (evt) => {
        let {required} = this.props
        let newDate = evt.target.value

        // Remove the day suffix since Date can't resolve it
        let parseDate = this.strToTimestamp(newDate)

        let isValid = this.validateDateFormat(newDate)
        let errMsg = this.generateErrorMsg(newDate)

        if (!isNaN(parseDate)) {
            // Move the calendar view to the current value's location
            this.datePicker.jumpToDate(parseDate)

            if (isValid) {
                Popover.close()

                // setDate() accepts date string & Date object
                // If set the 2nd parameter as true, it will recursively call itself here
                this.datePicker.setDate(parseDate, false)
                this.handleChange()
            }
            else {
                Popover.open(
                    evt,
                    <span>{errMsg}</span>,
                    {pointy:true}
                )
            }
        }
        else {
            if (required || newDate !== '') {
                Popover.open(
                    evt,
                    <span>{errMsg}</span>,
                    {pointy:true}
                )
            }
            else {
                Popover.close()
            }
        }
    };

    handleBlur = (evt) => {
        Popover.close()

        let newDate = evt.target.value

        let isValid = this.validateDateFormat(newDate)
        let {prevDate} = this.state
        let {required} = this.props

        if (isValid) {
            // Prevent requiring double-click when select date
            if (newDate !== prevDate) {
                this.datePicker.setDate(newDate)
                this.setState({prevDate:newDate})
            }
        }
        else {
            // Reset to previous valid value
            if (required) {
                this.datePicker.setDate(prevDate)
            }
            else {
                this.datePicker.setDate('')
                this.handleChange()
            }
        }
    };

    validateDateFormat = (dateStr) => {
        let {enableTime} = this.props
        let isValid = false

        if (enableTime) {
            isValid = Moment(dateStr, `${this.FORMAT.date} ${this.FORMAT.time}`, true).isValid()

            // Momentjs validation accepts single (a|A|p|P) for AM/PM
            // This is for ensuring user input complete 'AM/PM' term when AM/PM is enabled
            if (this.FORMAT.time.indexOf('A') !== -1 && dateStr.search(DATE_TIME_SUFFIX.timeSuffix) === -1) {
                isValid = false
            }
        }
        else {
            isValid = Moment(dateStr, `${this.FORMAT.date}`, true).isValid()
        }

        return isValid
    };

    generateErrorMsg = (dateStr) => {
        let {id, enableTime, required, t} = this.props
        let datePattern = this.FORMAT.date,
            timePattern = (this.FORMAT.time.indexOf('A') !== -1) ? this.FORMAT.time.replace('A', 'AM/PM') : this.FORMAT.time

        let pattern = enableTime ? `${datePattern} ${timePattern}` : datePattern

        return ih.validateField(dateStr, {name:id, type:'date', required, pattern}, t?{et:t}:true)
    };

    render() {
        let {id, value, className, readOnly, disabled, required, allowKeyIn} = this.props

        return <div id={id} className={cx('c-date-picker', className)}>
            <input
                id={id}
                type='text'
                ref={ref=>{ this.date=ref }}
                disabled={disabled}
                readOnly={readOnly}
                required={required}
                onChange={allowKeyIn ? this.handleInputChange : null}
                onBlur={this.handleBlur}
                defaultValue={value} />
            <i className='fg fg-calendar' onClick={() => { this.date.focus() }} />
        </div>
    }
}

export default wireValue(DatePicker)