"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._setTrack = _setTrack;
exports._showTrack = _showTrack;
exports._hideTrack = _hideTrack;
exports._filterTrack = _filterTrack;
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _symbolHelper = _interopRequireDefault(require("../utils/symbol-helper"));

var _dataHelper = _interopRequireDefault(require("../utils/data-helper"));

var _mergeHelper = require("../utils/merge-helper");

var _gisException = require("../utils/gis-exception");

var _dictionary = require("../consts/dictionary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable no-underscore-dangle */

/**
 * Track related functions.
 *
 * @file   This file is the collection of track-related functions.
 * @author Liszt
 */
var log = require('loglevel').getLogger('gis/core/track');
/**
 * Shows/hides the ongoing nodes on the track.
 *
 * @param {String[]} trackIds   Ids of tracks which ongoing nodes will be manipulated.
 * @param {String}   action     Action type to be excuted, e.g., show or hide.
 */


function _toggleOngoingNodes(trackIds) {
  var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'show';

  if (_lodash["default"].isEmpty(trackIds) || action !== 'show' && action !== 'hide') {
    return;
  }

  var transform = _lodash["default"].reduce(trackIds, function (acc, id) {
    acc[id] = true;
    return acc;
  }, {});

  var group = this._flagGroup; // Filter flags by props.data.track

  var flags = _lodash["default"].filter(this._flags, function (flag) {
    var trackId = _lodash["default"].get(flag._props, 'data.track');

    return trackId && transform[trackId];
  });

  var shouldHide = action === 'hide';
  var toggleFn = action === 'show' ? 'addLayer' : 'removeLayer';

  _lodash["default"].forEach(flags, function (flag) {
    shouldHide === group.hasLayer(flag.layer) && group[toggleFn](flag.layer);
  });
}
/**
 * Updates the tracks.
 * The behavior is similar to setSymbol, which will merge global trackOptions first, then ordering the props, finally set tracks.
 * Tracks are created as Polyline in GIS, which type is 'track'.
 *
 * @param {Object | Object[]}   item   Track configs to apply.
 */


function _setTrack(item) {
  var symbols = this._symbols;
  var tracks = this._tracks;
  var items = _lodash["default"].isArray(item) ? _lodash["default"].cloneDeep(item) : [_lodash["default"].cloneDeep(item)];

  var setTrackInstance = function setTrackInstance(id, _ref) {
    var _ref$props = _ref.props,
        props = _ref$props === void 0 ? {} : _ref$props,
        selected = _ref.selected,
        _ref$selectedProps = _ref.selectedProps,
        selectedProps = _ref$selectedProps === void 0 ? {} : _ref$selectedProps;
    var track = {
      id: symbols[id].id,
      type: symbols[id].type,
      props: symbols[id].props,
      selected: symbols[id].selected,
      selectedProps: symbols[id].selectedProps
    };
    var mergedProps = (0, _mergeHelper.mergeProps)(track, [track.props, props]);
    var sMergedProps = (0, _mergeHelper.mergeProps)(track, [track.selectedProps, selectedProps]);
    symbols[id].set(mergedProps, selected, sMergedProps);
  };

  _lodash["default"].forEach(items, function (elm) {
    var _dh$convertRawDataToS = _dataHelper["default"].convertRawDataToSymbolObj(elm),
        id = _dh$convertRawDataToS.id,
        props = _dh$convertRawDataToS.props,
        selected = _dh$convertRawDataToS.selected,
        selectedProps = _dh$convertRawDataToS.selectedProps;

    var isGlobol = _lodash["default"].isNil(id);

    if (!isGlobol && symbols[id]) {
      setTrackInstance(id, {
        props: props,
        selected: selected,
        selectedProps: selectedProps
      });
    } else if (isGlobol && tracks) {
      _lodash["default"].forEach(tracks, function (el) {
        setTrackInstance(el, {
          props: props,
          selected: selected,
          selectedProps: selectedProps
        });
      });
    } else {
      log.warn(_gisException.GIS_ERROR.INVALID_ID, "".concat(elm.id), 'Please input valid track Id or build GIS tracks first');
    }
  });
}
/**
 * Shows tracks matching the filter.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of tracks to show. If it's a String or String[], shows tracks by ids; if it's a Object, shows tracks by all the attributes in tracks; if it's a Function, shows tracks by the given callback(Symbol track, String id, Object gis._symbols)
 */


function _showTrack(filter) {
  var _this = this;

  // Only works in track mode
  if (this._layout !== _dictionary.LAYOUT.TRACK) {
    log.warn(_gisException.GIS_ERROR.INVALID_TYPE, this._layout, 'Please change to track mode before calling this method');
    return;
  }

  var map = this._map;

  var tracks = _symbolHelper["default"].getTrackInstance.call(this, filter);

  _lodash["default"].forEach(tracks, function (sbl) {
    var toShow = !_this._visible[sbl.id] && !map.hasLayer(sbl.layer);

    if (toShow) {
      map.addLayer(sbl.layer);
      _this._visible[sbl.id] = true;
    }
  });

  _toggleOngoingNodes.call(this, _lodash["default"].map(tracks, 'id'), 'show');
}
/**
 * Hides tracks matching the filter.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of tracks to hide. If it's a String or String[], hides tracks by ids; if it's a Object, hides tracks by all the attributes in tracks; if it's a Function, hides tracks by the given callback(Symbol track, String id, Object gis._symbols)
 */


function _hideTrack(filter) {
  var _this2 = this;

  // Only works in track mode
  if (this._layout !== _dictionary.LAYOUT.TRACK) {
    log.warn(_gisException.GIS_ERROR.INVALID_TYPE, this._layout, 'Please change to track mode before calling this method');
    return;
  }

  var map = this._map;

  var tracks = _symbolHelper["default"].getTrackInstance.call(this, filter);

  _lodash["default"].forEach(tracks, function (sbl) {
    var toHide = _this2._visible[sbl.id] && map.hasLayer(sbl.layer);

    if (toHide) {
      map.removeLayer(sbl.layer);
      delete _this2._visible[sbl.id];
    }
  });

  _toggleOngoingNodes.call(this, _lodash["default"].map(tracks, 'id'), 'hide');
}
/**
 * Shows tracks matching the filter.
 * Tracks not match the filter will be hidden.
 *
 * @param   {String | String[] | Object | Function}  filter     Filter of tracks to show. If it's a String or String[], shows tracks by ids; if it's a Object, shows tracks by all the attributes in tracks; if it's a Function, shows tracks by the given callback(Symbol track, String id, Object gis._symbols)
 */


function _filterTrack(filter) {
  var _this3 = this;

  // Only works in track mode
  if (this._layout !== _dictionary.LAYOUT.TRACK) {
    log.warn(_gisException.GIS_ERROR.INVALID_TYPE, this._layout, 'Please change to track mode before calling this method');
    return;
  }

  var map = this._map;

  var tracks = _symbolHelper["default"].getTrackInstance.call(this, filter);

  var trackIds = _lodash["default"].map(tracks, 'id'); // Hide all tracks if the filter is undefined


  if (_lodash["default"].isEmpty(filter) && filter !== true) {
    _lodash["default"].forEach(this._tracks, function (id) {
      map.hasLayer(tracks[id].layer) && map.removeLayer(tracks[id].layer);
    });

    return;
  }

  _lodash["default"].forEach(this._tracks, function (id) {
    var track = tracks[id];
    var toShow = track && !map.hasLayer(track.layer);
    var toHide = !track && map.hasLayer(_this3._symbols[id].layer);

    if (toShow) {
      map.addLayer(track.layer);
      _this3._visible[id] = true;
    } else if (toHide) {
      map.removeLayer(_this3._symbols[id].layer);
      delete _this3._visible[id];
    }
  });

  _toggleOngoingNodes.call(this, trackIds, 'show');

  _toggleOngoingNodes.call(this, _lodash["default"].difference(this._tracks, trackIds), 'hide');
}

var _default = {
  _setTrack: _setTrack,
  _showTrack: _showTrack,
  _hideTrack: _hideTrack,
  _filterTrack: _filterTrack
};
exports["default"] = _default;
//# sourceMappingURL=track.js.map