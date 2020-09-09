// If you are using Node.js as your web server, you should first install Express by running:
//
// > npm install express
//
// You can then start your web server by running this file:
//
// > node server.js
//
// If you can't run Node or Express, just use a simple Python server
//    
//  > python -m SimpleHTTPServer 8080
//
// Then you can navigate to http://localhost:8080 in your web browser to see the demo running.

var path = require('path');

// Helper to get the major version of Express
function getVersion(){
  // Since Express 3.3 version is not exposed any longer
  var version = (express.version || '4.').match(/^(\d)+\./)[1];
  return Number(version);
}

var express = require('express');

var app;

var version = getVersion();

// Depending on the version number there are several ways to create an app
if(version === 2){
  app = express.createServer();
} else if(version > 2){
  app = express();
}

app.use('/', express["static"].apply(null, [__dirname + '/']));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.htm'));
});

app.listen(8080);

console.log('Server running. Browse to http://localhost:8080');
