/**
 * A GIS base class.
 *
 * For users, the apis they know are from this file.
 * All apis are implemented in files under core/ or utils/ folders.
 * Consider core/ folder is the intermediate layer in whole GIS structure,
 * and utils/ folder is the foundation in GIS
 *
 * @file   This file is the base GIS class.
 * @author Liszt
 */

import _ from 'lodash';
import 'leaflet';
import 'leaflet-draw';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import { EventEmitter } from 'events';

import { initialize } from './utils/setup-helper';
import { getPathDistance } from './utils/gis-helper';
import { getSymbol } from './utils/symbol-helper';
import core from './core';

import { REGION_TYPE, EXTRA_SYMBOL_TYPE } from './consts/dictionary';
import importCSS from './css';


class Gis extends EventEmitter {
  constructor(containerId, options, data) {
    super();
    initialize.call(this, containerId, options, data);
    importCSS();
  }

  get map() {
    return this._map;
  }

  get heatmap() {
    return this._heatmap;
  }

  // Get tracks' layers (leaflet polyline instance)
  get tracks() {
    return _.map(this._tracks, id => (this._symbols[id].layer));
  }

  get contour() {
    return this._contour;
  }

  get symbols() {
    // Should only return standard or drawn symbols
    return _.reduce(this._symbols, (acc, sbl, id) => {
      const shouldPick = sbl.type !== EXTRA_SYMBOL_TYPE.TRACK;
      if (shouldPick) {
        acc[id] = sbl;
      }

      return acc;
    }, {});
  }

  // Get drawn symbols
  get drawn() {
    return _.reduce(this._symbols, (acc, sbl, id) => {
      // _isDrawn is set in the drawMode plugin. See createDrawHandler() in plugins/modes
      if (sbl._isDrawn) {
        acc[id] = sbl;
      }

      return acc;
    }, {});
  }

  // Get selected symbols' ids
  get selected() {
    return _.keys(_.pickBy(this._selected, selected => selected));
  }

  // Get visible symbols' ids
  get visible() {
    // Should only return standard or drawn symbols
    return _.keys(_.pickBy(this._visible, (visible, id) => (visible && this._symbols[id].type !== EXTRA_SYMBOL_TYPE.TRACK)));
  }

  get interval() {
    return this._interval;
  }

  get imageOverlays() {
    return _.map(this._overlays, el => _.omit(el, 'layer'));
  }

  on(event, filter, handler) {
    core.event._on.apply(this, _.filter([event, filter, handler], arg => !!arg));
    return this;
  }

  off(event, filter, handler) {
    core.event._off.apply(this, _.filter([event, filter, handler], arg => !!arg));
    return this;
  }

  getMap() {
    return this._map;
  }

  // Get symbols matching the filter, and output symbols as plain Object instead of Symbol class.
  getSymbol(filter) {
    const symbols = getSymbol.call(this, filter, true);
    const filtered = _.filter(symbols, sbl => (sbl.type !== EXTRA_SYMBOL_TYPE.TRACK));

    // Fix issue #27
    if (_.isString(filter)) {
      return filtered[0] || null;
    }

    return filtered;
  }

  getSelection() {
    return _.keys(_.pickBy(this._selected, el => el));
  }

  // Get the distance of the path.
  getDistance(latlngs) {
    return getPathDistance(latlngs, this._map.options.crs);
  }

  // All symbols, including _track or _cluster can also be selected
  setSelection(filter) {
    const symbols = { ...this._symbols, ...this._flags };
    const selection = (_.isEmpty(filter) && !_.isFunction(filter))
      ? {}
      : _.reduce(getSymbol.call({ _symbols: { ...this._symbols, ...this._flags } }, filter, true, 'id'), (acc, id) => {
        acc[id] = true;
        return acc;
      }, {});

    _.forEach(symbols, (el) => {
      const isSelected = !!selection[el.id];
      if (isSelected !== el.isSelected()) {
        el.setSelected(isSelected);
      }
    });

    // Trigger selectionChange when selected are not the same
    if (!_.isEqual(this._selected, selection)) {
      this._selected = selection;
      // isMultiple is a signal to pass selected ids argument in handler
      this._map.fire('selectionChange', { isMultiple: true })
        .fire('clusterselectionChange');
    }

    return this;
  }

  setImageOverlay(overlays) {
    core.image._setImageOverlay.call(this, overlays);
    return this;
  }

  // TODO: other crs passed?
  setMaxBounds(corner1, corner2, fitBounds = false) {
    core.map._setMaxBounds.call(this, corner1, corner2, fitBounds);
    return this;
  }

  setLayout(layout) {
    core.map._setLayout.call(this, layout);
    return this;
  }

  setDragMode(dragMode, regionType = REGION_TYPE.RECTANGLE, drawConfig = {}) {
    core.map._setDragMode.call(this, dragMode, regionType, drawConfig);
    return this;
  }

  setRegionType(regionType) {
    core.map._setRegionType.call(this, regionType);
    return this;
  }

  setDrawType(drawType, drawConfig = {}) {
    core.map._setDrawType.call(this, drawType, drawConfig);
    return this;
  }

  setGisInterval(interval) {
    core.map._setGisInterval.call(this, interval);
    return this;
  }

  setSymbol(symbols) {
    core.symbol._setSymbol.call(this, symbols);
    return this;
  }

  setHeatmap(options) {
    core.heatmap._setHeatmap.call(this, options);
    return this;
  }

  /*
    Modify the track's path is not allowed here.
    To modify it, need to modify the symbols' positions
  */
  setTrack(tracks) {
    core.track._setTrack.call(this, tracks);
    return this;
  }

  // Enhancement for issue #7
  zoomToFit(filter) {
    core.map._zoomToFit.call(this, filter);
    return this;
  }

  clear() {
    core.map._clear.call(this);
    return this;
  }

  // TBD: functionalities of show/hide/filter overlaye?
  removeImageOverlay(filter) {
    core.image._removeImageOverlay.call(this, filter);
    return this;
  }

  removeSymbol(filter) {
    core.symbol._removeSymbol.call(this, filter);
    return this;
  }

  // Checks whether the symbol exists or not.
  exists(id) {
    return !!this._symbols[id];
  }

  showSymbol(filter, interval = []) {
    core.filter._showSymbol.call(this, filter, interval);
    return this;
  }

  hideSymbol(filter, interval = []) {
    core.filter._hideSymbol.call(this, filter, interval);
    return this;
  }

  filterSymbol(filter, interval = []) {
    const dt = new Date().valueOf();
    core.filter._filterSymbol.call(this, filter, interval);
    console.error('Time: ', new Date().valueOf() - dt);
    return this;
  }

  showTrack(filter) {
    core.track._showTrack.call(this, filter);
    return this;
  }

  hideTrack(filter) {
    core.track._hideTrack.call(this, filter);
    return this;
  }

  filterTrack(filter) {
    core.track._filterTrack.call(this, filter);
    return this;
  }
}

export default Gis;
