import _ from 'lodash'
import L from 'leaflet'
import GisSymbol from './symbol'

let log = require('loglevel').getLogger('gis/symbols/geojson')

/**
 * A GeoJson symbol, inherits from class Symbol.
 * GeoJson symbol is a collection of features, e.g., marker, polygon, rectangle.
 * Each props will apply to all features in this collection.
 *
 * @see     Symbol
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/geojson.md
 *
 * @class
 * @param {String}  id              The geojson symbol id.
 * @param {Object}  props           The properties of the geojson.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */
class GeoJSON extends GisSymbol {
    constructor(id, props, selected, selectedProps) {
        super(id, 'geojson', props, selected, selectedProps)
        // supported props other than leaflet options: tooltip, popup, latlng, label, icon
    }

    /*
     * Creates the leaflet geojson instance.
     *
     * @param {Object} props       The geojson props.
     *
     * @return {L.GeoJson}         The created leaflet geojson instance.
     */
    _createLayer(props) {
        const pointToLayer = function pointToLayer(feature, latlng) {
            return L.circleMarker(latlng, {className:'gis-point'})
        }

        // Fix issue #30
        const style = function style() {
            return this._getInitialStyle(props)
        }.bind(this)

        // Set the default geojson point as a small steelblue circle
        this._layer = L.geoJSON(props.geojson, {
            pointToLayer,
            style
        })

        // Make the _eventCore can catch the symbol id
        this._layer.eachLayer(lyr => {
            if (lyr.feature.geometry.type.indexOf('Collection') > -1) {
                _.forEach(lyr.getLayers(), l => {
                    l._gis_id = this._id
                })
            }
            else {
                lyr._gis_id = this._id
            }
        })

        return this._layer
    }
}


export default GeoJSON