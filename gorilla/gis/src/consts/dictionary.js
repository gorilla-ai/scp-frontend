/**
 * This fle defines all the common variables used in GIS.
 *
 * @file   All common variables used in GIS.
 * @author Liszt
 */

export const LAYOUT = {
    STANDARD: 'standard',
    HEATMAP: 'heatmap',
    TRACK: 'track',
    CONTOUR: 'contour'
}

export const DRAG_MODE = {
    PAN: 'pan',
    REGION: 'region',
    MEASURE: 'measure',
    DRAW: 'draw'
}

export const DRAW_TYPE = {
    MARKER: 'marker',
    SPOT: 'spot',
    RECTANGLE: 'rectangle',
    CIRCLE: 'circle',
    POLYGON: 'polygon',
    POLYLINE: 'polyline',
    EDIT: 'edit',
    DELETE: 'delete'
}

export const REGION_TYPE = {
    RECTANGLE: 'rectangle',
    CIRCLE: 'circle'
}

export const SYMBOL_TYPE = {
    POPUP: 'popup',
    MARKER: 'marker',
    SPOT: 'spot',
    POLYLINE: 'polyline',
    POLYGON: 'polygon',
    RECTANGLE: 'rectangle',
    CIRCLE: 'circle',
    GEOJSON: 'geojson',
    CUSTOM: 'custom'
}

export const EXTRA_SYMBOL_TYPE = {
    TRACK: 'track',
    CLUSTER: 'cluster'
}

export const INFO_TYPE = {
    POPUP: 'popup',
    TOOLTIP: 'tooltip',
    LABEL: 'label'
}

export const EVENT = [
    'selectionChange',
    'mouseover',
    'click',
    'dblclick',
    'contextmenu',
    'measurestart',
    'measure',
    'measureend',
    // Start: Events for the draw mode
    'create',
    'edit',
    // dblclick to trigger, for editing detail (label, popup, tooltip... etc)
    'editcontent',
    'delete',
    // End: Events for the draw mode
    'zoomstart',
    'zoom',
    'zoomend'
]

export const STYLE_DICT = [
    'stroke', 'color', 'weight', 'opacity', 'lineCap',
    'lineJoin', 'dashArray', 'dashOffset', 'fill', 'fillColor',
    'fillOpacity', 'fillRule', 'renderer', 'className', 'pane', 'showInvisible'
]

export const TRACK_PANE = 'trackPane'

export const HUNDRED_MILES_TO_METERS = 160934.4