"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _leaflet = _interopRequireDefault(require("leaflet"));

var _classnames = _interopRequireDefault(require("classnames"));

var _dictionary = require("../consts/dictionary");

var _style = require("../consts/style");

var _gisException = require("../utils/gis-exception");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var log = require('loglevel').getLogger('gis/symbols/symbol');
/**
 * A GIS base module, which displays a feature on the map.
 *
 * @class
 * @param {String}  id              The symbol id.
 * @param {Object}  props           The properties of the symbol.
 * @param {Boolean} selected=false  The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 *
 */


var GisSymbol = /*#__PURE__*/function () {
  function GisSymbol(id, type, props) {
    var selected = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var selectedProps = arguments.length > 4 ? arguments[4] : undefined;

    _classCallCheck(this, GisSymbol);

    this._id = id;
    this._type = type;
    this._props = props;
    this._selected = selected;
    this._selectedProps = selectedProps;
    this._layer = this.setLayer(props, selected, selectedProps);
    this._layer.id = "".concat(id, "_layer");
    this._layer._gis_id = id;
  }
  /*
   * Gets the symbol's id.
   *
   * @return {String}               The symbol's id.
   */


  _createClass(GisSymbol, [{
    key: "isSelected",

    /*
     * Gets the symbol's selected status.
     *
     * @return {Boolean}               The symbol's selected status.
     */
    value: function isSelected() {
      return this._selected;
    }
    /*
     * Sets symbol's selected status.
     *
     */

  }, {
    key: "setSelected",
    value: function setSelected() {
      var selected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._selected;
      selected !== this._selected && this.set(this._props, selected, this._selectedProps);
    }
    /*
     * Sets symbol's props and selectedProps.
     * Original ones will be merged into new ones.
     * @see function set(props, selected, selectedProps)
     *
     * @param {Object}  props           The symbol's props.
     * @param {Object}  selectedProps   The symbol's selectedProps.
     *
     */

  }, {
    key: "setProps",
    value: function setProps(props, selectedProps) {
      this.set(props, this._selected, selectedProps);
    }
    /*
     * Sets symbol's props, selected status and selectedProps.
     * Original ones will be merged into new ones.
     *
     * @param {Object}  props           The symbol's props.
     * @param {Boolean} selected        The selected status.
     * @param {Object}  selectedProps   The symbol's selectedProps.
     *
     */

  }, {
    key: "set",
    value: function set(props) {
      var selected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._selected;
      var selectedProps = arguments.length > 2 ? arguments[2] : undefined;
      this.setLayer(props, selected, selectedProps);
      this._props = _lodash["default"].merge({}, this._props, props);
      this._selected = selected;
      this._selectedProps = _lodash["default"].merge({}, this._selectedProps, selectedProps);
    }
    /*
     * Sets symbol's Leaflet layer instance according to props, selected and selectedProps.
     *
     * @param {Object}  props           The symbol's props.
     * @param {Boolean} selected        The selected status.
     * @param {Object}  selectedProps   The symbol's selectedProps.
     *
     * @return {Leaflet layer}          The symbol's Leaflet layer instance.
     *
     */

  }, {
    key: "setLayer",
    value: function setLayer(props) {
      var _cx;

      var selected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._selected;
      var selectedProps = arguments.length > 2 ? arguments[2] : undefined;

      // Polyline's fill prop is set false by default in leaflet
      var defaultStyle = _objectSpread(_objectSpread({}, _style.DEFAULT_SYMBOL_STYLE), {}, {
        fill: this._type !== _dictionary.SYMBOL_TYPE.POLYLINE && this._type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK
      });

      var defaultSltStyle = _objectSpread(_objectSpread({}, _style.DEFAULT_SYMBOL_SLT_STYLE), {}, {
        fill: this._type !== _dictionary.SYMBOL_TYPE.POLYLINE && this._type !== _dictionary.EXTRA_SYMBOL_TYPE.TRACK
      }); // Fix issue #21


      var latlng = selectedProps ? selectedProps.latlng || this._selectedProps.latlng || props.latlng || this._props.latlng : props.latlng || this._props.latlng;
      var newProps = selected ? (0, _lodash["default"])({}).merge(defaultStyle, this._props, props, defaultSltStyle, this._selectedProps, selectedProps).set('latlng', latlng).omitBy(_lodash["default"].isNil).value() : _lodash["default"].merge({}, defaultStyle, props);
      /*
          Normalize the className
          Besides props.className, add default className `gis-${this._type}` to symbols
      */

      var className = _lodash["default"].chain((0, _classnames["default"])("gis-".concat(this._type), (_cx = {}, _defineProperty(_cx, "gis-".concat(this._origType), !!this._origType), _defineProperty(_cx, "selected", selected), _cx), props.className || '', newProps.className || '')).split(' ').uniq().join(' ').value();

      newProps.className = className;

      if (!this._layer) {
        this._layer = this._createLayer(newProps);
      } else if (this._layer && !_lodash["default"].isEqual(this.currentProps, newProps)) {
        this._layer = this._updateLayer(this.currentProps, newProps);
      } // Bring selected symbols to top


      if (selected) {
        // this._layer._mapToAdd is for checking the layer is on the map
        this._layer._mapToAdd && this._layer.bringToFront();
      } // Add class 'selected' to symbols when selected


      if (this._layer._mapToAdd) {
        var toggleClassFunc = selected ? _leaflet["default"].DomUtil.addClass : _leaflet["default"].DomUtil.removeClass;
        var isGeoJSON = this._layer instanceof _leaflet["default"].GeoJSON;
        var isDirected = (this._type === _dictionary.SYMBOL_TYPE.POLYLINE || this._type === _dictionary.EXTRA_SYMBOL_TYPE.TRACK) && this._props.directed;

        if (isGeoJSON) {
          this._layer.eachLayer(function (lyr) {
            _lodash["default"].forEach(lyr._layers, function (l) {
              toggleClassFunc(l._path, 'selected');
            });
          });
        } else if (isDirected) {
          this._layer.eachLayer(function (lyr) {
            if (lyr instanceof _leaflet["default"].Polyline) {
              toggleClassFunc(lyr._path, 'selected');
            } // Patterns are nested groups
            else {
                lyr.eachLayer(function (lg) {
                  lg.eachLayer(function (l) {
                    l.eachLayer(function (p) {
                      toggleClassFunc(p._path, 'selected');
                    });
                  });
                });
              }
          });
        } else {
          toggleClassFunc(this._layer._path, 'selected');
        }
      }

      return this._layer;
    }
    /*
     * Creates/updates tooltip/popup of symbol.
     *
     * @param {String}                       type           Info type, which is 'tooltip' or 'popup'.
     * @param {String | Object | Function}   info           Info content.
     *
     */

  }, {
    key: "setInfo",
    value: function setInfo(type, info) {
      if (_lodash["default"].includes(_dictionary.INFO_TYPE, type)) {
        var hasInfo = !_lodash["default"].isNil(this._layer["get".concat(_lodash["default"].upperFirst(type))]());

        if (!hasInfo) {
          this._createInfo(type, info);
        } else {
          this._updateInfo(type, _lodash["default"].merge({}, this.currentProps[type], info));
        }
      } else {
        log.warn(_gisException.GIS_ERROR.INVALID_TYPE, type, "The info type should be \"".concat(_dictionary.SYMBOL_TYPE.TOOLTIP, "\", or \"").concat(_dictionary.SYMBOL_TYPE.POPUP, "\""));
      }
    }
    /*
     * Picks the valid style props.
     *
     * @param {Object}   initProps           The symbol's initial props.
     *
     */

  }, {
    key: "_getInitialStyle",
    value: function _getInitialStyle(initProps) {
      return _lodash["default"].pick(initProps, _dictionary.STYLE_DICT);
    }
    /*
     * Creates the Leaflet layer instance.
     *
     * @param {Object}   newProps           The symbol's props.
     *
     */

  }, {
    key: "_createLayer",
    value: function _createLayer(newProps) {
      var layer = null;
      return layer;
    }
    /*
     * Updates the Leaflet layer instance.
     *
     * @param {Object}   prevProps           The symbol's original props.
     * @param {Object}   nextProps           The symbol's new props.
     *
     * @return {Leaflet layer}               Updated layer instance.
     *
     */

  }, {
    key: "_updateLayer",
    value: function _updateLayer(prevProps, nextProps) {
      // Props like tooltip, popup, can't be set by setStyle
      var style = _lodash["default"].pick(nextProps, _dictionary.STYLE_DICT); // Set the location


      if (nextProps.latlng && !_lodash["default"].isEqual(prevProps.latlng, nextProps.latlng)) {
        this._layer.setLatLngs(nextProps.latlng);
      }

      if (!_lodash["default"].isNil(style)) {
        this._layer.setStyle(style);
      }

      if (!_lodash["default"].isNil(this._props.tooltip) && !_lodash["default"].isNil(nextProps.tooltip)) {
        this._updateInfo(_dictionary.INFO_TYPE.TOOLTIP, _lodash["default"].merge({}, this._props.tooltip, nextProps.tooltip));
      }

      if (!_lodash["default"].isNil(this._props.popup) && !_lodash["default"].isNil(nextProps.popup)) {
        this._updateInfo(_dictionary.INFO_TYPE.POPUP, _lodash["default"].merge({}, this._props.popup, nextProps.popup));
      }

      return this._layer;
    }
    /*
     * Binds tooltip or popup to symbol Leaflet layer instance.
     *
     * @param {String}   type           The info's type, which is tooltip or popup.
     * @param {Object}   infoConfig     The info's config.
     *
     */

  }, {
    key: "_createInfo",
    value: function _createInfo(type, _ref) {
      var content = _ref.content,
          options = _objectWithoutProperties(_ref, ["content"]);

      this._layer["bind".concat(_lodash["default"].upperFirst(type))](content, options);
    }
    /*
     * Updates tooltip or popup of the symbol Leaflet layer instance.
     *
     * @param {String}   type           The info's type, which is tooltip or popup.
     * @param {Object}   infoConfig     The info's new config.
     *
     */

  }, {
    key: "_updateInfo",
    value: function _updateInfo(type, _ref2) {
      var content = _ref2.content,
          options = _objectWithoutProperties(_ref2, ["content"]);

      var info = _leaflet["default"][type](options).setContent(content);

      this._layer["unbind".concat(_lodash["default"].upperFirst(type))]();

      this._layer["bind".concat(_lodash["default"].upperFirst(type))](info);
    }
  }, {
    key: "id",
    get: function get() {
      return this._id;
    }
    /*
     * Gets the symbol's type.
     *
     * @return {String}               The symbol's type.
     */

  }, {
    key: "type",
    get: function get() {
      return this._type;
    }
    /*
     * Gets the symbol's props.
     *
     * @return {Object}               The symbol's props.
     */

  }, {
    key: "props",
    get: function get() {
      return this._props;
    }
    /*
     * Gets the symbol's selected status.
     *
     * @return {Boolean}               The symbol's selected status.
     */

  }, {
    key: "selected",
    get: function get() {
      return this._selected;
    }
    /*
     * Gets the symbol's selected props.
     *
     * @return {Object}               The symbol's selected props.
     */

  }, {
    key: "selectedProps",
    get: function get() {
      return this._selectedProps;
    }
    /*
     * Gets the symbol's current props, which may be props merged with selectedProps when selected.
     *
     * @return {Object}               The symbol's current props.
     */

  }, {
    key: "currentProps",
    get: function get() {
      var latlng = this._selectedProps ? this._selectedProps.latlng || this._props.latlng : this._props.latlng;
      return this._selected ? _lodash["default"].chain({}).merge(this._props, this._selectedProps).set('latlng', latlng).value() : this._props;
    }
    /*
     * Gets the symbol's leaflet layer instance.
     *
     * @return {Lefalet layer}               The symbol's Leaflet layer instance.
     */

  }, {
    key: "layer",
    get: function get() {
      return this._layer;
    }
  }]);

  return GisSymbol;
}();

var _default = GisSymbol;
exports["default"] = _default;
//# sourceMappingURL=symbol.js.map