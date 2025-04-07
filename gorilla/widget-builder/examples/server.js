
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
import moment from 'moment'
import favicon from 'serve-favicon'
import fs from 'fs'
import path from 'path'
import loglevel from 'loglevel'
import formidable from 'formidable'

//
import * as WebSocket from 'ws';


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
        port: process.env.PORT || 3000,
        lng: 'zh',
        config_service: process.config_service,
    }, require('./app.config'))


const log = require('loglevel-prefix-persist/server')(cfg.env, loglevel, cfg.log)

log.info("Loading APP in the server!", cfg)

const MOCK_PATH = process.cwd()+'/mock/'
const TEMPLATE_PATH = process.cwd()+'/mock/templates/'

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

function login(req, res, next) {
    const {username, password} = req.body
    const accessTable = JSON.parse(fs.readFileSync('./access.config.json'))
    const access = _.find(accessTable, (item)=>{
        return item.username === username && item.password === password
    })
    if (access) {
        req.session.user = {
            ..._.omit(access, 'password')
        }
    }
    next()
}

function logout(req, res, next) {
    req.session.user = null
    next()
}

function checkSession(req, res, next) {
    if (req.session.user) {
        next()
    }
    else {
        res.status(401).json({code:'1001'})
    }
}

function not_found (req,res) {
    res.status(404).send('Not found')
}

function mock(req, res) {
    const contentType = req.header('content-type')

    if (contentType && contentType.indexOf('multipart/form-data')>=0) {
        const form = new formidable.IncomingForm()
        form.parse(req, (err, fields, files)=>{
            const filesContent = _.mapValues(files, f=>fs.readFileSync(f.path, 'utf8'))
            res.status(200).json({fields, files:filesContent})
        })
        return
    }

    const apiPath = req.baseUrl.substring(5) //skip '/api/' at the front
    const mockFilename = apiPath.replace(/\//g, '-')
    const mockFilePath = MOCK_PATH+mockFilename+'.json'

    if (!fs.existsSync(mockFilePath)) {
        log.error('mock api response does not exist',mockFilePath)
        res.status(404).json({code:-1, errors:[{code:'json mock not found'}]})
    }
    else {
        log.info('serving mock api response',mockFilePath)
        fs.readFile(mockFilePath, (err,content) => {
            const result = JSON.parse(content)
            if (_.has(result,'code')) {
                res.status(404).json(result)
            }
            else {
                res.status(200).json(result)
            }
        })
    }
}

function getTemplate(req, res) {
    const contentType = req.header('content-type')

    if (contentType && contentType.indexOf('multipart/form-data')>=0) {
        const form = new formidable.IncomingForm()
        form.parse(req, (err, fields, files)=>{
            const filesContent = _.mapValues(files, f=>fs.readFileSync(f.path, 'utf8'))
            res.status(200).json({fields, files:filesContent})
        })
        return
    }

    const apiPath = req.baseUrl.substring(10) //skip '/template/' at the front
    const mockFilename = apiPath.replace(/\//g, '-')
    const mockFilePath = TEMPLATE_PATH+mockFilename+'.js'

    if (!fs.existsSync(mockFilePath)) {
        log.error('mock api response does not exist',mockFilePath)
        res.status(404).json({code:-1, errors:[{code:'json mock not found'}]})
    }
    else {
        log.info('serving mock api response',mockFilePath)
        fs.readFile(mockFilePath, "utf8", (err,content) => {
            const result = content
            console.log(content)
            if (_.has(result,'code')) {
                res.status(404).json(result)
            }
            else {
                res.status(200).send(result)
            }
        })
    }
}


const pollingType = [
    "Success",
    "Info",
    "Warning",
    "Error"
]

function getRandomType(){
    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return pollingType[getRandom(0, 3)]
}

function randomPollingData(req, res, next) {
    console.log('PollingData Request Type:', req.method);

    const type = getRandomType()
    if(req.method==='GET')
        res.status(200).json([{label: "這是標題", content: `這是訊息(${req.query.startTime} - ${req.query.endTime})`, type}])
    else
        res.status(200).json([{label: "這是標題", content: `這是訊息(${req.body.startTime} - ${req.body.endTime})`, type}])
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
    .use(favicon(__dirname + '/images/favicon.ico'))
	//.use('/favicon.ico', not_found)
	.use(methodOverride())

if (log.writer) {
    app.use(log.writer)
}

app
    .use('/polling-data-test', randomPollingData)
    .use("/lib", express.static(__dirname + '/lib'))
    .use("/lib/*", not_found)
    .use("/build", express.static(__dirname + '/build'))
    .use("/build/*", not_found)
    .use("/images", express.static(__dirname + '/images'))
    .use("/images/*", not_found)
    .use('/api/login', [login,checkSession])
    .use('/api/logout', logout)
    // .use('/api/*', [checkSession, mock])
    .use('/api/*', mock)
    .use('/template/*', getTemplate)
    .use('/',renderApp)


if (cfg.env === 'development') {
    // only use in development
    app.use(errorhandler())
}


server.listen(app.get('port'), function() {
	log.info('Express server listening on port ' + app.get('port'))
})
//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);

        wss.clients
            .forEach(client => {
                if (client != ws) {//if not self
                    client.send(`Hello, broadcast message -> ${message}`);
                }
            });
    });
    //send immediatly a feedback to the incoming connection
    ws.send('Hi there, I am a WebSocket server');
});
setInterval(() => {
    wss.clients
        .forEach(client => {
            const pollingData = [{label: "WebSocket 廣播", content: `這是訊息(${moment().format('YYYY-MM-DD HH:mm:ss')})`, type: getRandomType()}]
            // console.log('Message broadcasted')
            client.send(JSON.stringify(pollingData));
        });
}, 3000);