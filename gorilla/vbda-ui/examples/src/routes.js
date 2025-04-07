import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import { Route, Link } from 'react-router'

import Search from './search'
import Dashboard from './dashboard'


const MENU = {
    search: {component:Search, title:'Search'},
    dashboard: {component:Dashboard, title:'Dashboard'}
}

const NoMatch = () => <div>Page Not Found!</div>

class Examples extends React.Component {
    static propTypes = {
        children: PropTypes.node
    };

    render() {
        return <div id='g-app'>
            <div id='g-header'>
                <ul id='g-menu' className='c-nav'>
                    {
                        _.map(MENU, ({title, component}, tag)=><Link key={tag} activeClassName='current' to={{pathname:tag}}>{title}</Link>)
                    }
                    <a href='/docs' target='_blank'>API Documentation</a>
                </ul>
            </div>
            {
                this.props.children
            }
        </div>
    }
}

const Routes = (
    <Route path='/' component={Examples}>
        {
            _.map(MENU, ({component}, tag)=><Route key={tag} path={tag} component={component} />)
        }
        <Route path='*' component={NoMatch} />
    </Route>)

export default Routes