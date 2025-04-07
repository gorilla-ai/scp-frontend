import React from 'react'
import { render } from 'react-dom'
import { Router, browserHistory } from 'react-router'
import loglevel from 'loglevel'
import logger from 'loglevel-prefix-persist/client'

import 'purecss/build/pure-min.css'
import 'react-ui/build/css/react-ui.css'
//import 'react-timebar/build/css/react-timebar.css'

let initialState = JSON.parse(document.getElementById('initial-state').innerHTML)

let {envCfg:cfg} = initialState

let log = logger(cfg.env, loglevel, cfg.log)

let Routes = require('./routes').default

render((
    <Router history={browserHistory}>
        {Routes}
    </Router>
), document.getElementById('app-container'))
