import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import _str from 'underscore.string'

import { LIST_PROP, SIMPLE_VALUE_PROP } from '../consts/prop-types'
import {wire} from '../hoc/prop-wire'
import normalizeList from '../hoc/list-normalizer'
import Popover from './popover'
import Search from './search'
import CheckboxGroup from './checkbox-group'
import {subscribe} from '../utils/outside-event'


const log = require('loglevel').getLogger('react-ui/components/combobox')

class PopupList extends React.Component {
    static propTypes = {
        info: PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.func
        ]),
        infoClassName: PropTypes.string,
        list: LIST_PROP,
        selected: PropTypes.oneOfType([
            PropTypes.arrayOf(SIMPLE_VALUE_PROP),
            SIMPLE_VALUE_PROP
        ]),
        search: PropTypes.object,
        multiSelect: PropTypes.object,
        onSelect: PropTypes.func.isRequired,
        onClickOutside: PropTypes.func.isRequired
    };

    static defaultProps = {
        multiSelect: {enabled:false},
        search: {enabled:false}
    };

    componentDidMount() {
        this.handler = subscribe(this.node)
            .onOutside(this.onClickOutside)

        this.focusSearchInput()
    }

    componentDidUpdate() {
        this.focusSearchInput()
    }

    componentWillUnmount() {
        this.handler.unsubscribe()
    }

    onClickOutside = (target) => {
        this.props.onClickOutside(target)
    };

    onSelect = (selected, data) => {
        this.props.onSelect(selected, data)
    };

    focusSearchInput = () => {
        if (this.searchComp) {
            this.searchComp._component.focus()
        }
    };

    render() {
        const {selected, search, multiSelect, list, info, infoClassName} = this.props
        const infoText = _.isFunction(info) ? info(list) : info

        return <div ref={ref=>{ this.node=ref }} className='c-combo-list c-flex fdc'>
            {search.enabled && <Search className='asc' ref={ref=>{ this.searchComp=ref }} {...search} />}
            <div className='list'>
                {
                    multiSelect.enabled ? <CheckboxGroup
                        {...multiSelect}
                        list={list}
                        onChange={this.onSelect}
                        value={selected} />
                    : <div className='c-flex fdc'>
                        {
                            _.map(list, ({value, text}) => {
                                return <span
                                    key={value}
                                    className={cx('list-item', {selected:selected===value})}
                                    onClick={this.onSelect.bind(this, value, {text})}>
                                    {text}
                                </span>
                            })
                        }
                    </div>
                }
                {infoText && <div className={cx('c-info', infoClassName)}>{infoText}</div>}
            </div>
        </div>
    }
}

/**
 * A React Combobox that can dynamically load (via callback function) and update list when user types into input.<br>
 * Can be seen as a dropdown with typing/filtering feature.
 * @constructor
 * @param {string} [id] - Input element #id
 * @param {string} [name] - Input element name
 * @param {Array.<object>} list - List of items
 * @param {string | number} list.value - item value
 * @param {string} list.text - item display text
 * @param {string} [className] - Classname for the container
 * @param {renderable | function} [info] - React renderable object or function producing renderable object, display additional information about the list
 * @param {array.<object>} info.list - argument for **info** function, list of currently displayed items
 * @param {string} [infoClassName] - Assign className to info node
 * @param {string | number | Array.<string|number>} [defaultValue] - Default selected value
 * @param {string | number | Array.<string|number>} [value] - Current selected value
 * @param {object} [valueLink] - Link to update value. Used in conjuction with {@link module:linked-state-mixins linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {object} [multiSelect] - multi-select configuration
 * @param {boolean} [multiSelect.enabled=false] - Allow multi-select (checkbox)?
 * @param {boolean} [multiSelect.toggleAll=false] - Allow toggle all?
 * @param {string} [multiSelect.toggleAllText='All'] - Text to show on toggle all label
 * @param {object} [search] - search/filter configuration
 * @param {boolean} [search.enabled=false] - Allow search/filter list?
 * @param {string} [search.placeholder] - Placeholder for search input
 * @param {boolean} [search.enableClear=true] - Can this field be cleared?
 * @param {boolean} [search.interactive=true] - Determine if search is interactive
 * @param {number} [search.delaySearch=750] - If search is interactive, this setting will trigger onSearch event after *delaySearch* milliseconds<br>
 * true: onSearch event called as user types; <br>
 * false: onSearch event called when user hits enter
 * @param {function} [search.onSearch] - Callback function when search is changed. <br> Required when value prop is supplied
 * @param {string|number} search.onSearch.search - updated search value
 * @param {boolean} [required=false] - Is this field mandatory?
 * @param {boolean} [disabled=false] - Is this field disabled?
 * @param {boolean} [enableClear=true] - Can this field can be cleared?
 * @param {string} [placeholder] - Placeholder for input
 * @param {function} [onChange] - Callback function when item is selected. <br> Required when value prop is supplied
 * @param {string | number | Array.<string|number>} onChange.value - selected value(s)
 * @param {object} onChange.eventInfo - event related info
 * @param {string | number | Array.<string|number>} onChange.eventInfo.before - previously selected value(s)
 * @param {string} onChange.eventInfo.text - currently selected text
 *
 * @example
// controlled

import $ from 'jquery'
import cx from 'classnames'
import {Combobox} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            movie: {
                selected: 'test',
                eventInfo: null,
                info: null,
                error: false,
                list: [{value:'test', text:'TEST'}]
            },
            tv: {
                selected: [],
                eventInfo: null,
                info: null,
                error: false,
                list: []
            }
        }
    },
    handleChange(field, value, eventInfo) {
        this.setState(
            im(this.state)
                .set(field+'.selected', value)
                .set(field+'.eventInfo', eventInfo)
                .value()
        )
    },
    handleSearch(type, text) {
        // ajax to fetch movies, but doesn't need to be ajax
        this.setState(
            im(this.state)
                .set(type+'.list', [])
                .set(type+'.error', false)
                .set(type+'.info', 'Loading...')
                .value(),
            () => {
                $.get(
                    `https://api.themoviedb.org/3/${text?'search':'discover'}/${type}`,
                    {
                        api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                        query: text
                    })
                    .done(({results:list=[], total_results:total=0})=>{
                        if (total <= 0) {
                            this.setState(
                                im(this.state)
                                    .set(type+'.list', [])
                                    .set(type+'.info', `No ${type} found`)
                                    .value()
                            )
                        }
                        else {
                            this.setState(
                                im(this.state)
                                    .set(type+'.list', _.map(list, ({id, name, title})=>({value:id, text:title||name})))
                                    .set(type+'.info', total>10 ? `There are ${total} results, only show the first 10 records` : null)
                                    .value()
                            )
                        }
                    })
                    .fail((xhr)=>{
                        this.setState(im.set(this.state, type+'.error', xhr.responseText))
                    })
            }
        )
    },
    render() {
        return <div className='c-form'>
            {
                ['movie', 'tv'].map(type=>{
                    let {info, error, list, selected} = this.state[type]

                    return <div key={type}>
                        <label htmlFor={type}>Select {type}</label>
                        <Combobox
                            id={type}
                            required={true}
                            onChange={this.handleChange.bind(this, type)}
                            search={{
                                enabled: true,
                                onSearch:this.handleSearch.bind(this, type)
                            }}
                            info={info}
                            infoClassName={cx({'c-error':error})}
                            list={list}
                            placeholder={type}
                            enableClear={type==='tv'}
                            multiSelect={{
                                enabled:type==='tv',
                                toggleAll:true,
                                toggleAllText:'All'
                            }}
                            value={selected} />
                    </div>
                })
            }
        </div>
    }
})

 */
class Combobox extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        name: PropTypes.string,
        list: LIST_PROP,
        className: PropTypes.string,
        info: PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.func
        ]),
        infoClassName: PropTypes.string,
        value: PropTypes.oneOfType([
            SIMPLE_VALUE_PROP,
            PropTypes.arrayOf(SIMPLE_VALUE_PROP)
        ]),
        multiSelect: PropTypes.shape({
            enabled: PropTypes.bool,
            toggleAll: PropTypes.bool,
            toggleAllText: PropTypes.string
        }),
        search: PropTypes.shape({
            enabled: PropTypes.bool,
            placeholder: PropTypes.string,
            onSearch: PropTypes.func,
            interactive: PropTypes.bool,
            enableClear: PropTypes.bool,
            delaySearch: PropTypes.number
        }),
        required: PropTypes.bool,
        disabled: PropTypes.bool,
        enableClear: PropTypes.bool,
        placeholder: PropTypes.string,
        onChange: PropTypes.func
    };

    static defaultProps = {
        list: [],
        multiSelect: {
            enabled: false
        },
        search: {
            enabled: false
        },
        disabled: false,
        enableClear: true,
        required: false
    };

    state = {
        isListOpen: false,
        searchText: '',
        searchIsSelected: true,
        cachedValueText: {}
    };

    componentWillReceiveProps(nextProps) {
        const {multiSelect:{enabled:multiSelectable}, value:nextValue, list:nextList} = nextProps
        const {value, list} = this.props
        const {searchIsSelected, cachedValueText} = this.state
        const valueChanged = JSON.stringify(value) !== JSON.stringify(nextValue)
        const listChanged = JSON.stringify(list) !== JSON.stringify(nextList)

        if (valueChanged || listChanged) {
            log.debug('componentWillReceiveProps::value/list changed', {value, nextValue, list, nextList})
            this.setState({
                searchIsSelected: valueChanged ? true : searchIsSelected,
                cachedValueText: { // cache old text in case returned new list (via onSearch) does not include the old value
                    ..._.reduce(multiSelectable ? value : [value], (acc, v)=>{
                        return {
                            ...acc,
                            [v]: _.get(_.find(list, {value:v}), 'text', v)
                        }
                    }, {}),
                    ...cachedValueText
                }
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {search:{delaySearch=750, onSearch}} = this.props
        const {searchIsSelected, searchText, isListOpen} = this.state
        const {searchText:prevSearchText, isListOpen:wasListOpen} = prevState

        log.debug('componentDidUpdate', prevState, this.state, prevProps, this.props)
        if (isListOpen) {
            log.debug('componentDidUpdate::isListOpen')
            if (!wasListOpen) {
                log.debug('componentDidUpdate::was closed')
                if (onSearch) {
                    log.debug('performing search when list is opened')
                    onSearch(searchText)
                }
                else {
                    this.showList()
                }
            }
            else if (!searchIsSelected && searchText !== prevSearchText) {
                log.debug('componentDidUpdate::search changed', {searchText, prevSearchText})
                if (onSearch) {
                    if (this.timer) {
                        log.debug('clearing search timer')
                        clearTimeout(this.timer)
                        delete this.timer
                    }
                    this.timer = setTimeout(()=>{
                        this.timer = null
                        log.debug('performing search', searchText)
                        onSearch(searchText)
                    }, delaySearch)
                }
                else {
                    this.showList(true)
                }
            }
            else {
                this.showList(true)
            }
        }
        else if (wasListOpen) {
            Popover.close()
        }
    }

    onSelect = (selected, data) => {
        const {onChange, multiSelect:{enabled:multiSelectable}} = this.props

        if (multiSelectable) {
            onChange(selected, data)
        }
        else {
            this.setState({isListOpen:false, searchIsSelected:true}, () => {
                onChange(selected, data)
                this.input.focus()
            })
        }
    };

    onInput = (evt) => {
        const searchText = evt.target ? evt.target.value : evt
        this.setState({isListOpen:true, searchText, searchIsSelected:false})
    };

    getListPosition = () => {
        const input = this.input.getBoundingClientRect()
        return {x:input.left, y:input.bottom}
    };

    showList = (updateOnly) => {
        const {searchText} = this.state
        let {list, value, search, info, infoClassName, multiSelect} = this.props
        const {onSearch, enabled:enableSearch} = search
        const popupWidth = this.input.getBoundingClientRect().width

        if (enableSearch && !onSearch) {
            // not dynamic search, try to filter list by input value
            list = _.filter(list, item=>{
                return item.text.toLowerCase().indexOf(searchText.toLowerCase()) >= 0
            })
        }

        Popover.open(
            this.getListPosition(),
            <PopupList
                list={list}
                multiSelect={multiSelect}
                search={multiSelect.enabled && enableSearch ? {
                    enableClear: true,
                    interactive: true,
                    ...search,
                    value: searchText,
                    onSearch: this.onInput
                } : {enabled:false}}
                selected={value}
                onSelect={this.onSelect}
                onClickOutside={this.handleListClickOutside}
                info={info} infoClassName={infoClassName} />,
            {
                pointy: false,
                className: 'no-shadow',
                updateOnly,
                style: {
                    minWidth: popupWidth,
                    borderWidth: 1,
                    borderColor: '#a9a9a9',
                    borderStyle: 'solid',
                    borderRadius: '5px',
                    padding: 0,
                    backgroundColor: 'rgb(255, 255, 255)',
                    color: 'inherit',
                    overflowX: 'hidden'
                }
            }
        )
    };

    handleListClickOutside = (target) => {
        if (target!==this.clearIcon && target!==this.toggleIcon && target!==this.input) {
            this.toggleList()
        }
    };

    toggleList = () => {
        const {isListOpen} = this.state
        this.setState({isListOpen:!isListOpen, searchText:'', searchIsSelected:true})
    };

    formatDisplayText = () => {
        const {list, value, multiSelect} = this.props
        const {cachedValueText, searchIsSelected, searchText} = this.state

        if (multiSelect.enabled) {
            const items = _(value).map(item=>_.find(list, {value:item})||{value:item, text:cachedValueText[item]}).map('text').value()
            const itemsToShow = _.take(items, 3)

            return itemsToShow.join(', ') + (items.length>3?` (+${items.length-3})`:'')
        }
        else {
            let formatted = ''
            if (searchIsSelected) {
                if (value) {
                    let selectedItem = null
                    selectedItem = _.find(list, {value})||{value, text:cachedValueText[value]}
                    formatted = selectedItem ? selectedItem.text : ''
                }
            }
            else {
                formatted = searchText
            }
            return formatted
        }
    };

    render() {
        const {
            id, name, className, required, placeholder, enableClear, /* defaultValue,*/
            disabled, list, value, multiSelect: {enabled:multiSelectable}, search: {enabled:enableSearch}
        } = this.props

        const displayText = this.formatDisplayText(list, value)

        return <span className={cx('c-combobox', className, {multi:multiSelectable, clearable:enableClear})}>
            <input
                type='text'
                ref={(ref)=>{ this.input=ref }}
                id={id}
                name={name}
                className={cx({invalid:required && _str.isBlank(displayText)})}
                onChange={!multiSelectable && enableSearch ? this.onInput : ()=>{}}
                required={required}
                placeholder={placeholder}
                value={displayText}
                disabled={disabled} />
            {!disabled && <span className='actions c-flex aic'>
                {enableClear && <i className='fg fg-close' ref={ref=>{ this.clearIcon=ref }} onClick={this.onSelect.bind(this, multiSelectable?[]:'', {text:''})} />}
                <i className='fg fg-arrow-bottom' ref={ref=>{ this.toggleIcon=ref }} onClick={this.toggleList} />
            </span>}
        </span>
    }
}

export default wire(normalizeList(Combobox), 'value', ({multiSelect})=>(_.get(multiSelect, 'enabled', false)?[]:''))