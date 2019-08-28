import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom'

import Promise from 'bluebird'
import $ from 'jquery'
import i18n from 'i18next'
import Moment from 'moment'

import loglevel from 'loglevel'
import logger from 'loglevel-prefix-persist/client'

import {HocAlertController as Alert} from './components/alert/index'
import {HocDashboardMaps as DashboardMaps} from './components/dashboard/maps'
import {HocDashboardStats as DashboardStats} from './components/dashboard/statistics'
import {HocEmailReport as EmailReport} from './components/configuration/honeynet/email-report'
import {HocEmployeeRecord as EmployeeRecord} from './components/configuration/honeynet/employee-record'
import {HocEndpoint as Endpoint} from './components/events/endpoint/index'
import {HocHeader as Header} from './header'
import {HocHoneynet as Honeypot} from './components/configuration/honeynet/host'
import {HocIP as IP} from './components/configuration/topology/ip'
import Login from './login'
import {HocManage as Manage} from './components/configuration/agent/manage'
import {HocMapNetwork as MapNetwork} from './components/configuration/topology/map'
import {HocNetflowController as Netflow} from './components/events/netflow/index'
import {HocNetworkTopology as Owner} from './components/configuration/topology/owner'
import {HocStatus as ServiceStatus} from './components/configuration/service/status'
import {HocSyslogController as Syslog} from './components/events/syslog/index'
import {HocSyslog as SyslogConfig} from './components/configuration/syslog/syslog'
import UserAccounts from './components/configuration/user/accounts/index'
import UserPrivileges from './components/configuration/user/privileges/index'

import 'font-gorilla/css/font-gorilla.css'
import 'purecss/build/pure-min.css'
import 'react-chart/build/css/react-chart.css'
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

const HeaderComp = () => (
	<Header
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		productName={productName}
		companyName={companyName}
		session={session} />
)

const DashboardStatsComp = () => (
	<DashboardStats
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		language={cfg.lng}
		locale={cfg.lng}
		session={session} />
)

const DashboardMapsComp = () => (
	<DashboardMaps
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		language={cfg.lng}
		locale={cfg.lng}
		session={session} />
)

const AlertComp = () => (
	<Alert
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		language={cfg.lng}
		locale={cfg.lng}
		searchFields={appcfg.searchFields}
		session={session} />
)

const NetflowComp = () => (
	<Netflow
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		language={cfg.lng}
		locale={cfg.lng}
		searchFields={appcfg.searchFields}
		session={session} />
)

const SyslogComp = () => (
	<Syslog
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		language={cfg.lng}
		locale={cfg.lng}
		searchFields={appcfg.searchFields}
		session={session} />
)

const EndpointComp = () => (
	<Endpoint
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		language={cfg.lng}
		locale={cfg.lng}
		session={session} />
)

const Config = () => {
  let sessionRights = {};

  _.forEach(session.rights, val => {
    sessionRights[val] = true;
  })

  if (sessionRights.Module_FlowAnalysis_Agent_Manage) {
		return Agent();
	} else if (sessionRights.Module_Honeynet_Manage) {
		return HoneynetHost();
	} else if (sessionRights.Module_NetworkTopology_Manage) {
		return 	NetworkTopologyOwner();
	} else if (sessionRights.Module_Syslog_Manage) {
		return 	Syslogs();
	} else if (sessionRights.Module_Account_Manage) {
		return 	userAccounts();
	}
}

const Agent = () => (
	<Manage
		page='agent'
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		locale={cfg.lng}
		session={session} />
)

const Threats = () => (
	<Manage
		page='threats'
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		locale={cfg.lng}
		session={session} />
)

const HoneynetHost = () => (
	<Honeypot
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		locale={cfg.lng}
		session={session} />
)

const HoneynetEmailReport = () => (
	<EmailReport
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		locale={cfg.lng}
		session={session} />
)

const HoneynetEmployeeRecord = () => (
	<EmployeeRecord
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		language={cfg.lng}
		locale={cfg.lng}
		session={session} />
)

const NetworkTopologyOwner = () => (
	<Owner
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		locale={cfg.lng}
		session={session} />
)

const NetworkTopologyIP = () => (
	<IP
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		locale={cfg.lng}
		session={session} />
)

const NetworkTopologyMap = () => (
	<MapNetwork
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		locale={cfg.lng}
		session={session} />
)

const Syslogs = () => (
	<SyslogConfig
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		locale={cfg.lng}
		session={session} />
)

const userAccounts = () => (
	<UserAccounts
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		locale={cfg.lng}
		session={session} />
)

const userPrivileges = () => (
	<UserPrivileges
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		locale={cfg.lng}
		session={session} />
)

const serviceStatus = () => (
	<ServiceStatus
		baseUrl={cfg.apiPrefix}
		contextRoot={cfg.contextRoot}
		locale={cfg.lng}
		session={session} />
)

const Main = () => (
	<main className='main'>
		<Switch>
			<Route exact path='/ChewbaccaWeb' component={DashboardStatsComp} />
			<Route exact path='/ChewbaccaWeb/dashboard/statistics' component={DashboardStatsComp} />
			<Route exact path='/ChewbaccaWeb/dashboard/maps' component={DashboardMapsComp} />
			<Route exact path='/ChewbaccaWeb/alert' component={AlertComp} />
			<Route exact path='/ChewbaccaWeb/events/netflow' component={NetflowComp} />
			<Route exact path='/ChewbaccaWeb/events/syslog' component={SyslogComp} />
			<Route exact path='/ChewbaccaWeb/events/endpoint' component={EndpointComp} />
			<Route exact path='/ChewbaccaWeb/honeynet/employee-record' component={HoneynetEmployeeRecord} />
			<Route exact path='/ChewbaccaWeb/configuration' component={Config} />
			<Route exact path='/ChewbaccaWeb/configuration/agent' component={Agent} />
			<Route exact path='/ChewbaccaWeb/configuration/threats' component={Threats} />
			<Route exact path='/ChewbaccaWeb/configuration/honeynet/host' component={HoneynetHost} />
			<Route exact path='/ChewbaccaWeb/configuration/honeynet/email-report' component={HoneynetEmailReport} />
			<Route exact path='/ChewbaccaWeb/configuration/topology/owner' component={NetworkTopologyOwner} />
			<Route exact path='/ChewbaccaWeb/configuration/topology/ip' component={NetworkTopologyIP} />
			<Route exact path='/ChewbaccaWeb/configuration/topology/map' component={NetworkTopologyMap} />
			<Route exact path='/ChewbaccaWeb/configuration/syslog' component={Syslogs} />
			<Route exact path='/ChewbaccaWeb/configuration/user/account' component={userAccounts} />
			<Route exact path='/ChewbaccaWeb/configuration/user/privileges' component={userPrivileges} />
			<Route exact path='/ChewbaccaWeb/configuration/service-status' component={serviceStatus} />
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