/**
 * This file defines & implements region selection, measure, and draw modes.
 *
 * @file   Defines & implements rectangle/circle selection, measure mode, and draw mode.
 * @author Liszt
 */

import _ from 'lodash'

import {DEFAULT_REGION_STYLE, DEFAULT_TRACK_STYLE} from '../consts/style'
import {DRAG_MODE, SYMBOL_TYPE, DRAW_TYPE, EXTRA_SYMBOL_TYPE, STYLE_DICT, LAYOUT} from '../consts/dictionary'
import gh from '../utils/gis-helper'

/**
 * Creates circle-region selection handler.
 * The handler is extend from L.Draw.Circle (see leaflet.draw plugin)
 * For futher study, see node-modules/leaflet.draw/dist/leaflet.draw-src.js or the link.
 *
 * @link    https://github.com/Leaflet/Leaflet.draw/blob/develop/src/draw/handler/Draw.Circle.js
 *
 * @param {Leaflet} L           Leaflet module
 *
 * @return {Leaflet handler}    The circle selection handler, which select a circle region on map.
 */
export function createCircleHandler(L) {
    const that = this

    // Extend L.Draw.Circle as circle selector
    return L.Draw.Circle.extend({
        options: {
            shapeOptions: DEFAULT_REGION_STYLE,
            showRadius: false,
            metric: true   // Whether to use the metric measurement system or imperial
        },

        // Called when the handler is enabled
        addHooks() {
            L.Draw.Feature.prototype.addHooks.call(this)
            if (this._map) {
                this._map
                    .on('mousedown', this._onMouseDown, this)
                    .on('mousemove', this._onMouseMove, this)
                    .on('mouseup', this._onMouseUp, this)
                    .dragging.disable()

                this._map.rectangleSelector.disable()
                this._map.measureMode.disable()
                this._map.drawMode.disable()

                this._map._container.style.cursor = 'crosshair'
            }
        },

        removeHooks() {
            delete this._shape

            this._map
                .off('mousedown', this._onMouseDown, this)
                .off('mousemove', this._onMouseMove, this)
                .off('mouseup', this._onMouseUp, this)

            if (that._dragMode === DRAG_MODE.PAN) {
                this._map.dragging.enable()
            }

            this._map._container.style.cursor = '-webkit-grab'
        },

        _onMouseMove(e) {
            // Fix issue #1 and #2
            // e.originalEvent.buttons === 1 means Primary button
            if (e.originalEvent.buttons === 1 && this._isDrawing) {
                this._drawShape(e.latlng)
            }
        },

        _onMouseUp() {
            const shape = this._shape
            if (shape) {
                const map = this._map
                const mapBounds = map.getBounds()
                const prevMapSelected = _.cloneDeep(that._selected)

                // For performance, filter the symbols within the current view
                const symbols = _.reduce({...that._symbols, ...that._clusterSymbols, ...that._flags}, (acc, el, key) => {
                    const isPoint = el.type === SYMBOL_TYPE.MARKER ||
                                    el.type === SYMBOL_TYPE.SPOT ||
                                    el.type === EXTRA_SYMBOL_TYPE.CLUSTER

                    const clusterId = el.props.cluster
                    const clusterLyr = clusterId ?
                                        clusterId === true ? that._gCluster.layer : that._clusters[clusterId].layer :
                                        null

                    const hasLayer = map.hasLayer(el.layer) ||
                                    (clusterLyr &&
                                    map.hasLayer(clusterLyr) &&
                                    clusterLyr.hasLayer(el.layer))

                    if (isPoint) {
                        const isWithin = mapBounds.contains(el.layer.getLatLng())
                        if (isWithin && hasLayer) {
                            acc[key] = el
                        }
                        else if (!isWithin && el.isSelected()) {
                            el.setSelected(false)
                        }
                    }
                    // TODO: how to filter other symbol types
                    else if (hasLayer) {
                        acc[key] = el
                    }

                    return acc
                }, {})

                const eventObj = {
                    containerPoint: map.latLngToContainerPoint(shape._latlng),
                    latlng: shape._latlng,
                    layerPoint: map.latLngToLayerPoint(shape._latlng),
                    radius: shape._mRadius,
                    target: map,
                    type: 'selectionChange',
                    isMultiple: true
                }

                const circleCenter = shape.getLatLng()
                const radius = shape.getRadius()  // in meters
                // Convert circle to polygon to generate geojson
                // const circlePolygon = gh.convertCircleToPolygon(circleCenter, radius, 128, 0, 360, map.options.crs)
                const circlePolygon = gh.convertCircleToPolygon(shape, map, {vertices:180})
                let isChanged = false

                // Reset the selection
                that._selected = {}

                _.forEach(symbols, el => {
                    if (that._selected[el.id]) {
                        return
                    }

                    let isSelected = false

                    const isPoint = el.type === SYMBOL_TYPE.MARKER ||
                                    el.type === SYMBOL_TYPE.SPOT ||
                                    el.type === EXTRA_SYMBOL_TYPE.CLUSTER

                    if (isPoint) {
                        const elCenter = el.layer.getLatLng()
                        const distance = map.options.crs.distance(circleCenter, elCenter)

                        // Check the marker is in the circle or not
                        isSelected = distance <= radius
                    }
                    else {
                        // Convert symbol & polygon to geojson, then check the line intersection
                        const symbolGeo = el.type === SYMBOL_TYPE.CIRCLE
                                        ? gh.convertCircleToPolygon(el.layer, map, {
                                            vertices: 180,
                                            startFrom: el.props.startAngle || 0,
                                            stopAt: el.props.stopAngle || 360
                                        }).toGeoJSON()
                                        : el.layer.toGeoJSON()

                        const drawnGeo = circlePolygon.toGeoJSON()

                        const isIntersect = gh.isIntersect(symbolGeo, drawnGeo)
                        const isOverlap = gh.isOverlap(symbolGeo, drawnGeo)

                        if (isIntersect || isOverlap) {
                            isSelected = true
                        }
                    }

                    // Set symbol's 'selected' prop
                    el.setSelected(isSelected)
                    if (isSelected && el.type !== EXTRA_SYMBOL_TYPE.CLUSTER) {
                        that._selected[el.id] = true
                    }

                    if (isSelected && el.type === EXTRA_SYMBOL_TYPE.CLUSTER) {
                        const allChildren = _.map(el.layer.getAllChildMarkers(), '_gis_id')
                        const children = _.reduce(allChildren, (acc, id) => {
                            that._symbols[id].setSelected(true)
                            acc[id] = true
                            return acc
                        }, {})

                        that._selected = {...that._selected, ...children}
                    }
                })

                // Trigger selectionChange event of map
                isChanged = !_.isEqual(that._selected, prevMapSelected)
                if (isChanged && map.listens('selectionChange')) {
                    // Fire 'clusterselectionChange' is for re-render selected cluster
                    map.fire('selectionChange', eventObj)
                        .fire('clusterselectionChange', eventObj)
                }

                // Reset the drawn region
                map.removeLayer(shape)
                delete this._shape
            }
        }
    })
}

/**
 * Creates rectangle-region selection handler.
 * The handler is extend from L.Draw.Rectangle (see leaflet.draw plugin)
 * For futher study, see node-modules/leaflet.draw/dist/leaflet.draw-src.js or the link.
 *
 * @link    https://github.com/Leaflet/Leaflet.draw/blob/develop/src/draw/handler/Draw.Rectangle.js
 *
 * @param {Leaflet} L           Leaflet module
 *
 * @return {Leaflet handler}    The rectangle selection handler, which can select a rectangle region on map.
 */
export function createRectangleHandler(L) {
    const that = this

    // Extend L.Draw.Rectangle as box-selector
    return L.Draw.Rectangle.extend({
        options: {
            shapeOptions: DEFAULT_REGION_STYLE,
            metric: true // Whether to use the metric measurement system or imperial
        },

        // Called when the handler is enabled
        addHooks() {
            L.Draw.Feature.prototype.addHooks.call(this)
            if (this._map) {
                this._map
                    .on('mousedown', this._onMouseDown, this)
                    .on('mousemove', this._onMouseMove, this)
                    .on('mouseup', this._onMouseUp, this)
                    .dragging.disable()

                this._map.circleSelector.disable()
                this._map.measureMode.disable()
                this._map.drawMode.disable()

                this._map._container.style.cursor = 'crosshair'
            }
        },

        removeHooks() {
            delete this._shape

            this._map
                .off('mousedown', this._onMouseDown, this)
                .off('mousemove', this._onMouseMove, this)
                .off('mouseup', this._onMouseUp, this)

            if (that._dragMode === DRAG_MODE.PAN) {
                this._map.dragging.enable()
            }

            this._map._container.style.cursor = '-webkit-grab'
        },

        _onMouseMove(e) {
            // Fix issue #1 and #2
            // e.originalEvent.buttons === 1 means Primary button
            if (e.originalEvent.buttons === 1 && this._isDrawing) {
                this._drawShape(e.latlng)
            }
        },

        _onMouseUp() {
            const shape = this._shape
            if (shape) {
                const map = this._map
                const mapBounds = map.getBounds()
                const prevMapSelected = _.cloneDeep(that._selected)

                // For performance, filter the symbols within the current view
                const symbols = _.reduce({...that._symbols, ...that._clusterSymbols, ...that._flags}, (acc, el, key) => {
                    const isPoint = el.type === SYMBOL_TYPE.MARKER ||
                                    el.type === SYMBOL_TYPE.SPOT ||
                                    el.type === EXTRA_SYMBOL_TYPE.CLUSTER

                    const clusterId = el.props.cluster
                    const clusterLyr = clusterId ?
                                        clusterId === true ? that._gCluster.layer : that._clusters[clusterId].layer :
                                        null

                    const hasLayer = map.hasLayer(el.layer) ||
                                    (clusterLyr &&
                                    map.hasLayer(clusterLyr) &&
                                    clusterLyr.hasLayer(el.layer))

                    if (isPoint) {
                        const isWithin = mapBounds.contains(el.layer.getLatLng())
                        if (isWithin && hasLayer) {
                            acc[key] = el
                        }
                        else if (!isWithin && el.isSelected()) {
                            el.setSelected(false)
                        }
                    }
                    // TODO: how to filter other symbol types
                    else if (hasLayer) {
                        acc[key] = el
                    }

                    return acc
                }, {})

                const containerPoint = {
                    northEast: map.latLngToContainerPoint(shape._bounds._northEast),
                    southWest: map.latLngToContainerPoint(shape._bounds._southWest)
                }

                const layerPoint = {
                    northEast: map.latLngToLayerPoint(shape._bounds._northEast),
                    southWest: map.latLngToLayerPoint(shape._bounds._southWest)
                }

                const eventObj = {
                    containerPoint,
                    bounds: shape._bounds,
                    layerPoint,
                    target: map,
                    type: 'selectionChange',
                    isMultiple: true
                }

                let isChanged = false

                // Reset the selection
                that._selected = {}

                _.forEach(symbols, el => {
                    if (that._selected[el.id]) {
                        return
                    }

                    let isSelected = false

                    const isPoint = el.type === SYMBOL_TYPE.MARKER ||
                                    el.type === SYMBOL_TYPE.SPOT ||
                                    el.type === EXTRA_SYMBOL_TYPE.CLUSTER

                    if (isPoint) {
                        // Get the bounds of the rectangle, then checking symbol is in bounds or not
                        const elCenter = el.layer.getLatLng()
                        isSelected = shape.getBounds().contains(elCenter)
                    }
                    else {
                        // Convert symbol & rectangle to geojson, then check the line intersection
                        const symbolGeo = el.type === SYMBOL_TYPE.CIRCLE
                                        ? gh.convertCircleToPolygon(el.layer, map, {
                                            vertices: 180,
                                            startFrom: el.props.startAngle || 0,
                                            stopAt: el.props.stopAngle || 360
                                        }).toGeoJSON()
                                        : el.layer.toGeoJSON()

                        const drawnGeo = shape.toGeoJSON()

                        const isIntersect = gh.isIntersect(symbolGeo, drawnGeo)
                        const isOverlap = gh.isOverlap(symbolGeo, drawnGeo)

                        if (isIntersect || isOverlap) {
                            isSelected = true
                        }
                    }

                    // Set symbol's 'selected' prop
                    el.setSelected(isSelected)
                    if (isSelected && el.type !== EXTRA_SYMBOL_TYPE.CLUSTER) {
                        that._selected[el.id] = true
                    }

                    if (isSelected && el.type === EXTRA_SYMBOL_TYPE.CLUSTER) {
                        const allChildren = _.map(el.layer.getAllChildMarkers(), '_gis_id')
                        const children = _.reduce(allChildren, (acc, id) => {
                            that._symbols[id].setSelected(true)
                            acc[id] = true
                            return acc
                        }, {})

                        that._selected = {...that._selected, ...children}
                    }
                })

                // Trigger selectionChange event of map
                isChanged = !_.isEqual(that._selected, prevMapSelected)
                if (isChanged && map.listens('selectionChange')) {
                    // Fire 'clusterselectionChange' is for re-render selected cluster
                    map.fire('selectionChange', eventObj)
                        .fire('clusterselectionChange', eventObj)
                }

                // Reset the drawn region
                map.removeLayer(shape)
                delete this._shape
            }
        }
    })
}

/**
 * Creates measure mode handler.
 * The handler is extend from L.Draw.Polyline (see leaflet.draw plugin)
 * For futher study, see node-modules/leaflet.draw/dist/leaflet.draw-src.js or the link.
 *
 * @link    https://github.com/Leaflet/Leaflet.draw/blob/develop/src/draw/handler/Draw.Polyline.js
 *
 * @param {Leaflet} L           Leaflet module.
 *
 * @return {Leaflet handler}    The measure handler, which can measure a path distance on the map.
 */
export function createMeasureHandler(L, measureOptions) {
    const that = this
    const HINT = 'Double-Click to stop drawing'

    const {showPointerTooltip: showPointer, pointerTooltip: pTooltip,
        showEndTooltip: showEnd, endTooltip: eTooltip, vertexIcon: vIcon, hint} = measureOptions

    const defaultVertex = {
        className: 'gis-vertex',
        iconSize: [30, 30]
    }

    // Extend L.Draw.Polyline
    return L.Draw.Polyline.extend({
        options: {
            shapeOptions: !_.isEmpty(measureOptions)
                        ? _.merge({}, DEFAULT_TRACK_STYLE, _.pick(measureOptions, STYLE_DICT))
                        : DEFAULT_TRACK_STYLE,
            metric: true, // Whether to use the metric measurement system or imperial
            zIndexOffset: 3000,
            showPointerTooltip: !_.isNil(showPointer) ? showPointer : true,
            pointerTooltip: pTooltip || null,
            showEndTooltip: !_.isNil(showEnd) ? showEnd : true,
            endTooltip: eTooltip || null,
            vertexIcon: vIcon || defaultVertex,
            hint: hint || false
        },

        // Called when the handler is enabled
        addHooks() {
            L.Draw.Feature.prototype.addHooks.call(this)
            if (this._map) {
                this._allPaths = L.layerGroup([]).addTo(this._map)
                this._allVertexGroups = L.layerGroup([]).addTo(this._map)

                this._map
                    .on('mousedown', this._onMouseDown, this)
                    .on('mousemove', this._onMouseMove, this)

                this._map.dragging.disable()
                this._map.doubleClickZoom.disable()
                this._map.circleSelector.disable()
                this._map.rectangleSelector.disable()
                this._map.drawMode.disable()

                if (hint) {
                    const content = _.isBoolean(hint) ? HINT : hint
                    this._hintWrapper = L.DomUtil.create('div', 'gis-measure-hint', this._map._container)
                    this._hintWrapper.innerHTML = _.isString(content) ? content : content(that.getSymbol(), this._map)
                }
            }
        },

        removeHooks() {
            if (this._path) {
                this._clear()
            }

            if (this._pointer) {
                this._map.removeLayer(this._pointer)
            }

            this._map.removeLayer(this._allPaths)
            this._map.removeLayer(this._allVertexGroups)

            delete this._pointer
            delete this._allPaths
            delete this._allVertexGroups

            this._map
                .off('mousedown', this._onMouseDown, this)
                .off('mousemove', this._onMouseMove, this)
                .off('mouseup', this._onMouseUp, this)

            if (that._dragMode === DRAG_MODE.PAN) {
                this._map.dragging.enable()
            }

            if (this._hintWrapper) {
                L.DomUtil.remove(this._hintWrapper)
                delete this._hintWrapper
            }

            this._map.doubleClickZoom.enable()
        },

        _onMouseDown(e) {
            if (!this._path) {
                const pid = _.values(this._allVertexGroups).length

                this._path = L.polyline([e.latlng], this.options.shapeOptions).addTo(this._map)
                this._pathLatLngs = []
                this._pathIds = `gis-path-${pid}`

                if (this._map.listens('measurestart')) {
                    this._onDrawStart(e)
                }
            }

            const lastVetex = this._vertexGroup ? _.last(this._vertexGroup.getLayers()) : null
            if (lastVetex && e.latlng.distanceTo(lastVetex.getLatLng()) === 0) {
                this._finishPath(e)
            }
            else {
                this._createMarker(e.latlng)
            }
        },

        _onMouseMove(e) {
            this._pointerLatLng = e.latlng

            // The marker sitcks on mouse with the tooltip shows the path's distance
            if (!this._pointer) {
                this._pointer = L.circleMarker(this._pointerLatLng)
                                .addTo(this._map)

                if (this.options.showPointerTooltip) {
                    this._pointer.bindTooltip('', {permanent:true, direction:'top'}).openTooltip()
                }
            }

            if (this._path) {
                this._path.setLatLngs([...this._pathLatLngs, this._pointerLatLng])
            }

            this._pointer.setLatLng(this._pointerLatLng)

            if (this.options.showPointerTooltip) {
                this._updateTooltip(e)
            }

            if (this._map.listens('measure')) {
                this._onDraw(e)
            }

            L.DomEvent.preventDefault(e.originalEvent)
        },

        _onDrawStart(e) {
            const {latlng, layers} = this._getEventArguments(e)
            this._map.fire('measurestart', {event:e, pathInfo:latlng, layers})
        },

        _onDraw(e) {
            const {latlng, layers} = this._getEventArguments(e)
            const pathInfo = {
                distance: this._measureDistance(this._path),
                latlngs: this._getPathLatLngs(this._path),
                latlng
            }

            this._map.fire('measure', {event:e, pathInfo, layers})
        },

        _onDrawEnd(e) {
            const {latlng, layers} = this._getEventArguments(e)
            const pathInfo = {
                distance: this._measureDistance(this._path),
                latlngs: this._getPathLatLngs(this._path),
                latlng
            }

            this._map.fire('measureend', {event:e, pathInfo, layers})
        },

        _getEventArguments(e) {
            const {latlng:rawLatlng} = e
            const latlng = [rawLatlng.lat, rawLatlng.lng]
            const layers = {
                currentPath: this._path,
                allPath: this._allPaths
            }

            return {latlng, layers}
        },

        _getPathLatLngs(path=[]) {
            const pathLatLngs = (path instanceof L.Polyline) ? path.getLatLngs() : []
            return _.map(pathLatLngs, ({lat, lng}) => {
                return [lat, lng]
            })
        },

        _measureDistance(path=[]) {
            const latlngs = this._getPathLatLngs(path)
            return gh.getPathDistance(latlngs, this._map.options.crs)
        },

        _createMarker(latlng) {
            const {vertexIcon} = this.options
            const latlngs = this._getPathLatLngs(this._path)

            let icon = _.clone(defaultVertex)
            if (_.isFunction(vertexIcon)) {
                icon = _.merge({}, defaultVertex, vertexIcon(latlng, latlngs))
            }
            else if (_.isPlainObject(vertexIcon)) {
                icon = _.merge({}, defaultVertex, vertexIcon)
            }

            if (icon.className.indexOf('gis-vertex') < 0) {
                icon.className = `gis-vertex ${icon.className || ''}`
            }

            const vertex = L.marker(latlng, {
                icon: L.divIcon(icon)
            })

            if (!this._vertexGroupId) {
                this._vertexGroup = L.layerGroup([]).addTo(this._map)
                this._allVertexGroups.addLayer(this._vertexGroup)

                this._vertexGroupId = this._allVertexGroups.getLayerId(this._vertexGroup)
            }

            this._vertexGroup.addLayer(vertex)
            this._pathLatLngs.push(latlng)
        },

        _updateTooltip(e) {
            const latlngs = this._getPathLatLngs(this._path)
            const distance = this._measureDistance(this._path)
            const {pointerTooltip} = this.options
            const {latlng} = this._getEventArguments(e)

            // content should be a String / HtmlElement / L.Tooltip
            const content = pointerTooltip
                            ? _.isFunction(pointerTooltip) ? pointerTooltip(distance, latlng, latlngs, this._path) : pointerTooltip
                            : `${distance} meters`

            this._pointer.setTooltipContent(content)
        },

        _finishPath(e) {
            if (this._pathLatLngs.length > 1) {
                const path = L.polyline(this._pathLatLngs, this.options.shapeOptions).addTo(this._map)
                const lastVetex = _.last(this._vertexGroup.getLayers())
                const {showEndTooltip, endTooltip} = this.options
                const {latlng} = this._getEventArguments(e)

                this._allPaths.addLayer(path)
                if (showEndTooltip) {
                    const distance = this._measureDistance(path)
                    const latlngs = this._getPathLatLngs(path)
                    const content = endTooltip
                                    ? _.isFunction(endTooltip) ? endTooltip(distance, latlng, latlngs, path) : endTooltip
                                    : `${distance} meters`

                    lastVetex.bindTooltip(content, {permanent:true, direction:'top'}).openTooltip()
                }
            }
            else {
                this._allVertexGroups.removeLayer(this._vertexGroup)
                delete this._vertexGroup
            }

            if (this._map.listens('measureend')) {
                this._onDrawEnd(e)
            }

            this._clear()
        },

        _clear() {
            this._pathLatLngs = []
            this._map.removeLayer(this._path)

            delete this._path
            delete this._vertexGroup
            delete this._vertexGroupId
        }
    })
}

/**
 * Creates draw mode handler.
 * The handler is implemented based on leaflet.draw, see the link for more detail.
 * Map handlers are a new concept from Leaflet 1.0. They process DOM events from the browser and change the state on the map.
 *
 * @link    https://github.com/Leaflet/Leaflet.draw/tree/develop/src
 * @link    http://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html
 * @link    https://leafletjs.com/examples/extending/extending-3-controls.html
 *
 * @param {Leaflet} L           Leaflet module
 *
 * @return {Leaflet handler}    The draw handler, which can draw/edit/delete features on the map.
 */
export function createDrawHandler(L, drawOptions=null) {
    const that = this

    // Set the text on control buttons and handlers
    L.drawLocal = _.merge(L.drawLocal, _.get(drawOptions, 'locale', {}))

    return L.Handler.extend({
        initialize(map) {
            this._map = map
            this._container = map._container
            this._overlayPane = map._panes.overlayPane

            // For placing symbols drawn symbols
            if (!this._drawnGroup) {
                this._drawnGroup = new L.FeatureGroup()
                this._map.addLayer(this._drawnGroup)
            }

            this._drawnGroup
                .on('layerremove', event => {
                    L.DomEvent.stop(event)
                    const shouldTrigger = that._dragMode === DRAG_MODE.DRAW &&
                                        that._drawType === DRAW_TYPE.DELETE &&
                                        this._map.listens('delete')

                    if (shouldTrigger) {
                        this._map.fire(L.Draw.Event.DELETED, event)
                    }
                })
                .on('dblclick', event => {
                    L.DomEvent.stop(event)

                    const shouldTrigger = that._drawType === DRAW_TYPE.EDIT &&
                                        this._map.listens('editcontent')

                    if (!shouldTrigger) {
                        return
                    }

                    const layer = event.layer
                    const drawnId = layer._gis_id
                    const eventObj = {
                        event,
                        symbol: that.getSymbol(drawnId)
                    }

                    this._map.fire('editcontent', eventObj)
                })

            this._map
                // Draw create event
                .on(L.Draw.Event.CREATED, event => {
                    L.DomEvent.stop(event)
                    this._handleCreate(event)
                    this._fireEvent('create', {
                        event,
                        layer: this._lastCreated.layer
                    })
                })
                // Prevent the function from closing after drawing
                .on(L.Draw.Event.DRAWSTOP, event => {
                    // This condition judgement is for avoiding trigger in region selection
                    if (that._dragMode === DRAG_MODE.DRAW) {
                        L.DomEvent.stop(event)
                        // Prevent to trigger by other modes which extended from leaflet.draw
                        this._activeHandler && this._activeHandler.enable()
                    }
                })
                // Trigger edit event when finishing editing
                .on(L.Draw.Event.EDITSTOP, event => {
                    L.DomEvent.stop(event)

                    this._updateSymbols()

                    if (this._map.listens('edit')) {
                        this._map.fire('edit', {event, symbol:that.getSymbol()})
                    }
                })
                .on(L.Draw.Event.DELETED, event => {
                    L.DomEvent.stop(event)

                    // triggered by clicking 'Clear All'
                    if (event.layers) {
                        const drawnIds = _.map(event.layers.getLayers(), '_gis_id')

                        // Fire the customed events
                        if (this._map.listens('delete')) {
                            const eventObj = {
                                event,
                                symbol: that.getSymbol(drawnIds)
                            }

                            this._map.fire('delete', eventObj)
                        }

                        _.forEach(drawnIds, el => delete that._symbols[el])
                    }
                    else {
                        this._fireEvent('delete', {
                            event,
                            layer: event.layer
                        })
                        delete that._symbols[event.layer._gis_id]
                    }
                })
        },
        addHooks() {
            const drawControl = this.getControl()
            const drawType = that._drawType

            if (this._map) {
                this._map.dragging.disable()
                this._map.doubleClickZoom.disable()
                this._map.circleSelector.disable()
                this._map.rectangleSelector.disable()
                this._map.measureMode.disable()

                if (!this._map.hasLayer(this._drawnGroup)) {
                    this._map.addLayer(this._drawnGroup)
                }

                this._addVirtualSymbols()
                // If defaultControl is true, use the leaflet.draw control
                if (_.get(drawOptions, 'defaultControl', false)) {
                    this._map.addControl(drawControl)
                }
                else {
                    this.setDrawType(drawType)
                }

                this._map.getContainer().focus()
                this._map.getContainer().classList.add('gis-draw')
                this.enable()
            }
        },
        removeHooks() {
            const isStdOrTrack = that._layout === LAYOUT.STANDARD ||
                                that._layout === LAYOUT.TRACK

            // Disable the handler first to prevent erro in leaflet
            if (this._activeHandler) {
                this._activeHandler.disable()
                L.Handler.prototype.disable.call(this._activeHandler)
                delete this._activeHandler
            }

            // Remove the default draw control
            if (drawOptions.defaultControl) {
                const drawControl = this.getControl()
                this._map.removeControl(drawControl)
            }

            if (that._dragMode === DRAG_MODE.PAN) {
                this._map.dragging.enable()
            }

            // All maps may need to redraw
            this._updateSymbols()
            this._drawnGroup.clearLayers()

            // Add the original symbol back
            _.forEach(that._symbols, el => {
                const shouldAddBack = that._visible[el.id] &&
                                    !this._map.hasLayer(el.layer)

                if (isStdOrTrack && shouldAddBack) {
                    this._map.addLayer(el.layer)
                }
            })

            delete this._virtual

            this._map.doubleClickZoom.enable()
            this._map.getContainer().classList.remove('gis-draw')
        },
        disable() {
            if (!this.enabled()) {
                return
            }

            L.Handler.prototype.disable.call(this)
        },
        getControl() {
            if (!this._control) {
                this._control = new L.Control.Draw({
                    ..._.pick(drawOptions, ['draw', 'position']),
                    edit: {
                        featureGroup: this._drawnGroup
                    }
                })
            }

            return this._control
        },
        setDrawType(drawType) {
            if (this._activeHandler) {
                this._activeHandler.disable()
                L.Handler.prototype.disable.call(this._activeHandler)
            }

            switch (drawType) {
                case DRAW_TYPE.MARKER:
                    this._activeHandler = new L.Draw.Marker(this._map, {})
                    break
                case DRAW_TYPE.SPOT:
                    this._activeHandler = new L.Draw.CircleMarker(this._map, {})
                    break
                case DRAW_TYPE.CIRCLE:
                    this._activeHandler = new L.Draw.Circle(this._map, {})
                    break
                case DRAW_TYPE.POLYLINE:
                    this._activeHandler = new L.Draw.Polyline(this._map, {})
                    break
                case DRAW_TYPE.POLYGON:
                    this._activeHandler = new L.Draw.Polygon(this._map, {})
                    break
                case DRAW_TYPE.RECTANGLE:
                    this._activeHandler = new L.Draw.Rectangle(this._map, {})
                    break
                case DRAW_TYPE.EDIT:
                    this._activeHandler = new L.EditToolbar.Edit(this._map, {
                        featureGroup: this._drawnGroup,
                        selectedPathOptions: {
                            dashArray: '10, 10',
                            fill: true,
                            fillColor: '#fe57a1',
                            fillOpacity: 0.1,
                            // Whether to user the existing layers color
                            maintainColor: false
                        },
                        poly: null
                    })
                    // this._addVirtualSymbols()
                    break
                case DRAW_TYPE.DELETE:
                    this._activeHandler = new L.EditToolbar.Delete(this._map, {
                        featureGroup: this._drawnGroup
                    })
                    break
                default:
                    break
            }

            if (this.enabled() && this._activeHandler) {
                this._activeHandler.enable()
            }
        },
        _handleCreate(event) {
            const layer = event.layer
            const type = event.layerType === 'circlemarker' ? 'spot' : event.layerType
            const radius = type === SYMBOL_TYPE.CIRCLE &&
                            layer.getRadius()

            const isPolyline = type === SYMBOL_TYPE.POLYLINE
            const isPolygon = type === SYMBOL_TYPE.POLYGON ||
                            type === SYMBOL_TYPE.RECTANGLE

            let latlng = []
            if (isPolygon || isPolyline) {
                // Polygon, polyline, and rectangle are formed by vertices
                latlng = isPolygon ?
                        _.map(layer.getLatLngs()[0], el => [el.lat, el.lng]) :
                        _.map(layer.getLatLngs(), ({lat, lng}) => [lat, lng])
            }
            else {
                const {lat, lng} = layer.getLatLng()
                latlng = [lat, lng]
            }

            const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(1, 6)
            const symbol = {
                id,
                type,
                latlng,
                radius,
                selected: false
            }

            that.setSymbol(symbol)
            that._symbols[id]._isDrawn = true
            that._editableIds[id] = true
            this._convertToVirtual(that._symbols[id])

            this._lastCreated = that._symbols[id]
        },
        _fireEvent(eventName, event) {
            const drawnId = _.get(event, 'layer._gis_id')
            const eventObj = {
                event: event.event,
                symbol: that.getSymbol(drawnId)
            }

            // Fire the customed events
            if (this._map.listens(eventName)) {
                this._map.fire(eventName, eventObj)
            }
        },
        _convertToVirtual(symbol) {
            const layer = symbol.layer
            const validType = symbol.type !== EXTRA_SYMBOL_TYPE.TRACK &&
                            symbol.type !== EXTRA_SYMBOL_TYPE.CLUSTER &&
                            symbol.type !== SYMBOL_TYPE.GEOJSON

            const isPoly = symbol.type === SYMBOL_TYPE.POLYLINE ||
                        symbol.type === SYMBOL_TYPE.POLYGON ||
                        symbol.type === SYMBOL_TYPE.RECTANGLE

            let virtual = null

            if (!that._editableIds[symbol.id] || !validType) {
                that._visible[symbol.id] && !this._map.hasLayer(layer) && this._map.addLayer(layer)
                return
            }

            this._map.hasLayer(layer) && this._map.removeLayer(layer)
            if (isPoly && symbol.props.directed) {
                const latlng = symbol.props.latlng
                virtual = L.polyline(latlng, _.pick(symbol.props, STYLE_DICT))
            }
            else if (isPoly) {
                const latlng = layer.getLatLngs()

                switch (symbol.type) {
                    case SYMBOL_TYPE.POLYLINE:
                        virtual = L.polyline(latlng, _.pick(symbol.props, STYLE_DICT))
                        break
                    case SYMBOL_TYPE.POLYGON:
                        virtual = L.polygon(latlng, layer.options)
                        break
                    case SYMBOL_TYPE.RECTANGLE:
                        virtual = L.rectangle(latlng, layer.options)
                        break
                    default:
                        break
                }
            }
            else {
                const latlng = layer.getLatLng()

                switch (symbol.type) {
                    case SYMBOL_TYPE.MARKER:
                    case SYMBOL_TYPE.SPOT:
                        virtual = L.marker(latlng, layer.options)
                        break
                    case SYMBOL_TYPE.CIRCLE:
                        virtual = L.semiCircle(latlng, layer.options)
                        break
                    default:
                        break
                }
            }

            if (virtual) {
                this._drawnGroup.addLayer(virtual)

                virtual._gis_id = symbol.id
                virtual._gis_type = symbol.type

                layer._virtual_id = this._drawnGroup.getLayerId(virtual)
                this._virtual[symbol.id] = virtual
            }
        },
        // Dynamically add editable symbols to draw group
        _addVirtualSymbols() {
            const symbols = that._symbols

            this._drawnGroup.clearLayers()
            this._virtual = {}

            _.forEach(symbols, el => this._convertToVirtual(el))
        },
        _updateSymbols() {
            // Update each symbol's location, radius, or any editable props
            _.forEach(this._virtual, el => {
                // These types can't be edited
                const {_gis_type:type} = el
                const symbol = that._symbols[el._gis_id]

                if (!symbol) {
                    return
                }

                const isPolyline = type === SYMBOL_TYPE.POLYLINE
                const isPolygon = type === SYMBOL_TYPE.POLYGON ||
                                type === SYMBOL_TYPE.RECTANGLE

                if (isPolyline || isPolygon) {
                    const latlng = isPolygon ?
                                _.map(el.getLatLngs()[0], v => [v.lat, v.lng]) :
                                _.map(el.getLatLngs(), ({lat, lng}) => [lat, lng])

                    symbol.set({...symbol.props, latlng}, symbol.selected, symbol.selectedProps)
                }
                else {
                    const {lat, lng} = el.getLatLng()
                    const latlng = [lat, lng]

                    // Update circle's radius
                    if (type === SYMBOL_TYPE.CIRCLE) {
                        symbol._props.radius = el.getRadius()
                    }

                    symbol.set({...symbol.props, latlng}, symbol.selected, symbol.selectedProps)
                }
            })
        }
    })
}

export default {
    createCircleHandler,
    createRectangleHandler,
    createMeasureHandler,
    createDrawHandler
}

/* Default L.drawLocal, from leaflet.draw

L.drawLocal = {
    // format: {
    //  numeric: {
    //      delimiters: {
    //          thousands: ',',
    //          decimal: '.'
    //      }
    //  }
    // },
    draw: {
        toolbar: {
            // #TODO: this should be reorganized where actions are nested in actions
            // ex: actions.undo  or actions.cancel
            actions: {
                title: 'Cancel drawing',
                text: 'Cancel'
            },
            finish: {
                title: 'Finish drawing',
                text: 'Finish'
            },
            undo: {
                title: 'Delete last point drawn',
                text: 'Delete last point'
            },
            buttons: {
                polyline: 'Draw a polyline',
                polygon: 'Draw a polygon',
                rectangle: 'Draw a rectangle',
                circle: 'Draw a circle',
                marker: 'Draw a marker',
                circlemarker: 'Draw a circlemarker'
            }
        },
        handlers: {
            circle: {
                tooltip: {
                    start: 'Click and drag to draw circle.'
                },
                radius: 'Radius'
            },
            circlemarker: {
                tooltip: {
                    start: 'Click map to place circle marker.'
                }
            },
            marker: {
                tooltip: {
                    start: 'Click map to place marker.'
                }
            },
            polygon: {
                tooltip: {
                    start: 'Click to start drawing shape.',
                    cont: 'Click to continue drawing shape.',
                    end: 'Click first point to close this shape.'
                }
            },
            polyline: {
                error: '<strong>Error:</strong> shape edges cannot cross!',
                tooltip: {
                    start: 'Click to start drawing line.',
                    cont: 'Click to continue drawing line.',
                    end: 'Click last point to finish line.'
                }
            },
            rectangle: {
                tooltip: {
                    start: 'Click and drag to draw rectangle.'
                }
            },
            simpleshape: {
                tooltip: {
                    end: 'Release mouse to finish drawing.'
                }
            }
        }
    },
    edit: {
        toolbar: {
            actions: {
                save: {
                    title: 'Save changes',
                    text: 'Save'
                },
                cancel: {
                    title: 'Cancel editing, discards all changes',
                    text: 'Cancel'
                },
                clearAll: {
                    title: 'Clear all layers',
                    text: 'Clear All'
                }
            },
            buttons: {
                edit: 'Edit layers',
                editDisabled: 'No layers to edit',
                remove: 'Delete layers',
                removeDisabled: 'No layers to delete'
            }
        },
        handlers: {
            edit: {
                tooltip: {
                    text: 'Drag handles or markers to edit features.',
                    subtext: 'Click cancel to undo changes.'
                }
            },
            remove: {
                tooltip: {
                    text: 'Click on a feature to remove.'
                }
            }
        }
    }
}

*/