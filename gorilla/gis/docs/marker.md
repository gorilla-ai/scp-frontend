### Introduction
GIS symbol *Marker*, a class for create/set marker on map. Extends from [_Symbol_](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md). 

<hr/>

### API

#### Creation
Parameter | Type | Default | Description
---------- | ---| ---| -------------
id | `String` | `undefined` | The symbol's Id.
props | `Props` | `{}` | Properties of symbol, including latlng, radius, etc.
selected | `Boolean` | `false` | Selected status of symbol
selectedProps | `Object` | `{}` | The props after symbol is selected.

<hr/>

#### Props
Name | Type | Default | Description
---------- | ---| ---| -------------
icon | <code>String&#124;Object&#124;Function(Object *Symbol*)</code> | | The icon setting. If it's a string, it represents url; if object, refer the following table *Icon*; if function, it should return *String* or *Object*. The argument of callback function for *Cluster* contains *data*, which includes *ids*(markers' ids in current cluster) and *count*(number of markers in current cluster).
draggable | `Boolean` | `false` | Whether the marker is draggable with mouse/touch or not.
keyboard | `Boolean` | `true` | Whether the marker can be tabbed to with a keyboard and clicked by pressing enter.
title | `String` | `''` | Text for the browser tooltip that appear on marker hover (no tooltip by default).
alt | `String` | `''` | Text for the alt attribute of the icon image (useful for accessibility).
zIndexOffset | `Number` | `0` | By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like 1000 (or high negative value, respectively).
opacity | `Number` | `1.0` | The opacity of the marker.
riseOnHover | `Boolean` | `false` | If true, the marker will get on top of others when you hover the mouse over it.
riseOffset | `Number` | `250` | The z-index offset used for the riseOnHover feature.
pane | `String` | `'markerPane'` | Map pane where the markers icon will be added.
label | <code>String&#124;Object&#124;Function(Object *Symbol*)</code> | `''` | The label setting. If it's a string, it represents text; if object, refer the following table [_Label_](#label); if function, it should return *String* or *Object*. Extra value can also be access for *Cluster* callback argument, like the one mentioned in *icon*.
track | <code>String&#124;Function(Object *Symbol*)</code> | `null` | Id of the track the symbol belongs to in `track` mode. If specified as *Function*, it should return a `String`
cluster | <code>String&#124;Function(Object *Symbol*)&#124;Boolean</code> | `null` | Cluster id the marker belongs to. If specified as *Function*, it should return a *String*. Setting `true` will be added to a default cluster; setting `false` will remove symbol from its cluster.

<hr/>

#### Icon
Name | Type | Default | Description
---------- | ---| ---| -------------
iconUrl | `String` | | The image source of marker. Default is a blue marker.
iconSize | `Number[]` | `[25,41]` | Size of the icon image in pixels.
iconAnchor | `Number[]` | `[12,41]` | The coordinates of the "tip" of the icon (relative to its top left corner).
popupAnchor | `Number[]` | `[1,-34]` | The coordinates of the point from which popups will "open", relative to the icon anchor.
tooltipAnchor | `Number[]` | `[16,-28]` | The coordinates of the point from which tooltips will "open", relative to the icon anchor.
rotation | `Number` | `0` | The icon rotation angle in degree.

<hr/>

#### Label
Name | Type | Default | Description
---------- | ---| ---| -------------
content | `String` | | The content of label. Set as trunked by set *mapOptions.trunkedLabel* as *true*
html | <code>String&#124;HTMLElement</code> | | The content of label, if specified, it will overwrite content.
className | `String` | | The className for label container.

<hr/>

#### Props inherited from [_Symbol_](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md#props)
Name | Type | Default | Description
---------- | ---| ---| -------------
latlng | `[]` | `null` | The location coordinates of the symbol.
tooltip | <code>String&#124;Object&#124;Function(Layer *layer*)</code> | | Tooltip to show on hover.
popup | <code>String&#124;Object&#124;Function</code> | | Popup to show on click. 
className | `String` | `null` | Custom class name set on an element. Only for SVG renderer.
data | `Object`| `null` | Custom data set on an element.
heatmap | <code>Boolean&#124;Object *{radius, intensity}*</code> | `undefined` | The heatspot prop under heatmap mode. If specified as `true`, the symbol will display as a heatspot with min intensity under heatmap mode.
ts | <code>Number&#124;Number[]</code> | `null` | Timestamp for symbol. If *ts* is out of *GIS interval*, it won't show on the map.
group | <code>String&#124;Function(Object *Symbol*)&#124;Boolean</code> | `null` | Id of the group the symbol belongs to. If specified as *Function*, it should return a `String`. If need to remove symbol from a group, set it as `false`.

<hr/>

#### Events inherited from [_Symbol_](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md#events)
Event | Callback args | Description
---------- | ---| -------------
selectionChange | <code>EventObject *e*, String *id*?</code> | Change the selected status.
mouseover | <code>EventObject *e*, String *id*?</code> | Hover.
click | <code>EventObject *e*, String *id*?<code> | Click.
dblclick | <code>EventObject *e*, String *id*?</code> | Double click.
contextmenu | <code>EventObject *e*, String *id*?</code> | Right click.

<hr/>

#### Methods inherited from [_Symbol_](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md#methods)
Method | Returns | Description
---------- | ----| ------------
`isSelected()` | `boolean` | Is the symbol selected?
<code>set(Object *props*, Boolean *selected*, Object *selectedProps*)</code> | | Set the symbol.
<code>setSelected(Boolean *selected*)</code> | | Set symbol's selected status.
<code>setProps(Object *props*, Object *selectedProps*)</code> | | Set symbol's props and selectedProps.
<code>setLayer(Object *props*, Boolean *selected*, Object *selectedProps*)</code> | <code>Leaflet layer&#124;featureGroup</code> | Set the symbol's layer. If a *directed polyline*, return *Leaflet featureGroup*.
<code>setInfo(String *type*, String&#124;Object&#124;Function *info*)</code> | | Create or Update symbol's tooltip/popup/label.

<hr/>

#### Properties
Property | Type | Description
---------- | ----| ------------
id | `String` | Symbol's Id.
type | `String` | Symbol's type.
props | `Props` | Properties of symbol, including latlng, tooltip, popup, etc.
selected | `Boolean` | Whether symbol is selected.
selectedProps | `Props` | Properties of symbol when selected.
currentProps | `Props` | Current props of symbol. 
layer | `L.Marker` | Leaflet marker layer instance.