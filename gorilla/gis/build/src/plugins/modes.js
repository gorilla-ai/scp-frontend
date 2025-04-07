"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCircleHandler = createCircleHandler;
exports.createRectangleHandler = createRectangleHandler;
exports.createMeasureHandler = createMeasureHandler;
exports.createDrawHandler = createDrawHandler;
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _style = require("../consts/style");

var _dictionary = require("../consts/dictionary");

var _gisHelper = _interopRequireDefault(require("../utils/gis-helper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Creates circle-region selection handler.
 * The handler is extend from L.Draw.Circle (see leaflet.draw plugin)
 * For futher study, see node-modules/leaflet.draw/dist/leaflet.draw-src.js or the link.
 *
 * @link    https://github.com/Leaflet/Leaflet.draw/blob/develop/src/draw/handler/Draw.Circle.js
 *
 * @param {Leaflet} L           Leaflet module
 *
 * @return {Leaflet handler}    The circle selection handler, which select a circle region on map.
 */
function createCircleHandler(L) {
  var that = this; // Extend L.Draw.Circle as circle selector

  return L.Draw.Circle.extend({
    options: {
      shapeOptions: _style.DEFAULT_REGION_STYLE,
      showRadius: false,
      metric: true // Whether to use the metric measurement system or imperial

    },
    // Called when the handler is enabled
    addHooks: function addHooks() {
      L.Draw.Feature.prototype.addHooks.call(this);

      if (this._map) {
        this._map.on('mousedown', this._onMouseDown, this).on('mousemove', this._onMouseMove, this).on('mouseup', this._onMouseUp, this).dragging.disable();

        this._map.rectangleSelector.disable();

        this._map.measureMode.disable();

        this._map.drawMode.disable();

        this._map._container.style.cursor = 'crosshair';
      }
    },
    removeHooks: function removeHooks() {
      delete this._shape;

      this._map.off('mousedown', this._onMouseDown, this).off('mousemove', this._onMouseMove, this).off('mouseup', this._onMouseUp, this);

      if (that._dragMode === _dictionary.DRAG_MODE.PAN) {
        this._map.dragging.enable();
      }

      this._map._container.style.cursor = '-webkit-grab';
    },
    _onMouseMove: function _onMouseMove(e) {
      // Fix issue #1 and #2
      // e.originalEvent.buttons === 1 means Primary button
      if (e.originalEvent.buttons === 1 && this._isDrawing) {
        this._drawShape(e.latlng);
      }
    },
    _onMouseUp: function _onMouseUp() {
      var shape = this._shape;

      if (shape) {
        var map = this._map;
        var mapBounds = map.getBounds();

        var prevMapSelected = _lodash["default"].cloneDeep(that._selected); // For performance, filter the symbols within the current view


        var symbols = _lodash["default"].reduce(_objectSpread(_objectSpread(_objectSpread({}, that._symbols), that._clusterSymbols), that._flags), function (acc, el, key) {
          var isPoint = el.type === _dictionary.SYMBOL_TYPE.MARKER || el.type === _dictionary.SYMBOL_TYPE.SPOT || el.type === _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER;
          var clusterId = el.props.cluster;
          var clusterLyr = clusterId ? clusterId === true ? that._gCluster.layer : that._clusters[clusterId].layer : null;
          var hasLayer = map.hasLayer(el.layer) || clusterLyr && map.hasLayer(clusterLyr) && clusterLyr.hasLayer(el.layer);

          if (isPoint) {
            var isWithin = mapBounds.contains(el.layer.getLatLng());

            if (isWithin && hasLayer) {
              acc[key] = el;
            } else if (!isWithin && el.isSelected()) {
              el.setSelected(false);
            }
          } // TODO: how to filter other symbol types
          else if (hasLayer) {
              acc[key] = el;
            }

          return acc;
        }, {});

        var eventObj = {
          containerPoint: map.latLngToContainerPoint(shape._latlng),
          latlng: shape._latlng,
          layerPoint: map.latLngToLayerPoint(shape._latlng),
          radius: shape._mRadius,
          target: map,
          type: 'selectionChange',
          isMultiple: true
        };
        var circleCenter = shape.getLatLng();
        var radius = shape.getRadius(); // in meters
        // Convert circle to polygon to generate geojson
        // const circlePolygon = gh.convertCircleToPolygon(circleCenter, radius, 128, 0, 360, map.options.crs)

        var circlePolygon = _gisHelper["default"].convertCircleToPolygon(shape, map, {
          vertices: 180
        });

        var isChanged = false; // Reset the selection

        that._selected = {};

        _lodash["default"].forEach(symbols, function (el) {
          if (that._selected[el.id]) {
            return;
          }

          var isSelected = false;
          var isPoint = el.type === _dictionary.SYMBOL_TYPE.MARKER || el.type === _dictionary.SYMBOL_TYPE.SPOT || el.type === _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER;

          if (isPoint) {
            var elCenter = el.layer.getLatLng();
            var distance = map.options.crs.distance(circleCenter, elCenter); // Check the marker is in the circle or not

            isSelected = distance <= radius;
          } else {
            // Convert symbol & polygon to geojson, then check the line intersection
            var symbolGeo = el.type === _dictionary.SYMBOL_TYPE.CIRCLE ? _gisHelper["default"].convertCircleToPolygon(el.layer, map, {
              vertices: 180,
              startFrom: el.props.startAngle || 0,
              stopAt: el.props.stopAngle || 360
            }).toGeoJSON() : el.layer.toGeoJSON();
            var drawnGeo = circlePolygon.toGeoJSON();

            var isIntersect = _gisHelper["default"].isIntersect(symbolGeo, drawnGeo);

            var isOverlap = _gisHelper["default"].isOverlap(symbolGeo, drawnGeo);

            if (isIntersect || isOverlap) {
              isSelected = true;
            }
          } // Set symbol's 'selected' prop


          el.setSelected(isSelected);

          if (isSelected && el.type !== _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER) {
            that._selected[el.id] = true;
          }

          if (isSelected && el.type === _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER) {
            var allChildren = _lodash["default"].map(el.layer.getAllChildMarkers(), '_gis_id');

            var children = _lodash["default"].reduce(allChildren, function (acc, id) {
              that._symbols[id].setSelected(true);

              acc[id] = true;
              return acc;
            }, {});

            that._selected = _objectSpread(_objectSpread({}, that._selected), children);
          }
        }); // Trigger selectionChange event of map


        isChanged = !_lodash["default"].isEqual(that._selected, prevMapSelected);

        if (isChanged && map.listens('selectionChange')) {
          // Fire 'clusterselectionChange' is for re-render selected cluster
          map.fire('selectionChange', eventObj).fire('clusterselectionChange', eventObj);
        } // Reset the drawn region


        map.removeLayer(shape);
        delete this._shape;
      }
    }
  });
}
/**
 * Creates rectangle-region selection handler.
 * The handler is extend from L.Draw.Rectangle (see leaflet.draw plugin)
 * For futher study, see node-modules/leaflet.draw/dist/leaflet.draw-src.js or the link.
 *
 * @link    https://github.com/Leaflet/Leaflet.draw/blob/develop/src/draw/handler/Draw.Rectangle.js
 *
 * @param {Leaflet} L           Leaflet module
 *
 * @return {Leaflet handler}    The rectangle selection handler, which can select a rectangle region on map.
 */


function createRectangleHandler(L) {
  var that = this; // Extend L.Draw.Rectangle as box-selector

  return L.Draw.Rectangle.extend({
    options: {
      shapeOptions: _style.DEFAULT_REGION_STYLE,
      metric: true // Whether to use the metric measurement system or imperial

    },
    // Called when the handler is enabled
    addHooks: function addHooks() {
      L.Draw.Feature.prototype.addHooks.call(this);

      if (this._map) {
        this._map.on('mousedown', this._onMouseDown, this).on('mousemove', this._onMouseMove, this).on('mouseup', this._onMouseUp, this).dragging.disable();

        this._map.circleSelector.disable();

        this._map.measureMode.disable();

        this._map.drawMode.disable();

        this._map._container.style.cursor = 'crosshair';
      }
    },
    removeHooks: function removeHooks() {
      delete this._shape;

      this._map.off('mousedown', this._onMouseDown, this).off('mousemove', this._onMouseMove, this).off('mouseup', this._onMouseUp, this);

      if (that._dragMode === _dictionary.DRAG_MODE.PAN) {
        this._map.dragging.enable();
      }

      this._map._container.style.cursor = '-webkit-grab';
    },
    _onMouseMove: function _onMouseMove(e) {
      // Fix issue #1 and #2
      // e.originalEvent.buttons === 1 means Primary button
      if (e.originalEvent.buttons === 1 && this._isDrawing) {
        this._drawShape(e.latlng);
      }
    },
    _onMouseUp: function _onMouseUp() {
      var shape = this._shape;

      if (shape) {
        var map = this._map;
        var mapBounds = map.getBounds();

        var prevMapSelected = _lodash["default"].cloneDeep(that._selected); // For performance, filter the symbols within the current view


        var symbols = _lodash["default"].reduce(_objectSpread(_objectSpread(_objectSpread({}, that._symbols), that._clusterSymbols), that._flags), function (acc, el, key) {
          var isPoint = el.type === _dictionary.SYMBOL_TYPE.MARKER || el.type === _dictionary.SYMBOL_TYPE.SPOT || el.type === _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER;
          var clusterId = el.props.cluster;
          var clusterLyr = clusterId ? clusterId === true ? that._gCluster.layer : that._clusters[clusterId].layer : null;
          var hasLayer = map.hasLayer(el.layer) || clusterLyr && map.hasLayer(clusterLyr) && clusterLyr.hasLayer(el.layer);

          if (isPoint) {
            var isWithin = mapBounds.contains(el.layer.getLatLng());

            if (isWithin && hasLayer) {
              acc[key] = el;
            } else if (!isWithin && el.isSelected()) {
              el.setSelected(false);
            }
          } // TODO: how to filter other symbol types
          else if (hasLayer) {
              acc[key] = el;
            }

          return acc;
        }, {});

        var containerPoint = {
          northEast: map.latLngToContainerPoint(shape._bounds._northEast),
          southWest: map.latLngToContainerPoint(shape._bounds._southWest)
        };
        var layerPoint = {
          northEast: map.latLngToLayerPoint(shape._bounds._northEast),
          southWest: map.latLngToLayerPoint(shape._bounds._southWest)
        };
        var eventObj = {
          containerPoint: containerPoint,
          bounds: shape._bounds,
          layerPoint: layerPoint,
          target: map,
          type: 'selectionChange',
          isMultiple: true
        };
        var isChanged = false; // Reset the selection

        that._selected = {};

        _lodash["default"].forEach(symbols, function (el) {
          if (that._selected[el.id]) {
            return;
          }

          var isSelected = false;
          var isPoint = el.type === _dictionary.SYMBOL_TYPE.MARKER || el.type === _dictionary.SYMBOL_TYPE.SPOT || el.type === _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER;

          if (isPoint) {
            // Get the bounds of the rectangle, then checking symbol is in bounds or not
            var elCenter = el.layer.getLatLng();
            isSelected = shape.getBounds().contains(elCenter);
          } else {
            // Convert symbol & rectangle to geojson, then check the line intersection
            var symbolGeo = el.type === _dictionary.SYMBOL_TYPE.CIRCLE ? _gisHelper["default"].convertCircleToPolygon(el.layer, map, {
              vertices: 180,
              startFrom: el.props.startAngle || 0,
              stopAt: el.props.stopAngle || 360
            }).toGeoJSON() : el.layer.toGeoJSON();
            var drawnGeo = shape.toGeoJSON();

            var isIntersect = _gisHelper["default"].isIntersect(symbolGeo, drawnGeo);

            var isOverlap = _gisHelper["default"].isOverlap(symbolGeo, drawnGeo);

            if (isIntersect || isOverlap) {
              isSelected = true;
            }
          } // Set symbol's 'selected' prop


          el.setSelected(isSelected);

          if (isSelected && el.type !== _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER) {
            that._selected[el.id] = true;
          }

          if (isSelected && el.type === _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER) {
            var allChildren = _lodash["default"].map(el.layer.getAllChildMarkers(), '_gis_id');

            var children = _lodash["default"].reduce(allChildren, function (acc, id) {
              that._symbols[id].setSelected(true);

              acc[id] = true;
              return acc;
            }, {});

            that._selected = _objectSpread(_objectSpread({}, that._selected), children);
          }
        }); // Trigger selectionChange event of map


        isChanged = !_lodash["default"].isEqual(that._selected, prevMapSelected);

        if (isChanged && map.listens('selectionChange')) {
          // Fire 'clusterselectionChange' is for re-render selected cluster
          map.fire('selectionChange', eventObj).fire('clusterselectionChange', eventObj);
        } // Reset the drawn region


        map.removeLayer(shape);
        delete this._shape;
      }
    }
  });
}
/**
 * Creates measure mode handler.
 * The handler is extend from L.Draw.Polyline (see leaflet.draw plugin)
 * For futher study, see node-modules/leaflet.draw/dist/leaflet.draw-src.js or the link.
 *
 * @link    https://github.com/Leaflet/Leaflet.draw/blob/develop/src/draw/handler/Draw.Polyline.js
 *
 * @param {Leaflet} L           Leaflet module.
 *
 * @return {Leaflet handler}    The measure handler, which can measure a path distance on the map.
 */


function createMeasureHandler(L, measureOptions) {
  var that = this;
  var HINT = 'Double-Click to stop drawing';
  var showPointer = measureOptions.showPointerTooltip,
      pTooltip = measureOptions.pointerTooltip,
      showEnd = measureOptions.showEndTooltip,
      eTooltip = measureOptions.endTooltip,
      vIcon = measureOptions.vertexIcon,
      hint = measureOptions.hint;
  var defaultVertex = {
    className: 'gis-vertex',
    iconSize: [30, 30]
  }; // Extend L.Draw.Polyline

  return L.Draw.Polyline.extend({
    options: {
      shapeOptions: !_lodash["default"].isEmpty(measureOptions) ? _lodash["default"].merge({}, _style.DEFAULT_TRACK_STYLE, _lodash["default"].pick(measureOptions, _dictionary.STYLE_DICT)) : _style.DEFAULT_TRACK_STYLE,
      metric: true,
      // Whether to use the metric measurement system or imperial
      zIndexOffset: 3000,
      showPointerTooltip: !_lodash["default"].isNil(showPointer) ? showPointer : true,
      pointerTooltip: pTooltip || null,
      showEndTooltip: !_lodash["default"].isNil(showEnd) ? showEnd : true,
      endTooltip: eTooltip || null,
      vertexIcon: vIcon || defaultVertex,
      hint: hint || false
    },
    // Called when the handler is enabled
    addHooks: function addHooks() {
      L.Draw.Feature.prototype.addHooks.call(this);

      if (this._map) {
        this._allPaths = L.layerGroup([]).addTo(this._map);
        this._allVertexGroups = L.layerGroup([]).addTo(this._map);

        this._map.on('mousedown', this._onMouseDown, this).on('mousemove', this._onMouseMove, this);

        this._map.dragging.disable();

        this._map.doubleClickZoom.disable();

        this._map.circleSelector.disable();

        this._map.rectangleSelector.disable();

        this._map.drawMode.disable();

        if (hint) {
          var content = _lodash["default"].isBoolean(hint) ? HINT : hint;
          this._hintWrapper = L.DomUtil.create('div', 'gis-measure-hint', this._map._container);
          this._hintWrapper.innerHTML = _lodash["default"].isString(content) ? content : content(that.getSymbol(), this._map);
        }
      }
    },
    removeHooks: function removeHooks() {
      if (this._path) {
        this._clear();
      }

      if (this._pointer) {
        this._map.removeLayer(this._pointer);
      }

      this._map.removeLayer(this._allPaths);

      this._map.removeLayer(this._allVertexGroups);

      delete this._pointer;
      delete this._allPaths;
      delete this._allVertexGroups;

      this._map.off('mousedown', this._onMouseDown, this).off('mousemove', this._onMouseMove, this).off('mouseup', this._onMouseUp, this);

      if (that._dragMode === _dictionary.DRAG_MODE.PAN) {
        this._map.dragging.enable();
      }

      if (this._hintWrapper) {
        L.DomUtil.remove(this._hintWrapper);
        delete this._hintWrapper;
      }

      this._map.doubleClickZoom.enable();
    },
    _onMouseDown: function _onMouseDown(e) {
      if (!this._path) {
        var pid = _lodash["default"].values(this._allVertexGroups).length;

        this._path = L.polyline([e.latlng], this.options.shapeOptions).addTo(this._map);
        this._pathLatLngs = [];
        this._pathIds = "gis-path-".concat(pid);

        if (this._map.listens('measurestart')) {
          this._onDrawStart(e);
        }
      }

      var lastVetex = this._vertexGroup ? _lodash["default"].last(this._vertexGroup.getLayers()) : null;

      if (lastVetex && e.latlng.distanceTo(lastVetex.getLatLng()) === 0) {
        this._finishPath(e);
      } else {
        this._createMarker(e.latlng);
      }
    },
    _onMouseMove: function _onMouseMove(e) {
      this._pointerLatLng = e.latlng; // The marker sitcks on mouse with the tooltip shows the path's distance

      if (!this._pointer) {
        this._pointer = L.circleMarker(this._pointerLatLng).addTo(this._map);

        if (this.options.showPointerTooltip) {
          this._pointer.bindTooltip('', {
            permanent: true,
            direction: 'top'
          }).openTooltip();
        }
      }

      if (this._path) {
        this._path.setLatLngs([].concat(_toConsumableArray(this._pathLatLngs), [this._pointerLatLng]));
      }

      this._pointer.setLatLng(this._pointerLatLng);

      if (this.options.showPointerTooltip) {
        this._updateTooltip(e);
      }

      if (this._map.listens('measure')) {
        this._onDraw(e);
      }

      L.DomEvent.preventDefault(e.originalEvent);
    },
    _onDrawStart: function _onDrawStart(e) {
      var _this$_getEventArgume = this._getEventArguments(e),
          latlng = _this$_getEventArgume.latlng,
          layers = _this$_getEventArgume.layers;

      this._map.fire('measurestart', {
        event: e,
        pathInfo: latlng,
        layers: layers
      });
    },
    _onDraw: function _onDraw(e) {
      var _this$_getEventArgume2 = this._getEventArguments(e),
          latlng = _this$_getEventArgume2.latlng,
          layers = _this$_getEventArgume2.layers;

      var pathInfo = {
        distance: this._measureDistance(this._path),
        latlngs: this._getPathLatLngs(this._path),
        latlng: latlng
      };

      this._map.fire('measure', {
        event: e,
        pathInfo: pathInfo,
        layers: layers
      });
    },
    _onDrawEnd: function _onDrawEnd(e) {
      var _this$_getEventArgume3 = this._getEventArguments(e),
          latlng = _this$_getEventArgume3.latlng,
          layers = _this$_getEventArgume3.layers;

      var pathInfo = {
        distance: this._measureDistance(this._path),
        latlngs: this._getPathLatLngs(this._path),
        latlng: latlng
      };

      this._map.fire('measureend', {
        event: e,
        pathInfo: pathInfo,
        layers: layers
      });
    },
    _getEventArguments: function _getEventArguments(e) {
      var rawLatlng = e.latlng;
      var latlng = [rawLatlng.lat, rawLatlng.lng];
      var layers = {
        currentPath: this._path,
        allPath: this._allPaths
      };
      return {
        latlng: latlng,
        layers: layers
      };
    },
    _getPathLatLngs: function _getPathLatLngs() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var pathLatLngs = path instanceof L.Polyline ? path.getLatLngs() : [];
      return _lodash["default"].map(pathLatLngs, function (_ref) {
        var lat = _ref.lat,
            lng = _ref.lng;
        return [lat, lng];
      });
    },
    _measureDistance: function _measureDistance() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var latlngs = this._getPathLatLngs(path);

      return _gisHelper["default"].getPathDistance(latlngs, this._map.options.crs);
    },
    _createMarker: function _createMarker(latlng) {
      var vertexIcon = this.options.vertexIcon;

      var latlngs = this._getPathLatLngs(this._path);

      var icon = _lodash["default"].clone(defaultVertex);

      if (_lodash["default"].isFunction(vertexIcon)) {
        icon = _lodash["default"].merge({}, defaultVertex, vertexIcon(latlng, latlngs));
      } else if (_lodash["default"].isPlainObject(vertexIcon)) {
        icon = _lodash["default"].merge({}, defaultVertex, vertexIcon);
      }

      if (icon.className.indexOf('gis-vertex') < 0) {
        icon.className = "gis-vertex ".concat(icon.className || '');
      }

      var vertex = L.marker(latlng, {
        icon: L.divIcon(icon)
      });

      if (!this._vertexGroupId) {
        this._vertexGroup = L.layerGroup([]).addTo(this._map);

        this._allVertexGroups.addLayer(this._vertexGroup);

        this._vertexGroupId = this._allVertexGroups.getLayerId(this._vertexGroup);
      }

      this._vertexGroup.addLayer(vertex);

      this._pathLatLngs.push(latlng);
    },
    _updateTooltip: function _updateTooltip(e) {
      var latlngs = this._getPathLatLngs(this._path);

      var distance = this._measureDistance(this._path);

      var pointerTooltip = this.options.pointerTooltip;

      var _this$_getEventArgume4 = this._getEventArguments(e),
          latlng = _this$_getEventArgume4.latlng; // content should be a String / HtmlElement / L.Tooltip


      var content = pointerTooltip ? _lodash["default"].isFunction(pointerTooltip) ? pointerTooltip(distance, latlng, latlngs, this._path) : pointerTooltip : "".concat(distance, " meters");

      this._pointer.setTooltipContent(content);
    },
    _finishPath: function _finishPath(e) {
      if (this._pathLatLngs.length > 1) {
        var path = L.polyline(this._pathLatLngs, this.options.shapeOptions).addTo(this._map);

        var lastVetex = _lodash["default"].last(this._vertexGroup.getLayers());

        var _this$options = this.options,
            showEndTooltip = _this$options.showEndTooltip,
            endTooltip = _this$options.endTooltip;

        var _this$_getEventArgume5 = this._getEventArguments(e),
            latlng = _this$_getEventArgume5.latlng;

        this._allPaths.addLayer(path);

        if (showEndTooltip) {
          var distance = this._measureDistance(path);

          var latlngs = this._getPathLatLngs(path);

          var content = endTooltip ? _lodash["default"].isFunction(endTooltip) ? endTooltip(distance, latlng, latlngs, path) : endTooltip : "".concat(distance, " meters");
          lastVetex.bindTooltip(content, {
            permanent: true,
            direction: 'top'
          }).openTooltip();
        }
      } else {
        this._allVertexGroups.removeLayer(this._vertexGroup);

        delete this._vertexGroup;
      }

      if (this._map.listens('measureend')) {
        this._onDrawEnd(e);
      }

      this._clear();
    },
    _clear: function _clear() {
      this._pathLatLngs = [];

      this._map.removeLayer(this._path);

      delete this._path;
      delete this._vertexGroup;
      delete this._vertexGroupId;
    }
  });
}
/**
 * Creates draw mode handler.
 * The handler is implemented based on leaflet.draw, see the link for more detail.
 * Map handlers are a new concept from Leaflet 1.0. They process DOM events from the browser and change the state on the map.
 *
 * @link    https://github.com/Leaflet/Leaflet.draw/tree/develop/src
 * @link    http://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html
 * @link    https://leafletjs.com/examples/extending/extending-3-controls.html
 *
 * @param {Leaflet} L           Leaflet module
 *
 * @return {Leaflet handler}    The draw handler, which can draw/edit/delete features on the map.
 */


function createDrawHandler(L) {
  var drawOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var that = this; // Set the text on control buttons and handlers

  L.drawLocal = _lodash["default"].merge(L.drawLocal, _lodash["default"].get(drawOptions, 'locale', {}));
  return L.Handler.extend({
    initialize: function initialize(map) {
      var _this = this;

      this._map = map;
      this._container = map._container;
      this._overlayPane = map._panes.overlayPane; // For placing symbols drawn symbols

      if (!this._drawnGroup) {
        this._drawnGroup = new L.FeatureGroup();

        this._map.addLayer(this._drawnGroup);
      }

      this._drawnGroup.on('layerremove', function (event) {
        L.DomEvent.stop(event);

        var shouldTrigger = that._dragMode === _dictionary.DRAG_MODE.DRAW && that._drawType === _dictionary.DRAW_TYPE.DELETE && _this._map.listens('delete');

        if (shouldTrigger) {
          _this._map.fire(L.Draw.Event.DELETED, event);
        }
      }).on('dblclick', function (event) {
        L.DomEvent.stop(event);

        var shouldTrigger = that._drawType === _dictionary.DRAW_TYPE.EDIT && _this._map.listens('editcontent');

        if (!shouldTrigger) {
          return;
        }

        var layer = event.layer;
        var drawnId = layer._gis_id;
        var eventObj = {
          event: event,
          symbol: that.getSymbol(drawnId)
        };

        _this._map.fire('editcontent', eventObj);
      });

      this._map // Draw create event
      .on(L.Draw.Event.CREATED, function (event) {
        L.DomEvent.stop(event);

        _this._handleCreate(event);

        _this._fireEvent('create', {
          event: event,
          layer: _this._lastCreated.layer
        });
      }) // Prevent the function from closing after drawing
      .on(L.Draw.Event.DRAWSTOP, function (event) {
        // This condition judgement is for avoiding trigger in region selection
        if (that._dragMode === _dictionary.DRAG_MODE.DRAW) {
          L.DomEvent.stop(event); // Prevent to trigger by other modes which extended from leaflet.draw

          _this._activeHandler && _this._activeHandler.enable();
        }
      }) // Trigger edit event when finishing editing
      .on(L.Draw.Event.EDITSTOP, function (event) {
        L.DomEvent.stop(event);

        _this._updateSymbols();

        if (_this._map.listens('edit')) {
          _this._map.fire('edit', {
            event: event,
            symbol: that.getSymbol()
          });
        }
      }).on(L.Draw.Event.DELETED, function (event) {
        L.DomEvent.stop(event); // triggered by clicking 'Clear All'

        if (event.layers) {
          var drawnIds = _lodash["default"].map(event.layers.getLayers(), '_gis_id'); // Fire the customed events


          if (_this._map.listens('delete')) {
            var eventObj = {
              event: event,
              symbol: that.getSymbol(drawnIds)
            };

            _this._map.fire('delete', eventObj);
          }

          _lodash["default"].forEach(drawnIds, function (el) {
            return delete that._symbols[el];
          });
        } else {
          _this._fireEvent('delete', {
            event: event,
            layer: event.layer
          });

          delete that._symbols[event.layer._gis_id];
        }
      });
    },
    addHooks: function addHooks() {
      var drawControl = this.getControl();
      var drawType = that._drawType;

      if (this._map) {
        this._map.dragging.disable();

        this._map.doubleClickZoom.disable();

        this._map.circleSelector.disable();

        this._map.rectangleSelector.disable();

        this._map.measureMode.disable();

        if (!this._map.hasLayer(this._drawnGroup)) {
          this._map.addLayer(this._drawnGroup);
        }

        this._addVirtualSymbols(); // If defaultControl is true, use the leaflet.draw control


        if (_lodash["default"].get(drawOptions, 'defaultControl', false)) {
          this._map.addControl(drawControl);
        } else {
          this.setDrawType(drawType);
        }

        this._map.getContainer().focus();

        this._map.getContainer().classList.add('gis-draw');

        this.enable();
      }
    },
    removeHooks: function removeHooks() {
      var _this2 = this;

      var isStdOrTrack = that._layout === _dictionary.LAYOUT.STANDARD || that._layout === _dictionary.LAYOUT.TRACK; // Disable the handler first to prevent erro in leaflet

      if (this._activeHandler) {
        this._activeHandler.disable();

        L.Handler.prototype.disable.call(this._activeHandler);
        delete this._activeHandler;
      } // Remove the default draw control


      if (drawOptions.defaultControl) {
        var drawControl = this.getControl();

        this._map.removeControl(drawControl);
      }

      if (that._dragMode === _dictionary.DRAG_MODE.PAN) {
        this._map.dragging.enable();
      } // All maps may need to redraw


      this._updateSymbols();

      this._drawnGroup.clearLayers(); // Add the original symbol back


      _lodash["default"].forEach(that._symbols, function (el) {
        var shouldAddBack = that._visible[el.id] && !_this2._map.hasLayer(el.layer);

        if (isStdOrTrack && shouldAddBack) {
          _this2._map.addLayer(el.layer);
        }
      });

      delete this._virtual;

      this._map.doubleClickZoom.enable();

      this._map.getContainer().classList.remove('gis-draw');
    },
    disable: function disable() {
      if (!this.enabled()) {
        return;
      }

      L.Handler.prototype.disable.call(this);
    },
    getControl: function getControl() {
      if (!this._control) {
        this._control = new L.Control.Draw(_objectSpread(_objectSpread({}, _lodash["default"].pick(drawOptions, ['draw', 'position'])), {}, {
          edit: {
            featureGroup: this._drawnGroup
          }
        }));
      }

      return this._control;
    },
    setDrawType: function setDrawType(drawType) {
      if (this._activeHandler) {
        this._activeHandler.disable();

        L.Handler.prototype.disable.call(this._activeHandler);
      }

      switch (drawType) {
        case _dictionary.DRAW_TYPE.MARKER:
          this._activeHandler = new L.Draw.Marker(this._map, {});
          break;

        case _dictionary.DRAW_TYPE.SPOT:
          this._activeHandler = new L.Draw.CircleMarker(this._map, {});
          break;

        case _dictionary.DRAW_TYPE.CIRCLE:
          this._activeHandler = new L.Draw.Circle(this._map, {});
          break;

        case _dictionary.DRAW_TYPE.POLYLINE:
          this._activeHandler = new L.Draw.Polyline(this._map, {});
          break;

        case _dictionary.DRAW_TYPE.POLYGON:
          this._activeHandler = new L.Draw.Polygon(this._map, {});
          break;

        case _dictionary.DRAW_TYPE.RECTANGLE:
          this._activeHandler = new L.Draw.Rectangle(this._map, {});
          break;

        case _dictionary.DRAW_TYPE.EDIT:
          this._activeHandler = new L.EditToolbar.Edit(this._map, {
            featureGroup: this._drawnGroup,
            selectedPathOptions: {
              dashArray: '10, 10',
              fill: true,
              fillColor: '#fe57a1',
              fillOpacity: 0.1,
              // Whether to user the existing layers color
              maintainColor: false
            },
            poly: null
          }); // this._addVirtualSymbols()

          break;

        case _dictionary.DRAW_TYPE.DELETE:
          this._activeHandler = new L.EditToolbar.Delete(this._map, {
            featureGroup: this._drawnGroup
          });
          break;

        default:
          break;
      }

      if (this.enabled() && this._activeHandler) {
        this._activeHandler.enable();
      }
    },
    _handleCreate: function _handleCreate(event) {
      var layer = event.layer;
      var type = event.layerType === 'circlemarker' ? 'spot' : event.layerType;
      var radius = type === _dictionary.SYMBOL_TYPE.CIRCLE && layer.getRadius();
      var isPolyline = type === _dictionary.SYMBOL_TYPE.POLYLINE;
      var isPolygon = type === _dictionary.SYMBOL_TYPE.POLYGON || type === _dictionary.SYMBOL_TYPE.RECTANGLE;
      var latlng = [];

      if (isPolygon || isPolyline) {
        // Polygon, polyline, and rectangle are formed by vertices
        latlng = isPolygon ? _lodash["default"].map(layer.getLatLngs()[0], function (el) {
          return [el.lat, el.lng];
        }) : _lodash["default"].map(layer.getLatLngs(), function (_ref2) {
          var lat = _ref2.lat,
              lng = _ref2.lng;
          return [lat, lng];
        });
      } else {
        var _layer$getLatLng = layer.getLatLng(),
            lat = _layer$getLatLng.lat,
            lng = _layer$getLatLng.lng;

        latlng = [lat, lng];
      }

      var id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(1, 6);
      var symbol = {
        id: id,
        type: type,
        latlng: latlng,
        radius: radius,
        selected: false
      };
      that.setSymbol(symbol);
      that._symbols[id]._isDrawn = true;
      that._editableIds[id] = true;

      this._convertToVirtual(that._symbols[id]);

      this._lastCreated = that._symbols[id];
    },
    _fireEvent: function _fireEvent(eventName, event) {
      var drawnId = _lodash["default"].get(event, 'layer._gis_id');

      var eventObj = {
        event: event.event,
        symbol: that.getSymbol(drawnId)
      }; // Fire the customed events

      if (this._map.listens(eventName)) {
        this._map.fire(eventName, eventObj);
      }
    },
    _convertToVirtual: function _convertToVirtual(symbol) {
      var layer = symbol.layer;
      var validType = symbol.type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK && symbol.type !== _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER && symbol.type !== _dictionary.SYMBOL_TYPE.GEOJSON;
      var isPoly = symbol.type === _dictionary.SYMBOL_TYPE.POLYLINE || symbol.type === _dictionary.SYMBOL_TYPE.POLYGON || symbol.type === _dictionary.SYMBOL_TYPE.RECTANGLE;
      var virtual = null;

      if (!that._editableIds[symbol.id] || !validType) {
        that._visible[symbol.id] && !this._map.hasLayer(layer) && this._map.addLayer(layer);
        return;
      }

      this._map.hasLayer(layer) && this._map.removeLayer(layer);

      if (isPoly && symbol.props.directed) {
        var latlng = symbol.props.latlng;
        virtual = L.polyline(latlng, _lodash["default"].pick(symbol.props, _dictionary.STYLE_DICT));
      } else if (isPoly) {
        var _latlng = layer.getLatLngs();

        switch (symbol.type) {
          case _dictionary.SYMBOL_TYPE.POLYLINE:
            virtual = L.polyline(_latlng, _lodash["default"].pick(symbol.props, _dictionary.STYLE_DICT));
            break;

          case _dictionary.SYMBOL_TYPE.POLYGON:
            virtual = L.polygon(_latlng, layer.options);
            break;

          case _dictionary.SYMBOL_TYPE.RECTANGLE:
            virtual = L.rectangle(_latlng, layer.options);
            break;

          default:
            break;
        }
      } else {
        var _latlng2 = layer.getLatLng();

        switch (symbol.type) {
          case _dictionary.SYMBOL_TYPE.MARKER:
          case _dictionary.SYMBOL_TYPE.SPOT:
            virtual = L.marker(_latlng2, layer.options);
            break;

          case _dictionary.SYMBOL_TYPE.CIRCLE:
            virtual = L.semiCircle(_latlng2, layer.options);
            break;

          default:
            break;
        }
      }

      if (virtual) {
        this._drawnGroup.addLayer(virtual);

        virtual._gis_id = symbol.id;
        virtual._gis_type = symbol.type;
        layer._virtual_id = this._drawnGroup.getLayerId(virtual);
        this._virtual[symbol.id] = virtual;
      }
    },
    // Dynamically add editable symbols to draw group
    _addVirtualSymbols: function _addVirtualSymbols() {
      var _this3 = this;

      var symbols = that._symbols;

      this._drawnGroup.clearLayers();

      this._virtual = {};

      _lodash["default"].forEach(symbols, function (el) {
        return _this3._convertToVirtual(el);
      });
    },
    _updateSymbols: function _updateSymbols() {
      // Update each symbol's location, radius, or any editable props
      _lodash["default"].forEach(this._virtual, function (el) {
        // These types can't be edited
        var type = el._gis_type;
        var symbol = that._symbols[el._gis_id];

        if (!symbol) {
          return;
        }

        var isPolyline = type === _dictionary.SYMBOL_TYPE.POLYLINE;
        var isPolygon = type === _dictionary.SYMBOL_TYPE.POLYGON || type === _dictionary.SYMBOL_TYPE.RECTANGLE;

        if (isPolyline || isPolygon) {
          var latlng = isPolygon ? _lodash["default"].map(el.getLatLngs()[0], function (v) {
            return [v.lat, v.lng];
          }) : _lodash["default"].map(el.getLatLngs(), function (_ref3) {
            var lat = _ref3.lat,
                lng = _ref3.lng;
            return [lat, lng];
          });
          symbol.set(_objectSpread(_objectSpread({}, symbol.props), {}, {
            latlng: latlng
          }), symbol.selected, symbol.selectedProps);
        } else {
          var _el$getLatLng = el.getLatLng(),
              lat = _el$getLatLng.lat,
              lng = _el$getLatLng.lng;

          var _latlng3 = [lat, lng]; // Update circle's radius

          if (type === _dictionary.SYMBOL_TYPE.CIRCLE) {
            symbol._props.radius = el.getRadius();
          }

          symbol.set(_objectSpread(_objectSpread({}, symbol.props), {}, {
            latlng: _latlng3
          }), symbol.selected, symbol.selectedProps);
        }
      });
    }
  });
}

var _default = {
  createCircleHandler: createCircleHandler,
  createRectangleHandler: createRectangleHandler,
  createMeasureHandler: createMeasureHandler,
  createDrawHandler: createDrawHandler
};
/* Default L.drawLocal, from leaflet.draw

L.drawLocal = {
    // format: {
    //  numeric: {
    //      delimiters: {
    //          thousands: ',',
    //          decimal: '.'
    //      }
    //  }
    // },
    draw: {
        toolbar: {
            // #TODO: this should be reorganized where actions are nested in actions
            // ex: actions.undo  or actions.cancel
            actions: {
                title: 'Cancel drawing',
                text: 'Cancel'
            },
            finish: {
                title: 'Finish drawing',
                text: 'Finish'
            },
            undo: {
                title: 'Delete last point drawn',
                text: 'Delete last point'
            },
            buttons: {
                polyline: 'Draw a polyline',
                polygon: 'Draw a polygon',
                rectangle: 'Draw a rectangle',
                circle: 'Draw a circle',
                marker: 'Draw a marker',
                circlemarker: 'Draw a circlemarker'
            }
        },
        handlers: {
            circle: {
                tooltip: {
                    start: 'Click and drag to draw circle.'
                },
                radius: 'Radius'
            },
            circlemarker: {
                tooltip: {
                    start: 'Click map to place circle marker.'
                }
            },
            marker: {
                tooltip: {
                    start: 'Click map to place marker.'
                }
            },
            polygon: {
                tooltip: {
                    start: 'Click to start drawing shape.',
                    cont: 'Click to continue drawing shape.',
                    end: 'Click first point to close this shape.'
                }
            },
            polyline: {
                error: '<strong>Error:</strong> shape edges cannot cross!',
                tooltip: {
                    start: 'Click to start drawing line.',
                    cont: 'Click to continue drawing line.',
                    end: 'Click last point to finish line.'
                }
            },
            rectangle: {
                tooltip: {
                    start: 'Click and drag to draw rectangle.'
                }
            },
            simpleshape: {
                tooltip: {
                    end: 'Release mouse to finish drawing.'
                }
            }
        }
    },
    edit: {
        toolbar: {
            actions: {
                save: {
                    title: 'Save changes',
                    text: 'Save'
                },
                cancel: {
                    title: 'Cancel editing, discards all changes',
                    text: 'Cancel'
                },
                clearAll: {
                    title: 'Clear all layers',
                    text: 'Clear All'
                }
            },
            buttons: {
                edit: 'Edit layers',
                editDisabled: 'No layers to edit',
                remove: 'Delete layers',
                removeDisabled: 'No layers to delete'
            }
        },
        handlers: {
            edit: {
                tooltip: {
                    text: 'Drag handles or markers to edit features.',
                    subtext: 'Click cancel to undo changes.'
                }
            },
            remove: {
                tooltip: {
                    text: 'Click on a feature to remove.'
                }
            }
        }
    }
}

*/

exports["default"] = _default;
//# sourceMappingURL=modes.js.map