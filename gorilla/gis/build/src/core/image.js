"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._setImageOverlay = _setImageOverlay;
exports._removeImageOverlay = _removeImageOverlay;
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _dataHelper = _interopRequireDefault(require("../utils/data-helper"));

var _renderHelper = _interopRequireDefault(require("../utils/render-helper"));

var _gisException = require("../utils/gis-exception");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Image overlay related functions.
 *
 * @file   This file is the collection of overlay-related functions.
 * @author Liszt
 */
var log = require('loglevel').getLogger('gis/core/image');
/**
 * Creates/updates the overlayes.
 *
 * @param   {Object | Object[]}    item     Overlay configs to be created or updated. Formatted as {id, url, xy, size:{width, height}, opacity, zoom}
 *
 */


function _setImageOverlay(item) {
  var _this = this;

  var overlays = _lodash["default"].isArray(item) ? _lodash["default"].cloneDeep(item) : [_lodash["default"].cloneDeep(item)];
  /*
      el = {id, url, xy, size:{width, height}, opacity, zoom}
      id is the overlay's id. If undefined and the overlay is new, randomly create one for it.
      url and xy are required for new overlay
        url is the image path
      xy is the start point in the container
      zoom is the minimum level which the overlay will display
  */

  _lodash["default"].forEach(overlays, function (el) {
    var overlay = _this._overlays[el.id];

    var xy = _lodash["default"].get(el, 'xy', null);

    var size = _lodash["default"].get(el, 'size', null);

    if (!overlay) {
      _renderHelper["default"].renderOverlay.call(_this, el);
    } else {
      el.url && overlay.layer.setUrl(el.url);
      !_lodash["default"].isNil(el.opacity) && overlay.layer.setOpacity(el.opacity); // Translate the overlay if specified xy or size

      if (xy || size) {
        var x0 = _lodash["default"].get(xy, 'x', overlay.xy.x);

        var y0 = _lodash["default"].get(xy, 'y', overlay.xy.y);

        var x1 = x0 + _lodash["default"].get(size, 'width', overlay.size.width);

        var y1 = y0 + _lodash["default"].get(size, 'height', overlay.size.height);

        var bounds = [[y0, x0], [y1, x1]];
        overlay.layer.setBounds(bounds);
        _this._overlays[el.id].xy = xy || _this._overlays[el.id].xy;
        _this._overlays[el.id].size = size || _this._overlays[el.id].size;
        _this._overlays[el.id].opacity = !_lodash["default"].isNil(el.opacity) ? el.opacity : _this._overlays[el.id].opacity;
      }
    }
  });

  return this;
}
/**
 * Removes the overlayes which match the filter.
 *
 * @param   {String | String[] | Object | Function}    filter     Filter of overlays to be removed. If undefined, remove all overlays.
 *
 */


function _removeImageOverlay(filter) {
  var _this2 = this;

  var overlays = this._overlays;
  var removed = [];

  if (_lodash["default"].isString(filter)) {
    // Use id to find
    removed = _lodash["default"].filter(overlays, function (_ref) {
      var id = _ref.id;
      return id === filter;
    });
  } else if (_dataHelper["default"].isValidArgType(filter, [['string']])) {
    // Use ids[] to find
    removed = _lodash["default"].filter(overlays, function (_ref2) {
      var id = _ref2.id;
      return _lodash["default"].includes(filter, id);
    });
  } else if (_lodash["default"].isPlainObject(filter)) {
    // Use attributes, like id/zoom/opacity/... (except 'layer'), to find overlays
    removed = _lodash["default"].filter(overlays, function (el) {
      return _lodash["default"].isMatch(el, _lodash["default"].omit(filter, 'layer'));
    });
  } else if (_lodash["default"].isFunction(filter)) {
    // Use filter function which return boolean to find overlays to be removed
    removed = _lodash["default"].filter(overlays, function (el, key) {
      return filter(el, key, overlays);
    });
  } else if (_lodash["default"].isNil(filter) || _lodash["default"].isEmpty(filter)) {
    removed = _lodash["default"].toArray(overlays);
  } else {
    log.warn(_gisException.GIS_ERROR.INVALID_ARGS, filter, 'Filter should be String, String[], Object, or Function');
    return this;
  }

  _lodash["default"].forEach(removed, function (_ref3) {
    var id = _ref3.id,
        layer = _ref3.layer;

    _this2._map.removeLayer(layer);

    delete _this2._overlays[id];
  });

  return this;
}

var _default = {
  _setImageOverlay: _setImageOverlay,
  _removeImageOverlay: _removeImageOverlay
};
exports["default"] = _default;
//# sourceMappingURL=image.js.map