import React from 'react'
import _ from 'lodash'
import { Route, Link } from 'react-router'
import PropTypes from 'prop-types';
import qs from 'query-string'

import DropDownList from 'core/components/dropdown'

import Form from './form'
import AdvancedForm from './form-advanced'
import Table from './table'
import List from './list'
import Tabs from './tabs'
import Modal from './modal'
import Tiles from './tiles'
import Hierarchy from './hierarchy'
import CssDemo from './css'


const MENU = {
    form: {component:Form, title:'Basic Form'},
    advancedForm: {component:AdvancedForm, title:'Advanced Form'},
    table: {component:Table, title:'Table & PageNav & Search'},
    list: {component:List, title:'List & PageNav'},
    tabs: {component:Tabs, title:'Tabs'},
    hierarchy: {component:Hierarchy, title:'Hierarchy'},
    tiles: {component:Tiles, title:'Tiles'},
    modal: {component:Modal, title:'Modal & Friends'},
    cssDemo: {component:CssDemo, title:'CSS'}
}

const NoMatch = () => <div>Page Not Found!</div>

class Examples extends React.Component {
    static propTypes = {
        children: PropTypes.node
    };

    handleThemeChange = (theme) => {
        window.location = `${window.location.pathname}?theme=${theme}`
    };

    render() {
        const {theme:currentTheme} = qs.parse(window.location.search)
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
                <div className='c-flex aic jcfe c-margin'>
                    <label>Select Theme </label>
                    <DropDownList
                        onClick={this.handleThemeChange}
                        list={_.map(['dark', 'purple', 'green'], theme=>({value:theme, text:theme}))}
                        required
                        defaultValue={currentTheme || 'dark'}
                        onChange={this.handleThemeChange} />
                </div>
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