/* eslint-disable no-underscore-dangle */
/**
 * This fle defines and implements all symbol-related base functions.
 *
 * @file   Functions related to symbol creation, update, and getter.
 * @author Liszt
 */

import _ from 'lodash';

import { convertRawDataToSymbolObj, isMatch } from './data-helper';
import { renderCluster, renderGroup} from './render-helper';
import { mergeProps as combineProps } from './merge-helper';
import { GIS_ERROR as ERROR } from './gis-exception';

// import GisPopup from '../symbols/popup'
import GisMarker from '../symbols/marker';
import GisSpot from '../symbols/spot';
import GisPolyline from '../symbols/polyline';
import GisPolygon from '../symbols/polygon';
import GisRectangle from '../symbols/rectangle';
import GisCircle from '../symbols/circle';
import GisGeoJSON from '../symbols/geojson';
import { SYMBOL_TYPE, EXTRA_SYMBOL_TYPE, LAYOUT } from '../consts/dictionary';

const log = require('loglevel').getLogger('gis/utils/symbol-helper');

const CREATOR = {
  // POPUP: GisPopup,
  MARKER: GisMarker,
  SPOT: GisSpot,
  POLYLINE: GisPolyline,
  POLYGON: GisPolygon,
  RECTANGLE: GisRectangle,
  CIRCLE: GisCircle,
  GEOJSON: GisGeoJSON
};

/**
 * Creates a new symbol on the map
 *
 * @param {Object} item     The symbol raw data
 */
function _createSymbol(item) {
  if (this._symbols[item.id]) {
    log.warn(ERROR.INVALID_ID, item.id, `${item.type} ${item.id} which Id duplicates, please rename it`);
    return;
  }

  const map = this._map;
  let symbolObj = convertRawDataToSymbolObj(item);
  let mergedProps = {};
  let sMergedProps = {};

  _.forEach(this._symbolOptions, (opt) => {
    if (!opt.match || isMatch(item, opt.match)) {
      mergedProps = combineProps(symbolObj, [mergedProps, opt.props]);
      sMergedProps = combineProps(symbolObj, [sMergedProps, opt.selectedProps]);
    }
  });

  mergedProps = combineProps(symbolObj, [mergedProps, symbolObj.props]);
  sMergedProps = combineProps(symbolObj, [sMergedProps, symbolObj.selectedProps]);

  symbolObj = {
    ...symbolObj,
    type: symbolObj.type || mergedProps.type,
    props: _.omit(mergedProps, 'type'),
    selectedProps: sMergedProps,
    selected: symbolObj.selected || false
  };

  if (!symbolObj.type) {
    log.warn(
      ERROR.INVALID_TYPE,
      `${symbolObj.id}: ${symbolObj.type}`,
      'Please set valid symbol type in input data or symbolOptions.props'
    );

    return;
  }

  // const {id, type, props, selected, selectedProps} = convertRawDataToSymbolObj(itemToCvt)
  const { id, type, props, selected, selectedProps } = symbolObj;

  // TBD: How to handle custom symbol?
  const NewSymbol = CREATOR[_.toUpper(type)];
  const symbol = type !== SYMBOL_TYPE.CUSTOM
    ? new NewSymbol(id, props, selected, selectedProps)
    : new CREATOR.MARKER(id, props, selected, selectedProps);

  // Bind tooltip to layer
  if (!_.isEmpty(props.tooltip)) {
    const tooltip = selected ? (selectedProps.tooltip || props.tooltip) : props.tooltip;
    symbol.setInfo('tooltip', tooltip);
  }

  // Bind popup to layer
  if (!_.isEmpty(props.popup)) {
    symbol.setInfo('popup', props.popup);
  }

  this._symbols[id] = symbol;
  this._visible[id] = true;

  if (symbol.isSelected()) {
    this._selected[id] = true;
  }

  if (!_.includes(['marker', 'spot'], type)) {
    symbol.layer.addTo(map);
  } else {
    const clusterId = props.cluster;

    if (clusterId) {
      // Check the cluster exist or not. If not, create one
      const isNotExit = (!_.isBoolean(clusterId) && !this._clusters[clusterId]) || (clusterId === true && !this._gCluster);

      if (isNotExit) {
        const options = _.chain(this._clusterOptions)
          .filter((el) => { return el.id === clusterId || !el.id; })
          .reduce((acc, el) => { return _.merge(acc, el); }, {})
          .value();

        renderCluster.call(
          this,
          clusterId,
          options,
          clusterId === true ? {} : symbol._icon
        );
      }

      // Add to global cluster when cluster is set as *true*
      if (clusterId === true) {
        this._gCluster.layer.addLayer(symbol.layer);
      } else {
        this._clusters[clusterId].layer.addLayer(symbol.layer);
      }
    } else {
      symbol.layer.addTo(map);
    }
  }

  // Group symbols if group is specified
  if (props.group) {
    const groupId = props.group;

    if (!this._groups[groupId]) {
      renderGroup.call(this, groupId);
    }

    /*
      If a clustered symbol is added to layerGroup, it will keep on the map with layerGroup.
      This makes cluster meaningless
    */
    this._groups[groupId].children.push(symbol.id);
    if (!symbol.props.cluster) {
      this._groups[groupId].layer.addLayer(symbol.layer);
    }
  }
}

/**
 * Updates the target symbol. The id & type should match the existed symbol.
 *
 * @param {Object} item     The symbol data (GIS formatted, that is, symbol features should be contained in the key "props").
 */
function _updateSymbol(item) {
  const map = this._map;
  // const symbol = _.cloneDeep(this._symbols[item.id])
  const symbol = this._symbols[item.id];
  const symbolObj = {
    id: symbol.id,
    type: symbol.type,
    selected: symbol.selected,
    selectedProps: symbol.selectedProps,
    props: symbol.props
  };

  const { props, selected, selectedProps } = convertRawDataToSymbolObj(item);

  const mergedProps = combineProps(symbolObj, [symbol.props, props]);
  const sMergedProps = combineProps(symbolObj, [symbol.selectedProps, selectedProps]);

  symbol.set(mergedProps, selected, sMergedProps);

  // Set cluster/group if changed
  if (mergedProps.cluster !== symbol.props.cluster) {
    const clusterId = mergedProps.cluster;
    const origCluster = symbol.props.cluster;

    /*
      If map.hasLayer(cluster layer), map is under standard mode.
      This means cluster is visible on the map.
    */
    const hasClusterLyr = _.isBoolean(symbol.props.cluster) ?
      (symbol.props.cluster ? map.hasLayer(this._gCluster.layer) : false) :
      map.hasLayer(this._clusters[origCluster].layer);

    if (_.isBoolean(clusterId)) {
      // Remove from cluster when new props is *false*
      if (!clusterId) {
        this._clusters[origCluster] &&
        this._clusters[origCluster].layer.removeLayer(symbol.layer);

        // Add the symbol to map if it's visible on the map
        hasClusterLyr &&
        this._visible[symbol.id] &&
        map.addLayer(symbol.layer);
      }
      // Add to default cluster
      else {
        const options = _.chain(this._clusterOptions)
          .filter(el => { return !el.id; })
          .reduce((acc, el) => { return _.merge(acc, el); }, {})
          .value();

        // Create it if global cluster is not exist
        if (!this._gCluster) {
          renderCluster.call(this, true, options);
        }

        hasClusterLyr &&
        this._visible[symbol.id] &&
        this._gCluster.layer.addLayer(symbol.layer);
      }
    }
    // Create a new cluster
    else if (clusterId && !this._clusters[clusterId]) {
      const options = _.chain(this._clusterOptions)
        .filter(el => { return el.id === clusterId || !el.id; })
        .reduce((acc, el) => { return _.merge(acc, el); }, {})
        .value();

      renderCluster.call(this, clusterId, options, symbol._icon);
      this._clusters[clusterId].layer.addLayer(symbol.layer);
    }
    // Move the cluster to the other one, or add to a cluster
    else if (clusterId && this._clusters[clusterId]) {
      this._clusters[origCluster] && this._clusters[origCluster].layer.removeLayer(symbol.layer);
      this._clusters[clusterId].layer.addLayer(symbol.layer);
    }
  }

  if (mergedProps.group !== symbol.props.group) {
    const groupId = mergedProps.group;
    const origGroup = symbol.props.group;

    // Remove from group when new props is undefined or null
    if (groupId === false && this._groups[origGroup]) {
      this._groups[origGroup].layer.removeLayer(symbol.layer);
      _.remove(this._groups[origGroup].children, id => { return id === symbol.id; });
    }
    // Create a new group
    else if (groupId && !this._groups[groupId]) {
      renderGroup.call(this, groupId);

      this._groups[groupId].children.push(symbol.id);
      !symbol.props.cluster && this._groups[groupId].layer.addLayer(symbol.layer);
    }
    // Move the group to the other one, or add to a group
    else if (groupId && this._groups[groupId]) {
      this._groups[origGroup] && this._groups[origGroup].layer.removeLayer(symbol.layer);
      this._groups[origGroup] && _.remove(this._groups[origGroup].children, id => { return id === symbol.id; });

      this._groups[groupId].children.push(symbol.id);
      !symbol.props.cluster && this._groups[groupId].layer.addLayer(symbol.layer);
    }
  }
}


/**
 * Gets symbols' instances or raw data according to given filter.
 *
 * @param {String | String[] | Object | Function | undefined | null} filter                 Filter to get the symbols. If it's a String or String[], find symbols by ids; if it's a Object, searches symbols by all the attributes in symbols; if it's a Function, filters symbols by the given callback(Symbol symbol, String id, Object gis._symbols)
 * @param {Boolean}                                                  [ifOutputData=false]   Output as raw data or not.
 * @param {String | String[] | undefined}                            [path=undefined]       Which keys should be output? Works when ifOutputData=true. If it's a String, returns a array of value of symbol[path]; if it's a String[], returns a symbol data object with target fields(path); if it's undefined, returns all the fields of the symbol
 *
 * @return {Symbol[] | type[] | Object[]}  The filtered symbol data
 */
export function getSymbol(filter, ifOutputData=false, path=undefined) {
  const symbols = this._symbols;
  let refined = [];

  if (_.isString(filter)) {
    // Use id to find
    refined = _.filter(symbols, ({ id }) => id === filter);
  } else if (_.isArray(filter) && filter.length > 0) {
    // Use ids[] to find
    const ids = _.reduce(filter, (acc, id) => {
      acc[id] = id;
      return acc;
    }, {});

    // refined = _.filter(symbols, el => _.includes(filter, el.id))
    refined = _.filter(symbols, el => !!ids[el.id]);
  } else if (_.isPlainObject(filter)) {
    // Use attributes, like id/type/props/... to find
    // Apr 26, 2018 Update: Filter can directly set 'data' key as rule, like {id, data:{....}}
    // May 21, 2018 Update: Filter can directly set 'group' key as rule, like {id, group, data:{....}}
    const transformed = filter.data || filter.group
      ? {
        ..._.omit(filter, ['data', 'group']),
        props: {
          ..._.get(filter, 'props', {}),
          data: _.get(filter, 'data'),
          group: _.get(filter, 'group')
        }
      }
      : filter;

    transformed.props = _.omitBy(transformed.props, _.isNil);
    refined = _.filter(symbols, el => _.isMatch(el, transformed));
  } else if (_.isFunction(filter)) {
    // Use filter function to find, with parameters, such as id, props, type, etc.
    refined = _.filter(symbols, (el, key) => filter(el, key, symbols));
  } else if (_.isNil(filter) || _.isEmpty(filter)) {
    refined = _.toArray(symbols);
  } else {
    log.warn(ERROR.INVALID_ARGS, filter, 'Filter should be String, String[], Object, or Function');
    return [];
  }

  // Convert refined symbols to text data when ifOutputData is given
  if (ifOutputData && refined.length > 0) {
    let data = [];
    if (_.isString(path)) {
      data = _.map(refined, el => {
        return _.get(el, path);
      });
    } else if (_.isArray(path)) {
      data = _.map(refined, el => {
        return _.reduce(path, (result, p) => {
          const val = _.get(el, p);
          const field = p.replace('props.', '');

          result[field] = val;
          return result;
        }, {});
      });
    } else if (_.isNil(path)) {
      data = _.map(refined, ({ id, type, props, selected, selectedProps }) => {
        return {
          id,
          type,
          selected,
          selectedProps,
          ...props
        };
      });
    } else {
      log.warn(ERROR.INVALID_ARGS, path, 'Path should be a String, String[], or empty');
    }

    return data;
  } else {
    return refined;
  }
}

/**
 * Gets the deepest and the last node within a DOM.
 * If no childNodes is found, return the DOM itself.
 *
 * @param {HTMLElement} targetDom       The target DOM to be tarversed.
 * @param {String}      [selector='*']  Output as raw data or not.
 *
 * @return {HTMLElement}   The deepest node in the target DOM
 */
export function getDeepestDom(targetDom, selector='*') {
  let lowestLevel = 0; // relative lowest depth

  const doms = targetDom.querySelectorAll(selector);
  const deepest = _.reduce(doms, (acc, elm) => {
    let depth = 0;   // relative depth
    let el = elm;

    while (el.children.length > 0) {
      depth++;
      el = getDeepestDom(el, '*');
    }

    if (depth >= lowestLevel) {
      acc = el;
      lowestLevel = depth;
    }

    return acc;
  }, targetDom);

  return deepest;
}

/**
 * Gets the Track instances according to filter
 *
 * @param {String | String[] | Object | Function | undefined | null}    filter     Filter to get the tracks. If it's a String or String[], find tracks by ids; if it's a Object, searches tracks by all the attributes in tracks; if it's a Function, filters tracks by the given callback(Symbol track, String id, Object gis._symbols)
 *
 * @return {Object}    All the Track instances matching the filter.
 */
export function getTrackInstance(filter) {
  const symbols = getSymbol.call(this, filter);
  const tracks = _.reduce(symbols, (acc, sbl) => {
    if (sbl.type === EXTRA_SYMBOL_TYPE.TRACK) {
      acc[sbl.id] = sbl;
    }

    return acc;
  }, {});

  return tracks;
}

/**
 * Creates or updates the symbol
 *
 * @param {Object} symbol   The symbol raw data.
 *
 */
export function renderSymbol(symbol) {
  if (!this._symbols[symbol.id]) {
    _createSymbol.call(this, symbol);
  } else {
    _updateSymbol.call(this, symbol);
  }
}

/**
 * Updates the cluster data when the cluster should change, e.g., zoom in/out to change the cluste data or apperance.
 *
 */
export function updateClusterSymbol() {
  if (this._layout !== LAYOUT.STANDARD) {
    return;
  }

  if (this._gCluster) {
    this._gCluster.layer.refreshClusters();
  }

  _.forEach(this._clusters, cluster => {
    cluster.layer.refreshClusters();
  });

  // Update the cluster data
  _.forEach(this._clusterSymbols, (sbl, id) => {
    const childrenIds = _.map(sbl.layer.getAllChildMarkers(), '_gis_id');
    // This cluster symbol has no children cluster, or no symbols are clustered under it
    const shouldBeRemoved = sbl.layer._childClusters.length === 0 &&
                childrenIds.length <= 1;

    if (shouldBeRemoved) {
      delete this._clusterSymbols[id];
    } else {
      sbl._props.data.ids = childrenIds;
      sbl._props.data.count = childrenIds.length;
    }
  });

  this._map.fire('clusterselectionChange');
}

export default {
  getSymbol,
  getDeepestDom,
  getTrackInstance,
  renderSymbol,
  updateClusterSymbol
};