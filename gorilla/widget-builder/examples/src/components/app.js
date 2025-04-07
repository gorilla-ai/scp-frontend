import React from 'react'
import { connect } from 'react-redux'
import { Route, withRouter } from 'react-router-dom'
import i18n from 'i18next'
import Promise from 'bluebird'
import $ from 'jquery'

import Progress from 'core/components/progress'
import {create as createAuth, auth} from 'core/utils/auth-helper'
import eh from 'core/utils/error-helper'
import { MENU, PAGES } from 'app/consts/menu'
import { setSession } from 'app/redux/session'
import Demo from './demo'
import List from './list'
import Poc from './poc'


const log = require('loglevel').getLogger('app')

const t = i18n.getFixedT(null, 'app')
const et = i18n.getFixedT(null, 'errors')


// initialize global translator for input related validation error
eh.setupErrorTranslate(et)
// setup permission and pages
createAuth(MENU, PAGES)


const App = React.createClass({
    propTypes: {
        session: React.PropTypes.object,
        //appCfg: React.PropTypes.object,
        contextRoot: React.PropTypes.string,
        version: React.PropTypes.string,
        onSessionChange: React.PropTypes.func.isRequired,
        query: React.PropTypes.object,
        location: React.PropTypes.object
    },
    childContextTypes: {
        session: React.PropTypes.object,
        contextRoot: React.PropTypes.string,
        query: React.PropTypes.object
    },
    getInitialState() {
        return {
        }
    },
    getChildContext() {
        const {session, contextRoot, query} = this.props
        return {
            session,
            contextRoot,
            query
        }
    },
    changeUser(data) {
        this.props.onSessionChange(data)
    },
    logout() {
        Progress.startSpin()
        Promise.resolve($.post('/api/logout'))
            .finally(() => {
                Progress.done()
                document.location.reload()
            })
    },
    render() {
        const {session} = this.props

        log.info('render', {session})

        return <div id='g-app'>
            <Route exact path='/' component={List} />
            <Route exact path='/list/:mode' component={List} />
            <Route exact path='/demo' component={Demo} />
            <Route exact path='/poc' component={Poc} />
        </div>
    }
})


const mapStateToProps = (state) => {
    return {
        session: state.session,
        //appCfg: state.appCfg,
        query: {lng:state.envCfg.lng},
        contextRoot: state.envCfg.contextRoot,
        version: state.envCfg.version
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSessionChange: (session) => {
            dispatch(setSession(session))
        }
    }
}


export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(App))
