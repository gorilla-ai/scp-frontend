"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createGisClickHandler = createGisClickHandler;
exports.createGisZoomendHandler = createGisZoomendHandler;
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * This file defines & implements the GIS default events, including click and zoom.
 *
 * @file   Defines & implements GIS default events, including click and zoom
 * @author Liszt
 */

/**
 * Defines default click behavior. When clicking on map or symbol/cluster, map should fire selectionChange.
 *
 * @param {Leaflet} L   Leaflet module
 *
 * @return {Leaflet handler}    The GIS click handler, which can trigger selectionChange by clicking.
 */
function createGisClickHandler(L) {
  var that = this;
  return L.Handler.extend({
    addHooks: function addHooks() {
      var mapContainer = this._map.getContainer();

      L.DomEvent.on(mapContainer, 'mousedown', this._onMouseDown, this).on(mapContainer, 'mousemove', this._onMouseMove, this).on(mapContainer, 'mouseup', this._onMouseUp, this);
    },
    removeHooks: function removeHooks() {
      var mapContainer = this._map.getContainer();

      delete this._isPanning;
      delete this._clientX;
      delete this._clientY;
      L.DomEvent.off(mapContainer, 'mousedown', this._onMouseDown, this).off(mapContainer, 'mousemove', this._onMouseMove, this).off(mapContainer, 'mouseup', this._onMouseUp, this);
    },
    _onMouseDown: function _onMouseDown(e) {
      L.DomEvent.stop(e);
      var map = this._map;
      var mapContainer = map.getContainer();
      this._isOnMap = e.target === mapContainer;
      this._isPanning = false;
      this._clientX = e.clientX;
      this._clientY = e.clientY;
    },
    _onMouseMove: function _onMouseMove(e) {
      L.DomEvent.stop(e);
      this._isPanning = this._clientX - e.clientX !== 0 || this._clientY - e.clientY !== 0;
    },
    _onMouseUp: function _onMouseUp(e) {
      L.DomEvent.stop(e);
      var map = this._map;
      var selected = that._selected;

      if (!this._isPanning && this._isOnMap) {
        _lodash["default"].forEach(selected, function (val, id) {
          var sbl = that._symbols[id] || that._flags[id];
          sbl.setSelected(false);
        });

        if (!_lodash["default"].isEmpty(selected)) {
          that._selected = {};
          map.fire('selectionChange').fire('clusterselectionChange');
        }
      }

      this._isPanning = false;
    }
  });
}
/**
 * Defines zoom behavior for imageovelay. Each overlay has property "zoom".
 * If map's zoom level is less than this value, the overlay will hide.
 *
 * @param {Leaflet} L           Leaflet module
 *
 * @return {Leaflet handler}    The zoom handler, which can hide/show overlay by zooming.
 */


function createGisZoomendHandler(L) {
  var that = this;
  return L.Handler.extend({
    addHooks: function addHooks() {
      var mapContainer = this._map.getContainer();

      L.DomEvent.on(mapContainer, 'wheel', this._onZoomEnd, this);
      this._active = true;
      this._interval = 350;
    },
    removeHooks: function removeHooks() {
      var mapContainer = this._map.getContainer();

      L.DomEvent.off(mapContainer, 'wheel', this._onZoomEnd, this);
    },
    _onZoomEnd: function _onZoomEnd(e) {
      this._delta = L.DomEvent.getWheelDelta(e);

      if (this._active) {
        this._onWheelStart();
      }
    },
    _onWheelStart: function _onWheelStart() {
      this._active = false;

      this._onWheel();
    },
    _onWheel: function _onWheel() {
      var _this = this;

      this._delta2 = this._delta;
      setTimeout(function () {
        if (_this._delta2 === _this._delta) {
          _this._onWheelEnd();
        } else {
          _this._onWheel();
        }
      }, this._interval);
    },
    _onWheelEnd: function _onWheelEnd() {
      var map = this._map;

      var zoom = this._map.getZoom();

      var changedOverlays = _lodash["default"].filter(that._overlays, function (ol) {
        return _lodash["default"].isInteger(ol.zoom);
      }); // Show the overlay when specified zoom value <= current zoom level


      _lodash["default"].forEach(changedOverlays, function (ol) {
        if (ol.zoom <= zoom && !map.hasLayer(ol.layer)) {
          ol.layer.addTo(map);
          ol.layer.bringToFront();
        } else if (ol.zoom > zoom && map.hasLayer(ol.layer)) {
          map.removeLayer(ol.layer);
        }
      });

      this._active = true;
    }
  });
}

var _default = {
  createGisClickHandler: createGisClickHandler,
  createGisZoomendHandler: createGisZoomendHandler
};
exports["default"] = _default;
//# sourceMappingURL=events.js.map