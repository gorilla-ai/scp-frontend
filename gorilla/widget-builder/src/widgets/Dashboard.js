import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import im from 'object-path-immutable'
import {PopupDialog} from 'react-ui'
import i18n from 'i18next';
import RectUIDashboard from 'react-chart/build/src/components/dashboard'
const gt = i18n.getFixedT(null, 'app');

import ah from "react-ui/build/src/utils/ajax-helper";

let log = require('loglevel').getLogger('chart/components/tes')

const PROGRESS_STATUS = {
    LOADING: 'loading',
    ERROR: 'error',
    DONE: 'done',
    INIT: 'init',
}
const STORE_STATUS = {
    LOADING: 'loading',
    ERROR: 'error',
    DONE: 'done'
}

/**
 * Dashboard support add multiple widget inside.
 * @constructor
 * @description storeCfg:{
 *     [key] :{
 *          type: 'rawData'
 *          description: ''
 *          data: { }
 *          or
 *          type: 'request'
 *          description: ''
 *          query:{
 *              type:'GET/POST',
 *              url:''
 *              data:{ }
 *          }
 *          selectKey:'' *
 *          isMulti:'' *
 *          errorMessage: '' or {'statusName':'message'}
 *     }
 * }
 */
class Dashboard extends React.Component {
    constructor(props) {
        super(props)
        const widgets = this.initial()
        const layoutCfg = {...props.layoutCfg, layout: this.initialLayout()}
        const sqlConfig = { ...props.sqlConfig }
        const {widgetStatus = {}} = props
        this.state = {
            info: null,
            initialProgress: {
                "loadStoreData": {
                    text: 'load Store Data',
                    status: PROGRESS_STATUS.INIT
                },
            },
            widgets,
            layoutCfg,
            sqlConfig,
            $store: {},
            $widget: {},
            lastStoreCfg: _.cloneDeep(props.storeCfg),
            // initialled: false,
            widgetStatus: widgetStatus
        }
    }

    componentWillUpdate(nextProps, nextState) {
        const {widgetStatus} = nextProps
        if (!_.isEmpty(widgetStatus)) {
            _.forEach(widgetStatus, (status, id) => {
                this.state.widgetStatus[id] = status
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {lastStoreCfg} = prevState
        const {storeCfg} = this.props
        if (!_.isEqual(prevProps, this.props)//check if props change, state's storeCfg change will load store data its self
            && !_.isEqual(lastStoreCfg, storeCfg))
            this.loadStoreData(storeCfg, lastStoreCfg)
        // const {initialled, initialProgress} = this.state
        // if(!initialled &&
        //     _.find(initialProgress, (o) => o.status !== PROGRESS_STATUS.DONE) === undefined){
        //     this.setState({initialled: true})
        // }
    }

    componentDidMount() {
        const {storeCfg} = this.props
        this.loadStoreData(storeCfg)
    }

    loadStoreData(storeCfg, lastStoreCfg) { //TODO 只讀部分不要每次更新就全部都重新整理
        const requestList = {}
        const rawData = {}
        const storesStatus = {}
        _.forEach(storeCfg, (config, storeId) => {
            let status = STORE_STATUS.DONE;
            if(!lastStoreCfg //初始化不會有lastStoreCfg
                || !_.isEqual(config, lastStoreCfg[storeId])) {//若是之後的更新需要比較
                if (config.type === 'request') {
                    requestList[storeId] = config
                    status = STORE_STATUS.LOADING;
                }
                else
                    rawData[storeId] = config.data
            }
            storesStatus[storeId] = {
                status
            }
        })

        //TODO 確認會不會有還在loading又被trigger loadStoreData()的情況
        if (_.isEmpty(requestList)) {//no need load
            log.info('Dashboard no need to load store data')
            this.setState({$store: rawData, storesStatus, initialProgress: this.getUpdateProgress("loadStoreData", PROGRESS_STATUS.DONE)})
            return
        }
        else {
            log.info('Dashboard loading store data................')
            this.setState({$store: rawData, storesStatus, initialProgress: this.getUpdateProgress("loadStoreData", PROGRESS_STATUS.LOADING)})
        }

        const process = []
        _.forEach(requestList, (config, storeId) => {
            const {selectKey, query, errorMessage = 'Server connect failed.'} = config
            const type = _.upperCase(query.type)
            switch (type) {
                case 'GET':
                    break;
                default: //others
                    query.data = JSON.stringify(query.data)
                    query.contentType= 'application/json'
            }
            log.info(`load store[${storeId}] with`, query)
            process.push(ah.one(query, {showProgress: false, parseFail: failParser, eh: {getMsg: () => errorMessage}})
                .then(data => {
                    if (selectKey) {
                        data = _.get(data, selectKey)
                    }
                    log.info(`Store [${storeId}] loaded success.`, data)
                    return {key: storeId, data, error: false, message: ""}
                })
                .catch((errors) => {
                    // PopupDialog.alertId(
                    //     `store-${storeId}`,
                    //     {
                    //         title: 'Error',
                    //         display: <div className='c-error'>{errors.message}</div>,
                    //         confirmText: gt('btn-close')
                    //     }
                    // )
                    log.error(`Store[${storeId}] Error.`, errors)
                    return {key: storeId, error: true, message: errorMessage}
                }))
        })
        return Promise.all(process)
            .then(data => {
                const store = _.chain(data).mapKeys('key').mapValues(val => {
                    return val.data
                }).value()
                const storesStatus = _.chain(data).mapKeys('key').mapValues(val => {
                    const {error, message} = val;
                    return {
                        status: error?STORE_STATUS.ERROR:STORE_STATUS.DONE,
                        info: message
                    }
                }).value()
                log.info('dashboard load store data END', store)
                this.setState({$store:{...this.state.store, ...store}, initialProgress: this.getUpdateProgress("loadStoreData", PROGRESS_STATUS.DONE), storesStatus})
            }).catch(err => {
                log.error(err)
                this.setState({initialProgress: this.getUpdateProgress("loadStoreData", PROGRESS_STATUS.ERROR)})
            })
    }

    getUpdateProgress(key, status) {
        const {initialProgress} = this.state
        return im.set(initialProgress, [key, 'status'], status)
    }

    initial() {
        let widgets = _.cloneDeep(this.props.widgets)
        _.forEach(widgets, ({widgetConfig, eventListeners}, widgetId) => {
            const eventListenerFunctions = _.chain(eventListeners)
                .mapValues((eventListenerConfig) => {
                    const {target} = eventListenerConfig
                    const eventListenerFunction = (..._arguments) => {
                        let {lastStoreCfg} = this.state
                        const targetState = {}
                        _.forEach(target, (paths, argumentPath) => {
                            _.forEach(paths, (targetPath) => {
                                if(_.startsWith(targetPath, '$store')){//modify store
                                    targetPath = targetPath.replace(/^\$store./, '')
                                    let value = _.get(_arguments, argumentPath, undefined)
                                    if (_.isString(value) ? value === '' : _.isEmpty(value))
                                        value = undefined
                                    lastStoreCfg = im.set(lastStoreCfg, targetPath, value)
                                }
                                else{//directly to widget
                                    const value = _.get(_arguments, argumentPath, undefined)
                                    if (_.isString(value) ? value === '' : _.isEmpty(value)){//clear and cause the hoc dont get wrong data//TODO WHYYYY?
                                         if(value || !value)
                                             _.set(targetState, targetPath, value)
                                        else
                                             _.set(targetState, targetPath, undefined)
                                    }
                                    else
                                        _.set(targetState, targetPath, value)
                                }
                            })
                        })
                        log.info(targetState)
                        this.setState({$widget: targetState, lastStoreCfg},()=>{this.loadStoreData(lastStoreCfg)})
                    }
                    return eventListenerFunction
                })
                .mapKeys((eventListenerConfig, eventListenerConfigName) => {//create an _listener for hoc
                    return eventListenerConfigName
                })
                .value()
            // if(!widgetConfig.config)//for?
            //     widgetConfig.config = {}
            // widgetConfig.config = {...widgetConfig.config, ...eventListenerFunctions}
            _.forEach(eventListenerFunctions,(value,keyPath)=>{
                _.set(widgetConfig.config,keyPath, value)
            })
            log.info('dashboard:', widgetId, '-', widgetConfig)
            widgets[widgetId].widgetConfig = widgetConfig
        })
        log.info(`widgets initialled`, widgets)
        return widgets
    }

    initialLayout() {
        const {widgets} = this.props
        return _.map(widgets, ({layout}) => {
            return layout
        })
    }

    // renderHOC() {
    //     const {widgets} = this.props
    //     return _.map(widgets, ({layout}) => {
    //         return layout
    //     })
    // }

    renderProgress(initialProgress) {
        const {debug = false} = this.props
        if(!debug){
            _.forEach(initialProgress, ({text, status}, id) => {
                log.info(`[${id}]${text}: ${status}`)
            })
            return <div className='c-center'><i className='fg fg-loading-2 fg-spin' /></div>
        }
        return <div>
            {_.map(initialProgress, ({text, status}, id) => {
                return <div key={id} className="aligned c-form">
                    <div className="row"><label className="">{text}</label>
                        <div>{status}</div>
                    </div>
                </div>
            })}
        </div>
    }


    handleStatusChange(widgetId, status) {
        const {widgetStatus} = this.state
        widgetStatus[widgetId] = status
        this.setState({widgetStatus})
    }

    renderStoreStatus(storeStatus) {
        switch (storeStatus.status) {
            case STORE_STATUS.ERROR:
                return <div className='c-center'>
                    <div className='c-error c-flex jcc'>
                        {/*<i className='fg fg-alert-1' />*/}
                        {storeStatus.info}
                    </div>
                </div>;
            case STORE_STATUS.LOADING:
                return (<div className='c-center'>
                    {this.renderLoading()}
                </div>)

        }
    }

    renderLoading(){
        return <svg  version="1.0" width="38px" height="38px" viewBox="0 0 128 128">
            <g>
                <circle cx="16" cy="64" r="16" fill="#4A4A4A" fill-opacity="1"></circle>

                <circle cx="16" cy="64" r="14.344" fill="#4A4A4A" fill-opacity="1" transform="rotate(45 64 64)"></circle>

                <circle cx="16" cy="64" r="12.531" fill="#4A4A4A" fill-opacity="1" transform="rotate(90 64 64)"></circle>
                <circle cx="16" cy="64" r="10.75" fill="#4A4A4A" fill-opacity="1" transform="rotate(135 64 64)"></circle>
                <circle cx="16" cy="64" r="10.063" fill="#4A4A4A" fill-opacity="1" transform="rotate(180 64 64)"></circle>
                <circle cx="16" cy="64" r="8.063" fill="#4A4A4A" fill-opacity="1" transform="rotate(225 64 64)"></circle>
                <circle cx="16" cy="64" r="6.438" fill="#4A4A4A" fill-opacity="1" transform="rotate(270 64 64)"></circle>
                <circle cx="16" cy="64" r="5.375" fill="#4A4A4A" fill-opacity="1" transform="rotate(315 64 64)"></circle>
                <animateTransform attributeName="transform" type="rotate" values="0 64 64;315 64 64;270 64 64;225 64 64;180 64 64;135 64 64;90 64 64;45 64 64" calcMode="discrete" dur="720ms" repeatCount="indefinite">
                </animateTransform>
            </g>
        </svg>
    }

    render() {
        const {HOC, onLayoutChange = null} = this.props
        const {widgets, layoutCfg, sqlConfig, initialProgress, $store, $widget, initialled, widgetStatus, storesStatus=[]} = this.state
        // if (!initialled// once initialled wont enter again
        //     // &&_.find(initialProgress, (o) => o.status !== PROGRESS_STATUS.DONE) !== undefined
        // ) {
        //     return this.renderProgress(initialProgress)
        // }
        return <RectUIDashboard className="layout-hoc" layoutCfg={layoutCfg}
                                onLayoutChange={(layoutArray) => {
                                    if (typeof onLayoutChange === 'function') {
                                        const keys = Object.keys(widgets);
                                        onLayoutChange(
                                          layoutArray.map((layout, index) => {
                                                layout.id = keys[index];
                                                return layout;
                                            }
                                          )
                                        )
                                    }
                                }}
        >
            {_.map(widgets, ({widgetConfig, eventListenerConfig, boxTitle, storeRef, sqlMode}, widgetId) => {
                let newWidgetConfig = _.cloneDeep(widgetConfig)
                if (_.has($widget, widgetId)) {
                    const toMerge = $widget[widgetId]
                    newWidgetConfig = _.merge(newWidgetConfig, toMerge)
                    //log.info(newWidgetConfig)//TODO 只取代data這件事跟取代整個widget這件事
                }
                if (sqlMode) {
                    let server = ''
                    switch (sqlConfig.sqlServerType) {
                        case 'postgresql':
                            server = 'postgresql'
                            break
                        case 'mysql':
                            server = 'mysql'
                            break
                        case 'mssql':
                        default:
                            server = 'sqlserver'
                            break
                    }
                    const obj = {
                        connection: {
                            jdbcUrl: `jdbc:${server}://${sqlConfig.ip}:${sqlConfig.port}` + (sqlConfig.sqlServerType === 'postgresql' || sqlConfig.sqlServerType === 'mysql' ? `/${sqlConfig.databaseName}` : `;databaseName=${sqlConfig.databaseName}`),
                            username: sqlConfig.user,
                            password: sqlConfig.password,
                            sqlType: sqlConfig.sqlServerType
                        }
                    }
                    _.set(newWidgetConfig, 'config.widgetSQL', obj)
                }
                let storeStatus = null
                if (!_.isNil(storeRef)) {//if need store data
                    _.forEach(storeRef, (storePaths, targetPath) => {
                        let storeDataReferenceFound = false;
                        _.forEach(storePaths, (storePath) => {
                            if (_.get($store, storePath) !== undefined ) {
                                _.set(newWidgetConfig, targetPath, _.get($store, storePath))
                                // log.info(storePath,'=>',targetPath,$store)
                                storeDataReferenceFound = true;
                                return false//stop loop//找到有的就不再找其他store，忘記需求是什麼//TODO確認有沒有必要
                            }
                        })
                        if(!storeDataReferenceFound){
                            //TODO未來看看怎麼樣 目前先拿第一個的store當代表
                            const storeName = storePaths[0].split('.')[0];
                            if(storesStatus[storeName]){
                                if(storesStatus[storeName].status !== STORE_STATUS.DONE)
                                    storeStatus = storesStatus[storeName];
                                else{
                                    //TODO
                                }
                            }
                        }
                    })
                }
                // if (widgetStatus[widgetId] === STATUS.LOADING) {
                //     return <i className='fg fg-loading-2 fg-spin'/>
                // }
                return <div id={widgetId} key={widgetId} className={cx({'c-box': boxTitle}, 'dashboard-item')}>
                    {boxTitle && <header>{boxTitle}</header>}
                    {
                        _.get(widgetStatus, widgetId) === PROGRESS_STATUS.LOADING ?
                            <div className='content c-center'>
                                {this.renderLoading()}
                            </div>
                            : (storeStatus !== null ?
                                this.renderStoreStatus(storeStatus)
                                : <div className={cx({"content": boxTitle})}>
                                    <HOC {...newWidgetConfig}
                                        // onStatusChange={(status) => {
                                        //     this.handleStatusChange(widgetId, status)
                                        // }}
                                    />
                                </div>
                            )
                    }
                </div>
            })}
        </RectUIDashboard>
    }
}

export default Dashboard

function failParser(json, text, status) {
    if (json) {
        var code = _.get(json, 'code', status),
            message = _.get(json, 'message', 'Get remote data fail.')

        return {
            code,
            message,
        };
    }

    if (text) {
        return {
            message: text
        };
    }

    return {};
};

function getMsg(errors) {
    return errors.map(({code, message}) => `[${code}] ${message}`).join('<br/>');
};
