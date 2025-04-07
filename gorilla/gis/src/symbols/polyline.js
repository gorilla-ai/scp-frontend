import _ from 'lodash'
import L from 'leaflet'
import 'leaflet-polylinedecorator'
import GisSymbol from './symbol'
import {INFO_TYPE, STYLE_DICT, TRACK_PANE} from '../consts/dictionary'
import {GIS_ERROR as ERROR} from '../utils/gis-exception'

let log = require('loglevel').getLogger('gis/symbols/polyline')

const DEFAULT_PATTERN = {
    offset: '100%',
    repeat: 0,
    sign: {
        type: 'arrow',
        pixelSize: 15,
        polygon: false
    }
}

/**
 * A Polyline symbol, inherits from class Symbol.
 *
 * @see     Symbol
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/polyline.md
 *
 * @class
 * @param {String}  id              The polyline symbol id.
 * @param {Object}  props           The properties of the polyline.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */
class Polyline extends GisSymbol {
    constructor(id, props, selected, selectedProps) {
        super(id, 'polyline', props, selected, selectedProps)
        // supported props other than leaflet options: tooltip, popup, latlng, label, icon
    }

    /*
     * Forms the patterns props according to polyline props.
     *
     * @param {Object} props    The polyline props.
     *
     * @return {Object[]}       The props of patterns.
     */
    _getPatterns(props) {
        const options = this._getInitialStyle(props)
        let decorator = null
        this._patterns = []

        if (_.isEmpty(props.patterns)) {
            const pattern = {
                ..._.omit(DEFAULT_PATTERN, 'sign'),
                symbol: {
                    ...DEFAULT_PATTERN.sign,
                    pathOptions: _.merge({}, options, DEFAULT_PATTERN.sign.pathOptions)
                }
            }

            decorator = [{
                ..._.omit(pattern, 'symbol'),
                symbol: L.Symbol.arrowHead(pattern.symbol)
            }]

            this._patterns.push(pattern)
        }
        else {
            decorator = _.map(props.patterns, el => {
                const sign = _.isNil(el.sign)
                            ? _.omit(DEFAULT_PATTERN.sign, 'type')
                            : _.omit(el.sign, 'type')

                const type = (_.isNil(el.sign) || _.isNil(el.sign.type))
                            ? DEFAULT_PATTERN.sign.type
                            : el.sign.type

                let pattern = null
                let patternOpt = null

                if ((type === 'arrow') || (type !== 'marker')) {
                    patternOpt = {
                        ...sign,
                        pathOptions: _.merge({}, options, sign.pathOptions)
                    }

                    _.set(patternOpt, 'pathOptions.pane', TRACK_PANE)
                    pattern = L.Symbol.arrowHead(patternOpt)

                    if (!_.includes(['arrow', 'marker'], type)) {
                        log.warn(
                            ERROR.INVALID_TYPE,
                            type,
                            'The directed polyline pattern type should be \'arrow\' or \'marker\''
                        )
                    }
                }
                else if (type === 'marker') {
                    patternOpt = _.cloneDeep(sign)
                    _.set(patternOpt, 'pane', TRACK_PANE)

                    pattern = L.Symbol.marker(patternOpt)
                }

                this._patterns.push({
                    ..._.pick(el, ['offset', 'endOffset', 'repeat']),
                    symbol: patternOpt
                })

                return {
                    ..._.pick(el, ['offset', 'endOffset', 'repeat']),
                    symbol: pattern
                }
            })
        }

        return decorator
    }

    /*
     * Creates the leaflet polyline instance; if directed, create a leaflet feature group store all separated lines and pattern.
     *
     * @param {Object} props                    The polyline props.
     *
     * @return {L.Polyline | L.FeatureGroup}    The created leaflet polyline instance; if directed, return the leaflet feature group instance.
     */
    _createLayer(props) {
        const options = this._getInitialStyle(props)

        this._layer = L.polyline(props.latlng, options)

        // Fix issue #11. Add default pattern
        if (props.directed) {
            const patterns = this._getPatterns(props)

            // Make the sign(e.g., arrow) shown beside each symbol
            const polylines = []
            const decorators = []
            _.forEach(this._props.latlng, (el, idx, clct) => {
                if (idx < clct.length-1) {
                    const layer = L.polyline([el, clct[idx+1]], options)
                    polylines.push(layer)
                    decorators.push(L.polylineDecorator(layer, { patterns }))
                }
            })

            this._decorator = decorators
            // Fix issue #8. Use featureGroup to group polyline and decorator so that it can bind events
            this._layer = L.featureGroup(_.concat(polylines, decorators))

            // Make the _eventCore can catch the symbol id if polyline layer is featureGroup
            this._layer.eachLayer(lyr => {
                lyr._gis_id = this._id
            })
        }

        return this._layer
    }

    /*
     * Updates the leaflet polyline/featureGroup instance.
     * If polyline symbol is directed, new props, e.g., color, will apply to all separated lines and patterns.
     *
     * @param {Object} prevProps                The original props.
     * @param {Object} mextProps                The new props to apply.
     *
     * @return {L.Polyline | L.FeatureGroup}    The updated leaflet polyline/featureGroup instance.
     */
    _updateLayer(prevProps, nextProps) {
        // Props like tooltip, popup, and label, can't be set by setStyle
        const style = _.pick(nextProps, STYLE_DICT)

        if (!_.isEmpty(style)) {
            // Fix issue #11
            if (!this._props.directed) {
                // Set the location
                if (!_.isEqual(prevProps.latlng, nextProps.latlng)) {
                    this._layer.setLatLngs(nextProps.latlng)
                }

                this._layer.setStyle(style)
            }
            else {
                const patterns = this._getPatterns(nextProps)

                this._layer.eachLayer(lyr => {
                    if (!_.isEqual(prevProps.latlng, nextProps.latlng)) {
                        if (lyr instanceof L.Polyline) {
                            lyr.setLatLngs(nextProps.latlng)
                        }
                        else if (lyr instanceof L.PolylineDecorator) {
                            lyr.setPaths(nextProps.latlng)
                        }
                    }

                    if (lyr instanceof L.Polyline) {
                        lyr.setStyle(style)
                    }
                })

                _.forEach(this._decorator, el => {
                    el.setPatterns(patterns)
                })
            }
        }

        // Set tooltip
        if (!_.isNil(this._props.tooltip) && !_.isNil(nextProps.tooltip)) {
            this._updateInfo(INFO_TYPE.TOOLTIP, prevProps.tooltip, nextProps.tooltip)
        }

        // Set popup
        if (!_.isNil(this._props.popup) && !_.isNil(nextProps.popup)) {
            this.setInfo(INFO_TYPE.POPUP, nextProps.popup)
        }

        return this._layer
    }
}

export default Polyline