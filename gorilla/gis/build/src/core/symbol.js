"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._setSymbol = _setSymbol;
exports._removeSymbol = _removeSymbol;
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _renderHelper = _interopRequireDefault(require("../utils/render-helper"));

var _symbolHelper = _interopRequireDefault(require("../utils/symbol-helper"));

var _gisException = require("../utils/gis-exception");

var _dictionary = require("../consts/dictionary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var log = require('loglevel').getLogger('gis/core/symbol');
/**
 * Removes the empty cluster or group layers for performance.
 *
 * @param {Object[]} collections        Cluster/LayerGroup collections.
 * @param {String}   collectionType     The collection's type, group or cluster.
 */


function _collectEmpties(collections, collectionType) {
  var _this = this;

  if (collectionType !== 'group' && collectionType !== 'cluster' || _lodash["default"].isEmpty(collections)) {
    return;
  }

  var path = "_props.".concat(collectionType); // Interate to get all the collections which should be reserved

  var reserved = _lodash["default"].reduce(this._symbols, function (acc, sbl) {
    var val = _lodash["default"].get(sbl, path);

    var shouldAdd = val && collections[val] && !acc[val];

    if (shouldAdd) {
      acc[val] = true;
    }

    return acc;
  }, {}); // If reserved's length is not the same as the original one, some collections must be empty.
  // That is, they should be removed from map


  if (_lodash["default"].keys(collections).length !== _lodash["default"].keys(reserved).length) {
    _lodash["default"].forEach(collections, function (_ref) {
      var id = _ref.id,
          layer = _ref.layer;

      if (!reserved[id]) {
        _this._map.hasLayer(layer) && _this._map.removeLayer(layer);
        delete collections[id];
      }
    });
  }
}
/**
 * Removes the empty cluster layers for performance.
 *
 */


function _collectEmptyClusters() {
  var countGlobal = this._gCluster ? _lodash["default"].filter(this._symbols, function (sbl) {
    return _lodash["default"].get(sbl, '_props.cluster') === true;
  }).length : undefined;

  if (countGlobal === 0) {
    this._map.hasLayer(this._gCluster.layer) && this._map.removeLayer(this._gCluster.layer);
    delete this._gCluster;
  }

  _collectEmpties.call(this, this._clusters, 'cluster');
}
/**
 * Removes the empty layerGroup layers for performance.
 *
 */


function _collectEmptyGroups() {
  _collectEmpties.call(this, this._groups, 'group');
}
/**
 * Creates/updates symbols.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 *
 * @param {Object | Object[]}   item        Symbol objects, formatted as {id, type, latlng, selected......}
 *
 */


function _setSymbol(item) {
  var _this2 = this;

  var items = _lodash["default"].isArray(item) ? _lodash["default"].cloneDeep(item) : [_lodash["default"].cloneDeep(item)];
  var currLayout = this._layout;

  var simpleTypes = _lodash["default"].omit(_dictionary.SYMBOL_TYPE, ['POPUP', 'CUSTOM']);

  var origSymbolCount = _lodash["default"].keys(this._symbols).length;

  _lodash["default"].forEach(items, function (el) {
    var type = _lodash["default"].toUpper(el.type);

    var isSimpleType = !!simpleTypes[type] || !!_dictionary.EXTRA_SYMBOL_TYPE[type];
    var isPoint = el.type === _dictionary.SYMBOL_TYPE.MARKER || el.type === _dictionary.SYMBOL_TYPE.SPOT;
    var sbl = el.type === _dictionary.SYMBOL_TYPE.MARKER || el.type === _dictionary.SYMBOL_TYPE.SPOT ? _objectSpread(_objectSpread({}, el), {}, {
      _truncateLabels: _this2._truncateLabels
    }) : el; // Reset the start/end flag to the original props/selectedProps

    var isFlagMode = isPoint && _lodash["default"].get(_this2._symbols, "".concat(el.id, "._origProps")) && !_lodash["default"].isEqual(_this2._symbols[el.id]._origProps, _this2._symbols[el.id]._props);

    if (_this2._symbols[el.id] && isFlagMode && _this2._layout === _dictionary.LAYOUT.TRACK) {
      _this2._symbols[el.id].set(_this2._symbols[el.id]._origProps, _this2._symbols[el.id].selected, _this2._symbols[el.id]._origSelectedProps);
    } // Symbol type can be determined in symbolOptions if matched


    if (isSimpleType || !el.type) {
      _symbolHelper["default"].renderSymbol.call(_this2, sbl);
    } // else if (sbl.type === SYMBOL_TYPE.POPUP) {
    //     // TBD
    // }
    // else if (sbl.type === SYMBOL_TYPE.CUSTOM) {
    //     // TBD
    // }
    else {
        log.warn(_gisException.GIS_ERROR.INVALID_TYPE, "".concat(el.id, ": ").concat(el.type), "Please input valid symbol type: ".concat(_lodash["default"].values(_dictionary.SYMBOL_TYPE)));
      } // Clone the props/selectedProps in standard mode
    // This is for switching back to standard style when set layout from 'track' to 'standard'


    if (isPoint) {
      _this2._symbols[el.id]._origProps = _lodash["default"].cloneDeep(_this2._symbols[el.id]._props);
      _this2._symbols[el.id]._origSelectedProps = _lodash["default"].cloneDeep(_this2._symbols[el.id]._selectedProps);
    }
  }); // Create new symbols as virtual ones or update virtual symbols in draw mode


  if (this._map.drawMode.enabled() && this._drawType === 'edit') {
    // Set to other mode also disable the drawMode
    this.setDragMode('pan');
    setTimeout(function () {
      return _this2.setDragMode('draw', _this2._drawType);
    }, 500);
  } // Repaint the map
  // TODO: a better solution?


  this._layout = _dictionary.LAYOUT.STANDARD;

  if (this._tracks) {
    delete this._tracks;
  }

  if (this._heatmap) {
    this._map.hasLayer(this._heatmap) && this._map.removeLayer(this._heatmap);
    delete this._heatmap;
  }

  if (this._contour) {
    this._map.hasLayer(this._contour) && this._map.removeLayer(this._contour);
    delete this._contour;
  }

  if (currLayout !== _dictionary.LAYOUT.STANDARD) {
    this.setLayout(currLayout);
  } // Reset the exclude ids of events


  if (origSymbolCount !== _lodash["default"].keys(this._symbols).length) {
    _lodash["default"].forEach(this._eventMap, function (evt) {
      if (evt.exclude) {
        evt.excludeIds = _lodash["default"].uniq(_lodash["default"].reduce(evt.exclude, function (acc, excld) {
          return _lodash["default"].concat(acc, _symbolHelper["default"].getSymbol.call(_this2, excld, true, 'id'));
        }, []));
      }
    });
  } // Symbols' cluster or group may be changed


  _collectEmptyClusters.call(this);

  _collectEmptyGroups.call(this);

  _symbolHelper["default"].updateClusterSymbol.call(this);
}
/**
 * Removes symbols which match the filter.
 *
 * @param {String | String[] | Object | Function}   Filter      Filter of symbols to be removed.
 *
 */


function _removeSymbol(filter) {
  var _this3 = this;

  var rmSymbolIds = !_lodash["default"].isFunction(filter) && _lodash["default"].isEmpty(filter) ? [] : _lodash["default"].filter(_symbolHelper["default"].getSymbol.call(this, filter, true, 'id'), function (id) {
    return _this3._symbols[id].type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK;
  });

  if (rmSymbolIds.length > 0) {
    var needClusterCollection = false;
    var needGroupCollection = false;

    _lodash["default"].forEach(rmSymbolIds, function (id) {
      var sblLayer = _this3._symbols[id].layer;
      var group = _this3._symbols[id].props.group;
      var cluster = _this3._symbols[id].props.cluster;
      var isGlobalCluster = cluster === true;

      if (cluster) {
        var clusterLayer = isGlobalCluster ? _this3._gCluster.layer : _this3._clusters[cluster].layer;
        clusterLayer.removeLayer(sblLayer);
        needClusterCollection = clusterLayer.getLayers().length === 0;
      }

      if (_this3._visible[id]) {
        delete _this3._visible[id]; // Removing a layer from layerGroup will also remove from it from map

        if (group) {
          _this3._groups[group].layer.removeLayer(sblLayer);

          _lodash["default"].remove(_this3._groups[group].children, function (sblId) {
            return id === sblId;
          });
        } else {
          _this3._map.removeLayer(sblLayer);
        }
      }

      if (group) {
        needGroupCollection = _this3._groups[group].children.length === 0;
      } // Fix issue #25


      if (_this3._selected[id]) {
        delete _this3._selected[id];
      } // Remove layer from layerGroup won't fire map's removelayer event
      // (we have a removelayer event in map to remove virtual layers)
      // Need directly remove the virtual ones in group


      _this3._map.fire('virtualremove', {
        layer: sblLayer
      });

      delete _this3._symbols[id];
    });

    if (this._heatmap) {
      _renderHelper["default"].renderHeatmap.call(this);
    }

    if (this._tracks) {
      _renderHelper["default"].renderTrack.call(this);
    }

    if (this._contour) {
      _renderHelper["default"].renderContour.call(this);
    } // Reset the exclude ids of events


    _lodash["default"].forEach(this._eventMap, function (evt) {
      if (evt.exclude) {
        evt.excludeIds = _lodash["default"].uniq(_lodash["default"].reduce(evt.exclude, function (acc, excld) {
          return _lodash["default"].concat(acc, _symbolHelper["default"].getSymbol.call(_this3, excld, true, 'id'));
        }, []));
      }
    }); // Empty clusters/groups collection


    needClusterCollection && _collectEmptyClusters.call(this);
    needGroupCollection && _collectEmptyGroups.call(this);

    _symbolHelper["default"].updateClusterSymbol.call(this);
  }
}

var _default = {
  _setSymbol: _setSymbol,
  _removeSymbol: _removeSymbol
};
exports["default"] = _default;
//# sourceMappingURL=symbol.js.map