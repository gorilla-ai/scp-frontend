import React from 'react'
import i18n from 'i18next'


import * as api from 'app/utils/api-helper'
import {HOC} from 'widget-builder'
const log = require('loglevel').getLogger('demo')

const t = i18n.getFixedT(null, 'demo')

class Demo extends React.Component {
    constructor(props) {
        super(props)
        this.loadData()
        this.state = {
            uiConfig: {}
        }

    }

    loadData() {
        api.getUIFrameworkConfig('api/demo/page/config')
            .then(data => {
                this.setState({uiConfig: data})
            })
            .catch(err => {
                this.setState({info: err.message, error: true})
            })
    }

    switchWidget(widget) {
        this.setState({nowWidget: widget})
    }

    render() {
        const {uiConfig, nowWidget} = this.state
        return <div id='g-demo' className='c-flex c-split vertical c-padding'>
            <div className='c-box fixed'>
                <header>清單</header>
                <div className='content c-flex fdc'>
                    {
                        _.map(uiConfig, (config, name) => {
                            return <button key={name} className='standard fg fg-chart-pie' title={name} onClick={this.switchWidget.bind(this, {id: name, ...config})}>
                                {name}
                            </button>
                        })
                    }
                </div>
            </div>
            <div className='c-flex fdc grow c-split horizontal inner'>
                <div className='c-box fixed'>
                    <header>測試區{nowWidget && ` - ${nowWidget.id}`}</header>
                    <div className='content'>
                        {nowWidget ? <HOC {...nowWidget}/> : null}
                    </div>
                </div>
            </div>
        </div>
    }
}

export default Demo