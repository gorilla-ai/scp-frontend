"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeProps = mergeProps;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/**
 * This is for merging global and local symbolProps or trackProps. Only object-props will be merged here,
 * As for other props, the former ones will be replaced by the later ones if they have different type.
 * E.g.,
 * {heatmap:{radisu:100}} and {heatmap:{intensity:0.5}} will merge as {heatmap:{radisu: 100,intensity:0.5}}
 * while {heatmap:{radisu:100}} and {heatmap:true} will merge as {heatmap:true} because the inputs have different type,
 * later props heatmap replace the former one
 *
 * @param {Object} props    Props to be merged with.
 * @param {Object} sources  All source props.
 *
 * @return {Object}    The merged props
 */
function mergeProps(_ref, sources) {
  var symbolProps = _ref.props,
      symbolData = _objectWithoutProperties(_ref, ["props"]);

  if (_lodash["default"].isArray(sources) && sources.length === 0) {
    return {};
  }

  var props = _lodash["default"].mergeWith.apply(_lodash["default"], [{}].concat(_toConsumableArray(sources), [function (objVal, srcVal, key) {
    if (key === 'className' && srcVal) {
      var srcStr = srcVal.replace(/\s{2,}/g, ' ').split(' ');
      objVal = objVal || [];
      objVal = _lodash["default"].concat(objVal, srcStr);
      return objVal;
    } else if (_lodash["default"].isPlainObject(objVal) && _lodash["default"].isPlainObject(srcVal)) {
      return _objectSpread(_objectSpread({}, objVal), srcVal);
    } else {
      return _lodash["default"].isBoolean(srcVal) ? srcVal : srcVal || objVal;
    }
  }]));

  if (props.className) {
    props.className = _lodash["default"].chain(props.className).uniq().join(' ').value();
  }

  _lodash["default"].forEach(props, function (prop, key) {
    if (_lodash["default"].isFunction(prop)) {
      props[key] = prop(_objectSpread(_objectSpread({}, symbolData), symbolProps));
    }
  }); // These four types of props will be normalized as object here
  // icon will become { iconUrl:'...' } and label/tooltip/popup will be {content:'...'}


  _lodash["default"].forEach(['label', 'tooltip', 'popup', 'icon'], function (propKey) {
    if (props[propKey] && !_lodash["default"].isPlainObject(props[propKey])) {
      props[propKey] = propKey === 'icon' ? {
        iconUrl: props[propKey]
      } : {
        content: props[propKey]
      };
    }
  });

  return _lodash["default"].omitBy(props, _lodash["default"].isNil);
}
//# sourceMappingURL=merge-helper.js.map