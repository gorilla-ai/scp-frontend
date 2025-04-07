"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

require("leaflet");

require("leaflet-draw");

require("leaflet.markercluster/dist/leaflet.markercluster");

var _events = require("events");

var _setupHelper = require("./utils/setup-helper");

var _gisHelper = require("./utils/gis-helper");

var _symbolHelper = require("./utils/symbol-helper");

var _core = _interopRequireDefault(require("./core"));

var _dictionary = require("./consts/dictionary");

var _css = _interopRequireDefault(require("./css"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Gis = /*#__PURE__*/function (_EventEmitter) {
  _inherits(Gis, _EventEmitter);

  var _super = _createSuper(Gis);

  function Gis(containerId, options, data) {
    var _this;

    _classCallCheck(this, Gis);

    _this = _super.call(this);

    _setupHelper.initialize.call(_assertThisInitialized(_this), containerId, options, data);

    (0, _css["default"])();
    return _this;
  }

  _createClass(Gis, [{
    key: "on",
    value: function on(event, filter, handler) {
      _core["default"].event._on.apply(this, _lodash["default"].filter([event, filter, handler], function (arg) {
        return !!arg;
      }));

      return this;
    }
  }, {
    key: "off",
    value: function off(event, filter, handler) {
      _core["default"].event._off.apply(this, _lodash["default"].filter([event, filter, handler], function (arg) {
        return !!arg;
      }));

      return this;
    }
  }, {
    key: "getMap",
    value: function getMap() {
      return this._map;
    } // Get symbols matching the filter, and output symbols as plain Object instead of Symbol class.

  }, {
    key: "getSymbol",
    value: function getSymbol(filter) {
      var symbols = _symbolHelper.getSymbol.call(this, filter, true);

      var filtered = _lodash["default"].filter(symbols, function (sbl) {
        return sbl.type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK;
      }); // Fix issue #27


      if (_lodash["default"].isString(filter)) {
        return filtered[0] || null;
      }

      return filtered;
    }
  }, {
    key: "getSelection",
    value: function getSelection() {
      return _lodash["default"].keys(_lodash["default"].pickBy(this._selected, function (el) {
        return el;
      }));
    } // Get the distance of the path.

  }, {
    key: "getDistance",
    value: function getDistance(latlngs) {
      return (0, _gisHelper.getPathDistance)(latlngs, this._map.options.crs);
    } // All symbols, including _track or _cluster can also be selected

  }, {
    key: "setSelection",
    value: function setSelection(filter) {
      var symbols = _objectSpread(_objectSpread({}, this._symbols), this._flags);

      var selection = _lodash["default"].isEmpty(filter) && !_lodash["default"].isFunction(filter) ? {} : _lodash["default"].reduce(_symbolHelper.getSymbol.call({
        _symbols: _objectSpread(_objectSpread({}, this._symbols), this._flags)
      }, filter, true, 'id'), function (acc, id) {
        acc[id] = true;
        return acc;
      }, {});

      _lodash["default"].forEach(symbols, function (el) {
        var isSelected = !!selection[el.id];

        if (isSelected !== el.isSelected()) {
          el.setSelected(isSelected);
        }
      }); // Trigger selectionChange when selected are not the same


      if (!_lodash["default"].isEqual(this._selected, selection)) {
        this._selected = selection; // isMultiple is a signal to pass selected ids argument in handler

        this._map.fire('selectionChange', {
          isMultiple: true
        }).fire('clusterselectionChange');
      }

      return this;
    }
  }, {
    key: "setImageOverlay",
    value: function setImageOverlay(overlays) {
      _core["default"].image._setImageOverlay.call(this, overlays);

      return this;
    } // TODO: other crs passed?

  }, {
    key: "setMaxBounds",
    value: function setMaxBounds(corner1, corner2) {
      var fitBounds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      _core["default"].map._setMaxBounds.call(this, corner1, corner2, fitBounds);

      return this;
    }
  }, {
    key: "setLayout",
    value: function setLayout(layout) {
      _core["default"].map._setLayout.call(this, layout);

      return this;
    }
  }, {
    key: "setDragMode",
    value: function setDragMode(dragMode) {
      var regionType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _dictionary.REGION_TYPE.RECTANGLE;
      var drawConfig = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      _core["default"].map._setDragMode.call(this, dragMode, regionType, drawConfig);

      return this;
    }
  }, {
    key: "setRegionType",
    value: function setRegionType(regionType) {
      _core["default"].map._setRegionType.call(this, regionType);

      return this;
    }
  }, {
    key: "setDrawType",
    value: function setDrawType(drawType) {
      var drawConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _core["default"].map._setDrawType.call(this, drawType, drawConfig);

      return this;
    }
  }, {
    key: "setGisInterval",
    value: function setGisInterval(interval) {
      _core["default"].map._setGisInterval.call(this, interval);

      return this;
    }
  }, {
    key: "setSymbol",
    value: function setSymbol(symbols) {
      _core["default"].symbol._setSymbol.call(this, symbols);

      return this;
    }
  }, {
    key: "setHeatmap",
    value: function setHeatmap(options) {
      _core["default"].heatmap._setHeatmap.call(this, options);

      return this;
    }
    /*
      Modify the track's path is not allowed here.
      To modify it, need to modify the symbols' positions
    */

  }, {
    key: "setTrack",
    value: function setTrack(tracks) {
      _core["default"].track._setTrack.call(this, tracks);

      return this;
    } // Enhancement for issue #7

  }, {
    key: "zoomToFit",
    value: function zoomToFit(filter) {
      _core["default"].map._zoomToFit.call(this, filter);

      return this;
    }
  }, {
    key: "clear",
    value: function clear() {
      _core["default"].map._clear.call(this);

      return this;
    } // TBD: functionalities of show/hide/filter overlaye?

  }, {
    key: "removeImageOverlay",
    value: function removeImageOverlay(filter) {
      _core["default"].image._removeImageOverlay.call(this, filter);

      return this;
    }
  }, {
    key: "removeSymbol",
    value: function removeSymbol(filter) {
      _core["default"].symbol._removeSymbol.call(this, filter);

      return this;
    } // Checks whether the symbol exists or not.

  }, {
    key: "exists",
    value: function exists(id) {
      return !!this._symbols[id];
    }
  }, {
    key: "showSymbol",
    value: function showSymbol(filter) {
      var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      _core["default"].filter._showSymbol.call(this, filter, interval);

      return this;
    }
  }, {
    key: "hideSymbol",
    value: function hideSymbol(filter) {
      var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      _core["default"].filter._hideSymbol.call(this, filter, interval);

      return this;
    }
  }, {
    key: "filterSymbol",
    value: function filterSymbol(filter) {
      var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var dt = new Date().valueOf();

      _core["default"].filter._filterSymbol.call(this, filter, interval);

      console.error('Time: ', new Date().valueOf() - dt);
      return this;
    }
  }, {
    key: "showTrack",
    value: function showTrack(filter) {
      _core["default"].track._showTrack.call(this, filter);

      return this;
    }
  }, {
    key: "hideTrack",
    value: function hideTrack(filter) {
      _core["default"].track._hideTrack.call(this, filter);

      return this;
    }
  }, {
    key: "filterTrack",
    value: function filterTrack(filter) {
      _core["default"].track._filterTrack.call(this, filter);

      return this;
    }
  }, {
    key: "map",
    get: function get() {
      return this._map;
    }
  }, {
    key: "heatmap",
    get: function get() {
      return this._heatmap;
    } // Get tracks' layers (leaflet polyline instance)

  }, {
    key: "tracks",
    get: function get() {
      var _this2 = this;

      return _lodash["default"].map(this._tracks, function (id) {
        return _this2._symbols[id].layer;
      });
    }
  }, {
    key: "contour",
    get: function get() {
      return this._contour;
    }
  }, {
    key: "symbols",
    get: function get() {
      // Should only return standard or drawn symbols
      return _lodash["default"].reduce(this._symbols, function (acc, sbl, id) {
        var shouldPick = sbl.type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK;

        if (shouldPick) {
          acc[id] = sbl;
        }

        return acc;
      }, {});
    } // Get drawn symbols

  }, {
    key: "drawn",
    get: function get() {
      return _lodash["default"].reduce(this._symbols, function (acc, sbl, id) {
        // _isDrawn is set in the drawMode plugin. See createDrawHandler() in plugins/modes
        if (sbl._isDrawn) {
          acc[id] = sbl;
        }

        return acc;
      }, {});
    } // Get selected symbols' ids

  }, {
    key: "selected",
    get: function get() {
      return _lodash["default"].keys(_lodash["default"].pickBy(this._selected, function (selected) {
        return selected;
      }));
    } // Get visible symbols' ids

  }, {
    key: "visible",
    get: function get() {
      var _this3 = this;

      // Should only return standard or drawn symbols
      return _lodash["default"].keys(_lodash["default"].pickBy(this._visible, function (visible, id) {
        return visible && _this3._symbols[id].type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK;
      }));
    }
  }, {
    key: "interval",
    get: function get() {
      return this._interval;
    }
  }, {
    key: "imageOverlays",
    get: function get() {
      return _lodash["default"].map(this._overlays, function (el) {
        return _lodash["default"].omit(el, 'layer');
      });
    }
  }]);

  return Gis;
}(_events.EventEmitter);

var _default = Gis;
exports["default"] = _default;
//# sourceMappingURL=gis.js.map