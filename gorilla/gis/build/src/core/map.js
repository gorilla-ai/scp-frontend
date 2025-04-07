"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._setLayout = _setLayout;
exports._setRegionType = _setRegionType;
exports._setDrawType = _setDrawType;
exports._setDragMode = _setDragMode;
exports._setMaxBounds = _setMaxBounds;
exports._setGisInterval = _setGisInterval;
exports._zoomToFit = _zoomToFit;
exports._clear = _clear;
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _leaflet = _interopRequireDefault(require("leaflet"));

var _gisException = require("../utils/gis-exception");

var _dataHelper = _interopRequireDefault(require("../utils/data-helper"));

var _renderHelper = _interopRequireDefault(require("../utils/render-helper"));

var _symbolHelper = _interopRequireDefault(require("../utils/symbol-helper"));

var _dictionary = require("../consts/dictionary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var log = require('loglevel').getLogger('gis/core/map');
/**
 * Changes map's layout.
 * It will remove all layer on the map first, and add back according to new setting.
 *
 * In branch 'develop_mix-layer', add a parameter 'filter' which can change part of the symbols to target layout.
 * Moreover, the behavior in this function also changes. All the layer out will repaint instead of adding the layer back.
 *
 * @param   {String}  layout    Map's layout, which can be standard, heatmap, track, or contour.
 *
 */


function _setLayout(layout) {
  var _this = this;

  var map = this._map;
  var symbols = this._symbols;
  var visible = this._visible;
  var currLayout = this._layout;
  var heatmap = this._heatmap; // heatmap is a leaflet Layer
  // let tracks = this._tracks   // tracks is an array of tracks' Ids

  var contour = this._contour; // contour is a L.LayerGroup instance
  // Check if the layout is valid

  var isValidLayout = _lodash["default"].includes(_dictionary.LAYOUT, layout);

  if (isValidLayout && layout !== currLayout) {
    // Clear current layout
    if (currLayout === _dictionary.LAYOUT.STANDARD || currLayout === _dictionary.LAYOUT.TRACK) {
      _lodash["default"].forEach(symbols, function (_ref) {
        var id = _ref.id,
            layer = _ref.layer;
        visible[id] && map.removeLayer(layer);
      });

      _lodash["default"].forEach(this._groups, function (el) {
        map.removeLayer(el.layer);
      });

      if (currLayout === _dictionary.LAYOUT.STANDARD) {
        _lodash["default"].forEach(this._clusters, function (el) {
          map.removeLayer(el.layer);
        });

        if (this._gCluster) {
          map.removeLayer(this._gCluster.layer);
        }
      } else {
        this._flagGroup.clearLayers();
      }
    } else if (currLayout === _dictionary.LAYOUT.HEATMAP && heatmap) {
      map.removeLayer(heatmap);
    } else if (currLayout === _dictionary.LAYOUT.CONTOUR && contour) {
      map.removeLayer(contour);
    } // Set new layout


    this._layout = layout;

    if (layout === _dictionary.LAYOUT.STANDARD) {
      // Cluster only works in standard mode
      if (this._gCluster) {
        map.addLayer(this._gCluster.layer);
      }

      _lodash["default"].forEach(this._clusters, function (el) {
        map.addLayer(el.layer);
      });

      _lodash["default"].forEach(this._groups, function (el) {
        map.addLayer(el.layer);
      });

      _lodash["default"].forEach(symbols, function (symbol) {
        var id = symbol.id,
            props = symbol.props,
            selectedProps = symbol.selectedProps,
            layer = symbol.layer,
            type = symbol.type,
            _origProps = symbol._origProps,
            _origSelectedProps = symbol._origSelectedProps;
        var cluster = props.cluster;
        var isPoint = type === _dictionary.SYMBOL_TYPE.MARKER || type === _dictionary.SYMBOL_TYPE.SPOT;
        var isClustered = isPoint && cluster && visible[id];
        var isSimpleType = type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK;
        var isFlagMode = isPoint && (!_lodash["default"].isEqual(props, _origProps) || !_lodash["default"].isEqual(selectedProps, _origSelectedProps));

        if (isFlagMode) {
          symbol.set(_origProps, symbol.selected, _origSelectedProps);
        }

        if (isClustered && cluster === true) {
          !_this._gCluster.layer.hasLayer(layer) && _this._gCluster.layer.addLayer(layer);
        } else if (isClustered) {
          !_this._clusters[cluster].layer.hasLayer(layer) && _this._clusters[cluster].layer.addLayer(layer);
        } else if (visible[id] && isSimpleType) {
          !map.hasLayer(layer) && map.addLayer(layer);
        }
      });

      _symbolHelper["default"].updateClusterSymbol.call(this);
    } else if (layout === _dictionary.LAYOUT.HEATMAP) {
      if (!heatmap) {
        _renderHelper["default"].renderHeatmap.call(this);

        heatmap = this._heatmap;
      } else {
        heatmap.addTo(map);
      }
    } else if (layout === _dictionary.LAYOUT.TRACK) {
      // (!tracks || (tracks && tracks.length === 0)) && rh.renderTrack.call(this)
      // _.forEach(symbols, ({id, type, props:{track}, layer}) => {
      //     const isOnTrack = visible[id] && track
      //     const isTrack = visible[id] && type === EXTRA_SYMBOL_TYPE.TRACK
      //     if (isOnTrack || isTrack) {
      //         !map.hasLayer(layer) && map.addLayer(layer)
      //     }
      // })
      _renderHelper["default"].renderTrack.call(this);
    } else if (layout === _dictionary.LAYOUT.CONTOUR) {
      if (!contour) {
        _renderHelper["default"].renderContour.call(this);

        contour = this._contour;
      } else {
        contour.addTo(map);
      }
    }
  } else if (!isValidLayout) {
    log.warn(_gisException.GIS_ERROR.INVALID_TYPE, layout, "Please set a valid layout type: ".concat(_lodash["default"].values(_dictionary.LAYOUT)));
  }
}
/**
 * Sets the region selection type, which can be circle or rectangle.
 *
 * @see     setRegionType in GIS document.
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#methods
 *
 * @param   {String}  regionType    Region-selection type, which can be circle or rectangle.
 */


function _setRegionType(regionType) {
  this._map.circleSelector.disable();

  this._map.rectangleSelector.disable();

  var isValidType = !!_dictionary.REGION_TYPE[_lodash["default"].toUpper(regionType)];

  if (isValidType) {
    this._regionType = regionType;

    if (this._dragMode === _dictionary.DRAG_MODE.REGION) {
      this._map["".concat(regionType, "Selector")].enable();
    }
  } else {
    log.warn(_gisException.GIS_ERROR.INVALID_TYPE, regionType, "Please set a valid region type: ".concat(_lodash["default"].values(_dictionary.REGION_TYPE)));
  }
}
/**
 * Sets the draw type and draw config.
 *
 * @see     setDrawType in GIS document.
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#methods
 *
 * @param   {String}  drawType      Map drag mode, it can be pan, region, measure, or draw.
 * @param   {Object} [drawConfig]   Draw configs. It contains key "editableIds", which makes symbols editable (all symbols are editable by default). See setDrawType() in GIS document.
 */


function _setDrawType(drawType) {
  var _this2 = this;

  var drawConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var isValidType = _lodash["default"].includes(_dictionary.DRAW_TYPE, drawType);

  var editableIds = _lodash["default"].map(_symbolHelper["default"].getSymbol.call(this, _lodash["default"].get(drawConfig, 'editableIds')), 'id');

  var shouldAddToDrawn = function shouldAddToDrawn(symbol) {
    return symbol && symbol.type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK && symbol.type !== _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER && symbol.type !== _dictionary.SYMBOL_TYPE.GEOJSON;
  };

  if (editableIds) {
    if (_lodash["default"].isArray(editableIds)) {
      this._editableIds = _lodash["default"].reduce(editableIds, function (acc, el) {
        if (shouldAddToDrawn(_this2._symbols[el])) {
          acc[el] = true;
        }

        return acc;
      }, {});
    } else if (_lodash["default"].isString(editableIds)) {
      if (shouldAddToDrawn(this._symbols[editableIds])) {
        this._editableIds = _defineProperty({}, editableIds, true);
      }
    }
  } else {
    this._editableIds = _lodash["default"].reduce(this._symbols, function (acc, el) {
      if (shouldAddToDrawn(_this2._symbols[el])) {
        acc[el.id] = true;
      }

      return acc;
    }, {});
  }

  if (isValidType) {
    var shouldEnanble = this._dragMode === _dictionary.DRAG_MODE.DRAW && (this._layout === _dictionary.LAYOUT.STANDARD || this._layout === _dictionary.LAYOUT.TRACK);
    this._drawType = drawType;

    if (shouldEnanble && !this._map.drawMode.enabled()) {
      this._map.drawMode.enable();
    } else if (shouldEnanble && this._map.drawMode.enabled()) {
      this._map.drawMode.setDrawType(drawType);
    }
  } else {
    log.warn(_gisException.GIS_ERROR.INVALID_TYPE, drawType, "Please set a valid draw type: ".concat(_lodash["default"].values(_dictionary.DRAW_TYPE)));
  }
}
/**
 * Sets the drag mode.
 *
 * @see     _setRegionType above
 * @see     _setDrawType above
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#methods
 *
 * @param   {String}  dragMode      Map drag mode, it can be pan, region, measure, or draw.
 * @param   {String}  featureType   For region and draw. Decides what handler to use, .e.g, circle or rectangle selection.
 * @param   {Object} [drawConfig]   Draw configs. See setDrawType() in GIS document.
 */


function _setDragMode(dragMode, featureType) {
  var drawConfig = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var isValidMode = _lodash["default"].includes(_dictionary.DRAG_MODE, dragMode);

  if (isValidMode) {
    this._dragMode = dragMode;
  } else {
    log.warn(_gisException.GIS_ERROR.INVALID_TYPE, dragMode, "Please set a valid drag mode: ".concat(_lodash["default"].values(_dictionary.DRAG_MODE)));
    return;
  }

  if (dragMode === _dictionary.DRAG_MODE.REGION) {
    _setRegionType.call(this, featureType || this._regionType || _dictionary.REGION_TYPE.RECTANGLE);
  } else if (dragMode === _dictionary.DRAG_MODE.DRAW) {
    _setDrawType.call(this, featureType || this._drawType || _dictionary.DRAW_TYPE.MARKER, drawConfig);
  } else {
    if (dragMode === _dictionary.DRAG_MODE.PAN) {
      this._map.dragging.enable();

      this._map.measureMode.disable();

      this._map.drawMode.disable();
    } else if (dragMode === _dictionary.DRAG_MODE.MEASURE) {
      this._map.measureMode.enable();
    }

    this._map.circleSelector.disable();

    this._map.rectangleSelector.disable();
  }
}
/**
 * Sets the max-bound of map.
 * The corner coordinates depend on the map CRS, i.e., set the corner according to current CRS.
 *
 * @param   {Object}  corner1               The south-west point of the map, formatter as {lat, lng}.
 * @param   {Object}  corner2               The north-east point of the map, formatter as {lat, lng}.
 * @param   {Boolean} [fitBounds=false]     Reset the map view to fit the max bounds or not.
 */


function _setMaxBounds(corner1, corner2) {
  var fitBounds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var map = this._map;
  var crs = map.options.crs;
  var isEPSG3857 = crs === _leaflet["default"].CRS.EPSG3857;
  var project = isEPSG3857 ? map.latLngToLayerPoint.bind(map) : crs.projection.project.bind(crs.projection); // const unproject = isEPSG3857
  //                 ? map.layerPointToLatLng.bind(map)
  //                 : crs.projection.unproject.bind(crs.projection)

  var isValid = _dataHelper["default"].isValidArgType(corner1, 'plainObject') && _lodash["default"].isNumber(corner1.lat) && _lodash["default"].isNumber(corner1.lng) && _dataHelper["default"].isValidArgType(corner2, 'plainObject') && _lodash["default"].isNumber(corner2.lat) && _lodash["default"].isNumber(corner2.lng);

  if (isValid) {
    var c1 = _lodash["default"].pick(corner1, ['lat', 'lng']);

    var c2 = _lodash["default"].pick(corner2, ['lat', 'lng']);

    var c1LatLng = _leaflet["default"].latLng(c1);

    var c2LatLng = _leaflet["default"].latLng(c2);

    var p1 = project(c1LatLng);
    var p2 = project(c2LatLng);
    var bounds = crs === _leaflet["default"].CRS.Simple ? [[p1.y, p1.x], [p2.y, p2.x]] : _leaflet["default"].latLngBounds(c1LatLng, c2LatLng);
    map.setMaxBounds(bounds);

    if (fitBounds) {
      map.fitBounds(bounds);
      var mapZoom = map.getZoom();

      _lodash["default"].forEach(this._overlays, function (_ref2) {
        var layer = _ref2.layer,
            zoom = _ref2.zoom;

        if (_lodash["default"].isNumber(zoom) && zoom > mapZoom && map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
    }
  } else {
    log.warn(_gisException.GIS_ERROR.INVALID_ARGS, {
      corner1: corner1,
      corner2: corner2
    }, 'Please input valid arguments (corner1={lat=Number, lng=Number}, corner2={lat=Number, lng=Number})');
  }
}
/**
 * Sets the GIS interval.
 *
 * @param   {Number}  term     The GIS interval, formatted as [start timestamp, end timestamp]
 */


function _setGisInterval(term) {
  var isValid = _lodash["default"].isArray(term) && term.length === 0 || _dataHelper["default"].isValidArgType(term, [['number']]) && term.length === 2 && term[0] <= term[1];

  if (isValid) {
    this._interval = term;
  } else {
    log.warn(_gisException.GIS_ERROR.INVALID_ARGS, term, 'Please input valid interval: [Int start, Int end], or []');
    this._interval = this._interval;
  }
}
/**
 * Moves and zooms the map view to the region of symbols matching the filter.
 * If no symbol matches, won't move the map view.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of symbols within the view. If it's a String or String[], finds symbols by ids; if it's a Object, searches symbols by all the props; if it's a Function, gets symbols by the given callback(Symbol symbol, String id, Object gis._symbols)
 */


function _zoomToFit(filter) {
  var _this3 = this;

  var map = this._map; // Only zoom to the symbols whch exist on the map or visible cluster

  var fitSymbols = _lodash["default"].filter(_symbolHelper["default"].getSymbol.call(this, filter), function (_ref3) {
    var id = _ref3.id,
        layer = _ref3.layer,
        props = _ref3.props;

    // Heatmap & contour has no symbol layer on map, so filter by visible
    if (_this3._layout === _dictionary.LAYOUT.HEATMAP || _this3._layout === _dictionary.LAYOUT.CONTOUR) {
      return _this3._visible[id];
    }

    var cluster = props.cluster;
    var clusterLayer = cluster === true ? _lodash["default"].get(_this3._gCluster, 'layer') : _lodash["default"].get(_this3._clusters, "".concat(cluster, ".layer"));
    return map.hasLayer(layer) || clusterLayer && map.hasLayer(clusterLayer);
  });

  if (!fitSymbols.length) {
    return;
  } // When only a non-marker symbol is selected, pan to fit the symbol's bound


  var centerOfSymbols = _lodash["default"].map(fitSymbols, function (symbol) {
    // Polyline need to handle because pattern in directed polyline has no getLatLng()
    var isLine = symbol.type === _dictionary.SYMBOL_TYPE.POLYLINE || symbol.type === _dictionary.EXTRA_SYMBOL_TYPE.TRACK;
    var isPoint = symbol.type === _dictionary.SYMBOL_TYPE.MARKER || symbol.type === _dictionary.SYMBOL_TYPE.SPOT;
    var isCircle = symbol.type === _dictionary.SYMBOL_TYPE.CIRCLE;

    if (isLine) {
      if (symbol.layer instanceof _leaflet["default"].Polyline) {
        return symbol.layer.getBounds();
      } else {
        var featureGroup = _leaflet["default"].featureGroup([]);

        symbol.layer.eachLayer(function (lyr) {
          lyr instanceof _leaflet["default"].Polyline && featureGroup.addLayer(lyr);
        });
        return featureGroup.getBounds();
      }
    } else if (isCircle) {
      return symbol.layer._latlng;
    } else if (!isPoint) {
      return symbol.layer.getBounds();
    } else {
      return symbol.layer.getLatLng();
    }
  });

  map.fitBounds(centerOfSymbols);
}
/**
 * Clear all symbols, clusters, tracks, groups, heatmap, and contour from the map.
 *
 */


function _clear() {
  var _this4 = this;

  // Remove all symbols/tarcks & heatmap from the map
  if (this._gCluster) {
    this._gCluster.layer.clearLayers();

    this._map.removeLayer(this._gCluster.layer);
  }

  _lodash["default"].forEach(this._clusters, function (cluster) {
    cluster.layer.clearLayers();

    _this4._map.removeLayer(cluster.layer);
  });

  _lodash["default"].forEach(this._symbols, function (symbol) {
    _this4._map.removeLayer(symbol.layer);
  });

  _lodash["default"].forEach(this._groups, function (group) {
    _this4._map.removeLayer(group.layer);
  }); // Instead of removing heatmap/track/contour layer, remove the data


  !!this._heatmap && this._heatmap.setData({
    data: []
  });
  !!this._contour && this._contour.clearLayers();
  !!this._tracks && _lodash["default"].forEach(this._tracks, function (id) {
    _this4._map.hasLayer(_this4._symbols[id].layer) && _this4._map.removeLayer(_this4._symbols[id].layer);
  });

  this._flagGroup.clearLayers();

  this._symbols = {};
  this._clusterSymbols = {};
  this._groups = {};
  this._visible = {}; // Fix issue #25

  this._selected = {};
  this._clusters = {};
  this._tracks = [];
  this._flags = {};
  delete this._gCluster;
}

var _default = {
  _setLayout: _setLayout,
  _setDragMode: _setDragMode,
  _setDrawType: _setDrawType,
  _setRegionType: _setRegionType,
  _setMaxBounds: _setMaxBounds,
  _setGisInterval: _setGisInterval,
  _zoomToFit: _zoomToFit,
  _clear: _clear
};
exports["default"] = _default;
//# sourceMappingURL=map.js.map