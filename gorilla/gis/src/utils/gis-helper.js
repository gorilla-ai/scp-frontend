/**
 * This is for calculating geographic info or features
 * E.g., calculating the distance of input path(latlngs), or determine whether two svg-based feature intersect
 *
 * @file   Handles the GIS calculation, or processed GIS data
 * @author Liszt
 */

import _ from 'lodash'
import L from 'leaflet'
import * as turf from '@turf/turf'
import geolib from 'geolib'

import {GIS_ERROR as ERROR} from './gis-exception'
import {SYMBOL_TYPE, EXTRA_SYMBOL_TYPE} from '../consts/dictionary'

let log = require('loglevel').getLogger('gis/utils/gis-helper')

/**
 * Fix issue #23. For getting all the features in nested feature collection
 *
 * @param {Object} geoJson  Geojson to be flatten
 *
 * @return {Object}    Flatten geojson
 */
function _getAllFeatures(geoJson) {
    if (!geoJson.features) {
        log.warn(ERROR.INVALID_ARGS, geoJson, 'The argument should be a FeatureCollection')
        return []
    }

    const features = _.map(geoJson.features, el => {
        return el.type === 'FeatureCollection' ? _getAllFeatures(el) : el
    })

    return _.flattenDeep(features)
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
export function getPathDistance(latlngs, crs=L.CRS.EPSG3857) {
    if (latlngs.length <= 1) {
        return 0
    }
    else {
        return _.reduce(latlngs, (acc, el, idx, clct) => {
            if (idx < clct.length - 1) {
                let start = L.latLng(0, 0)
                let end = L.latLng(0, 0)

                if (_.isArray(el)) {
                    start = L.latLng(el[0], el[1])
                    end = L.latLng(clct[idx+1][0], clct[idx+1][1])
                }
                else if (_.isPlainObject(el)) {
                    start = L.latLng(el)
                    end = L.latLng(clct[idx+1])
                }
                else {
                    log.warn(ERROR.INVALID_ARGS, el, 'Argument should be an array of number[lat, lng], or object{lat, lng}')
                }

                acc += crs.distance(start, end)
            }

            return acc
        }, 0)
    }
}

/**
 * Get a symbol's center of mass.
 *
 * @param {Symbol} symbol   The Symbol instance
 *
 * @return {LatLng}    Leaflet Latlng
 */
export function getCenterOfMass(symbol) {
    let latlng = []
    const featureGroup = L.featureGroup([])

    switch (symbol.type) {
        case SYMBOL_TYPE.GEOJSON:
        case SYMBOL_TYPE.POLYGON:
        case SYMBOL_TYPE.RECTANGLE:
        case EXTRA_SYMBOL_TYPE.CLUSTER:
            latlng = symbol.layer.getBounds().getCenter()
            break

        case SYMBOL_TYPE.MARKER:
        case SYMBOL_TYPE.SPOT:
        case SYMBOL_TYPE.CIRCLE:
            latlng = symbol.props.latlng
            break

        // Polyline decorator don't support getBounds()
        case SYMBOL_TYPE.POLYLINE:
        case EXTRA_SYMBOL_TYPE.TRACK:
            if (symbol.layer instanceof L.Polyline) {
                latlng = symbol.layer.getCenter()
            }
            else {
                symbol.layer.eachLayer(lyr => {
                    (lyr instanceof L.Polyline) && featureGroup.addLayer(lyr)
                })

                latlng = featureGroup.getBounds().getCenter()
            }
            break

        default:
            log.warn(ERROR.INVALID_TYPE, symbol.type, `Please input valid types: ${_.values(SYMBOL_TYPE)}`)
    }

    return latlng
}

/**
 * Checks the geojson objects intersects or not. Used in region-selection plugins.
 *
 * @param {Object} symbolGeoJson    The GeoJson object of a Symbol on the map
 * @param {Object} drawnGeoJson     The GeoJson object of the drawn region on the map
 *
 * @return {Boolean}   The symbol and drawn region intersect or not
 */
export function isIntersect(symbolGeoJson, drawnGeoJson) {
    // Convert symbol's geojson to geojson of points,
    // then checking any one of them intersects the drawn region
    const features = symbolGeoJson.type === 'FeatureCollection'
                    ? _getAllFeatures(symbolGeoJson) // Fix issue #23
                    : [symbolGeoJson]

    const intersect = _.some(features, feature => {
        const points = turf.lineIntersect(feature, drawnGeoJson)
        return points.features.length > 0
    })

    return intersect
}

/**
 * Checks the geojson objects overlaps or not. Used in region-selection plugins.
 *
 * @param {Object} symbolGeoJson    The GeoJson object of a Symbol on the map
 * @param {Object} drawnGeoJson     The GeoJson object of the drawn region on the map
 *
 * @return {Boolean}   The symbol and drawn region overlap or not
 */
export function isOverlap(symbolGeoJson, drawnGeoJson) {
    // Convert symbol's geojson to geojson of points,
    // then checking any one of them is inside the drawn region
    const features = symbolGeoJson.type === 'FeatureCollection'
                    ? _getAllFeatures(symbolGeoJson)
                    : [symbolGeoJson]

    const overlap = _.some(features, feature => {
        const points = turf.explode(feature)
        const inside = _.some(points.features, point => {
            return turf.booleanPointInPolygon(point, drawnGeoJson)
        })

        return inside
    })

    return overlap
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
export function convertCircleToPolygon(circle, map, {vertices=180, startFrom=0, stopAt=360}) {
    map = map || circle._map
    if (!map) {
        log.warn('Please create map before convert circle to polygon.')
        return null
    }

    const DOUBLE_PI = 2 * Math.PI
    const degreeToRadian = Math.PI / 180

    // Normalize the angle
    const startAngle = (startFrom % 360) < 0 ? (startFrom % 360) + 360 : startFrom
    const stopAngle = (stopAt % 360) < 0 ? (stopAt % 360) + 360 : stopAt

    const crs = map.options.crs
    const isEPSG3857 = crs === L.CRS.EPSG3857

    const radius = isEPSG3857 ? circle._radius : circle._mRadius

    const project = isEPSG3857
                    ? map.latLngToLayerPoint.bind(map)
                    : crs.projection.project.bind(crs.projection)

    const unproject = isEPSG3857
                    ? map.layerPointToLatLng.bind(map)
                    : crs.projection.unproject.bind(crs.projection)

    const projectedCentroid = project(circle._latlng)

    const points = []
    const isStartLarger = startAngle > stopAngle

    const stopRadian = isStartLarger ? (startAngle * degreeToRadian) : stopAngle * degreeToRadian
    let startRadian = isStartLarger ? (stopAngle * degreeToRadian) : startAngle * degreeToRadian

    for (let i = 0; i < vertices; i++) {
        startRadian += (DOUBLE_PI / vertices)

        if (startRadian <= stopRadian) {
            const point = L.point(
                projectedCentroid.x + (radius * Math.cos((Math.PI / 2) - startRadian)),
                projectedCentroid.y + (radius * Math.sin((Math.PI / 2) - startRadian))
            )

            points.push(unproject(point))
        }
    }

    // Specify the endpoint
    if (startAngle !== 0 || stopAngle !== 360) {
        points.push(circle.getLatLng())
    }

    return L.polygon(points)
}

/**
 * Gets the distance in meter between two geo points.
 *
 * @param {Number[]} start  Start latlng, formatted as [Number lat, Number lng]
 * @param {Number[]} end    End latlng, formatted as [Number lat, Number lng]
 *
 * @return {Number}    The distance in meter.
 */
export function convertLatlngToMeters([lat1, lon1], [lat2, lon2]) {
    // generally used geo measurement function
    const d = geolib.getDistance({latitude:lat1, longitude:lon1}, {latitude:lat2, longitude:lon2})
    return parseInt(d, 10)
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
export function convertMetersToLatLng([fromLat, fromLng], xOffset, yOffset) {
    const brng = Math.atan(yOffset/xOffset)*180/Math.PI
    const d = Math.sqrt((yOffset*yOffset)+(xOffset*xOffset))
    const result = geolib.computeDestinationPoint({lat:fromLat, lng:fromLng}, d, brng)
    return [result.latitude, result.longitude]
}

export default {
    getPathDistance,
    getCenterOfMass,
    isIntersect,
    // isSvgIntersect,
    isOverlap,
    convertCircleToPolygon,
    convertLatlngToMeters,
    convertMetersToLatLng
}