import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
// import loglevel from 'loglevel';
// import logger from 'loglevel-prefix-persist/client';

// import 'font-awesome/css/font-awesome.min.css'
// import 'purecss/build/pure-min.css'
import 'react-ui/build/css/react-ui.css';
import '../less/all.less';

// let initialState = JSON.parse(document.getElementById('initial-state').innerHTML)

// const { envCfg: cfg } = window.initialState;

// const log = logger(cfg.env, loglevel, cfg.log);

const Routes = require('./routes').default;

render((
  <Router history={browserHistory}>
    {Routes}
  </Router>
  
), document.getElementById('app-container'));

// webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept();
}
