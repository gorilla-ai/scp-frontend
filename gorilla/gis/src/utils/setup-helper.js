/**
 * Sets up the map before or during the creation
 *
 * @file   Functions involved during map creation.
 * @author Liszt
 */

import _ from 'lodash';
import L from 'leaflet';
import 'leaflet-draw';
import { tiledMapLayer } from 'esri-leaflet';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import sh from './symbol-helper';
import rh from './render-helper';
import dh from './data-helper';
import { GIS_ERROR as ERROR } from './gis-exception';
import {
  LAYOUT,
  DRAG_MODE,
  REGION_TYPE,
  DRAW_TYPE,
  SYMBOL_TYPE,
  EXTRA_SYMBOL_TYPE,
  TRACK_PANE
} from '../consts/dictionary';
import { DEFAULT_HEATMAP_STYLE, DEFAULT_CONTOUR_STYLE } from '../consts/style';
import plugins from '../plugins';

const log = require('loglevel').getLogger('gis/utils/setup');


/**
 * Fixes the marker image issue.
 *
 * @return this
 */
function setDefaultIcon() {
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl
  });

  return this;
}

/**
 * Sets up all the customized leaflet handlers.
 *
 * @link - https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#measure-options
 * @link - https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#draw-options
 *
 * @param {Object} [options={measureOptions:{}, drawOptions:{}}]    Options for measure and draw modes
 * @param {Object} [options.measureOptions={}]                      Options for measure mode. See the link above
 * @param {Object} [options.drawOptions={}]                         Options for draw mode. See the link above.
 *
 * @return this
 */
function setPlugins(options) {
  this._map.addHandler('gisclick', plugins.gisEvent.createGisClickHandler.call(this, L));
  this._map.addHandler('giszoomend', plugins.gisEvent.createGisZoomendHandler.call(this, L));
  this._map.addHandler('circleSelector', plugins.gisMode.createCircleHandler.call(this, L));
  this._map.addHandler('rectangleSelector', plugins.gisMode.createRectangleHandler.call(this, L));
  this._map.addHandler('measureMode', plugins.gisMode.createMeasureHandler.call(this, L, options.measureOptions));
  this._map.addHandler('drawMode', plugins.gisMode.createDrawHandler.call(this, L, options.drawOptions));

  this._map.gisclick.enable();
  this._map.giszoomend.enable();

  return this;
}

/**
 * Set the truncateLabel if specified
 *
 * @param {L.Marker} layer  The leaflet Marker instance. In GIS, layer instances of Marker & Spot are L.Marker.
 *
 * @return this
 */
function setTruncate(layer) {
  if (this._truncateLabels) {
    const { maxLength, shownOnHover } = this._truncateLabels;
    const icon = layer._icon;
    const dom = sh.getDeepestDom(icon.children[1]);
    const content = dom.innerHTML;
    const truncated = _.truncate(content, {
      length: maxLength,
      omission: '...'
    });

    dom.innerHTML = truncated;

    // Show whole content when mouseover is trigger if truncateLabels.shownOnHover is *true*
    if (shownOnHover) {
      icon.onmouseover = () => { dom.innerHTML = content; };
      icon.onmouseout = () => { dom.innerHTML = truncated; };
    }
  }

  return this;
}

/**
 * The event callback for selectionChange.
 * This is the implementation of clicking on map to trigger selectionChange
 *
 * @param {EventObject} e   The event object of the GIS selectionChange
 *
 */
export function fireSelectionChange(e) {
  // preventDefault and stopPropagation
  L.DomEvent.stop(e);

  // Prevent unexpected behavior in these two modes
  const shouldStop = this._dragMode === DRAG_MODE.DRAW
            || this._dragMode === DRAG_MODE.MEASURE;

  if (shouldStop) {
    return;
  }

  const { layer } = e;
  const symbol = this._symbols[layer._gis_id]
          || this._clusterSymbols[layer._gis_id]
          || this._flags[layer._gis_id];

  const prevSelected = { ...this._selected };

  _.forEach(this._selected, (val, id) => {
    const sbl = this._symbols[id] || this._flags[id];
    sbl.setSelected(false);
  });

  if (symbol && symbol.type === EXTRA_SYMBOL_TYPE.CLUSTER) {
    this._selected = _.reduce(symbol.props.data.ids, (acc, id) => {
      this._symbols[id].setSelected(true);
      acc[id] = true;
      return acc;
    }, {});
  } else if (symbol) {
    symbol.setSelected(true);
    this._selected = { [symbol.id]: true };
  }

  if (!_.isEqual(prevSelected, this._selected)) {
    this._map.fire('selectionChange', { layer })
      .fire('clusterselectionChange');
  }
}

/**
 * Creates the GIS map.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#options
 *
 * @param {String | HTMLElement} containerId    The target DOM id or node to create the map.
 * @param {Object}               options        GIS options. See the link above
 * @param {Object[]}             [data]         Symbol raw data to create on the map
 *
 */
export function initialize(containerId, options, data) {
  /* Remove default baseMap coz, areaMap(mercator projection) do not need baseMap
  // If map url is not specified, use OSM map
  if (typeof options.baseMap === 'undefined') {
    options.baseMap = {
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c'],
      // attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  }
  */

  let layers;
  // Added support for esri/ArcGIS map
  if (_.isPlainObject(options.baseMap) && typeof options.baseMap.providerName !== 'undefined' && options.baseMap.providerName === 'esri') {
    layers = [tiledMapLayer({
      url: options.baseMap.url
    })];
  } else {
    const baseMapUrl = _.isPlainObject(options.baseMap) ? options.baseMap.url : options.baseMap;
    const baseMap = _.isPlainObject(options.baseMap)
      ? L.tileLayer(baseMapUrl, _.pick(options.baseMap, 'subdomains'))
      : baseMapUrl ? L.tileLayer(baseMapUrl) : null;
    layers = _.isArray(options.baseMap) ? options.baseMap : [baseMap];
  }

  //Added support for summing by custom key
  _.forEach(options.clusterOptions, option=>{
    if(!_.has(option,"props.symbol.sumBy") || !_.has(option,"id"))
      return
    const id = option.id
    _.forEach(options.symbolOptions, (symbolOption, index)=>{
      if(id===_.get(symbolOption,"props.cluster")){
        _.set(options.symbolOptions, [index, "props", "__toSum"], (data)=>_.get(data, option.props.symbol.sumBy))//save toSum in marker
        return false;
      }
    })
  })

  setDefaultIcon.call(this);

  // Private properties
  this._overlays = {};
  this._symbols = {};
  this._groups = {};
  this._selected = {};
  this._visible = {};
  this._layout = LAYOUT.STANDARD;
  this._dragMode = options.dragMode || DRAG_MODE.PAN;
  this._regionType = options.regionType || REGION_TYPE.RECTANGLE;
  this._drawType = options.drawType || DRAW_TYPE.MARKER;

  // Enhancement for issue #31
  // Filter this._symbolOptions, remove the ones which doesn't match format
  this._symbolOptions = _.filter(_.get(options, 'symbolOptions', null), ({ match }) => {
    if ((_.isPlainObject(match) && !match.id && !match.type && !match.data && !match.group) && !_.isNil(match)) {
      log.warn(
        ERROR.INVALID_ARGS,
        match,
        'Filter should be an Object and contain at least one of the following pair. '
        + 'id: String/String[]; type: String/String[]; data: Object'
      );
      return false;
    }

    if (_.get(match, 'id') && !dh.isValidArgType(match.id, ['string', ['string']])) {
      log.warn(ERROR.INVALID_ARGS, match.id, 'Type of value in \'id\' should be String/String[]');
      return false;
    }

    if (_.get(match, 'type') && !dh.isValidArgType(match.type, ['string', ['string']])) {
      log.warn(ERROR.INVALID_ARGS, match.type, 'Type of value in \'type\' should be String/String[]');
      return false;
    }

    if (_.get(match, 'data') && !dh.isValidArgType(match.data, 'plainObject')) {
      log.warn(ERROR.INVALID_ARGS, match.data, 'Type of value in \'data\' should be Object');
      return false;
    }

    if (_.get(match, 'group') && !dh.isValidArgType(match.group, 'string')) {
      log.warn(ERROR.INVALID_ARGS, match.string, 'Type of value in \'group\' should be String');
      return false;
    }

    return !match || !!_.get(match, 'id') || !!_.get(match, 'type') || !!_.get(match, 'data') || !!_.get(match, 'group');
  });

  this._trackOptions = _.get(options, 'trackOptions', null);
  this._heatmapOptions = { ...DEFAULT_HEATMAP_STYLE, ...options.heatmapOptions };
  this._contourOptions = { ...DEFAULT_CONTOUR_STYLE, ...options.contourOptions };
  this._truncateLabels = options.truncateLabels
    ? {
      maxLength: _.get(options, 'truncateLabels.maxLength', 13),
      shownOnHover: _.get(options, 'truncateLabels.shownOnHover', true)
    }
    : null;

  this._clusterOptions = _(options.clusterOptions)
    .filter((el) => {
      if (el.id === false) {
        log.warn(ERROR.INVALID_ARGS, el.id, 'Cluster Id should be \'true\' or a String.');
        return false;
      }

      if (!el.props) {
        log.warn(ERROR.INVALID_ARGS, el.props, 'props in clusterOptions[] is required');
        return false;
      }

      return (_.isNil(el.id) || el.id) && !!el.props;
    })
    .map(el => ({
      ...el,
      props: {
        chunkedLoading: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        ..._.get(el, 'props', {})
      }
    }))
    .value();

  this._eventMap = []; // Fix issue #22
  this._clusters = {};
  this._clusterSymbols = {}; // Store the parent nodes

  // Enhancement for track with timebar
  this._interval = [];

  // They need to properly split them and input them
  // Create map
  this._map = L.map(containerId, {
    // preferCanvas: true,
    layers: _.filter(layers, el => (!!el)),
    center: [0, 0],
    zoom: 8,
    // Restrict panning within map
    minZoom: 2,
    maxBounds: L.latLngBounds(L.latLng(90, -180), L.latLng(-90, 180)),
    maxBoundsViscosity: 1.0,
    attributionControl: false,
    ...options.mapOptions
  });

  // Enable region-selection and set icon url
  setPlugins.call(this, {
    measureOptions: options.measureOptions || {},
    drawOptions: options.drawOptions || {}
  });

  if (options.baseImage) {
    const images = _.filter(options.baseImage, (el) => {
      const valid = dh.isValidArgType(el, ['string', 'plainObject', ['plainObject']]);
      if (!valid) {
        log.warn(ERROR.INVALID_ARGS, el, 'Please enter a valid baseImage type, which is String, Object, or Object[]');
        log.warn(
          ERROR.INVALID_ARGS,
          el,
          'If it\'s an Object, it should be {id:String, url:String, xy:{x:Number, y:Number}, size:{width:String, height:String}, opacity:Number, zoom:Number'
        );
      }

      return valid;
    });

    // const resetBounds = _.isNil(_.get(options, 'mapOptions.maxBounds'))
    // const resetZoom = _.isNil(_.get(options, 'mapOptions.zoom'))
    // rh.renderOverlay.call(this, images, resetBounds, resetZoom)
    rh.renderOverlay.call(this, images);
  }

  // Create the pane to place the tracks' signs which makes them on the top layer
  this._map.createPane(TRACK_PANE);

  // For managing events
  this._eventCore = L.featureGroup([])
  // Enable trigger selectionChange by clicking
    .on('click', fireSelectionChange.bind(this))
    .addTo(this._map);

  // Used for track mode
  this._flagGroup = L.featureGroup([]).addTo(this._map);

  // For setting the label truncate
  this._map.on('layeradd', ({ layer }) => {
    const id = layer._gis_id;
    const type = _.get(this._symbols, `${id}.type`);

    if (type === SYMBOL_TYPE.MARKER || type === SYMBOL_TYPE.SPOT) {
      setTruncate.call(this, layer);
    }
  });

  // Add new symbol layer to _eventCore to manage the events
  // virtualadd and virtualremove are for draw mode
  this._map.on('layeradd virtualadd', ({ layer }) => {
    const id = layer._gis_id;
    const symbol = _.get(this._symbols, id)
            || _.get(this._clusterSymbols, id)
            || _.get(this._flags, id);

    // Duplicated added or featureGroup may trigger event twice. Need to skip them
    const isValidLyr = symbol
              && !(layer instanceof L.FeatureGroup)
              && !this._eventCore.hasLayer(layer);

    const drawHandler = this._map.drawMode;
    const drawnGroup = drawHandler._drawnGroup;
    // In draw mode
    if (drawHandler.enabled() && layer._virtual_id && this._editableIds[id]) {
      this._map.removeLayer(layer);
      const virtual = drawnGroup.getLayer(layer._virtual_id);
      !virtual && drawnGroup.addLayer(drawHandler._virtual[id]);
    } else if (!drawHandler.enabled() && isValidLyr) {
      !this._eventCore.hasLayer(layer) && this._eventCore.addLayer(layer);
    }
  });

  // Remove symbol layer from _eventCore & drawnGroup
  // virtualadd and virtualremove are for draw mode
  this._map.on('layerremove virtualremove', ({ layer }) => {
    this._eventCore.hasLayer(layer) && this._eventCore.removeLayer(layer);

    // In draw mode, need to clear the virtual symbols if original is removed
    const drawHandler = this._map.drawMode;
    const drawnGroup = drawHandler._drawnGroup;

    if (layer._virtual_id && drawHandler.enabled() && drawnGroup) {
      const virtual = drawnGroup.getLayer(layer._virtual_id);
      virtual && drawnGroup.removeLayer(virtual);
    }
  });

  /*
    Re-render the cluster for the selected cluster.
    When changeing zoom level or running show/hide/filter-symbols,
    cluster parent layer will be added or removed.
  */
  this._map.on('clusterselectionChange', () => {
    rh.renderSelectedCluster.call(this);
  });

  // Set panes
  options.panes && rh.renderPane.call(this, options.panes);

  // Set symbols
  data && this.setSymbol(data);

  // Set the layout
  options.layout && this.setLayout(options.layout);

  // Set the drag mode if region-selection is enabled
  if (this._dragMode === DRAG_MODE.REGION && REGION_TYPE[_.toUpper(this._regionType)]) {
    this._map[`${this._regionType}Selector`].enable();
  } else if (this._dragMode === DRAG_MODE.MEASURE) {
    this._map.measureMode.enable();
  } else if (this._dragMode === DRAG_MODE.DRAW) {
    this._map.drawMode.enable();
  }
}
