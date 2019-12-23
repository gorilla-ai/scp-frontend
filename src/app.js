import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom'

import Promise from 'bluebird'
import $ from 'jquery'
import i18n from 'i18next'
import Moment from 'moment'

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
import {HocThreatsController as Threats} from './components/threats/index'
import {HocThreatIntelligence as ThreatIntelligence} from './components/configuration/edge/threat'
import UserAccounts from './components/configuration/user/accounts/index'
import UserPrivileges from './components/configuration/user/privileges/index'

import {BaseDataContext, baseData} from './components/common/context'

import 'font-gorilla/css/font-gorilla.css'
import 'purecss/build/pure-min.css'
import 'react-chart/build/css/react-chart.css'
import 'react-gis/build/css/react-gis.css'
import 'react-la/build/css/react-la.css'

const initialState = JSON.parse(document.getElementById('initial-state').innerHTML);
const cfg = initialState.envCfg;
const appcfg = initialState.appCfg;
const companyName = initialState.companyName;
const productName = initialState.productName;
const year = Moment().year();
const session = initialState.session;
const log = logger(cfg.env, loglevel, cfg.log);
const footerText = `Powered by ${companyName}. Copyright © ${companyName}. ${year} All Rights Reserved. ${cfg.version} For the best experience, use the latest version of Google Chrome`;

const HeaderComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <Header
      companyName={companyName} />
  </BaseDataContext.Provider>
)

const DashboardStatsComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <DashboardStats />
  </BaseDataContext.Provider>
)

const DashboardMapsComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <DashboardMaps />
  </BaseDataContext.Provider>
)

const ThreatsComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <Threats
      searchFields={appcfg.searchFields} />
  </BaseDataContext.Provider>
)

const NetflowComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <Netflow
      searchFields={appcfg.searchFields} />
  </BaseDataContext.Provider>
)

const SyslogComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <Syslog
      searchFields={appcfg.searchFields} />
  </BaseDataContext.Provider>
)

const EndpointComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <Endpoint />
  </BaseDataContext.Provider>
)

const Notifications = () => (
  <BaseDataContext.Provider value={baseData}>
    <NotificationSettings />
  </BaseDataContext.Provider>
)

const Edge = () => (
  <BaseDataContext.Provider value={baseData}>
    <EdgeManagement />
  </BaseDataContext.Provider>
)

const Threat = () => (
  <BaseDataContext.Provider value={baseData}>
    <ThreatIntelligence />
  </BaseDataContext.Provider>
)

const NetworkTopologyInventory = () => (
  <BaseDataContext.Provider value={baseData}>
    <NetworkInventory />
  </BaseDataContext.Provider>
)

const NetworkTopologyOwner = () => (
  <BaseDataContext.Provider value={baseData}>
    <NetworkOwner />
  </BaseDataContext.Provider>
)

const NetworkTopologyMap = () => (
  <BaseDataContext.Provider value={baseData}>
    <NetworkMap />
  </BaseDataContext.Provider>
)

const Syslogs = () => (
  <BaseDataContext.Provider value={baseData}>
    <SyslogConfig />
  </BaseDataContext.Provider>
)

const userAccounts = () => (
  <BaseDataContext.Provider value={baseData}>
    <UserAccounts />
  </BaseDataContext.Provider>
)

const userPrivileges = () => (
  <BaseDataContext.Provider value={baseData}>
    <UserPrivileges />
  </BaseDataContext.Provider>
)

const serviceStatus = () => (
  <BaseDataContext.Provider value={baseData}>
    <ServiceStatus />
  </BaseDataContext.Provider>
)

const Main = () => (
  <main className='main'>
    <Switch>
      <Route exact path='/SCP' component={DashboardStatsComp} />
      <Route exact path='/SCP/dashboard/statistics' component={DashboardStatsComp} />
      <Route exact path='/SCP/dashboard/maps' component={DashboardMapsComp} />
      <Route exact path='/SCP/threats' component={ThreatsComp} />
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