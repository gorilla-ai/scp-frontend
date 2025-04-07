CIAP Boilerplate.

## A. Development Environment
  
### Prerequisites
1. Latest version of npm ~ 3.8.0: `npm install -g npm` (check `npm -v`)  
2. node version >= 6.0.0 (check `node -v`)  
3. `npm install -g babel-cli grunt-cli webpack`  
  
### Installation
1. `npm run clean-all`  
2. `npm install`
  
### Starting up Project 
1. Auto detect changes and build static js/css files for front end:
`grunt`  
2. Start node.js server:   
`npm start`
  
### Clean dependencies
1. `npm run clean` cleans auto-generated assets
2. `npm run clean-all` cleans auto-generated assets + 3rd party libraries

### JS syntax checker
1. `npm run lint`  generates `lint.log` file
2. `npm run lint-fix` fixes all fixable errors and generates `lint.log` file

## B. Building for Production Environment
`grunt prod`  
will build with prodution flag
  
