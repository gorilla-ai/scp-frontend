import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import $ from 'jquery'

import {wire} from '../hoc/prop-wire'

let log = require('loglevel').getLogger('react-ui/components/toggle-button')

/**
 * A React toggle button
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {boolean} [defaultOn] - Default on value
 * @param {boolean} [on=false] - Current on value
 * @param {object} [onLink] - Link to update check value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} onLink.value - value to update
 * @param {function} onLink.requestChange - function to request check value change
 * @param {boolean} [disabled=false] - Is toggle button disabled?
 * @param {function} onChange  - Callback function when toggle on/off. <br> Required when value prop is supplied
 * @param {boolean} onChange.on - on?
 * @param {object} onChange.eventInfo - event related info
 * @param {boolean} onChange.eventInfo.before - was on or off?
 * @param {string} [onText] - Text shown in toggle when the toggle is turned on
 * @param {string} [offText] - Text shown in toggle when the toggle is turned off
 *
 * @example
// controlled

import {ToggleButton} from 'react-ui'
React.createClass({
    getInitialState() {
        return {subscribe:false}
    },
    handleChange(subscribe) {
        this.setState({subscribe})
    },
    render() {
        let {subscribe} = this.state
        return <div className='c-flex aic'>
            <label htmlFor='subscribe'>Would you like to subscribe to this newsletter?</label>
            <ToggleButton id='subscribe'
                onChange={this.handleChange}
                on={subscribe}/>
        </div>
    }
})
 */
class ToggleButton extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        on: PropTypes.bool,
        disabled: PropTypes.bool,
        onChange: PropTypes.func,
        onText: PropTypes.string,
        offText: PropTypes.string
    };

    static defaultProps = {
        disabled: false,
        on: false
    };

    componentDidMount() {
        if (this.props.id && !this.props.disabled) {
            this.getLabelForToggle().on('click', () => {
                this.handleChange()
            })
        }
    }

    componentWillUnmount() {
        this.getLabelForToggle().off()
    }

    getLabelForToggle = () => {
        return $(this.node).parent().find('label[for="'+this.props.id+'"]')
    };

    handleChange = () => {
        let {onChange, on} = this.props
        onChange(!on)
    };

    render() {
        let {id, className, on, disabled, onText, offText} = this.props

        return (
            <div id={id} ref={ref=>{ this.node=ref }} className={cx('c-toggle-btn', {disabled}, className)}>
                <input
                    type='checkbox'
                    onChange={disabled ? null : this.handleChange}
                    checked={on}
                    disabled={disabled} />
                <div>
                    <label htmlFor={id} className='on'>{onText}</label>
                    <label htmlFor={id} className='off'>{offText}</label>
                    <span />
                </div>
            </div>
        )
    }
}

export default wire(ToggleButton, 'on', false)