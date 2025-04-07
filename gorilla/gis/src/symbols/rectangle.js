import L from 'leaflet'
import GisSymbol from './symbol'

let log = require('loglevel').getLogger('gis/symbols/rectangle')

/**
 * A Rectangle symbol, inherits from class Symbol.
 *
 * @see     Symbol
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/rectangle.md
 *
 * @class
 * @param {String}  id              The rectangle symbol id.
 * @param {Object}  props           The properties of the rectangle.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */
class Rectangle extends GisSymbol {
    constructor(id, props, selected, selectedProps) {
        super(id, 'rectangle', props, selected, selectedProps)
        // supported props other than leaflet options: tooltip, popup, latlng, label, icon
    }

    /*
     * Creates the leaflet rectangle instance.
     *
     * @param {Object} props       The rectangle props.
     *
     * @return {L.Rectangle}       The created leaflet rectangle instance.
     */
    _createLayer(props) {
        const options = this._getInitialStyle(props)
        this._layer = L.rectangle(props.latlng, options)

        return this._layer
    }
}


export default Rectangle