import React from 'react'
import _ from 'lodash'

const initialState = JSON.parse(document.getElementById('initial-state').innerHTML);
const cfg = initialState.envCfg;
const session = initialState.session;
const mapUrl = initialState.mapUrl;
let sessionRights = {};

if (session) {
  _.forEach(session.rights, val => {
    sessionRights[val] = true;
  })
}

export const baseData = {
  baseUrl: cfg.apiPrefix,
  contextRoot: cfg.contextRoot,
  language: cfg.lng,
  locale: cfg.lng,
  session,
  sessionRights,
  mapUrl
};

export const BaseDataContext = React.createContext(
  baseData
);