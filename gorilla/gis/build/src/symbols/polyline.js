"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _leaflet = _interopRequireDefault(require("leaflet"));

require("leaflet-polylinedecorator");

var _symbol = _interopRequireDefault(require("./symbol"));

var _dictionary = require("../consts/dictionary");

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

var log = require('loglevel').getLogger('gis/symbols/polyline');

var DEFAULT_PATTERN = {
  offset: '100%',
  repeat: 0,
  sign: {
    type: 'arrow',
    pixelSize: 15,
    polygon: false
  }
};
/**
 * A Polyline symbol, inherits from class Symbol.
 *
 * @see     Symbol
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/polyline.md
 *
 * @class
 * @param {String}  id              The polyline symbol id.
 * @param {Object}  props           The properties of the polyline.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */

var Polyline = /*#__PURE__*/function (_GisSymbol) {
  _inherits(Polyline, _GisSymbol);

  var _super = _createSuper(Polyline);

  function Polyline(id, props, selected, selectedProps) {
    _classCallCheck(this, Polyline);

    return _super.call(this, id, 'polyline', props, selected, selectedProps); // supported props other than leaflet options: tooltip, popup, latlng, label, icon
  }
  /*
   * Forms the patterns props according to polyline props.
   *
   * @param {Object} props    The polyline props.
   *
   * @return {Object[]}       The props of patterns.
   */


  _createClass(Polyline, [{
    key: "_getPatterns",
    value: function _getPatterns(props) {
      var _this = this;

      var options = this._getInitialStyle(props);

      var decorator = null;
      this._patterns = [];

      if (_lodash["default"].isEmpty(props.patterns)) {
        var pattern = _objectSpread(_objectSpread({}, _lodash["default"].omit(DEFAULT_PATTERN, 'sign')), {}, {
          symbol: _objectSpread(_objectSpread({}, DEFAULT_PATTERN.sign), {}, {
            pathOptions: _lodash["default"].merge({}, options, DEFAULT_PATTERN.sign.pathOptions)
          })
        });

        decorator = [_objectSpread(_objectSpread({}, _lodash["default"].omit(pattern, 'symbol')), {}, {
          symbol: _leaflet["default"].Symbol.arrowHead(pattern.symbol)
        })];

        this._patterns.push(pattern);
      } else {
        decorator = _lodash["default"].map(props.patterns, function (el) {
          var sign = _lodash["default"].isNil(el.sign) ? _lodash["default"].omit(DEFAULT_PATTERN.sign, 'type') : _lodash["default"].omit(el.sign, 'type');
          var type = _lodash["default"].isNil(el.sign) || _lodash["default"].isNil(el.sign.type) ? DEFAULT_PATTERN.sign.type : el.sign.type;
          var pattern = null;
          var patternOpt = null;

          if (type === 'arrow' || type !== 'marker') {
            patternOpt = _objectSpread(_objectSpread({}, sign), {}, {
              pathOptions: _lodash["default"].merge({}, options, sign.pathOptions)
            });

            _lodash["default"].set(patternOpt, 'pathOptions.pane', _dictionary.TRACK_PANE);

            pattern = _leaflet["default"].Symbol.arrowHead(patternOpt);

            if (!_lodash["default"].includes(['arrow', 'marker'], type)) {
              log.warn(_gisException.GIS_ERROR.INVALID_TYPE, type, 'The directed polyline pattern type should be \'arrow\' or \'marker\'');
            }
          } else if (type === 'marker') {
            patternOpt = _lodash["default"].cloneDeep(sign);

            _lodash["default"].set(patternOpt, 'pane', _dictionary.TRACK_PANE);

            pattern = _leaflet["default"].Symbol.marker(patternOpt);
          }

          _this._patterns.push(_objectSpread(_objectSpread({}, _lodash["default"].pick(el, ['offset', 'endOffset', 'repeat'])), {}, {
            symbol: patternOpt
          }));

          return _objectSpread(_objectSpread({}, _lodash["default"].pick(el, ['offset', 'endOffset', 'repeat'])), {}, {
            symbol: pattern
          });
        });
      }

      return decorator;
    }
    /*
     * Creates the leaflet polyline instance; if directed, create a leaflet feature group store all separated lines and pattern.
     *
     * @param {Object} props                    The polyline props.
     *
     * @return {L.Polyline | L.FeatureGroup}    The created leaflet polyline instance; if directed, return the leaflet feature group instance.
     */

  }, {
    key: "_createLayer",
    value: function _createLayer(props) {
      var _this2 = this;

      var options = this._getInitialStyle(props);

      this._layer = _leaflet["default"].polyline(props.latlng, options); // Fix issue #11. Add default pattern

      if (props.directed) {
        var patterns = this._getPatterns(props); // Make the sign(e.g., arrow) shown beside each symbol


        var polylines = [];
        var decorators = [];

        _lodash["default"].forEach(this._props.latlng, function (el, idx, clct) {
          if (idx < clct.length - 1) {
            var layer = _leaflet["default"].polyline([el, clct[idx + 1]], options);

            polylines.push(layer);
            decorators.push(_leaflet["default"].polylineDecorator(layer, {
              patterns: patterns
            }));
          }
        });

        this._decorator = decorators; // Fix issue #8. Use featureGroup to group polyline and decorator so that it can bind events

        this._layer = _leaflet["default"].featureGroup(_lodash["default"].concat(polylines, decorators)); // Make the _eventCore can catch the symbol id if polyline layer is featureGroup

        this._layer.eachLayer(function (lyr) {
          lyr._gis_id = _this2._id;
        });
      }

      return this._layer;
    }
    /*
     * Updates the leaflet polyline/featureGroup instance.
     * If polyline symbol is directed, new props, e.g., color, will apply to all separated lines and patterns.
     *
     * @param {Object} prevProps                The original props.
     * @param {Object} mextProps                The new props to apply.
     *
     * @return {L.Polyline | L.FeatureGroup}    The updated leaflet polyline/featureGroup instance.
     */

  }, {
    key: "_updateLayer",
    value: function _updateLayer(prevProps, nextProps) {
      // Props like tooltip, popup, and label, can't be set by setStyle
      var style = _lodash["default"].pick(nextProps, _dictionary.STYLE_DICT);

      if (!_lodash["default"].isEmpty(style)) {
        // Fix issue #11
        if (!this._props.directed) {
          // Set the location
          if (!_lodash["default"].isEqual(prevProps.latlng, nextProps.latlng)) {
            this._layer.setLatLngs(nextProps.latlng);
          }

          this._layer.setStyle(style);
        } else {
          var patterns = this._getPatterns(nextProps);

          this._layer.eachLayer(function (lyr) {
            if (!_lodash["default"].isEqual(prevProps.latlng, nextProps.latlng)) {
              if (lyr instanceof _leaflet["default"].Polyline) {
                lyr.setLatLngs(nextProps.latlng);
              } else if (lyr instanceof _leaflet["default"].PolylineDecorator) {
                lyr.setPaths(nextProps.latlng);
              }
            }

            if (lyr instanceof _leaflet["default"].Polyline) {
              lyr.setStyle(style);
            }
          });

          _lodash["default"].forEach(this._decorator, function (el) {
            el.setPatterns(patterns);
          });
        }
      } // Set tooltip


      if (!_lodash["default"].isNil(this._props.tooltip) && !_lodash["default"].isNil(nextProps.tooltip)) {
        this._updateInfo(_dictionary.INFO_TYPE.TOOLTIP, prevProps.tooltip, nextProps.tooltip);
      } // Set popup


      if (!_lodash["default"].isNil(this._props.popup) && !_lodash["default"].isNil(nextProps.popup)) {
        this.setInfo(_dictionary.INFO_TYPE.POPUP, nextProps.popup);
      }

      return this._layer;
    }
  }]);

  return Polyline;
}(_symbol["default"]);

var _default = Polyline;
exports["default"] = _default;
//# sourceMappingURL=polyline.js.map