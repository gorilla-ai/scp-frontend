import React from 'react'
import {render} from 'react-dom'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'
import _ from 'lodash'

import createDarkTheme from './theme/dark'
import createDefaultTheme from './theme/default'

import Promise from 'bluebird'
import $ from 'jquery'
import i18n from 'i18next'
import Highcharts from 'highcharts'
import Moment from 'moment'

import AccountConfig from './components/configuration/account'
import AuditLog from './components/configuration/audit/audit-log'
import DashboardMaps from './components/dashboard/maps'
import DashboardOverview from './components/dashboard/overview'
import DashboardStats from './components/dashboard/statistics'
import EdgeManagement from './components/configuration/edge/edge'
import EsManagement from './components/configuration/es/es-manage'
import Header from './header'
import Host from './components/host/index'
import IncidentUnit from './components/soc/incident-unit'
import IncidentLog from './components/soc/incident-log'
import Incident from './components/soc/incident'
import IncidentISAC from './components/soc/incident-isac'
import IncidentSOC from './components/soc/incident-soc'
import IncidentRule from './components/soc/incident-ruleTemplate'
import IncidentFlow from './components/soc/incident-flow'
import IncidentSearch from "./components/soc/incident-search-list";
import logger from 'loglevel-prefix-persist/client'
import Login from './login'
import loglevel from 'loglevel'
import Netflow from './components/events/netflow/index'
import NetworkInventory from './components/configuration/topology/inventory'
import NetworkOwner from './components/configuration/topology/owner'
import NotificationSettings from './components/configuration/notifications'
import ProductInfo from './components/configuration/product/product-info'
import ServiceStatus from './components/configuration/service/status'
import SeverityTable from './components/configuration/edge/severity'
import Soar from './components/soar/index'
import StatisticsUIF from './components/dashboard/statisticsUIF'
import Syslog from './components/events/syslog/index'
import SyslogConfig from './components/configuration/syslog/syslog'
import SyslogPattern from './components/configuration/syslog/pattern'
import Threats from './components/threats/index'
import ThreatIntelligence from './components/configuration/threat/threat'
import UserAccounts from './components/configuration/user/accounts/index'
import UserPrivileges from './components/configuration/user/privileges/index'

import {BaseDataContext, baseData} from './components/common/context'
import {createInstance} from 'react-ui/build/src/utils/ajax-helper'
import {setupConfigService, setWidgetLocales} from 'widget-builder'

import 'font-gorilla/css/font-gorilla.css'
import 'purecss/build/pure-min.css'
import 'react-chart/build/css/react-chart.css'
import 'react-gis/build/css/react-gis.css'
import 'react-la/build/css/react-la.css'
import IncidentDeviceStep from "./components/soc/incident-device-with-step";
import IncidentManagement from "./components/soc/incident-manager";

const initialState = JSON.parse(document.getElementById('initial-state').innerHTML);
const cfg = initialState.envCfg;
const appcfg = initialState.appCfg;
const companyName = initialState.companyName;
const productName = initialState.productName;
const year = Moment().year();
const session = initialState.session;
const log = logger(cfg.env, loglevel, cfg.log);
const footerText = `Powered by ${companyName}. Copyright © ${companyName}. ${year} All Rights Reserved. ${cfg.version} For the best experience, use the latest version of Google Chrome`;
let accountTheme = '';

Highcharts.setOptions({
  colors: ['#069BDA', '#57C3D9', '#57D998', '#6CD957', '#C3D957', '#D99857', '#D9576C', '#D957C3', '#9857D9', '#576CD9', '#5798D9', '#57D9C3', '#57D96C', '#98D957', '#D9C357', '#D96C57', '#D95798', '#C357D9', '#6C57D9']
});

const HeaderComp = (props) => (
  <BaseDataContext.Provider value={baseData}>
    <Header
      companyName={companyName}
      productName={productName}
      themeName={props.themeName}
      setThemeName={props.setThemeName} />
  </BaseDataContext.Provider>
);

const DashboardOverviewComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <DashboardOverview />
  </BaseDataContext.Provider>
);

const StatisticsUIFComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <StatisticsUIF />
  </BaseDataContext.Provider>
);

const DashboardStatsComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <DashboardStats />
  </BaseDataContext.Provider>
);

const DashboardMapsComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <DashboardMaps />
  </BaseDataContext.Provider>
);

const HostComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <Host />
  </BaseDataContext.Provider>
);

const ThreatsComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <Threats
      searchFields={appcfg.searchFields} />
  </BaseDataContext.Provider>
);

const NetflowComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <Netflow
      searchFields={appcfg.searchFields} />
  </BaseDataContext.Provider>
);

const SoarComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <Soar />
  </BaseDataContext.Provider>
);

const SyslogComp = () => (
  <BaseDataContext.Provider value={baseData}>
    <Syslog
      searchFields={appcfg.searchFields} />
  </BaseDataContext.Provider>
);

const Notifications = () => (
  <BaseDataContext.Provider value={baseData}>
    <NotificationSettings />
  </BaseDataContext.Provider>
);

const Edge = () => (
  <BaseDataContext.Provider value={baseData}>
    <EdgeManagement />
  </BaseDataContext.Provider>
);

const Threat = () => (
  <BaseDataContext.Provider value={baseData}>
    <ThreatIntelligence />
  </BaseDataContext.Provider>
);

const Severity = () => (
  <BaseDataContext.Provider value={baseData}>
    <SeverityTable />
  </BaseDataContext.Provider>
);

const Es = () => (
  <BaseDataContext.Provider value={baseData}>
    <EsManagement />
  </BaseDataContext.Provider>
);

const NetworkTopologyInventory = () => (
  <BaseDataContext.Provider value={baseData}>
    <NetworkInventory />
  </BaseDataContext.Provider>
);

const NetworkTopologyOwner = () => (
  <BaseDataContext.Provider value={baseData}>
    <NetworkOwner />
  </BaseDataContext.Provider>
);

const syslogConfig = () => (
  <BaseDataContext.Provider value={baseData}>
    <SyslogConfig />
  </BaseDataContext.Provider>
);

const syslogPattern = () => (
  <BaseDataContext.Provider value={baseData}>
    <SyslogPattern />
  </BaseDataContext.Provider>
);

const userAccounts = () => (
  <BaseDataContext.Provider value={baseData}>
    <UserAccounts />
  </BaseDataContext.Provider>
);

const userPrivileges = () => (
  <BaseDataContext.Provider value={baseData}>
    <UserPrivileges />
  </BaseDataContext.Provider>
);

const Account = () => (
  <BaseDataContext.Provider value={baseData}>
    <AccountConfig />
  </BaseDataContext.Provider>
)

const Audit = () => (
  <BaseDataContext.Provider value={baseData}>
    <AuditLog />
  </BaseDataContext.Provider>
);

const serviceStatus = () => (
  <BaseDataContext.Provider value={baseData}>
    <ServiceStatus />
  </BaseDataContext.Provider>
);

const productInfo = () => (
  <BaseDataContext.Provider value={baseData}>
    <ProductInfo />
  </BaseDataContext.Provider>
);

const incidentDevice = () => (
  <BaseDataContext.Provider value={baseData}>
    <IncidentDeviceStep />
  </BaseDataContext.Provider>
);

const incident = () => (
  <BaseDataContext.Provider value={baseData}>
    <Incident />
  </BaseDataContext.Provider>
);

const incidentUnit = () => (
  <BaseDataContext.Provider value={baseData}>
    <IncidentUnit />
  </BaseDataContext.Provider>
);

const incidentLog = () => (
  <BaseDataContext.Provider value={baseData}>
    <IncidentLog />
  </BaseDataContext.Provider>
);

const incidentISAC = () => (
  <BaseDataContext.Provider value={baseData}>
    <IncidentISAC />
  </BaseDataContext.Provider>
);

const incidentSOC = () => (
  <BaseDataContext.Provider value={baseData}>
    <IncidentSOC />
  </BaseDataContext.Provider>
);

const incidentRule = () => (
  <BaseDataContext.Provider value={baseData}>
    <IncidentRule />
  </BaseDataContext.Provider>
);

const incidentFlow = () => (
  <BaseDataContext.Provider value={baseData}>
    <IncidentFlow />
  </BaseDataContext.Provider>
);

const incidentSearch = () => (
  <BaseDataContext.Provider value={baseData}>
    <IncidentSearch />
  </BaseDataContext.Provider>
);

const incidentManagement = () => (
  <BaseDataContext.Provider value={baseData}>
    <IncidentManagement />
  </BaseDataContext.Provider>
);

const Main = () => (
  <main className='main'>
    <Switch>
      <Route exact path='/SCP' component={DashboardOverviewComp} />
      <Route exact path='/SCP/dashboard/overview' component={DashboardOverviewComp} />
      <Route exact path='/SCP/dashboard/statisticsUIF' component={StatisticsUIFComp} />
      {/*<Route exact path='/SCP/dashboard/statistics' component={DashboardStatsComp} />*/}
      <Route exact path='/SCP/dashboard/maps' component={DashboardMapsComp} />
      <Route exact path='/SCP/host' component={HostComp} />
      <Route exact path='/SCP/threats' component={ThreatsComp} />
      <Route exact path='/SCP/events/syslog' component={SyslogComp} />
      <Route exact path='/SCP/events/netflow' component={NetflowComp} />
      <Route exact path='/SCP/soar' component={SoarComp} />
      <Route exact path='/SCP/configuration/notifications' component={Notifications} />
      <Route exact path='/SCP/configuration/threat' component={Threat} />
      <Route exact path='/SCP/configuration/edge/edge' component={Edge} />
      <Route exact path='/SCP/configuration/edge/severity' component={Severity} />
      <Route exact path='/SCP/configuration/es' component={Es} />
      <Route exact path='/SCP/configuration/topology/inventory' component={NetworkTopologyInventory} />
      <Route exact path='/SCP/configuration/topology/owner' component={NetworkTopologyOwner} />
      <Route exact path='/SCP/configuration/syslog/config' component={syslogConfig} />
      <Route exact path='/SCP/configuration/syslog/pattern' component={syslogPattern} />
      <Route exact path='/SCP/configuration/user/account' component={userAccounts} />
      <Route exact path='/SCP/configuration/user/privileges' component={userPrivileges} />
      <Route exact path='/SCP/account' component={Account} />
      <Route exact path='/SCP/configuration/audit' component={Audit} />
      <Route exact path='/SCP/configuration/service-status' component={serviceStatus} />
      <Route exact path='/SCP/configuration/product-info' component={productInfo} />
      <Route exact path='/SCP/soc/incident-device' component={incidentDevice}/>
      <Route exact path='/SCP/soc/incident-unit' component={incidentUnit}/>
      <Route exact path='/SCP/soc/incident-log' component={incidentLog}/>
      <Route exact path='/SCP/soc/incident' component={incident}/>
      <Route exact path='/SCP/soc/incident-ISAC' component={incidentISAC}/>
      <Route exact path='/SCP/soc/incident-SOC' component={incidentSOC}/>
      <Route exact path='/SCP/soc/incident-RuleTemplate' component={incidentRule}/>
      <Route exact path='/SCP/soc/incident-Flow' component={incidentFlow}/>
      <Route exact path='/SCP/soc/incident-search' component={incidentSearch}/>
      <Route exact path='/SCP/soc/incident-management' component={incidentManagement}/>
    </Switch>
  </main>
);

const createTheme = (themeName) => {
  switch (themeName) {
    case 'light':
      return createDefaultTheme();
    case 'dark':
      return createDarkTheme();
    default:
      return createDefaultTheme();
  }
};

const App = () => {
  const [themeName, setThemeName] = React.useState(accountTheme);

  if (session.accountId) {
    return (
      <ThemeProvider theme={createTheme(themeName)}>
        <HeaderComp
          themeName={themeName}
          setThemeName={setThemeName} />
        <Main />
        <footer className='footer'>{footerText}</footer>
      </ThemeProvider>
    )
  } else {
    return (
      <div>
        <Login
          baseUrl={cfg.apiPrefix}
          contextRoot={cfg.contextRoot}
          locale={['zh', 'en']}
          productName={productName} />
        <footer className='footer login'>{footerText}</footer>
      </div>
    )
  }
};

function getTheme() {
  const url = `${cfg.apiPrefix}${cfg.contextRoot}/api/account/theme?accountId=${session.accountId}`;

  Promise.resolve($.get(url))
    .then(data => {
      if (data.rt) {
        accountTheme = data.rt; //Set global theme variable
        document.documentElement.setAttribute('data-theme', data.rt);
      }
    })
    .catch(xhr => {
      log.error(xhr);
      return null;
    })
    .then(resources => {
      start();
    })
}

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
                global.apiTimer = setTimeout(getVersion, 1500000); //25 min.

                return resp;
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

function getVersion() {
  const url = `${cfg.apiPrefix}/api/version`;

  clearTimeout(global.apiTimer);
  global.apiTimer = setTimeout(getVersion, 1500000); //25 min.

  Promise.resolve($.get(url))
    .then(data => {
      return null;
    })
    .catch(xhr => {
      return null;
    })
    .then(resources => {
      return null;
    })
}

getTheme();