/**
 * @module grid-event
 * @description An event addon for navigating between input cells in grid
 * With this module, a table can be turned into grid, with the following abilities:
 *
 * * left, right, up, down arrows to traverse between input cells
 * * receive row/column change events
 */

import _ from 'lodash'
import $ from 'jquery'


let log = require('loglevel').getLogger('core/mixins/grid-mixin')


function unsubscribe(node) {
    log.debug('unsubscribe')
    $(node).off()
}

/**
 * @typedef {Object} handler
 * @property {function} on attach event, possible events 'row'/'column' change
 * @property {function} unsubscribe unsubscribe from event
 */

/**
 * Subscribe to data grid input traverse events.
 *
 * @param {dom} node - node to attach grid events to
 * @param {boolean} [columnLayout=false] - is the table direction in columns (not rows)?
 * @return {handler} handler for attaching or unsubscribe from the event
 *
 * @example
 * let handler = subscribe(document.getElementById('table'), false)
 *     .on('row', (rowId)=>{ console.log('row changed',rowId)})
 *     .on('column', ()=>{ console.log('column changed')})
 *
 * handler.unsubscribe()
 */
export function subscribe(node, columnLayout=false) {
    log.debug('subscribe')

    let left=37,
        up=38,
        right=39,
        down=40

    if (columnLayout) {
        left = 38
        right = 40
        up = 37
        down = 39
    }

    let handle, register
    let events = {
    }

    register = (type, func) => {
        if (!func || !_.isFunction(func)) {
            log.error('register event failed')
            return null
        }
        if (!type || !_.includes(['row', 'column'], type)) {
            log.error('event type must be row or column')
            return null
        }

        events[type] = func

        return handle
    }

    handle = {
        unsubscribe: unsubscribe.bind(null, node),
        on: register
    }


    $(node).on('keydown', 'input, div[contenteditable]', evt => {
        let key = evt.which
        let input = evt.target
        let name = input.name || input.id
        let tr = $(input).closest('tr')
        let td = $(input).closest('td')
        let targetItem
        switch (key) {
            case left:
            case right:
                targetItem = (key === left ? td.prev() : td.next())
                targetItem && targetItem.find('input, div[contenteditable]').focus()
                events.column && events.column()
                break
            case up:
            case down:
                targetItem = (key === up ? tr.prev() : tr.next())
                if (targetItem && targetItem.length>0) {
                    targetItem.find('input[name="'+name+'"], div[id="'+name+'"][contenteditable]').focus()
                    events.row && events.row(targetItem[0].id)
                }
                break
            default:
                break
        }
    })

    return handle
}


export default subscribe