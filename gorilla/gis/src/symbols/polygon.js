import L from 'leaflet'
import GisSymbol from './symbol'

let log = require('loglevel').getLogger('gis/symbols/polygon')

/**
 * A Polygon symbol, inherits from class Symbol.
 *
 * @see     Symbol
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/polygon.md
 *
 * @class
 * @param {String}  id              The polygon symbol id.
 * @param {Object}  props           The properties of the polygon.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */
class Polygon extends GisSymbol {
    constructor(id, props, selected, selectedProps) {
        super(id, 'polygon', props, selected, selectedProps)
        // supported props other than leaflet options: tooltip, popup, latlng, label, icon
    }

    /*
     * Creates the leaflet polygon instance.
     *
     * @param {Object} props       The polygon props.
     *
     * @return {L.Polygon}         The created leaflet polygon instance.
     */
    _createLayer(props) {
        const options = this._getInitialStyle(props)
        this._layer = L.polygon(props.latlng, options)

        return this._layer
    }
}


export default Polygon