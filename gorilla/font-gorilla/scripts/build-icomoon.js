/* eslint-disable no-multiple-empty-lines */
const _ = require('lodash');
const fs = require('fs');

const SVG_DIR = 'svg';
const FONT_NAME = 'font-gorilla';
const CSS_PATH = 'css/font-gorilla.css';
const DEMO_PATH = 'demo.html';
const DEMO_CSS_PATH = 'demo-files/demo.css';

console.log('Reading css file...');

let cssContent = fs.readFileSync(CSS_PATH);

console.log('Updating font paths...');
cssContent = _.replace(cssContent, /'fonts/g, "'../fonts");


console.log('Renaming css class names...');
cssContent = _.replace(cssContent, /.fg([_\-a-zA-Z\d])+:before/gi, (matched) => {
  const newName = matched.replace(/^.fg-ic_/g,'.fg-').replace(/[_]/g, '-');
  console.log(`Rename ${matched} to ${newName}`);
  return newName;
});


fs.writeFileSync(CSS_PATH, cssContent);
console.log('Done!');


console.log('Reading demo file...');

let demoContent = fs.readFileSync(DEMO_PATH);

console.log('Updating style css...');
demoContent = _.replace(demoContent, /"style.css"/g, '"css/font-gorilla.css"');


console.log('Renaming demo class names...');
demoContent = _.replace(demoContent, /fg-([_\-a-zA-Z\d])+/gi, (matched) => {
  const newName = matched.replace(/^fg-ic_/g,'fg-').replace(/[_]/g, '-');
  console.log(`Rename ${matched} to ${newName}`);
  return newName;
});

fs.writeFileSync(DEMO_PATH, demoContent);


console.log('Updating demo css styles...');
let demoCssContent = fs.readFileSync(DEMO_CSS_PATH);
demoCssContent += '.glyph { margin-bottom: 0; width: 11em; margin-right: 1.5em;} .fs0 {display: none;}';

fs.writeFileSync(DEMO_CSS_PATH, demoCssContent);


console.log('Done!');
