import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import { Route, Link } from 'react-router'

import Basic from './basic'
import Advanced from './advanced'
import FloorMap from './floormap'
import Timeline from './timeline'


const MENU = {
    basic: {component:Basic, title:'Basic'},
    advanced: {component:Advanced, title:'Advanced'},
    floormap: {component:FloorMap, title:'Floor Map'},
    timeline: {component:Timeline, title:'Timeline'}
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
