"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _classnames = _interopRequireDefault(require("classnames"));

var _leaflet = _interopRequireDefault(require("leaflet"));

var _marker = _interopRequireDefault(require("./marker"));

var _dictionary = require("../consts/dictionary");

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

// const log = require('loglevel').getLogger('gis/symbols/spot');
var OPTION_DICT = ['draggable', 'keyboard', 'title', 'zIndexOffset', 'opacity', 'riseOnHover', 'riseOffset', 'pane'];
var ALIEN_ATTR = ['latlng', 'className', 'data', 'selectedProps', 'tooltip', 'popup', 'heatmap', 'type', 'selected', 'smoothFactor', 'noClip', 'patterns', 'directed', 'icon', 'label', 'radius', 'track', 'ts', 'cluster', 'group'];
/**
 * A Spot symbol, inherits from class Marker.
 *
 * @see     Symbol and Marker
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/marker.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/spot.md
 *
 * @class
 * @param {String}  id              The spot symbol id.
 * @param {Object}  props           The properties of the spot.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */

var Spot = /*#__PURE__*/function (_Marker) {
  _inherits(Spot, _Marker);

  var _super = _createSuper(Spot);

  function Spot(id, props, selected, selectedProps) {
    var _this;

    _classCallCheck(this, Spot);

    _this = _super.call(this, id, props, selected, selectedProps);
    _this._type = 'spot';
    return _this;
  }
  /*
   * Creates/Updates the leaflet marker instance, which icon is a dot.
   *
   * @param {Object}  props           The marker props.
   * @param {Boolean} selected        Selected status.
   * @param {Boolean} selectedProps   Props to apply when selected.
   *
   * @return {L.Marker}               The leaflet marker instance.
   */


  _createClass(Spot, [{
    key: "setLayer",
    value: function setLayer(props) {
      var selected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._selected;
      var selectedProps = arguments.length > 2 ? arguments[2] : undefined;
      var newProps = selected ? _lodash["default"].merge({}, this._props, props, this._selectedProps, selectedProps) : _lodash["default"].merge({}, this._props, props);
      var mergeClass = (0, _classnames["default"])('gis-spot', 'gis-divIcon', {
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
     * Creates Leaflet marker layer instance.
     *
     * @param {Object}  props   Spot props.
     *
     */

  }, {
    key: "_createLayer",
    value: function _createLayer(props) {
      this._setLabel(props.label);

      this._setSign(_objectSpread(_objectSpread({}, _lodash["default"].omit(props, _lodash["default"].concat(ALIEN_ATTR, OPTION_DICT))), {}, {
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
     * Updates the Leaflet marker layer instance.
     *
     * @param {Object}  prevProps   Original spot props.
     * @param {Object}  nextProps   New spot props.
     *
     */

  }, {
    key: "_updateLayer",
    value: function _updateLayer(prevProps, nextProps) {
      var _this2 = this;

      if (!_lodash["default"].isEqual(prevProps, nextProps)) {
        // Set the location
        if (!_lodash["default"].isEqual(prevProps.latlng, nextProps.latlng)) {
          this._layer.setLatLng(nextProps.latlng);
        } // Need to update label or not


        if (!_lodash["default"].isNil(nextProps.label)) {
          this._setLabel(nextProps.label);
        } // Update spot


        if (!_lodash["default"].isNil(nextProps)) {
          this._setSign(_objectSpread(_objectSpread({}, _lodash["default"].omit(nextProps, _lodash["default"].concat(ALIEN_ATTR, OPTION_DICT))), {}, {
            className: nextProps.className
          })); // this._layer.setIcon(L.divIcon(this._icon))


          if (this._setIcon) {
            clearTimeout(this._setIcon);
          }

          this._setIcon = setTimeout(function () {
            _this2._layer.setIcon(_leaflet["default"].divIcon(_lodash["default"].omit(_this2._icon, 'rotation')));

            _this2._addDrawClass();
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
     * Creates/updates spot DOM.
     *
     * @param {Object}  item    The icon props, which is retrieved from spot props.
     *
     */

  }, {
    key: "_setSign",
    value: function _setSign(item) {
      var _this$_label = this._label,
          content = _this$_label.content,
          labelClass = _this$_label.className;

      var rotation = _lodash["default"].get(item, 'rotation', 0);

      var spot = _objectSpread(_objectSpread(_objectSpread({}, this._icon), _lodash["default"].omit(item, ['rotation', 'spotOpacity'])), {}, {
        width: _lodash["default"].get(item, 'width', '15px'),
        height: _lodash["default"].get(item, 'height', '15px'),
        opacity: _lodash["default"].get(item, 'spotOpacity', 1)
      });

      var p = _objectSpread(_objectSpread({}, _lodash["default"].omit(spot, ['html', 'className', '_truncateLabels', 'iconAnchor', 'iconSize', 'id', 'isOngoingNode', 'renderCount'])), {}, {
        transform: "rotate(".concat(rotation, "deg)")
      });

      var camelCaseToDash = function camelCaseToDash(str) {
        return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
      };

      var styleString = '';
      Object.keys(p).forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(p, key)) {
          styleString += "".concat(camelCaseToDash(key), ":").concat(p[key], ";");
        }
      }); // Try not to use external library
      // _.forOwn(p, (val, key) => { str += key + ':' + val + ';' })

      if (!_lodash["default"].has(spot, 'renderCount')) {
        spot.html = "<div class=\"gis-spot\" style=\"".concat(styleString, "\"></div><span class=\"").concat((0, _classnames["default"])('gis-label', labelClass), "\">").concat(content, "</span>");
      } else {
        spot.html = "<div class=\"gis-spot center-text\" style=\"".concat(styleString, "\"><span class=\"").concat((0, _classnames["default"])('gis-label', labelClass), "\">").concat(content, "</span></div>");
      }

      spot.iconAnchor = _lodash["default"].get(item, 'iconAnchor', [parseInt(spot.width, 10) / 2, parseInt(spot.height, 10) / 2]);
      spot.height = 'auto';
      spot.iconSize = _lodash["default"].get(item, 'iconSize', [parseInt(spot.width, 10), parseInt(spot.height, 10)]);
      this._icon = spot;
    }
  }]);

  return Spot;
}(_marker["default"]);

var _default = Spot;
exports["default"] = _default;
//# sourceMappingURL=spot.js.map