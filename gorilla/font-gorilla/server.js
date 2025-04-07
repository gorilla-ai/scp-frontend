
/**********
 * Module dependencies.
 **********/
var express = require('express');
var morgan = require('morgan');
var favicon = require('serve-favicon');
var fs = require('fs');
var path = require('path');


var app = express();
var server = require('http').Server(app);

// all environments
app.set('port', 9000);

let not_found = function(req,res) {
    res.status(404).send('Not found');
};

app
    .use(morgan('dev', {skip(req,res){ return res.statusCode <400; }}))
    //.use(favicon(__dirname + '/assets/images/favicon.ico'))
	.use('/favicon.ico', not_found)
    .use('/icomoon/fonts', express.static(__dirname + '/fonts'))
    .use('/icomoon/demo-files', express.static(__dirname + '/demo-files'))
    .use('/icomoon/css', express.static(__dirname + '/css'))
    .use('/fonts', express.static(__dirname + '/fonts'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/preview.html');
});
app.get('/icomoon', function(req, res) {
    res.sendFile(__dirname + '/demo.html');
});
server.listen(app.get('port'), function() {
	console.info('Express server listening on port ' + app.get('port'));
});