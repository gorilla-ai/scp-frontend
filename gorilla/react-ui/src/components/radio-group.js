import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import { LIST_PROP, SIMPLE_VALUE_PROP } from '../consts/prop-types'
import {wireValue} from '../hoc/prop-wire'
import normalizeList from '../hoc/list-normalizer'

let log = require('loglevel').getLogger('react-ui/components/radio-group')


/**
 * A React Radio Group
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {Array.<object>} list - List of options
 * @param {string | number} list.value - item value
 * @param {string} list.text - item display text
 * @param {renderable} [list.children] - things to render after the label
 * @param {string} [className] - Classname for the container
 * @param {string|number} [defaultValue] - Default selected value
 * @param {string|number} [value] - Current selected value
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean} [disabled=false] - Is selection disabled?
 * @param {function} [onChange] - Callback function when value is selected. <br> Required when value prop is supplied
 * @param {string|number} onChange.value - selected value
 * @param {object} onChange.eventInfo - event related info
 * @param {string|number} onChange.eventInfo.before - previously selected value
 *
 * @example
// controlled

import {RadioGroup} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            movie:'oz'
        }
    },
    handleChange(movie) {
        this.setState({movie})
    },
    render() {
        let {movie} = this.state;
        return <div>
            <label>Select a movie</label>
            <RadioGroup id='movie'
                list={[
                    {value:'dory',text:'dory - Finding Dory'},
                    {value:'oz',text:'oz - Wizard of Oz'},
                    {value:'kane',text:'kane - Citizen Kane',children:<input defaultValue='abc'/>}
                ]}
                onChange={this.handleChange}
                value={movie}/>
        </div>
    }
})
 */
class RadioGroup extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        list: LIST_PROP,
        className: PropTypes.string,
        value: SIMPLE_VALUE_PROP,
        disabled: PropTypes.bool,
        onChange: PropTypes.func
    };

    static defaultProps = {
        disabled: false
    };

    handleChange = (evt) => {
        let {onChange} = this.props
        onChange(evt.target.value)
    };

    render() {
        let {id, list, value, disabled, className} = this.props

        let onChange = this.handleChange

        return <div id={id} className={cx('c-radio-group', className)}>
            {
                _.map(list, ({value:itemValue, text:itemText, children}) => {
                    return <div key={itemValue} className='list-item'>
                        <input
                            id={id+'-'+itemValue}
                            type='radio'
                            onChange={disabled ? null : onChange} // workaround for IE: double click on disabled will still trigger onChange
                            value={itemValue}
                            checked={value+''===itemValue+''}
                            disabled={disabled} />
                        <label htmlFor={id+'-'+itemValue} key={itemValue} className={itemValue}>{itemText}</label>
                        {children}
                    </div>
                })
            }
        </div>
    }
}

export default wireValue(normalizeList(RadioGroup))