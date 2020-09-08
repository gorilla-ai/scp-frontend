To run this demo you must serve it from a server rather than the file system.

This demo requires webpack to build and run. To install webpack (and other dependencies) run:

> npm install

To run the demo, install and run Live Server:

> npm install -g live-server
> live-server

Live Server will automatically open a new browser tab at http://localhost:8080 to show the demo folder.
Click index.htm to see the demo running.

File Name           Description
angular/*           Angular integration code
css/keylines.css    KeyLines style settings
fonts/              Default KeyLines font files
images/             Icon, glyph and flag images for use with KeyLines
index.htm           A 'hello world' sample file
js/keylines.js      The KeyLines JavaScript component
map/*               Map display code
ng/*                AngularJS integration code
package.json        NPM package file. To install KeyLines as an npm package in your project, run
                      npm install <folder>
                    replacing <folder> with the path to this folder.
                    You can then import or require the 'keylines' package in your project.
react/*             React integration code
ts/keylines.d.ts    TypeScript definition file for KeyLines
vue/*               VueJS integration code
