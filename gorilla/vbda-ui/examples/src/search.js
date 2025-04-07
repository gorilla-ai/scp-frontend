import React from 'react'
import _ from 'lodash'

import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import { Search as VbdaSearch } from 'vbda/components/vbda'
import VbdaEvent from 'vbda/components/event'
import VbdaAnalysis from 'vbda/components/analysis'
import {
    config as configLoader,
    es as esLoader,
    plugin as pluginLoader,
    eventHandler as eventHandlerLoader
} from 'vbda/loader'

//import plugins from './plugins'


let log = require('loglevel').getLogger('vbda-examples/search')

class VbdaSearchExample extends React.Component {
    state = {
        cfg: {},
        events: {}
    };

    componentDidMount() {
        esLoader.setupPrefix('http://192.168.10.216:4007/cibd')
        configLoader.setupPrefix('http://192.168.10.216:4009/config_service/configurations')
        configLoader.loadAll()
            .then(cfg=>{
                //cfg = pluginLoader.loadPlugins(cfg, plugins)
                cfg = eventHandlerLoader.loadEventHandler(cfg)
                log.info('config',cfg)
                this.setState({cfg})
            })
    }

    handleAddEvents = (newEvents) => {
        const {events} = this.state
        this.setState({events:{...events, ...newEvents}})
    };

    showEvents = () => {
        const {cfg, events} = this.state
        PopupDialog.alert({
            display: <VbdaEvent.List 
                cfg={cfg}
                events={events}/>
        })
    };

    showLa = () => {
        const {cfg, events} = this.state
        PopupDialog.alert({
            display:<VbdaAnalysis eventsCfg={cfg} events={events}/>
        })
    };

    render() {
        const {cfg, events} = this.state
        const hasEvents = _.size(events)<=0
        log.info('render',{events})
        return <div className='c-flex fdc'>
            <div className='c-toolbar fixed'>
                <button disabled={hasEvents} onClick={this.showEvents}>Event Bucket</button>
                <button disabled={hasEvents} onClick={this.showLa}>LA</button>
            </div>
            <div className='c-margin grow'>
                <VbdaSearch 
                    cfg={cfg}
                    lng='en'
                    onAddEvents={this.handleAddEvents} />
            </div>
        </div>
    }
}


export default VbdaSearchExample