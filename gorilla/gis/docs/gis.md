### Introduction
*GIS* library, provide a set of symbols and manipulation of these symbols, using leaflet
 *  [Demo](http://gui.i8.vc:8098)

#### Features:
 *  built in symbols: marker, polyline, polygon, rectangle, circle, geoJSON, also accept custom leaflet layer
 *  get/set/removal of symbols (by id)
 *  map options and styling options supported by leaflet, such as
    *  tile base maps
    *  enabling/disabling zooming/panning
    *  center one or more symbols
    *  provide styling options for symbols when selected (or other statuses)
    *  dragging of markers
 *  tooltip, popup for symbols
 *  label/icon for markers
 *  provide layouts: standard, heatmap, track map
 *  provide different modes when dragging: panning or region selection
 *  select symbols in region using rectangle or circle
 *  show/hide/filter symbol
 *  path planning using google API routing
 *  events: 
    * selectionChange for when selected symbols are changed
    * mouseover, click, dblClick, contextmenu on symbols

<hr/>

### API

#### Usage example
```
import _ from 'lodash'
import L from 'leaflet'
import Gis from 'gis'

const symbols = [
  {
    "id": "set2-marker_1",
    "type": "marker",
    "latlng": [44.5, 134.4],
    "heatmap": {
      "intensity": 0.44
    },
    "tooltip": "New marker 1",
    "ts": [1483275600, 1483276600],
    "selected":true,
    "selectedProps":{
      "label":"test"
    },
    "data": {
      "thing":"person"
    },
    "group": "Hello"
  },
  {
    "id": "set2-marker_2",
    "type": "marker",
    "latlng": [43.89, 132.0],
    "tooltip": "New marker 2",
    "heatmap": {
      "intensity": 0.63
    },
    "data": {
      "thing":"person"
    },
    "group": "World"
  },
  {
    "id": "set2-marker_3",
    "type": "marker",
    "latlng": [50.6, 140.4],
    "tooltip": "New marker 3",
    "heatmap": {
      "intensity": 0.72
    },
    "data": {
      "thing":"person"
    },
    "group": "Hello"
  },
  {
    "id": "set2-line_1",
    "type": "polyline",
    "latlng": [
      [44.5, 134.4],
      [43.89, 132.0],
      [50.6, 140.4]
    ],
    "heatmap": {
      "intensity": 0.51
    },
    "weight": 2,
    "selectedProps": {
      "color": "orange",
      "weight": 3
    }
  },
  {
    "id": "set2-camera",
    "type": "marker",
    "latlng": [34.9, 134.5],
    "icon": {
      "iconUrl": "../images/camera-icon.png",
      "iconSize": [45, 45]
    },
    "data": {
      "thing":"camera"
    }
  },
  {
    "id": "set2-fan",
    "type": "circle",
    "latlng": [43.5, 140.5],
    "opacity": 0.6,
    "radius": 500,
    "startAngle": 0,
    "stopAngle": 45,
    "selectedProps": {
      "color": "orange",
      "weight": 4,
      "latlng": [46.5, 140.5]
    }
  },
  {
    "id": "set2-polygon",
    "type": "polygon",
    "heatmap": {
      "intensity": 0.89
    },
    "latlng": [
      [40.867675, 141.736691],
      [40.991060, 143.121583],
      [40.102546, 143.304493],
      [39.338819, 142.435669],
      [39.611112, 139.770405],
      [40.867675, 141.736691]
    ],
    "opacity": 0.9,
    "color":"#34cc33",
    "selectedProps": {
      "color": "#DB4D6D"
    }
  }
]

const gis = new Gis('dom-id', {
    baseMap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    mapOptions: {
        center: [46.777128, 103.505101],
        zoom: 4,
        doublieClickZoom: false
    } 
}, symbols)

gis.on('click', (e, id) => {
    alert(`${id} clicked`)
})

gis.on('selectionChange', {data:{thing:'person'}}, (eventObj, ids)=>{
    const symbols = gis.getSymbol(ids)
    _.forEach(ids, id=>{
        gis.setSymbol(_.map(symbols, s => {return {...s, firstname:'Tom'}}))
    })
})

gis.filterSymbol({data:{thing:'camera'}})
```



#### Creation
Parameter | Type | Default | Description
---------- | ---| ---| -------------
element | <code>String&#124;HtmlElement</code> | | The dom node.
options | `Options` | `{}` | 
symbols | `Symbol[]` | `[]` | Default list of symbols to show on map.

<hr/>

#### Options
Name | Type | Default | Description
---------- | ---| ---| -------------
layout | <code>'standard'&#124;'heatmap'&#124;'track'&#124;'contour'</code> | `'standard'` | Map display mode.
dragMode | <code>'pan'&#124;'region'&#124;'measure'&#124;'draw'</code> | `'pan'` | When user drags on map (but not upon symbols), interact by panning or region selection.
regionType | <code>'circle'&#124;'rectangle'</code> | `'rectangle'` | The selection type in region selection mode.
drawType | <code>'marker'&#124;'circle'&#124;'rectangle'&#124;'polyline'&#124;'polygon'&#124;'edit'&#124;'delete'</code> | `'marker'` | The draw type in draw mode.
baseMap | <code>String&#124;Object&#124;Layer[]</code> | | Base map option. If given a `String`, it should be the map url; if an `Object`, refer to [_BaseMap Options_](#basemap-options).
baseImage | <code>'String&#124;Object&#124;Object[]</code> | | Customize base image overlay on your map(and with set properly [_crs_](https://leafletjs.com/reference-1.3.4.html#crs-l-crs-simple) in `mapOptions`), then you can input baseImage to achieve. Latter image overlays will cover former ones. If input is a `String`, it represents the image's url; as for `Object` or `Object[]`, refer to [_BaseMap Image_](#basemap-image).
mapOptions | `Object`|  | Options supported by [_leaflet map_](https://leafletjs.com/reference-1.3.4.html#map-option). 
symbolOptions | `Object[]`|  | Global options for symbols which match the filter. Former options will be merged (or replaced when option is not object) with latter ones for multiple matched symbol. The props' applied priority is, selectedProps(if selected) > props > (symbolOptions' selectedProps if selected) > (symbolOptions' props). Refer to [_Symbol Options_](#symbol-options).
heatmapOptions | `Object`|  | Global options for heatmap, which is implemented based on [_heatmap.js_](https://www.patrick-wied.at/static/heatmapjs/docs.html). Refer to [_Heatmap Options_](#heatmap-options). For the symbol's heatmap props, refer to `heatmap` in [_Symbol Props_](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md#props)
clusterOptions | `Object[]`|  | Options marker/spot clusters which match the filter. Clustering is based on [_leaflet.markercluster_](https://github.com/Leaflet/Leaflet.markercluster). Here, it only works in `standard` mode. Former option will merge with latter ones for duplicated matched cluster. If a prop(e.g., *icon*) is duplicated set, it will apply the last one's setting. Refer to [_Cluster Options_](#cluster-options).
trackOptions | `Object[]`|  | Options for tracks which match the filter. Former options will be merged (or replaced when option is not object) with the latter ones for multiple matched tracks. Refer to [_Track Options_](#track-options).
contourOptions | `Object`|  | Options for contour map, based on [_d3.contour_](https://github.com/d3/d3-contour). Refer to [_Contour Options_](#contour-options).
measureOptions | `Object`|  | Options for measure mode. Refer to [_Measure Options_](#measure-options).
drawOptions | `Object`|  | Options for draw mode. Refer to [_Draw Options_](#draw-options).
truncateLabels | `Object`| `null` | Options for label truncate. If specified, will truncate marker/spot labels. Refer to [_Truncate Labels_](#truncate-labels).

<hr/>

#### BaseMap Options
Name | Type | Default | Description
---------- | ---| ---| -------------
url | `String` | | The tile-map service url.
subdomains | <code>String&#124;String[]</code> | | Subdomains of the tile service. Can be passed in the form of one string (where each letter is a subdomain name) or an array of strings.
providerName | `String` | | Name of map provider. ex: "esri". Added for THPO project, THPO use esri as their base-map. In the future, this providerName can be used for other base-map providers.

<hr/>

#### BaseMap Image
Name | Type | Default | Description
---------- | ---| ---| -------------
id | `String` | | Overlay's Id. A random id will be generated if this is not specified.
url | `String` | | Required. The image's source path.
xy | `Object` | | The overlay's *bottom-left* start point, which should be `{x:Number, y:Number}`. Default is the bottom-left point of the map's bound
size | `Object` | Images's natural size | How many *unit* the overlay will cover within the container, which is `{width:Number, height:Number}`. 
opacity | `Number` | `1.0` | The overlay's opacity.
zoom | `Number` | `-999` | The minimum zoom level the image will show. If zoom level is less than this value, the image will be hidden.

<hr/>

#### Symbol Options
Name | Type | Default | Description
---------- | ---| ---| -------------
match | `Object` | | A filter. If specified, the options will be applied to symbols match this filter; if not, will be applied to all symbol/cluster-node. Filter can be `id`, `type`, `data`, and `group`. Refer to [_Match Options_](#match-options).
props | `Object` | | Props that will be applied to symbols/cluster-nodes which match the filter. Besides normal props, symbol's `type` can be defined here if not defined in input data. Props defined here can be `String`, `Object`(if supported) or `Function({id, type, ...props, selected, selectedProps})` which returns a `String` or `Object`.
selectedProps | `Object` | | SelectedProps that will be applied to symbols which match the filter.

<hr/>

#### Track Options
Name | Type | Default | Description
---------- | ---| ---| -------------
match | `Object` | | An id filter. If specified, the options will be applied to tracks match this filter; if not, will be applied to all track. Refer to [_Match Options_](#match-options).
props | `Object` | | Props that will be applied to tracks which match the filter. Props defined here can be `String`, `Object`(if supported) or `Function({id, type, ...props, selected, selectedProps})` which returns a `String` or `Object`. There are special props for track, see [_Track Extra Props_](#track-extra-props)
selectedProps | `Object` | | SelectedProps that will be applied to tracks which match the filter.

<hr/>

#### Track Extra Props
Name | Type | Default | Description
---------- | ---| ---| -------------
showInvisible | `Boolean` | `false` | Should track contain the hidden point?
startSymbol | `Object` |  | Set the start point's props or selectedProps. The symbol type is inherited from the current start node of the track.
endSymbol | `Object` |  | Set the end point's props or selectedProps. The symbol type inherits from current end node if it's not ongoing node; while ongoing node's type can be set as `marker` or `spot` (default is `marker`). You could also set `label` in this option, and the label text will be shown under the symbol.  About the `label`, could set as a String(and label text will show in track-end), or set as a `{conent: String, className: String}`(the label text will always show). Ongoing node is also a `Symbol`, which Id or events can be defined/bound.
showOngoing | `Boolean` | `false` | Show ongoing tracks or not. That is, adding an extra node to the track end before the line reaches the next node. The length is by ration of time diff.
internalSymbols | <code>Boolean&#124;Object</code> | `true` | Show internal symbols(i.e, symbols between start and end) on the track or not. Set `false` to hide all the internal symbols, that measns show start and end only. See the spec for `Object` bellow.
internalSymbols.enabled | `Boolean` | `true` | Show the internal symbols or not.
internalSymbols.props | `Object` | | The props to apply for internal symbols under track mode, see marker [_props_](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/marker.md#props)
internalSymbols.selectedProps | `Object` | | The selectedProps to apply for internal symbols under track mode.

<hr/>

#### Cluster Options
Name | Type | Default | Description
---------- | ---| ---| -------------
id | `String` | | Cluster Id. If specified, the options will be applied to cluster match this filter; if not, will be applied to all clusters, including the default global cluster. 
props | `Object` | | Props for clusters which match the filter. Here, it's not same the symbol's *props*, it's cluster's config. Refer to [_Cluster Props_](#cluster-props).

<hr/>

#### Cluster Props
Name | Type | Default | Description
---------- | ---| ---| -------------
disableClusteringAtZoom | `Number` | | If set, at this zoom level and below, markers will not be clustered. This defaults to disabled. 
maxClusterRadius | `Number` | `80` | The maximum radius that a cluster will cover from the central marker (in pixels).
spiderfyOnMaxZoom | `Boolean` | `true` | When clicking a cluster at the bottom zoom level, spiderfy it so you can see all of its markers.
zoomToBoundsOnClick | `Boolean` | `false` | Zoom to the cluster's bound when clicking it or not.
symbol | `Object` | | Props for the cluster nodes. Cluster node's *type* (support *marker* and *spot* only), *props*, *selected*, and *selectedProps* can be defined. See [_Marker_](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/marker.md) and [_Spot_](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/spot.md) spec.

<hr/>

#### Heatmap Options
Name | Type | Default | Description
---------- | ---| ---| -------------
useLocalExtrema | `Boolean` | `false` | If true, uses the data maximum within the current map boundaries.
scaleRadius | `Boolean` | `true` | Scales the radius based on map zoom.
opacity | `Number` | `0.6` | Global opacity[0,1] for the whole heatmap, will overwrite max/min opacity if set.
maxOpacity | `Number` | `0.8` | Maximum opacity[0,1] the heat will start at
minOpacity | `Number` | `0` | Minimum opacity[0,1] the heat will start at
max | `Number` | `1.0` | Maximum spot intensity.
min | `Number` | `0` | Minimum spot intensity.
radius | `Number` | `1` | Radius of each 'spot' of the heatmap when spot's radius is not specified, in meters.
blur | `Number` | `0.85` | Amount of blur[0, 1].
gradient | `Object` | `{'0.2': '#3489BD', '0.4': '#48AF4E', '0.6': '#FCD43D', '0.8': '#E29421', '1.0': '#D53F50'}` | Color gradient config, use ratio[0, 1] as key.

<hr/>

#### Contour Options
Name | Type | Default | Description
---------- | ---| ---| -------------
thresholds | <code>Number&#124;Number[]</code> | `20` | Determine the range of density. If a `Number` `n` is specified, then generating approximately `n` uniformly-spaced nicely-rounded thresholds; if an `Number[]` is specified, the first value should typically be greater than `0`.
bandwidth | `Number` | `20.4939` | The bandwidth (the standard deviation) of the Gaussian kernel and returns the estimate. Must be a positive number.
cellSize | `Number` | `4` | The size of individual cells in the underlying bin grid, which related to the detail of contours. The cell size is rounded down to the nearest power of `2`. Small cells can produce more detailed contours, but it's expensive.
boundSW | <code>Object *{lat, lng}*</code> | `{lat:24.783605, lng:121.346129}` | The bottom-left point of contour boundary.
boundNE | <code>Object *{lat, lng}*</code> | `{lat:25.258346, lng:121.746007}` | The top-right point of contour boundary.
colors | `Object` | `{'0.00': '#3489BD', 0.25: '#48AF4E', '0.50': '#FCD43D', 0.75: '#E29421', '1.00': '#D53F50'}` | The colors of each density range.

<hr/>

#### Measure Options
Name | Type | Default | Description
---------- | ---| ---| -------------
showPointerTooltip | `Boolean` | `true` | Show the pointer's tooltip?
showEndTooltip | `Boolean` | `true` | Show the end vertex's tooltip?
pointerTooltip | <code>String&#124;Function</code> | `X meters` | The content of pointer's tooltip. When given a `Function`, arguments are (`distance`, `latlng`, `latlngs`, `path`). `distance` is the distance of current path in meter; `latlng` is location of pointer's location represents by `Number[lat,lng]`; `latlngs` is the vertices of path represents by [latlng]; `path` is the Leaflet `L.Polyline` instance.
endTooltip | <code>String&#124;Function</code> | `X meters` | The content of end vertex's tooltip. When given a `Function`, arguments spec can be referred to pointerTooltip.
vertexIcon | `Object` | A steelblue circle | The style of pointer and vertex on the path. Spec can be referred to [_Marker Icon_](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/marker.md#icon).
hint | <code>Boolean&#124;String&#124;Function</code> | `false` | Show hint for measure mode? Given a a `String` or `Function (all symbols, map)` to customize your hint message. If `true`, it renders `Double-Click to stop drawing`.
_ | * |  | All props supported for svg style, like `color`, `stroke`, `dashOffset`, etc.

<hr/>

#### Draw Options
Name | Type | Default | Description
---------- | ---| ---| -------------
defaultControl | `Boolean` | `false` | Use default draw control?
position | `String` | `topleft` | The default control's position.
draw | `Object` |  | Draw options. See [_leaflet.draw_](https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html#options)'s intro
locales | `Object` |  | Texts to show during draw/edit, and the title on default control buttons. See [_Draw Locales_](#draw-locales) below.

<hr/>

#### Draw Locales
Name | Type | Default | Description
---------- | ---| ---| -------------
draw | `Object` |  | Texts for draw toolbar and handlers. See the following example.
draw.toolbar | `Object` |  | Texts for toolbar.
draw.toolbar.actions | `Object` |  | Texts for actions, which include `String title` and `String text`.
draw.toolbar.finish | `Object` |  | Texts for finish hint, which include `String title` and `String text`.
draw.toolbar.undo | `Object` |  | Texts for undo hint, which include `String title` and `String text`.
draw.toolbar.buttons | `Object` |  | Texts for buttons, which include `String polyline`, `String polygon`, `String rectangle`, `String circle`, `String marker`, and `String circlemarker` for draw type `spot`.
draw.handlers | `Object` |  | Texts for handlers.
draw.handlers[`Type`] | `Object` |  | Texts for draw handlers. `Type` can be `polyline`, `polygon`, `rectangle`, `circle`, `marker`, and `circlemarker` for `spot`.
draw.handlers[`Type`].tooltip | `Object` |  | Texts for handler's tooltip.
draw.handlers[`Type`].tooltip.start | `String` |  | Tooltip text for starting to draw.
draw.handlers[`Type`].tooltip.cont | `String` |  | Tooltip text for continuing to draw the shape. This is for `polygon` and `polyline`.
draw.handlers[`Type`].tooltip.end | `String` |  | Tooltip text for finishing the shape. This is for `polygon` and `polyline`.
draw.handlers[`Type`].error | `String` |  | Tooltip text to show when the shape is not match the constraint. E.g., constraint polyline can't cross.
draw.handlers[`Type`].radius | `String` | `'Radius'` | A label for raidus in circle handler's tooltip.
edit | `Object` |  | Texts for edit toolbar and handlers.
edit.toolbar | `Object` |  | Texts for toolbar.
edit.toolbar.actions | `Object` |  | Texts for edit actions.
edit.toolbar.actions[`Action`] | `Object` |  | Texts for action. `Action` can be `save`, `cancel`, `clearAll`. All of them contains `String title` and `String text`.
edit.toolbar.buttons | `Object` |  | Texts for edit buttons., Keys include `edit`, `editDisabled`, `remove`, and `removeDisabled`.
edit.handlers | `Object` |  | Texts for handlers, which include `Object edit` and `Object remove`.
edit.handlers[`Handler`].tooltip | `Object` |  | Texts for handler. `Handler` can be `edit` or `remove`.
edit.handlers[`Handler`].tooltip.text | `Object` |  | Texts for edit handler.
edit.handlers[`Handler`].tooltip.subtext | `Object` |  | Sub hint for edit handler.

#### Default Draw Locales
```
{
  draw: {
    toolbar: {
      actions: {
        title: 'Cancel drawing',
        text: 'Cancel'
      },
      finish: {
        title: 'Finish drawing',
        text: 'Finish'
      },
      undo: {
        title: 'Delete last point drawn',
        text: 'Delete last point'
      },
      buttons: {
        polyline: 'Draw a polyline',
        polygon: 'Draw a polygon',
        rectangle: 'Draw a rectangle',
        circle: 'Draw a circle',
        marker: 'Draw a marker',
        circlemarker: 'Draw a circlemarker'
      }
    },
    handlers: {
      circle: {
        tooltip: {
          start: 'Click and drag to draw circle.'
        },
        radius: 'Radius'
      },
      circlemarker: {
        tooltip: {
          start: 'Click map to place circle marker.'
        }
      },
      marker: {
        tooltip: {
          start: 'Click map to place marker.'
        }
      },
      polygon: {
        tooltip: {
          start: 'Click to start drawing shape.',
          cont: 'Click to continue drawing shape.',
          end: 'Click first point to close this shape.'
        }
      },
      polyline: {
        error: '<strong>Error:</strong> shape edges cannot cross!',
        tooltip: {
          start: 'Click to start drawing line.',
          cont: 'Click to continue drawing line.',
          end: 'Click last point to finish line.'
        }
      },
      rectangle: {
        tooltip: {
          start: 'Click and drag to draw rectangle.'
        }
      }
    }
  },
  edit: {
    toolbar: {
      actions: {
        save: {
          title: 'Save changes',
          text: 'Save'
        },
        cancel: {
          title: 'Cancel editing, discards all changes',
          text: 'Cancel'
        },
        clearAll: {
          title: 'Clear all layers',
          text: 'Clear All'
        }
      },
      buttons: {
        edit: 'Edit layers',
        editDisabled: 'No layers to edit',
        remove: 'Delete layers',
        removeDisabled: 'No layers to delete'
      }
    },
    handlers: {
      edit: {
        tooltip: {
          text: 'Drag handles or markers to edit features.',
          subtext: 'Click cancel to undo changes.'
        }
      },
      remove: {
        tooltip: {
          text: 'Click on a feature to remove.'
        }
      }
    }
  }
}

```
<hr/>

#### Truncate Labels
Name | Type | Default | Description
---------- | ---| ---| -------------
maxLength | `Number` | `13` | The maximum length labels can be before they're truncated. The labels are truncated to the length specified, and the last three characters are replaced with three dots(`...`).
shownOnHover | `Boolean` | `true` | Show the whole label when mouseover or not.

<hr/>

#### Match Options
Name | Type | Default | Description
---------- | ---| ---| -------------
id | <code>String&#124;String[]</code> | | Symbol of id which will apply the props/selectedProps defined in Symbol Options.
type | <code>String&#124;String[]</code> | | Symbols of types which will apply the props/selectedProps defined in Symbol Options.
data | `Object` | | Symbols which data match with this config will apply the props/selectedProps defined in Symbol Options.
group | `String` | | Symbols belong to the group will apply the props/selectedProps defined in Symbol Options.
props | `Object` | | props that will be applied to symbols which match the filter.
selectedProps | `Object` | | selectedProps that will be applied to symbols which match the filter.

<hr/>

#### Symbol
Name | Type | Default | Description
---------- | ---| ---| -------------
id | `String` |  | Id of the symbol.
type | <code>'popup'&#124;'marker'&#124;'polyline'&#124;'polygon'&#124;'rectangle'&#124;'circle'&#124;'geoJSON'&#124;'custom'</code> | | Type of object to generate. Self-provided object layer if `type='custom'`, custom type is not implemented yet.
tooltip | <code>String&#124;Object&#124;Function</code> | | Tooltip to show on hover
popup | <code>String&#124;Object&#124;Function</code> | | Popup to show on click
latlng | `[]` | | Location coordinates for `type='marker'`, `'polyline'`, `'polygon'`, `'rectangle'`, or `'circle'`
label | <code>String&#124;Object&#124;Function</code> | | Label for `type='marker'`.
icon | <code>String&#124;Object&#124;Function</code> | | Icon for `type='marker'`.
selected | `boolean` | <code>false</code> | Is this symbol selected by default?
selectedProps | `Object` | | Style to use when selected.
geojson | <code>[]&#124;Object</code> | | GeoJSON data for `type='geojson'`.
symbol | `Leaflet layer` | | Leaflet layer instance for `type='custom'`
_ | * |  | All props supported for individual symbol type

<hr/>

#### Events
Event | Callback args | Description
---------- | ---| -------------
selectionChange | <code>EventObject *e*, String&#124;String[] *ids*?</code> | Selected symbols. *ids* is a *String[]* when selectionChange occurs on cluster or region selection.
mouseover | <code>EventObject *e*, String&#124;String[] *ids*?, Object *dataObj*?</code> | Hover event. `dataObj` is defined when event occurs on cluster parent symbol. *ids* is a *String[]* when selectionChange occurs on cluster or region selection.
click | <code>EventObject *e*, String&#124;String[] *ids*?, Object *dataObj*?</code> | Click event. *ids* is a *String[]* when selectionChange occurs on cluster or region selection.
dblclick | <code>EventObject *e*, String&#124;String[] *ids*?, Object *dataObj*?</code> | Double click. *ids* is a *String[]* when selectionChange occurs on cluster or region selection.
contextmenu | <code>EventObject *e*, String&#124;String[] *ids*?, Object *dataObj*?</code> | Right click. *ids* is a *String[]* when selectionChange occurs on cluster or region selection.
measurestart | <code>EventObject *e*, Number[] *latlng*?</code> | For measure mode only. Start to draw a new path.
measure | <code>EventObject *e*, Object *pathInfo*?</code> | For measure mode only. Drawing the new path. `pathInfo` includes `latlng[Number, Number]` which represents the location the event occurs, `latlngs[latlng]` which represents the points form the path, and `distance` which represents the whole distance of the path, in meters.
measureend | <code>EventObject *e*, Object *pathInfo*?</code> | For measure mode only. Finish drawing the new path. Arguments can be referred to event *draw*.
zoomstart | <code>EventObject *e*, Object *zoomInfo*?</code> | Triggered when level start changing. Argument *zoomInfo* includes the current bounds (bottom-left and top-right points), and current zoom level.
zoom | <code>EventObject *e*, Object *zoomInfo*?</code> | Triggered during level changing. Arguments can be referred to event *zoomstart*.
zoomend | <code>EventObject *e*, Object *zoomInfo*?</code> | Triggered after level changed. Arguments can be referred to event *zoomstart*.
create | <code>EventObject *e*, Object *symbol*?</code> | For draw mode only. Triggered after a symbol is created in draw mode.
edit | <code>EventObject *e*, Object[] *symbols*?</code> | For draw mode only. Triggered after finishing editing in the draw mode. Argument `symbols` is all drawn symbol objects
editcontent | <code>EventObject *e*, Object *symbol*?</code> | For draw mode only. Triggered after starting editing a symbol's content, like label or popup. This event is fired when dblclick on drawn symbols in draw mode.
delete | <code>EventObject *e*, Object/Object[] *symbol*?</code> | For draw mode only. Triggered after a symbol is deleted in draw mode.

<hr/>

#### Methods
Method | Returns | Description
---------- | ----| ------------
<code>on(String *event*, Object *filter*?, Function *handler*)</code> | `this` | Bind function to event to those symbols match the filter. If *filter* is not specified, bind the event to all symbols and map. `filter` can contain symbol's `id`, `type`, `props`, `selectedProps`, and `data`. For cluster events, it contains cluster `id` and `props`. When adding a new handler to defined events, it will append the new handler to the event instead of replacing the previous one.
<code>off(String *event*, Object *filter*?, Function *handler*?)</code> | `this` | Remove the event handler of symbols match the filter. For the arguments, refer to method *on*. *handler* is for removing specific handler; if not specified, remove all handlers of the event, including the build-in event handlers.
<code>setSymbol(Object *item* &#124; Object[] *items*)</code> | `this` | Create/Set symbol.
<code>setTrack(Object *item*? &#124; Object[] *items*?)</code> | `this` | Set tracks' properties. The effect will be applied to all tracks if given no argument.
<code>setHeatmap(Object *options*)</code> | `this` | Create/Set heatmap.
<code>removeSymbol(String *id* &#124; String[] *ids* &#124; Object *filter* &#124; Function *filter*)</code> | `this` | Remove symbol from map. If filter is a function, it should return a *Boolean*.
<code>exists(String *id*)</code> | `boolean` | Does the symbol exist in Gis instance?
<code>getSymbol(String *id* &#124; String[] *ids* &#124; Object *filter* &#124; Function *filter*)</code> | `Object` or `Object[]` | Get symbol data, `{id, type, ...symbol.props, selected, selectedProps}`. Given a string argument, it will return an `Object` or `null`; else, an `Object[]`. If filter is a function, it should return a *Boolean*.
`getSelection()` | `String[]` | Get selected symbols' Ids.
<code>getDistance(*Latlng[] latlngs*)</code> | `Number` | Calculate the distance of the path formed by input latlngs
<code>setSelection(String *id* &#124; String[] *ids* &#124; Object *filter* &#124; Function *filter*)</code> | `this` | Set symbols as selected. If filter is a function, it should return a *Boolean*. This method can also used to select *track* or *cluster node*, which type is `track` or `cluster` and track's id is depends on the [track prop](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md#props) you set in symbol belongs to track.
<code>showSymbol(String *id* &#124; String[] *ids* &#124; Object *filter* &#124; Function *filter*, Number[] *[start, end]*?)</code> | `this` | Show symbols according to Id/filter. If Id/filter is not specified(*null* or *undefined*), show all symbols. If filter is a function, it should return a *Boolean*. Interval *[start, end]* is a second-level filter which refines filtered symbols within the interval.
<code>hideSymbol(String *id* &#124; String[] *ids* &#124; Object *filter* &#124; Function *filter*, Number[] *[start, end]*?)</code> | `this` | Hide symbols according to Id/filter. If Id/filter is not specified(*null* or *undefined*), hide all symbols. If filter is a function, it should return a *Boolean*. Interval filter can be refered to showSymbol().
<code>filterSymbol(String *id* &#124; String[] *ids* &#124; Object *filter* &#124; Function *filter*, Number[] *[start, end]*?)</code> | `this` | Filter symbols according to Id/filter. If filter is a function, it should return a *Boolean*. If filter is *true*, show all symbol; if not specified(*null* or *undefined*) or *false*, hide all symbols. Interval filter can be refered to showSymbol().
<code>showTrack(String *id* &#124; String[] *ids* &#124; Object *filter* &#124; Function *filter*)</code> | `this` | Only works in track mode. Show tracks according to Id/filter. If Id/filter is not specified(*null* or *undefined*), show all tracks. If filter is a function, it should return a *Boolean*.
<code>hideTrack(String *id* &#124; String[] *ids* &#124; Object *filter* &#124; Function *filter*)</code> | `this` | Only works in track mode. Hide tracks according to Id/filter. If Id/filter is not specified(*null* or *undefined*), hide all tracks. If filter is a function, it should return a *Boolean*.
<code>filterTrack(String *id* &#124; String[] *ids* &#124; Object *filter* &#124; Function *filter*)</code> | `this` | Only works in track mode. Filter tracks according to Id/filter. If filter is a function, it should return a *Boolean*. If filter is *true*, show all tracks; if not specified(*null* or *undefined*) or *false*, hide all tracks.
`getMap()` | `L.map` | Get the [leaflet map instance](https://leafletjs.com/reference-1.3.4.html#map-example).
<code>setImageOverlay(Object *item* &#124; Object[] *items*)</code> | `this` | Create/Set image overlay. The arguments can be referred in table [_BaseMap Image_](#basemap-image).
<code>removeImageOverlay(String *id* &#124; String[] *ids* &#124; Object *filter* &#124; Function *filter*)</code> | `this` | Remove overlay from map. If filter is a function, it should return a *Boolean*.
<code>setLayout(String *layout*, String *id* &#124; String[] *ids* &#124; Object *filter* &#124; Function *filter*)</code> | `this` | Set map layout as `'standard'`, `'heatmap'`, `'contour'`, or `'track'`. If filter is specified, only switch the symbols match filter to target layout.
<code>setDragMode(String *dragMode*, String *regionType*='rectangle', Object *drawConfig*={})</code> | `this` | Set pan mode as `'pan'`, `'region'`, `measure`, or `draw`
<code>setRegionType(String *regionType*)</code> | `this` | Set region type as `'rectangle'` or `'circle'`
<code>setDrawType(String *drawType*, Object *drawConfig*)</code> | `this` | Set draw type as `'marker'`, `'spot'`, `circle`, `rectangle`, `polyline`, `polygon`, `edit` or `delete`. *drawConfig* contains key *editableIds* which can be `String`/`String[]`/`Object`/`Function` (see setSelection()). It makes symbols editable/deletable, default is all symbols.
<code>setMaxBounds(Object *corner1*, Object *corner2*, Boolean *fitBounds*=`false`)</code> | `this` | `Experimental` Set the map's max bound. corner1 and corner2 should be `{lat:Number, lng:Number}`. *corner1*/*corner2* will be converted to the layer point according to the map's CRS. When fitBounds is `true`, auto fit the map to its new bounds.
<code>setGisInterval(Number[] *[start, end]*)</code> | `this` | Set the map's time interval. Interval is useful for rendering tracks within specific interval. *start* and *end* are included in the interval.
<code>zoomToFit(String *id* &#124; String[] *ids* &#124; Object *filter* &#124; Function *filter*)</code> | `this` | Pan and zoom the map to fit the bounding of given symbols which match the Id/filter
`clear()` | `this` | Remove all symbols


<hr/>

#### Properties
Property | Type | Description
---------- | ----| ------------
map | `Map` | Leaflet map instance. To utilize it methods, refer [_leaflet_](https://leafletjs.com/reference-1.3.4.html#map-getrenderer)
heatmap | `Layer` | Heatmap layer instance
tracks | `Layer[]` | Track layers instance
contour | `Layer` | Contour layer instance
symbols | `Object` | Id-symbol pairs of symbols
drawn | `Object` | Id-symbol pairs of drawn symbols
selected | `String[]` | Ids of selected symbols
visible | `String[]` | Ids of visible symbols
interval | `Integer[]` | Interval, which is formatted as [`start`, `end`]
imageOverlays | `Object[]` | Infos of images overlays, including `id`, `url`, `xy`, `size`, `zoom`, `opacity`
