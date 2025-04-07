import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import $ from 'jquery'

import {wireChecked} from '../hoc/prop-wire'

const log = require('loglevel').getLogger('react-ui/components/checkbox')

/**
 * A React Checkbox
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {boolean} [defaultChecked] - Default checked value
 * @param {boolean} [checked] - Current checked value
 * @param {object} [checkedLink] - Link to update check value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} checkedLink.value - value to update
 * @param {function} checkedLink.requestChange - function to request check value change
 * @param {boolean} [disabled=false] - Is checkbox disabled?
 * @param {function} onChange  - Callback function when checkbox is ticked/unticked. <br> Required when value prop is supplied
 * @param {boolean} onChange.checked - checked?
 * @param {object} onChange.eventInfo - event related info
 * @param {boolean} onChange.eventInfo.before - was checked or unchecked?
 *
 * @example
// controlled

import {Checkbox} from 'react-ui'
React.createClass({
    getInitialState() {
        return {subscribe:false}
    },
    handleChange(subscribe) {
        this.setState({subscribe})
    },
    render() {
        const {subscribe} = this.state;
        return <div className='c-flex aic'>
            <label htmlFor='subscribe'>Would you like to subscribe to this newsletter?</label>
            <Checkbox id='subscribe'
                onChange={this.handleChange}
                checked={subscribe}/>
        </div>
    }
})
 */
class Checkbox extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        checked: PropTypes.bool,
        disabled: PropTypes.bool,
        onChange: PropTypes.func
    };

    static defaultProps = {
        disabled: false
    };

    componentDidMount() {
        if (this.props.id && !this.props.disabled) {
            this.getLabelForCheckbox().on('click', (evt) => {
                this.handleChange(evt)
            })
        }
    }

    componentWillUnmount() {
        this.getLabelForCheckbox().off()
    }

    getLabelForCheckbox = () => {
        return $(this.node).parent().find('label[for="'+this.props.id+'"]')
    };

    handleChange = (evt) => {
        evt.stopPropagation()
        const {onChange, checked} = this.props
        onChange(!checked)
    };

    render() {
        const {id, className, checked, disabled} = this.props
        return <i
            id={id}
            ref={ref=>{ this.node=ref }}
            onClick={disabled?null:this.handleChange}
            className={cx('c-checkbox', 'fg', checked?'fg-checkbox':'fg-checkbox-outline', {disabled}, className)} />
    }
}


export default wireChecked(Checkbox)