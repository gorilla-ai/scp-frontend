import React from 'react'
import { render } from 'react-dom'
import { Router, browserHistory } from 'react-router'
import loglevel from 'loglevel'
import logger from 'loglevel-prefix-persist/client'

import 'font-gorilla/css/font-gorilla.css'
import 'purecss/build/pure-min.css'

let initialState = JSON.parse(document.getElementById('initial-state').innerHTML)

let {envCfg:cfg} = initialState

let log = logger(cfg.env, loglevel, cfg.log)

let Routes = require('./routes').default

render((
    <Router history={browserHistory}>
        {Routes}
    </Router>
), document.getElementById('app-container'))
