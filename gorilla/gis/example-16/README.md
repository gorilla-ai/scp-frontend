### Introduction
*gis* is a library for manipulating data-driven gis related things, uses leaflet
 *  [Demo](http://gui.i8.vc:8098)
 *  [Gis Doc](https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md)

#### Features:
 *  base maps using google, osm, or custom map server
 *  enabling/disabling zoom in/out/panning
 *  create markers, provide styling options for selected/not selected status
 *  center one or more markers
 *  drag-drop icon/markers (from both ouside and inside of map)
 *  rotate icon/markers
 *  labeling icon/markers
 *  hover/popup icon/markers
 *  select all markers in selected region (polygon/circle regions)
 *  switching layers
 *  highlight region using geoJSON
 *  google API routing (path planning)
 *  heatmap
 *  support time-based events for the icon/marker

<hr/>
### Prerequisites
1. Latest version of npm ~ 3.8.0: `npm install -g npm` (check `npm -v`)  
2. node version >= 6.0.0 (check `node -v`)  
3. `npm install -g babel-cli`  
  
### Installation
`npm install git+ssh://git@git.gorilla-technology.com:scrd01/gis.git`

### Include css
In entry app.js:
```
import 'gis/build/gis.css'
```

### Usage
`import gis from 'gis/build/gis'`

#### For webpack users
*  `npm install -g webpack`
* in webpack config
```
    resolve: {
        alias: {
          gis: path.resolve(__dirname, 'node_modules/gis/build')
        },
        modulesDirectories: ['node_modules']
    }
```
then you can use `import gis from 'gis'`

* loaders
```
module: {
    loaders: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: ['babel-loader'/*,'eslint-loader'*/]
        },
        {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract("style-loader","css-loader?modules=true&localIdentName=[name]__[local]___[hash:base64:5]!less-loader")
        },
        {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract("style-loader", "css-loader")
        },
        { 
            test: /\.(png|woff|woff2|eot|ttf|svg)(\?.+)?$/,
            loader: 'url-loader?limit=100000'
        },
        { 
            test: /\.json$/, 
            loader: 'json-loader'
        }
    ]
}
```

