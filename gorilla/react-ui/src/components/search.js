import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import cx from 'classnames'

import { SIMPLE_VALUE_PROP } from '../consts/prop-types'
import {wire} from '../hoc/prop-wire'

let log = require('loglevel').getLogger('react-ui/components/search')

/**
A React Search bar
 * @constructor
 * @param {string} [id] - container element #id
 * @param {string} [className] - Classname for the container
 * @param {string} [placeholder] - Placeholder for search input
 * @param {string|number} [defaultValue] - Default search value
 * @param {string|number} [value] - Current search value
 * @param {boolean} [enableClear=true] - Can this field be cleared?
 * @param {boolean} [interactive=false] - Determine if search is interactive<br>
 * @param {number} [delaySearch=0] - If search is interactive, this setting will trigger onSearch event after *delaySearch* milliseconds<br>
 * true: onSearch event called as user types; <br>
 * false: onSearch event called when user hits enter
 * @param {function} [onSearch] - Callback function when search is changed. <br> Required when value prop is supplied
 * @param {string|number} onSearch.search - updated search value
 *
 * @example

import {Search} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            movies:[]
        }
    },
    handleSearch(search) {
        // after ajax request get back list of movies
        let movies = ['My big fat greek wedding','Starlight Hotel']
        this.setState({movies})
    },
    render() {
        let {movies} = this.state;
        return <div>
            <Search placeholder='Please enter movie title' onSearch={this.handleSearch}/>
            <div>
            {
                _.map(movies, (movie, i)=>`${i}. ${movie}`)
            }
            </div>
        </div>
    }
})
 */
class Search extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        placeholder: SIMPLE_VALUE_PROP,
        value: SIMPLE_VALUE_PROP,
        onSearch: PropTypes.func.isRequired,
        enableClear: PropTypes.bool,
        interactive: PropTypes.bool,
        delaySearch: PropTypes.number
    };

    static defaultProps = {
        enableClear: false,
        interactive: false,
        delaySearch: 0
    };

    constructor(props) {
        super(props);
        let {value} = props

        this.state = {
            value
        };
    }

    componentWillReceiveProps(nextProps) {
        let {value} = nextProps
        this.setState({
            value
        })
    }

    focus = () => {
        this.input.focus()
    };

    handleSearch = (value, force) => {
        let {interactive, onSearch, delaySearch} = this.props
        if (force || interactive) {
            const searchText = _.trim(value).toLowerCase()
            if (interactive) {
                if (this.timer) {
                    clearTimeout(this.timer)
                    delete this.timer
                }

                this.setState({value}, ()=>{
                    this.timer = setTimeout(()=>{
                        this.timer = null
                        onSearch(searchText)
                    }, delaySearch)
                })
            }
            else {
                onSearch(searchText)
            }
        }
        else {
            this.setState({value})
        }
    };

    handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            this.handleSearch(this.state.value, true)
        }
    };

    render() {
        let {id, className, enableClear, placeholder} = this.props
        let {value} = this.state

        return <span id={id} ref={ref=>{ this.node=ref }} className={cx('c-search', className, {clearable:enableClear})}>
            <input
                ref={ref=>{ this.input=ref }}
                type='text'
                value={value}
                placeholder={placeholder}
                onKeyDown={this.handleKeyDown}
                onChange={(evt)=>{ this.handleSearch(evt.target.value, false) }} />
            <span className='actions c-flex aic'>
                {enableClear && <i className='fg fg-close' onClick={()=>{ this.handleSearch('', true) }} />}
                <i className='fg fg-search' onClick={()=>{ this.handleSearch(value, true) }} />
            </span>
        </span>
    }
}

export default wire(Search, 'value', '', 'onSearch')