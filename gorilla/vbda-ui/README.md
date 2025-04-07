### Introduction
*vbda-ui* is a collection of components and utilities library for VBDA platform
 *  [Demo](http://192.168.4.120:8097)
 *  [Online documentation](http://192.168.4.120:8097/docs/)

#### VBDA Components:
 *  Vbda
 *  Search
 *  Serp
 *  Info
 *  La
 *  Gis
 *  Dashbaord

#### Visualization Components:
 *  Form
 *  Table
 *  Chart
 *  Detail

<hr/>
### Prerequisites
1. Latest version of npm ~ 3.8.0: `npm install -g npm` (check `npm -v`)  
2. node version >= 6.0.0 (check `node -v`)  
3. `npm install -g babel-cli`  
  
### Installation
`npm install git+ssh://git@git.gorilla-technology.com:scrd01/vbda-ui.git`

### Include css
In entry app.js:
```
import 'font-gorilla/css/font-gorilla.css'
import 'purecss/build/pure-min.css'
import 'react-ui/build/css/react-ui.css'
import 'react-chart/build/css/react-chart.css'
import 'gis/build/css/gis.css'
import 'vbda-ui/build/css/vbda-ui.css'
```

### Usage
`import Vbda from 'vbda-ui/build/src/components/vbda'`

#### For webpack users
*  `npm install -g webpack`
* in webpack config
```
    resolve: {
        alias: {
          vbda: path.resolve(__dirname, 'node_modules/vbda-ui/build/src')
        },
        modulesDirectories: ['node_modules']
    }
```
then you can use `import Vbda from 'vbda/components/vbda'`

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


### Documentation generator
`npm install -g jsdoc` 

`npm run doc` generates `docs` folder

