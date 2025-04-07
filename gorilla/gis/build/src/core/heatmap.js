"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._setHeatmap = _setHeatmap;
exports._showHeatmap = _showHeatmap;
exports._hideHeatmap = _hideHeatmap;
exports["default"] = void 0;

var _renderHelper = _interopRequireDefault(require("../utils/render-helper"));

var _dictionary = require("../consts/dictionary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Heatmap related functions.
 *
 * @file   This file is the collection of heatmap-related functions.
 * @author Liszt
 */

/**
 * Repaints the heatmap.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#heatmap-options
 * @link    https://www.patrick-wied.at/static/heatmapjs/docs.html
 *
 * @param   {Object}    options     Options for heatmap. See the link for more details.
 *
 */
function _setHeatmap(options) {
  _renderHelper["default"].renderHeatmap.call(this, options);
}
/**
 * Show the heatmap canvas.
 * Not relaese to developers yet.
 *
 */


function _showHeatmap() {
  var map = this._map;
  var heatmap = this._heatmap;

  if (this._layout === _dictionary.LAYOUT.HEATMAP && !map.hasLayer(heatmap)) {
    heatmap.addTo(map);
  }
}
/**
 * Hide the heatmap canvas.
 * Not relaese to developers yet.
 *
 */


function _hideHeatmap() {
  var map = this._map;
  var heatmap = this._heatmap;

  if (this._layout === _dictionary.LAYOUT.HEATMAP && map.hasLayer(heatmap)) {
    map.removeLayer(heatmap);
  }
}

var _default = {
  _setHeatmap: _setHeatmap // ,
  // _showHeatmap,
  // _hideHeatmap

};
exports["default"] = _default;
//# sourceMappingURL=heatmap.js.map