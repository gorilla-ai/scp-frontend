
/**********
 * Module dependencies.
 **********/
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var methodOverride = require('method-override');
var morgan = require('morgan');
var errorhandler = require('errorhandler');
var _ = require('lodash');
var favicon = require('serve-favicon');
var fs = require('fs');
var path = require('path');
var loglevel = require('loglevel');


var app = express();
var server = require('http').Server(app);

var cfg = _.assign({
        env: process.env.NODE_ENV || 'development', 
        contextRoot: '', 
        port: process.env.PORT || 3000,
        lng: 'zh'
    }, require('./app.config'));


var log = require('loglevel-prefix-persist/server')(cfg.env, loglevel, cfg.log);

log.info("Loading APP in the server!", cfg);

const MOCK_PATH = process.cwd()+'/assets/mock/'

// all environments
app.set('port', cfg.port);

function renderApp(req, res, next) {
    var lng = req.query.lng || cfg.lng;
    var theme = req.query.theme || 'dark';
    var session = req.session.user;

    var initialState = {
        envCfg: _.assign({}, cfg, {lng:lng}), 
        session
    };

    log.info('renderApp',initialState);


    fs.readFile('./index.html', 'utf8', function(err, content) {
        var compiled = _.template(content);
        res.setHeader('Content-Type', 'text/html')
        res.status(200).send(compiled({
            html:content, 
            initialState:JSON.stringify(initialState),
            theme
        }));
    });
}

function login(req, res, next) {
    req.session.user = {
        rights:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
        id:1,
        name:'WHOEVER',
        roles:[-2]
    }
    next();
}

function logout(req, res, next) {
    req.session.user = null;
    next();
}
function mock(req, res) {
    let apiPath = req.baseUrl.substring(5); //skip '/api/' at the front
    let mockFilename = apiPath.replace(/\//g, '-');

    if (
        mockFilename === 'search-identity-phone' ||
        mockFilename === 'search-identity-email' ||
        mockFilename === 'search-identity-nickname'
    ) {
        mockFilename = 'search-identity';
    }

    if (
        mockFilename === 'la-identity-phone' ||
        mockFilename === 'la-identity-email' ||
        mockFilename === 'la-identity-nickname'
    ) {
        mockFilename = 'la-identity';
    }

    let mockFilePath = MOCK_PATH+mockFilename+'.json';

    if (!fs.existsSync(mockFilePath)) {
        log.error('mock api response does not exist',mockFilePath)
        res.status(200).json({code:-1, errors:[{code:'json mock not found'}]})
    }
    else {
        log.info('serving mock api response',mockFilePath)
        fs.readFile(mockFilePath, (err,content) => {
            res.status(200).json(JSON.parse(content))
        })
    }
}

let not_found = function(req,res) {
    res.status(404).send('Not found');
};


app
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use(session({
        resave: false,
        saveUninitialized: false,
        secret: 'myapp',
        cookie:{maxAge:1800000}
    }))
    .use(morgan('dev', {skip(req,res){ return res.statusCode <400; }}))
    //.use(favicon(__dirname + '/assets/images/favicon.ico'))
	.use('/favicon.ico', not_found)
	.use(methodOverride())

if (log.writer) {
    app.use(log.writer);
}

app
    .use("/build/css/react-ui",express.static(__dirname + '/../build/css'))
    .use("/build",express.static(__dirname + '/build'))
    .use("/build/*", not_found)
    .use("/build",express.static(__dirname + '/build'))
    .use("/build/*", not_found)
    .use("/images",express.static(__dirname + '/images'))
    .use("/images/*", not_found)
    .use('/api/login', login)
    .use('/api/logout', logout)
    .use('/api/*', mock)
    .use('/docs', express.static(__dirname + '/../docs'))
    .use('/docs/*', (req,res)=>{
        res.redirect('/docs');
    })
    .use('/',renderApp);


if (cfg.env === 'development') {
    // only use in development
    app.use(errorhandler())
}


server.listen(app.get('port'), function() {
	log.info('Express server listening on port ' + app.get('port'));
});