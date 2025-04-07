### Introduction
*widget-builder*

# [Warning] v15 - v16 Migration:
 * hoc appendConfig should change path to object.

#### Support Widgets:
 *  react-chart/Bar
 *  react-chart/Pie
 *  react-chart/Area
 *  react-chart/Line
 *  react-ui/Table
 *  react-ui/Form
 *  react-ui/ButtonGroup
 *  react-ui/CheckboxGroup
 *  react-ui/Checkbox

### Prerequisites
1. Latest version of npm ~ 3.8.0: `npm install -g npm` (check `npm -v`)
2. node version >= 6.0.0 (check `node -v`)
3. `npm install -g babel-cli`

### Installation
`npm install git+ssh://git@git.gorilla-technology.com:scrd01/widget-builder.git#develop`

### Include css
In entry app.js:
```
import 'widget-builder/build/css/app.css'
```

### Usage
`import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'`

#### For webpack users
* import {HOC} from 'widget-builder'

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
            test: /\.css$/,
            loader: ExtractTextPlugin.extract("style-loader", "css-loader")
        }
    ]
}
```
