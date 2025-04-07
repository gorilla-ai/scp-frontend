import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import $ from 'jquery'

import {wireValue} from '../hoc/prop-wire'

let log = require('loglevel').getLogger('core/components/slider')

const isIncrease = true

/**
 * A React toggle button
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {boolean} [disabled=false] - Is slider disabled?
 * @param {function} onChange - Callback function when slider value is updated
 * @param {function} [onPlus] - Function for clicking plus icon
 * @param {function} [onMinus] - Function for clicking minus icon
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {number} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {number} [max=1] - The slider max value
 * @param {number} [min=0] - The slider min value
 * @param {number} [step=0.01] - Legal number intervals for the input
 * @param {number} [value=0.5] - Current slider value
 * @param {boolean} [showProgress=false] - Show the slider's progress?
 *
 * @example
// controlled

import Slider from 'core/components/slider'
React.createClass({
    getInitialState() {
        return {value:40}
    },
    handleChange(e) {
        let value = e
        this.setState({value})
    },
    render() {
        let {value} = this.state
        return <Slider value={value} onChange={this.handleChange} showProgress={true} min={0} max={100} step={5} />
    }
})
 */

class Slider extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        disabled: PropTypes.bool,
        max: PropTypes.number,
        min: PropTypes.number,
        step: PropTypes.number,
        value: PropTypes.number,
        showProgress: PropTypes.bool,
        onChange: PropTypes.func,
        onMinus: PropTypes.func,
        onPlus: PropTypes.func
    };

    static defaultProps = {
        disabled: false,
        max: 1,
        min: 0,
        step: 0.01,
        value: 0.5
    };

    state = {
        width: 0
    };

    componentDidMount() {
        let {showProgress} = this.props
        let width = $(this.input).width()

        if (showProgress) {
            this.setState({
                width
            })
        }
    }

    handleChange = (e) => {
        let val = parseFloat(e.target.value)
        let {onChange} = this.props
        onChange(val)
    };

    handleClick = (isPlus) => {
        let {disabled, max, min, step, value, onChange} = this.props

        if (disabled) { return }

        // Fix the decimal of value as the step's
        let numArr = (step.toString()).split('.')
        let decimal = 0

        if (numArr.length === 2) { decimal = numArr[1].length }

        let tmp = isPlus ? (value + step).toFixed(decimal) : (value - step).toFixed(decimal)
        if (isPlus) {
            value = (parseFloat(tmp) > max) ? max : parseFloat(tmp)
        }
        else {
            value = (parseFloat(tmp) < min) ? min : parseFloat(tmp)
        }

        onChange(value)
    };

    render() {
        let {id, className, disabled, max, min, step, value, showProgress, onPlus, onMinus} = this.props
        let {width} = this.state
        let prgs = ((value - min) / (max - min)) * width
        let prgsBar = showProgress ? <div className='progress' style={{width:`${prgs}px`}} data-tooltip={value} /> : ''

        return (
            <div className={cx('c-flex', 'aic', 'c-slider', className)}>
                {/*<i className='fg fg-magnifier-lessen c-link' aria-hidden='true' onClick={onMinus || this.handleClick.bind(this, !isIncrease)} />*/}
                <div className='c-flex aic'>
                    <input
                        type='range'
                        id={id}
                        ref={ref=>{ this.input=ref }}
                        disabled={disabled}
                        max={max}
                        min={min}
                        step={step}
                        value={value}
                        onChange={disabled ? null : this.handleChange} />

                    {prgsBar}
                </div>
                {/*<i className='fg fg-magnifier-enlarge c-link' aria-hidden='true' onClick={onPlus || this.handleClick.bind(this, isIncrease)} />*/}
            </div>
        )
    }
}

export default wireValue(Slider)