import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import { Route, Link } from 'react-router'

import Timebar from './timebar'


const MENU = {
    timebar: {component:Timebar, title:'Timebar'}
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
                    <li>
                        <a href='/docs/keylines/API Reference.html#formats_timebar' target='_blank'>KeyLines Documentation</a>
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