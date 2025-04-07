import React from 'react'


/**
 * A React Grid
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {array.<object>} cols - Columns config
 * @param {string | number} cols.id - Column id
 * @param {renderable} [cols.label] - Column header label
 * @param {array.<object>} rows - Rows config
 * @param {string | number} rows.id - Row id
 * @param {renderable} [rows.label] - Row header label
 * @param {object} [items] - Current items
 * @param {object} items.key - data for this **key** item
 * @param {renderable} [items.key.content] - content to show in grid item
 * @param {*} [items.key.*] - other data of this cell
 * @param {boolean} [selectable=false] - Can grid items be selected?
// * @param {array.<string>} [defaultSelected] - Default Selected item ids
// * @param {array.<string>} [selected] - selected item ids
// * @param {object} [selectedLink] - Link to update selections. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
// * @param {*} selectedLink.value - value to update
// * @param {function} selectedLink.requestChange - function to request value change
 * @param {function} [onSelect] - Callback function when grid item are selected
 * @param {array} onSelect.ids - current selected item ids
// * @param {object} onSelect.eventInfo - event related info
// * @param {array} onSelect.eventInfo.before - previous selected item ids
 * @param {string} [selectingClassName] - Classname for the selecting grid items
 * @param {function} [itemClassName] - Classname (mapping or function) for the grid items
 *
 * @example
import {Grid} from 'react-ui'
import _ from 'lodash'

React.createClass({
    getInitialState() {
        return {
            currentStatus: 'A',
            items: {
                '0-0': {xx:0, status:'A',conent:'xx'},
                '1-0.5': {xx:1, status:'B'},
                '2-1': {xy:2, status:'C',content:<div/>},
                '3-1.5': {status:'D'},
                '4-2': {status:'E'},
                '5-2.5': {status:'F'},
                '6-3': {status:'A'}
            }
        }
    },
    handleSelect(selectedItems) {
        let {items, currentStatus} = this.state
        let newItems = _.reduce(selectedItems, (acc,id)=>{
            acc[id] = {...items[id]||{}, status: currentStatus}
            return acc
        }, {})
        this.setState({items:newItems})
    },
    render() {
        let {currentStatus, items} = this.state
        return <Grid id='schedule'
            className='customize-schedule'
            rows={[
                {id:0, label:'Sunday'},
                {id:1, label:'Monday'},
                {id:2, label:'Tuesday'},
                {id:3, label:'Wednesday'},
                {id:4, label:'Thursday'},
                {id:5, label:'Friday'},
                {id:6, label:'Saturday'}
            ]}
            cols={
                _.map(
                    _.range(0,48),
                    slot=>({id:slot/2, label:(slot%2===0?slot/2:'')})
                )
            }
            items={items}
            selectable={true}
            onSelect={this.handleSelect}
            selectingClassName=`selecting-${currentStatus}`
            itemClassName={({status})=>'cls-'+status} />
    }
})
 */
class Grid extends React.Component {
    render() {
        return <div>To Be Implemented</div>
    }
}

export default Grid