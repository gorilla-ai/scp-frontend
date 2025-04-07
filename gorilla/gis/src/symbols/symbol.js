import _ from 'lodash'
import L from 'leaflet'
import cx from 'classnames'

import {INFO_TYPE, STYLE_DICT, SYMBOL_TYPE, EXTRA_SYMBOL_TYPE} from '../consts/dictionary'
import {DEFAULT_SYMBOL_STYLE, DEFAULT_SYMBOL_SLT_STYLE} from '../consts/style'
import {GIS_ERROR} from '../utils/gis-exception'

let log = require('loglevel').getLogger('gis/symbols/symbol')

/**
 * A GIS base module, which displays a feature on the map.
 *
 * @class
 * @param {String}  id              The symbol id.
 * @param {Object}  props           The properties of the symbol.
 * @param {Boolean} selected=false  The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 *
 */
class GisSymbol {
    constructor(id, type, props, selected=false, selectedProps) {
        this._id = id
        this._type = type
        this._props = props
        this._selected = selected
        this._selectedProps = selectedProps
        this._layer = this.setLayer(props, selected, selectedProps)
        this._layer.id = `${id}_layer`
        this._layer._gis_id = id
    }

    /*
     * Gets the symbol's id.
     *
     * @return {String}               The symbol's id.
     */
    get id() {
        return this._id
    }

    /*
     * Gets the symbol's type.
     *
     * @return {String}               The symbol's type.
     */
    get type() {
        return this._type
    }

    /*
     * Gets the symbol's props.
     *
     * @return {Object}               The symbol's props.
     */
    get props() {
        return this._props
    }

    /*
     * Gets the symbol's selected status.
     *
     * @return {Boolean}               The symbol's selected status.
     */
    get selected() {
        return this._selected
    }

    /*
     * Gets the symbol's selected props.
     *
     * @return {Object}               The symbol's selected props.
     */
    get selectedProps() {
        return this._selectedProps
    }

    /*
     * Gets the symbol's current props, which may be props merged with selectedProps when selected.
     *
     * @return {Object}               The symbol's current props.
     */
    get currentProps() {
        const latlng = this._selectedProps
                    ? (this._selectedProps.latlng || this._props.latlng)
                    : this._props.latlng

        return this._selected
                ? _.chain({})
                    .merge(this._props, this._selectedProps)
                    .set('latlng', latlng)
                    .value()
                : this._props
    }

    /*
     * Gets the symbol's leaflet layer instance.
     *
     * @return {Lefalet layer}               The symbol's Leaflet layer instance.
     */
    get layer() {
        return this._layer
    }

    /*
     * Gets the symbol's selected status.
     *
     * @return {Boolean}               The symbol's selected status.
     */
    isSelected() {
        return this._selected
    }

    /*
     * Sets symbol's selected status.
     *
     */
    setSelected(selected=this._selected) {
        (selected !== this._selected) && this.set(this._props, selected, this._selectedProps)
    }

    /*
     * Sets symbol's props and selectedProps.
     * Original ones will be merged into new ones.
     * @see function set(props, selected, selectedProps)
     *
     * @param {Object}  props           The symbol's props.
     * @param {Object}  selectedProps   The symbol's selectedProps.
     *
     */
    setProps(props, selectedProps) {
        this.set(props, this._selected, selectedProps)
    }

    /*
     * Sets symbol's props, selected status and selectedProps.
     * Original ones will be merged into new ones.
     *
     * @param {Object}  props           The symbol's props.
     * @param {Boolean} selected        The selected status.
     * @param {Object}  selectedProps   The symbol's selectedProps.
     *
     */
    set(props, selected=this._selected, selectedProps) {
        this.setLayer(props, selected, selectedProps)

        this._props = _.merge({}, this._props, props)
        this._selected = selected
        this._selectedProps = _.merge({}, this._selectedProps, selectedProps)
    }

    /*
     * Sets symbol's Leaflet layer instance according to props, selected and selectedProps.
     *
     * @param {Object}  props           The symbol's props.
     * @param {Boolean} selected        The selected status.
     * @param {Object}  selectedProps   The symbol's selectedProps.
     *
     * @return {Leaflet layer}          The symbol's Leaflet layer instance.
     *
     */
    setLayer(props, selected=this._selected, selectedProps) {
        // Polyline's fill prop is set false by default in leaflet
        const defaultStyle = {
            ...DEFAULT_SYMBOL_STYLE,
            fill: this._type !== SYMBOL_TYPE.POLYLINE && this._type !== EXTRA_SYMBOL_TYPE.TRACK
        }

        const defaultSltStyle = {
            ...DEFAULT_SYMBOL_SLT_STYLE,
            fill: this._type !== SYMBOL_TYPE.POLYLINE && this._type !== EXTRA_SYMBOL_TYPE.TRACK
        }

        // Fix issue #21
        const latlng = selectedProps
                    ? selectedProps.latlng || this._selectedProps.latlng || props.latlng || this._props.latlng
                    : props.latlng || this._props.latlng

        const newProps = selected
            ? _({})
                .merge(defaultStyle, this._props, props, defaultSltStyle, this._selectedProps, selectedProps)
                .set('latlng', latlng)
                .omitBy(_.isNil)
                .value()
            : _.merge({}, defaultStyle, props)

        /*
            Normalize the className
            Besides props.className, add default className `gis-${this._type}` to symbols
        */
        const className = _.chain(cx(
            `gis-${this._type}`,
                            {[`gis-${this._origType}`]:!!this._origType, selected},
            props.className || '',
            newProps.className || ''
                        ))
                        .split(' ')
                        .uniq()
                        .join(' ')
                        .value()

        newProps.className = className

        if (!this._layer) {
            this._layer = this._createLayer(newProps)
        }
        else if (this._layer && !_.isEqual(this.currentProps, newProps)) {
            this._layer = this._updateLayer(this.currentProps, newProps)
        }

        // Bring selected symbols to top
        if (selected) {
            // this._layer._mapToAdd is for checking the layer is on the map
            this._layer._mapToAdd && this._layer.bringToFront()
        }

        // Add class 'selected' to symbols when selected
        if (this._layer._mapToAdd) {
            const toggleClassFunc = selected ? L.DomUtil.addClass : L.DomUtil.removeClass
            const isGeoJSON = (this._layer instanceof L.GeoJSON)
            const isDirected = (this._type === SYMBOL_TYPE.POLYLINE || this._type === EXTRA_SYMBOL_TYPE.TRACK) &&
                                this._props.directed

            if (isGeoJSON) {
                this._layer.eachLayer(lyr => {
                    _.forEach(lyr._layers, l => {
                        toggleClassFunc(l._path, 'selected')
                    })
                })
            }
            else if (isDirected) {
                this._layer.eachLayer(lyr => {
                    if (lyr instanceof L.Polyline) {
                        toggleClassFunc(lyr._path, 'selected')
                    }
                    // Patterns are nested groups
                    else {
                        lyr.eachLayer(lg => {
                            lg.eachLayer(l => {
                                l.eachLayer(p => {
                                    toggleClassFunc(p._path, 'selected')
                                })
                            })
                        })
                    }
                })
            }
            else {
                toggleClassFunc(this._layer._path, 'selected')
            }
        }

        return this._layer
    }

    /*
     * Creates/updates tooltip/popup of symbol.
     *
     * @param {String}                       type           Info type, which is 'tooltip' or 'popup'.
     * @param {String | Object | Function}   info           Info content.
     *
     */
    setInfo(type, info) {
        if (_.includes(INFO_TYPE, type)) {
            const hasInfo = !_.isNil(this._layer[`get${_.upperFirst(type)}`]())

            if (!hasInfo) {
                this._createInfo(type, info)
            }
            else {
                this._updateInfo(type, _.merge({}, this.currentProps[type], info))
            }
        }
        else {
            log.warn(
                GIS_ERROR.INVALID_TYPE, type,
                `The info type should be "${SYMBOL_TYPE.TOOLTIP}", or "${SYMBOL_TYPE.POPUP}"`
            )
        }
    }

    /*
     * Picks the valid style props.
     *
     * @param {Object}   initProps           The symbol's initial props.
     *
     */
    _getInitialStyle(initProps) {
        return _.pick(initProps, STYLE_DICT)
    }

    /*
     * Creates the Leaflet layer instance.
     *
     * @param {Object}   newProps           The symbol's props.
     *
     */
    _createLayer(newProps) {
        let layer = null
        return layer
    }

    /*
     * Updates the Leaflet layer instance.
     *
     * @param {Object}   prevProps           The symbol's original props.
     * @param {Object}   nextProps           The symbol's new props.
     *
     * @return {Leaflet layer}               Updated layer instance.
     *
     */
    _updateLayer(prevProps, nextProps) {
        // Props like tooltip, popup, can't be set by setStyle
        const style = _.pick(nextProps, STYLE_DICT)

        // Set the location
        if (nextProps.latlng && !_.isEqual(prevProps.latlng, nextProps.latlng)) {
            this._layer.setLatLngs(nextProps.latlng)
        }

        if (!_.isNil(style)) {
            this._layer.setStyle(style)
        }

        if (!_.isNil(this._props.tooltip) && !_.isNil(nextProps.tooltip)) {
            this._updateInfo(INFO_TYPE.TOOLTIP, _.merge({}, this._props.tooltip, nextProps.tooltip))
        }

        if (!_.isNil(this._props.popup) && !_.isNil(nextProps.popup)) {
            this._updateInfo(INFO_TYPE.POPUP, _.merge({}, this._props.popup, nextProps.popup))
        }

        return this._layer
    }

    /*
     * Binds tooltip or popup to symbol Leaflet layer instance.
     *
     * @param {String}   type           The info's type, which is tooltip or popup.
     * @param {Object}   infoConfig     The info's config.
     *
     */
    _createInfo(type, {content, ...options}) {
        this._layer[`bind${_.upperFirst(type)}`](content, options)
    }

    /*
     * Updates tooltip or popup of the symbol Leaflet layer instance.
     *
     * @param {String}   type           The info's type, which is tooltip or popup.
     * @param {Object}   infoConfig     The info's new config.
     *
     */
    _updateInfo(type, {content, ...options}) {
        const info = L[type](options).setContent(content)

        this._layer[`unbind${_.upperFirst(type)}`]()
        this._layer[`bind${_.upperFirst(type)}`](info)
    }
}


export default GisSymbol