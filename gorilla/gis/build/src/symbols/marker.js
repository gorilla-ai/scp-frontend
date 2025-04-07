"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _classnames = _interopRequireDefault(require("classnames"));

var _leaflet = _interopRequireDefault(require("leaflet"));

var _markerIcon = _interopRequireDefault(require("leaflet/dist/images/marker-icon.png"));

var _symbol = _interopRequireDefault(require("./symbol"));

var _dictionary = require("../consts/dictionary");

var _style = require("../consts/style");

var _gisException = require("../utils/gis-exception");

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

var log = require('loglevel').getLogger('gis/symbols/marker');

var OPTION_DICT = ['icon', 'draggable', 'keyboard', 'title', 'alt', 'zIndexOffset', 'opacity', 'riseOnHover', 'riseOffset', 'pane'];
var STYLE_DICT = ['iconUrl', 'iconRetinaUrl', 'iconSize', 'iconAnchor', 'popupAnchor', 'tooltipAnchor', 'shadowUrl', 'shadowRetinaUrl', 'shadowSize', 'shadowAnchor', 'className', 'rotation'];
/**
 * A Marker symbol, inherits from class Symbol.
 *
 * @see     Symbol
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/marker.md
 *
 * @class
 * @param {String}  id              The marker symbol id.
 * @param {Object}  props           The properties of the marker.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */

var Marker = /*#__PURE__*/function (_GisSymbol) {
  _inherits(Marker, _GisSymbol);

  var _super = _createSuper(Marker);

  function Marker(id, props, selected, selectedProps) {
    _classCallCheck(this, Marker);

    return _super.call(this, id, 'marker', props, selected, selectedProps); // supported props other than leaflet options: tooltip, popup, latlng, label, icon
  }
  /*
   * Creates/Updates the leaflet marker instance.
   *
   * @param {Object}  props           The marker props.
   * @param {Boolean} selected        Selected status.
   * @param {Boolean} selectedProps   Props to apply when selected.
   *
   * @return {L.Marker}               The leaflet marker instance.
   */


  _createClass(Marker, [{
    key: "setLayer",
    value: function setLayer(props) {
      var selected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._selected;
      var selectedProps = arguments.length > 2 ? arguments[2] : undefined;
      var newProps = selected ? _lodash["default"].merge({}, _style.DEFAULT_MARKER_STYLE, this._props, props, this._selectedProps, selectedProps) : _lodash["default"].merge({}, _style.DEFAULT_MARKER_STYLE, this._props, props);
      var mergeClass = (0, _classnames["default"])('gis-marker', 'gis-divIcon', {
        'gis-truncated-labels': !!this._props._truncateLabels,
        'gis-whole-label': _lodash["default"].get(this._props, '_truncateLabels.shownOnHover', true),
        selected: selected,
        'js-top-layer': selected
      }, props.className || '', newProps.className || '');

      var className = _lodash["default"].chain(mergeClass).split(' ').uniq().join(' ').value();

      newProps.className = className; // Labels may be shown only when selected

      if (!selected && !props.label) {
        _lodash["default"].set(newProps, 'label', {
          content: '',
          className: ''
        });
      }

      if (!this._layer) {
        this._layer = this._createLayer(newProps);
      } else if (this._layer && !_lodash["default"].isEqual(this.currentProps, newProps)) {
        this._layer = this._updateLayer(this.currentProps, newProps);
      }

      return this._layer;
    }
    /*
     * Creates/updates tooltip/popup/label of symbol
     *
     * @param {String}                       type           Info type, which is 'tooltip', 'popup', or 'label'.
     * @param {String | Object | Function}   info           Info content.
     *
     */

  }, {
    key: "setInfo",
    value: function setInfo(type, info) {
      if (_lodash["default"].includes([_dictionary.INFO_TYPE.TOOLTIP, _dictionary.INFO_TYPE.POPUP], type)) {
        var hasInfo = !_lodash["default"].isNil(this._layer["get".concat(_lodash["default"].upperFirst(type))]());

        if (!hasInfo) {
          this._createInfo(type, info);
        } else {
          this._updateInfo(type, this.currentProps[type], info);
        }
      } else if (type === _dictionary.INFO_TYPE.LABEL) {
        this._setLabel(info);
      } else {
        log.warn(_gisException.GIS_ERROR.INVALID_TYPE, type, 'The info type should be "tooltip", "popup", or "label" for Marker');
      }
    }
    /*
     * Creates Leaflet marker layer instance.
     *
     * @param {Object}  props   Marker props.
     *
     */

  }, {
    key: "_createLayer",
    value: function _createLayer(props) {
      this._setLabel(props.label);

      this._setSign(_objectSpread(_objectSpread({}, props.icon), {}, {
        className: props.className
      }));

      var options = _lodash["default"].pick(props, OPTION_DICT);

      var divIcon = _leaflet["default"].divIcon(_lodash["default"].omit(this._icon, 'rotation'));

      this._layer = _leaflet["default"].marker(props.latlng, _objectSpread(_objectSpread({}, options), {}, {
        icon: divIcon
      }));
      return this._layer;
    }
    /*
     * Updates the Leaflet marker instance.
     *
     * @param {Object}  prevProps   Original marker props.
     * @param {Object}  nextProps   New marker props.
     *
     */

  }, {
    key: "_updateLayer",
    value: function _updateLayer(prevProps, nextProps) {
      var _this = this;

      if (!_lodash["default"].isEqual(prevProps, nextProps)) {
        // Set the location
        if (!_lodash["default"].isEqual(prevProps.latlng, nextProps.latlng)) {
          this._layer.setLatLng(nextProps.latlng);
        } // Need to update label or not


        if (!_lodash["default"].isNil(nextProps.label)) {
          this._setLabel(nextProps.label);
        } // Update marker if nextProps icon or label is not null


        if (!_lodash["default"].isNil(nextProps.icon) || !_lodash["default"].isNil(nextProps.label)) {
          this._setSign(_objectSpread(_objectSpread({}, nextProps.icon), {}, {
            className: nextProps.className
          })); // this._layer.setIcon(L.divIcon(this._icon))


          if (this._setIcon) {
            clearTimeout(this._setIcon);
          }
          /*
              The reason we need to delay the change is to make 'dblclick' work.
              L.Marker.setIcon() seems recreating the icon which makes 'dblclick' failed
          */


          this._setIcon = setTimeout(function () {
            _this._layer.setIcon(_leaflet["default"].divIcon(_lodash["default"].omit(_this._icon, 'rotation')));

            _this._addDrawClass();
          }, 200);
        }

        if (this._props.tooltip && !_lodash["default"].isNil(nextProps.tooltip)) {
          this._updateInfo(_dictionary.INFO_TYPE.TOOLTIP, prevProps.tooltip, nextProps.tooltip);
        }

        if (this._props.popup && !_lodash["default"].isNil(nextProps.popup)) {
          this._updateInfo(_dictionary.INFO_TYPE.POPUP, prevProps.popup, nextProps.popup);
        }
      }

      return this._layer;
    }
    /*
     * Sets the marker label.
     *
     * @param {Object}  [info={content:'', className:''}]   Label config object.
     *
     */

  }, {
    key: "_setLabel",
    value: function _setLabel() {
      var info = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        content: '',
        className: ''
      };

      var content = _lodash["default"].get(info, 'content', _lodash["default"].get(this._label, 'content', ''));

      var className = _lodash["default"].get(info, 'className', _lodash["default"].get(this._label, 'className', ''));

      this._label = {
        content: content,
        className: className
      };
    }
    /*
     * Creates/updates marker icon.
     *
     * @param {Object}  item    The icon props, which is retrieved from marker props.
     *
     */

  }, {
    key: "_setSign",
    value: function _setSign() {
      var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _lodash["default"].cloneDeep(_style.DEFAULT_MARKER_STYLE);
      var _this$_label = this._label,
          content = _this$_label.content,
          labelClass = _this$_label.className;

      var icon = _objectSpread(_objectSpread(_objectSpread({}, _style.DEFAULT_MARKER_STYLE.icon), this._icon), _lodash["default"].pick(item, STYLE_DICT)); // Fix/Enhance for issue #4, #20

      /*
          TODO: Enhancement. Restrict the size and use 'enlarge' prop to control size
          The default size is 30*30?
      */


      var width = icon.iconSize[0];
      var height = icon.iconSize[1];
      var rotation = icon.rotation;

      if (!icon.iconUrl) {
        _lodash["default"].set(icon, 'iconUrl', _markerIcon["default"]);
      }

      icon.html = "<img src=\"".concat(icon.iconUrl, "\" \n                        width=\"").concat(width, "\" \n                        height=\"").concat(height, "\" \n                        style=\"transform:rotate(").concat(rotation, "deg)\">") + "<span class=\"".concat((0, _classnames["default"])('gis-label', labelClass), "\">").concat(content, "</span>");
      this._icon = icon;
    }
    /*
     * Adds leaflet.draw className when GIS is under draw mode if the marker is editable.
     */

  }, {
    key: "_addDrawClass",
    value: function _addDrawClass() {
      // Only works for drawn symbol
      if (!this._isDrawn || !this._layer._map) {
        return;
      } // Add leaflet.draw class for draw mode


      var shouldSetDrawClass = this._layer._map.getContainer().classList.contains('gis-draw') && this._isDrawn && !this._layer._icon.classList.contains('leaflet-edit-marker-selected');

      if (shouldSetDrawClass) {
        this._layer._icon.classList.add('leaflet-edit-marker-selected');
      }
    }
  }]);

  return Marker;
}(_symbol["default"]);

var _default = Marker;
exports["default"] = _default;
//# sourceMappingURL=marker.js.map