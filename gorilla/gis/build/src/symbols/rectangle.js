"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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

var log = require('loglevel').getLogger('gis/symbols/rectangle');
/**
 * A Rectangle symbol, inherits from class Symbol.
 *
 * @see     Symbol
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/rectangle.md
 *
 * @class
 * @param {String}  id              The rectangle symbol id.
 * @param {Object}  props           The properties of the rectangle.
 * @param {Boolean} selected        The selected status.
 * @param {Boolean} selectedProps   Properties will apply when symbol is selected.
 */


var Rectangle = /*#__PURE__*/function (_GisSymbol) {
  _inherits(Rectangle, _GisSymbol);

  var _super = _createSuper(Rectangle);

  function Rectangle(id, props, selected, selectedProps) {
    _classCallCheck(this, Rectangle);

    return _super.call(this, id, 'rectangle', props, selected, selectedProps); // supported props other than leaflet options: tooltip, popup, latlng, label, icon
  }
  /*
   * Creates the leaflet rectangle instance.
   *
   * @param {Object} props       The rectangle props.
   *
   * @return {L.Rectangle}       The created leaflet rectangle instance.
   */


  _createClass(Rectangle, [{
    key: "_createLayer",
    value: function _createLayer(props) {
      var options = this._getInitialStyle(props);

      this._layer = _leaflet["default"].rectangle(props.latlng, options);
      return this._layer;
    }
  }]);

  return Rectangle;
}(_symbol["default"]);

var _default = Rectangle;
exports["default"] = _default;
//# sourceMappingURL=rectangle.js.map