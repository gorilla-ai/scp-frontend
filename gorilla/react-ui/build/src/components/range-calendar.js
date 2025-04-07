// import PropTypes from 'prop-types';
// import React from 'react'
// import createReactClass from 'create-react-class';
// import _ from 'lodash'
// import $ from 'jquery'
// import cx from 'classnames'
// import Moment from 'moment'
// import flatpickr from 'flatpickr'
// import flatpickrStyles from 'flatpickr/dist/flatpickr.min.css' // eslint-disable-line no-unused-vars

// // Add more locales here
// import {Mandarin as zh} from 'flatpickr/dist/l10n/zh'

// import Popover from './popover'
// import {wire} from '../hoc/prop-wire'
// import { SIMPLE_VALUE_PROP } from '../consts/prop-types'
// import ih from '../utils/input-helper'
// import {flatpickrToMomentToken} from '../utils/date'

// let log = require('loglevel').getLogger('react-ui/components/date-range')

// const DATE_PROP_TYPE = PropTypes.shape({
//     from: SIMPLE_VALUE_PROP,
//     to: SIMPLE_VALUE_PROP
// })

// const DATE_TIME_SUFFIX = {
//     daySuffix: /(st)|(nd)|(rd)|(th)/g,
//     timeSuffix: /(AM)|(PM)/ig
// }

// const LABELS = {
//     from: 'From',
//     to: 'To',
//     shortcut: 'Shortcut for Last Period',
//     done: 'Done'
// }

// /**
//  * A React DateRange Component, containing a 'from' date input and a 'to' date input<br>
//  * Uses [flatpickr]{@link https://chmln.github.io/flatpickr/#options}
//  *
//  * @constructor
//  * @param {string} [id] - Container element #id
//  * @param {string} [className] - Classname for the container
//  * @param {object} [defaultValue] - Default selected range
//  * @param {string} defaultValue.from - Default selected from
//  * @param {string} defaultValue.to - Default selected to
//  * @param {object} [value] - Current selected range
//  * @param {string} value.from - Current selected from
//  * @param {string} value.to - Current selected to
//  * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
//  * @param {*} valueLink.value - value to update
//  * @param {function} valueLink.requestChange - function to request value change
//  * @param {boolean} [allowKeyIn=true] - Allow user key in to the from/to input?
//  * @param {boolean} [disabled=false] - Is this field disabled?
//  * @param {boolean} [readOnly=false] - Is this field readonly?
//  * @param {boolean} [required=false] - Is this field required?
//  * @param {function} [onChange] - Callback function when from/to is changed. <br> Required when value prop is supplied
//  * @param {object} onChange.value - current value
//  * @param {string} onChange.value.from - current from
//  * @param {string} onChange.value.to - current to
//  * @param {object} onChange.eventInfo - event related info
//  * @param {object} onChange.eventInfo.before - previously enetered value
//  * @param {string} [dateFormat='Y-m-d'] - Date format. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
//  * @param {string} [timeFormat='H:i'] - Time format. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
//  * @param {boolean} [enableTime=false] - Enable selection and display of time
//  * @param {boolean} [enableAMPM=false] - Enable AM/PM option on calendar
//  * @param {boolean | Array.<object>} [shortcut=false] - Shortcut for quickly select last periods. When specified as 'true', will show shortcuts for last 1 day/week/month/year
//  * @param {number} shortcut.value - Period value
//  * @param {string} shortcut.unit - Period value's unit. Possible values include 'minutes', 'hours', 'weeks', 'months', 'quarters', 'years'
//  * @param {string} shortcut.text - Text of shortcut
//  * @param {object} [labels] - Texts of "From", "To", "Shortcut" and "Done" labels
//  * @param {string} [labels.from="From"] - Text of "From" label
//  * @param {string} [labels.to="To"] - Text of "To" label
//  * @param {string} [labels.shortcut="Shortcut for Last Period"] - Text of "Short" label
//  * @param {string} [labels.done="Done"] - Text of "Done" button
//  * @param {string} [locale] - Datepicker locale. Values can be 'en', 'zh', etc. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
//  * @param {fuction} [t] - Transform/translate error into readable message.<br>
//  * @param {object} t.params - Parameters relevant to the error code
//  * @param {string} t.params.field - offending field id
//  * @param {string} t.params.value - offending field value
//  * @param {string} t.params.pattern - pattern the value was supposed to follow
//  *
//  * @example
// // controlled

// import {RangeCalendar} from 'react-ui'

// React.createClass({
//     getInitialState() {
//         return {
//             date: {
//                 from: '2012-04-26',
//                 to: '2012-10-26'
//             },
//             datetime: {
//                 from: '2012-10-26 12:00',
//                 to: '2012-10-26 17:00'
//             }
//         }
//     },
//     handleChange(field, value) {
//         this.setState({[field]:value})
//     },
//     render() {
//         let {date, datetime} = this.state
//         return <div className='c-form'>
//             <div>
//                 <label htmlFor='date'>Select Date Range</label>
//                 <RangeCalendar
//                     id='date'
//                     onChange={this.handleChange.bind(this, 'date')}
//                     value={date}
//                     shortcut
//                     t={(code, params) => {
//                         if (code === 'missing') { return 'Please input date' }
//                         else {
//                             return `Invalid date format. Should be ${params.pattern}`
//                         }
//                     }} />
//             </div>
//             <div>
//                 <label htmlFor='datetime'>Select Date Time Range</label>
//                 <RangeCalendar
//                     id='datetime'
//                     onChange={this.handleChange.bind(this, 'datetime')}
//                     enableTime={true}
//                     value={datetime}
//                     shortcut={
//                         [
//                             {value:1, text:'Hour', unit:'hours'},
//                             {value:1, text:'Day', unit:'days'},
//                             {value:1, text:'Month', unit:'months'},
//                             {value:1, text:'Quarter', unit:'quarters'},
//                             {value:1, text:'Year', unit:'years'},
//                         ]
//                     }
//                     t={(code, params) => {
//                         if (code === 'missing') { return 'Please input date' }
//                         else {
//                             return `Invalid date format. Should be ${params.pattern}`
//                         }
//                     }} />
//             </div>
//         </div>
//     }
// })
// */

// const RangeCalendar = createReactClass({
//     displayName: 'RangeCalendar',

//     propTypes: {
//         id: PropTypes.string,
//         className: PropTypes.string,
//         value: DATE_PROP_TYPE,
//         allowKeyIn: PropTypes.bool,
//         disabled: PropTypes.bool,
//         readOnly: PropTypes.bool,
//         required: PropTypes.bool,
//         onChange: PropTypes.func,
//         dateFormat: PropTypes.string,
//         timeFormat: PropTypes.string,
//         enableTime: PropTypes.bool,
//         enableAMPM: PropTypes.bool,
//         shortcut: PropTypes.oneOfType([
//             PropTypes.bool,
//             PropTypes.arrayOf(PropTypes.shape({
//                 value: PropTypes.number,
//                 unit: PropTypes.string,
//                 text: PropTypes.string
//             }))
//         ]),
//         locale: PropTypes.string,
//         labels: PropTypes.shape({
//             from: PropTypes.string,
//             to: PropTypes.string,
//             shortcut: PropTypes.string,
//             done: PropTypes.string
//         }),
//         t: PropTypes.func
//     },

//     getDefaultProps() {
//         return {
//             dateFormat: 'Y-m-d',
//             timeFormat: 'H:i',
//             disabled: false,
//             readOnly: false,
//             required: false,
//             allowKeyIn: true,
//             enableTime: false,
//             enableAMPM: false,
//             shortcut: false,
//             locale: 'en',
//             labels: LABELS
//         }
//     },

//     getInitialState() {
//         const {value} = this.props

//         return {
//             prevFrom: value.from,
//             prevTo: value.to,
//             show: false
//         }
//     },

//     componentDidMount() {
//         let {dateFormat, timeFormat, enableTime, enableAMPM, allowKeyIn:allowInput, locale} = this.props

//         this.isMounted = true

//         let loc = null
//         switch (locale) {
//             case 'zh': loc = zh; break
//             default: loc = null
//         }

//         this.FORMAT = flatpickrToMomentToken(dateFormat, timeFormat, enableTime)

//         if (enableTime) {
//             dateFormat = dateFormat + ' ' + timeFormat
//         }

//         this.datePicker = {
//             from: flatpickr(this.dateFrom, {
//                 enableTime,
//                 allowInput,
//                 dateFormat,
//                 locale: loc,
//                 time_24hr: !enableAMPM,
//                 appendTo: this.fromWrapper,
//                 inline: true,
//                 onChange: () => {
//                     this.checkCross('from')
//                     this.handleChange()
//                 }
//             }),
//             to: flatpickr(this.dateTo, {
//                 enableTime,
//                 allowInput,
//                 dateFormat,
//                 locale: loc,
//                 time_24hr: !enableAMPM,
//                 appendTo: this.toWrapper,
//                 inline: true,
//                 onChange: () => {
//                     this.checkCross('to')
//                     this.handleChange()
//                 }
//             })
//         }
//     },

//     componentWillReceiveProps(nextProps) {
//         const {value, locale} = nextProps

//         let loc = null
//         switch (locale) {
//             case 'zh': loc = zh; break
//             default: loc = null
//         }

//         this.datePicker.from.set('locale', loc)
//         this.datePicker.to.set('locale', loc)
//         this.datePicker.from.setDate(this.strToTimestamp(value.from), false)
//         this.datePicker.to.setDate(this.strToTimestamp(value.to), false)

//         this.setState({
//             prevFrom: value.from,
//             prevTo: value.to
//         })
//     },

//     componentWillUnmount() {
//         this.isMounted = false
//         this.datePicker.from.destroy()
//         this.datePicker.to.destroy()
//     },

//     strToTimestamp(str) {
//         const {enableTime} = this.props
//         // Remove the day suffix since moment can't resolve it
//         const parsedStr = str.replace(DATE_TIME_SUFFIX.daySuffix, '')
//         const momentFormat = enableTime ? `${this.FORMAT.date} ${this.FORMAT.time}` : this.FORMAT.date
//         return Moment(parsedStr, momentFormat).valueOf()
//     },

//     handleChange() {
//         const {onChange} = this.props
//         onChange({from:this.dateFrom.value, to:this.dateTo.value})
//     },

//     handleInputChange(type, evt) {
//         const {required} = this.props
//         const newDate = evt.target.value

//         const parseDate = this.strToTimestamp(newDate)

//         const isValid = this.validateDateFormat(newDate)
//         const errMsg = this.generateErrorMsg(type, newDate)

//         if (!isNaN(parseDate)) {
//             // Move the calendar view to the current value's location
//             this.datePicker[type].jumpToDate(parseDate)

//             if (isValid) {
//                 Popover.closeId(`err-${type}`)

//                 // setDate() accepts date string & Date object
//                 // If set the 2nd parameter as true, it will recursively call itself here
//                 this.datePicker[type].setDate(parseDate, false)
//                 this.handleChange()

//                 this.checkCross(type)
//             }
//             else {
//                 Popover.openId(
//                     `err-${type}`,
//                     evt,
//                     <span>{errMsg}</span>,
//                     {pointy:true}
//                 )
//             }
//         }
//         else {
//             if (required || newDate !== '') {
//                 Popover.openId(
//                     `err-${type}`,
//                     evt,
//                     <span>{errMsg}</span>,
//                     {pointy:true}
//                 )
//             }
//             else {
//                 Popover.closeId(`err-${type}`)
//             }
//         }
//     },

//     handleBlur(type, evt) {
//         Popover.closeId(`err-${type}`)

//         const {required} = this.props
//         const newDate = evt.target.value

//         const isValid = this.validateDateFormat(newDate)
//         const field = (type === 'from') ? 'prevFrom' : 'prevTo'
//         const prevDate = (type === 'from') ? this.state.prevFrom : this.state.prevTo

//         if (isValid) {
//             // Prevent requiring double-click when select date
//             if (newDate !== prevDate) {
//                 this.datePicker[type].setDate(newDate)
//                 this.setState({[field]:newDate})
//             }

//             this.checkCross(type)
//         }
//         else {
//             // Reset to previous valid value
//             if (required) {
//                 this.datePicker[type].setDate(prevDate)
//             }
//             else {
//                 this.datePicker[type].setDate('')
//                 this.handleChange()
//             }
//         }
//     },

//     handleToggle() {
//         const {show:prevShow} = this.state
//         const show = !prevShow
//         if (show) {
//             // Hide the calendar when click outside
//             $(document).click(event => {
//                 const isOutSide = !$(event.target).closest(this.dateDisplay).length
//                                 && !$(event.target).closest(this.dateWrapper).length

//                 if (isOutSide) {
//                     this.handleToggle()
//                 }
//             })
//         }
//         else {
//             $(document).off()
//         }
//         this.isMounted && this.setState({show})
//     },

//     handleClick(period, unit) {
//         const {onChange} = this.props
//         const now = Moment().valueOf()
//         const backTo = Moment().subtract(period, unit).valueOf()

//         this.datePicker.from.setDate(backTo, false)
//         this.datePicker.to.setDate(now, false)

//         onChange({from:this.dateFrom.value, to:this.dateTo.value})
//     },

//     validateDateFormat(dateStr) {
//         const {enableTime} = this.props
//         let isValid = false

//         if (enableTime) {
//             isValid = Moment(dateStr, `${this.FORMAT.date} ${this.FORMAT.time}`, true).isValid()

//             // Momentjs validation accepts single (a|A|p|P) for AM/PM
//             // This is for ensuring user input complete 'AM/PM' term when AM/PM is enabled
//             if (this.FORMAT.time.indexOf('A') !== -1 && dateStr.search(DATE_TIME_SUFFIX.timeSuffix) === -1) {
//                 isValid = false
//             }
//         }
//         else {
//             isValid = Moment(dateStr, `${this.FORMAT.date}`, true).isValid()
//         }

//         return isValid
//     },

//     checkCross(type) {
//         const dateFrom = this.strToTimestamp(this.dateFrom.value)
//         const dateTo = this.strToTimestamp(this.dateTo.value)

//         if (dateFrom !== dateTo) {
//             if (type === 'from') {
//                 const isAfter = Moment(dateFrom).isAfter(dateTo)

//                 if (isAfter) {
//                     this.datePicker.to.setDate(dateFrom, false)
//                     this.handleChange()
//                 }
//             }
//             else {
//                 const isBefore = Moment(dateTo).isBefore(dateFrom)

//                 if (isBefore) {
//                     this.datePicker.from.setDate(dateTo, false)
//                     this.handleChange()
//                 }
//             }
//         }
//     },

//     generateErrorMsg(type, dateStr) {
//         const {id, enableTime, required, t} = this.props
//         const datePattern = this.FORMAT.date
//         const timePattern = (this.FORMAT.time.indexOf('A') !== -1) ? this.FORMAT.time.replace('A', 'AM/PM') : this.FORMAT.time

//         const pattern = enableTime ? `${datePattern} ${timePattern}` : datePattern

//         return ih.validateField(dateStr, {name:`${id}-${type}`, type:'date', required, pattern}, t?{et:t}:true)
//     },

//     renderShortcut() {
//         const {id, labels:{shortcut:label}, shortcut} = this.props

//         if (typeof shortcut === 'boolean') {
//             return <div className='shortcut'>
//                 <label htmlFor={`${(id || 'date')}-shortcut`}>{label || LABELS.shortcut}</label>
//                 <div id={`${(id || 'date')}-shortcut`}>
//                     <button onClick={this.handleClick.bind(this, 1, 'days')}>Day</button>
//                     <button onClick={this.handleClick.bind(this, 1, 'weeks')}>Week</button>
//                     <button onClick={this.handleClick.bind(this, 1, 'months')}>Month</button>
//                     <button onClick={this.handleClick.bind(this, 1, 'years')}>Year</button>
//                 </div>
//             </div>
//         }
//         else {
//             return <div className='shortcut'>
//                 <label htmlFor={`${(id || 'date')}-shortcut`}>{label || LABELS.shortcut}</label>
//                 <div id={`${(id || 'date')}-shortcut`}>
//                     {
//                         _.map(shortcut, ({value, text, unit}) => {
//                             return <button key={text} onClick={this.handleClick.bind(this, value, unit)}>
//                                 {text}
//                             </button>
//                         })
//                     }
//                 </div>
//             </div>
//         }
//     },

//     render() {
//         const {id, value, className, readOnly, disabled, required,
//             allowKeyIn, enableTime, shortcut, labels: keyLabel} = this.props
//         const {show} = this.state
//         const labels = {...LABELS, ...keyLabel}

//         return <div id={id} className={cx('c-range-calendar', className)}>
//             <div ref={ref => { this.dateDisplay = ref }} className='date-display'>
//                 <input
//                     type='text'
//                     readOnly
//                     required={required}
//                     value={value.from + ' - ' + value.to}
//                     onClick={this.handleToggle} />
//                 <i className='fg fg-calendar' onClick={this.handleToggle} />
//             </div>
//             <div ref={ref => { this.dateWrapper = ref }} className={cx('date-wrapper', {show, large:enableTime})}>
//                 <div ref={ref => { this.fromWrapper = ref }} className='date-calendar' />
//                 <div ref={ref => { this.toWrapper = ref }} className='date-calendar' />
//                 <div className='c-form nopad'>
//                     <div>
//                         <label htmlFor={`${(id || 'date')}-from`}>{labels.from}</label>
//                         <input
//                             id={`${(id || 'date')}-from`}
//                             type='text'
//                             ref={ref => { this.dateFrom=ref }}
//                             disabled={disabled}
//                             readOnly={readOnly}
//                             required={required}
//                             onChange={allowKeyIn ? this.handleInputChange.bind(this, 'from') : null}
//                             onBlur={this.handleBlur.bind(this, 'from')}
//                             defaultValue={value.from} />
//                     </div>
//                     <div>
//                         <label htmlFor={`${(id || 'date')}-to`}>{labels.to}</label>
//                         <input
//                             id={`${(id || 'date')}-to`}
//                             type='text'
//                             ref={ref => { this.dateTo=ref }}
//                             disabled={disabled}
//                             readOnly={readOnly}
//                             required={required}
//                             onChange={allowKeyIn ? this.handleInputChange.bind(this, 'to') : null}
//                             onBlur={this.handleBlur.bind(this, 'to')}
//                             defaultValue={value.to} />
//                     </div>
//                     { shortcut && this.renderShortcut() }
//                     <button className='end btn-done' onClick={this.handleToggle}>{labels.done}</button>
//                 </div>
//             </div>
//         </div>
//     },
// })

// export default wire(RangeCalendar, 'value', {})
"use strict";