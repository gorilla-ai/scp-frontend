
/** ********
 * Module dependencies.
 ********* */
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const _ = require('lodash');
// const favicon = require('serve-favicon');
const fs = require('fs');
// const path = require('path');
const loglevel = require('loglevel');


const app = express();
const server = require('http').Server(app);

const cfg = _.assign({
  env: process.env.NODE_ENV || 'development',
  contextRoot: '',
  port: process.env.PORT || 3000,
  lng: 'zh'
}, require('./app.config'));

const log = require('loglevel-prefix-persist/server')(cfg.env, loglevel, cfg.log);


log.info('Loading APP in the server!', cfg);

const MOCK_PATH = `${process.cwd()}/assets/mock/`;

// all environments
app.set('port', cfg.port);

function renderApp(req, res, next) {
  const lng = req.query.lng || cfg.lng;
  const reqSession = req.session.user;

  const initialState = {
    envCfg: _.assign({}, cfg, { lng }),
    reqSession
  };

  log.info('renderApp', initialState);


  fs.readFile('./index.html', 'utf8', (err, content) => {
    const compiled = _.template(content);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(compiled({
      html: content,
      initialState: JSON.stringify(initialState)
    }));
  });
}

function login(req, res, next) {
  req.session.user = {
    rights: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    id: 1,
    name: 'WHOEVER',
    roles: [-2]
  };

  next();
}

function logout(req, res, next) {
  req.session.user = null;
  next();
}
function mock(req, res) {
  const apiPath = req.baseUrl.substring(5); // skip '/api/' at the front
  let mockFilename = apiPath.replace(/\//g, '-');

  if (
    mockFilename === 'search-identity-phone'
    || mockFilename === 'search-identity-email'
    || mockFilename === 'search-identity-nickname'
  ) {
    mockFilename = 'search-identity';
  }

  if (
    mockFilename === 'la-identity-phone'
    || mockFilename === 'la-identity-email'
    || mockFilename === 'la-identity-nickname'
  ) {
    mockFilename = 'la-identity';
  }

  const mockFilePath = `${MOCK_PATH}${mockFilename}.json`;

  if (!fs.existsSync(mockFilePath)) {
    log.error('mock api response does not exist', mockFilePath);
    res.status(200).json({ code: -1, errors: [{ code: 'json mock not found' }] });
  } else {
    log.info('serving mock api response', mockFilePath);
    fs.readFile(mockFilePath, (err, content) => {
      res.status(200).json(JSON.parse(content));
    });
  }
}

const notFound = (req, res) => {
  res.status(404).send('Not found');
};


app
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'myapp',
    cookie: { maxAge: 1800000 }
  }))
  .use(morgan('dev', { skip(req, res){ return res.statusCode <400; } }))
  // .use(favicon(__dirname + '/assets/images/favicon.ico'))
  .use('/favicon.ico', notFound)
  .use(methodOverride());

if (log.writer) {
  app.use(log.writer);
}

app
  .use('/build', express.static(`${__dirname}/build`))
  .use('/build/*', notFound)
  .use('/images', express.static(`${__dirname}/images`))
  .use('/images/*', notFound)
  .use('/api/login', login)
  .use('/api/logout', logout)
  .use('/api/*', mock)
  .use('/docs', express.static(`${__dirname}/../docs`))
  .use('/docs/*', (req, res) => {
    res.redirect('/docs');
  })
  .use('/', renderApp);


if (cfg.env === 'development') {
  // only use in development
  app.use(errorhandler());
}


server.listen(app.get('port'), () => {
  log.info(`Express server listening on port ${app.get('port')}`);
});
