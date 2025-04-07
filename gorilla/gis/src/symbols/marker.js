import _ from 'lodash'
import cx from 'classnames'
import L from 'leaflet'

import iconUrl from 'leaflet/dist/images/marker-icon.png'

import GisSymbol from './symbol'
import {INFO_TYPE} from '../consts/dictionary'
import {DEFAULT_MARKER_STYLE as DEFAULT_STYLE} from '../consts/style'
import {GIS_ERROR} from '../utils/gis-exception'

let log = require('loglevel').getLogger('gis/symbols/marker')

const OPTION_DICT = [
    'icon', 'draggable', 'keyboard', 'title', 'alt',
    'zIndexOffset', 'opacity', 'riseOnHover', 'riseOffset', 'pane'
]

const STYLE_DICT = [
    'iconUrl', 'iconRetinaUrl', 'iconSize', 'iconAnchor',
    'popupAnchor', 'tooltipAnchor', 'shadowUrl', 'shadowRetinaUrl',
    'shadowSize', 'shadowAnchor', 'className', 'rotation'
]

/**
 * A Marker symbol, inherits from class Symbol.
 *
 * @see     Symbol
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/marker.md
 *
 * @class
 * @param {String}  id              The marker symbol id.
 * @param {Object}  props           The properties of the marker.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */
class Marker extends GisSymbol {
    constructor(id, props, selected, selectedProps) {
        super(id, 'marker', props, selected, selectedProps)
        // supported props other than leaflet options: tooltip, popup, latlng, label, icon
    }

    /*
     * Creates/Updates the leaflet marker instance.
     *
     * @param {Object}  props           The marker props.
     * @param {Boolean} selected        Selected status.
     * @param {Boolean} selectedProps   Props to apply when selected.
     *
     * @return {L.Marker}               The leaflet marker instance.
     */
    setLayer(props, selected=this._selected, selectedProps) {
        const newProps = selected
            ? _.merge({}, DEFAULT_STYLE, this._props, props, this._selectedProps, selectedProps)
            : _.merge({}, DEFAULT_STYLE, this._props, props)

        const mergeClass = cx(
            'gis-marker',
            'gis-divIcon',
            {
                'gis-truncated-labels': !!this._props._truncateLabels,
                'gis-whole-label': _.get(this._props, '_truncateLabels.shownOnHover', true),
                selected,
                'js-top-layer': selected
            },
            props.className || '',
            newProps.className || ''
        )

        const className = _.chain(mergeClass)
                        .split(' ')
                        .uniq()
                        .join(' ')
                        .value()

        newProps.className = className

        // Labels may be shown only when selected
        if (!selected && !props.label) {
            _.set(newProps, 'label', {content:'', className:''})
        }

        if (!this._layer) {
            this._layer = this._createLayer(newProps)
        }
        else if (this._layer && !_.isEqual(this.currentProps, newProps)) {
            this._layer = this._updateLayer(this.currentProps, newProps)
        }

        return this._layer
    }

    /*
     * Creates/updates tooltip/popup/label of symbol
     *
     * @param {String}                       type           Info type, which is 'tooltip', 'popup', or 'label'.
     * @param {String | Object | Function}   info           Info content.
     *
     */
    setInfo(type, info) {
        if (_.includes([INFO_TYPE.TOOLTIP, INFO_TYPE.POPUP], type)) {
            const hasInfo = !_.isNil(this._layer[`get${_.upperFirst(type)}`]())

            if (!hasInfo) {
                this._createInfo(type, info)
            }
            else {
                this._updateInfo(type, this.currentProps[type], info)
            }
        }
        else if (type === INFO_TYPE.LABEL) {
            this._setLabel(info)
        }
        else {
            log.warn(GIS_ERROR.INVALID_TYPE, type, 'The info type should be "tooltip", "popup", or "label" for Marker')
        }
    }

    /*
     * Creates Leaflet marker layer instance.
     *
     * @param {Object}  props   Marker props.
     *
     */
    _createLayer(props) {
        this._setLabel(props.label)
        this._setSign({...props.icon, className:props.className})

        const options = _.pick(props, OPTION_DICT)
        const divIcon = L.divIcon(_.omit(this._icon, 'rotation'))

        this._layer = L.marker(props.latlng, {
            ...options,
            icon: divIcon
        })

        return this._layer
    }

    /*
     * Updates the Leaflet marker instance.
     *
     * @param {Object}  prevProps   Original marker props.
     * @param {Object}  nextProps   New marker props.
     *
     */
    _updateLayer(prevProps, nextProps) {
        if (!_.isEqual(prevProps, nextProps)) {
            // Set the location
            if (!_.isEqual(prevProps.latlng, nextProps.latlng)) {
                this._layer.setLatLng(nextProps.latlng)
            }

            // Need to update label or not
            if (!_.isNil(nextProps.label)) {
                this._setLabel(nextProps.label)
            }

            // Update marker if nextProps icon or label is not null
            if (!_.isNil(nextProps.icon) || !_.isNil(nextProps.label)) {
                this._setSign({...nextProps.icon, className:nextProps.className})
                // this._layer.setIcon(L.divIcon(this._icon))
                if (this._setIcon) {
                    clearTimeout(this._setIcon)
                }

                /*
                    The reason we need to delay the change is to make 'dblclick' work.
                    L.Marker.setIcon() seems recreating the icon which makes 'dblclick' failed
                */
                this._setIcon = setTimeout(() => {
                    this._layer.setIcon(L.divIcon(_.omit(this._icon, 'rotation')))
                    this._addDrawClass()
                }, 200)
            }

            if (this._props.tooltip && !_.isNil(nextProps.tooltip)) {
                this._updateInfo(INFO_TYPE.TOOLTIP, prevProps.tooltip, nextProps.tooltip)
            }

            if (this._props.popup && !_.isNil(nextProps.popup)) {
                this._updateInfo(INFO_TYPE.POPUP, prevProps.popup, nextProps.popup)
            }
        }

        return this._layer
    }

    /*
     * Sets the marker label.
     *
     * @param {Object}  [info={content:'', className:''}]   Label config object.
     *
     */
    _setLabel(info={content:'', className:''}) {
        const content = _.get(info, 'content', _.get(this._label, 'content', ''))
        const className = _.get(info, 'className', _.get(this._label, 'className', ''))

        this._label = {content, className}
    }

    /*
     * Creates/updates marker icon.
     *
     * @param {Object}  item    The icon props, which is retrieved from marker props.
     *
     */
    _setSign(item=_.cloneDeep(DEFAULT_STYLE)) {
        const {content, className:labelClass} = this._label
        const icon = {...DEFAULT_STYLE.icon, ...this._icon, ..._.pick(item, STYLE_DICT)}

        // Fix/Enhance for issue #4, #20
        /*
            TODO: Enhancement. Restrict the size and use 'enlarge' prop to control size
            The default size is 30*30?
        */
        const width = icon.iconSize[0]
        const height = icon.iconSize[1]
        const rotation = icon.rotation

        if (!icon.iconUrl) {
            _.set(icon, 'iconUrl', iconUrl)
        }

        icon.html = `<img src="${icon.iconUrl}" 
                        width="${width}" 
                        height="${height}" 
                        style="transform:rotate(${rotation}deg)">`
                    + `<span class="${cx('gis-label', labelClass)}">${content}</span>`

        this._icon = icon
    }

    /*
     * Adds leaflet.draw className when GIS is under draw mode if the marker is editable.
     */
    _addDrawClass() {
        // Only works for drawn symbol
        if (!this._isDrawn || !this._layer._map) {
            return
        }

        // Add leaflet.draw class for draw mode
        const shouldSetDrawClass = this._layer._map.getContainer().classList.contains('gis-draw') &&
                                this._isDrawn &&
                                !this._layer._icon.classList.contains('leaflet-edit-marker-selected')

        if (shouldSetDrawClass) {
            this._layer._icon.classList.add('leaflet-edit-marker-selected')
        }
    }
}


export default Marker