/**
 * This file defines & implements the GIS default events, including click and zoom.
 *
 * @file   Defines & implements GIS default events, including click and zoom
 * @author Liszt
 */

import _ from 'lodash'

/**
 * Defines default click behavior. When clicking on map or symbol/cluster, map should fire selectionChange.
 *
 * @param {Leaflet} L   Leaflet module
 *
 * @return {Leaflet handler}    The GIS click handler, which can trigger selectionChange by clicking.
 */
export function createGisClickHandler(L) {
    const that = this

    return L.Handler.extend({
        addHooks() {
            const mapContainer = this._map.getContainer()
            L.DomEvent.on(mapContainer, 'mousedown', this._onMouseDown, this)
                .on(mapContainer, 'mousemove', this._onMouseMove, this)
                .on(mapContainer, 'mouseup', this._onMouseUp, this)
        },

        removeHooks() {
            const mapContainer = this._map.getContainer()

            delete this._isPanning
            delete this._clientX
            delete this._clientY

            L.DomEvent.off(mapContainer, 'mousedown', this._onMouseDown, this)
                .off(mapContainer, 'mousemove', this._onMouseMove, this)
                .off(mapContainer, 'mouseup', this._onMouseUp, this)
        },

        _onMouseDown(e) {
            L.DomEvent.stop(e)

            const map = this._map
            const mapContainer = map.getContainer()

            this._isOnMap = e.target === mapContainer
            this._isPanning = false
            this._clientX = e.clientX
            this._clientY = e.clientY
        },

        _onMouseMove(e) {
            L.DomEvent.stop(e)
            this._isPanning = this._clientX - e.clientX !== 0 || this._clientY - e.clientY !== 0
        },

        _onMouseUp(e) {
            L.DomEvent.stop(e)

            const map = this._map
            const selected = that._selected

            if (!this._isPanning && this._isOnMap) {
                _.forEach(selected, (val, id) => {
                    const sbl = that._symbols[id] || that._flags[id]
                    sbl.setSelected(false)
                })

                if (!_.isEmpty(selected)) {
                    that._selected = {}
                    map.fire('selectionChange')
                        .fire('clusterselectionChange')
                }
            }

            this._isPanning = false
        }
    })
}

/**
 * Defines zoom behavior for imageovelay. Each overlay has property "zoom".
 * If map's zoom level is less than this value, the overlay will hide.
 *
 * @param {Leaflet} L           Leaflet module
 *
 * @return {Leaflet handler}    The zoom handler, which can hide/show overlay by zooming.
 */
export function createGisZoomendHandler(L) {
    const that = this

    return L.Handler.extend({
        addHooks() {
            const mapContainer = this._map.getContainer()
            L.DomEvent.on(mapContainer, 'wheel', this._onZoomEnd, this)
            this._active = true
            this._interval = 350
        },
        removeHooks() {
            const mapContainer = this._map.getContainer()
            L.DomEvent.off(mapContainer, 'wheel', this._onZoomEnd, this)
        },
        _onZoomEnd(e) {
            this._delta = L.DomEvent.getWheelDelta(e)
            if (this._active) {
                this._onWheelStart()
            }
        },
        _onWheelStart() {
            this._active = false
            this._onWheel()
        },
        _onWheel() {
            this._delta2 = this._delta

            setTimeout(() => {
                if (this._delta2 === this._delta) {
                    this._onWheelEnd()
                }
                else {
                    this._onWheel()
                }
            }, this._interval)
        },
        _onWheelEnd() {
            const map = this._map
            const zoom = this._map.getZoom()
            const changedOverlays = _.filter(that._overlays, ol => {
                return _.isInteger(ol.zoom)
            })

            // Show the overlay when specified zoom value <= current zoom level
            _.forEach(changedOverlays, ol => {
                if ((ol.zoom <= zoom) && !map.hasLayer(ol.layer)) {
                    ol.layer.addTo(map)
                    ol.layer.bringToFront()
                }
                else if ((ol.zoom > zoom) && map.hasLayer(ol.layer)) {
                    map.removeLayer(ol.layer)
                }
            })

            this._active = true
        }
    })
}

export default {
    createGisClickHandler,
    createGisZoomendHandler
}