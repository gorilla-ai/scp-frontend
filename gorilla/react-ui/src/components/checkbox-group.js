import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import { SIMPLE_VALUE_PROP, SIMPLE_ARRAY_PROP } from '../consts/prop-types'
import { wire } from '../hoc/prop-wire'
import normalizeList from '../hoc/list-normalizer'
import Checkbox from './checkbox'

const log = require('loglevel').getLogger('react-ui/components/checkbox-group')

/**
 * A React Checkbox Group
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {Array.<object>} list - List of items
 * @param {string | number} list.value - item value
 * @param {renderable} list.text - item display text
 * @param {string} list.className - item classname
 * @param {renderable} [list.children] - things to render after the label
 * @param {string} [className] - Classname for the container
 * @param {Array.<string|number>} [defaultValue] - Default checked values
 * @param {Array.<string|number>} [value] - Current checked values
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean|Array.<string|number>} [disabled=false] - true/false if disable all checkboxes, or array of values to disable specific checkboxes
 * @param {boolean} [toggleAll=false] - Show toggle all checkbox?
 * @param {string} [toggleAllText='All'] - Text shown in toggle all label
 * @param {function} [onChange] - Callback function when any of the checkboxes is ticked/unticked. <br> Required when value prop is supplied
 * @param {Array.<string|number>} onChange.values - current checked values
 * @param {object} onChange.eventInfo - event related info
 * @param {Array.<string|number>} onChange.eventInfo.before - previously checked values
 * @param {string|number} onChange.eventInfo.value - which value triggered change?
 * @param {boolean} onChange.eventInfo.checked - checked or unchecked?
 *
 * @example
// controlled

import {CheckboxGroup} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            movies:[1]
        }
    },
    handleChange(movies) {
        this.setState({movies})
    },
    render() {
        let {movies} = this.state;
        return <div>
            <label>Select movies</label>
            <CheckboxGroup
                list={[
                    {value:1,text:'1d - Finding Dory (selected by default, cannot deselect)'},
                    {value:2,text:'2 - Wizard of Oz'},
                    {value:3,text:'3 - Citizen Kane'}
                ]}
                onChange={this.handleChange}
                value={movies}
                disabled={[1]}/>
        </div>
    }
})
 */
class CheckboxGroup extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        list: PropTypes.arrayOf(PropTypes.shape({
            value: SIMPLE_VALUE_PROP,
            text: PropTypes.node,
            className: PropTypes.string,
            children: PropTypes.node
        })).isRequired,
        className: PropTypes.string,
        value: SIMPLE_ARRAY_PROP,
        disabled: PropTypes.oneOfType([
            PropTypes.bool,
            SIMPLE_ARRAY_PROP
        ]),
        toggleAll: PropTypes.bool,
        toggleAllText: PropTypes.string,
        onChange: PropTypes.func
    };

    static defaultProps = {
        disabled: false,
        toggleAll: false,
        toggleAllText: 'All'
    };

    getDisabledItems = () => {
        const {disabled, list} = this.props
        let disabledItems = []
        if (_.isBoolean(disabled)) {
            if (disabled) {
                disabledItems = _.map(list, 'value')
            }
            else {
                disabledItems = []
            }
        }
        else if (_.isArray(disabled)) {
            disabledItems = disabled
        }
        return disabledItems
    };

    getSelectableItems = () => {
        const {list} = this.props
        return _.without(_.map(list, 'value'), ...this.getDisabledItems())
    };

    handleChange = (value, checked) => {
        const {value:curValue, onChange} = this.props
        const newValue = (checked ? [...curValue, value] : _.without(curValue, value))
        onChange(newValue, {value, checked})
    };

    handleToggleAll = (checked) => {
        const {onChange, value} = this.props
        const disabledItems = this.getDisabledItems()
        const selectableItems = this.getSelectableItems()
        const disabledSelectedItems = _.intersection(disabledItems, value)
        const newValue = (checked ? [...selectableItems, ...disabledSelectedItems] : disabledSelectedItems)
        onChange(newValue, {checked})
    };

    render() {
        const {id, toggleAll, toggleAllText, className, list, value} = this.props
        const disabledItems = this.getDisabledItems()
        const numSelected = _.without(value, ...disabledItems).length
        const numSelectable = this.getSelectableItems().length

        return <div id={id} className={cx('c-checkbox-group', className)}>
            {
                toggleAll && numSelectable>0 && <span className='all list-item'>
                    <Checkbox
                        id={id+'-_all'}
                        checked={numSelected>0}
                        className={cx({partial:numSelected>0 && numSelected<numSelectable})}
                        onChange={this.handleToggleAll} />
                    <label htmlFor={id+'-_all'}>{toggleAllText}</label>
                </span>
            }
            {
                _.map(list, ({value:itemValue, text:itemText, className:itemClassName, children}) => {
                    return <span className={cx('list-item', itemClassName)} key={itemValue}>
                        <Checkbox
                            id={id+'-'+itemValue}
                            onChange={this.handleChange.bind(this, itemValue)}
                            value={itemValue}
                            checked={value.indexOf(itemValue)>=0}
                            disabled={_.includes(disabledItems, itemValue)} />
                        <label htmlFor={id+'-'+itemValue}>{itemText}</label>
                        {children}
                    </span>
                })
            }
        </div>
    }
}

export default wire(normalizeList(CheckboxGroup), 'value', [])