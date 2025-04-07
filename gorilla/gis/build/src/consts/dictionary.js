"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HUNDRED_MILES_TO_METERS = exports.TRACK_PANE = exports.STYLE_DICT = exports.EVENT = exports.INFO_TYPE = exports.EXTRA_SYMBOL_TYPE = exports.SYMBOL_TYPE = exports.REGION_TYPE = exports.DRAW_TYPE = exports.DRAG_MODE = exports.LAYOUT = void 0;

/**
 * This fle defines all the common variables used in GIS.
 *
 * @file   All common variables used in GIS.
 * @author Liszt
 */
var LAYOUT = {
  STANDARD: 'standard',
  HEATMAP: 'heatmap',
  TRACK: 'track',
  CONTOUR: 'contour'
};
exports.LAYOUT = LAYOUT;
var DRAG_MODE = {
  PAN: 'pan',
  REGION: 'region',
  MEASURE: 'measure',
  DRAW: 'draw'
};
exports.DRAG_MODE = DRAG_MODE;
var DRAW_TYPE = {
  MARKER: 'marker',
  SPOT: 'spot',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  POLYGON: 'polygon',
  POLYLINE: 'polyline',
  EDIT: 'edit',
  DELETE: 'delete'
};
exports.DRAW_TYPE = DRAW_TYPE;
var REGION_TYPE = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle'
};
exports.REGION_TYPE = REGION_TYPE;
var SYMBOL_TYPE = {
  POPUP: 'popup',
  MARKER: 'marker',
  SPOT: 'spot',
  POLYLINE: 'polyline',
  POLYGON: 'polygon',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  GEOJSON: 'geojson',
  CUSTOM: 'custom'
};
exports.SYMBOL_TYPE = SYMBOL_TYPE;
var EXTRA_SYMBOL_TYPE = {
  TRACK: 'track',
  CLUSTER: 'cluster'
};
exports.EXTRA_SYMBOL_TYPE = EXTRA_SYMBOL_TYPE;
var INFO_TYPE = {
  POPUP: 'popup',
  TOOLTIP: 'tooltip',
  LABEL: 'label'
};
exports.INFO_TYPE = INFO_TYPE;
var EVENT = ['selectionChange', 'mouseover', 'click', 'dblclick', 'contextmenu', 'measurestart', 'measure', 'measureend', // Start: Events for the draw mode
'create', 'edit', // dblclick to trigger, for editing detail (label, popup, tooltip... etc)
'editcontent', 'delete', // End: Events for the draw mode
'zoomstart', 'zoom', 'zoomend'];
exports.EVENT = EVENT;
var STYLE_DICT = ['stroke', 'color', 'weight', 'opacity', 'lineCap', 'lineJoin', 'dashArray', 'dashOffset', 'fill', 'fillColor', 'fillOpacity', 'fillRule', 'renderer', 'className', 'pane', 'showInvisible'];
exports.STYLE_DICT = STYLE_DICT;
var TRACK_PANE = 'trackPane';
exports.TRACK_PANE = TRACK_PANE;
var HUNDRED_MILES_TO_METERS = 160934.4;
exports.HUNDRED_MILES_TO_METERS = HUNDRED_MILES_TO_METERS;
//# sourceMappingURL=dictionary.js.map