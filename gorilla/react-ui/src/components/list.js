import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import {wireSet} from '../hoc/prop-wire'
import Checkbox from './checkbox'

let log = require('loglevel').getLogger('react-ui/components/list')

/**
 * A React List view, currently effective classNames are multicols, decimal, disc
 * @todo Better support for defining how many columns; better support for rendering list items
 *
 * @constructor
 * @param {string} [id] - List dom element #id
 * @param {string} [className] - Classname for the container, avaiable built-in classnames:
 * * selectable - Change color when hovering over list item
 * * multicols - SShow list as multi-columns
 * @param {object|array} list - Data list
 * @param {string} [itemIdField='id'] - The field key which will be used as item dom #id
 * @param {string | function} [itemClassName] - Classname of a list item
 * @param {string | function} [itemStyle] - Style of a list item
 * @param {function} [formatter] - Function to render list item
 * @param {object} [selection] - List item selection settings
 * @param {boolean} [selection.enabled=false] - Are list items selectable? If yes checkboxes will appear
 * @param {boolean} [selection.multiSelect=true] - Can select multiple items?
 * @param {string | array.<string>} [defaultSelected] - Selected item id(s)
 * @param {string | array.<string>} [selected] - Default selected item id(s)
 * @param {object} [selectedLink] - Link to update selections. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} selectedLink.value - value to update
 * @param {function} selectedLink.requestChange - function to request value change
 * @param {function} [onSelectionChange] - Callback function when item is selected. <br> Required when selected prop is supplied
 * @param {string | array} onSelectionChange.value - current selected item ids
 * @param {object} onSelectionChange.eventInfo - event related info
 * @param {string | array} onSelectionChange.eventInfo.before - previous selected item ids
 * @param {string} onSelectionChange.eventInfo.id - id triggering change
 * @param {boolean} onSelectionChange.eventInfo.selected - selected?
 * @param {function} [onClick] [description]
 * @param {renderable} [info] - React renderable object, display additional information about the list
 * @param {string} [infoClassName] - Assign className to info node
 *
 * @example

import _ from 'lodash'
import {List} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            movies: _(_.range(0, 200)).map(i=>({id:`${i}`, title:`Movie ${i}`})).value() // 200 movies
        }
    },
    render() {
        const {movies} = this.state
        return <List
            id='movies'
            list={movies}
            itemClassName='c-flex aic'
            selection={{enabled:true}}
            formatter={movie=>`${movie.id} - ${movie.title}`} />
    }
})
 */
class List extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        list: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.array
        ]),
        itemClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        itemStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        itemIdField: PropTypes.string,
        formatter: PropTypes.func,
        selection: PropTypes.shape({
            enabled: PropTypes.bool,
            multiSelect: PropTypes.bool
        }),
        selected: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string)
        ]),
        onSelectionChange: PropTypes.func,
        onClick: PropTypes.func,
        info: PropTypes.node,
        infoClassName: PropTypes.string
    };

    static defaultProps = {
        list: {},
        itemIdField: 'id',
        selection: {
            enabled: false
        }
    };

    handleToggleSelection = (id, selected) => {
        const {selection:{multiSelect=true}, selected:curSelected, onSelectionChange} = this.props
        if (multiSelect) {
            const newSelected = selected ? [...curSelected, id] : _.without(curSelected, id)
            onSelectionChange(newSelected, {id, selected})
        }
        else {
            onSelectionChange(selected ? id : '')
        }
    };

    renderListItem = (item, id) => {
        const {
            formatter,
            itemClassName, itemStyle,
            selection: {enabled:selectable, multiSelect:multiSelectable=true},
            selected,
            onClick
        } = this.props

        let content = item

        if (formatter && _.isFunction(formatter)) {
            content = formatter(item, id)
        }

        let _itemClassName = itemClassName
        if (itemClassName) {
            if (_.isFunction(itemClassName)) {
                _itemClassName = itemClassName(item)
            }
        }

        let _itemStyle = itemStyle
        if (itemStyle) {
            if (_.isFunction(itemStyle)) {
                _itemStyle = itemStyle(item)
            }
        }

        const itemSelected = (multiSelectable && _.includes(selected, id)) || (!multiSelectable && selected===id)
        if (itemSelected) {
            _itemClassName = [_itemClassName, 'selected']
        }

        return <li
            key={id}
            id={id}
            className={cx('c-flex', _itemClassName)}
            style={_itemStyle}
            onClick={onClick ? onClick.bind(null, id, item) : null}>
            {selectable && <Checkbox checked={itemSelected} onChange={this.handleToggleSelection.bind(this, id)} />}
            {content}
        </li>
    };

    render() {
        const {
            id, className,
            list, itemIdField,
            info, infoClassName,
            selection: {enabled:selectable}
        } = this.props

        return <ul id={id} className={cx('c-list', {selectable}, className)}>
            {
                info ?
                    <li className={cx('c-info', infoClassName)}>{info}</li> :
                _.map(list, (item, key) => {
                    return this.renderListItem(item, `${_.get(item, itemIdField, key)}`)
                })
            }
        </ul>
    }
}

export default wireSet(List, {
    selected: {
        changeHandlerName: 'onSelectionChange',
        defaultValue: ({selection={}})=>{
            const {enabled, multiSelect=true} = selection
            if (enabled) {
                return multiSelect ? [] : ''
            }
            return ''
        }
    }
})
