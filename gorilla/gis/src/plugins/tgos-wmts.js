import L from 'leaflet'
import _ from 'lodash'

L.TileLayer.WMTS = L.TileLayer.extend({
    defaultWmtsParams: {
        SERVICE: 'WMTS',
        REQUEST: 'GetTile',
        VERSION: '1.0.0',
        LAYER: 'TGOSMAP_W',
        STYLE: '_null',
        TILEMATRIXSET: 'GoogleMapsCompatible',
        FORMAT: 'image/png'
    },

    initialize(url, options) { // (String, Object)
        let wmtsParams = L.extend({}, this.defaultWmtsParams),
            tileSize = options.tileSize || this.options.tileSize

        wmtsParams.height = (options.detectRetina && L.Browser.retina) ? tileSize * 2 : tileSize
        wmtsParams.width = wmtsParams.height

        _.forEach(options, (el, key) => {
            if (!_.has(this.options, key) && key !== 'matrixIds') {
                wmtsParams[key] = options[key]
            }
        })

        this.wmtsParams = wmtsParams
        this.matrixIds = options.matrixIds || this.getDefaultMatrix()
        options.bounds = [[21.65607265, 117.84953432], [25.64233621, 123.85924109]]

        L.setOptions(this, options)
    },

    onAdd(map) {
        L.TileLayer.prototype.onAdd.call(this, map)
    },

    getTileUrl(tilePoint, zoom) { // (Point, Number) -> String
        let map = this._map,
            crs = map.options.crs || L.CRS.EPSG3857,
            tileSize = this.options.tileSize,
            layer = this.wmtsParams.LAYER,
            nwPoint = tilePoint.multiplyBy(tileSize)

        // +/-1 in order to be on the tile
        nwPoint.x += 1
        nwPoint.y -= 1
        zoom = zoom || tilePoint.z

        let sePoint = nwPoint.add(new L.Point(tileSize, tileSize)),
            nw = crs.project(map.unproject(nwPoint, zoom)),
            se = crs.project(map.unproject(sePoint, zoom)),
            tileWidth = se.x - nw.x

        let ident = this.matrixIds[zoom].identifier,
            X0 = this.matrixIds[zoom].topLeftCorner.lng,
            Y0 = this.matrixIds[zoom].topLeftCorner.lat

        let tileCol = Math.floor((nw.x - X0) / tileWidth),
            tileRow = -Math.floor((nw.y - Y0) / tileWidth)

        let url = `http://gis.sinica.edu.tw/tgos/file-exists.php?img=${layer}-png-${ident}-${tileCol}-${tileRow}`

        return url
    },

    setParams(params, noRedraw) {
        L.extend(this.wmtsParams, params)
        if (!noRedraw) {
            this.redraw()
        }
        return this
    },

    getDefaultMatrix() {
        /**
         * the matrix3857 represents the projection
         * for the google coordinates.
         */
        let matrixIds3857 = new Array(22)
        for (let i = 0; i < 22; i++) {
            matrixIds3857[i]= {
                identifier: `${i}`,
                topLeftCorner: new L.LatLng(20037508.3428, -20037508.3428)
            }
        }
        return matrixIds3857
    }
})

L.tileLayer.wmts = (url, options) => {
    return new L.TileLayer.WMTS(url, options)
}
