"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderHeatmap = renderHeatmap;
exports.renderTrack = renderTrack;
exports.renderContour = renderContour;
exports.renderPane = renderPane;
exports.renderOverlay = renderOverlay;
exports.renderSelectedCluster = renderSelectedCluster;
exports.renderCluster = renderCluster;
exports.renderGroup = renderGroup;
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _leaflet = _interopRequireDefault(require("leaflet"));

require("leaflet.markercluster/dist/leaflet.markercluster");

var _leafletHeatmap = _interopRequireDefault(require("heatmap.js/plugins/leaflet-heatmap"));

var turf = _interopRequireWildcard(require("@turf/turf"));

var _d3Contour = require("d3-contour");

var _gisHelper = require("./gis-helper");

var _dataHelper = require("./data-helper");

var _symbolHelper = require("./symbol-helper");

var _mergeHelper = require("./merge-helper");

var _polyline = _interopRequireDefault(require("../symbols/polyline"));

var _marker = _interopRequireDefault(require("../symbols/marker"));

var _spot = _interopRequireDefault(require("../symbols/spot"));

var _style = require("../consts/style");

var _dictionary = require("../consts/dictionary");

var _gisException = require("./gis-exception");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var log = require('loglevel').getLogger('gis/utils/render-helper');

var FACTOR = 10;
/**
 * Converts symbol to heatspot.
 *
 * @param {String | String[] | Object | Function | undefined | null} filter     Filter to convert matched symbols to heatspot. If it's a String or String[], converts symbols by ids; if it's a Object, converts symbols by all the attributes in symbols; if it's a Function, converts symbols by the given callback(Symbol symbol, String id, Object gis._symbols)
 *
 */

function _convertSymbolToHeatspot(filter) {
  var _this = this;

  var map = this._map;

  var symbolData = _symbolHelper.getSymbol.call(this, filter, true, ['id', 'type', 'props.latlng', 'props.heatmap', 'props.radius', 'props.geojson']);

  var spots = _lodash["default"].reduce(symbolData, function (result, el) {
    if (!el.heatmap) {
      return result;
    }

    var id = el.id,
        type = el.type,
        heatmap = el.heatmap;
    var symbol = _this._symbols[el.id];
    var data = {};
    var centroid = [];
    var radius = el.radius ? el.radius / _dictionary.HUNDRED_MILES_TO_METERS : _this._heatmapOptions.radius / _dictionary.HUNDRED_MILES_TO_METERS;
    var area;
    var latlng;
    var geojson;
    var bbox; // Enhancement for issue #6. Replace props 'intensity' with 'heatmap',
    // which is a Bool/Object/Function(Object *symbolObj*)
    // If *heatmap* === true, use default min value;
    // if *heatmap* is an Object, use *heatmap.intensity*;
    // if *heatmap* is a function, it will return Bool or Object,
    // and use the above rule to determine intensity

    var intensity = _this._heatmapOptions.min;

    if (_lodash["default"].isPlainObject(heatmap)) {
      intensity = heatmap.intensity || _this._heatmapOptions.min;
    } else if (_lodash["default"].isFunction(heatmap)) {
      var heatspot = heatmap(_symbolHelper.getSymbol.call(_this, id, true));

      if (_lodash["default"].isBoolean(heatspot) && heatspot) {
        intensity = _this._heatmapOptions.min;
      } else if (_lodash["default"].isPlainObject(heatspot)) {
        intensity = heatspot.intensity;
      }
    }

    switch (type) {
      case _dictionary.SYMBOL_TYPE.RECTANGLE:
      case _dictionary.SYMBOL_TYPE.POLYGON:
        geojson = symbol.layer.toGeoJSON();
        area = turf.area(geojson);
        radius = Math.sqrt(area / Math.PI) / _dictionary.HUNDRED_MILES_TO_METERS; // coordinates of geojson is [lng, lat]

        centroid = turf.centerOfMass(geojson).geometry.coordinates;
        centroid = _lodash["default"].reverse(centroid);
        data = {
          lat: centroid[0],
          lng: centroid[1],
          radius: radius,
          intensity: el.intensity || _this._heatmapOptions.min
        };
        break;
      // TBD: polyline & geojson heatspot

      case _dictionary.SYMBOL_TYPE.POLYLINE:
        geojson = symbol.props.directed ? symbol.layer.getLayers()[0].toGeoJSON() : symbol.layer.toGeoJSON(); // coordinates of geojson is [lng, lat]

        centroid = turf.centerOfMass(geojson).geometry.coordinates;
        centroid = _lodash["default"].reverse(centroid); // Get the nearest point to the centroid,
        // then calculating the distance to centroid as radius

        latlng = _lodash["default"].minBy(geojson.geometry.coordinates, function (point) {
          point = _lodash["default"].reverse(point);
          return map.distance(centroid, point);
        });
        radius = map.distance(centroid, latlng) / _dictionary.HUNDRED_MILES_TO_METERS;
        data = {
          lat: centroid[0],
          lng: centroid[1],
          radius: radius,
          intensity: intensity
        };
        break;

      case _dictionary.SYMBOL_TYPE.GEOJSON:
        // Get the centroid and bbox of the geojson,
        // then calculating distance from centroid to a vertex on bbox as radius
        geojson = el.geojson.type !== 'FeatureCollection' ? turf.flatten(el.geojson) : el.geojson;
        bbox = turf.bbox(geojson); // return [ minX, minY, maxX, maxY ]

        latlng = [bbox[1], bbox[0]]; // coordinates of geojson is [lng, lat]

        centroid = turf.centerOfMass(geojson).geometry.coordinates;
        centroid = _lodash["default"].reverse(centroid);
        radius = map.distance(centroid, latlng) / _dictionary.HUNDRED_MILES_TO_METERS;
        data = {
          lat: centroid[0],
          lng: centroid[1],
          radius: radius,
          intensity: intensity
        };
        break;

      case _dictionary.SYMBOL_TYPE.MARKER:
      case _dictionary.SYMBOL_TYPE.CIRCLE:
      case _dictionary.SYMBOL_TYPE.CUSTOM:
      default:
        data = {
          lat: el.latlng[0],
          lng: el.latlng[1],
          radius: radius,
          intensity: intensity
        };
    }

    result.push(data);
    return result;
  }, []);

  return spots;
}
/**
 * Resets map max bounds. Used in renderOverlay().
 *
 * @param {Boolean} [resetZoom=undefined]   Reset the zoom level after adjusting the max bounds or not.
 *
 */


function _resetMapBounds(resetZoom) {
  var map = this._map;
  var overlays = this._overlays;

  var maxBounds = _lodash["default"].reduce(overlays, function (acc, _ref) {
    var xy = _ref.xy,
        size = _ref.size;

    if (xy.y < acc[0][0]) {
      acc[0][0] = xy.y;
    }

    if (xy.x < acc[0][1]) {
      acc[0][1] = xy.x;
    }

    if (xy.y + size.height > acc[1][0]) {
      acc[1][0] = xy.y + size.height;
    }

    if (xy.x + size.width > acc[1][1]) {
      acc[1][1] = xy.x + size.width;
    }

    return acc;
  }, [[0, 0], [0, 0]]);

  map.setMaxBounds(maxBounds);
  resetZoom && this._map.fitBounds(maxBounds);
  var mapZoom = map.getZoom();

  _lodash["default"].forEach(overlays, function (_ref2) {
    var zoom = _ref2.zoom,
        layer = _ref2.layer;

    if (!_lodash["default"].isNil(zoom) && zoom > mapZoom && map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
}
/**
 * Creates cluster icon.
 *
 * @param {String}          id                                               The leaflet internal id of cluster node
 * @param {Object}          options                                          Symbol options for this cluster node.
 * @param {Object}          options.symbol
 * @param {String}          options.symbol.sumBy                             count will use this key to sum. Ps. the __toSum is insert to child markers by the auto create setting in setup-helper
 * @param {Array}           options.symbol.renderCount                       only work while using spot type
 * @param {Number}          options.symbol.renderCount.lowerBound            count render lowerBound
 * @param {Number}          options.symbol.renderCount.upperBound            count render upperBound
 * @param {String}          [options.symbol.renderCount.backgroundColor]     backgroundColor in this range. Use symbol color by default.
 * @param {Number}          [options.symbol.renderCount.size]                size in this range. 15px by default.
 * @param {L.ClusterNode}   layer                                            The cluster node layer instance.
 *
 * @return {L.divIcon}     The created cluster icon
 */


function _createClusterIcon(id, options, layer) {
  // const parentId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(1, 6)
  var parentId = layer._leaflet_id;
  var count = null;

  if (!_lodash["default"].has(options, 'props.symbol.sumBy')) {
    count = layer.getChildCount();
  } else {
    var childrens = layer.getAllChildMarkers();
    count = 0;

    _lodash["default"].forEach(childrens, function (children) {
      count += _lodash["default"].get(children, ['options', 'icon', 'options', '__toSum'], 0);
    }); //        count = Math.floor(count);

  }

  var sblObj = _objectSpread(_objectSpread({
    id: parentId,
    // type: 'cluster' is used for filtering pseudo cluster symbol
    // type: EXTRA_SYMBOL_TYPE.CLUSTER,
    type: _lodash["default"].get(options, 'props.symbol.type', _dictionary.SYMBOL_TYPE.MARKER)
  }, _lodash["default"].get(options, 'props.symbol', {})), {}, {
    data: _objectSpread(_objectSpread({}, _lodash["default"].get(options, 'props.symbol.data', {})), {}, {
      cluster: id,
      count: count,
      ids: _lodash["default"].map(layer.getAllChildMarkers(), function (lyr) {
        return lyr._gis_id;
      })
    })
  });

  if (_lodash["default"].has(options, 'props.symbol.renderCount')) {
    var rootBackgroundColor = _lodash["default"].get(options, 'props.symbol.backgroundColor');

    _lodash["default"].get(options, 'props.symbol.renderCount').some(function (value) {
      var lowerBound = value.lowerBound,
          upperBound = value.upperBound,
          _value$size = value.size,
          size = _value$size === void 0 ? '15px' : _value$size,
          _value$backgroundColo = value.backgroundColor,
          backgroundColor = _value$backgroundColo === void 0 ? rootBackgroundColor : _value$backgroundColo;

      if (lowerBound <= count && _lodash["default"].isNil(upperBound)) {
        options.props.symbol.width = size;
        options.props.symbol.height = size;
        options.props.symbol.backgroundColor = backgroundColor;
      } else if (_lodash["default"].isNil(lowerBound) && count <= upperBound) {
        options.props.symbol.width = size;
        options.props.symbol.height = size;
        options.props.symbol.backgroundColor = backgroundColor;
      } else if (lowerBound <= count && count <= upperBound) {
        options.props.symbol.width = size;
        options.props.symbol.height = size;
        options.props.symbol.backgroundColor = backgroundColor;
      }
    });
  }

  var props = (0, _mergeHelper.mergeProps)(sblObj, [{
    data: sblObj.data
  }, _lodash["default"].get(options, 'props.symbol')]);
  var selectedProps = (0, _mergeHelper.mergeProps)(sblObj, [_lodash["default"].get(options, 'props.symbol.selectedProps')]);
  props.className = "gis-cluster".concat(_lodash["default"].get(props, 'className', ''));
  props.label = props.label || {
    content: "* ".concat(layer.getChildCount())
  };
  var ParentNode = sblObj.type === _dictionary.SYMBOL_TYPE.MARKER ? _marker["default"] : _spot["default"];
  var parent = new ParentNode(parentId, _lodash["default"].omit(props, 'type'), false, selectedProps);
  layer._gis_id = parentId;
  parent._type = _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER;
  parent._origType = sblObj.type;
  parent._layer = layer;
  this._clusterSymbols[layer._leaflet_id] = parent;
  return _leaflet["default"].divIcon(parent._icon);
}
/**
 * Render heatmap.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#measure-options
 *
 * @param {Object} [options]    Heatmap options. If undefined, apply the original heatmap options. For more info, see the link above.
 *
 */


function renderHeatmap(options) {
  this._heatmapOptions = _objectSpread(_objectSpread({}, this._heatmapOptions), options);
  var map = this._map;
  var heatmap = this._heatmap;

  var visible = _lodash["default"].keys(this._visible);

  var data = _lodash["default"].isEmpty(visible) ? [] : _convertSymbolToHeatspot.call(this, visible);
  var newHeatmap = new _leafletHeatmap["default"](this._heatmapOptions);
  newHeatmap.setData({
    data: data,
    min: options ? options.min : this._heatmapOptions.min,
    max: options ? options.max : this._heatmapOptions.max
  });

  if (this._layout === _dictionary.LAYOUT.HEATMAP) {
    if (heatmap && map.hasLayer(heatmap)) {
      map.removeLayer(heatmap);
    }

    map.addLayer(newHeatmap);
  }

  this._heatmap = newHeatmap;
}
/**
 * Render tracks in track layout.
 *
 */


function renderTrack() {
  var _this2 = this;

  this._flagGroup.clearLayers();

  this._flags = this._flags || {}; // For placing the ongoing nodes.

  var isTrack = this._layout === _dictionary.LAYOUT.TRACK;
  var isStandard = this._layout === _dictionary.LAYOUT.STANDARD;
  var interval = this._interval;
  var tracks = []; // Group by track ("track" will be the key), then sorting by ts in each group

  var groups = _lodash["default"].chain(this._symbols).filter(function (sbl) {
    return !!sbl.props.track && (_lodash["default"].isNumber(sbl.props.ts) || _lodash["default"].isArray(sbl.props.ts) && !_lodash["default"].isEmpty(sbl.props.ts));
  }).groupBy(function (sbl) {
    // Enhancement for issue #6
    // Rename props "trackId" to "track",
    // and type is String or Function(Object *symbolObj*) which will return a String
    return sbl.props.track && _lodash["default"].isFunction(sbl.props.track) ? sbl.props.track(_symbolHelper.getSymbol.call(_this2, sbl.id, true)) : sbl.props.track;
  }).reduce(function (result, grp, key) {
    // Enhancement for issue #32.
    // Support for *ts* is an array
    var trackGrp = _lodash["default"].chain(grp).map(function (sbl) {
      return _lodash["default"].isArray(sbl.props.ts) ? _lodash["default"].map(sbl.props.ts, function (t) {
        var symbol = _lodash["default"].cloneDeep(sbl);

        symbol._props.ts = t;
        return symbol;
      }) : sbl;
    }).flatten() // .filter(sbl => interval.length === 0 || isBetween(sbl._props.ts, interval))
    .sortBy(function (sbl) {
      return sbl.props.ts;
    }).map(function (_ref3) {
      var id = _ref3.id,
          props = _ref3.props;
      return {
        id: id,
        latlng: props.latlng,
        ts: props.ts
      };
    }).value();

    result[key] = trackGrp;
    return result;
  }, {}).value();

  _lodash["default"].forEach(groups, function (grp, key) {
    // Find the first and last visible marker/spot, and draw the track between two points
    var startIdx = _lodash["default"].findIndex(grp, function (_ref4) {
      var id = _ref4.id,
          ts = _ref4.ts;
      return _this2._visible[id] && (interval.length === 0 || (0, _dataHelper.isBetween)(ts, interval));
    });

    var endIdx = _lodash["default"].findLastIndex(grp, function (_ref5) {
      var id = _ref5.id,
          ts = _ref5.ts;
      return _this2._visible[id] && (interval.length === 0 || (0, _dataHelper.isBetween)(ts, interval));
    });

    var isExist = _this2._symbols[key] && _this2._symbols[key].type === _dictionary.EXTRA_SYMBOL_TYPE.TRACK;
    var isDuplicated = _this2._symbols[key] && _this2._symbols[key].type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK;
    var isSelected = false; // For redrawing track

    if (isExist) {
      isSelected = _this2._symbols[key].selected;

      _this2._map.removeLayer(_this2._symbols[key].layer);

      _lodash["default"].forEach(_lodash["default"].uniq(grp), function (_ref6) {
        var id = _ref6.id;
        var _this2$_symbols$id = _this2._symbols[id],
            _props = _this2$_symbols$id._props,
            _selectedProps = _this2$_symbols$id._selectedProps,
            _origProps = _this2$_symbols$id._origProps,
            _origSelectedProps = _this2$_symbols$id._origSelectedProps,
            selected = _this2$_symbols$id.selected;
        var isFlagMode = !_lodash["default"].isEqual(_props, _origProps) || !_lodash["default"].isEqual(_selectedProps, _origSelectedProps); // Reset all markers/spots which is changed as flag
        // This is for preventing they keep as flag when they shouldn't be.

        if (isFlagMode) {
          _this2._symbols[id].set(_origProps, selected, _origSelectedProps);
        }

        _this2._map.hasLayer(_this2._symbols[id].layer) && _this2._map.removeLayer(_this2._symbols[id].layer);
      });

      delete _this2._symbols[key];
    } // Do not draw track if trackId duplicates with any symbol


    if (isDuplicated) {
      log.warn(_gisException.GIS_ERROR.INVALID_ID, key, "track ".concat(key, " which Id duplicates with a symbol, please rename it"));
    } else if (startIdx !== -1 && endIdx !== -1) {
      // Enhancement for issue #31
      // Get style from config, and later styles get higher priority
      // Cfgs without "match" key will be applied to all tracks
      var trackObj = _objectSpread(_objectSpread({
        id: key,
        type: _dictionary.EXTRA_SYMBOL_TYPE.TRACK,
        latlng: _lodash["default"].map(grp, 'latlng')
      }, _style.DEFAULT_TRACK_STYLE), {}, {
        selected: false,
        selectedProps: _style.DEFAULT_TRACK_SLT_STYLE
      });

      var propsToUse = {
        showInvisible: false,
        showOngoing: false,
        startSymbol: {},
        endSymbol: {},
        internalSymbols: false
      };
      var selectedPropsToUse = {
        startSymbol: {},
        endSymbol: {}
      };

      _lodash["default"].forEach(_this2._trackOptions, function (_ref7) {
        var match = _ref7.match,
            props = _ref7.props,
            selectedProps = _ref7.selectedProps;

        if (match && match.id === key || !match) {
          propsToUse = (0, _mergeHelper.mergeProps)(trackObj, [_style.DEFAULT_TRACK_STYLE, propsToUse, props]);
          selectedPropsToUse = (0, _mergeHelper.mergeProps)(trackObj, [_style.DEFAULT_TRACK_SLT_STYLE, selectedPropsToUse, selectedProps]);
        }
      });

      propsToUse = ['startSymbol', 'endSymbol'].reduce(function (_ref8, symbolName) {
        var _ref8$showLabelOn = _ref8.showLabelOn,
            showLabelOn = _ref8$showLabelOn === void 0 ? false : _ref8$showLabelOn,
            props = _objectWithoutProperties(_ref8, ["showLabelOn"]);

        var _props$symbolName = props[symbolName],
            label = _props$symbolName.label,
            _props$symbolName$typ = _props$symbolName.type,
            type = _props$symbolName$typ === void 0 ? _dictionary.SYMBOL_TYPE.MARKER : _props$symbolName$typ,
            symbolProps = _objectWithoutProperties(_props$symbolName, ["label", "type"]);

        var _ref9 = 'string' === typeof label ? {
          content: label
        } : label || {},
            _ref9$content = _ref9.content,
            content = _ref9$content === void 0 ? '' : _ref9$content,
            _ref9$className = _ref9.className,
            className = _ref9$className === void 0 ? '' : _ref9$className;

        return _dictionary.SYMBOL_TYPE.SPOT !== type ? _objectSpread({
          showLabelOn: showLabelOn
        }, props) : _objectSpread(_objectSpread({
          showLabelOn: showLabelOn
        }, props), {}, _defineProperty({}, symbolName, _objectSpread(_objectSpread({
          type: type
        }, symbolProps || {}), !label || !showLabelOn ? {} : {
          label: 'TracksEnd' === showLabelOn ? content : {
            content: content,
            className: className
          }
        })));
      }, propsToUse);
      var showOngoing = propsToUse.showOngoing && endIdx !== grp.length - 1;
      var route = (0, _lodash["default"])(grp).slice(startIdx, endIdx + 1).filter(function (_ref10) {
        var id = _ref10.id;
        return propsToUse.showInvisible || _this2._visible[id];
      }).value();

      var latlngs = _lodash["default"].map(route, 'latlng');
      /*
        The extra point's location depends on the GisInterval
        In other words, this works if used with time-related functionality if
        you'd like to see the track animation
      */


      if (showOngoing && _lodash["default"].isArray(interval) && interval.length === 2) {
        var currLast = _lodash["default"].last(route);

        var next = grp[endIdx + 1];
        var offset = [next.latlng[0] - currLast.latlng[0], next.latlng[1] - currLast.latlng[1]];
        var timeDiff = next.ts - currLast.ts;
        var ratio = (interval[1] - currLast.ts) / timeDiff;
        var currPosition = [currLast.latlng[0] + offset[0] * ratio, currLast.latlng[1] + offset[1] * ratio];
        latlngs.push(currPosition);
      }

      var track = new _polyline["default"](key, _objectSpread(_objectSpread({
        latlng: latlngs
      }, propsToUse), {}, {
        route: route
      }), isSelected, selectedPropsToUse);
      track._type = _dictionary.EXTRA_SYMBOL_TYPE.TRACK;
      track._origType = _dictionary.SYMBOL_TYPE.POLYLINE;
      _this2._symbols[key] = track;
      _this2._visible[key] = true;
      tracks.push(key);
      var hasOngoingNode = showOngoing && !_lodash["default"].isEqual(_lodash["default"].last(latlngs), _lodash["default"].get(_lodash["default"].last(route), 'props.latlng'));
      var Point = _lodash["default"].get(propsToUse, 'endSymbol.type') === _dictionary.SYMBOL_TYPE.SPOT ? _spot["default"] : _marker["default"];

      var ongoingNodeId = _lodash["default"].get(propsToUse, 'endSymbol.id', "".concat(key, "_").concat(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(1, 6)));

      var ongoingNode = new Point( // Math.random().toString(36).replace(/[^a-z]+/g, '').substr(1, 6),
      ongoingNodeId, _objectSpread({
        latlng: _lodash["default"].last(latlngs),
        data: {
          track: key
        }
      }, _lodash["default"].get(propsToUse, 'endSymbol')), _this2._flags[ongoingNodeId] && _this2._flags[ongoingNodeId].selected, _lodash["default"].get(propsToUse, 'endSymbol.selectedProps', {}));
      delete _this2._flags[ongoingNodeId];

      var start = _this2._symbols[_lodash["default"].get(_lodash["default"].head(route), 'id')];

      var end = hasOngoingNode ? ongoingNode : _this2._symbols[_lodash["default"].get(_lodash["default"].last(route), 'id')];

      if (_this2._layout === _dictionary.LAYOUT.TRACK) {
        _this2._map.addLayer(track.layer);

        var hasFlag = _lodash["default"].get(propsToUse, 'startSymbol') || _lodash["default"].get(propsToUse, 'endSymbol');

        if (hasFlag) {
          if (hasOngoingNode && (_this2._symbols[end.id] || _this2._flags[end.id])) {
            log.warn(_gisException.GIS_ERROR.INVALID_ID, end.id, "ongoing node ".concat(end.id, " which Id duplicates with a symbol or track, please rename it"));
            end = _this2._symbols[_lodash["default"].get(_lodash["default"].last(route), 'id')];
          }

          var startObj = {
            id: start.id,
            type: start.type,
            props: start.props,
            selectedProps: start.selectedProps,
            selected: start.selected
          };
          var endObj = {
            id: end.id,
            type: end.type,
            props: end.props,
            selectedProps: end.selectedProps,
            selected: end.selected
          };
          var startPropCfg = (0, _mergeHelper.mergeProps)(startObj, [start._origProps, _lodash["default"].get(propsToUse, 'startSymbol', {})]);
          var startSltPropCfg = (0, _mergeHelper.mergeProps)(startObj, [start._origSelectedProps, _lodash["default"].get(propsToUse, 'startSymbol.selectedProps', {})]);
          var endPropCfg = (0, _mergeHelper.mergeProps)(endObj, [end._origProps, _lodash["default"].get(propsToUse, 'endSymbol', {})]);
          var endSltPropCfg = (0, _mergeHelper.mergeProps)(endObj, [end._origSelectedProps, _lodash["default"].get(propsToUse, 'endSymbol.selectedProps', {})]);

          if (!_lodash["default"].isEmpty(startPropCfg) || !_lodash["default"].isEmpty(startSltPropCfg)) {
            start.set(startPropCfg, start.selected, startSltPropCfg);
          }

          if (!_lodash["default"].isEmpty(endPropCfg) || !_lodash["default"].isEmpty(endSltPropCfg)) {
            end.set(endPropCfg, end.selected, endSltPropCfg);
          }

          if (end === ongoingNode) {
            _this2._flags[ongoingNodeId] = end;
          }
        }
      }

      ongoingNode._props.isOngoingNode = true;

      if (isStandard || propsToUse.internalSymbols === true) {
        _lodash["default"].forEach(route, function (_ref11) {
          var id = _ref11.id;
          _this2._visible[id] && !_this2._map.hasLayer(_this2._symbols[id]) && _this2._map.addLayer(_this2._symbols[id].layer);
        });
      } else if (isTrack) {
        _lodash["default"].forEach(route, function (_ref12) {
          var id = _ref12.id;

          if (id === start.id || id === end.id) {
            _this2._visible[id] && !_this2._map.hasLayer(_this2._symbols[id]) && _this2._map.addLayer(_this2._symbols[id].layer);
          } else if (_lodash["default"].get(propsToUse, 'internalSymbols.enabled', true) === true) {
            _this2._visible[id] && !_this2._map.hasLayer(_this2._symbols[id]) && _this2._map.addLayer(_this2._symbols[id].layer);

            if (id !== start.id || id !== end.id) {
              var internalProps = _lodash["default"].get(propsToUse, 'internalSymbols.props', {});

              var internalSltProps = _lodash["default"].get(propsToUse, 'internalSymbols.selectedProps', {});

              var origProps = _lodash["default"].cloneDeep(_this2._symbols[id]._origProps);

              var origSelectedProps = _lodash["default"].cloneDeep(_this2._symbols[id]._origSelectedProps);

              var internal = _lodash["default"].merge({}, origProps, internalProps);

              var selectedInternal = _lodash["default"].merge({}, origSelectedProps, internalSltProps);

              _this2._symbols[id].set(internal, _this2._symbols[id].selected, selectedInternal);
            }
          } // If internalSymbols is false, hide all internal symbols
          else if (propsToUse.internalSymbols === false) {
              _this2._map.hasLayer(_this2._symbols[id]) && _this2._map.removeLayer(_this2._symbols[id].layer);
            }
        });
      } // Add the extra point to the end


      if (_this2._layout === _dictionary.LAYOUT.TRACK && hasOngoingNode && _this2._flags[ongoingNodeId]) {
        ongoingNode.layer.addTo(_this2._flagGroup);
      }
    }
  });

  this._tracks = tracks;
}
/**
 * Render contour.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#contour-options
 *
 * @param {Object} [opts]                                                               Contour options. If undefined, apply the original options. For more info, see the link above.
 * @param {String | String[] | Object | Function | undefined | null} [filter=undefined] Filter to convert matched symbols to contour. If it's a String or String[], converts symbols by ids; if it's a Object, converts symbols by all the attributes in symbols; if it's a Function, converts symbols by the given callback(Symbol symbol, String id, Object gis._symbols)
 *
 */


function renderContour(opts) {
  var _this3 = this;

  var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

  if (this._contour && this._map.hasLayer(this._contour)) {
    this._map.removeLayer(this._contour);
  }
  /* Only visible markers can be transferred to contours */


  var markers = (0, _lodash["default"])(_symbolHelper.getSymbol.call(this, filter)).filter(function (el) {
    return _lodash["default"].includes([_dictionary.SYMBOL_TYPE.MARKER, _dictionary.SYMBOL_TYPE.SPOT], el.type) && _this3._visible[el.id];
  }).map(function (_ref13) {
    var props = _ref13.props;
    return {
      lat: props.latlng[0],
      lng: props.latlng[1]
    };
  }).value();

  var options = _objectSpread(_objectSpread({}, this._contourOptions), opts);

  var boundSW = options.boundSW,
      boundNE = options.boundNE; // TODO: how to handle the oversize?

  /* size = [width, height] */

  var size = [(0, _gisHelper.convertLatlngToMeters)([boundSW.lat, boundSW.lng], [boundSW.lat, boundNE.lng]) / FACTOR, (0, _gisHelper.convertLatlngToMeters)([boundSW.lat, boundSW.lng], [boundNE.lat, boundSW.lng]) / FACTOR];
  var result = (0, _d3Contour.contourDensity)().x(function (d) {
    return (0, _gisHelper.convertLatlngToMeters)([boundSW.lat, d.lng], [d.lat, d.lng]) / FACTOR;
  }).y(function (d) {
    return (0, _gisHelper.convertLatlngToMeters)([d.lat, boundSW.lng], [d.lat, d.lng]) / FACTOR;
  }).thresholds(options.thresholds) // default is 20?
  .cellSize(options.cellSize) // default is 4
  .bandwidth(options.bandwidth) // default is 20.4939...
  .size(size)(markers);
  var min = result.length ? result[0].value : Infinity;
  var max = result.length ? _lodash["default"].last(result).value : 0;

  var flattened = _lodash["default"].reduce(result, function (acc, item) {
    var color = _lodash["default"].find(options.colors, function (el, key) {
      return (item.value - min) / (max - min) <= _lodash["default"].toNumber(key);
    }) || _style.DEFAULT_CONTOUR_STYLE.colors['0.00'];

    return [].concat(_toConsumableArray(acc), _toConsumableArray(_lodash["default"].map(item.coordinates, function (c) {
      return {
        color: color,
        coords: c[0]
      };
    })));
  }, []);

  var contour = _leaflet["default"].layerGroup([]);

  _lodash["default"].forEach(flattened, function (_ref14) {
    var color = _ref14.color,
        f = _ref14.coords;

    var latlngs = _lodash["default"].map(f, function (coords) {
      return (0, _gisHelper.convertMetersToLatLng)([boundSW.lat, boundSW.lng], coords[0] * FACTOR, coords[1] * FACTOR);
    });

    var polyline = _leaflet["default"].polyline(latlngs, {
      color: color,
      fill: false,
      weight: 2,
      interactive: false
    });

    contour.addLayer(polyline);
  });

  if (this._layout === _dictionary.LAYOUT.CONTOUR) {
    this._map.addLayer(contour);
  }

  this._contour = contour;
}
/**
 * Render leaflet pane.
 *
 * @param {String | String[]} pane  The names of map panes to create.
 *
 */


function renderPane(pane) {
  var map = this._map;

  if (_lodash["default"].isString(pane)) {
    map.createPane(pane);
  } else if ((0, _dataHelper.isValidArgType)(pane, [['string']])) {
    _lodash["default"].forEach(pane, function (el) {
      map.createPane(el);
    });
  }
}
/**
 * Render overlays.
 *
 * @param {String | Object | Object[]} overlay                      Overlay image url or options.
 * @param {String}                     [overlay.id]                 Overlay id. If undefined, a random id will be generated.
 * @param {String}                     overlay.url                  Overlay image url.
 * @param {Object}                     [overlay.size]               The size of the overlay. Default is the image's natural size.
 * @param {Number}                     overlay.size.width           The x units of the overlay.
 * @param {Number}                     overlay.size.height          The y units of the overlay.
 * @param {Object}                     [overlay.xy]                 The position of the overlay. Default is the bottom-left of the map.
 * @param {Number}                     overlay.xy.x                 The start x coordinate of the overlay.
 * @param {Number}                     overlay.xy.y                 The start y coordinate of the overlay.
 * @param {Number}                     [overlay.opacity=1.0]        Overlay opacity.
 * @param {Boolean}                    [resetMaxBounds=false]       Reset the map max bounds after setting the overlay.
 * @param {Boolean}                    [resetZoom=false]            Reset the map zoom level after setting the overlay.
 *
 */


function renderOverlay(overlay) {
  var _this4 = this;

  var resetMaxBounds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var resetZoom = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var map = this._map;
  var mapZoom = map.getZoom();
  var maxBounds = map.getBounds();
  var overlays = _lodash["default"].isString(overlay) ? [{
    url: overlay
  }] : _lodash["default"].isPlainObject(overlay) ? [overlay] : overlay;

  _lodash["default"].forEach(overlays, function (ol) {
    if (!ol.url) {
      return;
    } // If overlay is a url string, set the overlay Id as random Id


    var id = ol.id || Math.random().toString(36).replace(/[^a-z]+/g, '').substr(1, 6);

    var layer = _leaflet["default"].imageOverlay(ol.url, [[0, 0], [0, 0]]).addTo(map);

    var xy = _lodash["default"].get(ol, 'xy', {
      x: maxBounds._southWest.lng,
      y: maxBounds._southWest.lat
    });

    var size = ol.size; // Set the size as natural size if not specified

    if (!size) {
      var image = new Image();
      image.src = ol.url;
      image.addEventListener('load', function () {
        size = {
          width: image.naturalWidth,
          height: image.naturalHeight
        };

        var bounds = _leaflet["default"].latLngBounds(_leaflet["default"].latLng(xy.y, xy.x), _leaflet["default"].latLng(xy.y + size.height, xy.x + size.width));

        layer.setBounds(bounds);
        _this4._overlays[id] = {
          url: ol.url,
          zoom: ol.zoom || null,
          opacity: !_lodash["default"].isNil(ol.opacity) ? ol.opacity : 1,
          id: id,
          xy: xy,
          size: size,
          layer: layer
        };
      });
    } else {
      var bounds = _leaflet["default"].latLngBounds(_leaflet["default"].latLng(xy.y, xy.x), _leaflet["default"].latLng(xy.y + size.height, xy.x + size.width));

      layer.setBounds(bounds);
      _this4._overlays[id] = {
        url: ol.url,
        zoom: ol.zoom || null,
        opacity: !_lodash["default"].isNil(ol.opacity) ? ol.opacity : 1,
        id: id,
        xy: xy,
        size: size,
        layer: layer
      };
    }

    !_lodash["default"].isNil(ol.opacity) && layer.setOpacity(ol.opacity);

    if (!_lodash["default"].isNil(ol.zoom) && ol.zoom > mapZoom && map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });

  resetMaxBounds && _resetMapBounds.call(this, resetZoom);
}
/**
 * Re-renders the cluster nodes according to selected status.
 *
 */


function renderSelectedCluster() {
  var _this5 = this;

  if (this._layout !== _dictionary.LAYOUT.STANDARD || _lodash["default"].isEmpty(this._gCluster) && _lodash["default"].isEmpty(this._clusters)) {
    return;
  }

  _lodash["default"].forEach(this._clusterSymbols, function (parent) {
    // For performance, filter visible clusters
    var isVisibleParent = _this5._map.hasLayer(parent.layer);

    if (isVisibleParent) {
      // Change parents' selected status according to their chilldren selected status
      var allChildren = parent.layer.getAllChildMarkers();

      var isSelected = _lodash["default"].some(allChildren, function (lyr) {
        return _this5._selected[lyr._gis_id];
      });

      parent.setSelected(isSelected);
    }
  });
}
/**
 * Creates cluster layer group.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#cluster-options
 *
 * @param {String} id           The cluster id.
 * @param {object} [options={}] The cluster options. For more info, see the link above.
 *
 */


function renderCluster(id) {
  var _this6 = this;

  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var map = this._map;

  var clusterLayer = _lodash["default"].get(this._clusters, "".concat(id, ".layer"));

  var globalCluster = _lodash["default"].get(this._gCluster, 'layer'); // If id is a Boolean, handle it as global cluster


  var isGlobalCluster = id === true;

  var clusterOpt = _objectSpread({
    chunkedLoading: true,
    showCoverageOnHover: false,
    animate: true
  }, _lodash["default"].omit(options.props, 'symbol')); // markers or spots


  var layers = [];
  var cluster = {}; // Remove the original cluster layer. This is for reset

  if (clusterLayer) {
    layers = clusterLayer.getLayers();
    map.hasLayer(clusterLayer) && map.removeLayer(clusterLayer);
    delete this._clusters[id];
  } else if (isGlobalCluster && globalCluster) {
    layers = globalCluster.getLayers();
    map.hasLayer(globalCluster) && map.removeLayer(globalCluster);
    delete this._gCluster;
  }

  cluster = {
    id: id,
    layer: _leaflet["default"].markerClusterGroup(_objectSpread(_objectSpread({}, clusterOpt), {}, {
      iconCreateFunction: function iconCreateFunction(clusterLyr) {
        return _createClusterIcon.call(_this6, id, options, clusterLyr);
      }
    })),
    props: options.props
  }; // Re-render the selected clusters' parents and children

  cluster.layer.on('animationend', renderSelectedCluster.bind(this));

  if (layers.length) {
    cluster.layer.addLayers(layers);
  } // Only works in standard mode


  if (this._layout === _dictionary.LAYOUT.STANDARD) {
    map.addLayer(cluster.layer);
  } // Save the cluster as global cluster or not


  if (isGlobalCluster) {
    this._gCluster = cluster;
  } else {
    this._clusters[id] = cluster;
  }
}
/**
 * Creates layer group.
 *
 * @param {String} id   The group id.
 *
 */


function renderGroup(id) {
  var map = this._map;

  var group = _lodash["default"].get(this._groups, "".concat(id, ".layer"));

  var children = _lodash["default"].get(this._groups, "".concat(id, ".children"), []);

  var layers = []; // Remove the original group for reset if necessary

  if (group) {
    layers = group.getLayers();
    map.hasLayer(group) && map.removeLayer(group);
    delete this._groups[id];
  }

  var layerGroup = _leaflet["default"].layerGroup([]);

  this._groups[id] = {
    id: id,
    children: children,
    layer: layerGroup
  };

  if (layers.length) {
    _lodash["default"].forEach(layers, function (lyr) {
      layerGroup.addLayer(lyr);
    });
  } // Group is only visible in standard/track


  if (this._layout === _dictionary.LAYOUT.STANDARD || this._layout === _dictionary.LAYOUT.TRACK) {
    map.addLayer(this._groups[id].layer);
  }
}

var _default = {
  renderHeatmap: renderHeatmap,
  renderTrack: renderTrack,
  renderContour: renderContour,
  renderPane: renderPane,
  renderOverlay: renderOverlay,
  renderSelectedCluster: renderSelectedCluster,
  renderCluster: renderCluster,
  renderGroup: renderGroup
};
exports["default"] = _default;
//# sourceMappingURL=render-helper.js.map