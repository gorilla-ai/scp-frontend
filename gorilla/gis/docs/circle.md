### Introduction
GIS symbol *Circle*, a class for create/set circle on map. Extends from [_Symbol_](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md). 

<hr/>

### API

#### Creation
Parameter | Type | Default | Description
---------- | ---| ---| -------------
id | `String` | `undefined` | The symbol's Id.
props | `Props` | `{}` | Properties of symbol, including latlng, radius, etc.
selected | `Boolean` | `false` | Selected status of symbol.
selectedProps | `Object` | `{}` | The props after symbol is selected.

<hr/>

#### Props
Name | Type | Default | Description
---------- | ---| ---| -------------
stroke | `Boolean` | `true` | Whether to draw stroke along the path. Set it to false to disable borders on polygons or circles.
color | `String` | <code>'#3388ff'</code> | Stroke color.
weight | `Number` | `3` | Stroke width in pixels.
opacity | `Number` | `1.0` | Stroke opacity.
lineCap | `String` | <code>'round'</code> | A string that defines shape to be used at the end of the stroke.
lineJoin | `String`| <code>'round'</code> | A string that defines shape to be used at the corners of the stroke.
dashArray | `String`| `null` | A string that defines the stroke dash pattern. Doesn't work on Canvas-powered layers in some old browsers.
dashOffset | `String`| `null` | A string that defines the distance into the dash pattern to start the dash. Doesn't work on Canvas-powered layers in some old browsers.
fill | `Boolean`| `true` | Whether to fill the path with color. Set it to false to disable filling on polylines.
fillColor | `String`| `*` | Fill color. Defaults to the value of the color option.
fillOpacity | `Number`| `0.2` | Fill opacity.
fillRule | `String`| <code>'evenodd'</code> | A string that defines how the inside of a shape is determined.
renderer | `Renderer`| | Use this specific instance of Renderer for this path. Takes precedence over the map's default renderer.
className | `String`| `null` | Custom class name set on an element. Only for SVG renderer.
radius | `Number` | `0` | The radius of circle, in meters.
startAngle | `Number` | | The start angle of circle, in degree. Values out of [0, 360] will be fixed to [0, 360].
stopAngle | `Number` | | The stop angle of circle, in degree. Values out of [0, 360] will be fixed from [0, 360].

<hr/>

#### Props inherited from [_Symbol_](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/symbol.md#props)
Name | Type | Default | Description
---------- | ---| ---| -------------
latlng | `[]` | `null` | The location coordinates of the symbol.
tooltip | <code>String&#124;Object&#124;Function(Layer *this.layer*)</code> | | Tooltip to show on hover.
popup | <code>String&#124;Object&#124;Function(Layer *this.layer*)</code> | | Popup to show on click. 
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

#### Methods
Method | Returns | Description
---------- | ----| ------------
<code>setStartAngle(Number *degree*)</code> | `this` | Set the start angle of the circle to angle and redraw. This method can't permanently change the 'startAngle' in props. To permanently update 'startAngle' prop, please use 'setProps' method.
<code>setStopAngle(Number *degree*)</code> | `this` | Set the stop angle of the circle to angle and redraw. This method can't permanently change the 'stopAngle' in props. To permanently update 'stopAngle' prop, please use 'setProps' method.
<code>setDirection(Number *direction*, Number *size*)</code> | `this` | Set the startAngle to `direction - (0.5 * size)` and the stopAngle to `direction + (0.5 * size)` then redrawing. This method can't permanently change the 'startAngle' and 'stopAngle' in props. To permanently update 'startAngle' and 'stopAngle' prop, please use 'setProps' method.

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
layer | `L.SemiCircle` | Leaflet semi-circle layer instance. This is from [_leaflet-semicircle_](https://github.com/jieter/Leaflet-semicircle).