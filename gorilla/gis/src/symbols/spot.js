import _ from 'lodash';
import cx from 'classnames';
import L from 'leaflet';

import Marker from './marker';
import { INFO_TYPE } from '../consts/dictionary';

// const log = require('loglevel').getLogger('gis/symbols/spot');

const OPTION_DICT = [
  'draggable', 'keyboard', 'title', 'zIndexOffset',
  'opacity', 'riseOnHover', 'riseOffset', 'pane'
];

const ALIEN_ATTR = [
  'latlng', 'className', 'data', 'selectedProps', 'tooltip', 'popup',
  'heatmap', 'type', 'selected', 'smoothFactor', 'noClip',
  'patterns', 'directed', 'icon', 'label', 'radius', 'track', 'ts',
  'cluster', 'group'
];

/**
 * A Spot symbol, inherits from class Marker.
 *
 * @see     Symbol and Marker
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/marker.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/spot.md
 *
 * @class
 * @param {String}  id              The spot symbol id.
 * @param {Object}  props           The properties of the spot.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */
class Spot extends Marker {
  constructor(id, props, selected, selectedProps) {
    super(id, props, selected, selectedProps);
    this._type = 'spot';
  }

  /*
   * Creates/Updates the leaflet marker instance, which icon is a dot.
   *
   * @param {Object}  props           The marker props.
   * @param {Boolean} selected        Selected status.
   * @param {Boolean} selectedProps   Props to apply when selected.
   *
   * @return {L.Marker}               The leaflet marker instance.
   */
  setLayer(props, selected = this._selected, selectedProps) {
    const newProps = selected
      ? _.merge({}, this._props, props, this._selectedProps, selectedProps)
      : _.merge({}, this._props, props);

    const mergeClass = cx(
      'gis-spot',
      'gis-divIcon',
      {
        'gis-truncated-labels': !!this._props._truncateLabels,
        'gis-whole-label': _.get(this._props, '_truncateLabels.shownOnHover', true),
        selected,
        'js-top-layer': selected
      },
      props.className || '',
      newProps.className || ''
    );

    const className = _.chain(mergeClass)
      .split(' ')
      .uniq()
      .join(' ')
      .value();

    newProps.className = className;

    // Labels may be shown only when selected
    if (!selected && !props.label) {
      _.set(newProps, 'label', { content: '', className: '' });
    }

    if (!this._layer) {
      this._layer = this._createLayer(newProps);
    } else if (this._layer && !_.isEqual(this.currentProps, newProps)) {
      this._layer = this._updateLayer(this.currentProps, newProps);
    }

    return this._layer;
  }

  /*
   * Creates Leaflet marker layer instance.
   *
   * @param {Object}  props   Spot props.
   *
   */
  _createLayer(props) {
    this._setLabel(props.label);
    this._setSign({
      ..._.omit(props, _.concat(ALIEN_ATTR, OPTION_DICT)),
      className: props.className
    });

    const options = _.pick(props, OPTION_DICT);
    const divIcon = L.divIcon(_.omit(this._icon, 'rotation'));

    this._layer = L.marker(props.latlng, {
      ...options,
      icon: divIcon
    });

    return this._layer;
  }

  /*
   * Updates the Leaflet marker layer instance.
   *
   * @param {Object}  prevProps   Original spot props.
   * @param {Object}  nextProps   New spot props.
   *
   */
  _updateLayer(prevProps, nextProps) {
    if (!_.isEqual(prevProps, nextProps)) {
      // Set the location
      if (!_.isEqual(prevProps.latlng, nextProps.latlng)) {
        this._layer.setLatLng(nextProps.latlng);
      }

      // Need to update label or not
      if (!_.isNil(nextProps.label)) {
        this._setLabel(nextProps.label);
      }

      // Update spot
      if (!_.isNil(nextProps)) {
        this._setSign({
          ..._.omit(nextProps, _.concat(ALIEN_ATTR, OPTION_DICT)),
          className: nextProps.className
        });

        // this._layer.setIcon(L.divIcon(this._icon))
        if (this._setIcon) {
          clearTimeout(this._setIcon);
        }

        this._setIcon = setTimeout(() => {
          this._layer.setIcon(L.divIcon(_.omit(this._icon, 'rotation')));
          this._addDrawClass();
        }, 200);
      }

      if (this._props.tooltip && !_.isNil(nextProps.tooltip)) {
        this._updateInfo(INFO_TYPE.TOOLTIP, prevProps.tooltip, nextProps.tooltip);
      }

      if (this._props.popup && !_.isNil(nextProps.popup)) {
        this._updateInfo(INFO_TYPE.POPUP, prevProps.popup, nextProps.popup);
      }
    }

    return this._layer;
  }

  /*
   * Creates/updates spot DOM.
   *
   * @param {Object}  item    The icon props, which is retrieved from spot props.
   *
   */
  _setSign(item) {
    const { content, className: labelClass } = this._label;
    const rotation = _.get(item, 'rotation', 0);

    const spot = {
      ...this._icon,
      ..._.omit(item, ['rotation', 'spotOpacity']),
      width: _.get(item, 'width', '15px'),
      height: _.get(item, 'height', '15px'),
      opacity: _.get(item, 'spotOpacity', 1)
    };

    const p = {
      ..._.omit(spot, ['html', 'className', '_truncateLabels', 'iconAnchor', 'iconSize', 'id', 'isOngoingNode', 'renderCount']),
      transform: `rotate(${rotation}deg)`
    };

    const camelCaseToDash = str => str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

    let styleString = '';
    Object.keys(p).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(p, key)) {
        styleString += `${camelCaseToDash(key)}:${p[key]};`;
      }
    });
    // Try not to use external library
    // _.forOwn(p, (val, key) => { str += key + ':' + val + ';' })

    if (!_.has(spot, 'renderCount')) {
      spot.html = `<div class="gis-spot" style="${styleString}"></div><span class="${cx('gis-label', labelClass)}">${content}</span>`;
    } else {
      spot.html = `<div class="gis-spot center-text" style="${styleString}"><span class="${cx('gis-label', labelClass)}">${content}</span></div>`;
    }
    spot.iconAnchor = _.get(item, 'iconAnchor', [parseInt(spot.width, 10) / 2, parseInt(spot.height, 10) / 2]);
    spot.height = 'auto';
    spot.iconSize = _.get(item, 'iconSize', [parseInt(spot.width, 10), parseInt(spot.height, 10)]);

    this._icon = spot;
  }
}

export default Spot;
