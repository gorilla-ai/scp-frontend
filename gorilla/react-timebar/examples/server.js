
/**********
 * Module dependencies.
 **********/
import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import methodOverride from 'method-override'
import morgan from 'morgan'
import errorhandler from 'errorhandler'
import _ from 'lodash'
import favicon from 'serve-favicon'
import fs from 'fs'
import path from 'path'
import loglevel from 'loglevel'



express.response.json2 = function(error, data) {
    if (error) {
        log.error(error);
        if (error instanceof Error) {
            this.status(400).json({message:error.message, code:error.code});
        }
        else if (_.isObject(error)) {
            this.status(400).json(error);
        }
        else {
            this.status(400).json({message:error});
        }
    }
    else {
        this.status(200).json(data || {});
    }
};

const app = express()
const server = require('http').Server(app)

const cfg = _.assign({
        env: process.env.NODE_ENV || 'development', 
        contextRoot: '', 
        port: process.env.PORT || 3000
    }, require('./app.config'))


const log = require('loglevel-prefix-persist/server')(cfg.env, loglevel, cfg.log)

log.info("Loading APP in the server!", cfg)

const MOCK_PATH = process.cwd()+'/mock/'

// all environments
app.set('port', cfg.port)

function renderApp(req, res, next) {
    const lng = req.query.lng || cfg.lng
    const session = req.session.user

    const initialState = {
        envCfg: _.assign({}, _.omit(cfg,'app'), {lng:lng}), 
        appCfg: cfg.app,
        session
    }

    log.info('renderApp',initialState)


    fs.readFile('./index.html', 'utf8', function(err, content) {
        const compiled = _.template(content)
        res.setHeader('Content-Type', 'text/html')
        res.status(200).send(compiled({
            html:content, 
            initialState:JSON.stringify(initialState)
        }))
    })
}


function not_found (req,res) {
    res.status(404).send('Not found')
}

function mock(req, res) {
    const contentType = req.header('content-type')
    
    const apiPath = req.baseUrl.substring(5) //skip '/api/' at the front
    const mockFilename = apiPath.replace(/\//g, '-')
    const mockFilePath = MOCK_PATH+mockFilename+'.json'

    if (!fs.existsSync(mockFilePath)) {
        log.error('mock api response does not exist: ', mockFilePath, ', serving empty response instead')
        //res.json2({code:-1, errors:[{code:'json mock not found'}]})
        res.json2()
    }
    else {
        log.info('serving mock api response',mockFilePath)
        fs.readFile(mockFilePath, (err,content) => {
            const result = JSON.parse(content)
            if (_.has(result, 'code')) {
                res.json2(result)
            }
            else {
                res.json2(null, result)
            }
        })
    }
}



app
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use(session({
        resave: false,
        saveUninitialized: false,
        secret: 'myapp',
        cookie:{maxAge:1800000}
    }))
    .use(morgan('dev', {skip(req,res){ return res.statusCode <400 }}))
    //.use(favicon(__dirname + '/images/favicon.ico'))
    .use('/favicon.ico', not_found)
    .use(methodOverride())

if (log.writer) {
    app.use(log.writer)
}

app
    .use("/build", express.static(__dirname + '/build'))
    .use("/build/*", not_found)
    .use("/lib", express.static(__dirname + '/lib'))
    .use("/lib/*", not_found)
    .use("/images", express.static(__dirname + '/images'))
    .use("/images/*", not_found)
    .use('/api/*', mock)
    .use('/docs/keylines', express.static(__dirname + '/../keylines docs'))
    .use('/docs/keylines/*', (req,res)=>{
        res.redirect('/docs/keylines');
    })
    .use('/docs', express.static(__dirname + '/../docs'))
    .use('/docs/*', (req,res)=>{
        res.redirect('/docs');
    })
    .use('/',renderApp)


if (cfg.env === 'development') {
    // only use in development
    app.use(errorhandler())
}


server.listen(app.get('port'), function() {
    log.info('Express server listening on port ' + app.get('port'))
})