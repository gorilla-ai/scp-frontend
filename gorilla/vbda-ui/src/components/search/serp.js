import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import moment from "moment";
import createFragment from 'react-addons-create-fragment'
import cx from 'classnames'


import ah from 'react-ui/build/src/utils/ajax-helper'
import TabView from 'react-ui/build/src/components/tabs'
import ButtonGroup from 'react-ui/build/src/components/button-group'
import Table from '../visualization/table'
import Chart from '../visualization/chart'
import {es as esLoader} from '../../loader'
import parseEvents from '../../parser/es-hits'
import {fulltextSearch} from "vbda/utils/data-helper";

const gt = global.vbdaI18n.getFixedT(null, 'vbda')
const lt = global.vbdaI18n.getFixedT(null, 'search')

let log = require('loglevel').getLogger('vbda/components/search/serp')


const Serp = React.createClass({
    propTypes: {
        lng: PropTypes.string,
        dtId: PropTypes.string,
        searchId: PropTypes.string,
        query: PropTypes.object,
        cfg: PropTypes.shape({
            dt: PropTypes.objectOf(PropTypes.shape({
                display_name: PropTypes.string,
                renderSerp: PropTypes.arrayOf(PropTypes.string)
            })),
            renders: PropTypes.objectOf(PropTypes.shape({
                type: PropTypes.string, //React.PropTypes.oneOf(['table','custom']),
                vis: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.func
                ])
            }))
        }).isRequired,
        onSelect: PropTypes.func,
        onMouseOver: PropTypes.func,
        onClick: PropTypes.func,
        onDeleteEvent: PropTypes.func,
        onEventEditorOpen: PropTypes.func,
        afterLoad: PropTypes.func,
        eventsCache: PropTypes.object,
        useFullTextSearch: PropTypes.bool
    },
    getDefaultProps() {
        return {
            query: {}
        }
    },
    getInitialState() {
        const {dtId, eventsCache} = this.props
        if (dtId) {
            if (eventsCache)
                return {
                    selectedVis: _.first(this.getAllVis()),
                    error: false,
                    events: eventsCache.eventsCache,
                    total: eventsCache.total,
                    nowPage: eventsCache.nowPage,
                    info: gt('txt-loading')
                }
        }
        return {
            selectedVis: _.first(this.getAllVis()),
            events: [],
            nowPage: 1,
            total: 0,
            info: gt('txt-loading'),
            error: false
        }
    },
    componentDidMount() {
        const {dtId, eventsCache} = this.props
        if (dtId) {
            if (eventsCache)
                this.loadData(eventsCache.nowPage)
            else
                this.loadData()
        }
    },
    componentDidUpdate(prevProps, prevState) {
        const {dtId:prevDtId, query:prevQuery} = prevProps
        const {dtId, query, afterLoad} = this.props
        if (dtId !== prevDtId) {
            this.setState({
                selectedVis: _.first(this.getAllVis()),
                total: 0,
                events: [],
                nowPage: 1
            }, () => {
                this.loadData()
                afterLoad && afterLoad()
            })
        }
        else if (query !== prevQuery) { //若query有更動才進行讀取
            log.info('query', query)
            this.loadData()
            afterLoad && afterLoad()
        }
    },
    getAllVis() {
        const {cfg:{dt}, dtId} = this.props
        return dt && dt[dtId] ? dt[dtId].renderSerp : []
    },
    handleVisChange(selectedVis) {
        this.setState({selectedVis})
    },
    onSort(sortBy, sortDesc) {
        const {cfg: {dt}, dtId} = this.props
        const {nowPage} = this.state
        const {fields} = dt[dtId]
        if (_.get(fields, sortBy + '.type', null) === 'text(keyword)') {
            sortBy += '.keyword'
        }
        this.loadData(nowPage, sortBy, sortDesc)
    },
    loadData(nowPage, sortBy, sortDesc) {
        const {cfg: {dt, searches}, dtId, searchId, useFullTextSearch = true} = this.props
        const dtCfg = dt[dtId]
        let {query:originalQuery} = this.props
        if (!_.has(searches, searchId)) {
            return
        }

        if (nowPage === undefined){//資料庫切換
            this.setState({info: gt('txt-loading'), error:false})
            nowPage = 1
        }
        // let queryString = ''
        // let originalQueryString = originalQuery.query
        // if (originalQueryString && originalQueryString !== '') {
        //     queryString = esLoader.fulltextQueryParse(originalQueryString)
        // }
        // else
        //     queryString = originalQueryString
        if (!(originalQuery.query && originalQuery.query !== '')) {
            // queryString = '*'
            if(!sortBy){
                sortBy = '__insertTime'
                sortDesc = true
            }
        }
        let query = {
            query: originalQuery.query,
            time: {
                from: moment(originalQuery.time.from).utc().format('YYYY-MM-DDTHH:mm:ss.000') + 'Z',
                to: moment(originalQuery.time.to).utc().format('YYYY-MM-DDTHH:mm:ss.999') + 'Z'
            }
        }

        //處理時間範圍
        let timeStart = query.time.from
        let timeEnd = query.time.to

        let pageInfo = {}

        //region paginataion
        const {cfg: {renders}} = this.props
        const {selectedVis} = this.state
        const visCfg = renders[selectedVis]
        pageInfo = {
            size: visCfg.page_size ? parseInt(visCfg.page_size.value) : 20, pageFrom: nowPage - 1
        }
        if (sortBy !== undefined) {
            pageInfo.sortBy = sortBy
        }
        if (sortDesc !== undefined) {
            pageInfo.sortDesc = sortDesc
        }
        //endregion

        fulltextSearch({dtId, dtCfgs: dt, searches, fields: query, pageInfo})
            .then(res => {
                // log.info("loadData",parseEvents(data.hits.hits))
                // log.info("loadData",_.keyBy(parseEvents(data.hits.hits), '__s_uuid'))
                log.info('load data of ' + dtId, res)
                if (_.isEmpty(res.data))
                    this.setState({
                        events: [],
                        total: res.total,
                        info: gt('txt-no-data'),
                        nowPage
                    })
                else
                    this.setState({
                        // events: _.keyBy(parseEvents(data.hits.hits), '__s_uuid'), //TODO 目前key 用s_uuid，不確定未來有沒有統一格式
                        events: res.data,
                        total: res.total,
                        info: null,
                        nowPage
                    })
            })
            .catch(err => {
                log.error(err)
                let info = err.message
                // if ((/Result window is too large/).test(info))
                //     info = gt('txt-error-result-window-too-large')
                this.setState({
                    error: true,
                    info
                })
            })
        // esLoader.find({
        //     ds: dtCfg.ds,
        //     dt: dtId,
        //     start: timeStart,
        //     end: timeEnd,
        //     fields: query,
        //     template: searches[searchId].template,
        //     ...pageInfo
        //     // sort: dtCfg.representative_time ? dtCfg.representative_time : "__s_uuid"
        // })
        //     .then(data => {
        //         // log.info("loadData",parseEvents(data.hits.hits))
        //         // log.info("loadData",_.keyBy(parseEvents(data.hits.hits), '__s_uuid'))
        //         log.info('load data of ' + dtId, data)
        //         if(_.isEmpty(data.hits.hits))
        //             this.setState({
        //                 events: [],
        //                 total: data.hits.total,
        //                 info: gt('txt-no-data'),
        //                 nowPage
        //             })
        //         else
        //             this.setState({
        //                 // events: _.keyBy(parseEvents(data.hits.hits), '__s_uuid'), //TODO 目前key 用s_uuid，不確定未來有沒有統一格式
        //                 events: parseEvents(data.hits.hits),
        //                 total: data.hits.total,
        //                 info: null,
        //                 nowPage
        //             })
        //     })
        //     .catch(err => {
        //         log.error(err)
        //         let info = err.message
        //         // if ((/Result window is too large/).test(info))
        //         //     info = gt('txt-error-result-window-too-large')
        //         this.setState({
        //             error: true,
        //             info
        //         })
        //     })
    },
    renderInfo(text, error=false) {
        return <div className="c-box grow">
            <div className={cx("content c-center c-info", {'c-error':error})}>{text}</div>
        </div>
    },
    renderInner() {
        const {lng, onSelect, dtId, cfg: {renders, dt, searches}, onClick, onMouseOver, onDeleteEvent, onEventEditorOpen} = this.props
        const {selectedVis, events, total, nowPage} = this.state
        const dtCfg = dt[dtId]
        const searchConfig = searches [dtCfg.fulltext_search]

        const visCfg = renders[selectedVis]
        let Vis

        if (!visCfg) {
            return this.renderInfo(`${selectedVis} does not exist in renders cfg`, true)
        }

        switch (visCfg.type) {
            case 'plugin':
                if (!visCfg.filepath) {
                    return this.renderInfo(`Plugin filepath for '${selectedVis}' is not defined`, true)
                }
                Vis = require(`pluginsPath/${visCfg.filepath}`).default; break
            case 'table':
                Vis = Table; break
            case 'chart':
                Vis = Chart; break
            default:
                return this.renderInfo(`${visCfg.type} Vis Not Supported`, true)
        }
        let ifEdit =
            (dt[dtId].handler.editor && dt[dtId].handler.editor.displayName)//暫時先以此做為客製化依據，未來應該要拿掉
            || _.get(dt[dtId], "editors.updateFields", null) //使用default editor 須設定config
            // dt[dtId].handler.editor.displayName !== 'defaultEditor' || //plugin可以直接使用
            // _.get(dt[dtId], "editors.updateFields", null)//使用default editor 須設定config
        return <Vis
            id={dtId + '-' + selectedVis}
            lng={lng}
            cfg={{fields: visCfg.fields, dt: dt[dtId], page_size: visCfg.page_size ? visCfg.page_size : null}}
            events={events}
            rowIdField={searchConfig.unique_id}
            total={total}
            onSelect={onSelect}
            onClick={(event, page) => {
                onClick(event, events, total, page)
            }}
            onMouseOver={onMouseOver}
            onDelete={
                ifEdit ?
                    onDeleteEvent
                    :
                    null
            }
            onEdit={
                ifEdit ?
                    (event) => {
                        onEventEditorOpen(_.cloneDeep(event))
                    }
                    :
                    null
            }
            nowPage={nowPage}
            onReq={this.loadData}
            onSort={this.onSort}
        />
    },
    render() {
        const {dtId, cfg: {dt, searches}, searchId, info} = this.props
        const {selectedVis, info: stateInfo, error: stateError} = this.state


        if (info) {
            return this.renderInfo(info)
        }
        if (!dtId) {
            return this.renderInfo(lt('txt-select-database'))
        }
        if (!_.has(searches, searchId)) {
            return this.renderInfo('No matched searchId', true)
        }
        if (stateInfo) {
            return this.renderInfo(stateInfo, stateError)
        }

        const availableVisTypes = dt[dtId].renderSerp
        if (!availableVisTypes)
            return this.renderInfo(`availableVisTypes does not exist in ${dtId} renderSerp cfg`, true)

        if (availableVisTypes.length > 1) {
            return <ButtonGroup
                value={selectedVis}
                list={availableVisTypes.map(v=>({value:v, text:v}))}
                onChange={this.handleVisChange} />
            { this.renderInner() }
        }
        else {
            return this.renderInner()
        }
    }
})

export default Serp