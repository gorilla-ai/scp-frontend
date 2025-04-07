import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import im from 'object-path-immutable'
import Promise from 'bluebird'

import widgetLoader from '../loaders/widget'
import ME from './hoc'

const log = require('loglevel').getLogger('hoc')

const STATUS = {
    INIT: 'initializing',
    LOAD_CONFIG: 'load-config',
    LOAD_STORE_DATA: 'loading-store-data',
    ERROR: 'error',
    DONE: 'done'
}

class HOC extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            info: null,
            status: STATUS.INIT,
            widgetConfigCache: {}
        }
    }

    forceRefresh() {
        this.initial(this.props)
    }

    componentDidMount() {
        this.initial(this.props)
    }

    componentWillUpdate(nextProps) {
        if (this.state.status !== STATUS.INIT && this.state.status !== STATUS.LOAD_STORE_DATA)
            if ((!_.isEqual(_.pick(nextProps, ['type', '$source', "$id"]), _.pick(this.props, ['type', '$source', "$id"])))) {//type or any source or id change
                this.state.status = STATUS.INIT
                this.initial(nextProps)
            }
            const orginRestConfig = _.omit(this.props, ['type', '$source', "$id"])
            const nextRestConfig = _.omit(nextProps, ['type', '$source', "$id"])
            if (!_.isEqual(orginRestConfig, nextRestConfig)){//if other props change
                if(_.isEqual(nextProps.$appendConfig, this.props.$appendConfig)){
                    const newStoreCfg = {...nextProps.storeCfg, ...parseOldConfigToStoreConfig(nextProps.config)}
                    if (_.has(nextProps, 'config'))
                        this.state.config = nextProps.config
                    if (!_.isEqual(this.state.storeCfg, newStoreCfg)) {
                        this.state.status = STATUS.LOAD_STORE_DATA
                        this.state.storeCfg = newStoreCfg
                        this.loadStoreData(newStoreCfg)
                    } else{
                        const {$store, config, storeCfg} = this.state
                        _.forEach($store, (storeData, storeId) => {
                            const targetPaths = storeCfg[storeId].targetPaths;
                            targetPaths.forEach(targetPath=>{
                                this.state.config = im.set(config, targetPath, storeData)
                            })
                        })
                    }
                }
                else{
                    //TODO append do not reload widget
                    this.initial(nextProps)
                }
            }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.status === STATUS.LOAD_STORE_DATA) {
            this.loadStoreData(this.state.storeCfg)
        }
    }

    initial(props) {
        log.info(`initial widget`, props)
        this.loadRemoteWidgetConfig(props)
            .then(widgetConfig => {
                const widget = widgetLoader.loadWidgetSync(widgetConfig.type)
                const lng = widgetLoader.getWidgetLocales();
                //append config
                if (props.$appendConfig) {
                    log.info("widgetConfig: ", _.cloneDeep(widgetConfig))
                    _.forEach(props.$appendConfig, (val, key) => {
                        _.set(widgetConfig, key, val)
                    })
                    log.info("$appendConfig: ", props.$appendConfig)
                }
                if (_.has(widgetConfig, 'locales')) {
                  _.forEach(_.get(widgetConfig, ['locales', lng], {}), (value, key) => {
                    _.set(widgetConfig.config, key, value)
                  })
                }
                const config = widgetConfig.config
                const storeCfg = {...widgetConfig.storeCfg, ...parseOldConfigToStoreConfig(config)}
                try {
                    this.setState({
                        widget,
                        config,
                        storeCfg,
                        info: STATUS.LOAD_STORE_DATA,
                        status: STATUS.LOAD_STORE_DATA,
                        error: false
                    })
                } catch (err) {
                    log.error("onRenderError: ", err)
                    this.onRenderError(err)
                    throw err
                }
            })
            .catch(err => {
                log.error(err)
                this.setState({info: err.message, error: true, status: STATUS.ERROR})
            })
    }

    loadRemoteWidgetConfig(props) {//handle $source or $id
        const {$source, $id} = props
        if ($id) {
            return widgetLoader.loadConfigById($id)
                .then(remoteConfig => {
                    console.log(remoteConfig)
                    if (props.config) {// might come from dashboard or...?
                        remoteConfig.config = {...remoteConfig.config, ...props.config}
                    }
                    this.setState({id: $id})
                    return remoteConfig
                })
        }
        else if ($source) {
            return widgetLoader.loadWidgetConfigByUrl($source)
                .then(remoteConfig => {
                    if (props.config) {// might come from dashboard or...?
                        remoteConfig.config = {...remoteConfig.config, ...props.config}
                    }
                    this.setState({id: $source})
                    return remoteConfig
                })
        }
        else {
            return new Promise(resolve => {
                this.setState({id: 'hardCode'})
                resolve(_.cloneDeep(props))
            })
        }
    }

    onRenderError(e) {
        const {onRenderError} = this.props
        log.error('error while render', e)
        if(onRenderError)
            onRenderError(e)
    }


    renderInner() {
        const {widget: Widget, id} = this.state
        let config = _.cloneDeep(this.state.config)
        const props = {...config, HOC}
        return <Widget id={'widget-' + id} {...props} />
    }

    loadStoreData(storeCfg, oldStoreCfg = {}) {
        const requestList = {}//only reload different store
        _.forEach(storeCfg, (config, storeId) => {
            if (!_.isEqual(config, oldStoreCfg[storeId]))
                requestList[storeId] = config
        })

        if (_.isEmpty(requestList)) {//no need load
            this.setState({status: STATUS.DONE})
        }

        log.info('Load store data BEGIN')
        const process = []
        _.forEach(requestList, (config, storeId) => {
            process.push(widgetLoader.loadDataWithQueryConfig(config)
                .then(data => {
                    return {key: storeId, data}
                })
                .catch((error) => {
                    throw {message: `Store [${storeId}] load data failed.`, error}
                }))
        })
        if(process.length > 0){
            Promise.all(process)
                .then(data => {
                    const store = _.chain(data).mapKeys('key').mapValues(val => {
                        return val.data
                    }).value()
                    const $store = {...this.state.$store, ...store}
                    let {config} = this.state
                    _.forEach($store, (storeData, storeId) => {
                        const targetPaths = storeCfg[storeId].targetPaths;
                        targetPaths.forEach(targetPath=>{
                            config = im.set(config, targetPath, storeData)
                        })
                    })
                    this.setState({config, $store, status: STATUS.DONE})
                    log.info('Load store data END', $store)
                }).catch((error) => {
                    log.error(error)
                    const {message: detail = ''} = error
                    this.setState({info: `ERROR`, status: STATUS.ERROR})
                })
        }
    }

    render() {
        const {info, status} = this.state
        let {id} = this.state
        if (this.props.id) {
            id = this.props.id;
        }

        switch (status) {
            case STATUS.INIT:
            case STATUS.LOAD_CONFIG:
            case STATUS.LOAD_STORE_DATA:
                return <div className='c-center'>
                    <i className='fg fg-loading-2 fg-spin'/>
                </div>
            case STATUS.ERROR:
            default:
                return <div className={'c-error c-center'}>{info}</div>
            case STATUS.DONE:
                return <div id={id} className='hoc-item'>{this.renderInner()}</div>//TODO survey why div need
            // return this.renderInner()
        }
    }
}

export default HOC

HOC.propTypes = {
  $id: PropTypes.string,
  $source: PropTypes.string,
  config: PropTypes.object,
  configSource: PropTypes.object,
  data: PropTypes.any,
  dataSource: PropTypes.any,
  forceReload: PropTypes.any,
  id: PropTypes.string,
  onRenderError: PropTypes.func,
  type: PropTypes.string
}


/**
 * Cause some old config may have Source config like dataSource etc.
 *
 */
function parseOldConfigToStoreConfig(config) {
    let storeCfg = {}
    _.forEach(config, (oldConfig, key) => {
        if (!hasSourceEnd(key))
            return
        const {query, selectKey, isMulti} = oldConfig
        const originKey = key.substring(0, key.lastIndexOf('Source'));
        storeCfg[key] = {
            type: "request",
            query, selectKey, isMulti, targetPaths: [originKey]
        }
    })
    return storeCfg
}

function hasSourceEnd(key) {
    const index = key.lastIndexOf("Source");
    if (index === -1)
        return false
    const x = key.length;
    return (x - 6) === index
}
