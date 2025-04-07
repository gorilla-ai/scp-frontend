import _ from 'lodash'
import { createStore, combineReducers } from 'redux'

import session from './session'
import envCfg from './env-cfg'
import appCfg from './app-cfg'
import componentCache from './component-cache'

export let store = null

const reducers = combineReducers({
    session,
    envCfg,
    appCfg,
    componentCache
})

export function create(state) {
    store = createStore(reducers, state)
    return store
}

export function select(key) {
    return store && _.get(store.getState(), key)
}

export function getSession() {
    return store.getState().session
}