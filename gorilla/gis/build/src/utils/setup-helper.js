"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fireSelectionChange = fireSelectionChange;
exports.initialize = initialize;

var _lodash = _interopRequireDefault(require("lodash"));

var _leaflet = _interopRequireDefault(require("leaflet"));

require("leaflet-draw");

var _esriLeaflet = require("esri-leaflet");

var _markerIcon2x = _interopRequireDefault(require("leaflet/dist/images/marker-icon-2x.png"));

var _markerIcon = _interopRequireDefault(require("leaflet/dist/images/marker-icon.png"));

var _markerShadow = _interopRequireDefault(require("leaflet/dist/images/marker-shadow.png"));

var _symbolHelper = _interopRequireDefault(require("./symbol-helper"));

var _renderHelper = _interopRequireDefault(require("./render-helper"));

var _dataHelper = _interopRequireDefault(require("./data-helper"));

var _gisException = require("./gis-exception");

var _dictionary = require("../consts/dictionary");

var _style = require("../consts/style");

var _plugins = _interopRequireDefault(require("../plugins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var log = require('loglevel').getLogger('gis/utils/setup');
/**
 * Fixes the marker image issue.
 *
 * @return this
 */


function setDefaultIcon() {
  delete _leaflet["default"].Icon.Default.prototype._getIconUrl;

  _leaflet["default"].Icon.Default.mergeOptions({
    iconRetinaUrl: _markerIcon2x["default"],
    iconUrl: _markerIcon["default"],
    shadowUrl: _markerShadow["default"]
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
  this._map.addHandler('gisclick', _plugins["default"].gisEvent.createGisClickHandler.call(this, _leaflet["default"]));

  this._map.addHandler('giszoomend', _plugins["default"].gisEvent.createGisZoomendHandler.call(this, _leaflet["default"]));

  this._map.addHandler('circleSelector', _plugins["default"].gisMode.createCircleHandler.call(this, _leaflet["default"]));

  this._map.addHandler('rectangleSelector', _plugins["default"].gisMode.createRectangleHandler.call(this, _leaflet["default"]));

  this._map.addHandler('measureMode', _plugins["default"].gisMode.createMeasureHandler.call(this, _leaflet["default"], options.measureOptions));

  this._map.addHandler('drawMode', _plugins["default"].gisMode.createDrawHandler.call(this, _leaflet["default"], options.drawOptions));

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
    var _this$_truncateLabels = this._truncateLabels,
        maxLength = _this$_truncateLabels.maxLength,
        shownOnHover = _this$_truncateLabels.shownOnHover;
    var icon = layer._icon;

    var dom = _symbolHelper["default"].getDeepestDom(icon.children[1]);

    var content = dom.innerHTML;

    var truncated = _lodash["default"].truncate(content, {
      length: maxLength,
      omission: '...'
    });

    dom.innerHTML = truncated; // Show whole content when mouseover is trigger if truncateLabels.shownOnHover is *true*

    if (shownOnHover) {
      icon.onmouseover = function () {
        dom.innerHTML = content;
      };

      icon.onmouseout = function () {
        dom.innerHTML = truncated;
      };
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


function fireSelectionChange(e) {
  var _this = this;

  // preventDefault and stopPropagation
  _leaflet["default"].DomEvent.stop(e); // Prevent unexpected behavior in these two modes


  var shouldStop = this._dragMode === _dictionary.DRAG_MODE.DRAW || this._dragMode === _dictionary.DRAG_MODE.MEASURE;

  if (shouldStop) {
    return;
  }

  var layer = e.layer;
  var symbol = this._symbols[layer._gis_id] || this._clusterSymbols[layer._gis_id] || this._flags[layer._gis_id];

  var prevSelected = _objectSpread({}, this._selected);

  _lodash["default"].forEach(this._selected, function (val, id) {
    var sbl = _this._symbols[id] || _this._flags[id];
    sbl.setSelected(false);
  });

  if (symbol && symbol.type === _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER) {
    this._selected = _lodash["default"].reduce(symbol.props.data.ids, function (acc, id) {
      _this._symbols[id].setSelected(true);

      acc[id] = true;
      return acc;
    }, {});
  } else if (symbol) {
    symbol.setSelected(true);
    this._selected = _defineProperty({}, symbol.id, true);
  }

  if (!_lodash["default"].isEqual(prevSelected, this._selected)) {
    this._map.fire('selectionChange', {
      layer: layer
    }).fire('clusterselectionChange');
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


function initialize(containerId, options, data) {
  var _this2 = this;

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
  var layers; // Added support for esri/ArcGIS map

  if (_lodash["default"].isPlainObject(options.baseMap) && typeof options.baseMap.providerName !== 'undefined' && options.baseMap.providerName === 'esri') {
    layers = [(0, _esriLeaflet.tiledMapLayer)({
      url: options.baseMap.url
    })];
  } else {
    var baseMapUrl = _lodash["default"].isPlainObject(options.baseMap) ? options.baseMap.url : options.baseMap;
    var baseMap = _lodash["default"].isPlainObject(options.baseMap) ? _leaflet["default"].tileLayer(baseMapUrl, _lodash["default"].pick(options.baseMap, 'subdomains')) : baseMapUrl ? _leaflet["default"].tileLayer(baseMapUrl) : null;
    layers = _lodash["default"].isArray(options.baseMap) ? options.baseMap : [baseMap];
  } //Added support for summing by custom key


  _lodash["default"].forEach(options.clusterOptions, function (option) {
    if (!_lodash["default"].has(option, "props.symbol.sumBy") || !_lodash["default"].has(option, "id")) return;
    var id = option.id;

    _lodash["default"].forEach(options.symbolOptions, function (symbolOption, index) {
      if (id === _lodash["default"].get(symbolOption, "props.cluster")) {
        _lodash["default"].set(options.symbolOptions, [index, "props", "__toSum"], function (data) {
          return _lodash["default"].get(data, option.props.symbol.sumBy);
        }); //save toSum in marker


        return false;
      }
    });
  });

  setDefaultIcon.call(this); // Private properties

  this._overlays = {};
  this._symbols = {};
  this._groups = {};
  this._selected = {};
  this._visible = {};
  this._layout = _dictionary.LAYOUT.STANDARD;
  this._dragMode = options.dragMode || _dictionary.DRAG_MODE.PAN;
  this._regionType = options.regionType || _dictionary.REGION_TYPE.RECTANGLE;
  this._drawType = options.drawType || _dictionary.DRAW_TYPE.MARKER; // Enhancement for issue #31
  // Filter this._symbolOptions, remove the ones which doesn't match format

  this._symbolOptions = _lodash["default"].filter(_lodash["default"].get(options, 'symbolOptions', null), function (_ref) {
    var match = _ref.match;

    if (_lodash["default"].isPlainObject(match) && !match.id && !match.type && !match.data && !match.group && !_lodash["default"].isNil(match)) {
      log.warn(_gisException.GIS_ERROR.INVALID_ARGS, match, 'Filter should be an Object and contain at least one of the following pair. ' + 'id: String/String[]; type: String/String[]; data: Object');
      return false;
    }

    if (_lodash["default"].get(match, 'id') && !_dataHelper["default"].isValidArgType(match.id, ['string', ['string']])) {
      log.warn(_gisException.GIS_ERROR.INVALID_ARGS, match.id, 'Type of value in \'id\' should be String/String[]');
      return false;
    }

    if (_lodash["default"].get(match, 'type') && !_dataHelper["default"].isValidArgType(match.type, ['string', ['string']])) {
      log.warn(_gisException.GIS_ERROR.INVALID_ARGS, match.type, 'Type of value in \'type\' should be String/String[]');
      return false;
    }

    if (_lodash["default"].get(match, 'data') && !_dataHelper["default"].isValidArgType(match.data, 'plainObject')) {
      log.warn(_gisException.GIS_ERROR.INVALID_ARGS, match.data, 'Type of value in \'data\' should be Object');
      return false;
    }

    if (_lodash["default"].get(match, 'group') && !_dataHelper["default"].isValidArgType(match.group, 'string')) {
      log.warn(_gisException.GIS_ERROR.INVALID_ARGS, match.string, 'Type of value in \'group\' should be String');
      return false;
    }

    return !match || !!_lodash["default"].get(match, 'id') || !!_lodash["default"].get(match, 'type') || !!_lodash["default"].get(match, 'data') || !!_lodash["default"].get(match, 'group');
  });
  this._trackOptions = _lodash["default"].get(options, 'trackOptions', null);
  this._heatmapOptions = _objectSpread(_objectSpread({}, _style.DEFAULT_HEATMAP_STYLE), options.heatmapOptions);
  this._contourOptions = _objectSpread(_objectSpread({}, _style.DEFAULT_CONTOUR_STYLE), options.contourOptions);
  this._truncateLabels = options.truncateLabels ? {
    maxLength: _lodash["default"].get(options, 'truncateLabels.maxLength', 13),
    shownOnHover: _lodash["default"].get(options, 'truncateLabels.shownOnHover', true)
  } : null;
  this._clusterOptions = (0, _lodash["default"])(options.clusterOptions).filter(function (el) {
    if (el.id === false) {
      log.warn(_gisException.GIS_ERROR.INVALID_ARGS, el.id, 'Cluster Id should be \'true\' or a String.');
      return false;
    }

    if (!el.props) {
      log.warn(_gisException.GIS_ERROR.INVALID_ARGS, el.props, 'props in clusterOptions[] is required');
      return false;
    }

    return (_lodash["default"].isNil(el.id) || el.id) && !!el.props;
  }).map(function (el) {
    return _objectSpread(_objectSpread({}, el), {}, {
      props: _objectSpread({
        chunkedLoading: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false
      }, _lodash["default"].get(el, 'props', {}))
    });
  }).value();
  this._eventMap = []; // Fix issue #22

  this._clusters = {};
  this._clusterSymbols = {}; // Store the parent nodes
  // Enhancement for track with timebar

  this._interval = []; // They need to properly split them and input them
  // Create map

  this._map = _leaflet["default"].map(containerId, _objectSpread({
    // preferCanvas: true,
    layers: _lodash["default"].filter(layers, function (el) {
      return !!el;
    }),
    center: [0, 0],
    zoom: 8,
    // Restrict panning within map
    minZoom: 2,
    maxBounds: _leaflet["default"].latLngBounds(_leaflet["default"].latLng(90, -180), _leaflet["default"].latLng(-90, 180)),
    maxBoundsViscosity: 1.0,
    attributionControl: false
  }, options.mapOptions)); // Enable region-selection and set icon url

  setPlugins.call(this, {
    measureOptions: options.measureOptions || {},
    drawOptions: options.drawOptions || {}
  });

  if (options.baseImage) {
    var images = _lodash["default"].filter(options.baseImage, function (el) {
      var valid = _dataHelper["default"].isValidArgType(el, ['string', 'plainObject', ['plainObject']]);

      if (!valid) {
        log.warn(_gisException.GIS_ERROR.INVALID_ARGS, el, 'Please enter a valid baseImage type, which is String, Object, or Object[]');
        log.warn(_gisException.GIS_ERROR.INVALID_ARGS, el, 'If it\'s an Object, it should be {id:String, url:String, xy:{x:Number, y:Number}, size:{width:String, height:String}, opacity:Number, zoom:Number');
      }

      return valid;
    }); // const resetBounds = _.isNil(_.get(options, 'mapOptions.maxBounds'))
    // const resetZoom = _.isNil(_.get(options, 'mapOptions.zoom'))
    // rh.renderOverlay.call(this, images, resetBounds, resetZoom)


    _renderHelper["default"].renderOverlay.call(this, images);
  } // Create the pane to place the tracks' signs which makes them on the top layer


  this._map.createPane(_dictionary.TRACK_PANE); // For managing events


  this._eventCore = _leaflet["default"].featureGroup([]) // Enable trigger selectionChange by clicking
  .on('click', fireSelectionChange.bind(this)).addTo(this._map); // Used for track mode

  this._flagGroup = _leaflet["default"].featureGroup([]).addTo(this._map); // For setting the label truncate

  this._map.on('layeradd', function (_ref2) {
    var layer = _ref2.layer;
    var id = layer._gis_id;

    var type = _lodash["default"].get(_this2._symbols, "".concat(id, ".type"));

    if (type === _dictionary.SYMBOL_TYPE.MARKER || type === _dictionary.SYMBOL_TYPE.SPOT) {
      setTruncate.call(_this2, layer);
    }
  }); // Add new symbol layer to _eventCore to manage the events
  // virtualadd and virtualremove are for draw mode


  this._map.on('layeradd virtualadd', function (_ref3) {
    var layer = _ref3.layer;
    var id = layer._gis_id;

    var symbol = _lodash["default"].get(_this2._symbols, id) || _lodash["default"].get(_this2._clusterSymbols, id) || _lodash["default"].get(_this2._flags, id); // Duplicated added or featureGroup may trigger event twice. Need to skip them


    var isValidLyr = symbol && !(layer instanceof _leaflet["default"].FeatureGroup) && !_this2._eventCore.hasLayer(layer);
    var drawHandler = _this2._map.drawMode;
    var drawnGroup = drawHandler._drawnGroup; // In draw mode

    if (drawHandler.enabled() && layer._virtual_id && _this2._editableIds[id]) {
      _this2._map.removeLayer(layer);

      var virtual = drawnGroup.getLayer(layer._virtual_id);
      !virtual && drawnGroup.addLayer(drawHandler._virtual[id]);
    } else if (!drawHandler.enabled() && isValidLyr) {
      !_this2._eventCore.hasLayer(layer) && _this2._eventCore.addLayer(layer);
    }
  }); // Remove symbol layer from _eventCore & drawnGroup
  // virtualadd and virtualremove are for draw mode


  this._map.on('layerremove virtualremove', function (_ref4) {
    var layer = _ref4.layer;
    _this2._eventCore.hasLayer(layer) && _this2._eventCore.removeLayer(layer); // In draw mode, need to clear the virtual symbols if original is removed

    var drawHandler = _this2._map.drawMode;
    var drawnGroup = drawHandler._drawnGroup;

    if (layer._virtual_id && drawHandler.enabled() && drawnGroup) {
      var virtual = drawnGroup.getLayer(layer._virtual_id);
      virtual && drawnGroup.removeLayer(virtual);
    }
  });
  /*
    Re-render the cluster for the selected cluster.
    When changeing zoom level or running show/hide/filter-symbols,
    cluster parent layer will be added or removed.
  */


  this._map.on('clusterselectionChange', function () {
    _renderHelper["default"].renderSelectedCluster.call(_this2);
  }); // Set panes


  options.panes && _renderHelper["default"].renderPane.call(this, options.panes); // Set symbols

  data && this.setSymbol(data); // Set the layout

  options.layout && this.setLayout(options.layout); // Set the drag mode if region-selection is enabled

  if (this._dragMode === _dictionary.DRAG_MODE.REGION && _dictionary.REGION_TYPE[_lodash["default"].toUpper(this._regionType)]) {
    this._map["".concat(this._regionType, "Selector")].enable();
  } else if (this._dragMode === _dictionary.DRAG_MODE.MEASURE) {
    this._map.measureMode.enable();
  } else if (this._dragMode === _dictionary.DRAG_MODE.DRAW) {
    this._map.drawMode.enable();
  }
}
//# sourceMappingURL=setup-helper.js.map