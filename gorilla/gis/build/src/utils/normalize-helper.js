"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeRenderable = normalizeRenderable;
exports.normalizeClassname = normalizeClassname;
exports.normalizeIcon = normalizeIcon;
exports.normalizeInfo = normalizeInfo;
exports.normalizeTrack = normalizeTrack;
exports["default"] = normalizeProps;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SPECIAL = ['className', 'tooltip', 'popup', 'label', 'icon'];
var RENDERABLES = ['tooltip', 'popup', 'label', 'icon', 'track', 'cluster', 'group', 'type']; // For tooltip/popup/label/icon/track/cluster/group which is a function

function normalizeRenderable(symbolData) {
  var srcProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var srcSelectedProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var tgtProps = _lodash["default"].cloneDeep(srcProps);

  var tgtSelected = _lodash["default"].cloneDeep(srcSelectedProps);

  var setRenderable = function setRenderable(src, key, _ref) {
    var id = _ref.id,
        type = _ref.type,
        props = _ref.props,
        selected = _ref.selected,
        selectedProps = _ref.selectedProps;
    // 'type' may be from 'props' because it may be defined in symbolOptions, not symbol data itself
    var result = _lodash["default"].isFunction(src[key]) ? src[key](_objectSpread(_objectSpread({
      id: id,
      type: type || props.type
    }, props), {}, {
      selected: selected,
      selectedProps: selectedProps
    })) : null; // Only normalize the prop when src[key] returns a String, or a Boolean for cluster/group

    var shouldNormalize = _lodash["default"].isString(result) || _lodash["default"].isPlainObject(result) && !_lodash["default"].includes(['track', 'cluster', 'group', 'type'], key) || (key === 'cluster' || key === 'group') && _lodash["default"].isBoolean(result);

    if (shouldNormalize) {
      _lodash["default"].set(src, key, result);
    }
  };

  _lodash["default"].forEach(RENDERABLES, function (prop) {
    setRenderable(tgtProps, prop, symbolData);
    setRenderable(tgtSelected, prop, symbolData);
  });

  return {
    props: tgtProps,
    selectedProps: tgtSelected
  };
}
/* Argument is an array of symbol props.className */


function normalizeClassname(srcClasses) {
  var classNames = [];

  if (_lodash["default"].isString(srcClasses)) {
    classNames = srcClasses.replace(/\s{2,}/g, ' ').split(' ');
  } else if (_lodash["default"].isArray(srcClasses) && srcClasses.length === 0 || !srcClasses) {
    return null;
  } else if (_lodash["default"].isArray(srcClasses) && srcClasses.length > 0) {
    classNames = _lodash["default"].reduce(srcClasses, function (acc, el) {
      el && acc.push(el.replace(/\s{2,}/g, ' '));
      return acc;
    }, []);
  }

  return _lodash["default"].chain(classNames).uniq().join(' ').value();
}
/* Argument is a symbol object */


function normalizeIcon(icons) {
  if (_lodash["default"].isEmpty(icons) || !icons) {
    return {};
  }

  var result = _lodash["default"].reduce(icons, function (acc, el) {
    if (_lodash["default"].isString(el) && !acc.iconUrl) {
      acc.iconUrl = el;
      return acc;
    }

    if (_lodash["default"].isString(el)) {
      acc.iconUrl = el;
    } else if (_lodash["default"].isPlainObject(el)) {
      acc = _objectSpread(_objectSpread({}, acc), el);
    }

    return acc;
  }, {});

  return result;
}
/* Argument is a symbol object and type of info, including 'tooltip', 'popup' and 'label' */


function normalizeInfo(infos, typeOfInfo) {
  if (_lodash["default"].isEmpty(infos) || !infos) {
    return typeOfInfo === 'label' ? {
      content: '',
      className: ''
    } : null;
  }

  var result = _lodash["default"].reduce(infos, function (acc, el) {
    if ((_lodash["default"].isString(el) || _lodash["default"].isElement(el)) && !acc.content) {
      acc.content = el;
      return acc;
    }

    if (_lodash["default"].isString(el) || _lodash["default"].isElement(el)) {
      acc.content = el;
    } else if (_lodash["default"].isPlainObject(el)) {
      acc = _objectSpread(_objectSpread({}, acc), el); // 'label' may have 'html' key

      acc.content = acc.html || acc.content || '';
      delete acc.html;
    }

    return acc;
  }, {});

  return result.content && !_lodash["default"].isEmpty(result.content) ? result : null;
}

function normalizeTrack(tracks) {}
/* Arguments are symbol id, type, and an array of symbol props/selectedProps */


function normalizeProps(sources) {
  if (_lodash["default"].isArray(sources) && sources.length === 0) {
    return {};
  }

  var result = _lodash["default"].mergeWith.apply(_lodash["default"], [{}].concat(_toConsumableArray(sources), [function (objVal, srcVal, key) {
    if (key === 'className' && srcVal) {
      var srcStr = srcVal.replace(/\s{2,}/g, ' ').split(' ');
      objVal = objVal || [];
      objVal = _lodash["default"].concat(objVal, srcStr);
      return objVal;
    } else if (_lodash["default"].includes(SPECIAL, key)) {
      objVal = objVal || [];
      objVal.push(srcVal);
      return objVal;
    }
  }]));

  _lodash["default"].set(result, 'className', normalizeClassname(result.className));

  _lodash["default"].set(result, 'tooltip', normalizeInfo(result.tooltip, 'tooltip'));

  _lodash["default"].set(result, 'popup', normalizeInfo(result.popup, 'popup')); // For markers and spots


  if (result.icon || result.label) {
    _lodash["default"].set(result, 'icon', normalizeIcon(result.icon));

    _lodash["default"].set(result, 'label', normalizeInfo(result.label, 'label'));
  }

  return _lodash["default"].omitBy(result, _lodash["default"].isNil);
}
//# sourceMappingURL=normalize-helper.js.map