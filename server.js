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
import formidable from 'formidable'

const app = express()
const server = require('http').Server(app)
const cfg = _.assign({
  env: process.env.NODE_ENV || 'development', 
  contextRoot: '',
  apiPrefix: 'http:\//172.18.0.119/SCP', //Prod environment
  //apiPrefix: 'http:\//192.168.11.91/SCP', //Test environment
  //apiPrefix: 'http:\//192.168.12.111/SCP', //QA environment
  //apiPrefix: 'http:\//172.18.0.136/SCP', //Rays's machine
  //apiPrefix: 'http:\//172.18.0.87/SCP', //Rex's machine
  //apiPrefix: 'http:\//172.18.0.52/SCP', //Allen's machine
  port: process.env.PORT || 3000,
  version: '1.2.2437.491',
  lng: 'zh',
  customLocale: false,
  app: {
    searchFields: {
      session: ["_id", "ro", "ipSrc", "portSrc", "ipDst", "portDst", "prot-term", "mac1-term", "mac2-term", "tcpflags.fin", "tcpflags.rst", "g1", "g2", "lastPacket", "firstPacket", "pa", "ipSrc", "portSrc", "ipDst", "portDst", "timestamp", "lastPacket", "dstSvcname", "dstHostname", "srcSvcname", "srcHostname", "createTimestamp", "projectName", "sessionId", "_tableMenu_", "_eventDttm_", "srcIp", "srcPort", "destIp", "destPort"],
      http: ["method", "requestUri", "hostname", "userAgent", "requestRawHeader", "uploadFilePath", "uploadContentType", "uploadData", "version", "statusCode", "reasonPhrase", "responseRawHeader", "downloadFilePath", "downloadContentType", "downloadData", "downloadFileIsMalware", "ipSrc", "portSrc", "ipDst", "portDst", "timestamp", "lastPacket", "dstSvcname", "dstHostname", "srcSvcname", "srcHostname", "createTimestamp", "projectName", "sessionId", "_tableMenu_", "_eventDttm_", "srcIp", "srcPort", "destIp", "destPort"],
      html: ["htmlTitle", "htmlRelinkPath", "ipSrc", "portSrc", "ipDst", "portDst", "timestamp", "lastPacket", "dstSvcname", "dstHostname", "srcSvcname", "srcHostname", "createTimestamp", "projectName", "sessionId", "_tableMenu_", "_eventDttm_", "srcIp", "srcPort", "destIp", "destPort"],
      email: ["username", "password", "subject", "mailActionType", "mailFolderType", "sendDate", "receivedDate", "htmlBodyPath", "textBodyPath", "from", "to", "cc", "bcc", "attachment", "body", "owner", "contact", "ipSrc", "portSrc", "ipDst", "portDst", "timestamp", "lastPacket", "dstSvcname", "dstHostname", "srcSvcname", "srcHostname", "createTimestamp", "projectName", "sessionId", "_tableMenu_", "_eventDttm_", "srcIp", "srcPort", "destIp", "destPort"],
      file: ["decoderName", "filePath", "extensionIsValid", "isMalware", "md5", "sha1", "fileInfo", "detectedType", "originalType", "ipSrc", "portSrc", "ipDst", "portDst", "timestamp", "lastPacket", "dstSvcname", "dstHostname", "srcSvcname", "srcHostname", "createTimestamp", "projectName", "sessionId", "_tableMenu_", "_eventDttm_", "srcIp", "srcPort", "destIp", "destPort"],
      cert: ["_tableMenu_", "issuer", "subject", "validFrom", "validTo", "tlsVersion", "ciphersuite", "ciphersuitName", "filePath", "ipSrc", "portSrc", "ipDst", "portDst", "timestamp", "lastPacket", "dstSvcname", "dstHostname", "srcSvcname", "srcHostname", "createTimestamp", "projectName", "sessionId"],
      ftp: ["controlText", "ipSrc", "portSrc", "ipDst", "portDst", "timestamp", "lastPacket", "dstSvcname", "dstHostname", "srcSvcname", "srcHostname", "createTimestamp", "projectName", "sessionId", "_tableMenu_", "_eventDttm_", "srcIp", "srcPort", "destIp", "destPort"],
      alert: ["_eventDttm_", "Severity", "Info", "Collector", "Trigger", "Suggest"],
      dns: ["_id", "ro", "prot-term", "ps", "psl", "dnsip", "dnsho", "dns.opcode-term", "dns.status-term", "lastPacket", "timestamp", "ipSrc", "portSrc", "ipDst", "portDst", "timestamp", "lastPacket", "dstSvcname", "dstHostname", "srcSvcname", "srcHostname", "createTimestamp", "projectName", "sessionId", "_tableMenu_", "_eventDttm_", "srcIp", "srcPort", "destIp", "destPort"]
    },
    whoisService: 'https:\//www.whois.com/whois/'
  },
  productName: 'SCP',
  companyName: 'NSGUARD',
  session: {
    rights: ["Module_Common", "Module_Config"],
    name: null,
    account: "admin",
    accountId: "DPIR-00000000-0000-0000-0000-000000000000"
  },
  mapUrl: 'https://mt0.google.com/vt/lyrs=m&hl=en-US&x={x}&y={y}&z={z}'
  // session: {
  //   rights: [],
  //   name: null,
  //   account: null,
  //   accountId: null
  // }
}, require('./app.config'))

const log = require('loglevel-prefix-persist/server')(cfg.env, loglevel, cfg.log)

log.info("Loading APP in the server!", cfg)

const MOCK_PATH = process.cwd()+'/mock/'

// all environments
app.set('port', cfg.port)

function renderApp(req, res, next) {
  let lng = req.query.lng || cfg.lng
  let session = req.session.user

  let initialState = {
    envCfg: _.assign({}, _.omit(cfg,'app'), {lng:lng}), 
    appCfg: cfg.app,
    companyName: cfg.companyName,
    productName: cfg.productName,
    session: cfg.session
  }

  log.info('renderApp',initialState)


  fs.readFile('./index.html', 'utf8', function(err, content) {
    let compiled = _.template(content)
    res.setHeader('Content-Type', 'text/html')
    res.status(200).send(compiled({
      html:content,
      initialState:JSON.stringify(initialState)
    }))
  })
}

function login(req, res, next) {
  let {name, password} = req.query
  if (name==='admin' && password==='gorillakm') {
    req.session.user = {
      rights:[1,2,3,4,5,6],
      id:1,
      name:'WHOEVER',
      roles:[-2]
    }
  }
  next()
}

function logout(req, res, next) {
  req.session.user = null
  next()
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
      res.status(200).json({code:0, data:{fields, files:filesContent}})
    })
    return
  }
  
  let apiPath = req.baseUrl.substring(15) //skip '/api/' at the front
  let mockFilename = apiPath.replace(/\//g, '-')
  let mockFilePath = MOCK_PATH+mockFilename+'.json'

  if (!fs.existsSync(mockFilePath)) {
    log.error('mock api response does not exist',mockFilePath)
    res.status(404).json({code:-1, errors:[{code:'json mock not found'}]})
  }
  else {
    log.info('serving mock api response',mockFilePath)
    fs.readFile(mockFilePath, (err,content) => {
      let result = JSON.parse(content)
      res.status(result.status==='success'?200:404).json(result)
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
  //.use(favicon(__dirname + '/assets/images/favicon.ico'))
  .use('/favicon.ico', not_found)
  .use(methodOverride())

if (log.writer) {
  app.use(log.writer)
}

app
  .use("/build",express.static(__dirname + '/build'))
  .use("/build/*", not_found)
  .use("/images", express.static(__dirname + '/images'))
  .use("/images/*", not_found)
  .use("/lib", express.static(__dirname + '/lib'))
  .use("/lib/*", not_found)    
  .use('/chewbacca/api/*', mock)
  .use('/docs', express.static(__dirname + '/../docs'))
  .use('/docs/*', (req,res)=>{
    res.redirect('/docs')
  })
  .use('/',renderApp)


if (cfg.env === 'development') {
  // only use in development
  app.use(errorhandler())
}


server.listen(app.get('port'), function() {
  log.info('Express server listening on port ' + app.get('port'))
})