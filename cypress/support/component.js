// ***********************************************************
// This example support/component.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { mount } from 'cypress/react'

import Promise from 'bluebird'
import logger from 'loglevel-prefix-persist/client'
import loglevel from 'loglevel'
import $ from 'jquery'
import i18n from 'i18next'
import {createInstance} from 'react-ui/build/src/utils/ajax-helper'
import {setupConfigService, setWidgetLocales} from 'widget-builder'

Cypress.Commands.add('mount', mount)

// Example use:
// cy.mount(<MyComponent />)

const initialState = JSON.parse(document.getElementById('initial-state').innerHTML);
const cfg = initialState.envCfg;
const log = logger(cfg.env, loglevel, cfg.log);

start();

function start() {
  const baseUrl = cfg.apiPrefix;
  const contextRoot = cfg.contextRoot;
  const lng = cfg.lng || 'zh';
  const customLocale = cfg.customLocale;
  let url = '';

  $.ajaxPrefilter((options) => {
    options.url = cfg.contextRoot + options.url;
  });

  $(document).ajaxError((event, jqxhr, settings) => {
    const {url} = settings;
    const {status} = jqxhr;
    const {contextRoot} = cfg;

    if (url.indexOf(contextRoot + '/api') === 0 && url.indexOf(contextRoot + '/api/login') < 0) {
      if (status === 401 || status === 403) {
        document.location.reload();
      }
    }
  })

  if (customLocale) {
    url = baseUrl + `/api/locale?lng=${lng}`;
  } else {
    url = `/build/locales/${lng}.json`;
  }

  // set uif
  setupConfigService(baseUrl);
  setWidgetLocales(lng);

  Promise.resolve($.get(url))
    .then(data => {
      if (customLocale) {
        return data.rt;
      } else {
        return data;
      }
    })
    .catch(xhr => {
      log.error(xhr);
      return null;
    })
    .then(resources => {
      i18n.init({
        lng,
        fallbackLng: lng,
        resources: {[lng]:resources}
      }, err => {
        createInstance(
          'chewbacca',
          {
            parseSuccess: resp => {
              if (resp) {
                clearTimeout(global.apiTimer);
                //global.apiTimer = setTimeout(getVersion, 1500000); //25 min.

                return resp.rt;
              }
            },
            parseFail: resp => ({
              code: _.get(resp, 'ret', -100),
              message: _.get(resp, 'message')
              //message: _.get(resp, 'ret', -100)
            }),
            et: i18n.getFixedT(null, 'errors')
          }
        )

        global.chewbaccaI18n = i18n;

        if (err) {
          log.error(err);
        }
        render((
          <BrowserRouter>
            <App />
          </BrowserRouter>
        ), document.getElementById('app-container'))
      })
    })
}