import React from 'react'
// import cx from 'classnames'
import _ from 'lodash'
import im from 'object-path-immutable'
import Dashboard from 'react-chart/build/src/components/dashboard'
import Pie from 'react-chart/build/src/components/pie'

import ReactGridLayout, {WidthProvider} from 'react-grid-layout'

let log = require('loglevel').getLogger('chart/components/tes')

class test extends React.Component {
    constructor(props) {
        super(props)
        this.initial()
        this.state = {info: 'initializing'}
    }


    componentDidUpdate(prevProps) {
        // log.info(this)
        // log.info(`test componentDidUpdate`)
    }

    initial() {
        log.info(`initial test layout`)
        const {widgets} = this.props
        _.mapValues(widgets, ({widgetConfig, eventListeners}, widgetId) => {
            const eventListenerFunctions = _.chain(eventListeners)
                .mapValues((eventListenerConfig) => {
                    const {target} = eventListenerConfig
                    const eventListenerFunction = (..._arguments) => {
                        // if (_.isString(data) ? data === '' : _.isEmpty(data)) {//clear and cause the hoc dont get wrong data
                        //     const state = {}
                        //     _.forEach(target, target => {
                        //         _.set(state, target.substring(0, target.indexOf('.')),undefined)
                        //     })
                        //     this.setState(state)
                        //     return
                        // }
                        const targetState = {}
                        _.forEach(target, (paths, targetWidget) => {
                            _.forEach(paths, (argumentPath, widgetPath) => {
                                const value = _.get(_arguments, argumentPath, undefined)
                                if (_.isString(value) ? value === '' : _.isEmpty(value)){
                                    if(value || !value)
                                         _.set(targetState, targetPath, value) 
                                    else
                                        _.set(targetState, targetWidget + '.' + widgetPath, undefined)
                                } //clear and cause the hoc dont get wrong data//TODO WHYYYY?
                                else
                                    _.set(targetState, targetWidget + '.' + widgetPath, value)
                            })
                        })
                        log.info(targetState)
                        // const selfState = {[widgetId]:{data}}
                        this.setState({...targetState})
                    }
                    return eventListenerFunction
                })
                .mapKeys((eventListenerConfig, eventListenerConfigName) => {//create an _listener for hoc
                    return eventListenerConfigName
                })
                .value()
            widgetConfig.config = {...widgetConfig.config, ...eventListenerFunctions}
            log.info(widgetConfig)
            return widgetConfig
        })
    }

    render() {
        const {widgets, layoutCfg, HOC} = this.props
        return <Dashboard className="layout" layoutCfg={layoutCfg}>
            {_.map(widgets, ({widgetConfig, eventListenerConfig}, widgetId) => {
                let newWidgetConfig = _.cloneDeep(widgetConfig)
                if (_.has(this.state, widgetId)) {
                    const toMerge = this.state[widgetId]
                    newWidgetConfig = _.merge(newWidgetConfig, toMerge)
                    log.info(newWidgetConfig)//TODO 只取代data這件事跟取代整個widget這件事
                }
                return <div key={widgetId}><HOC {...newWidgetConfig}/></div>
            })}
        </Dashboard>
    }
}

export default test