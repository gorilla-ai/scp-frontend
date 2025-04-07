"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPathDistance = getPathDistance;
exports.getCenterOfMass = getCenterOfMass;
exports.isIntersect = isIntersect;
exports.isOverlap = isOverlap;
exports.convertCircleToPolygon = convertCircleToPolygon;
exports.convertLatlngToMeters = convertLatlngToMeters;
exports.convertMetersToLatLng = convertMetersToLatLng;
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _leaflet = _interopRequireDefault(require("leaflet"));

var turf = _interopRequireWildcard(require("@turf/turf"));

var _geolib = _interopRequireDefault(require("geolib"));

var _gisException = require("./gis-exception");

var _dictionary = require("../consts/dictionary");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var log = require('loglevel').getLogger('gis/utils/gis-helper');
/**
 * Fix issue #23. For getting all the features in nested feature collection
 *
 * @param {Object} geoJson  Geojson to be flatten
 *
 * @return {Object}    Flatten geojson
 */


function _getAllFeatures(geoJson) {
  if (!geoJson.features) {
    log.warn(_gisException.GIS_ERROR.INVALID_ARGS, geoJson, 'The argument should be a FeatureCollection');
    return [];
  }

  var features = _lodash["default"].map(geoJson.features, function (el) {
    return el.type === 'FeatureCollection' ? _getAllFeatures(el) : el;
  });

  return _lodash["default"].flattenDeep(features);
}
/**
 * Distance value varies due to the crs
 *
 * @link    https://leafletjs.com/reference-1.3.4.html#crs-l-crs-earth
 *
 * @param {LatLng[]} latlngs                The latlngs of a path. latlng should be [lat, lng] which lat & lng are numbers
 * @param {Object}   [crs=L.CRS.EPSG3857]   The CRS to be used in calculation. For CRS, see link above.
 *
 * @return {number}    The distance of the path
 */


function getPathDistance(latlngs) {
  var crs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _leaflet["default"].CRS.EPSG3857;

  if (latlngs.length <= 1) {
    return 0;
  } else {
    return _lodash["default"].reduce(latlngs, function (acc, el, idx, clct) {
      if (idx < clct.length - 1) {
        var start = _leaflet["default"].latLng(0, 0);

        var end = _leaflet["default"].latLng(0, 0);

        if (_lodash["default"].isArray(el)) {
          start = _leaflet["default"].latLng(el[0], el[1]);
          end = _leaflet["default"].latLng(clct[idx + 1][0], clct[idx + 1][1]);
        } else if (_lodash["default"].isPlainObject(el)) {
          start = _leaflet["default"].latLng(el);
          end = _leaflet["default"].latLng(clct[idx + 1]);
        } else {
          log.warn(_gisException.GIS_ERROR.INVALID_ARGS, el, 'Argument should be an array of number[lat, lng], or object{lat, lng}');
        }

        acc += crs.distance(start, end);
      }

      return acc;
    }, 0);
  }
}
/**
 * Get a symbol's center of mass.
 *
 * @param {Symbol} symbol   The Symbol instance
 *
 * @return {LatLng}    Leaflet Latlng
 */


function getCenterOfMass(symbol) {
  var latlng = [];

  var featureGroup = _leaflet["default"].featureGroup([]);

  switch (symbol.type) {
    case _dictionary.SYMBOL_TYPE.GEOJSON:
    case _dictionary.SYMBOL_TYPE.POLYGON:
    case _dictionary.SYMBOL_TYPE.RECTANGLE:
    case _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER:
      latlng = symbol.layer.getBounds().getCenter();
      break;

    case _dictionary.SYMBOL_TYPE.MARKER:
    case _dictionary.SYMBOL_TYPE.SPOT:
    case _dictionary.SYMBOL_TYPE.CIRCLE:
      latlng = symbol.props.latlng;
      break;
    // Polyline decorator don't support getBounds()

    case _dictionary.SYMBOL_TYPE.POLYLINE:
    case _dictionary.EXTRA_SYMBOL_TYPE.TRACK:
      if (symbol.layer instanceof _leaflet["default"].Polyline) {
        latlng = symbol.layer.getCenter();
      } else {
        symbol.layer.eachLayer(function (lyr) {
          lyr instanceof _leaflet["default"].Polyline && featureGroup.addLayer(lyr);
        });
        latlng = featureGroup.getBounds().getCenter();
      }

      break;

    default:
      log.warn(_gisException.GIS_ERROR.INVALID_TYPE, symbol.type, "Please input valid types: ".concat(_lodash["default"].values(_dictionary.SYMBOL_TYPE)));
  }

  return latlng;
}
/**
 * Checks the geojson objects intersects or not. Used in region-selection plugins.
 *
 * @param {Object} symbolGeoJson    The GeoJson object of a Symbol on the map
 * @param {Object} drawnGeoJson     The GeoJson object of the drawn region on the map
 *
 * @return {Boolean}   The symbol and drawn region intersect or not
 */


function isIntersect(symbolGeoJson, drawnGeoJson) {
  // Convert symbol's geojson to geojson of points,
  // then checking any one of them intersects the drawn region
  var features = symbolGeoJson.type === 'FeatureCollection' ? _getAllFeatures(symbolGeoJson) // Fix issue #23
  : [symbolGeoJson];

  var intersect = _lodash["default"].some(features, function (feature) {
    var points = turf.lineIntersect(feature, drawnGeoJson);
    return points.features.length > 0;
  });

  return intersect;
}
/**
 * Checks the geojson objects overlaps or not. Used in region-selection plugins.
 *
 * @param {Object} symbolGeoJson    The GeoJson object of a Symbol on the map
 * @param {Object} drawnGeoJson     The GeoJson object of the drawn region on the map
 *
 * @return {Boolean}   The symbol and drawn region overlap or not
 */


function isOverlap(symbolGeoJson, drawnGeoJson) {
  // Convert symbol's geojson to geojson of points,
  // then checking any one of them is inside the drawn region
  var features = symbolGeoJson.type === 'FeatureCollection' ? _getAllFeatures(symbolGeoJson) : [symbolGeoJson];

  var overlap = _lodash["default"].some(features, function (feature) {
    var points = turf.explode(feature);

    var inside = _lodash["default"].some(points.features, function (point) {
      return turf.booleanPointInPolygon(point, drawnGeoJson);
    });

    return inside;
  });

  return overlap;
}
/**
 * Checks the SVGs intersect or not. Used in region-selection plugins.
 * SVGGeometryElement.isPointInStroke() & SVGGeometryElement.isPointInFill () are only supported in Chrome by Aug, 2017
 *
 * @param {SVGElement} symbolSvg    The SVG element of a Symbol on the map.
 * @param {SVGElement} drawnSvg     The SVG element of the drawn region on the map
 *
 * @return {Boolean}   Two SVGs intersect or not.
 */
// export function isSvgIntersect(symbolSvg, drawnSvg) {
//     const drawnBBox = drawnSvg.getBBox(),
//         symbolBBox = symbolSvg.getBBox()
//     const drawnSize = drawnBBox.width * drawnBBox.height,
//         symbolSize = symbolBBox.width * symbolBBox.height
//     const svgA = drawnSize > symbolSize ? drawnSvg : symbolSvg,
//         svgB = drawnSize > symbolSize ? symbolSvg : drawnSvg
//     let intersect = false
//     for (let i = 0; i < svgB.getTotalLength(); i++) {
//         const point = svgB.getPointAtLength(i)
//         if (svgA.isPointInStroke(point) || svgA.isPointInFill(point)) {
//             intersect = true
//             break
//         }
//     }
//     return intersect
// }

/**
 * Support to convert semicircle to polygon. Fix issue #26.
 *
 * @param {L.Circle} circle                 L.Circle instance to be converted.
 * @param {L.Map}    map                    The container of the circle.
 * @param {Object}   [options]              Converting options.
 * @param {Number}   [options.vertices=180] Vertices amount of the ouput polygon.
 * @param {Number}   [options.startFrom=0]  Start angle of the semi-circle.
 * @param {Number}   [options.stopAt=360]   Stop angle of the scircle.
 *
 * @return {L.Polygon}     The ouput polygon.
 */


function convertCircleToPolygon(circle, map, _ref) {
  var _ref$vertices = _ref.vertices,
      vertices = _ref$vertices === void 0 ? 180 : _ref$vertices,
      _ref$startFrom = _ref.startFrom,
      startFrom = _ref$startFrom === void 0 ? 0 : _ref$startFrom,
      _ref$stopAt = _ref.stopAt,
      stopAt = _ref$stopAt === void 0 ? 360 : _ref$stopAt;
  map = map || circle._map;

  if (!map) {
    log.warn('Please create map before convert circle to polygon.');
    return null;
  }

  var DOUBLE_PI = 2 * Math.PI;
  var degreeToRadian = Math.PI / 180; // Normalize the angle

  var startAngle = startFrom % 360 < 0 ? startFrom % 360 + 360 : startFrom;
  var stopAngle = stopAt % 360 < 0 ? stopAt % 360 + 360 : stopAt;
  var crs = map.options.crs;
  var isEPSG3857 = crs === _leaflet["default"].CRS.EPSG3857;
  var radius = isEPSG3857 ? circle._radius : circle._mRadius;
  var project = isEPSG3857 ? map.latLngToLayerPoint.bind(map) : crs.projection.project.bind(crs.projection);
  var unproject = isEPSG3857 ? map.layerPointToLatLng.bind(map) : crs.projection.unproject.bind(crs.projection);
  var projectedCentroid = project(circle._latlng);
  var points = [];
  var isStartLarger = startAngle > stopAngle;
  var stopRadian = isStartLarger ? startAngle * degreeToRadian : stopAngle * degreeToRadian;
  var startRadian = isStartLarger ? stopAngle * degreeToRadian : startAngle * degreeToRadian;

  for (var i = 0; i < vertices; i++) {
    startRadian += DOUBLE_PI / vertices;

    if (startRadian <= stopRadian) {
      var point = _leaflet["default"].point(projectedCentroid.x + radius * Math.cos(Math.PI / 2 - startRadian), projectedCentroid.y + radius * Math.sin(Math.PI / 2 - startRadian));

      points.push(unproject(point));
    }
  } // Specify the endpoint


  if (startAngle !== 0 || stopAngle !== 360) {
    points.push(circle.getLatLng());
  }

  return _leaflet["default"].polygon(points);
}
/**
 * Gets the distance in meter between two geo points.
 *
 * @param {Number[]} start  Start latlng, formatted as [Number lat, Number lng]
 * @param {Number[]} end    End latlng, formatted as [Number lat, Number lng]
 *
 * @return {Number}    The distance in meter.
 */


function convertLatlngToMeters(_ref2, _ref3) {
  var _ref4 = _slicedToArray(_ref2, 2),
      lat1 = _ref4[0],
      lon1 = _ref4[1];

  var _ref5 = _slicedToArray(_ref3, 2),
      lat2 = _ref5[0],
      lon2 = _ref5[1];

  // generally used geo measurement function
  var d = _geolib["default"].getDistance({
    latitude: lat1,
    longitude: lon1
  }, {
    latitude: lat2,
    longitude: lon2
  });

  return parseInt(d, 10);
}
/**
 * Gets geo point from a start point and offset in meter.
 *
 * @param {Number[]} latlng     Start latlng, formatted as [Number lat, Number lng]
 * @param {Number}   xOffset    The x-offset in meter from the start point.
 * @param {Number}   yOffset    The y-offset in meter from the start point.
 *
 * @return {Number[]} - The calculated latlng.
 */


function convertMetersToLatLng(_ref6, xOffset, yOffset) {
  var _ref7 = _slicedToArray(_ref6, 2),
      fromLat = _ref7[0],
      fromLng = _ref7[1];

  var brng = Math.atan(yOffset / xOffset) * 180 / Math.PI;
  var d = Math.sqrt(yOffset * yOffset + xOffset * xOffset);

  var result = _geolib["default"].computeDestinationPoint({
    lat: fromLat,
    lng: fromLng
  }, d, brng);

  return [result.latitude, result.longitude];
}

var _default = {
  getPathDistance: getPathDistance,
  getCenterOfMass: getCenterOfMass,
  isIntersect: isIntersect,
  // isSvgIntersect,
  isOverlap: isOverlap,
  convertCircleToPolygon: convertCircleToPolygon,
  convertLatlngToMeters: convertLatlngToMeters,
  convertMetersToLatLng: convertMetersToLatLng
};
exports["default"] = _default;
//# sourceMappingURL=gis-helper.js.map