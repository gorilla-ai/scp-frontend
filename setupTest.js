// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import Promise from 'bluebird'
import logger from 'loglevel-prefix-persist/client'
import loglevel from 'loglevel'
import $ from 'jquery'
import {createInstance} from 'react-ui/build/src/utils/ajax-helper'
import {setupConfigService, setWidgetLocales} from 'widget-builder'

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

// i18n.use(initReactI18next).init({
//   lng: 'zh',
//   fallbackLng: 'zh',

//   // have a common namespace used around the full app
//   ns: ['translationsNS'],
//   defaultNS: 'translationsNS',

//   debug: false,

//   interpolation: {
//     escapeValue: false, // not needed for react!!
//   },

//   resources: { en: { translationsNS: {} } },
// });

// window.initialState = {
//   envCfg: {
//     contextRoot: '',
//     env: 'development',
//     lng: 'zh',
//     port: 443,
//     version: '1.0.9389.65',
//   },
//   appCfg: {
//     logoUrl: '/images/logo.png',
//     title: 'NTPC',
//     subtitle: 'TIMAP',
//     autoExploreConcurrentThreads: 500,
//     checkProjectHasRunningTasksInterval: 600000,
//     map: {
//       standard: {
//         layer: 'https://mt0.google.com/vt/lyrs=m&hl=zh-TW&x={x}&y={y}&z={z}',
//       },
//       satellite: {
//         layer: 'https://mt0.google.com/vt/lyrs=y&hl=zh-TW&x={x}&y={y}&z={z}',
//       },
//     },
//     defaultSearchEngineStatus: 'DataGroup&List',
//     enableResetAccount: true,
//     enableSignUp: false,
//     hideProject: true,
//     hideAddEvent: true,
//     redirectUrl: '/',
//     maxFileSizeInBytes: 200000000,
//     maxRequestSizeInBytes: 200000000,
//   },
//   session: {
//     rights: ["Module_Common", "Module_Config", "Module_Soc", "Module_Account", "Module_Dashboard"],
//     name: 'ryan',
//     account: 'ryanchen',
//     accountId: 'DPIR-01dea080-396b-4210-a63d-a1e7beb05c7b',
//     syncAD: false,
//     departmentName: null,
//     departmentId: 'a6bfca79-6b31-48bb-af56-a1871e775979',
//     route: 'a6bfca79-6b31-48bb-af56-a1871e775979',
//     titleName: null,
//     titleId: 'RD',
//     roles: ["SOC Executor", "SOC Supervisor", "SOC單位設備承辦人", "SOC單位設備資安長", "SOC Analyzer", "SOC CISO", "Default Admin Privilege"],
//   }
// };