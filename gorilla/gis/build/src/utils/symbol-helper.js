"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSymbol = getSymbol;
exports.getDeepestDom = getDeepestDom;
exports.getTrackInstance = getTrackInstance;
exports.renderSymbol = renderSymbol;
exports.updateClusterSymbol = updateClusterSymbol;
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _dataHelper = require("./data-helper");

var _renderHelper = require("./render-helper");

var _mergeHelper = require("./merge-helper");

var _gisException = require("./gis-exception");

var _marker = _interopRequireDefault(require("../symbols/marker"));

var _spot = _interopRequireDefault(require("../symbols/spot"));

var _polyline = _interopRequireDefault(require("../symbols/polyline"));

var _polygon = _interopRequireDefault(require("../symbols/polygon"));

var _rectangle = _interopRequireDefault(require("../symbols/rectangle"));

var _circle = _interopRequireDefault(require("../symbols/circle"));

var _geojson = _interopRequireDefault(require("../symbols/geojson"));

var _dictionary = require("../consts/dictionary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var log = require('loglevel').getLogger('gis/utils/symbol-helper');

var CREATOR = {
  // POPUP: GisPopup,
  MARKER: _marker["default"],
  SPOT: _spot["default"],
  POLYLINE: _polyline["default"],
  POLYGON: _polygon["default"],
  RECTANGLE: _rectangle["default"],
  CIRCLE: _circle["default"],
  GEOJSON: _geojson["default"]
};
/**
 * Creates a new symbol on the map
 *
 * @param {Object} item     The symbol raw data
 */

function _createSymbol(item) {
  if (this._symbols[item.id]) {
    log.warn(_gisException.GIS_ERROR.INVALID_ID, item.id, "".concat(item.type, " ").concat(item.id, " which Id duplicates, please rename it"));
    return;
  }

  var map = this._map;
  var symbolObj = (0, _dataHelper.convertRawDataToSymbolObj)(item);
  var mergedProps = {};
  var sMergedProps = {};

  _lodash["default"].forEach(this._symbolOptions, function (opt) {
    if (!opt.match || (0, _dataHelper.isMatch)(item, opt.match)) {
      mergedProps = (0, _mergeHelper.mergeProps)(symbolObj, [mergedProps, opt.props]);
      sMergedProps = (0, _mergeHelper.mergeProps)(symbolObj, [sMergedProps, opt.selectedProps]);
    }
  });

  mergedProps = (0, _mergeHelper.mergeProps)(symbolObj, [mergedProps, symbolObj.props]);
  sMergedProps = (0, _mergeHelper.mergeProps)(symbolObj, [sMergedProps, symbolObj.selectedProps]);
  symbolObj = _objectSpread(_objectSpread({}, symbolObj), {}, {
    type: symbolObj.type || mergedProps.type,
    props: _lodash["default"].omit(mergedProps, 'type'),
    selectedProps: sMergedProps,
    selected: symbolObj.selected || false
  });

  if (!symbolObj.type) {
    log.warn(_gisException.GIS_ERROR.INVALID_TYPE, "".concat(symbolObj.id, ": ").concat(symbolObj.type), 'Please set valid symbol type in input data or symbolOptions.props');
    return;
  } // const {id, type, props, selected, selectedProps} = convertRawDataToSymbolObj(itemToCvt)


  var _symbolObj = symbolObj,
      id = _symbolObj.id,
      type = _symbolObj.type,
      props = _symbolObj.props,
      selected = _symbolObj.selected,
      selectedProps = _symbolObj.selectedProps; // TBD: How to handle custom symbol?

  var NewSymbol = CREATOR[_lodash["default"].toUpper(type)];

  var symbol = type !== _dictionary.SYMBOL_TYPE.CUSTOM ? new NewSymbol(id, props, selected, selectedProps) : new CREATOR.MARKER(id, props, selected, selectedProps); // Bind tooltip to layer

  if (!_lodash["default"].isEmpty(props.tooltip)) {
    var tooltip = selected ? selectedProps.tooltip || props.tooltip : props.tooltip;
    symbol.setInfo('tooltip', tooltip);
  } // Bind popup to layer


  if (!_lodash["default"].isEmpty(props.popup)) {
    symbol.setInfo('popup', props.popup);
  }

  this._symbols[id] = symbol;
  this._visible[id] = true;

  if (symbol.isSelected()) {
    this._selected[id] = true;
  }

  if (!_lodash["default"].includes(['marker', 'spot'], type)) {
    symbol.layer.addTo(map);
  } else {
    var clusterId = props.cluster;

    if (clusterId) {
      // Check the cluster exist or not. If not, create one
      var isNotExit = !_lodash["default"].isBoolean(clusterId) && !this._clusters[clusterId] || clusterId === true && !this._gCluster;

      if (isNotExit) {
        var options = _lodash["default"].chain(this._clusterOptions).filter(function (el) {
          return el.id === clusterId || !el.id;
        }).reduce(function (acc, el) {
          return _lodash["default"].merge(acc, el);
        }, {}).value();

        _renderHelper.renderCluster.call(this, clusterId, options, clusterId === true ? {} : symbol._icon);
      } // Add to global cluster when cluster is set as *true*


      if (clusterId === true) {
        this._gCluster.layer.addLayer(symbol.layer);
      } else {
        this._clusters[clusterId].layer.addLayer(symbol.layer);
      }
    } else {
      symbol.layer.addTo(map);
    }
  } // Group symbols if group is specified


  if (props.group) {
    var groupId = props.group;

    if (!this._groups[groupId]) {
      _renderHelper.renderGroup.call(this, groupId);
    }
    /*
      If a clustered symbol is added to layerGroup, it will keep on the map with layerGroup.
      This makes cluster meaningless
    */


    this._groups[groupId].children.push(symbol.id);

    if (!symbol.props.cluster) {
      this._groups[groupId].layer.addLayer(symbol.layer);
    }
  }
}
/**
 * Updates the target symbol. The id & type should match the existed symbol.
 *
 * @param {Object} item     The symbol data (GIS formatted, that is, symbol features should be contained in the key "props").
 */


function _updateSymbol(item) {
  var map = this._map; // const symbol = _.cloneDeep(this._symbols[item.id])

  var symbol = this._symbols[item.id];
  var symbolObj = {
    id: symbol.id,
    type: symbol.type,
    selected: symbol.selected,
    selectedProps: symbol.selectedProps,
    props: symbol.props
  };

  var _convertRawDataToSymb = (0, _dataHelper.convertRawDataToSymbolObj)(item),
      props = _convertRawDataToSymb.props,
      selected = _convertRawDataToSymb.selected,
      selectedProps = _convertRawDataToSymb.selectedProps;

  var mergedProps = (0, _mergeHelper.mergeProps)(symbolObj, [symbol.props, props]);
  var sMergedProps = (0, _mergeHelper.mergeProps)(symbolObj, [symbol.selectedProps, selectedProps]);
  symbol.set(mergedProps, selected, sMergedProps); // Set cluster/group if changed

  if (mergedProps.cluster !== symbol.props.cluster) {
    var clusterId = mergedProps.cluster;
    var origCluster = symbol.props.cluster;
    /*
      If map.hasLayer(cluster layer), map is under standard mode.
      This means cluster is visible on the map.
    */

    var hasClusterLyr = _lodash["default"].isBoolean(symbol.props.cluster) ? symbol.props.cluster ? map.hasLayer(this._gCluster.layer) : false : map.hasLayer(this._clusters[origCluster].layer);

    if (_lodash["default"].isBoolean(clusterId)) {
      // Remove from cluster when new props is *false*
      if (!clusterId) {
        this._clusters[origCluster] && this._clusters[origCluster].layer.removeLayer(symbol.layer); // Add the symbol to map if it's visible on the map

        hasClusterLyr && this._visible[symbol.id] && map.addLayer(symbol.layer);
      } // Add to default cluster
      else {
          var options = _lodash["default"].chain(this._clusterOptions).filter(function (el) {
            return !el.id;
          }).reduce(function (acc, el) {
            return _lodash["default"].merge(acc, el);
          }, {}).value(); // Create it if global cluster is not exist


          if (!this._gCluster) {
            _renderHelper.renderCluster.call(this, true, options);
          }

          hasClusterLyr && this._visible[symbol.id] && this._gCluster.layer.addLayer(symbol.layer);
        }
    } // Create a new cluster
    else if (clusterId && !this._clusters[clusterId]) {
        var _options = _lodash["default"].chain(this._clusterOptions).filter(function (el) {
          return el.id === clusterId || !el.id;
        }).reduce(function (acc, el) {
          return _lodash["default"].merge(acc, el);
        }, {}).value();

        _renderHelper.renderCluster.call(this, clusterId, _options, symbol._icon);

        this._clusters[clusterId].layer.addLayer(symbol.layer);
      } // Move the cluster to the other one, or add to a cluster
      else if (clusterId && this._clusters[clusterId]) {
          this._clusters[origCluster] && this._clusters[origCluster].layer.removeLayer(symbol.layer);

          this._clusters[clusterId].layer.addLayer(symbol.layer);
        }
  }

  if (mergedProps.group !== symbol.props.group) {
    var groupId = mergedProps.group;
    var origGroup = symbol.props.group; // Remove from group when new props is undefined or null

    if (groupId === false && this._groups[origGroup]) {
      this._groups[origGroup].layer.removeLayer(symbol.layer);

      _lodash["default"].remove(this._groups[origGroup].children, function (id) {
        return id === symbol.id;
      });
    } // Create a new group
    else if (groupId && !this._groups[groupId]) {
        _renderHelper.renderGroup.call(this, groupId);

        this._groups[groupId].children.push(symbol.id);

        !symbol.props.cluster && this._groups[groupId].layer.addLayer(symbol.layer);
      } // Move the group to the other one, or add to a group
      else if (groupId && this._groups[groupId]) {
          this._groups[origGroup] && this._groups[origGroup].layer.removeLayer(symbol.layer);
          this._groups[origGroup] && _lodash["default"].remove(this._groups[origGroup].children, function (id) {
            return id === symbol.id;
          });

          this._groups[groupId].children.push(symbol.id);

          !symbol.props.cluster && this._groups[groupId].layer.addLayer(symbol.layer);
        }
  }
}
/**
 * Gets symbols' instances or raw data according to given filter.
 *
 * @param {String | String[] | Object | Function | undefined | null} filter                 Filter to get the symbols. If it's a String or String[], find symbols by ids; if it's a Object, searches symbols by all the attributes in symbols; if it's a Function, filters symbols by the given callback(Symbol symbol, String id, Object gis._symbols)
 * @param {Boolean}                                                  [ifOutputData=false]   Output as raw data or not.
 * @param {String | String[] | undefined}                            [path=undefined]       Which keys should be output? Works when ifOutputData=true. If it's a String, returns a array of value of symbol[path]; if it's a String[], returns a symbol data object with target fields(path); if it's undefined, returns all the fields of the symbol
 *
 * @return {Symbol[] | type[] | Object[]}  The filtered symbol data
 */


function getSymbol(filter) {
  var ifOutputData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  var symbols = this._symbols;
  var refined = [];

  if (_lodash["default"].isString(filter)) {
    // Use id to find
    refined = _lodash["default"].filter(symbols, function (_ref) {
      var id = _ref.id;
      return id === filter;
    });
  } else if (_lodash["default"].isArray(filter) && filter.length > 0) {
    // Use ids[] to find
    var ids = _lodash["default"].reduce(filter, function (acc, id) {
      acc[id] = id;
      return acc;
    }, {}); // refined = _.filter(symbols, el => _.includes(filter, el.id))


    refined = _lodash["default"].filter(symbols, function (el) {
      return !!ids[el.id];
    });
  } else if (_lodash["default"].isPlainObject(filter)) {
    // Use attributes, like id/type/props/... to find
    // Apr 26, 2018 Update: Filter can directly set 'data' key as rule, like {id, data:{....}}
    // May 21, 2018 Update: Filter can directly set 'group' key as rule, like {id, group, data:{....}}
    var transformed = filter.data || filter.group ? _objectSpread(_objectSpread({}, _lodash["default"].omit(filter, ['data', 'group'])), {}, {
      props: _objectSpread(_objectSpread({}, _lodash["default"].get(filter, 'props', {})), {}, {
        data: _lodash["default"].get(filter, 'data'),
        group: _lodash["default"].get(filter, 'group')
      })
    }) : filter;
    transformed.props = _lodash["default"].omitBy(transformed.props, _lodash["default"].isNil);
    refined = _lodash["default"].filter(symbols, function (el) {
      return _lodash["default"].isMatch(el, transformed);
    });
  } else if (_lodash["default"].isFunction(filter)) {
    // Use filter function to find, with parameters, such as id, props, type, etc.
    refined = _lodash["default"].filter(symbols, function (el, key) {
      return filter(el, key, symbols);
    });
  } else if (_lodash["default"].isNil(filter) || _lodash["default"].isEmpty(filter)) {
    refined = _lodash["default"].toArray(symbols);
  } else {
    log.warn(_gisException.GIS_ERROR.INVALID_ARGS, filter, 'Filter should be String, String[], Object, or Function');
    return [];
  } // Convert refined symbols to text data when ifOutputData is given


  if (ifOutputData && refined.length > 0) {
    var data = [];

    if (_lodash["default"].isString(path)) {
      data = _lodash["default"].map(refined, function (el) {
        return _lodash["default"].get(el, path);
      });
    } else if (_lodash["default"].isArray(path)) {
      data = _lodash["default"].map(refined, function (el) {
        return _lodash["default"].reduce(path, function (result, p) {
          var val = _lodash["default"].get(el, p);

          var field = p.replace('props.', '');
          result[field] = val;
          return result;
        }, {});
      });
    } else if (_lodash["default"].isNil(path)) {
      data = _lodash["default"].map(refined, function (_ref2) {
        var id = _ref2.id,
            type = _ref2.type,
            props = _ref2.props,
            selected = _ref2.selected,
            selectedProps = _ref2.selectedProps;
        return _objectSpread({
          id: id,
          type: type,
          selected: selected,
          selectedProps: selectedProps
        }, props);
      });
    } else {
      log.warn(_gisException.GIS_ERROR.INVALID_ARGS, path, 'Path should be a String, String[], or empty');
    }

    return data;
  } else {
    return refined;
  }
}
/**
 * Gets the deepest and the last node within a DOM.
 * If no childNodes is found, return the DOM itself.
 *
 * @param {HTMLElement} targetDom       The target DOM to be tarversed.
 * @param {String}      [selector='*']  Output as raw data or not.
 *
 * @return {HTMLElement}   The deepest node in the target DOM
 */


function getDeepestDom(targetDom) {
  var selector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '*';
  var lowestLevel = 0; // relative lowest depth

  var doms = targetDom.querySelectorAll(selector);

  var deepest = _lodash["default"].reduce(doms, function (acc, elm) {
    var depth = 0; // relative depth

    var el = elm;

    while (el.children.length > 0) {
      depth++;
      el = getDeepestDom(el, '*');
    }

    if (depth >= lowestLevel) {
      acc = el;
      lowestLevel = depth;
    }

    return acc;
  }, targetDom);

  return deepest;
}
/**
 * Gets the Track instances according to filter
 *
 * @param {String | String[] | Object | Function | undefined | null}    filter     Filter to get the tracks. If it's a String or String[], find tracks by ids; if it's a Object, searches tracks by all the attributes in tracks; if it's a Function, filters tracks by the given callback(Symbol track, String id, Object gis._symbols)
 *
 * @return {Object}    All the Track instances matching the filter.
 */


function getTrackInstance(filter) {
  var symbols = getSymbol.call(this, filter);

  var tracks = _lodash["default"].reduce(symbols, function (acc, sbl) {
    if (sbl.type === _dictionary.EXTRA_SYMBOL_TYPE.TRACK) {
      acc[sbl.id] = sbl;
    }

    return acc;
  }, {});

  return tracks;
}
/**
 * Creates or updates the symbol
 *
 * @param {Object} symbol   The symbol raw data.
 *
 */


function renderSymbol(symbol) {
  if (!this._symbols[symbol.id]) {
    _createSymbol.call(this, symbol);
  } else {
    _updateSymbol.call(this, symbol);
  }
}
/**
 * Updates the cluster data when the cluster should change, e.g., zoom in/out to change the cluste data or apperance.
 *
 */


function updateClusterSymbol() {
  var _this = this;

  if (this._layout !== _dictionary.LAYOUT.STANDARD) {
    return;
  }

  if (this._gCluster) {
    this._gCluster.layer.refreshClusters();
  }

  _lodash["default"].forEach(this._clusters, function (cluster) {
    cluster.layer.refreshClusters();
  }); // Update the cluster data


  _lodash["default"].forEach(this._clusterSymbols, function (sbl, id) {
    var childrenIds = _lodash["default"].map(sbl.layer.getAllChildMarkers(), '_gis_id'); // This cluster symbol has no children cluster, or no symbols are clustered under it


    var shouldBeRemoved = sbl.layer._childClusters.length === 0 && childrenIds.length <= 1;

    if (shouldBeRemoved) {
      delete _this._clusterSymbols[id];
    } else {
      sbl._props.data.ids = childrenIds;
      sbl._props.data.count = childrenIds.length;
    }
  });

  this._map.fire('clusterselectionChange');
}

var _default = {
  getSymbol: getSymbol,
  getDeepestDom: getDeepestDom,
  getTrackInstance: getTrackInstance,
  renderSymbol: renderSymbol,
  updateClusterSymbol: updateClusterSymbol
};
exports["default"] = _default;
//# sourceMappingURL=symbol-helper.js.map