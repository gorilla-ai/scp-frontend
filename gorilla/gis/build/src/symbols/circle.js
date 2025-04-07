"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _leaflet = _interopRequireDefault(require("leaflet"));

require("leaflet-semicircle");

var im = _interopRequireWildcard(require("object-path-immutable"));

var _symbol = _interopRequireDefault(require("./symbol"));

var _dictionary = require("../consts/dictionary");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

var log = require('loglevel').getLogger('gis/symbols/circle');
/**
 * A Circle symbol, inherits from class Symbol.
 *
 * @see     Symbol
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/circle.md
 *
 * @class
 * @param {String}  id              The circle symbol id.
 * @param {Object}  props           The properties of the circle.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */


var Circle = /*#__PURE__*/function (_GisSymbol) {
  _inherits(Circle, _GisSymbol);

  var _super = _createSuper(Circle);

  function Circle(id, props, selected, selectedProps) {
    _classCallCheck(this, Circle);

    return _super.call(this, id, 'circle', props, selected, selectedProps); // supported props other than leaflet options: tooltip, popup, latlng
  }
  /*
   * Sets the start angle for circle.
   * This can change the shape to semi or full circle.
   * Notice that this only changes the leaflet layer; symbol props will be unchanged.
   *
   * @param {Number} degree   The start angle in degree
   *
   * @return {this}
   */


  _createClass(Circle, [{
    key: "setStartAngle",
    value: function setStartAngle(degree) {
      var angle = this._convertToPositiveAngle(degree);

      this._layer.setStartAngle(angle);

      return this;
    }
    /*
     * Sets the stop angle for circle.
     * This can change the shape to semi or full circle.
     * Notice that this only changes the leaflet layer; symbol props will be unchanged.
     *
     * @param {Number} degree   The stop angle in degree
     *
     * @return {this}
     */

  }, {
    key: "setStopAngle",
    value: function setStopAngle(degree) {
      var angle = this._convertToPositiveAngle(degree);

      this._layer.setStopAngle(angle);

      return this;
    }
    /*
     * Sets the startAngle to (direction - (0.5*size)) and the stopAngle to (direction + (0.5*size)).
     * Notice that this only changes the leaflet layer; symbol props will be unchanged.
     *
     * @param {Number} direction   The intermediate angle in degree between start and stop angle.
     * @param {Number} size        The angle in degree of the fan will be.
     *
     * @return {this}
     */

  }, {
    key: "setDirection",
    value: function setDirection(direction, size) {
      this._layer.setDirection(direction, size);

      return this;
    }
    /*
     * Filters the circle props.
     *
     * @param {Object} initProps   The input props.
     *
     * @return {Object}            The filtered props of circle.
     */

  }, {
    key: "_getInitialStyle",
    value: function _getInitialStyle(initProps) {
      return (0, _lodash["default"])(initProps).pick(_dictionary.STYLE_DICT).set('radius', initProps.radius).set('startAngle', initProps.startAngle).set('stopAngle', initProps.stopAngle).omit(_lodash["default"].isNil).value();
    }
    /*
     * Creates the leaflet circle instance.
     *
     * @param {Object} props       The circle props.
     *
     * @return {L.Circle}          The created leaflet circle instance.
     */

  }, {
    key: "_createLayer",
    value: function _createLayer(props) {
      // Correct the angles
      var initProps = this._correctAngleProps(props);

      var options = this._getInitialStyle(initProps);

      this._layer = _leaflet["default"].semiCircle(initProps.latlng, options);
      return this._layer;
    }
    /*
     * Updates the leaflet circle instance.
     *
     * @param {Object} prevProps   The original props.
     * @param {Object} nextProps   The new props to apply.
     *
     * @return {L.Circle}          The updated leaflet circle instance.
     */

  }, {
    key: "_updateLayer",
    value: function _updateLayer(prevProps, nextProps) {
      // Correct the angles
      var fixNextProps = this._correctAngleProps(nextProps); // Props like radius, tooltip, popup, and label, can't be set by setStyle


      var style = _lodash["default"].pick(fixNextProps, _dictionary.STYLE_DICT); // Set the location


      if (fixNextProps.latlng && !_lodash["default"].isEqual(prevProps.latlng, fixNextProps.latlng)) {
        this._layer.setLatLng(fixNextProps.latlng);
      }

      if (!_lodash["default"].isEmpty(style)) {
        this._layer.setStyle(style);
      } // Set circle radius


      if (!_lodash["default"].isNil(fixNextProps.radius)) {
        this._layer.setRadius(fixNextProps.radius);
      } // Set circle angle


      if (!_lodash["default"].isNil(fixNextProps.startAngle)) {
        this._layer.setStartAngle(fixNextProps.startAngle);
      }

      if (!_lodash["default"].isNil(fixNextProps.stopAngle)) {
        this._layer.setStopAngle(fixNextProps.stopAngle);
      } // Set tooltip


      if (!_lodash["default"].isNil(this._props.tooltip) && !_lodash["default"].isNil(fixNextProps.tooltip)) {
        this._updateInfo(_dictionary.INFO_TYPE.TOOLTIP, _lodash["default"].merge({}, this._props.tooltip, nextProps.tooltip));
      } // Set popup


      if (!_lodash["default"].isNil(this._props.popup) && !_lodash["default"].isNil(fixNextProps.popup)) {
        this._updateInfo(_dictionary.INFO_TYPE.POPUP, _lodash["default"].merge({}, this._props.popup, nextProps.popup));
      }

      return this._layer;
    }
    /*
     * Normalizes the input angle within [0, 360].
     *
     * @param {Number} degree   The angle in degree.
     *
     * @return {Number}         The normalized angle in degree.
     */

  }, {
    key: "_convertToPositiveAngle",
    value: function _convertToPositiveAngle(degree) {
      var angle = degree % 360 < 0 ? degree % 360 + 360 : degree % 360;
      return angle;
    }
    /*
     * Normalizes the start and stop angle within [0, 360] if circle props contains one of them.
     *
     * @param {Object} props   The circle props.
     *
     * @return {Object}        The circle props with normalized start & stop angles.
     */

  }, {
    key: "_correctAngleProps",
    value: function _correctAngleProps(props) {
      if (!_lodash["default"].isNil(props.startAngle) && _lodash["default"].isNumber(props.startAngle)) {
        props = im.set(props, 'startAngle', this._convertToPositiveAngle(props.startAngle));
      }

      if (!_lodash["default"].isNil(props.stopAngle) && _lodash["default"].isNumber(props.stopAngle)) {
        props = im.set(props, 'stopAngle', this._convertToPositiveAngle(props.stopAngle));
      }

      return props;
    }
  }]);

  return Circle;
}(_symbol["default"]);

var _default = Circle;
exports["default"] = _default;
//# sourceMappingURL=circle.js.map