import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom'

import Promise from 'bluebird'
import $ from 'jquery'
import i18n from 'i18next'
import Moment from 'moment'

import {HocAlertController as Alert} from './components/alert/index'
import {HocDashboardMaps as DashboardMaps} from './components/dashboard/maps'
import {HocDashboardStats as DashboardStats} from './components/dashboard/statistics'
import {HocEdge as EdgeManagement} from './components/configuration/edge/edge'
import {HocEndpoint as Endpoint} from './components/events/endpoint/index'
import {HocHeader as Header} from './header'
import logger from 'loglevel-prefix-persist/client'
import Login from './login'
import loglevel from 'loglevel'
import {HocNetflowController as Netflow} from './components/events/netflow/index'
import {HocNetworkInventory as NetworkInventory} from './components/configuration/topology/inventory'
import {HocNetworkMap as NetworkMap} from './components/configuration/topology/map'
import {HocNetworkOwner as NetworkOwner} from './components/configuration/topology/owner'
import {HocNotifications as NotificationSettings} from './components/configuration/notifications'
import {HocStatus as ServiceStatus} from './components/configuration/service/status'
import {HocSyslogController as Syslog} from './components/events/syslog/index'
import {HocSyslog as SyslogConfig} from './components/configuration/syslog/syslog'
import {HocThreatIntelligence as ThreatIntelligence} from './components/configuration/edge/threat'
import UserAccounts from './components/configuration/user/accounts/index'
import UserPrivileges from './components/configuration/user/privileges/index'

import 'font-gorilla/css/font-gorilla.css'
import 'purecss/build/pure-min.css'
import 'react-chart/build/css/react-chart.css'
import 'react-gis/build/css/react-gis.css'
import 'react-la/build/css/react-la.css'

const initialState = JSON.parse(document.getElementById('initial-state').innerHTML);
const cfg = initialState.envCfg;
const appcfg = initialState.appCfg;
const year = Moment().year();
const companyName = initialState.companyName;
const productName = initialState.productName;
const session = initialState.session;
const log = logger(cfg.env, loglevel, cfg.log);
const footerText = `Powered by ${companyName}. Copyright © ${companyName}. ${year} All Rights Reserved. ${cfg.version} For the best experience, use the latest version of Google Chrome`;
let sessionRights = {};

_.forEach(session.rights, val => {
  sessionRights[val] = true;
})

const HeaderComp = () => (
  <Header
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    productName={productName}
    companyName={companyName}
    session={session}
    sessionRights={sessionRights} />
)

const DashboardStatsComp = () => (
  <DashboardStats
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session}
    sessionRights={sessionRights} />
)

const DashboardMapsComp = () => (
  <DashboardMaps
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session}
    sessionRights={sessionRights} />
)

const AlertComp = () => (
  <Alert
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    searchFields={appcfg.searchFields}
    session={session}
    sessionRights={sessionRights} />
)

const NetflowComp = () => (
  <Netflow
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    searchFields={appcfg.searchFields}
    session={session}
    sessionRights={sessionRights} />
)

const SyslogComp = () => (
  <Syslog
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    searchFields={appcfg.searchFields}
    session={session}
    sessionRights={sessionRights} />
)

const EndpointComp = () => (
  <Endpoint
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session} />
)

const Notifications = () => (
  <NotificationSettings
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session}
    sessionRights={sessionRights} />
)

const Edge = () => (
  <EdgeManagement
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session}
    sessionRights={sessionRights} />
)

const Threat = () => (
  <ThreatIntelligence
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session}
    sessionRights={sessionRights} />
)

const NetworkTopologyInventory = () => (
  <NetworkInventory
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session}
    sessionRights={sessionRights} />
)

const NetworkTopologyOwner = () => (
  <NetworkOwner
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session}
    sessionRights={sessionRights} />
)

const NetworkTopologyMap = () => (
  <NetworkMap
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session}
    sessionRights={sessionRights} />
)

const Syslogs = () => (
  <SyslogConfig
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session}
    sessionRights={sessionRights} />
)

const userAccounts = () => (
  <UserAccounts
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session}
    sessionRights={sessionRights} />
)

const userPrivileges = () => (
  <UserPrivileges
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session}
    sessionRights={sessionRights} />
)

const serviceStatus = () => (
  <ServiceStatus
    baseUrl={cfg.apiPrefix}
    contextRoot={cfg.contextRoot}
    language={cfg.lng}
    locale={cfg.lng}
    session={session}
    sessionRights={sessionRights} />
)

const Main = () => (
  <main className='main'>
    <Switch>
      <Route exact path='/SCP' component={DashboardStatsComp} />
      <Route exact path='/SCP/dashboard/statistics' component={DashboardStatsComp} />
      <Route exact path='/SCP/dashboard/maps' component={DashboardMapsComp} />
      <Route exact path='/SCP/alerts' component={AlertComp} />
      <Route exact path='/SCP/events/netflow' component={NetflowComp} />
      <Route exact path='/SCP/events/syslog' component={SyslogComp} />
      <Route exact path='/SCP/events/endpoint' component={EndpointComp} />
      <Route exact path='/SCP/configuration/notifications' component={Notifications} />
      <Route exact path='/SCP/configuration/edge/edge' component={Edge} />
      <Route exact path='/SCP/configuration/edge/threat' component={Threat} />
      <Route exact path='/SCP/configuration/topology/inventory' component={NetworkTopologyInventory} />
      <Route exact path='/SCP/configuration/topology/owner' component={NetworkTopologyOwner} />
      <Route exact path='/SCP/configuration/topology/map' component={NetworkTopologyMap} />
      <Route exact path='/SCP/configuration/syslog' component={Syslogs} />
      <Route exact path='/SCP/configuration/user/account' component={userAccounts} />
      <Route exact path='/SCP/configuration/user/privileges' component={userPrivileges} />
      <Route exact path='/SCP/configuration/service-status' component={serviceStatus} />
    </Switch>
  </main>
)

const App = () => {
  return (
    !session.accountId ? 
      <div>
        <Login
          baseUrl={cfg.apiPrefix}
          contextRoot={cfg.contextRoot}
          locale={['zh', 'en']}
          productName={productName} />
        <footer className='footer login'>{footerText}</footer>
      </div>
    :
      <div>
        <HeaderComp />
        <Main />
        <footer className='footer'>{footerText}</footer>
      </div>
  )
}

function start() {
  //const store = createStore(initialState)
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

  Promise.resolve($.get(url))
    .then(data => {
      if (customLocale) {
        return data.rt;
      } else {
        return data;
      }
    })
    .catch(xhr => {
      log.error(xhr)
      return null;
    })
    .then(resources => {
      i18n.init({
        lng,
        fallbackLng: lng,
        resources: {[lng]:resources}
      }, err => {
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

start();