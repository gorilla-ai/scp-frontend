If you run this demo from the filesystem, some functionality may not work. You should serve it from a web server instead.

If you are using Node.js as your web server, you should first install Express by running:

> npm install express

You can then start your web server by running:

> node server.js

If you can't run Node or Express, just use a simple Python server:

 > python -m SimpleHTTPServer 8080

Then you can navigate to http://localhost:8080 in your web browser to see the demo running.

File Name           Description
angular/*           Angular integration code (beta)
assets/             KeyLines image assets directory
css/keylines.css    KeyLines style settings
fonts/              Default KeyLines font files
images/             Icon, glyph and flag images for use with KeyLines
index.htm           A 'hello world' sample file
js/keylines.js      The KeyLines JavaScript component
map/*               Map display code
ng/*                AngularJS integration code
react/*             ReactJS integration code (beta)
ts/keylines.d.ts    TypeScript definition file for KeyLines (alpha)
server.js           A simple NodeJS webserver for testing the zip contents
