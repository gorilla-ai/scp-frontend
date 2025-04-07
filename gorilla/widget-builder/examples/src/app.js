import React from 'react'
import { render } from 'react-dom'
import Promise from 'bluebird'
import $ from 'jquery'
import loglevel from 'loglevel'
import logger from 'loglevel-prefix-persist/client'
import i18n from 'i18next'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import {setupConfigService as setupHOCConfigService, setWidgetDependency} from 'widget-builder'
import {setupConfigService} from 'app/utils/api-helper'
import ReactUi from 'react-ui'
import ReactChart from 'react-chart'
import reactWordCloud from 'react-word-cloud'

import 'font-gorilla/css/font-gorilla.css'
import 'purecss/build/pure-min.css'
import 'react-ui/build/css/react-ui.css'
// import 'widget-builder/../css/app.css'
import 'widget-builder/../build/css/app.css'

import { create as createStore } from './redux'


const initialState = JSON.parse(document.getElementById('initial-state').innerHTML || '{}')

const {envCfg:cfg} = initialState

const log = logger(cfg.env, loglevel, cfg.log)

// must use require for logger to append namespace in log.xx() calls
const App = require('app/components/app').default

log.info('Loading APP in the browser!', initialState);

// ajax global setup
(function setupJquery() {
    // setup global ajax request property
    const originalXhr = $.ajaxSettings.xhr
    $.ajaxSetup({
        cache: false,
        //progress: function() { console.log("standard progress callback"); },
        xhr() {
            // upload progress: source https://gist.github.com/db/966388
            let req = originalXhr()
            if (req.upload) {
                req.upload.addEventListener('progress', (evt) => {
                    if (evt.lengthComputable) {
                        this.progress && this.progress(evt.loaded, evt.total)
                    }
                }, false)
            }
            return req
        }
    })

    // prepend all ajax request with contextRoot
    $.ajaxPrefilter((options) => {
        options.url = cfg.contextRoot+options.url
    })


    $(document).ajaxError((event, jqxhr, settings) => {
        const {url} = settings
        const {status} = jqxhr
        const {contextRoot} = cfg
        if (url.indexOf(contextRoot+'/api') === 0 && url.indexOf(contextRoot+'/api/login') < 0) {
            if (status===401 || status===403) {
                document.location.reload()
            }
        }
    })
}())

function start() {
    const store = createStore(initialState)
    const lng = cfg.lng || 'zh'
    const config_service = cfg.config_service
    if (config_service === undefined) {
        alert('config_service setting not found, please check app.config.json.')
    }
    setupHOCConfigService(config_service)
    setWidgetDependency({
        "react-ui": ReactUi,
        "react-chart": ReactChart,
        "react-word-cloud": reactWordCloud
    })
    setupConfigService(config_service)
    Promise.resolve($.get(`/build/locales/${lng}.json`))
        .then(data => {
            return data
        })
        .catch(xhr => {
            log.error(xhr)
            return null
        })
        .then(resources => {
            i18n.init({
                lng,
                fallbackLng: lng,
                resources: {[lng]:resources}
            }, err => {
                if (err) {
                    log.error(err)
                }
                render((
                    <Provider store={store}>
                        <Router basename={cfg.contextRoot}>
                            <App />
                        </Router>
                    </Provider>
                ), document.getElementById('app-container'))
            })
        })
}

start()
// alternatives embed locales in initialState. But it will decrease readability