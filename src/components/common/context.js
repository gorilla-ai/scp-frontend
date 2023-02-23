import React from 'react'
import _ from 'lodash'

let initialState = null;
let allData = {
  baseUrl: 'https:\//172.18.0.119/SCP',
  contextRoot: '',
  language: 'zh',
  locale: 'zh',
  session: {
    rights: ["Module_Common", "Module_Config", "Module_Soc", "Module_Account", "Module_Dashboard"],
    name: 'ryan',
    account: 'ryanchen',
    accountId: 'DPIR-01dea080-396b-4210-a63d-a1e7beb05c7b',
    syncAD: false,
    departmentName: null,
    departmentId: 'a6bfca79-6b31-48bb-af56-a1871e775979',
    route: 'a6bfca79-6b31-48bb-af56-a1871e775979',
    titleName: null,
    titleId: 'RD',
    roles: ["SOC Executor", "SOC Supervisor", "SOC單位設備承辦人", "SOC單位設備資安長", "SOC Analyzer", "SOC CISO", "Default Admin Privilege"],
  },
  mapUrl: 'https://mt0.google.com/vt/lyrs=m&hl=en-US&x={x}&y={y}&z={z}'
};
let sessionRights = {};

if (document.getElementById('initial-state') != null) {
  initialState = JSON.parse(document.getElementById('initial-state').innerHTML);
}

if (initialState) {
  const cfg = initialState.envCfg;
  const session = initialState.session;
  const mapUrl = initialState.mapUrl;

  if (session) {
    _.forEach(session.rights, val => {
      sessionRights[val] = true;
    })
  }

  allData = {
    baseUrl: cfg.apiPrefix,
    contextRoot: cfg.contextRoot,
    language: cfg.lng,
    locale: cfg.lng,
    session,
    sessionRights,
    mapUrl
  };
} else {
  _.forEach(allData.session.rights, val => {
    sessionRights[val] = true;
  })

  allData.sessionRights = sessionRights;
}

export const baseData = {
  ...allData
};

export const BaseDataContext = React.createContext(
  allData
);