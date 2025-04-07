### Introduction
*gis* is a library for manipulating data-driven gis related things, uses leaflet
 *  [Demo](http://gui.i8.vc:8098)

#### Features:
 *  extends gis
 *  data-driven gis map

<hr/>

### API

#### Usage example
```
const people = {
    'A333333':{ firstName:'Adam', lastName:'Bad', address:'xxx' },
    'B333333':{ firstName:'Brandon', lastName:'Bad', address:'xxx' },
    'C333333':{ firstName:'Chris', lastName:'Victim', address:'xxx' },
    'D333333':{ firstName:'Dennis', lastName:'Witness', address:'xxx' },
    'E333333':{ firstName:'Ellen', lastName:'Witness', address:'xxx' },
}
const simData = [
    { id:1, _type:'crime', type:'robbery', reportedBy:'D333333', victims:['C333333'], time:1483272000, location:{lat:43.33, lng:90.0} },
    { id:2, _type:'crime', type:'drug', reportedBy:'E333333', badguys:['A333333'], time:1483275600, location:{lat:43.89, lng:91.0} },
    {   
        id:3, _type:'call', start:1483272060, end:1483272177,
        from:{id:'B333333', location:[44.22, 121.33]}, 
        to:{id:'A333333', location:[64.22, 120.0]}
    },
    {
        id:4, _type:'bug', target: 'A333333',
        stops: [
            {what:'Shopping', when:1483272000, where:{name:'Global Mall', location:[44.5, 94.4]}},
            {what:'Unknown', when:1483275600, where:{location:[43.89, 91.0]}},
            {what:'Dinner', when:1483293600, where:{name:'AB Restaurant', location:[50.5, 100.4]}}
        ]
    },
    {
        id:5, _type:'cctv', radius:0.1, angle:{start:0.8, end:0.9}, location:'ATM xx Street', latlng:[44.9, 94.5],
        snapshots: [
            {who:'B333333', time:1483271840 },
            {who:'C333333', time:1483271940 }
        ]
    },
    {
        id:6, _type:'cctv', radius:0.05, angle:{start:1.3, end:1.5}, location:'Secret Meeting Place', latlng:[50.5, 100.4],
        snapshots: [
            {who:['B333333','A333333'], time:1483278600}
        ]
    }
]
const profiler = [
    {match:{_type:'crime'}, idKey:'id', profile:profiles.crime},
    {match:{_type:'call'}, idKey:'id', profile:profiles.call},
    {match:{_type:'bug'}, idKey:'id', profile:profiles.bug},
    {match:(obj)=>obj._type==='cctv', idKey:'id', profile:profiles.cctv}
]

const profiles = {
    crime: {
        objId:(obj)=>`${obj.id}-crime`, objType:'marker', latlngKey:'location', labelKey:'type', 
        tsKey:'time',
        tooltip:(obj)=>`Reporting of ${type} incident by:${people[obj.reportedBy].firstName} @ ${obj.time}`
    },
    call: [
        { objType:'marker', objId:(obj)=>`${obj.id}-call-from`, latlngKey:'from.location', 
        tsKey:'start', labelKey:'from.id' },
        { objType:'marker', objId:(obj)=>`${obj.id}-call-to`, latlngKey:'to.location', 
        tsKey:'end', labelKey:'to.id' },
        { objType:'polyline', latlngKey:['from.location','to.location'], tsKey:['start','end'], tooltip:'to.id', directed:true }
    ],
    bug: (obj)=>{
        const {stops, target} = obj
        const latlng = _.map(stops, 'where.location')
        const markers = _.map(stops, (s,i)=>{
            return {objType:'marker', objId:(obj)=>`${obj.id}-bug-${i}`, latlng:s.where.location, 
                ts:s.when, tooltip:()=>`${target} at ${s.where.name}`}
        })
        return [
            ...markers,
            {objType:'polyline', latlng, color:'red', weight:2, selected:{color:'blue', weight:3}}
        ]
    },
    cctv: [
        { 
            objType:'marker', objId:(obj)=>`${obj.id}-cctv-cam`, latlngKey:'latlng', labelKey:'location',
            icon:{ iconUrl:'/fixed/camera/icon' },
            selected:{ icon:{ iconUrl:'/selected/camera/icon' } } 
        },
        {   
            objType:'circle', latlngKey:'latlng', ts:(obj)=>obj.snapshots.map('time'), opacity:(obj)=>Math.max(obj.snapshots.length,10)/10, 
            radiusKey:'radius', startAngleKey:'angle.start', endAngleKey:'angle.end' 
        }
    ],
    'call-geojson': { 
        objType:'geojson', objId:(obj)=>`${obj.id}-call`,
        type:'GeometryCollection',
        geometries:[
            { type:'Point', coordinatesKey:'from.location' },
            { type:'Point', coordinatesKey:'to.location' },
            { type:'LineString', coordinatesKey:['from.location','to.location'], style:{color:'#ff0000'} }
        ]
    }
}
const dataMap = new Gis(domNode, {
    layout: 'track'
}, simData, profiles)
```

#### Creation
Parameter | Type | Default | Description
---------- | ----| -----| ----------
element | <code>String&#124;HtmlElement</code> | | The dom node
options | `object` | `{}` | 
data | `[]` | `[]` | Default list of data items to show on map
profiler | `profiler[]` | | Given a data item, a profiler will decide how to transform the item into objs on the map

<hr/>
#### Options
Name | Type | Default | Description
---------- | ----| ------------

<hr/>
#### profiler
Name | Type | Default | Description
---------- | ----| ----| -----------
match | <code>Object&#124;Regex&#124;Function</code> |  | Will apply profiles when matched
idKey | <code>String&#124;Function</code> |  | Key path to id of the datum
profiles | <code>Object&#124;[]&#124;Function</code> |  | One or more object profiles to apply

<hr/>
#### profile
Name | Type | Default | Description
---------- | ----| ------| ---------
objId | <code>String&#124;Function</code> |  | Id of the obj
objIdKey | `String` |  | Key path to the Id of the obj, if two objects have the same id, they will be merged into a layer
objType | <code>'marker'&#124;'polyline'&#124;'polygon'&#124;'recgangle'&#124;'circle'&#124;'geoJSON'&#124;'custom'</code> | | Type of object to generate, self-provided object layer if objType='custom'
tooltip | <code>String&#124;Object&#124;Function</code> | | tooltip to show on hover
tooltipKey | `String` | | Key path to the tooltip to show on hover
popup | <code>String&#124;Object&#124;Function</code> | | popup to show on click
popupKey | `String` | | Key path to the popup to show on click
latlng | <code>[]&#124;Function</code> | | location coordinates
latlngKey | `[]` | `[]` | Key path to the location coordinates
label | <code>String&#124;Object&#124;Function</code> | | label for markers
labelKey | `String` | | Key path to the label for markers
ts | <code><Number>[]&#124;Number&#124;Function</code> | | ts for track layout
tsKey | `String` | | Key path to the ts for track layout
selected | `Object` | | Style to use instead of default style
type | <code>'Geometry'&#124;'Feature'&#124;'FeatureCollection'</code> | | Type of geojson
obj | `Leaflet layer` | | Leaflet layer object for objType='custom'
 | * |  | All options supported by leaflet layers for the given objType

<hr/>
#### Events
Event | Callback args | Description
---------- | ----| ------------
selectionChange | `<Number[][]> region, <String[]> ids` | Selection
mouseover | `<MouseEvent> e, <String> id?` | Hover
click | `<MouseEvent> e, <String> id?` | Click
dblclick | `<MouseEvent> e, <String> id?` | Double click
contextmenu | `<MouseEvent> e, <String> id?` | Right click

<hr/>
#### Methods
Method | Returns | Description
---------- | ----| ------------
`on(<String> event, <Object> filter?, <Function> fn)` | `this` | Event
`addData(<Object> datum)` | `this` | 
`removeData()` | `this` | 
`get()` | `this` | 
`getDataFromObjIds()` | `this` |
`getObjsFromDataIds()` | `this` |
`filter()` | `this` |
`clear()` | `this` |


<hr/>
#### Properties
Property | Type | Description
---------- | ----| ------------
data | `{}` | Id-Datum pairs of data
objects | Id-map obj pairs of objects

