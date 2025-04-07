import _ from 'lodash'
import L from 'leaflet'
import 'leaflet-semicircle'
import * as im from 'object-path-immutable'

import GisSymbol from './symbol'
import {INFO_TYPE, STYLE_DICT} from '../consts/dictionary'

let log = require('loglevel').getLogger('gis/symbols/circle')

/**
 * A Circle symbol, inherits from class Symbol.
 *
 * @see     Symbol
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/circle.md
 *
 * @class
 * @param {String}  id              The circle symbol id.
 * @param {Object}  props           The properties of the circle.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */
class Circle extends GisSymbol {
    constructor(id, props, selected, selectedProps) {
        super(id, 'circle', props, selected, selectedProps)
        // supported props other than leaflet options: tooltip, popup, latlng
    }

    /*
     * Sets the start angle for circle.
     * This can change the shape to semi or full circle.
     * Notice that this only changes the leaflet layer; symbol props will be unchanged.
     *
     * @param {Number} degree   The start angle in degree
     *
     * @return {this}
     */
    setStartAngle(degree) {
        const angle = this._convertToPositiveAngle(degree)
        this._layer.setStartAngle(angle)
        return this
    }

    /*
     * Sets the stop angle for circle.
     * This can change the shape to semi or full circle.
     * Notice that this only changes the leaflet layer; symbol props will be unchanged.
     *
     * @param {Number} degree   The stop angle in degree
     *
     * @return {this}
     */
    setStopAngle(degree) {
        const angle = this._convertToPositiveAngle(degree)
        this._layer.setStopAngle(angle)
        return this
    }

    /*
     * Sets the startAngle to (direction - (0.5*size)) and the stopAngle to (direction + (0.5*size)).
     * Notice that this only changes the leaflet layer; symbol props will be unchanged.
     *
     * @param {Number} direction   The intermediate angle in degree between start and stop angle.
     * @param {Number} size        The angle in degree of the fan will be.
     *
     * @return {this}
     */
    setDirection(direction, size) {
        this._layer.setDirection(direction, size)
        return this
    }

    /*
     * Filters the circle props.
     *
     * @param {Object} initProps   The input props.
     *
     * @return {Object}            The filtered props of circle.
     */
    _getInitialStyle(initProps) {
        return _(initProps)
            .pick(STYLE_DICT)
            .set('radius', initProps.radius)
            .set('startAngle', initProps.startAngle)
            .set('stopAngle', initProps.stopAngle)
            .omit(_.isNil)
            .value()
    }

    /*
     * Creates the leaflet circle instance.
     *
     * @param {Object} props       The circle props.
     *
     * @return {L.Circle}          The created leaflet circle instance.
     */
    _createLayer(props) {
        // Correct the angles
        const initProps = this._correctAngleProps(props)
        const options = this._getInitialStyle(initProps)

        this._layer = L.semiCircle(initProps.latlng, options)
        return this._layer
    }

    /*
     * Updates the leaflet circle instance.
     *
     * @param {Object} prevProps   The original props.
     * @param {Object} nextProps   The new props to apply.
     *
     * @return {L.Circle}          The updated leaflet circle instance.
     */
    _updateLayer(prevProps, nextProps) {
        // Correct the angles
        const fixNextProps = this._correctAngleProps(nextProps)

        // Props like radius, tooltip, popup, and label, can't be set by setStyle
        const style = _.pick(fixNextProps, STYLE_DICT)

        // Set the location
        if (fixNextProps.latlng && !_.isEqual(prevProps.latlng, fixNextProps.latlng)) {
            this._layer.setLatLng(fixNextProps.latlng)
        }

        if (!_.isEmpty(style)) {
            this._layer.setStyle(style)
        }

        // Set circle radius
        if (!_.isNil(fixNextProps.radius)) {
            this._layer.setRadius(fixNextProps.radius)
        }

        // Set circle angle
        if (!_.isNil(fixNextProps.startAngle)) {
            this._layer.setStartAngle(fixNextProps.startAngle)
        }

        if (!_.isNil(fixNextProps.stopAngle)) {
            this._layer.setStopAngle(fixNextProps.stopAngle)
        }

        // Set tooltip
        if (!_.isNil(this._props.tooltip) && !_.isNil(fixNextProps.tooltip)) {
            this._updateInfo(INFO_TYPE.TOOLTIP, _.merge({}, this._props.tooltip, nextProps.tooltip))
        }

        // Set popup
        if (!_.isNil(this._props.popup) && !_.isNil(fixNextProps.popup)) {
            this._updateInfo(INFO_TYPE.POPUP, _.merge({}, this._props.popup, nextProps.popup))
        }

        return this._layer
    }

    /*
     * Normalizes the input angle within [0, 360].
     *
     * @param {Number} degree   The angle in degree.
     *
     * @return {Number}         The normalized angle in degree.
     */
    _convertToPositiveAngle(degree) {
        const angle = (degree % 360 < 0) ? (degree % 360) + 360 : degree % 360
        return angle
    }

    /*
     * Normalizes the start and stop angle within [0, 360] if circle props contains one of them.
     *
     * @param {Object} props   The circle props.
     *
     * @return {Object}        The circle props with normalized start & stop angles.
     */
    _correctAngleProps(props) {
        if (!_.isNil(props.startAngle) && _.isNumber(props.startAngle)) {
            props = im.set(props, 'startAngle', this._convertToPositiveAngle(props.startAngle))
        }

        if (!_.isNil(props.stopAngle) && _.isNumber(props.stopAngle)) {
            props = im.set(props, 'stopAngle', this._convertToPositiveAngle(props.stopAngle))
        }

        return props
    }
}


export default Circle