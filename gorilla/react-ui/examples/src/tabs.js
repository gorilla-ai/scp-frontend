import React from 'react'
import _ from 'lodash'
import cx from 'classnames'

import {Tabs, List} from 'core/components'
import Form from 'core/components/form'

import createExample from './example-factory'

let Examples = {}

Examples.Tabs = class extends React.Component {
    state = {
        currentTab: 'directors',
        settings: {
            oldie: false
        }
    };

    handleTabChange = (newTab) => {
        this.setState({currentTab:newTab})
    };

    renderActors = () => {
        return 'actor list'
    };

    renderDirectors = () => {
        const directors = _(_.range(0, 100)).map(i=>`Director ${i}`).value() // 100 directors

        return <List
            id='directors'
            list={directors}
            itemClassName='aic'
            selection={{enabled:true, multiSelect:false}} />
    };

    renderTabContent = () => {
        const {currentTab} = this.state
        if (currentTab === 'actors') {
            return this.renderActors()
        }
        else { // 'directors'
            return this.renderDirectors()
        }
    };

    renderDemoSettings = () => {
        const {settings} = this.state
        return <Form
            className='demo-settings'
            fields={{
                oldie: {
                    label: 'Use Traditional Style Tab',
                    className: 'inline aic',
                    editor: 'Checkbox'
                }
            }}
            value={settings}
            onChange={newSettings=>{ this.setState({settings:newSettings}) }} />
    };

    render() {
        const {currentTab, settings:{oldie}} = this.state
        return <div>
            {this.renderDemoSettings()}
            <Tabs
                id='imdb'
                className={cx({oldie})}
                menu={{
                    actors: 'ACTORS',
                    directors: 'DIRECTORS',
                    tv: {title:'TV', disabled:true}
                }}
                current={currentTab}
                onChange={this.handleTabChange}>
                {
                    this.renderTabContent()
                }
            </Tabs>
        </div>
    }
}


export default class extends React.Component {
    render() {
        return <div id='example-tabs'>
            {
                _.map(Examples, (example, key)=>{
                    return React.createElement(createExample(example, key), {key})
                })
            }
        </div>
    }
}

