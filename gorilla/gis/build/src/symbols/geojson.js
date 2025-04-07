"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _leaflet = _interopRequireDefault(require("leaflet"));

var _symbol = _interopRequireDefault(require("./symbol"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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

var log = require('loglevel').getLogger('gis/symbols/geojson');
/**
 * A GeoJson symbol, inherits from class Symbol.
 * GeoJson symbol is a collection of features, e.g., marker, polygon, rectangle.
 * Each props will apply to all features in this collection.
 *
 * @see     Symbol
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/geojson.md
 *
 * @class
 * @param {String}  id              The geojson symbol id.
 * @param {Object}  props           The properties of the geojson.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */


var GeoJSON = /*#__PURE__*/function (_GisSymbol) {
  _inherits(GeoJSON, _GisSymbol);

  var _super = _createSuper(GeoJSON);

  function GeoJSON(id, props, selected, selectedProps) {
    _classCallCheck(this, GeoJSON);

    return _super.call(this, id, 'geojson', props, selected, selectedProps); // supported props other than leaflet options: tooltip, popup, latlng, label, icon
  }
  /*
   * Creates the leaflet geojson instance.
   *
   * @param {Object} props       The geojson props.
   *
   * @return {L.GeoJson}         The created leaflet geojson instance.
   */


  _createClass(GeoJSON, [{
    key: "_createLayer",
    value: function _createLayer(props) {
      var _this = this;

      var pointToLayer = function pointToLayer(feature, latlng) {
        return _leaflet["default"].circleMarker(latlng, {
          className: 'gis-point'
        });
      }; // Fix issue #30


      var style = function style() {
        return this._getInitialStyle(props);
      }.bind(this); // Set the default geojson point as a small steelblue circle


      this._layer = _leaflet["default"].geoJSON(props.geojson, {
        pointToLayer: pointToLayer,
        style: style
      }); // Make the _eventCore can catch the symbol id

      this._layer.eachLayer(function (lyr) {
        if (lyr.feature.geometry.type.indexOf('Collection') > -1) {
          _lodash["default"].forEach(lyr.getLayers(), function (l) {
            l._gis_id = _this._id;
          });
        } else {
          lyr._gis_id = _this._id;
        }
      });

      return this._layer;
    }
  }]);

  return GeoJSON;
}(_symbol["default"]);

var _default = GeoJSON;
exports["default"] = _default;
//# sourceMappingURL=geojson.js.map