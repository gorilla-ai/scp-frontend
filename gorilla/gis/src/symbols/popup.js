import _ from 'lodash'
import GisSymbol from './symbol'

let log = require('loglevel').getLogger('gis/symbols/popup')

/**
 * A Popover symbol
 * @constructor

 */
class Popup extends GisSymbol {
    constructor(id, props, selected, selectedProps) {
        super(id, 'popup', props, selected, selectedProps)
        // supported props other than leaflet options: tooltip, popup, latlng, label, icon
        // this.layer = this.set(props, selected, selectedProps)
    }


    _createLayer(props) {
        return this._layer
    }

    _updateLayer(beforeProps, afterProps) {
        return this._layer
    }
}


export default Popup