### Introduction
*react-la* is a wrapper react component for la library
 *  [Demo](http://172.18.0.166:8191)
 *  [Online documentation](http://172.18.0.166:8191/docs)
 *  [Keylines documentation](http://172.18.0.166:8191/keylines docs/API Reference.html)

### Prerequisites
1. Latest version of npm ~ 3.8.0: `npm install -g npm` (check `npm -v`)  
2. node version >= 6.0.0 (check `node -v`)  
3. `npm install -g babel-cli`  
  
### Installation
`npm install git+ssh://git@git.gorilla-technology.com:scrd01/react-la.git`

### In html file
```
<script src=/lib/keylines/js/keylines.js></script>
```

### Include css
In entry app.js:
```
import 'purecss/build/pure-min.css'
import 'font-gorilla/css/font-gorilla.css'
import 'react-ui/build/css/react-ui.css'
import 'react-la/build/css/react-la.css'
```

### Usage
`import La from 'react-la'`


### Documentation generator
`npm install -g jsdoc` 

`npm run doc` generates `docs` folder

