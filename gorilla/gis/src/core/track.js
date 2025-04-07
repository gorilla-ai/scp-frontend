/* eslint-disable no-underscore-dangle */
/**
 * Track related functions.
 *
 * @file   This file is the collection of track-related functions.
 * @author Liszt
 */

import _ from 'lodash';

import sh from '../utils/symbol-helper';
import dh from '../utils/data-helper';
import { mergeProps as combineProps } from '../utils/merge-helper';
import { GIS_ERROR as ERROR } from '../utils/gis-exception';
import { LAYOUT } from '../consts/dictionary';

const log = require('loglevel').getLogger('gis/core/track');


/**
 * Shows/hides the ongoing nodes on the track.
 *
 * @param {String[]} trackIds   Ids of tracks which ongoing nodes will be manipulated.
 * @param {String}   action     Action type to be excuted, e.g., show or hide.
 */
function _toggleOngoingNodes(trackIds, action = 'show') {
  if (_.isEmpty(trackIds) || (action !== 'show' && action !== 'hide')) {
    return;
  }

  const transform = _.reduce(trackIds, (acc, id) => {
    acc[id] = true;
    return acc;
  }, {});

  const group = this._flagGroup;

  // Filter flags by props.data.track
  const flags = _.filter(this._flags, (flag) => {
    const trackId = _.get(flag._props, 'data.track');
    return trackId && transform[trackId];
  });

  const shouldHide = action === 'hide';
  const toggleFn = action === 'show' ? 'addLayer' : 'removeLayer';

  _.forEach(flags, (flag) => {
    (shouldHide === group.hasLayer(flag.layer)) &&
    group[toggleFn](flag.layer);
  });
}

/**
 * Updates the tracks.
 * The behavior is similar to setSymbol, which will merge global trackOptions first, then ordering the props, finally set tracks.
 * Tracks are created as Polyline in GIS, which type is 'track'.
 *
 * @param {Object | Object[]}   item   Track configs to apply.
 */
export function _setTrack(item) {
  const symbols = this._symbols;
  const tracks = this._tracks;
  const items = _.isArray(item) ? _.cloneDeep(item) : [_.cloneDeep(item)];

  const setTrackInstance = (id, { props = {}, selected, selectedProps = {} }) => {
    const track = {
      id: symbols[id].id,
      type: symbols[id].type,
      props: symbols[id].props,
      selected: symbols[id].selected,
      selectedProps: symbols[id].selectedProps
    };

    const mergedProps = combineProps(track, [track.props, props]);
    const sMergedProps = combineProps(track, [track.selectedProps, selectedProps]);

    symbols[id].set(
      mergedProps,
      selected,
      sMergedProps
    );
  };

  _.forEach(items, (elm) => {
    const { id, props, selected, selectedProps } = dh.convertRawDataToSymbolObj(elm);
    const isGlobol = _.isNil(id);

    if (!isGlobol && symbols[id]) {
      setTrackInstance(id, { props, selected, selectedProps });
    } else if (isGlobol && tracks) {
      _.forEach(tracks, (el) => {
        setTrackInstance(el, { props, selected, selectedProps });
      });
    } else {
      log.warn(ERROR.INVALID_ID, `${elm.id}`, 'Please input valid track Id or build GIS tracks first');
    }
  });
}

/**
 * Shows tracks matching the filter.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of tracks to show. If it's a String or String[], shows tracks by ids; if it's a Object, shows tracks by all the attributes in tracks; if it's a Function, shows tracks by the given callback(Symbol track, String id, Object gis._symbols)
 */
export function _showTrack(filter) {
  // Only works in track mode
  if (this._layout !== LAYOUT.TRACK) {
    log.warn(ERROR.INVALID_TYPE, this._layout, 'Please change to track mode before calling this method');
    return;
  }

  const map = this._map;
  const tracks = sh.getTrackInstance.call(this, filter);

  _.forEach(tracks, (sbl) => {
    const toShow = !this._visible[sbl.id] && !map.hasLayer(sbl.layer);
    if (toShow) {
      map.addLayer(sbl.layer);
      this._visible[sbl.id] = true;
    }
  });

  _toggleOngoingNodes.call(this, _.map(tracks, 'id'), 'show');
}

/**
 * Hides tracks matching the filter.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of tracks to hide. If it's a String or String[], hides tracks by ids; if it's a Object, hides tracks by all the attributes in tracks; if it's a Function, hides tracks by the given callback(Symbol track, String id, Object gis._symbols)
 */
export function _hideTrack(filter) {
  // Only works in track mode
  if (this._layout !== LAYOUT.TRACK) {
    log.warn(ERROR.INVALID_TYPE, this._layout, 'Please change to track mode before calling this method');
    return;
  }

  const map = this._map;
  const tracks = sh.getTrackInstance.call(this, filter);

  _.forEach(tracks, (sbl) => {
    const toHide = this._visible[sbl.id] && map.hasLayer(sbl.layer);
    if (toHide) {
      map.removeLayer(sbl.layer);
      delete this._visible[sbl.id];
    }
  });

  _toggleOngoingNodes.call(this, _.map(tracks, 'id'), 'hide');
}

/**
 * Shows tracks matching the filter.
 * Tracks not match the filter will be hidden.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of tracks to show. If it's a String or String[], shows tracks by ids; if it's a Object, shows tracks by all the attributes in tracks; if it's a Function, shows tracks by the given callback(Symbol track, String id, Object gis._symbols)
 */
export function _filterTrack(filter) {
  // Only works in track mode
  if (this._layout !== LAYOUT.TRACK) {
    log.warn(ERROR.INVALID_TYPE, this._layout, 'Please change to track mode before calling this method');
    return;
  }

  const map = this._map;
  const tracks = sh.getTrackInstance.call(this, filter);
  const trackIds = _.map(tracks, 'id');

  // Hide all tracks if the filter is undefined
  if (_.isEmpty(filter) && filter !== true) {
    _.forEach(this._tracks, (id) => {
      map.hasLayer(tracks[id].layer) && map.removeLayer(tracks[id].layer);
    });

    return;
  }

  _.forEach(this._tracks, (id) => {
    const track = tracks[id];
    const toShow = track && !map.hasLayer(track.layer);
    const toHide = !track && map.hasLayer(this._symbols[id].layer);

    if (toShow) {
      map.addLayer(track.layer);
      this._visible[id] = true;
    } else if (toHide) {
      map.removeLayer(this._symbols[id].layer);
      delete this._visible[id];
    }
  });

  _toggleOngoingNodes.call(this, trackIds, 'show');
  _toggleOngoingNodes.call(this, _.difference(this._tracks, trackIds), 'hide');
}

export default {
  _setTrack,
  _showTrack,
  _hideTrack,
  _filterTrack
};
