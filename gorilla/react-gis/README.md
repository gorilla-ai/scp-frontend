### Introduction
*react-gis* is a wrapper react component for gis library
 *  [Demo](http://172.18.0.166:8198)
 *  [Online documentation](http://172.18.0.166:8198)

### Prerequisites
1. Latest version of npm ~ 3.8.0: `npm install -g npm` (check `npm -v`)  
2. node version >= 6.0.0 (check `node -v`)  
3. `npm install -g babel-cli`  
  
### Installation
`npm install git+ssh://git@git.gorilla-technology.com:scrd01/react-gis.git`

### Include css
In entry app.js:
```
import 'purecss/build/pure-min.css'
import 'font-gorilla/css/font-gorilla.css'
import 'react-ui/build/css/react-ui.css'
import 'react-gis/build/css/react-gis.css'
```

### Usage
`import Gis from 'react-gis'`


### Documentation generator
`npm install -g jsdoc` 

`npm run doc` generates `docs` folder

