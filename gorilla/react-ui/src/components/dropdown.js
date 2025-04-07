import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import { LIST_PROP, SIMPLE_VALUE_PROP } from '../consts/prop-types'
import {wireValue} from '../hoc/prop-wire'
import normalizeList from '../hoc/list-normalizer'

let log = require('loglevel').getLogger('react-ui/components/dropdown')

/**
 * A React (single-select) DropDown List
 * @constructor
 * @param {string} [id] - Input element #id
 * @param {string} [name] - Input element name
 * @param {number} [size=1] - Number of items to display
 * @param {Array.<object>} list - List of items
 * @param {string | number} list.value - item value
 * @param {string} list.text - item display text
 * @param {string} [className] - Classname for the container
 * @param {string} [defaultText] - Default text to display when nothing is selected
 * @param {string|number} [defaultValue] - Default selected value
 * @param {string|number} [value] - Current selected value
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean} [required=false] - Is this field mandatory?
 * @param {boolean} [disabled=false] - Is this field disabled?
 * @param {boolean} [readOnly=false] - Is this field readonly?
 * @param {function} [onChange] - Callback function when item is selected. <br> Required when value prop is supplied
 * @param {string|number} onChange.value - selected value
 * @param {object} onChange.eventInfo - event related info
 * @param {string|number} onChange.eventInfo.before - previously selected value
 *
 * @example
// controlled

import {Dropdown} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            movie:'',
            director:''
        }
    },
    handleChange(field, value) {
        this.setState({[field]:value})
    },
    render() {
        let {movie, director} = this.state;
        return <div className='c-form'>
            <div>
                <label htmlFor='movie'>Select movie (optional)</label>
                <Dropdown id='movie'
                    list={[
                        {value:'fd',text:'Finding Dory'},
                        {value:'woo',text:'Wizard of Oz'},
                        {value:'ck',text:'Citizen Kane'}
                    ]}
                    onChange={this.handleChange.bind(this,'movie')}
                    defaultValue='fd'
                    value={movie}/>
            </div>
            <div>
                <label htmlFor='director'>Select director (mandatory)</label>
                <Dropdown id='director'
                    list={[
                        {value:'a',text:'Steven Spielberg'},
                        {value:'b',text:'Spike'},
                        {value:'c',text:'Lynch'},
                        {value:'d',text:'Bergman'}
                    ]}
                    size={3}
                    required={true}
                    onChange={this.handleChange.bind(this,'director')}
                    defaultText='Please select a director'
                    value={director}/>
            </div>
        </div>
    }
})
 */
class Dropdown extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        name: PropTypes.string,
        size: PropTypes.number,
        list: LIST_PROP,
        className: PropTypes.string,
        defaultText: SIMPLE_VALUE_PROP,
        value: SIMPLE_VALUE_PROP,
        required: PropTypes.bool,
        disabled: PropTypes.bool,
        readOnly: PropTypes.bool,
        onChange: PropTypes.func
    };

    static defaultProps = {
        required: false,
        disabled: false,
        readOnly: false,
        size: 1
    };

    handleChange = (evt) => {
        let {onChange} = this.props
        onChange(evt.target.value)
    };

    render() {
        let {id, name, size, list, value, disabled, readOnly,
            required, defaultText, className} = this.props

        let found = false
        if (value != null) {
            found = _.find(list, item => {
                return (item.value+'')===(value+'')
            })
        }

        return <select
            id={id}
            name={name}
            className={cx({invalid:!found&&required}, className)}
            onChange={readOnly?null:this.handleChange}
            required={required}
            value={value}
            size={size}
            readOnly={readOnly}
            disabled={readOnly || disabled}>
            {
                (!found || !required) && <option key='_' value=''>{defaultText || ''}</option>
            }
            {
                _.map(list, ({value:itemValue, text:itemText}) => {
                    return <option key={itemValue} value={itemValue}>{itemText}</option>
                })
            }
        </select>
    }
}

export default wireValue(normalizeList(Dropdown))
