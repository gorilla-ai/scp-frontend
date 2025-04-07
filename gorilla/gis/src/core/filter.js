/**
 * Filter related functions.
 *
 * @file   This file is the collection of filter-related functions.
 * @author Liszt
 *
 */

import _ from 'lodash'

import dh from '../utils/data-helper'
import sh from '../utils/symbol-helper'
import rh from '../utils/render-helper'
import {LAYOUT, EXTRA_SYMBOL_TYPE} from '../consts/dictionary'

/**
 * Filters symbols' ids by timestamp.
 *
 * @param   {Object[]}  filterIds   The symbols' ids to be filtered. Formatted as {[symbolId]:true}.
 * @param   {Number[]}  interval    GIS interval, formatted as [start timestamp, end timestamp].
 *
 */
export function _filterIdsByTimestamp(filterIds, interval) {
    if (_.isArray(interval) && interval.length === 2 && interval[0] <= interval[1]) {
        _.forEach(filterIds, (val, sblId) => {
            const symbol = this._symbols[sblId]
            const isExcluded = !symbol.props.ts ||
                                (_.isArray(symbol.props.ts) && symbol.props.ts.length === 0) ||
                                !dh.isBetween(symbol.props.ts, interval)

            if (isExcluded) {
                delete filterIds[sblId]
            }
        })
    }
}

/**
 * Show symbols matched the filter within the interval.
 * If interval is not defined, it won't filter symbols by time.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of symbols to show. If a String or String[], it's symbols' ids; Object is for symbols' props; Function should return Boolean to get symbols; undefined will apply to all symbols.
 * @param   {Number[]}                               interval   GIS interval, formatted as [start timestamp, end timestamp].
 *
 */
export function _showSymbol(filter, interval=[]) {
    const map = this._map
    const symbols = this._symbols
    const shownIds = _.filter(sh.getSymbol.call(this, filter, true, 'id'), id => {
        return symbols[id].type !== EXTRA_SYMBOL_TYPE.TRACK
    })

    if (_.isArray(interval) && interval.length === 2) {
        _filterIdsByTimestamp.call(this, shownIds, interval)
    }

    _.forEach(shownIds, id => {
        const layer = symbols[id].layer
        const {cluster, group} = symbols[id].props

        const isClustered = this._layout === LAYOUT.STANDARD && cluster

        const isStdOrTrk = ((this._layout === LAYOUT.STANDARD) ||
                            (this._layout === LAYOUT.TRACK && symbols[id].props.track)) &&
                            !map.hasLayer(layer)

        group &&
        (!cluster && isStdOrTrk) &&
        this._groups[group] &&
        !this._groups[group].layer.hasLayer(layer) &&
        this._groups[group].layer.addLayer(layer)

        if (cluster === true && isClustered && this._gCluster) {
            !this._gCluster.layer.hasLayer(layer) && this._gCluster.layer.addLayer(layer)
        }
        else if (isClustered && this._clusters[cluster]) {
            !this._clusters[cluster].layer.hasLayer(layer) && this._clusters[cluster].layer.addLayer(layer)
        }
        else if (isStdOrTrk) {
            layer.addTo(map)
        }

        this._visible[id] = true
        this._map.drawMode.enabled() && this._map.fire('virtualadd', {layer})
    })

    !!this._contour && rh.renderContour.call(this)
    !!this._heatmap && rh.renderHeatmap.call(this)
    if (this._tracks) {
        rh.renderTrack.call(this)
    }

    // Need to update the cluster data and their labels
    map.fire('clusterselectionChange')
}

/**
 * Hide symbols matched the filter within the interval.
 * If interval is not defined, it won't filter symbols by time.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of symbols to hide. If a String or String[], it's symbols' ids; Object is for symbols' props; Function should return Boolean to get symbols; undefined will apply to all symbols.
 * @param   {Number[]}                               interval   GIS interval, formatted as [start timestamp, end timestamp].
 *
 */
export function _hideSymbol(filter, interval=[]) {
    const map = this._map
    const symbols = this._symbols
    const hiddenIds = _.filter(sh.getSymbol.call(this, filter, true, 'id'), id => {
        return symbols[id].type !== EXTRA_SYMBOL_TYPE.TRACK
    })

    if (_.isArray(interval) && interval.length === 2) {
        _filterIdsByTimestamp.call(this, hiddenIds, interval)
    }

    _.forEach(hiddenIds, id => {
        const layer = this._symbols[id].layer
        const {cluster, group} = this._symbols[id].props

        delete this._visible[id]

        group &&
        this._groups[group] &&
        this._groups[group].layer.hasLayer(layer) &&
        this._groups[group].layer.removeLayer(layer)

        if (cluster === true) {
            this._gCluster &&
            this._gCluster.layer.hasLayer(layer) &&
            this._gCluster.layer.removeLayer(layer)
        }
        else {
            this._clusters[cluster] &&
            this._clusters[cluster].layer.hasLayer(layer) &&
            this._clusters[cluster].layer.removeLayer(layer)
        }

        map.hasLayer(layer) && map.removeLayer(layer)
        this._map.drawMode.enabled() && this._map.fire('virtualremove', {layer})
    })

    this._contour && rh.renderContour.call(this)
    this._heatmap && rh.renderHeatmap.call(this)
    if (this._tracks) {
        rh.renderTrack.call(this)
    }

    // Need to update the cluster data and their labels
    map.fire('clusterselectionChange')
}

/**
 * Filter symbols matched the filter within the interval.
 * Symbols which don't match the filter will be hidden.
 * If interval is not defined, it won't filter symbols by time.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of symbols to show. If a String or String[], it's symbols' ids; Object is for symbols' props; Function should return Boolean to get symbols; undefined will apply to all symbols.
 * @param   {Number[]}                               interval   GIS interval, formatted as [start timestamp, end timestamp].
 *
 */
export function _filterSymbol(filter, interval=[]) {
    const { _map: map, _layout } = this
    const symbols = this._symbols
    const filterIds = (!_.isFunction(filter) && (filter !== true && _.isEmpty(filter)))
                    ? {}
                    : _.reduce(sh.getSymbol.call(this, filter, true, 'id'), (acc, id) => {
                        if (symbols[id].type !== EXTRA_SYMBOL_TYPE.TRACK) {
                            acc[id] = true
                        }

                        return acc
                    }, {})

    if (_.isArray(interval) && interval.length === 2) {
        _filterIdsByTimestamp.call(this, filterIds, interval)
    }

    if (!_.isEmpty(filterIds)) {
        _.forEach(symbols, ({ id, layer, props: { cluster, group }}) => {
            const isShown = !!filterIds[id];
            const { _groups: {[ group ]: _group }} = this;
            const layerMgr = _layout !== LAYOUT.STANDARD ? null : !cluster ? map : ((cluster === true ? this._gCluster : this._clusters[cluster]) || {}).layer;

            if (_group && !cluster && this._layout === LAYOUT.STANDARD)
              _group.layer[ isShown && !_group.layer.hasLayer(layer) ? 'addLayer' : 'removeLayer' ](layer);

            if (layerMgr && layerMgr.hasLayer(layer) === !isShown)
              layerMgr[ isShown ? 'addLayer' : 'removeLayer' ](layer);
            else if (!isShown)
              layer.remove();

            if (isShown)
              this._visible[id] = true;
            else
              delete this._visible[id];

            map.drawMode.enabled() && map.fire(isShown ? 'virtualadd' : 'virtualremove', { layer });
        })

        if (this._heatmap) {
            rh.renderHeatmap.call(this)
        }

        if (this._tracks) {
            rh.renderTrack.call(this)
        }

        if (this._contour) {
            rh.renderContour.call(this)
        }
    }
    else {
        // Hide all symbols when filter is empty
        _hideSymbol.call(this)
    }

    // Need to update the cluster data and their labels
    map.fire('clusterselectionChange')
}

export default {
    _filterIdsByTimestamp,
    _showSymbol,
    _hideSymbol,
    _filterSymbol
}