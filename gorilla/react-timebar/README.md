### Introduction
*react-timebar* is a wrapper react component for timebar from keylines library
 *  [Demo](http://172.18.0.166:8099)
 *  [Online documentation](http://172.18.0.166:8099/docs)
 *  [Keylines documentation](http://172.18.0.166:8099/docs/keylines/API Reference.html#formats_timebar)

### Prerequisites
1. Latest version of npm ~ 3.8.0: `npm install -g npm` (check `npm -v`)  
2. node version >= 6.0.0 (check `node -v`)  
3. `npm install -g babel-cli`  
  
### Installation
`npm install git+ssh://git@ivs.duckdns.org:10022/web-ui/react-timebar.git`

### In html file
```
<script src=/lib/keylines/js/keylines.js></script>
```

### Include css
In entry app.js:
```
import 'react-timebar/build/css/react-timebar.css'
```

### Usage
`import Timebar from 'react-timebar'`


### Documentation generator
`npm install -g jsdoc` 

`npm run doc` generates `docs` folder

