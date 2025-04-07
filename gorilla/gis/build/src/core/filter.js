"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._filterIdsByTimestamp = _filterIdsByTimestamp;
exports._showSymbol = _showSymbol;
exports._hideSymbol = _hideSymbol;
exports._filterSymbol = _filterSymbol;
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _dataHelper = _interopRequireDefault(require("../utils/data-helper"));

var _symbolHelper = _interopRequireDefault(require("../utils/symbol-helper"));

var _renderHelper = _interopRequireDefault(require("../utils/render-helper"));

var _dictionary = require("../consts/dictionary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Filter related functions.
 *
 * @file   This file is the collection of filter-related functions.
 * @author Liszt
 *
 */

/**
 * Filters symbols' ids by timestamp.
 *
 * @param   {Object[]}  filterIds   The symbols' ids to be filtered. Formatted as {[symbolId]:true}.
 * @param   {Number[]}  interval    GIS interval, formatted as [start timestamp, end timestamp].
 *
 */
function _filterIdsByTimestamp(filterIds, interval) {
  var _this = this;

  if (_lodash["default"].isArray(interval) && interval.length === 2 && interval[0] <= interval[1]) {
    _lodash["default"].forEach(filterIds, function (val, sblId) {
      var symbol = _this._symbols[sblId];
      var isExcluded = !symbol.props.ts || _lodash["default"].isArray(symbol.props.ts) && symbol.props.ts.length === 0 || !_dataHelper["default"].isBetween(symbol.props.ts, interval);

      if (isExcluded) {
        delete filterIds[sblId];
      }
    });
  }
}
/**
 * Show symbols matched the filter within the interval.
 * If interval is not defined, it won't filter symbols by time.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of symbols to show. If a String or String[], it's symbols' ids; Object is for symbols' props; Function should return Boolean to get symbols; undefined will apply to all symbols.
 * @param   {Number[]}                               interval   GIS interval, formatted as [start timestamp, end timestamp].
 *
 */


function _showSymbol(filter) {
  var _this2 = this;

  var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var map = this._map;
  var symbols = this._symbols;

  var shownIds = _lodash["default"].filter(_symbolHelper["default"].getSymbol.call(this, filter, true, 'id'), function (id) {
    return symbols[id].type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK;
  });

  if (_lodash["default"].isArray(interval) && interval.length === 2) {
    _filterIdsByTimestamp.call(this, shownIds, interval);
  }

  _lodash["default"].forEach(shownIds, function (id) {
    var layer = symbols[id].layer;
    var _symbols$id$props = symbols[id].props,
        cluster = _symbols$id$props.cluster,
        group = _symbols$id$props.group;
    var isClustered = _this2._layout === _dictionary.LAYOUT.STANDARD && cluster;
    var isStdOrTrk = (_this2._layout === _dictionary.LAYOUT.STANDARD || _this2._layout === _dictionary.LAYOUT.TRACK && symbols[id].props.track) && !map.hasLayer(layer);
    group && !cluster && isStdOrTrk && _this2._groups[group] && !_this2._groups[group].layer.hasLayer(layer) && _this2._groups[group].layer.addLayer(layer);

    if (cluster === true && isClustered && _this2._gCluster) {
      !_this2._gCluster.layer.hasLayer(layer) && _this2._gCluster.layer.addLayer(layer);
    } else if (isClustered && _this2._clusters[cluster]) {
      !_this2._clusters[cluster].layer.hasLayer(layer) && _this2._clusters[cluster].layer.addLayer(layer);
    } else if (isStdOrTrk) {
      layer.addTo(map);
    }

    _this2._visible[id] = true;
    _this2._map.drawMode.enabled() && _this2._map.fire('virtualadd', {
      layer: layer
    });
  });

  !!this._contour && _renderHelper["default"].renderContour.call(this);
  !!this._heatmap && _renderHelper["default"].renderHeatmap.call(this);

  if (this._tracks) {
    _renderHelper["default"].renderTrack.call(this);
  } // Need to update the cluster data and their labels


  map.fire('clusterselectionChange');
}
/**
 * Hide symbols matched the filter within the interval.
 * If interval is not defined, it won't filter symbols by time.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of symbols to hide. If a String or String[], it's symbols' ids; Object is for symbols' props; Function should return Boolean to get symbols; undefined will apply to all symbols.
 * @param   {Number[]}                               interval   GIS interval, formatted as [start timestamp, end timestamp].
 *
 */


function _hideSymbol(filter) {
  var _this3 = this;

  var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var map = this._map;
  var symbols = this._symbols;

  var hiddenIds = _lodash["default"].filter(_symbolHelper["default"].getSymbol.call(this, filter, true, 'id'), function (id) {
    return symbols[id].type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK;
  });

  if (_lodash["default"].isArray(interval) && interval.length === 2) {
    _filterIdsByTimestamp.call(this, hiddenIds, interval);
  }

  _lodash["default"].forEach(hiddenIds, function (id) {
    var layer = _this3._symbols[id].layer;
    var _this3$_symbols$id$pr = _this3._symbols[id].props,
        cluster = _this3$_symbols$id$pr.cluster,
        group = _this3$_symbols$id$pr.group;
    delete _this3._visible[id];
    group && _this3._groups[group] && _this3._groups[group].layer.hasLayer(layer) && _this3._groups[group].layer.removeLayer(layer);

    if (cluster === true) {
      _this3._gCluster && _this3._gCluster.layer.hasLayer(layer) && _this3._gCluster.layer.removeLayer(layer);
    } else {
      _this3._clusters[cluster] && _this3._clusters[cluster].layer.hasLayer(layer) && _this3._clusters[cluster].layer.removeLayer(layer);
    }

    map.hasLayer(layer) && map.removeLayer(layer);
    _this3._map.drawMode.enabled() && _this3._map.fire('virtualremove', {
      layer: layer
    });
  });

  this._contour && _renderHelper["default"].renderContour.call(this);
  this._heatmap && _renderHelper["default"].renderHeatmap.call(this);

  if (this._tracks) {
    _renderHelper["default"].renderTrack.call(this);
  } // Need to update the cluster data and their labels


  map.fire('clusterselectionChange');
}
/**
 * Filter symbols matched the filter within the interval.
 * Symbols which don't match the filter will be hidden.
 * If interval is not defined, it won't filter symbols by time.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of symbols to show. If a String or String[], it's symbols' ids; Object is for symbols' props; Function should return Boolean to get symbols; undefined will apply to all symbols.
 * @param   {Number[]}                               interval   GIS interval, formatted as [start timestamp, end timestamp].
 *
 */


function _filterSymbol(filter) {
  var _this4 = this;

  var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var map = this._map,
      _layout = this._layout;
  var symbols = this._symbols;
  var filterIds = !_lodash["default"].isFunction(filter) && filter !== true && _lodash["default"].isEmpty(filter) ? {} : _lodash["default"].reduce(_symbolHelper["default"].getSymbol.call(this, filter, true, 'id'), function (acc, id) {
    if (symbols[id].type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK) {
      acc[id] = true;
    }

    return acc;
  }, {});

  if (_lodash["default"].isArray(interval) && interval.length === 2) {
    _filterIdsByTimestamp.call(this, filterIds, interval);
  }

  if (!_lodash["default"].isEmpty(filterIds)) {
    _lodash["default"].forEach(symbols, function (_ref) {
      var id = _ref.id,
          layer = _ref.layer,
          _ref$props = _ref.props,
          cluster = _ref$props.cluster,
          group = _ref$props.group;
      var isShown = !!filterIds[id];
      var _group = _this4._groups[group];
      var layerMgr = _layout !== _dictionary.LAYOUT.STANDARD ? null : !cluster ? map : ((cluster === true ? _this4._gCluster : _this4._clusters[cluster]) || {}).layer;
      if (_group && !cluster && _this4._layout === _dictionary.LAYOUT.STANDARD) _group.layer[isShown && !_group.layer.hasLayer(layer) ? 'addLayer' : 'removeLayer'](layer);
      if (layerMgr && layerMgr.hasLayer(layer) === !isShown) layerMgr[isShown ? 'addLayer' : 'removeLayer'](layer);else if (!isShown) layer.remove();
      if (isShown) _this4._visible[id] = true;else delete _this4._visible[id];
      map.drawMode.enabled() && map.fire(isShown ? 'virtualadd' : 'virtualremove', {
        layer: layer
      });
    });

    if (this._heatmap) {
      _renderHelper["default"].renderHeatmap.call(this);
    }

    if (this._tracks) {
      _renderHelper["default"].renderTrack.call(this);
    }

    if (this._contour) {
      _renderHelper["default"].renderContour.call(this);
    }
  } else {
    // Hide all symbols when filter is empty
    _hideSymbol.call(this);
  } // Need to update the cluster data and their labels


  map.fire('clusterselectionChange');
}

var _default = {
  _filterIdsByTimestamp: _filterIdsByTimestamp,
  _showSymbol: _showSymbol,
  _hideSymbol: _hideSymbol,
  _filterSymbol: _filterSymbol
};
exports["default"] = _default;
//# sourceMappingURL=filter.js.map