/* eslint-disable no-underscore-dangle */
/**
 * Render-related functions.
 *
 * @file   This file implements all GIS render-related functions.
 * @author Liszt
 * @todo   Modify after merge the codes from develop_mix-layer branch
 */

import _ from 'lodash';
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import Heatmap from 'heatmap.js/plugins/leaflet-heatmap';
import * as turf from '@turf/turf';
import { contourDensity } from 'd3-contour';

import { convertLatlngToMeters, convertMetersToLatLng } from './gis-helper';
import { isValidArgType, isBetween } from './data-helper';
import { getSymbol } from './symbol-helper';
import { mergeProps } from './merge-helper';

import GisPolyline from '../symbols/polyline';
import GisMarker from '../symbols/marker';
import GisSpot from '../symbols/spot';

import { DEFAULT_TRACK_STYLE, DEFAULT_TRACK_SLT_STYLE, DEFAULT_CONTOUR_STYLE } from '../consts/style';
import { LAYOUT, SYMBOL_TYPE, EXTRA_SYMBOL_TYPE, HUNDRED_MILES_TO_METERS } from '../consts/dictionary';

import { GIS_ERROR as ERROR } from './gis-exception';

const log = require('loglevel').getLogger('gis/utils/render-helper');

const FACTOR = 10;

/**
 * Converts symbol to heatspot.
 *
 * @param {String | String[] | Object | Function | undefined | null} filter     Filter to convert matched symbols to heatspot. If it's a String or String[], converts symbols by ids; if it's a Object, converts symbols by all the attributes in symbols; if it's a Function, converts symbols by the given callback(Symbol symbol, String id, Object gis._symbols)
 *
 */
function _convertSymbolToHeatspot(filter) {
  const map = this._map;
  const symbolData = getSymbol.call(this, filter, true, [
    'id', 'type', 'props.latlng', 'props.heatmap', 'props.radius', 'props.geojson'
  ]);

  const spots = _.reduce(symbolData, (result, el) => {
    if (!el.heatmap) {
      return result;
    }

    const { id, type, heatmap } = el;
    const symbol = this._symbols[el.id];
    let data = {};

    let centroid = [];
    let radius = el.radius
      ? (el.radius / HUNDRED_MILES_TO_METERS)
      : this._heatmapOptions.radius / HUNDRED_MILES_TO_METERS;

    let area;
    let latlng;
    let geojson;
    let bbox;

    // Enhancement for issue #6. Replace props 'intensity' with 'heatmap',
    // which is a Bool/Object/Function(Object *symbolObj*)
    // If *heatmap* === true, use default min value;
    // if *heatmap* is an Object, use *heatmap.intensity*;
    // if *heatmap* is a function, it will return Bool or Object,
    // and use the above rule to determine intensity
    let intensity = this._heatmapOptions.min;
    if (_.isPlainObject(heatmap)) {
      intensity = heatmap.intensity || this._heatmapOptions.min;
    } else if (_.isFunction(heatmap)) {
      const heatspot = heatmap(getSymbol.call(this, id, true));

      if (_.isBoolean(heatspot) && heatspot) {
        intensity = this._heatmapOptions.min;
      } else if (_.isPlainObject(heatspot)) {
        intensity = heatspot.intensity;
      }
    }

    switch (type) {
      case SYMBOL_TYPE.RECTANGLE:
      case SYMBOL_TYPE.POLYGON:
        geojson = symbol.layer.toGeoJSON();

        area = turf.area(geojson);
        radius = Math.sqrt(area / Math.PI) / HUNDRED_MILES_TO_METERS;

        // coordinates of geojson is [lng, lat]
        centroid = turf.centerOfMass(geojson).geometry.coordinates;
        centroid = _.reverse(centroid);

        data = {
          lat: centroid[0],
          lng: centroid[1],
          radius,
          intensity: el.intensity || this._heatmapOptions.min
        };
        break;

      // TBD: polyline & geojson heatspot
      case SYMBOL_TYPE.POLYLINE:
        geojson = symbol.props.directed
          ? symbol.layer.getLayers()[0].toGeoJSON()
          : symbol.layer.toGeoJSON();

        // coordinates of geojson is [lng, lat]
        centroid = turf.centerOfMass(geojson).geometry.coordinates;
        centroid = _.reverse(centroid);

        // Get the nearest point to the centroid,
        // then calculating the distance to centroid as radius
        latlng = _.minBy(geojson.geometry.coordinates, (point) => {
          point = _.reverse(point);
          return map.distance(centroid, point);
        });

        radius = map.distance(centroid, latlng) / HUNDRED_MILES_TO_METERS;

        data = {
          lat: centroid[0],
          lng: centroid[1],
          radius,
          intensity
        };
        break;

      case SYMBOL_TYPE.GEOJSON:
        // Get the centroid and bbox of the geojson,
        // then calculating distance from centroid to a vertex on bbox as radius
        geojson = el.geojson.type !== 'FeatureCollection'
          ? turf.flatten(el.geojson)
          : el.geojson;

        bbox = turf.bbox(geojson); // return [ minX, minY, maxX, maxY ]
        latlng = [bbox[1], bbox[0]];

        // coordinates of geojson is [lng, lat]
        centroid = turf.centerOfMass(geojson).geometry.coordinates;
        centroid = _.reverse(centroid);
        radius = map.distance(centroid, latlng) / HUNDRED_MILES_TO_METERS;

        data = {
          lat: centroid[0],
          lng: centroid[1],
          radius,
          intensity
        };
        break;

      case SYMBOL_TYPE.MARKER:
      case SYMBOL_TYPE.CIRCLE:
      case SYMBOL_TYPE.CUSTOM:
      default:
        data = {
          lat: el.latlng[0],
          lng: el.latlng[1],
          radius,
          intensity
        };
    }

    result.push(data);
    return result;
  }, []);

  return spots;
}

/**
 * Resets map max bounds. Used in renderOverlay().
 *
 * @param {Boolean} [resetZoom=undefined]   Reset the zoom level after adjusting the max bounds or not.
 *
 */
function _resetMapBounds(resetZoom) {
  const map = this._map;
  const overlays = this._overlays;
  const maxBounds = _.reduce(overlays, (acc, { xy, size }) => {
    if (xy.y < acc[0][0]) {
      acc[0][0] = xy.y;
    }

    if (xy.x < acc[0][1]) {
      acc[0][1] = xy.x;
    }

    if ((xy.y + size.height) > acc[1][0]) {
      acc[1][0] = xy.y + size.height;
    }

    if ((xy.x + size.width) > acc[1][1]) {
      acc[1][1] = xy.x + size.width;
    }

    return acc;
  }, [[0, 0], [0, 0]]);

  map.setMaxBounds(maxBounds);
  resetZoom && this._map.fitBounds(maxBounds);

  const mapZoom = map.getZoom();
  _.forEach(overlays, ({ zoom, layer }) => {
    if (!_.isNil(zoom) && zoom > mapZoom && map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
}

/**
 * Creates cluster icon.
 *
 * @param {String}          id                                               The leaflet internal id of cluster node
 * @param {Object}          options                                          Symbol options for this cluster node.
 * @param {Object}          options.symbol
 * @param {String}          options.symbol.sumBy                             count will use this key to sum. Ps. the __toSum is insert to child markers by the auto create setting in setup-helper
 * @param {Array}           options.symbol.renderCount                       only work while using spot type
 * @param {Number}          options.symbol.renderCount.lowerBound            count render lowerBound
 * @param {Number}          options.symbol.renderCount.upperBound            count render upperBound
 * @param {String}          [options.symbol.renderCount.backgroundColor]     backgroundColor in this range. Use symbol color by default.
 * @param {Number}          [options.symbol.renderCount.size]                size in this range. 15px by default.
 * @param {L.ClusterNode}   layer                                            The cluster node layer instance.
 *
 * @return {L.divIcon}     The created cluster icon
 */
function _createClusterIcon(id, options, layer) {
  // const parentId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(1, 6)
  const parentId = layer._leaflet_id;
  let count = null;
  if (!_.has(options, 'props.symbol.sumBy')) {
    count = layer.getChildCount();
  } else {
    const childrens = layer.getAllChildMarkers();
    count = 0;
    _.forEach(childrens, (children) => {
      count += _.get(children, ['options', 'icon', 'options', '__toSum'], 0);
    });
    //        count = Math.floor(count);
  }
  const sblObj = {
    id: parentId,
    // type: 'cluster' is used for filtering pseudo cluster symbol
    // type: EXTRA_SYMBOL_TYPE.CLUSTER,
    type: _.get(options, 'props.symbol.type', SYMBOL_TYPE.MARKER),
    ..._.get(options, 'props.symbol', {}),
    data: {
      // ...options.props.symbol.data,
      ..._.get(options, 'props.symbol.data', {}),
      cluster: id,
      count,
      ids: _.map(layer.getAllChildMarkers(), (lyr) => {
        return lyr._gis_id;
      })
    }
  };
  if (_.has(options, 'props.symbol.renderCount')) {
    const rootBackgroundColor = _.get(options, 'props.symbol.backgroundColor');
    _.get(options, 'props.symbol.renderCount').some((value) => {
      const { lowerBound, upperBound, size = '15px', backgroundColor = rootBackgroundColor } = value;
      if (lowerBound <= count && _.isNil(upperBound)) {
        options.props.symbol.width = size;
        options.props.symbol.height = size;
        options.props.symbol.backgroundColor = backgroundColor;
      } else if (_.isNil(lowerBound) && count <= upperBound) {
        options.props.symbol.width = size;
        options.props.symbol.height = size;
        options.props.symbol.backgroundColor = backgroundColor;
      } else if (lowerBound <= count && count <= upperBound) {
        options.props.symbol.width = size;
        options.props.symbol.height = size;
        options.props.symbol.backgroundColor = backgroundColor;
      }
    });
  }
  const props = mergeProps(sblObj, [{ data: sblObj.data }, _.get(options, 'props.symbol')]);
  const selectedProps = mergeProps(sblObj, [_.get(options, 'props.symbol.selectedProps')]);
  props.className = `gis-cluster${_.get(props, 'className', '')}`;
  props.label = props.label || { content: `* ${layer.getChildCount()}` };

  const ParentNode = sblObj.type === SYMBOL_TYPE.MARKER ? GisMarker : GisSpot;
  const parent = new ParentNode(parentId, _.omit(props, 'type'), false, selectedProps);

  layer._gis_id = parentId;

  parent._type = EXTRA_SYMBOL_TYPE.CLUSTER;
  parent._origType = sblObj.type;
  parent._layer = layer;

  this._clusterSymbols[layer._leaflet_id] = parent;
  return L.divIcon(parent._icon);
}

/**
 * Render heatmap.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#measure-options
 *
 * @param {Object} [options]    Heatmap options. If undefined, apply the original heatmap options. For more info, see the link above.
 *
 */
export function renderHeatmap(options) {
  this._heatmapOptions = { ...this._heatmapOptions, ...options };

  const map = this._map;
  const heatmap = this._heatmap;
  const visible = _.keys(this._visible);

  const data = _.isEmpty(visible) ? [] : _convertSymbolToHeatspot.call(this, visible);
  const newHeatmap = new Heatmap(this._heatmapOptions);

  newHeatmap.setData({
    data,
    min: options ? options.min : this._heatmapOptions.min,
    max: options ? options.max : this._heatmapOptions.max
  });

  if (this._layout === LAYOUT.HEATMAP) {
    if (heatmap && map.hasLayer(heatmap)) {
      map.removeLayer(heatmap);
    }

    map.addLayer(newHeatmap);
  }

  this._heatmap = newHeatmap;
}


/**
 * Render tracks in track layout.
 *
 */
export function renderTrack() {
  this._flagGroup.clearLayers();
  this._flags = this._flags || {}; // For placing the ongoing nodes.

  const isTrack = this._layout === LAYOUT.TRACK;
  const isStandard = this._layout === LAYOUT.STANDARD;
  const interval = this._interval;
  const tracks = [];

  // Group by track ("track" will be the key), then sorting by ts in each group
  const groups = _.chain(this._symbols)
    .filter((sbl) => {
      return !!sbl.props.track && (_.isNumber(sbl.props.ts) || (_.isArray(sbl.props.ts) && !_.isEmpty(sbl.props.ts)));
    })
    .groupBy((sbl) => {
      // Enhancement for issue #6
      // Rename props "trackId" to "track",
      // and type is String or Function(Object *symbolObj*) which will return a String
      return (sbl.props.track && _.isFunction(sbl.props.track))
        ? sbl.props.track(getSymbol.call(this, sbl.id, true))
        : sbl.props.track;
    })
    .reduce((result, grp, key) => {
      // Enhancement for issue #32.
      // Support for *ts* is an array
      const trackGrp = _.chain(grp)
        .map((sbl) => {
          return _.isArray(sbl.props.ts)
            ? _.map(sbl.props.ts, (t) => {
              const symbol = _.cloneDeep(sbl);
              symbol._props.ts = t;

              return symbol;
            })
            : sbl;
        })
        .flatten()
      // .filter(sbl => interval.length === 0 || isBetween(sbl._props.ts, interval))
        .sortBy(sbl => sbl.props.ts)
        .map(({ id, props }) => { return { id, latlng: props.latlng, ts: props.ts }; })
        .value();

      result[key] = trackGrp;
      return result;
    }, {})
    .value();

  _.forEach(groups, (grp, key) => {
    // Find the first and last visible marker/spot, and draw the track between two points
    const startIdx = _.findIndex(grp, ({ id, ts }) => this._visible[id] && (interval.length === 0 || isBetween(ts, interval)));
    const endIdx = _.findLastIndex(grp, ({ id, ts }) => this._visible[id] && (interval.length === 0 || isBetween(ts, interval)));
    const isExist = this._symbols[key] && this._symbols[key].type === EXTRA_SYMBOL_TYPE.TRACK;
    const isDuplicated = this._symbols[key] && this._symbols[key].type !== EXTRA_SYMBOL_TYPE.TRACK;
    let isSelected = false;

    // For redrawing track
    if (isExist) {
      isSelected = this._symbols[key].selected;
      this._map.removeLayer(this._symbols[key].layer);
      _.forEach(_.uniq(grp), ({ id }) => {
        const { _props, _selectedProps, _origProps, _origSelectedProps, selected } = this._symbols[id];
        const isFlagMode = !_.isEqual(_props, _origProps) || !_.isEqual(_selectedProps, _origSelectedProps);

        // Reset all markers/spots which is changed as flag
        // This is for preventing they keep as flag when they shouldn't be.
        if (isFlagMode) {
          this._symbols[id].set(_origProps, selected, _origSelectedProps);
        }

        this._map.hasLayer(this._symbols[id].layer)
        && this._map.removeLayer(this._symbols[id].layer);
      });

      delete this._symbols[key];
    }

    // Do not draw track if trackId duplicates with any symbol
    if (isDuplicated) {
      log.warn(
        ERROR.INVALID_ID,
        key,
        `track ${key} which Id duplicates with a symbol, please rename it`
      );
    } else if ((startIdx !== -1) && (endIdx !== -1)) {
      // Enhancement for issue #31
      // Get style from config, and later styles get higher priority
      // Cfgs without "match" key will be applied to all tracks
      const trackObj = {
        id: key,
        type: EXTRA_SYMBOL_TYPE.TRACK,
        latlng: _.map(grp, 'latlng'),
        ...DEFAULT_TRACK_STYLE,
        selected: false,
        selectedProps: DEFAULT_TRACK_SLT_STYLE
      };
      let propsToUse = { showInvisible: false, showOngoing: false, startSymbol: {}, endSymbol: {}, internalSymbols: false };
      let selectedPropsToUse = { startSymbol: {}, endSymbol: {} };

      _.forEach(this._trackOptions, ({ match, props, selectedProps }) => {
        if ((match && match.id === key) || !match) {
          propsToUse = mergeProps(trackObj, [DEFAULT_TRACK_STYLE, propsToUse, props]);
          selectedPropsToUse = mergeProps(trackObj, [DEFAULT_TRACK_SLT_STYLE, selectedPropsToUse, selectedProps]);
        }
      });

      propsToUse = ['startSymbol', 'endSymbol'].reduce(({ showLabelOn = false, ...props }, symbolName) => {
        const { label, type = SYMBOL_TYPE.MARKER, ...symbolProps } = props[symbolName];
        const { content = '', className = '' } = 'string' === typeof label ? { content: label } : (label || {});

        return SYMBOL_TYPE.SPOT !== type ? { showLabelOn, ...props } : {
          showLabelOn,
          ...props,
          [ symbolName ]: {
            type,
            ...(symbolProps || {}),
            ...(!label || !showLabelOn ? {} : {
              label: 'TracksEnd' === showLabelOn ? content : { content, className }
            })
          }
        };
      }, propsToUse);

      const showOngoing = propsToUse.showOngoing && (endIdx !== grp.length - 1);

      const route = _(grp)
        .slice(startIdx, endIdx + 1)
        .filter(({ id }) => propsToUse.showInvisible || this._visible[id])
        .value();

      const latlngs = _.map(route, 'latlng');
      /*
        The extra point's location depends on the GisInterval
        In other words, this works if used with time-related functionality if
        you'd like to see the track animation
      */
      if (showOngoing && _.isArray(interval) && interval.length === 2) {
        const currLast = _.last(route);
        const next = grp[endIdx + 1];
        const offset = [next.latlng[0] - currLast.latlng[0], next.latlng[1] - currLast.latlng[1]];
        const timeDiff = next.ts - currLast.ts;
        const ratio = (interval[1] - currLast.ts) / timeDiff;
        const currPosition = [currLast.latlng[0] + offset[0] * ratio, currLast.latlng[1] + offset[1] * ratio];
        latlngs.push(currPosition);
      }

      const track = new GisPolyline(key, {
        latlng: latlngs,
        ...propsToUse,
        route
      }, isSelected, selectedPropsToUse);

      track._type = EXTRA_SYMBOL_TYPE.TRACK;
      track._origType = SYMBOL_TYPE.POLYLINE;

      this._symbols[key] = track;
      this._visible[key] = true;
      tracks.push(key);

      const hasOngoingNode = showOngoing
                  && !_.isEqual(_.last(latlngs), _.get(_.last(route), 'props.latlng'));

      const Point = _.get(propsToUse, 'endSymbol.type') === SYMBOL_TYPE.SPOT ? GisSpot : GisMarker;
      const ongoingNodeId = _.get(propsToUse, 'endSymbol.id', `${key}_${Math.random().toString(36).replace(/[^a-z]+/g, '').substr(1, 6)}`);
      const ongoingNode = new Point(
        // Math.random().toString(36).replace(/[^a-z]+/g, '').substr(1, 6),
        ongoingNodeId,
        { latlng: _.last(latlngs), data: { track: key }, ..._.get(propsToUse, 'endSymbol') },
        this._flags[ongoingNodeId] && this._flags[ongoingNodeId].selected,
        _.get(propsToUse, 'endSymbol.selectedProps', {})
      );

      delete this._flags[ongoingNodeId];

      const start = this._symbols[_.get(_.head(route), 'id')];
      let end = hasOngoingNode ? ongoingNode : this._symbols[_.get(_.last(route), 'id')];
      if (this._layout === LAYOUT.TRACK) {
        this._map.addLayer(track.layer);

        const hasFlag = _.get(propsToUse, 'startSymbol') || _.get(propsToUse, 'endSymbol');

        if (hasFlag) {
          if (hasOngoingNode && (this._symbols[end.id] || this._flags[end.id])) {
            log.warn(
              ERROR.INVALID_ID,
              end.id,
              `ongoing node ${end.id} which Id duplicates with a symbol or track, please rename it`
            );

            end = this._symbols[_.get(_.last(route), 'id')];
          }

          const startObj = {
            id: start.id,
            type: start.type,
            props: start.props,
            selectedProps: start.selectedProps,
            selected: start.selected
          };

          const endObj = {
            id: end.id,
            type: end.type,
            props: end.props,
            selectedProps: end.selectedProps,
            selected: end.selected
          };

          const startPropCfg = mergeProps(startObj, [start._origProps, _.get(propsToUse, 'startSymbol', {})]);
          const startSltPropCfg = mergeProps(startObj, [start._origSelectedProps, _.get(propsToUse, 'startSymbol.selectedProps', {})]);
          const endPropCfg = mergeProps(endObj, [end._origProps, _.get(propsToUse, 'endSymbol', {})]);
          const endSltPropCfg = mergeProps(endObj, [end._origSelectedProps, _.get(propsToUse, 'endSymbol.selectedProps', {})]);

          if (!_.isEmpty(startPropCfg) || !_.isEmpty(startSltPropCfg)) {
            start.set(startPropCfg, start.selected, startSltPropCfg);
          }

          if (!_.isEmpty(endPropCfg) || !_.isEmpty(endSltPropCfg)) {
            end.set(endPropCfg, end.selected, endSltPropCfg);
          }

          if (end === ongoingNode) {
            this._flags[ongoingNodeId] = end;
          }
        }
      }

      ongoingNode._props.isOngoingNode = true;

      if (isStandard || propsToUse.internalSymbols === true) {
        _.forEach(route, ({ id }) => {
          this._visible[id]
          && !this._map.hasLayer(this._symbols[id])
          && this._map.addLayer(this._symbols[id].layer);
        });
      } else if (isTrack) {
        _.forEach(route, ({ id }) => {
          if (id === start.id || id === end.id) {
            this._visible[id]
            && !this._map.hasLayer(this._symbols[id])
            && this._map.addLayer(this._symbols[id].layer);
          } else if (_.get(propsToUse, 'internalSymbols.enabled', true) === true) {
            this._visible[id]
            && !this._map.hasLayer(this._symbols[id])
            && this._map.addLayer(this._symbols[id].layer);

            if (id !== start.id || id !== end.id) {
              const internalProps = _.get(propsToUse, 'internalSymbols.props', {});
              const internalSltProps = _.get(propsToUse, 'internalSymbols.selectedProps', {});

              const origProps = _.cloneDeep(this._symbols[id]._origProps);
              const origSelectedProps = _.cloneDeep(this._symbols[id]._origSelectedProps);

              const internal = _.merge({}, origProps, internalProps);
              const selectedInternal = _.merge({}, origSelectedProps, internalSltProps);

              this._symbols[id].set(internal, this._symbols[id].selected, selectedInternal);
            }
          }
          // If internalSymbols is false, hide all internal symbols
          else if (propsToUse.internalSymbols === false) {
            this._map.hasLayer(this._symbols[id])
            && this._map.removeLayer(this._symbols[id].layer);
          }
        });
      }

      // Add the extra point to the end
      if (this._layout === LAYOUT.TRACK && hasOngoingNode && this._flags[ongoingNodeId]) {
        ongoingNode.layer.addTo(this._flagGroup);
      }
    }
  });

  this._tracks = tracks;
}

/**
 * Render contour.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#contour-options
 *
 * @param {Object} [opts]                                                               Contour options. If undefined, apply the original options. For more info, see the link above.
 * @param {String | String[] | Object | Function | undefined | null} [filter=undefined] Filter to convert matched symbols to contour. If it's a String or String[], converts symbols by ids; if it's a Object, converts symbols by all the attributes in symbols; if it's a Function, converts symbols by the given callback(Symbol symbol, String id, Object gis._symbols)
 *
 */
export function renderContour(opts, filter = undefined) {
  if (this._contour && this._map.hasLayer(this._contour)) {
    this._map.removeLayer(this._contour);
  }

  /* Only visible markers can be transferred to contours */
  const markers = _(getSymbol.call(this, filter))
    .filter((el) => {
      return _.includes([SYMBOL_TYPE.MARKER, SYMBOL_TYPE.SPOT], el.type) && this._visible[el.id];
    })
    .map(({ props }) => { return { lat: props.latlng[0], lng: props.latlng[1] }; })
    .value();

  const options = { ...this._contourOptions, ...opts };
  const { boundSW, boundNE } = options;

  // TODO: how to handle the oversize?
  /* size = [width, height] */
  const size = [
    convertLatlngToMeters([boundSW.lat, boundSW.lng], [boundSW.lat, boundNE.lng]) / FACTOR,
    convertLatlngToMeters([boundSW.lat, boundSW.lng], [boundNE.lat, boundSW.lng]) / FACTOR
  ];

  const result = contourDensity()
    .x((d) => {
      return convertLatlngToMeters([boundSW.lat, d.lng], [d.lat, d.lng]) / FACTOR;
    })
    .y((d) => {
      return convertLatlngToMeters([d.lat, boundSW.lng], [d.lat, d.lng]) / FACTOR;
    })
    .thresholds(options.thresholds) // default is 20?
    .cellSize(options.cellSize) // default is 4
    .bandwidth(options.bandwidth)  // default is 20.4939...
    .size(size)(markers);

  const min = result.length ? result[0].value : Infinity;
  const max = result.length ? _.last(result).value : 0;

  const flattened = _.reduce(result, (acc, item) => {
    const color = _.find(options.colors, (el, key) => ((item.value - min) / (max - min)) <= _.toNumber(key))
           || DEFAULT_CONTOUR_STYLE.colors['0.00'];

    return [
      ...acc,
      ..._.map(item.coordinates, (c) => {
        return {
          color,
          coords: c[0]
        };
      })
    ];
  }, []);

  const contour = L.layerGroup([]);

  _.forEach(flattened, ({ color, coords: f }) => {
    const latlngs = _.map(f, (coords) => {
      return convertMetersToLatLng([boundSW.lat, boundSW.lng], coords[0] * FACTOR, coords[1] * FACTOR);
    });

    const polyline = L.polyline(latlngs, {
      color,
      fill: false,
      weight: 2,
      interactive: false
    });

    contour.addLayer(polyline);
  });

  if (this._layout === LAYOUT.CONTOUR) {
    this._map.addLayer(contour);
  }

  this._contour = contour;
}

/**
 * Render leaflet pane.
 *
 * @param {String | String[]} pane  The names of map panes to create.
 *
 */
export function renderPane(pane) {
  const map = this._map;

  if (_.isString(pane)) {
    map.createPane(pane);
  } else if (isValidArgType(pane, [['string']])) {
    _.forEach(pane, (el) => {
      map.createPane(el);
    });
  }
}

/**
 * Render overlays.
 *
 * @param {String | Object | Object[]} overlay                      Overlay image url or options.
 * @param {String}                     [overlay.id]                 Overlay id. If undefined, a random id will be generated.
 * @param {String}                     overlay.url                  Overlay image url.
 * @param {Object}                     [overlay.size]               The size of the overlay. Default is the image's natural size.
 * @param {Number}                     overlay.size.width           The x units of the overlay.
 * @param {Number}                     overlay.size.height          The y units of the overlay.
 * @param {Object}                     [overlay.xy]                 The position of the overlay. Default is the bottom-left of the map.
 * @param {Number}                     overlay.xy.x                 The start x coordinate of the overlay.
 * @param {Number}                     overlay.xy.y                 The start y coordinate of the overlay.
 * @param {Number}                     [overlay.opacity=1.0]        Overlay opacity.
 * @param {Boolean}                    [resetMaxBounds=false]       Reset the map max bounds after setting the overlay.
 * @param {Boolean}                    [resetZoom=false]            Reset the map zoom level after setting the overlay.
 *
 */
export function renderOverlay(overlay, resetMaxBounds = false, resetZoom = false) {
  const map = this._map;
  const mapZoom = map.getZoom();
  const maxBounds = map.getBounds();
  const overlays = _.isString(overlay)
    ? [{ url: overlay }]
    : _.isPlainObject(overlay) ? [overlay] : overlay;

  _.forEach(overlays, (ol) => {
    if (!ol.url) {
      return;
    }

    // If overlay is a url string, set the overlay Id as random Id
    const id = ol.id || Math.random().toString(36).replace(/[^a-z]+/g, '').substr(1, 6);
    const layer = L.imageOverlay(ol.url, [[0, 0], [0, 0]]).addTo(map);
    const xy = _.get(ol, 'xy', { x: maxBounds._southWest.lng, y: maxBounds._southWest.lat });
    let { size } = ol;

    // Set the size as natural size if not specified
    if (!size) {
      const image = new Image();
      image.src = ol.url;
      image.addEventListener('load', () => {
        size = {
          width: image.naturalWidth,
          height: image.naturalHeight
        };

        const bounds = L.latLngBounds(
          L.latLng(xy.y, xy.x),
          L.latLng(xy.y + size.height, xy.x + size.width)
        );

        layer.setBounds(bounds);
        this._overlays[id] = {
          url: ol.url,
          zoom: ol.zoom || null,
          opacity: !_.isNil(ol.opacity) ? ol.opacity : 1,
          id,
          xy,
          size,
          layer
        };
      });
    } else {
      const bounds = L.latLngBounds(
        L.latLng(xy.y, xy.x),
        L.latLng(xy.y + size.height, xy.x + size.width)
      );

      layer.setBounds(bounds);

      this._overlays[id] = {
        url: ol.url,
        zoom: ol.zoom || null,
        opacity: !_.isNil(ol.opacity) ? ol.opacity : 1,
        id,
        xy,
        size,
        layer
      };
    }

    !_.isNil(ol.opacity) && layer.setOpacity(ol.opacity);
    if (!_.isNil(ol.zoom) && ol.zoom > mapZoom && map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });

  resetMaxBounds && _resetMapBounds.call(this, resetZoom);
}

/**
 * Re-renders the cluster nodes according to selected status.
 *
 */
export function renderSelectedCluster() {
  if (this._layout !== LAYOUT.STANDARD || (_.isEmpty(this._gCluster) && _.isEmpty(this._clusters))) {
    return;
  }

  _.forEach(this._clusterSymbols, (parent) => {
    // For performance, filter visible clusters
    const isVisibleParent = this._map.hasLayer(parent.layer);

    if (isVisibleParent) {
      // Change parents' selected status according to their chilldren selected status
      const allChildren = parent.layer.getAllChildMarkers();
      const isSelected = _.some(allChildren, lyr => this._selected[lyr._gis_id]);
      parent.setSelected(isSelected);
    }
  });
}

/**
 * Creates cluster layer group.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#cluster-options
 *
 * @param {String} id           The cluster id.
 * @param {object} [options={}] The cluster options. For more info, see the link above.
 *
 */
export function renderCluster(id, options = {}) {
  const map = this._map;
  const clusterLayer = _.get(this._clusters, `${id}.layer`);
  const globalCluster = _.get(this._gCluster, 'layer');

  // If id is a Boolean, handle it as global cluster
  const isGlobalCluster = id === true;

  const clusterOpt = {
    chunkedLoading: true,
    showCoverageOnHover: false,
    animate: true,
    ..._.omit(options.props, 'symbol')
  };

  // markers or spots
  let layers = [];
  let cluster = {};

  // Remove the original cluster layer. This is for reset
  if (clusterLayer) {
    layers = clusterLayer.getLayers();
    map.hasLayer(clusterLayer) && map.removeLayer(clusterLayer);
    delete this._clusters[id];
  } else if (isGlobalCluster && globalCluster) {
    layers = globalCluster.getLayers();
    map.hasLayer(globalCluster) && map.removeLayer(globalCluster);
    delete this._gCluster;
  }

  cluster = {
    id,
    layer: L.markerClusterGroup({
      ...clusterOpt,
      iconCreateFunction: clusterLyr => _createClusterIcon.call(this, id, options, clusterLyr)
    }),
    props: options.props
  };

  // Re-render the selected clusters' parents and children
  cluster.layer.on('animationend', renderSelectedCluster.bind(this));

  if (layers.length) {
    cluster.layer.addLayers(layers);
  }

  // Only works in standard mode
  if (this._layout === LAYOUT.STANDARD) {
    map.addLayer(cluster.layer);
  }

  // Save the cluster as global cluster or not
  if (isGlobalCluster) {
    this._gCluster = cluster;
  } else {
    this._clusters[id] = cluster;
  }
}

/**
 * Creates layer group.
 *
 * @param {String} id   The group id.
 *
 */
export function renderGroup(id) {
  const map = this._map;
  const group = _.get(this._groups, `${id}.layer`);
  const children = _.get(this._groups, `${id}.children`, []);
  let layers = [];

  // Remove the original group for reset if necessary
  if (group) {
    layers = group.getLayers();
    map.hasLayer(group) && map.removeLayer(group);
    delete this._groups[id];
  }

  const layerGroup = L.layerGroup([]);
  this._groups[id] = {
    id,
    children,
    layer: layerGroup
  };

  if (layers.length) {
    _.forEach(layers, (lyr) => {
      layerGroup.addLayer(lyr);
    });
  }

  // Group is only visible in standard/track
  if (this._layout === LAYOUT.STANDARD || this._layout === LAYOUT.TRACK) {
    map.addLayer(this._groups[id].layer);
  }
}

export default {
  renderHeatmap,
  renderTrack,
  renderContour,
  renderPane,
  renderOverlay,
  renderSelectedCluster,
  renderCluster,
  renderGroup
};
