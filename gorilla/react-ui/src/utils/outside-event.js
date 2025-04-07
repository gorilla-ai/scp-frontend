/**
  * @module outside-event
  * @description A subscription for clicking on inside/outside events
  */

import _ from 'lodash'
import $ from 'jquery'

let log = require('loglevel').getLogger('core/utils/outside-event')

function unsubscribe() {
    log.debug('unsubscribe')
    $('html').off()
}

/**
 * @typedef {Object} handler
 * @property {function} onInside attach inside event
 * @property {function} onOutside attach outside event
 * @property {function} unsubscribe unsubscribe from event
 */

/**
 * Subscribe to inside/outside events.
 * @param {dom} node - node to initialze handler for
 * @return {handler} handler for attaching or unsubscribe from the event
 *
 * @example
 * let handler = subscribe(document.getElementById('region'))
 *     .onInside(target=>{ console.log('inside is clicked') })
 *     .onOutside(target=>{ console.log('outside is clicked') })
 *
 * handler.unsubscribe()
 */
export function subscribe(node) {
    log.debug('subscribe')

    let onInside, onOutside, handle

    let register = (type, func) => {
        if (!func || !_.isFunction(func)) {
            log.error('register event failed')
            return null
        }
        if (type==='inside') {
            onInside = func
        }
        else if (type === 'outside') {
            onOutside = func
        }
        else {
            log.error('unsupported event type', type)
        }
        return handle
    }


    handle = {
        unsubscribe,
        onInside: register.bind(null, 'inside'),
        onOutside: register.bind(null, 'outside')
    }

    $('html').on('click', evt => {
        let target = evt.target

        if (node) {
            if (target.id!=='overlay' && $.contains(node, target)) {
                onInside && onInside(target)
            }
            else {
                onOutside && onOutside(target)
            }
        }
    })

    return handle
}


export default subscribe