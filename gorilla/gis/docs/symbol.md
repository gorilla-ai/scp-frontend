### Introduction
*GIS* symbols, an abstract class that contains props based on leaflet's vector layer *Path*. 

<hr/>

### API

#### Creation
Parameter | Type | Default | Description
---------- | ---| ---| -------------
id | `String` | `undefined` | The symbol's Id.
type | <code>'popup'&#124;'makrer'&#124;'polyline'&#124;'polygon'&#124;'rectangle'&#124;'circle'&#124;'geojson'&#124;'custom'</code> | | The symbol's type.
props | `Props` | `{}` | Properties of symbol, including latlng, radius, etc.
selected | `Boolean` | `false` | Selected status of symbol
selectedProps | `Object` | `{}` | The props after symbol is selected

<hr/>

#### Props
Name | Type | Default | Description
---------- | ---| ---| -------------
latlng | `[]` | `null` | The location coordinates of the symbol.
tooltip | <code>String&#124;Object&#124;Function(Object *Symbol*)</code> | | Tooltip to show on hover.
popup | <code>String&#124;Object&#124;Function(Object *Symbol*)</code> | | Popup to show on click. 
data | `Object`| `null` | Custom data set on an element.
heatmap | <code>Boolean&#124;Object *{radius, intensity}*</code> | `undefined` | The heatspot prop under heatmap mode. If specified as `true`, the symbol will display as a heatspot with min intensity under heatmap mode.
ts | <code>Number&#124;Number[]</code> | `null` | Timestamp for symbol. If *ts* is out of *GIS interval*, it won't show on the map.
group | <code>String&#124;Function(Object *Symbol*)&#124;Boolean</code> | `null` | Id of the group the symbol belongs to. If specified as *Function*, it should return a `String`. If need to remove symbol from a group, set it as `false`.

<hr/>

#### Events
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