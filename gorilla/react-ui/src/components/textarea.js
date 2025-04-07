import React, {Component} from 'react'
import PropTypes from 'prop-types'

import {wireValue} from '../hoc/prop-wire'

/**
 * A React Textarea
 * @constructor
 * @param {string} [id] - Textarea #id
 * @param {string} [name] - Textarea name
 * @param {string} [className] - Classname for the textarea
 * @param {string|number} [placeholder] - Placeholder for textarea
 * @param {number} [rows] - Visible number of lines in a textarea
 * @param {number} [cols] - Visible width of a textarea
 * @param {boolean} [readOnly=false] - Is this field readonly?
 * @param {boolean} [disabled=false] - Is this field disabled?
 * @param {number} [maxLength] - The maximum number of characters allowed in the textarea
 * @param {string|number} [value] - Current value
 * @param {boolean} [required=false] - Is this field mandatory?
 * @param {function} [onChange] - Callback function when value is changed. <br> Required when value prop is supplied
 *
 * @example
import {Textarea} from 'react-ui'

Examples.Textarea = React.createClass({
    getInitialState() {
        return {
            feedback: ''
        }
    },
    handleChange(field, value) {
        this.setState({[field]:value})
    },
    render() {
        const {feedback} = this.state
        return <div className='c-form inline'>
            <div>
                <label htmlFor='feedback'>Feedback</label>
                <Textarea
                    id='feedback'
                    onChange={this.handleChange.bind(this, 'feedback')}
                    value={feedback} />
            </div>
        </div>
    }
})
 */

class Textarea extends Component {
    constructor(props) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
    }
    handleChange(e) {
        this.props.onChange(e.target.value)
    }
    render() {
        const {id, name, className, placeholder, rows, cols, readOnly, disabled, maxLength, required, value} = this.props

        return <textarea
            id={id}
            name={name}
            className={className}
            placeholder={placeholder}
            rows={rows}
            cols={cols}
            readOnly={readOnly}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            required={required}
            onChange={this.handleChange} />
    }
}

Textarea.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rows: PropTypes.number,
    cols: PropTypes.number,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    maxLength: PropTypes.number,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    required: PropTypes.bool,
    onChange: PropTypes.func.isRequired
}

Textarea.defaultProps = {
    id: '',
    className: '',
    value: ''
}

export default wireValue(Textarea)