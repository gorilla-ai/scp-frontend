"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_CONTOUR_STYLE = exports.DEFAULT_PATTERN_STYLE = exports.DEFAULT_TRACK_SLT_STYLE = exports.DEFAULT_TRACK_STYLE = exports.DEFAULT_MARKER_STYLE = exports.DEFAULT_SYMBOL_SLT_STYLE = exports.DEFAULT_SYMBOL_STYLE = exports.DEFAULT_REGION_STYLE = exports.DEFAULT_HEATMAP_STYLE = void 0;

var _markerIcon = _interopRequireDefault(require("leaflet/dist/images/marker-icon.png"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DEFAULT_HEATMAP_STYLE = {
  // radius should be small ONLY if scaleRadius is true (or small radius is intended)
  // if scaleRadius is false it will be the constant radius used in pixels
  // unit of radius is 100 miles
  radius: 1,
  maxOpacity: 0.8,
  minOpacity: 0,
  blur: 0.85,
  // scales the radius based on map zoom
  scaleRadius: true,
  // if set to false the heatmap uses the global maximum for colorization
  // if activated: uses the data maximum within the current map boundaries
  // (there will always be a red spot with useLocalExtremas true)
  useLocalExtrema: false,
  // which field name in your data represents the latitude - default "lat"
  latField: 'lat',
  // which field name in your data represents the longitude - default "lng"
  lngField: 'lng',
  // which field name in your data represents the data value - default "value"
  valueField: 'intensity',
  gradient: {
    0.2: '#3489BD',
    0.4: '#48AF4E',
    0.6: '#FCD43D',
    0.8: '#E29421',
    '1.0': '#D53F50'
  },
  min: 0,
  max: 1
}; // Enhancement for issue #31

exports.DEFAULT_HEATMAP_STYLE = DEFAULT_HEATMAP_STYLE;
var DEFAULT_REGION_STYLE = {
  stroke: true,
  color: '#3388ff',
  weight: 4,
  opacity: 0.5,
  fill: true,
  fillColor: '#ffffff',
  fillOpacity: 0.2
}; // Enhancement for issue #31

exports.DEFAULT_REGION_STYLE = DEFAULT_REGION_STYLE;
var DEFAULT_SYMBOL_STYLE = {
  stroke: true,
  color: '#3388ff',
  weight: 3,
  opacity: 1.0,
  lineCap: 'round',
  lineJoin: 'round',
  dashArray: null,
  dashOffset: null,
  fill: true,
  fillColor: '#3388ff',
  fillOpacity: 0.2,
  fillRule: 'evenodd',
  className: null
}; // For selected style of non-marker symbols

exports.DEFAULT_SYMBOL_STYLE = DEFAULT_SYMBOL_STYLE;

var DEFAULT_SYMBOL_SLT_STYLE = _objectSpread(_objectSpread({}, DEFAULT_SYMBOL_STYLE), {}, {
  color: 'orange',
  fillColor: 'orange'
}); // Enhancement for issue #31


exports.DEFAULT_SYMBOL_SLT_STYLE = DEFAULT_SYMBOL_SLT_STYLE;
var DEFAULT_MARKER_STYLE = {
  icon: {
    iconUrl: _markerIcon["default"],
    iconAnchor: [30, 41],
    iconSize: ['auto', 'auto'],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    rotation: 0
  },
  className: null
}; // For selected style of marker
// TBD: selected style
// export const DEFAULT_MARKER_SLT_STYLE = {
//     ...DEFAULT_MARKER_STYLE
// }
// Enhancement for issue #31

exports.DEFAULT_MARKER_STYLE = DEFAULT_MARKER_STYLE;

var DEFAULT_TRACK_STYLE = _objectSpread(_objectSpread({}, DEFAULT_SYMBOL_STYLE), {}, {
  // dashArray: '15',
  // dashOffset: '0',
  color: '#999999',
  opacity: 0.6,
  dashArray: '0',
  dashOffset: '0',
  showLabelOn: false,
  weight: 3,
  fill: false
});

exports.DEFAULT_TRACK_STYLE = DEFAULT_TRACK_STYLE;
var DEFAULT_TRACK_SLT_STYLE = {
  // color: '#D0104C',
  color: '#63A200',
  fill: false
}; // Enhancement for issue #31

exports.DEFAULT_TRACK_SLT_STYLE = DEFAULT_TRACK_SLT_STYLE;
var DEFAULT_PATTERN_STYLE = {
  offset: '99.9%',
  repeat: 0,
  sign: {
    type: 'arrow',
    pixelSize: 15,
    pathOptions: {
      dashArray: null,
      dashOffset: null
    }
  }
};
exports.DEFAULT_PATTERN_STYLE = DEFAULT_PATTERN_STYLE;
var DEFAULT_CONTOUR_STYLE = {
  colors: {
    '0.00': '#3489BD',
    0.25: '#48AF4E',
    '0.50': '#FCD43D',
    0.75: '#E29421',
    '1.00': '#D53F50'
  },
  cellSize: 4,
  bandwidth: 20.4939,
  thresholds: 20,
  boundSW: {
    lat: 24.783605,
    lng: 121.346129
  },
  boundNE: {
    lat: 25.258346,
    lng: 121.746007
  } // boundSW: {lat:21.897735, lng:120.035656},
  // boundNE: {lat:25.298713, lng:122.002554}

};
exports.DEFAULT_CONTOUR_STYLE = DEFAULT_CONTOUR_STYLE;
//# sourceMappingURL=style.js.map