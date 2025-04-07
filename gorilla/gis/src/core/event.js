/**
 * Event related functions.
 *
 * @file   This file is the collection of event-related functions.
 * @author Liszt
 */

import _ from 'lodash'
import L from 'leaflet'

import {DRAG_MODE, EVENT, EXTRA_SYMBOL_TYPE} from '../consts/dictionary'
import {GIS_ERROR as ERROR} from '../utils/gis-exception'
import {fireSelectionChange} from '../utils/setup-helper'
import sh from '../utils/symbol-helper'

let log = require('loglevel').getLogger('gis/core/event')

/**
 * Binds a new event to eventCore.
 * eventCore is considered as an event management in GIS, which is a Leaflet FeatureGroup.
 * All events, in fact, are bound to the feature group, and are executed in it.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#events
 *
 * @param   {String}                                  event      Event type. E.g., click, dblclick, contextmenu, etc. See the GIS document for detail.
 * @param   {String | String[] | Object | function}   [filter]   Symbols filter. Matched symbols will apply the event. Apply to all symbols and map when undefined.
 * @param   {Function}                                handler    Event callback handler.
 *
 */
export function _on(event, filter, handler) {
    // Order the arguments
    const args = {
        event,
        filter: (arguments.length === 3) ? filter : null,
        handler: handler || (_.isFunction(filter) ? filter : null)
    }

    // These 3 types of events only happens on the map
    const isZoom = _.includes(['zoomstart', 'zoom', 'zoomend'], event)
    const isMeasure = _.includes(['measurestart', 'measure', 'measureend'], event)
    const isDrawn = _.includes(['create', 'edit', 'editcontent', 'delete'], event)

    const isInvalidArgs = (!_.isNil(args.filter) && !_.isPlainObject(args.filter)) || !_.isFunction(args.handler)

    // Check event type and arguments are valid or not
    if (!_.includes(EVENT, event)) {
        log.warn(ERROR.INVALID_TYPE, event, `Please input valid events: ${EVENT}`)
        return
    }
    else if ((isZoom || isMeasure || isDrawn) && args.filter) {
        log.warn(
            ERROR.INVALID_ARGS,
            [event, filter, handler],
            'Zoom, measure, and draw related event is global, which means no filter is required.'
        )

        return
    }
    else if (isInvalidArgs) {
        log.warn(
            ERROR.INVALID_ARGS,
            [event, filter, handler],
            'The arguments should be (String event, Object filter?, Function handler)'
        )

        return
    }

    const map = this._map

    // Consider eventHandler as an handler entry.
    // Save it in a global Object variable for unbinding
    let eventHandler = null

    if (isZoom) {
        eventHandler = e => {
            const zoom = map.getZoom()        // Current zoom level
            const bounds = map.getBounds()    // Current bounds

            args.handler(e, {
                zoom,
                bounds: {
                    southWest: {y:bounds._southWest.lat, x:bounds._southWest.lng},
                    northEast: {y:bounds._northEast.lat, x:bounds._northEast.lng}
                }
            })
        }
    }
    else if (isMeasure) {
        eventHandler = e => {
            if (this._dragMode === DRAG_MODE.MEASURE) {
                args.handler(e.event, e.pathInfo, e.layers)
            }
        }
    }
    else if (isDrawn) {
        eventHandler = e => {
            if (this._dragMode === DRAG_MODE.DRAW) {
                // Here, e.symbol is a plain object, not Symbol instance
                args.handler(e.event, e.symbol)
            }
        }
    }
    else {
        eventHandler = e => {
            L.DomEvent.stop(e)

            // Prevent unexpected behavior in measure & draw mode.
            const shouldStop = this._dragMode === DRAG_MODE.MEASURE ||
                            this._dragMode === DRAG_MODE.DRAW

            if (shouldStop) {
                return
            }

            const isMultiple = e.isMultiple === true // triggered by region selection or setSelection()

            const targetId = _.get(e, 'layer._gis_id')
            const symbol = targetId ?
                            this._symbols[targetId] || this._clusterSymbols[targetId] || this._flags[targetId] :
                            undefined

            const type = _.get(symbol, 'type', undefined)

            // Get symbols which match the filter
            const matchedIds = args.filter ?
                                sh.getSymbol.call({_symbols:{...this._symbols, ...this._flags}}, args.filter, true, 'id') :
                                _.concat(_.keys(this._symbols), _.keys(this._flags))

            // Enhancement for fixing the issue in off()
            // For excluding the symbols matched in off() filter
            const excludeIds = _.get(args, 'excludeIds', [])

            // Symbols to be triggered in the event
            const eventIds = type === EXTRA_SYMBOL_TYPE.CLUSTER
                            ? symbol.props.data.ids
                            : type ? [symbol.id] : []

            // Pick up the symbolId which matches the filter then excluding the ones should be removed due to off()
            const triggerIds = _.difference(_.intersection(matchedIds, eventIds), excludeIds)
            const hasMatch = triggerIds.length > 0

            // Event on cluster parent
            if (type === EXTRA_SYMBOL_TYPE.CLUSTER && hasMatch) {
                if (e.type === 'selectionChange') {
                    args.handler(e, triggerIds)
                }
                else {
                    args.handler(e, triggerIds, {cluster:_.get(symbol, 'props.data.cluster')})
                }

                map.fire('clusterselectionChange')
            }
            // Event on symbol
            else if (type && type !== EXTRA_SYMBOL_TYPE.CLUSTER && hasMatch) {
                args.handler(e, triggerIds[0])
            }
            // Event on map
            else if (!type && !isMultiple) {
                args.handler(e, null)
            }
            // Event by region selection or by setSelection()
            else if (isMultiple) {
                args.handler(e, this.selected.length === 0 ? null : this.selected)
            }
        }
    }

    /*
        Handler is for matching the one from external, wrapped as eventHandler.
        eventHandler is the one we should utilize to remove in off() method
    */
    args.eventHandler = eventHandler
    this._eventMap.push(args)

    if (!isZoom && !isMeasure && !isDrawn) {
        this._eventCore.on(event, eventHandler)
    }

    if (!args.filter) {
        map.on(event, eventHandler)
    }
}

/**
 * Unbinds a event.
 * Here, it updates the filter saved in _on function,
 * and adds a excluedIds for skipping symbols shouldn't trigger event.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#events
 *
 * @param   {String}                                  event      Event type. E.g., click, dblclick, contextmenu, etc. See the GIS document for detail.
 * @param   {String | String[] | Object | function}   [filter]   Symbols filter. Matched symbols will not apply the target event. Apply to all symbols and map when undefined.
 * @param   {Function}                                [handler]  Event callback handler to be removed. Remove all the specific event handler when undefined.
 *
 */
export function _off(event, filter, handler) {
    const args = {
        event,
        filter: (arguments.length === 3) ? filter : null,
        handler: handler || (_.isFunction(filter) ? filter : null)
    }

    const isZoomOrDraw = _.includes(['zoomstart', 'zoom', 'zoomend', 'measurestart', 'measure', 'measureend'], event)
    const isInvalidArgs = (!_.isNil(args.filter) && !_.isPlainObject(args.filter)) ||
                        (!_.isNil(args.handler) && !_.isFunction(args.handler))

    // Check event type and arguments are valid or not
    if (!_.includes(EVENT, event)) {
        log.warn(ERROR.INVALID_TYPE, event, `Please input valid events: ${EVENT}`)
        return
    }
    else if (isZoomOrDraw && args.filter) {
        log.warn(
            ERROR.INVALID_ARGS,
            [event, filter, handler],
            'Zoom or measure related event is global, which means no filter is required.'
        )

        return
    }
    else if (isInvalidArgs) {
        log.warn(
            ERROR.INVALID_ARGS,
            [event, filter, handler],
            'The arguments should be (String event, Object filter?, Function handler?)'
        )

        return
    }

    const map = this._map
    const evtIdx = _.findIndex(this._eventMap, evt => evt.handler === handler)
    const record = evtIdx > -1 ? this._eventMap[evtIdx] : null

    // If handler is specified, and no filter or the filter is the same as the record, remove the event
    if (record && (!args.filter || _.isEqual(record.filter, args.filter))) {
        map.off(args.event, this._eventMap[evtIdx].eventHandler)
        this._eventCore.off(args.event, this._eventMap[evtIdx].eventHandler)
        this._eventMap.slice(evtIdx, 1)
    }
    // If filter and (record or no handler), remove matched symbols' events, by adding the exclude filter
    else if ((record || !args.handler) && args.filter) {
        if (record) {
            // For fixing new symbols can't apply event
            if (!record.exclude) {
                record.exclude = []
            }

            record.exclude.push(args.filter)
            record.excludeIds = _.uniq(_.reduce(record.exclude, (acc, excld) => {
                return _.concat(acc, sh.getSymbol.call(this, excld, true, 'id'))
            }, []))
        }
        else {
            _.forEach(this._eventMap, evt => {
                if (evt.event === args.event) {
                    // For fixing new symbols can't apply event
                    if (!evt.exclude) {
                        evt.exclude = []
                    }

                    evt.exclude.push(args.filter)
                    evt.excludeIds = _.uniq(_.reduce(evt.exclude, (acc, excld) => {
                        return _.concat(acc, sh.getSymbol.call(this, excld, true, 'id'))
                    }, []))
                }
            })
        }
    }
    // If no filter and no handler, remove all handlers of the event
    else if (!args.filter && !args.handler) {
        map.off(args.event)
        this._eventCore.off(args.event)

        _.remove(this._eventMap, evt => evt.event === args.event)

        // Re-bind the basic click event
        if (args.event === 'click') {
            this._eventCore.on('click', fireSelectionChange.bind(this))
        }
    }
}

export default {
    _on,
    _off
}