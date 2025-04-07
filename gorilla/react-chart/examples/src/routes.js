import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import { Route, Link } from 'react-router'

import Charts from './charts'
import Table from './table'
//import Heatmap from './heatmap'
import Dashboard from './dashboard'


const MENU = {
    charts: {component:Charts, title:'Charts'},
    table: {component:Table, title:'Table'},
   // heatmap: {component:Heatmap, title:'Heatmap'},
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
                <ul id='g-menu'>
                    {
                        _.map(MENU, ({title, component}, tag)=><Link key={tag} activeClassName='current' to={{pathname:tag}}>{title}</Link>)
                    }
                    <li>
                        <a href='/docs' target='_blank'>API Documentation</a>
                    </li>
                </ul>
            </div>
            <div>
                {
                    this.props.children
                }
            </div>
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