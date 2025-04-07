/**
 * Symbol related functions.
 *
 * @file   This file is the collection of symbol-related functions.
 * @author Liszt
 */

import _ from 'lodash'

import rh from '../utils/render-helper'
import sh from '../utils/symbol-helper'
import {GIS_ERROR as ERROR} from '../utils/gis-exception'
import {LAYOUT, SYMBOL_TYPE, EXTRA_SYMBOL_TYPE} from '../consts/dictionary'

let log = require('loglevel').getLogger('gis/core/symbol')

/**
 * Removes the empty cluster or group layers for performance.
 *
 * @param {Object[]} collections        Cluster/LayerGroup collections.
 * @param {String}   collectionType     The collection's type, group or cluster.
 */
function _collectEmpties(collections, collectionType) {
    if ((collectionType !== 'group' && collectionType !== 'cluster') || _.isEmpty(collections)) {
        return
    }

    const path = `_props.${collectionType}`
    // Interate to get all the collections which should be reserved
    const reserved = _.reduce(this._symbols, (acc, sbl) => {
        const val = _.get(sbl, path)
        const shouldAdd = val && collections[val] && !acc[val]

        if (shouldAdd) {
            acc[val] = true
        }

        return acc
    }, {})

    // If reserved's length is not the same as the original one, some collections must be empty.
    // That is, they should be removed from map
    if (_.keys(collections).length !== _.keys(reserved).length) {
        _.forEach(collections, ({id, layer}) => {
            if (!reserved[id]) {
                this._map.hasLayer(layer) && this._map.removeLayer(layer)
                delete collections[id]
            }
        })
    }
}

/**
 * Removes the empty cluster layers for performance.
 *
 */
function _collectEmptyClusters() {
    const countGlobal = this._gCluster ?
                        _.filter(this._symbols, sbl => _.get(sbl, '_props.cluster') === true).length :
                        undefined

    if (countGlobal === 0) {
        this._map.hasLayer(this._gCluster.layer) && this._map.removeLayer(this._gCluster.layer)
        delete this._gCluster
    }

    _collectEmpties.call(this, this._clusters, 'cluster')
}

/**
 * Removes the empty layerGroup layers for performance.
 *
 */
function _collectEmptyGroups() {
    _collectEmpties.call(this, this._groups, 'group')
}

/**
 * Creates/updates symbols.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 *
 * @param {Object | Object[]}   item        Symbol objects, formatted as {id, type, latlng, selected......}
 *
 */
export function _setSymbol(item) {
    const items = _.isArray(item) ? _.cloneDeep(item) : [_.cloneDeep(item)]
    const currLayout = this._layout
    const simpleTypes = _.omit(SYMBOL_TYPE, ['POPUP', 'CUSTOM'])
    const origSymbolCount = _.keys(this._symbols).length

    _.forEach(items, el => {
        const type = _.toUpper(el.type)
        const isSimpleType = !!simpleTypes[type] || !!EXTRA_SYMBOL_TYPE[type]
        const isPoint = el.type === SYMBOL_TYPE.MARKER || el.type === SYMBOL_TYPE.SPOT
        const sbl = (el.type === SYMBOL_TYPE.MARKER) || (el.type === SYMBOL_TYPE.SPOT)
                ? {...el, _truncateLabels:this._truncateLabels}
                : el

        // Reset the start/end flag to the original props/selectedProps
        const isFlagMode = isPoint &&
                            _.get(this._symbols, `${el.id}._origProps`) &&
                            !_.isEqual(this._symbols[el.id]._origProps, this._symbols[el.id]._props)

        if (this._symbols[el.id] && isFlagMode && this._layout === LAYOUT.TRACK) {
            this._symbols[el.id].set(
                this._symbols[el.id]._origProps,
                this._symbols[el.id].selected,
                this._symbols[el.id]._origSelectedProps
            )
        }

        // Symbol type can be determined in symbolOptions if matched
        if (isSimpleType || !el.type) {
            sh.renderSymbol.call(this, sbl)
        }
        // else if (sbl.type === SYMBOL_TYPE.POPUP) {
        //     // TBD
        // }
        // else if (sbl.type === SYMBOL_TYPE.CUSTOM) {
        //     // TBD
        // }
        else {
            log.warn(
                ERROR.INVALID_TYPE,
                `${el.id}: ${el.type}`,
                `Please input valid symbol type: ${_.values(SYMBOL_TYPE)}`
            )
        }

        // Clone the props/selectedProps in standard mode
        // This is for switching back to standard style when set layout from 'track' to 'standard'
        if (isPoint) {
            this._symbols[el.id]._origProps = _.cloneDeep(this._symbols[el.id]._props)
            this._symbols[el.id]._origSelectedProps = _.cloneDeep(this._symbols[el.id]._selectedProps)
        }
    })

    // Create new symbols as virtual ones or update virtual symbols in draw mode
    if (this._map.drawMode.enabled() && this._drawType === 'edit') {
        // Set to other mode also disable the drawMode
        this.setDragMode('pan')
        setTimeout(() => this.setDragMode('draw', this._drawType), 500)
    }

    // Repaint the map
    // TODO: a better solution?
    this._layout = LAYOUT.STANDARD
    if (this._tracks) {
        delete this._tracks
    }

    if (this._heatmap) {
        this._map.hasLayer(this._heatmap) && this._map.removeLayer(this._heatmap)
        delete this._heatmap
    }

    if (this._contour) {
        this._map.hasLayer(this._contour) && this._map.removeLayer(this._contour)
        delete this._contour
    }

    if (currLayout !== LAYOUT.STANDARD) {
        this.setLayout(currLayout)
    }

    // Reset the exclude ids of events
    if (origSymbolCount !== _.keys(this._symbols).length) {
        _.forEach(this._eventMap, evt => {
            if (evt.exclude) {
                evt.excludeIds = _.uniq(_.reduce(evt.exclude, (acc, excld) => {
                    return _.concat(acc, sh.getSymbol.call(this, excld, true, 'id'))
                }, []))
            }
        })
    }

    // Symbols' cluster or group may be changed
    _collectEmptyClusters.call(this)
    _collectEmptyGroups.call(this)

    sh.updateClusterSymbol.call(this)
}

/**
 * Removes symbols which match the filter.
 *
 * @param {String | String[] | Object | Function}   Filter      Filter of symbols to be removed.
 *
 */
export function _removeSymbol(filter) {
    const rmSymbolIds = (!_.isFunction(filter) && _.isEmpty(filter))
                    ? []
                    : _.filter(sh.getSymbol.call(this, filter, true, 'id'), id => {
                        return this._symbols[id].type !== EXTRA_SYMBOL_TYPE.TRACK
                    })

    if (rmSymbolIds.length > 0) {
        let needClusterCollection = false
        let needGroupCollection = false

        _.forEach(rmSymbolIds, id => {
            const sblLayer = this._symbols[id].layer
            const group = this._symbols[id].props.group
            const cluster = this._symbols[id].props.cluster
            const isGlobalCluster = cluster === true

            if (cluster) {
                const clusterLayer = isGlobalCluster ?
                                    this._gCluster.layer :
                                    this._clusters[cluster].layer

                clusterLayer.removeLayer(sblLayer)
                needClusterCollection = clusterLayer.getLayers().length === 0
            }

            if (this._visible[id]) {
                delete this._visible[id]
                // Removing a layer from layerGroup will also remove from it from map
                if (group) {
                    this._groups[group].layer.removeLayer(sblLayer)
                    _.remove(this._groups[group].children, sblId => id === sblId)
                }
                else {
                    this._map.removeLayer(sblLayer)
                }
            }

            if (group) {
                needGroupCollection = this._groups[group].children.length === 0
            }

            // Fix issue #25
            if (this._selected[id]) {
                delete this._selected[id]
            }

            // Remove layer from layerGroup won't fire map's removelayer event
            // (we have a removelayer event in map to remove virtual layers)
            // Need directly remove the virtual ones in group
            this._map.fire('virtualremove', {layer:sblLayer})

            delete this._symbols[id]
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

        // Reset the exclude ids of events
        _.forEach(this._eventMap, evt => {
            if (evt.exclude) {
                evt.excludeIds = _.uniq(_.reduce(evt.exclude, (acc, excld) => {
                    return _.concat(acc, sh.getSymbol.call(this, excld, true, 'id'))
                }, []))
            }
        })

        // Empty clusters/groups collection
        needClusterCollection && _collectEmptyClusters.call(this)
        needGroupCollection && _collectEmptyGroups.call(this)

        sh.updateClusterSymbol.call(this)
    }
}

export default {
    _setSymbol,
    _removeSymbol
}