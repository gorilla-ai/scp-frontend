"use strict";

var _leaflet = _interopRequireDefault(require("leaflet"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_leaflet["default"].TileLayer.WMTS = _leaflet["default"].TileLayer.extend({
  defaultWmtsParams: {
    SERVICE: 'WMTS',
    REQUEST: 'GetTile',
    VERSION: '1.0.0',
    LAYER: 'TGOSMAP_W',
    STYLE: '_null',
    TILEMATRIXSET: 'GoogleMapsCompatible',
    FORMAT: 'image/png'
  },
  initialize: function initialize(url, options) {
    var _this = this;

    // (String, Object)
    var wmtsParams = _leaflet["default"].extend({}, this.defaultWmtsParams),
        tileSize = options.tileSize || this.options.tileSize;

    wmtsParams.height = options.detectRetina && _leaflet["default"].Browser.retina ? tileSize * 2 : tileSize;
    wmtsParams.width = wmtsParams.height;

    _lodash["default"].forEach(options, function (el, key) {
      if (!_lodash["default"].has(_this.options, key) && key !== 'matrixIds') {
        wmtsParams[key] = options[key];
      }
    });

    this.wmtsParams = wmtsParams;
    this.matrixIds = options.matrixIds || this.getDefaultMatrix();
    options.bounds = [[21.65607265, 117.84953432], [25.64233621, 123.85924109]];

    _leaflet["default"].setOptions(this, options);
  },
  onAdd: function onAdd(map) {
    _leaflet["default"].TileLayer.prototype.onAdd.call(this, map);
  },
  getTileUrl: function getTileUrl(tilePoint, zoom) {
    // (Point, Number) -> String
    var map = this._map,
        crs = map.options.crs || _leaflet["default"].CRS.EPSG3857,
        tileSize = this.options.tileSize,
        layer = this.wmtsParams.LAYER,
        nwPoint = tilePoint.multiplyBy(tileSize); // +/-1 in order to be on the tile

    nwPoint.x += 1;
    nwPoint.y -= 1;
    zoom = zoom || tilePoint.z;
    var sePoint = nwPoint.add(new _leaflet["default"].Point(tileSize, tileSize)),
        nw = crs.project(map.unproject(nwPoint, zoom)),
        se = crs.project(map.unproject(sePoint, zoom)),
        tileWidth = se.x - nw.x;
    var ident = this.matrixIds[zoom].identifier,
        X0 = this.matrixIds[zoom].topLeftCorner.lng,
        Y0 = this.matrixIds[zoom].topLeftCorner.lat;
    var tileCol = Math.floor((nw.x - X0) / tileWidth),
        tileRow = -Math.floor((nw.y - Y0) / tileWidth);
    var url = "http://gis.sinica.edu.tw/tgos/file-exists.php?img=".concat(layer, "-png-").concat(ident, "-").concat(tileCol, "-").concat(tileRow);
    return url;
  },
  setParams: function setParams(params, noRedraw) {
    _leaflet["default"].extend(this.wmtsParams, params);

    if (!noRedraw) {
      this.redraw();
    }

    return this;
  },
  getDefaultMatrix: function getDefaultMatrix() {
    /**
     * the matrix3857 represents the projection
     * for the google coordinates.
     */
    var matrixIds3857 = new Array(22);

    for (var i = 0; i < 22; i++) {
      matrixIds3857[i] = {
        identifier: "".concat(i),
        topLeftCorner: new _leaflet["default"].LatLng(20037508.3428, -20037508.3428)
      };
    }

    return matrixIds3857;
  }
});

_leaflet["default"].tileLayer.wmts = function (url, options) {
  return new _leaflet["default"].TileLayer.WMTS(url, options);
};
//# sourceMappingURL=tgos-wmts.js.map