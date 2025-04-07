/**
 * Image overlay related functions.
 *
 * @file   This file is the collection of overlay-related functions.
 * @author Liszt
 */

import _ from 'lodash'

import dh from '../utils/data-helper'
import rh from '../utils/render-helper'
import {GIS_ERROR as ERROR} from '../utils/gis-exception'

let log = require('loglevel').getLogger('gis/core/image')

/**
 * Creates/updates the overlayes.
 *
 * @param   {Object | Object[]}    item     Overlay configs to be created or updated. Formatted as {id, url, xy, size:{width, height}, opacity, zoom}
 *
 */
export function _setImageOverlay(item) {
    const overlays = _.isArray(item) ? _.cloneDeep(item) : [_.cloneDeep(item)]

    /*
        el = {id, url, xy, size:{width, height}, opacity, zoom}
        id is the overlay's id. If undefined and the overlay is new, randomly create one for it.
        url and xy are required for new overlay

        url is the image path
        xy is the start point in the container
        zoom is the minimum level which the overlay will display
    */
    _.forEach(overlays, el => {
        const overlay = this._overlays[el.id]
        const xy = _.get(el, 'xy', null)
        const size = _.get(el, 'size', null)

        if (!overlay) {
            rh.renderOverlay.call(this, el)
        }
        else {
            el.url && overlay.layer.setUrl(el.url)
            !_.isNil(el.opacity) && overlay.layer.setOpacity(el.opacity)

            // Translate the overlay if specified xy or size
            if (xy || size) {
                const x0 = _.get(xy, 'x', overlay.xy.x)
                const y0 = _.get(xy, 'y', overlay.xy.y)
                const x1 = x0 + _.get(size, 'width', overlay.size.width)
                const y1 = y0 + _.get(size, 'height', overlay.size.height)

                const bounds = [[y0, x0], [y1, x1]]

                overlay.layer.setBounds(bounds)

                this._overlays[el.id].xy = xy || this._overlays[el.id].xy
                this._overlays[el.id].size = size || this._overlays[el.id].size
                this._overlays[el.id].opacity = !_.isNil(el.opacity) ? el.opacity : this._overlays[el.id].opacity
            }
        }
    })

    return this
}

/**
 * Removes the overlayes which match the filter.
 *
 * @param   {String | String[] | Object | Function}    filter     Filter of overlays to be removed. If undefined, remove all overlays.
 *
 */
export function _removeImageOverlay(filter) {
    const overlays = this._overlays
    let removed = []

    if (_.isString(filter)) {
        // Use id to find
        removed = _.filter(overlays, ({id}) => id === filter)
    }
    else if (dh.isValidArgType(filter, [['string']])) {
        // Use ids[] to find
        removed = _.filter(overlays, ({id}) => _.includes(filter, id))
    }
    else if (_.isPlainObject(filter)) {
        // Use attributes, like id/zoom/opacity/... (except 'layer'), to find overlays
        removed = _.filter(overlays, el => _.isMatch(el, _.omit(filter, 'layer')))
    }
    else if (_.isFunction(filter)) {
        // Use filter function which return boolean to find overlays to be removed
        removed = _.filter(overlays, (el, key) => filter(el, key, overlays))
    }
    else if (_.isNil(filter) || _.isEmpty(filter)) {
        removed = _.toArray(overlays)
    }
    else {
        log.warn(ERROR.INVALID_ARGS, filter, 'Filter should be String, String[], Object, or Function')
        return this
    }

    _.forEach(removed, ({id, layer}) => {
        this._map.removeLayer(layer)
        delete this._overlays[id]
    })

    return this
}

export default {
    _setImageOverlay,
    _removeImageOverlay
}