import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import _str from 'underscore.string'


import { SIMPLE_VALUE_PROP } from '../consts/prop-types'
import Popover from './popover'
import ih from '../utils/input-helper'
import {wireValue} from '../hoc/prop-wire'

let log = require('loglevel').getLogger('react-ui/components/input')

/**
 * A React (text) Input. Note this is wrapper around react builtin input element, major differences are:
 *
 * * Provides validation tooltip (optional)
 * * Only fire onChange event when the field has lost focus
 *
 * @constructor
 * @param {string} [id] - Input element #id
 * @param {string} [name] - Input element name
 * @param {'text'|'number'|'integer'} [type='text'] - Input type, default to 'text', if type='number' or 'integer' will trigger validation
 * @param {function} [formatter] - Input value display formatter
 * @param {string} formatter.value - currently entered input
 * @param {object} [validate] - Validation config
 * @param {number} validate.min - minimum value when type='number' or 'integer'
 * @param {number} validate.max - maximum value when type='number' or 'integer'
 * @param {RegExp|string} validate.pattern - RegExp string to test against when type='text'
 * @param {string} validate.patternReadable - Readable pattern string
 * @param {fuction} [validate.t] - Transform/translate error into readable message.<br>
 * If not specified, error message will be `${value} ${code}`<br>
 * For example see [i18next]{@link http://i18next.com/translate/} translator for generating error message.<br>
 * @param {'missing'|'no-match'|'not-int'|'not-num'|'out-of-bound'} validate.t.code - Error code
 * @param {object} validate.t.params - Parameters relevant to the error code
 * @param {string} validate.t.params.field - offending field name/id
 * @param {string} validate.t.params.value - offending field value
 * @param {RegExp|string} [validate.t.params.pattern] - pattern the value was supposed to follow
 * @param {number} [validate.t.params.min] - configured minimum value
 * @param {number} [validate.t.params.max] - configured maximum value
 * @param {string} [className] - Classname for the input
 * @param {string|number} [defaultValue] - Default value
 * @param {string|number} [value] - Current value
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean} [required=false] - Is this field mandatory? If true will trigger validation.
 * @param {boolean} [disabled=false] - Is this field disabled?
 * @param {boolean} [readOnly=false] - Is this field readonly?
 * @param {string} [maxLength] - Maximum input length
 * @param {string} [placeholder] - Placeholder for input
 * @param {function} [onChange] - Callback function when value is changed. <br> Required when value prop is supplied
 * @param {string|number} onChange.value - updated value
 * @param {object} onChange.eventInfo - event related info
 * @param {string|number} onChange.eventInfo.before - previous value
 * @param {boolean} onChange.eventInfo.isComplete - was it triggered by pressing enter key?
 *
 * @example
// controlled

import {Input} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            name:'',
            age:'',
            email:''
        }
    },
    handleChange(field,value) {
        this.setState({[field]:value})
    },
    render() {
        let {name, age, email} = this.state;
        return <div className='c-form'>
            <div>
                <label htmlFor='name'>Name</label>
                <Input id='name'
                    onChange={this.handleChange.bind(this,'name')}
                    value={name}
                    required={true}
                    placeholder='Your name'/>
            </div>
            <div>
                <label htmlFor='age'>Age</label>
                <Input id='age'
                    type='number'
                    validate={{
                        max:100,
                        t:(code, {value})=>`Age ${value} is invalid`
                    }}
                    className='my-age'
                    onChange={this.handleChange.bind(this,'age')}
                    value={age}
                    placeholder='Your age'/>
            </div>
            <div>
                <label htmlFor='email'>Email</label>
                <Input id='email'
                    validate={{
                        pattern:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        patternReadable:'xxx@xxx.xxx',
                        t:(code, {value,pattern})=>{
                            if (code==='missing') {
                                return 'You didn\'t enter an email address'
                            }
                            else { // assume pattern issue
                                return `You didn't provide a valid email, the correct format should be ${pattern}`
                            }
                        }
                    }}
                    onChange={this.handleChange.bind(this,'email')}
                    value={email}/>
            </div>
        </div>
    }
})
 */
class Input extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.oneOf(['text', 'number', 'integer', 'password']),
        formatter: PropTypes.func,
        validate: PropTypes.shape({
            min: PropTypes.number,
            max: PropTypes.number,
            pattern: PropTypes.oneOfType([PropTypes.instanceOf(RegExp), PropTypes.string]),
            patternReadable: PropTypes.string,
            t: PropTypes.func
        }),
        className: PropTypes.string,
        value: SIMPLE_VALUE_PROP,
        required: PropTypes.bool,
        disabled: PropTypes.bool,
        readOnly: PropTypes.bool,
        maxLength: PropTypes.number,
        placeholder: SIMPLE_VALUE_PROP,
        onChange: PropTypes.func
    };

    static defaultProps = {
        type: 'text',
        validate: {},
        required: false,
        disabled: false,
        readOnly: false
    };

    constructor(props, context) {
        super(props, context);
        let {value} = props

        this.state = {
            value,
            error: this.validateInput(value)
        };
    }

    componentWillReceiveProps(nextProps) {
        let {value} = nextProps
        this.setState({
            value,
            error: this.validateInput(value, nextProps)
        })
    }

    componentWillUnmount() {
        Popover.close()
    }

    changeHandler = (evt) => {
        let newVal = evt.target.value
        let error = this.validateInput(newVal)
        this.nextTime = false

        if (error) {
            evt.stopPropagation()
            evt.preventDefault()
            Popover.open(evt, error)
            this.setState({error, value:newVal})
        }
        else {
            Popover.close()
            this.setState({value:newVal, error:false})
        }
    };

    keyHandler = (evt) => {
        if (evt.keyCode === 13) {
            this.blurHandler(evt, {isComplete:true})
        }
    };

    blurHandler = (evt, info={}) => {
        let {value:oldVal} = this.props
        let {error, value:newVal} = this.state

        if (error) {
            if (!this.nextTime) {
                this.nextTime = true
                this.setState({value:oldVal})
                this.input.focus()
            }
            else {
                this.nextTime = false
                Popover.close()
                this.setState({error:this.validateInput(evt.target.value)!==null})
            }
        }
        else {
            if (oldVal !== newVal) {
                let {formatter, onChange} = this.props

                if (newVal!=null && !_str.isBlank(newVal) && formatter && _.isFunction(formatter)) {
                    newVal = formatter(newVal)
                }

                onChange(newVal, info)
            }
        }
    };

    validateInput = (value, props) => {
        let {name, id, type, required, validate:{t, ...params}} = props || this.props

        let msg = ih.validateField(value, {name:name || id, type, required, ...params}, t?{et:t}:true)

        if (msg) {
            return <span>{msg}</span>
        }
        return null
    };

    render() {
        let {className, id, name, type, disabled, readOnly, placeholder, maxLength} = this.props
        let {value, error} = this.state

        let changeHandler = this.changeHandler

        switch (type) {
            default:
                return <input
                    id={id}
                    name={name}
                    ref={ref=>{ this.input=ref }}
                    type={(type === 'password') ? 'password' : 'text'}/* {type}*/
                    /* min={min}
                    max={max}
                    step={step}
                    pattern={pattern}
                    required={required}*/
                    readOnly={readOnly}
                    disabled={disabled}
                    maxLength={maxLength}
                    onChange={changeHandler}
                    onBlur={this.blurHandler}
                    onKeyUp={this.keyHandler}
                    placeholder={placeholder}
                    className={cx(className, {invalid:error})}
                    value={value} />
        }
    }
}

export default wireValue(Input)