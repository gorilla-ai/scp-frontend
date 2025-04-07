### Introduction
*react-ui* is a collection of commonly used components and utilities library
 *  [Demo](http://192.168.10.118:8099)
 *  [Online documentation](http://192.168.10.118:8099/docs/)

#### Components:
 *  ButtonGroup
 *  CheckboxGroup
 *  Checkbox
 *  Combobox
 *  Contextmenu
 *  DatePicker
 *  DateRange
 *  Dropdown
 *  FileInput
 *  Form
 *  Grid
 *  Input
 *  List
 *  ModalDialog
 *  MultiInput
 *  PageNav
 *  Popover
 *  PopupDialog
 *  Progress
 *  RadioGroup
 *  Slider
 *  Search
 *  Table
 *  Tabs
 *  Text
 *  Timeline
 *  ToggleButton
 *  Tree

#### Utilities:
 *  auth-helper
 *  download
 *  grid-event
 *  input-helper
 *  outside-event

<hr/>
### Prerequisites
1. Latest version of npm ~ 3.8.0: `npm install -g npm` (check `npm -v`)  
2. node version >= 6.0.0 (check `node -v`)  
3. `npm install -g babel-cli`  
  
### Installation
`npm install git+ssh://git@git.gorilla-technology.com:scrd01/react-ui.git`

### Include css
In entry app.js:
```
import 'font-awesome/css/font-awesome.min.css'
import 'purecss/build/pure-min.css'
import 'react-ui/build/css/react-ui.css'
```

### Usage
`import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'`

#### For webpack users
*  `npm install -g webpack`
* in webpack config
```
    resolve: {
        alias: {
          core: path.resolve(__dirname, 'node_modules/react-ui/build/src')
        },
        modulesDirectories: ['node_modules']
    }
```
then you can use `import CheckboxGroup from 'core/components/checkbox-group'`

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

