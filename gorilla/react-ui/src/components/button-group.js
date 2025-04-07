import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import { SIMPLE_VALUE_PROP, SIMPLE_ARRAY_PROP } from '../consts/prop-types'
import {wire} from '../hoc/prop-wire'
import normalizeList from '../hoc/list-normalizer'

const log = require('loglevel').getLogger('react-ui/components/button-group')


/**
 * A React Button Group
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {Array.<object>} list - List of options
 * @param {string | number} list.value - item value
 * @param {string} list.text - item display text
 * @param {string} list.className - classname for item button
 * @param {string} [className] - Classname for the container
 * @param {string|number|Array.<string|number>} [defaultValue] - Default selected value (array if multi=true)
 * @param {string|number|Array.<string|number>} [value] - Current selected value (array if multi=true)
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean|Array.<string|number>} [disabled=false] - Is selection disabled?
 * @param {boolean} [multi=false] - Allow multi-selection?
 * @param {function} [onChange] - Callback function when value is selected. <br> Required when value prop is supplied
 * @param {string|number|Array.<string|number>} onChange.value - selected value (array if multi=true)
 * @param {object} onChange.eventInfo - event related info
 * @param {string|number|Array.<string|number>} onChange.eventInfo.before - previously selected value (array if multi=true)
 *
 * @example
// controlled

import {ButtonGroup} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            type: 'movie',
            types: ['tv']
        }
    },
    handleChange(name, val) {
        this.setState({[name]:val})
    },
    render() {
        const {type, types} = this.state
        return <div className='c-form'>
            <div>
                <label>Select a type</label>
                <ButtonGroup
                    id='type'
                    className='column'
                    list={[
                        {value:'movie', text:'Movie'},
                        {value:'tv', text:'TV'},
                        {value:'actors', text:'Actors'}
                    ]}
                    onChange={this.handleChange.bind(this,'type')}
                    value={type} />
            </div>
            <div>
                <label>Select multiple types (movie disabled)</label>
                <ButtonGroup
                    id='types'
                    className='column'
                    list={[
                        {value:'movie', text:'Movie'},
                        {value:'tv', text:'TV'},
                        {value:'actors', text:'Actors'}
                    ]}
                    multi
                    disabled={['movie']}
                    onChange={this.handleChange.bind(this,'types')}
                    value={types} />
            </div>
        </div>
    }
})
 */
class ButtonGroup extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        list: PropTypes.arrayOf(PropTypes.shape({
            value: SIMPLE_VALUE_PROP,
            text: PropTypes.node,
            className: PropTypes.string
        })),
        className: PropTypes.string,
        value: PropTypes.oneOfType([
            SIMPLE_VALUE_PROP,
            SIMPLE_ARRAY_PROP
        ]),
        disabled: PropTypes.oneOfType([
            PropTypes.bool,
            SIMPLE_ARRAY_PROP
        ]),
        multi: PropTypes.bool,
        onChange: PropTypes.func
    };

    static defaultProps = {
        disabled: false,
        multi: false
    };

    handleSelect = (newVal) => {
        const {onChange, multi, value} = this.props
        onChange(multi ?
            (_.includes(value, newVal)?_.without(value, newVal):[...value, newVal])
            : newVal)
    };

    render() {
        const {id, list, value, disabled, multi, className} = this.props

        return <div id={id} className={cx('c-button-group', className)}>
            {
                _.map(list, ({value:itemValue, text:itemText, className:itemClassName}) => {
                    const selected = multi ? _.includes(value, itemValue) : value===itemValue
                    const isDisabled = (
                        (_.isBoolean(disabled) && disabled) ||
                        (_.isArray(disabled) && _.includes(disabled, itemValue))
                    )
                    return <button
                        key={itemValue}
                        className={cx('thumb', {selected}, itemClassName)}
                        onClick={this.handleSelect.bind(this, itemValue)}
                        disabled={isDisabled}>
                        {itemText}
                    </button>
                })
            }
        </div>
    }
}

export default wire(normalizeList(ButtonGroup), 'value', ({multi})=>(multi?[]:''))