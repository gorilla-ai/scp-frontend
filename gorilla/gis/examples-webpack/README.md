## A. Running out of box

### Prerequisites
1. Latest version of npm ~ 3.8.0: `npm install -g npm` (check `npm -v`)  
2. node version >= 6.0.0 (check `node -v`)  
3. `npm install -g babel-cli`  

### Installation
1. `npm run clean-all`  
2. `npm install`

### Start node.js server:
- `npm run start`

### Starting up Project 
- `npm run start-dev` development hot-reload
- `npm run start-prod` production env hot-reload
  
### Clean dependencies
1. `npm run clean` cleans auto-generated assets
2. `npm run clean-all` cleans auto-generated assets + 3rd party libraries + package-lock.json

### JS syntax checker
1. `npm run lint`  generates `lint.log` file
2. `npm run lint-fix` fixes all fixable errors and generates `lint.log` file


### Building for Production|Development Environment
- `npm run build-dev` development build to folder `dist`
- `npm run build-prod` production build to folder `dist`  
will build with prodution flag

---
AJAX read json files use bluebird
json files loaded by webpack


READ:
https://reactjs.org/docs/components-and-props.html

Optimize webpack/babel general:
https://levelup.gitconnected.com/lessons-learned-from-a-year-of-fighting-with-webpack-and-babel-ce3b4b634c46

Optimize momentjs:
https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
