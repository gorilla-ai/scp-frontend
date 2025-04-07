/**
 * Heatmap related functions.
 *
 * @file   This file is the collection of heatmap-related functions.
 * @author Liszt
 */

import rh from '../utils/render-helper'
import {LAYOUT} from '../consts/dictionary'

/**
 * Repaints the heatmap.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#heatmap-options
 * @link    https://www.patrick-wied.at/static/heatmapjs/docs.html
 *
 * @param   {Object}    options     Options for heatmap. See the link for more details.
 *
 */
export function _setHeatmap(options) {
    rh.renderHeatmap.call(this, options)
}

/**
 * Show the heatmap canvas.
 * Not relaese to developers yet.
 *
 */
export function _showHeatmap() {
    const map = this._map
    const heatmap = this._heatmap

    if (this._layout === LAYOUT.HEATMAP && !map.hasLayer(heatmap)) {
        heatmap.addTo(map)
    }
}

/**
 * Hide the heatmap canvas.
 * Not relaese to developers yet.
 *
 */
export function _hideHeatmap() {
    const map = this._map
    const heatmap = this._heatmap

    if (this._layout === LAYOUT.HEATMAP && map.hasLayer(heatmap)) {
        map.removeLayer(heatmap)
    }
}

export default {
    _setHeatmap
    // ,
    // _showHeatmap,
    // _hideHeatmap
}