import React from 'react'

const initialState = JSON.parse(document.getElementById('initial-state').innerHTML);
const cfg = initialState.envCfg;
const session = initialState.session;
let sessionRights = {};

_.forEach(session.rights, val => {
  sessionRights[val] = true;
})

export const baseData = {
  baseUrl: cfg.apiPrefix,
  contextRoot: cfg.contextRoot,
  language: cfg.lng,
  locale: cfg.lng,
  session,
  sessionRights: sessionRights
};

export const BaseDataContext = React.createContext(
  baseData
);