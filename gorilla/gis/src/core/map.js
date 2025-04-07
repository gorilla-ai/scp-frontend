/**
 * Map related functions.
 *
 * @file   This file is the collection of map-related, or global operation functions.
 * @author Liszt
 */

import _ from 'lodash'
import L from 'leaflet'

import {GIS_ERROR as ERROR} from '../utils/gis-exception'
import dh from '../utils/data-helper'
import rh from '../utils/render-helper'
import sh from '../utils/symbol-helper'
import {
    LAYOUT, DRAG_MODE, REGION_TYPE,
    DRAW_TYPE, SYMBOL_TYPE, EXTRA_SYMBOL_TYPE
} from '../consts/dictionary'

let log = require('loglevel').getLogger('gis/core/map')


/**
 * Changes map's layout.
 * It will remove all layer on the map first, and add back according to new setting.
 *
 * In branch 'develop_mix-layer', add a parameter 'filter' which can change part of the symbols to target layout.
 * Moreover, the behavior in this function also changes. All the layer out will repaint instead of adding the layer back.
 *
 * @param   {String}  layout    Map's layout, which can be standard, heatmap, track, or contour.
 *
 */
export function _setLayout(layout) {
    const map = this._map
    const symbols = this._symbols
    const visible = this._visible
    const currLayout = this._layout

    let heatmap = this._heatmap // heatmap is a leaflet Layer
    // let tracks = this._tracks   // tracks is an array of tracks' Ids
    let contour = this._contour // contour is a L.LayerGroup instance

    // Check if the layout is valid
    const isValidLayout = _.includes(LAYOUT, layout)

    if (isValidLayout && layout !== currLayout) {
        // Clear current layout
        if ((currLayout === LAYOUT.STANDARD) || (currLayout === LAYOUT.TRACK)) {
            _.forEach(symbols, ({id, layer}) => {
                visible[id] && map.removeLayer(layer)
            })

            _.forEach(this._groups, el => {
                map.removeLayer(el.layer)
            })

            if (currLayout === LAYOUT.STANDARD) {
                _.forEach(this._clusters, el => {
                    map.removeLayer(el.layer)
                })

                if (this._gCluster) {
                    map.removeLayer(this._gCluster.layer)
                }
            }
            else {
                this._flagGroup.clearLayers()
            }
        }
        else if (currLayout === LAYOUT.HEATMAP && heatmap) {
            map.removeLayer(heatmap)
        }
        else if (currLayout === LAYOUT.CONTOUR && contour) {
            map.removeLayer(contour)
        }

        // Set new layout
        this._layout = layout
        if (layout === LAYOUT.STANDARD) {
            // Cluster only works in standard mode
            if (this._gCluster) {
                map.addLayer(this._gCluster.layer)
            }

            _.forEach(this._clusters, el => {
                map.addLayer(el.layer)
            })

            _.forEach(this._groups, el => {
                map.addLayer(el.layer)
            })

            _.forEach(symbols, symbol => {
                const {id, props, selectedProps, layer, type, _origProps, _origSelectedProps} = symbol
                const cluster = props.cluster

                const isPoint = type === SYMBOL_TYPE.MARKER || type === SYMBOL_TYPE.SPOT
                const isClustered = isPoint && cluster && visible[id]
                const isSimpleType = type !== EXTRA_SYMBOL_TYPE.TRACK
                const isFlagMode = isPoint &&
                                (!_.isEqual(props, _origProps) || !_.isEqual(selectedProps, _origSelectedProps))

                if (isFlagMode) {
                    symbol.set(_origProps, symbol.selected, _origSelectedProps)
                }

                if (isClustered && cluster === true) {
                    !this._gCluster.layer.hasLayer(layer) &&
                    this._gCluster.layer.addLayer(layer)
                }
                else if (isClustered) {
                    !this._clusters[cluster].layer.hasLayer(layer) &&
                    this._clusters[cluster].layer.addLayer(layer)
                }
                else if (visible[id] && isSimpleType) {
                    !map.hasLayer(layer) && map.addLayer(layer)
                }
            })

            sh.updateClusterSymbol.call(this)
        }
        else if (layout === LAYOUT.HEATMAP) {
            if (!heatmap) {
                rh.renderHeatmap.call(this)
                heatmap = this._heatmap
            }
            else {
                heatmap.addTo(map)
            }
        }
        else if (layout === LAYOUT.TRACK) {
            // (!tracks || (tracks && tracks.length === 0)) && rh.renderTrack.call(this)

            // _.forEach(symbols, ({id, type, props:{track}, layer}) => {
            //     const isOnTrack = visible[id] && track
            //     const isTrack = visible[id] && type === EXTRA_SYMBOL_TYPE.TRACK

            //     if (isOnTrack || isTrack) {
            //         !map.hasLayer(layer) && map.addLayer(layer)
            //     }
            // })

            rh.renderTrack.call(this)
        }
        else if (layout === LAYOUT.CONTOUR) {
            if (!contour) {
                rh.renderContour.call(this)
                contour = this._contour
            }
            else {
                contour.addTo(map)
            }
        }
    }
    else if (!isValidLayout) {
        log.warn(ERROR.INVALID_TYPE, layout, `Please set a valid layout type: ${_.values(LAYOUT)}`)
    }
}

/**
 * Sets the region selection type, which can be circle or rectangle.
 *
 * @see     setRegionType in GIS document.
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#methods
 *
 * @param   {String}  regionType    Region-selection type, which can be circle or rectangle.
 */
export function _setRegionType(regionType) {
    this._map.circleSelector.disable()
    this._map.rectangleSelector.disable()

    const isValidType = !!REGION_TYPE[_.toUpper(regionType)]
    if (isValidType) {
        this._regionType = regionType
        if (this._dragMode === DRAG_MODE.REGION) {
            this._map[`${regionType}Selector`].enable()
        }
    }
    else {
        log.warn(ERROR.INVALID_TYPE, regionType, `Please set a valid region type: ${_.values(REGION_TYPE)}`)
    }
}

/**
 * Sets the draw type and draw config.
 *
 * @see     setDrawType in GIS document.
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#methods
 *
 * @param   {String}  drawType      Map drag mode, it can be pan, region, measure, or draw.
 * @param   {Object} [drawConfig]   Draw configs. It contains key "editableIds", which makes symbols editable (all symbols are editable by default). See setDrawType() in GIS document.
 */
export function _setDrawType(drawType, drawConfig={}) {
    const isValidType = _.includes(DRAW_TYPE, drawType)
    const editableIds = _.map(sh.getSymbol.call(this, _.get(drawConfig, 'editableIds')), 'id')

    const shouldAddToDrawn = symbol => {
        return symbol &&
            symbol.type !== EXTRA_SYMBOL_TYPE.TRACK &&
            symbol.type !== EXTRA_SYMBOL_TYPE.CLUSTER &&
            symbol.type !== SYMBOL_TYPE.GEOJSON
    }

    if (editableIds) {
        if (_.isArray(editableIds)) {
            this._editableIds = _.reduce(editableIds, (acc, el) => {
                if (shouldAddToDrawn(this._symbols[el])) {
                    acc[el] = true
                }

                return acc
            }, {})
        }
        else if (_.isString(editableIds)) {
            if (shouldAddToDrawn(this._symbols[editableIds])) {
                this._editableIds = {[editableIds]:true}
            }
        }
    }
    else {
        this._editableIds = _.reduce(this._symbols, (acc, el) => {
            if (shouldAddToDrawn(this._symbols[el])) {
                acc[el.id] = true
            }

            return acc
        }, {})
    }

    if (isValidType) {
        const shouldEnanble = this._dragMode === DRAG_MODE.DRAW &&
                            (this._layout === LAYOUT.STANDARD || this._layout === LAYOUT.TRACK)

        this._drawType = drawType

        if (shouldEnanble && !this._map.drawMode.enabled()) {
            this._map.drawMode.enable()
        }
        else if (shouldEnanble && this._map.drawMode.enabled()) {
            this._map.drawMode.setDrawType(drawType)
        }
    }
    else {
        log.warn(ERROR.INVALID_TYPE, drawType, `Please set a valid draw type: ${_.values(DRAW_TYPE)}`)
    }
}

/**
 * Sets the drag mode.
 *
 * @see     _setRegionType above
 * @see     _setDrawType above
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#methods
 *
 * @param   {String}  dragMode      Map drag mode, it can be pan, region, measure, or draw.
 * @param   {String}  featureType   For region and draw. Decides what handler to use, .e.g, circle or rectangle selection.
 * @param   {Object} [drawConfig]   Draw configs. See setDrawType() in GIS document.
 */
export function _setDragMode(dragMode, featureType, drawConfig={}) {
    const isValidMode = _.includes(DRAG_MODE, dragMode)

    if (isValidMode) {
        this._dragMode = dragMode
    }
    else {
        log.warn(ERROR.INVALID_TYPE, dragMode, `Please set a valid drag mode: ${_.values(DRAG_MODE)}`)
        return
    }

    if (dragMode === DRAG_MODE.REGION) {
        _setRegionType.call(
            this,
            featureType ||
            this._regionType ||
            REGION_TYPE.RECTANGLE
        )
    }
    else if (dragMode === DRAG_MODE.DRAW) {
        _setDrawType.call(
            this,
            featureType ||
            this._drawType ||
            DRAW_TYPE.MARKER,
            drawConfig
        )
    }
    else {
        if (dragMode === DRAG_MODE.PAN) {
            this._map.dragging.enable()
            this._map.measureMode.disable()
            this._map.drawMode.disable()
        }
        else if (dragMode === DRAG_MODE.MEASURE) {
            this._map.measureMode.enable()
        }

        this._map.circleSelector.disable()
        this._map.rectangleSelector.disable()
    }
}

/**
 * Sets the max-bound of map.
 * The corner coordinates depend on the map CRS, i.e., set the corner according to current CRS.
 *
 * @param   {Object}  corner1               The south-west point of the map, formatter as {lat, lng}.
 * @param   {Object}  corner2               The north-east point of the map, formatter as {lat, lng}.
 * @param   {Boolean} [fitBounds=false]     Reset the map view to fit the max bounds or not.
 */
export function _setMaxBounds(corner1, corner2, fitBounds=false) {
    const map = this._map
    const crs = map.options.crs
    const isEPSG3857 = crs === L.CRS.EPSG3857

    const project = isEPSG3857 ?
                    map.latLngToLayerPoint.bind(map) :
                    crs.projection.project.bind(crs.projection)

    // const unproject = isEPSG3857
    //                 ? map.layerPointToLatLng.bind(map)
    //                 : crs.projection.unproject.bind(crs.projection)

    const isValid = dh.isValidArgType(corner1, 'plainObject') &&
                     _.isNumber(corner1.lat) &&
                     _.isNumber(corner1.lng) &&
                    dh.isValidArgType(corner2, 'plainObject') &&
                     _.isNumber(corner2.lat) &&
                     _.isNumber(corner2.lng)

    if (isValid) {
        const c1 = _.pick(corner1, ['lat', 'lng'])
        const c2 = _.pick(corner2, ['lat', 'lng'])

        const c1LatLng = L.latLng(c1)
        const c2LatLng = L.latLng(c2)

        const p1 = project(c1LatLng)
        const p2 = project(c2LatLng)

        const bounds = crs === L.CRS.Simple ?
                    [[p1.y, p1.x], [p2.y, p2.x]] :
                    L.latLngBounds(c1LatLng, c2LatLng)

        map.setMaxBounds(bounds)

        if (fitBounds) {
            map.fitBounds(bounds)
            const mapZoom = map.getZoom()

            _.forEach(this._overlays, ({layer, zoom}) => {
                if (_.isNumber(zoom) && zoom > mapZoom && map.hasLayer(layer)) {
                    map.removeLayer(layer)
                }
            })
        }
    }
    else {
        log.warn(
            ERROR.INVALID_ARGS,
            {corner1, corner2},
            'Please input valid arguments (corner1={lat=Number, lng=Number}, corner2={lat=Number, lng=Number})'
        )
    }
}

/**
 * Sets the GIS interval.
 *
 * @param   {Number}  term     The GIS interval, formatted as [start timestamp, end timestamp]
 */
export function _setGisInterval(term) {
    const isValid = (_.isArray(term) && term.length === 0) ||
                    (dh.isValidArgType(term, [['number']]) && term.length === 2 && term[0] <= term[1])

    if (isValid) {
        this._interval = term
    }
    else {
        log.warn(ERROR.INVALID_ARGS, term, 'Please input valid interval: [Int start, Int end], or []')
        this._interval = this._interval
    }
}

/**
 * Moves and zooms the map view to the region of symbols matching the filter.
 * If no symbol matches, won't move the map view.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of symbols within the view. If it's a String or String[], finds symbols by ids; if it's a Object, searches symbols by all the props; if it's a Function, gets symbols by the given callback(Symbol symbol, String id, Object gis._symbols)
 */
export function _zoomToFit(filter) {
    const map = this._map

    // Only zoom to the symbols whch exist on the map or visible cluster
    const fitSymbols = _.filter(sh.getSymbol.call(this, filter), ({id, layer, props}) => {
        // Heatmap & contour has no symbol layer on map, so filter by visible
        if (this._layout === LAYOUT.HEATMAP || this._layout === LAYOUT.CONTOUR) {
            return this._visible[id]
        }

        const cluster = props.cluster
        const clusterLayer = cluster === true ?
                            _.get(this._gCluster, 'layer') :
                            _.get(this._clusters, `${cluster}.layer`)

        return map.hasLayer(layer) || (clusterLayer && map.hasLayer(clusterLayer))
    })

    if (!fitSymbols.length) {
        return
    }

    // When only a non-marker symbol is selected, pan to fit the symbol's bound
    const centerOfSymbols = _.map(fitSymbols, symbol => {
        // Polyline need to handle because pattern in directed polyline has no getLatLng()
        const isLine = symbol.type === SYMBOL_TYPE.POLYLINE || symbol.type === EXTRA_SYMBOL_TYPE.TRACK
        const isPoint = symbol.type === SYMBOL_TYPE.MARKER || symbol.type === SYMBOL_TYPE.SPOT
        const isCircle = symbol.type === SYMBOL_TYPE.CIRCLE

        if (isLine) {
            if (symbol.layer instanceof L.Polyline) {
                return symbol.layer.getBounds()
            }
            else {
                const featureGroup = L.featureGroup([])
                symbol.layer.eachLayer(lyr => {
                    (lyr instanceof L.Polyline) && featureGroup.addLayer(lyr)
                })

                return featureGroup.getBounds()
            }
        }
        else if (isCircle) {
            return symbol.layer._latlng
        }
        else if (!isPoint) {
            return symbol.layer.getBounds()
        }
        else {
            return symbol.layer.getLatLng()
        }
    })

    map.fitBounds(centerOfSymbols)
}

/**
 * Clear all symbols, clusters, tracks, groups, heatmap, and contour from the map.
 *
 */
export function _clear() {
    // Remove all symbols/tarcks & heatmap from the map
    if (this._gCluster) {
        this._gCluster.layer.clearLayers()
        this._map.removeLayer(this._gCluster.layer)
    }

    _.forEach(this._clusters, cluster => {
        cluster.layer.clearLayers()
        this._map.removeLayer(cluster.layer)
    })

    _.forEach(this._symbols, symbol => {
        this._map.removeLayer(symbol.layer)
    })

    _.forEach(this._groups, group => {
        this._map.removeLayer(group.layer)
    })

    // Instead of removing heatmap/track/contour layer, remove the data
    !!this._heatmap && this._heatmap.setData({data:[]})
    !!this._contour && this._contour.clearLayers()
    !!this._tracks && _.forEach(this._tracks, id => {
        this._map.hasLayer(this._symbols[id].layer) &&
        this._map.removeLayer(this._symbols[id].layer)
    })
    this._flagGroup.clearLayers()

    this._symbols = {}
    this._clusterSymbols = {}
    this._groups = {}
    this._visible = {}
    // Fix issue #25
    this._selected = {}
    this._clusters = {}
    this._tracks = []
    this._flags = {}
    delete this._gCluster
}

export default {
    _setLayout,
    _setDragMode,
    _setDrawType,
    _setRegionType,
    _setMaxBounds,
    _setGisInterval,
    _zoomToFit,
    _clear
}