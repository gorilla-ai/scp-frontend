import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import im from 'object-path-immutable'

import FormElements from './index'
import {wire} from '../hoc/prop-wire'

let log = require('loglevel').getLogger('react-ui/components/multi-input')

/**
 * A React Multi Input Group, can be used on any type of 'value', string, number, object etc
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string|function} base - React class to use for rendering the input
 * * native dom elements: eg 'input'|'div' etc
 * * react-ui input components: 'ButtonGroup' | CheckboxGroup' | Checkbox' | Combobox' | DatePicker' | DateRange' | Dropdown' | FileInput' | Input' | MultiInput' | RadioGroup' | RangeCalendar' | ToggleButton'
 * * custom defined React class
 * @param {object} [props] - Props for the above react class, see individual doc for the base class
 * @param {string} [className] - Classnames to apply
 * @param {string} [groupClassName] - Classnames to apply to individual input groups
 * @param {boolean} [expand=false] - Should input items expand to fill the horizontal space as restricted by its parent element #id
 * @param {boolean} [inline=false] - Should input items be displayed as inline?
 * @param {boolean} [boxed=false] - Should input items be displayed as boxed areas? This will make remove icon/button appear at top right corner of the box
 * @param {boolean} [disabled=false] - Are input items disabled?
 * @param {boolean} [readOnly=false] - Are input items read only?
 * @param {boolean} [persistKeys=false] - Avoid react conflict resolution by persisting keys? Should be used along side file inputs
 * @param {*} [defaultItemValue=''] - When adding new item, what is the default value of this item?
 * @param {array} [defaultValue] - Default array of input values
 * @param {array} [value] - Current array of input values
 * @param {object} [valueLink] - Link to update values. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {function} [onChange] - Callback function when any of the input is changed/entered. <br> Required when value prop is supplied
 * @param {array} onChange.values - input values
 * @param {object} onChange.eventInfo - event related info
 * @param {array} onChange.eventInfo.before - previous input values
 * @param {renderable} [addText] - Text shown in add button, default to showing '+' icon
 * @param {renderable} [removeText] - Text shown in remove button, default to showing 'x' icon
 *
 * @example

import {MultiInput, Input} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            phones:[]
        }
    },
    handleChange(phones) {
        this.setState({phones})
    },
    render() {
        let {phones} = this.state;
        return <div>
            <label htmlFor='phones'>Enter phones</label>
            <MultiInput id='phones'
                base={Input}
                props={{validate:{
                    pattern:/^[0-9]{10}$/,
                    t:()=>'Incorrect phone number, should read like 0900000000'
                }}}
                inline={true}
                onChange={this.handleChange}
                value={phones}/>
        </div>
    }
})
 */
class MultiInput extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        base: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func
        ]).isRequired,
        props: PropTypes.object,
        expand: PropTypes.bool,
        inline: PropTypes.bool,
        boxed: PropTypes.bool,
        className: PropTypes.string,
        groupClassName: PropTypes.string,
        disabled: PropTypes.bool,
        readOnly: PropTypes.bool,
        persistKeys: PropTypes.bool,
        defaultItemValue: PropTypes.any,
        value: PropTypes.array,
        // required: React.PropTypes.bool,
        onChange: PropTypes.func,
        addText: PropTypes.node,
        removeText: PropTypes.node
    };

    static defaultProps = {
        expand: false,
        inline: false,
        boxed: false,
        disabled: false,
        readOnly: false,
        persistKeys: false,
        defaultItemValue: ''/* ,
        required: false*/
    };

    handleChange = (result) => {
        let {onChange} = this.props
        // onChange(_.compact(result));
        onChange(result)
    };

    modifyInput = (i, newVal) => {
        let {value} = this.props

        // support base react input elements such as 'input'
        if (newVal.target) {
            // newVal should be event e
            newVal = newVal.target.value
        }
        this.handleChange(im.set(value, i, newVal))
    };

    addInput = () => {
        let {value, defaultItemValue} = this.props

        // if value was empty, a default item would have been added to display, so need to append this item
        if (value.length <= 0) {
            value = [...value, defaultItemValue]
        }

        if (this.keys) {
            this.keys.push(_.last(this.keys)+1)
        }

        this.handleChange([...value, defaultItemValue])
    };

    removeInput = (i) => {
        let {value} = this.props

        if (this.keys) {
            if (value.length<=1) {
                // if last item in the list, after removal, still need to create new key
                this.keys = [_.last(this.keys)+1]
            }
            else {
                this.keys = im.del(this.keys, i)
            }
        }

        this.handleChange(im.del(value, i))
    };

    render() {
        const {
            id, base, props: baseProps, value, defaultItemValue,
            /* required, */expand, inline, boxed, disabled, readOnly, persistKeys,
            className, groupClassName, addText, removeText
        } = this.props

        const editable = !(disabled || readOnly)

        const items = (value.length<=0 ? [...value, defaultItemValue] : value)

        // use this.keys to maintain react keys,
        // so adding will always create new key, instead of possibly reusing existing element with same key
        // mainly used for file input, where react doesn't handle conflict resolution for file inputs
        // When persist keys, things will not work when assigning passing new set of value prop to MultiInput
        if (persistKeys && !this.keys) {
            this.keys = _.map(items, (item, i)=>i)
        }

        return <span id={id} className={cx('c-multi', className, {expand, inline, boxed})}>
            {
                _.map(items, (item, i) => {
                    const key = this.keys ? this.keys[i] : i
                    return <span key={key} className={cx('group', groupClassName)}>
                        {
                            React.createElement(
                                _.isString(base)&&_.has(FormElements, base) ? FormElements[base] : base,
                                _.extend(baseProps, {
                                    /* required, */
                                    onChange: this.modifyInput.bind(this, i),
                                    value: item,
                                    disabled,
                                    readOnly
                                })
                            )
                        }
                        {editable && (removeText ?
                            <button onClick={this.removeInput.bind(this, i)} className='standard remove'>{removeText}</button> :
                            <i onClick={this.removeInput.bind(this, i)} className='c-link fg fg-close remove' />
                        )}
                        {editable && !boxed && <button className={cx('standard add', addText?'':'fg fg-add', {disabled:i<items.length-1})} onClick={this.addInput}>{addText}</button>}
                    </span>
                })
            }
            {editable && boxed && <button className={cx('standard add', addText?'':'fg fg-add')} onClick={this.addInput}>{addText}</button>}
        </span>
    }
}

export default wire(MultiInput, 'value', [])
