import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import Promise from 'bluebird'
import cx from 'classnames'
import moment from 'moment'


import Serp from './serp'
import AdvancedSearch from './advanced-search'
import {default as DtList, getDtIdsByLabels, LABEL_TYPES} from './dt-list'
import Input from 'react-ui/build/src/components/input'
import DateRange from 'react-ui/build/src/components/date-range'
import SearchForm from 'react-ui/build/src/components/form'

import localize from '../../hoc/locale-provider'
import i18n from 'i18next'
import {es as esLoader} from '../../loader'
import Progress from "react-ui/build/src/components/progress";
import {fulltextSearch} from "../../utils/data-helper";

const gt = global.vbdaI18n.getFixedT(null, 'vbda')
const lt = global.vbdaI18n.getFixedT(null, 'search')

let log = require('loglevel').getLogger('vbda/components/search')


class Search extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        lng: PropTypes.string,
        cfg: PropTypes.shape({
            ds: PropTypes.objectOf(PropTypes.object),
            dt: PropTypes.objectOf(PropTypes.shape({
                searches: PropTypes.arrayOf(PropTypes.string)
            })),
            searches: PropTypes.objectOf(PropTypes.object)
        }).isRequired,
        defaultSelectedLabelTypes: PropTypes.arrayOf(PropTypes.string),
        defaultSearch: PropTypes.object,
        afterSearch: PropTypes.func,
        onCreateEvent: PropTypes.func,
        onUpdateEvent: PropTypes.func
    };

    constructor(props) {
        super(props);
        const {defaultSearch, defaultSelectedLabelTypes, cfg:{dt}} = props
        const time = {
            from: moment("20000101").format('YYYY-MM-DD HH:mm'),
            to: moment().format('YYYY-MM-DD HH:mm')
        }
        const selectedDtIds = getDtIdsByLabels(dt, _.isEmpty(defaultSelectedLabelTypes) ? LABEL_TYPES : defaultSelectedLabelTypes)
        const currentDtId = !_.isEmpty(defaultSearch) ? _.first(selectedDtIds) : null
        const filterForm = {time, ...defaultSearch}

        this.state = {
            cfg: {},
            query: _.cloneDeep(filterForm),
            selectedDtIds,
            currentDtId,
            currentSearchId: currentDtId ? dt[currentDtId].fulltext_search : null,
            currentEvent: null,
            selectedEvents: {},
            errors: null,
            showAdvanceSearch: false,
            filterForm,
            dtsEventCount: {},
            eventsCache: {},
            info: null
        };
    }

    componentDidMount() {
        const {defaultSearch} = this.props
        if (!_.isEmpty(defaultSearch)) {
            this.onFullTextSearchDatabase()
        }
    }

    doSearch = (query) => {
        this.setState({query})
    };

    handleSearchChange = (currentSearchId) => {
        this.setState({currentSearchId})
    };

    handleSelect = (selectedEvents) => {
        log.info('select Events', selectedEvents)
        this.setState({selectedEvents})
    };

    handleEventClick = (currentEvent, eventsCache, total, nowPage) => {
        const {cfg:{dt}, onCurrentEventChange} = this.props
        onCurrentEventChange({currentEvent, eventsCache: {eventsCache, total, nowPage}})
        this.setState({currentEvent, eventsCache: {eventsCache, total, nowPage}})
    };

    handleDtSelectionChange = (selectedDtIds) => {
        this.setState({selectedDtIds})
    };

    handleCurrentDtChange = (currentDtId = null) => {
        const {cfg:{dt}, onCurrentDtIdChange} = this.props
        onCurrentDtIdChange({currentDtId})
        this.setState({
            currentDtId,
            currentSearchId: currentDtId ? dt[currentDtId].fulltext_search : null
        })
    };

    renderAdvanceSearch = () => {
        const {lng, cfg} = this.props
        const {currentDtId, currentSearchId} = this.state

        return <AdvancedSearch
            lng={lng}
            cfg={cfg}
            dtId={currentDtId}
            currentSearchId={currentSearchId}
            onSearch={this.doSearch}
            onSearchChange={this.handleSearchChange} />
    };

    renderSerp = () => {
        const {lng, cfg, afterSearch, onDeleteEvent, eventsCache={}} = this.props
        const {filterForm, currentDtId, currentSearchId, query, info} = this.state

        return <Serp
            ref={ref => {
                this.serp = ref
            }}
            info={info}
            lng={lng}
            searchId={currentSearchId}
            dtId={currentDtId}
            query={query}
            // setQuery={this.setQuery}
            cfg={_.pick(cfg, ['searches', 'dt', 'renders'])}
            onSelect={this.handleSelect}
            onClick={(event, eventsCache, total, nowPage) => this.handleEventClick(event, eventsCache, total, nowPage)}
            onDeleteEvent={(event) => {
                onDeleteEvent(event, ()=>{
                    this.serp.loadData()
                })
            }}
            onEventEditorOpen={(event) => {
                this.handleEventEditorOpen(event)
            }}
            afterLoad={afterSearch.bind(null, {params:filterForm, database:currentDtId}, false)}
            eventsCache={eventsCache}
        />
    };

    handleEventEditorOpen = (event = {}) => {
        this.eventEditor.open(event)
    };

    onFullTextSearchDatabase = () => {
        const {filterForm} = this.state

        let hasError = false

        Progress.startSpin()

        this.getDtHasEvent()
            .then(dtsEventCount => {
                if (!_.isEmpty(dtsEventCount)) {
                    // let currentDtId = null
                    // _.forEach(dtsEventCount, (count, key) => {
                    //     if (currentDtId === null) {
                    //         if (count > 0) {
                    //             currentDtId = key
                    //             return false;
                    //         }
                    //     }
                    // })
                    // if (currentDtId)
                    //     this.setState({
                    //         currentDtId,
                    //         currentSearchId: dts[currentDtId].fulltext_search,
                    //         query: filterForm,
                    //         dtsEventCount
                    //     })
                    let noData = true
                    _.forEach(dtsEventCount, (count) => {
                        if (count > 0) {
                            noData = false
                            return false
                        }
                    })
                    if (noData)
                        this.setState({
                            query: filterForm,
                            dtsEventCount,
                            info: lt('txt-search-no-match-result')
                        })
                    else
                        this.setState({
                            query: filterForm,
                            dtsEventCount,
                            info: null
                        })
                }
                else
                    this.setState({
                        dtsEventCount,
                        info: null
                    })
            })
            .finally(() => {
                Progress.done()
            })
    };

    setQuery = (query) => {
      this.setState({query})
    };

    // toAdvanceSearch() {
    //     const {filterForm} = this.state
    //     log.info('to advance search with', filterForm)
    //     this.getDtHasEvent()
    //         .then(dtsEventCount => {
    //             this.setState({
    //                 // selectedDtIds: dtIdsWithEvent,
    //                 // showAdvanceSearch: true
    //                 dtsEventCount
    //             })
    //             if (!_.isEmpty(dtsEventCount)) {
    //                 let currentDtId = Object.keys(dtsEventCount)[0]
    //                 this.setState({
    //                     currentDtId,
    //                     currentSearchId: dt[currentDtId].searches[0],
    //                     query: {}
    //                 })
    //             }
    //
    //         })
    // },
    getDtHasEvent = () => {
        const {cfg: {dt: dts, searches}} = this.props
        const {filterForm, selectedDtIds} = this.state
        let dtsEventCount = {}
        // let queryString = ''
        // let originalQueryString = filterForm.query
        // if (originalQueryString && originalQueryString !== '') {
        //     queryString = esLoader.fulltextQueryParse(originalQueryString)
        // }
        // else
        //     queryString = originalQueryString

        let fields = {
            query: filterForm.query,
            time: {
                from: moment(filterForm.time.from).utc().format('YYYY-MM-DDTHH:mm:ss.000') + 'Z',
                to: moment(filterForm.time.to).utc().format('YYYY-MM-DDTHH:mm:ss.999') + 'Z'
            }
        }
        return Promise.all(_.map(selectedDtIds, (dtId) => {
            return fulltextSearch({dtId, dtCfgs: dts, searches, fields})
                .then(res => {
                    dtsEventCount[dtId] = res.total
                    return null
                })
                .catch(err => {
                    dtsEventCount[dtId] = err
                    return null
                })
            // const dtCfg = dts[dtId]
            // const searchConfig = searches [dtCfg.fulltext_search]
            // switch (searchConfig.query_type) {
            //     case 'base_service':
            //     default:
            //         let fulltextTemplate = searchConfig.template
            //         return esLoader.find({
            //             ds: dtCfg.ds,
            //             dt: dtId,
            //             start: fields.time.from,
            //             end: fields.time.to,
            //             fields,
            //             template: fulltextTemplate,
            //             size: 0
            //         })
            //             .then(data => {
            //                 dtsEventCount[dtId] = data.hits.total
            //                 return null
            //             })
            //             .catch(err => {
            //                 dtsEventCount[dtId] = err
            //                 return null
            //             })
            //     case 'json_request':
            //         const {url, body} = searchConfig
            //         const query = syntaxParse(body, fields)
            //         return ah.one({
            //             url: url,
            //             type: 'POST',
            //             data: JSON.stringify(query),
            //             contentType: 'application/json'
            //         })
            //             .then(data => {
            //                 dtsEventCount[dtId] = data.total
            //                 return null
            //             })
            //             .catch(err => {
            //                 dtsEventCount[dtId] = err
            //                 return null
            //             })
            // }
        }, []))
            .then(() => {
                return dtsEventCount
            })
            .catch(err => {
                log.error(err)
            })
    };

    backToSearch = () => {
        this.setState({showAdvanceSearch:false})
    };

    //region Event handle
    renderEventInfo = () => {
        const {cfg: {dt}, cfg, className, id} = this.props
        const {currentDtId, currentEvent} = this.state
        log.info('current event', currentEvent)
        if (!currentDtId)
            return null
        const currentDt = dt[currentDtId]
        const EventDetail = currentDt.handler.detail
        // const EventEditor = currentDt.handler.editor

        if (!EventDetail) {
            return <div className='c-error'>{currentDtId} does not exist in detail cfg</div>
        }
        return <div id={id} className={cx('c-vbda-search c-fullscreen c-flex fdc', className)}>
            <SimpleHeader title={'test'} />
            <div className='c-toolbar c-flex aic fixed'>
                <div className='c-link c-flex aic' onClick={() => this.setState({currentEvent: null})}>
                    <i className='fg fg-arrow-left' title={lt('txt-back-to-search')}/>
                    <span>{lt('txt-back-to-search')}</span>
                </div>
                <div className='end actions'>
                    <button className='standard img fg fg-printer' title={gt('tt-print')} onClick={this.handleClickPrint}/>
                    {/*{*/}
                    {/*EventEditor.displayName !== 'defaultEditor' || //plugin可以直接使用*/}
                    {/*_.get(currentDt, "editors.updateFields", null) ? //使用default editor 須設定config*/}
                    {/*<i className='c-link fg fg-path-pen end' title={lt('tt-edit')} onClick={*/}
                    {/*this.handleEventEditorOpen.bind(null, _.cloneDeep(currentEvent))*/}
                    {/*}/>*/}
                    {/*:*/}
                    {/*null*/}
                    {/*}*/}
                </div>
            </div>
            <EventDetail event={currentEvent}
                         dtCfg={dt[currentDtId]}
                         lng={i18n.language}
            />
            {/*{this.renderInnerEditor()}*/}
        </div>
    };

    renderInnerEditor = () => {
        const {cfg: {dt}, onCreateEvent, onUpdateEvent, session} = this.props
        const {currentDtId} = this.state
        if (!currentDtId)
            return null
        let currentDt = dt[currentDtId]
        const EventEditor = currentDt.handler.editor

        if (!EventEditor) {
            // return <div className='c-error'>{currentDtId} does not exist in editors cfg</div>
            log.info('no editor')
            return <div className='c-error'>{null}</div>
        }
        return <EventEditor
            _ref={ref => {
                this.eventEditor = ref
            }}
            lng={i18n.language}
            currentDt={currentDt}
            session={session}
            onCreate={(event) => {
                onCreateEvent(dt[currentDtId].ds, currentDtId, event,()=>{
                    this.serp.loadData()
                })
            }}
            onUpdate={(event) => {
                onUpdateEvent(event,()=>{
                    this.serp.loadData()
                })
            }}/>
    };

    //endregion

    handleFilterFormChange = (filterForm) => {
        this.setState({filterForm})
    };

    handleClickPrint = () => {
        window.print()
    };

    renderToolBar = () => {
        const {cfg} = this.props
        const {onAddEvents, onAddAllEvents, onDownload} = this.props
        const {currentSearchId, currentDtId, selectedEvents, query, dtsEventCount} = this.state
        let searchConfig = {}
        if(currentDtId){
            searchConfig = cfg.searches[cfg.dt[currentDtId].fulltext_search]
        }
        return <div className='c-toolbar c-flex aic fixed'>
            <div className="end">
                {
                    currentDtId ?
                        <div className='c-flex actions'>
                            <button className='standard'
                                disabled={_.size(selectedEvents) <= 0}
                                onClick={onAddEvents.bind(null, selectedEvents, cfg.searches[currentSearchId], currentDtId, cfg.dt[currentDtId].ds)}>
                                {lt('btn-add-intel')}
                            </button>
                            <button className='standard'
                                disabled={dtsEventCount[currentDtId]<=0 || dtsEventCount[currentDtId]>10000}
                                onClick={()=>{
                                    onAddAllEvents(query, cfg.searches[currentSearchId], currentDtId, cfg.dt[currentDtId].ds)
                                }}>
                                {lt('btn-add-all-intel')}
                            </button>
                            <button className='img standard fg fg-data-download' onClick={onDownload.bind(null, currentDtId)}/>
                            {
                                (cfg.dt[currentDtId].handler.editor && cfg.dt[currentDtId].handler.editor.displayName)//暫時先以此做為客製化依據，未來應該要拿掉
                                || _.has(cfg.dt[currentDtId], "editors.addFields") ? //使用default editor 須設定config
                                    <i className='c-link fg fg-add' title={lt('tt-create')} onClick={() => this.handleEventEditorOpen()}/>
                                    :
                                    null
                            }
                        </div>
                        :
                        null
                }
            </div>
        </div>
    };

    render() {
        const {id, className, defaultSelectedLabelTypes, cfg} = this.props
        const {errors, dtsEventCount} = this.state

        //serp need
        const {currentEvent} = this.state

        //dtlist need
        const {showAdvanceSearch, selectedDtIds, filterForm, currentDtId} = this.state
        const {lng} = this.props

        if (!cfg || _.isEmpty(cfg)) {
            return <div>{gt('txt-loading')}</div>
        }
        else if (errors) {
            return <div className='c-error'>{errors}</div>
        }

        // if (currentEvent) {
        //     return this.renderEventInfo()
        // }
        // else
            return <div id={id} className={cx('c-vbda-search c-flex fdc', className)}>
                {this.renderToolBar()}
            <div className='grow c-flex c-split vertical c-margin'>
                {/*<TabView id=''*/}
                         {/*className="oldie c-box"*/}
                         {/*menu={{*/}
                             {/*search: {title: lt('btn-search')},*/}
                             {/*advanceSearch: {title: lt('btn-advanceSearch')}*/}
                         {/*}}*/}
                         {/*current={showAdvanceSearch ? 'advanceSearch' : 'search'}*/}
                         {/*onChange={(val) => {*/}
                             {/*this.setState({showAdvanceSearch: !showAdvanceSearch})*/}
                         {/*}}>*/}
                    {/*{*/}
                        {/*showAdvanceSearch ?*/}
                            {/*<div className='c-box'>*/}
                                {/*<div className="content">*/}
                                    {/*<DtList*/}
                                        {/*useCheckbox={false}*/}
                                        {/*lng={lng}*/}
                                        {/*selectedDtIds={selectedDtIds}*/}
                                        {/*dtsEventCount={dtsEventCount}*/}
                                        {/*currentDtId={currentDtId}*/}
                                        {/*cfg={_.pick(cfg, ['dt', 'ds'])}*/}
                                        {/*onCurrentDtChange={this.handleCurrentDtChange}*/}
                                        {/*onDtSelectionChange={this.handleDtSelectionChange}/>*/}
                                {/*</div>*/}
                                {/*<div className="content">*/}
                                    {/*{this.renderAdvanceSearch()}*/}
                                {/*</div>*/}
                            {/*</div>*/}
                            {/*:*/}
                            {/*<div className='c-box'>*/}
                                {/*<div className="content">*/}
                                    {/*<DtList*/}
                                        {/*useCheckbox={true}*/}
                                        {/*lng={lng}*/}
                                        {/*selectedDtIds={selectedDtIds}*/}
                                        {/*dtsEventCount={dtsEventCount}*/}
                                        {/*currentDtId={currentDtId}*/}
                                        {/*cfg={_.pick(cfg, ['dt', 'ds'])}*/}
                                        {/*onCurrentDtChange={this.handleCurrentDtChange}*/}
                                        {/*onDtSelectionChange={this.handleDtSelectionChange}/>*/}
                                {/*</div>*/}
                                {/*<header>*/}
                                    {/*{lt('hdr-search')}*/}
                                {/*</header>*/}
                                {/*<div className="content filter-form">*/}
                                    {/*<SearchForm*/}
                                        {/*id={id}*/}
                                        {/*formClassName='c-form'*/}
                                        {/*onChange={this.handleFilterFormChange}*/}
                                        {/*fields={{*/}
                                            {/*query: {label: lt('form-fulltext'), editor: Input},*/}
                                            {/*time: {*/}
                                                {/*label: lt('form-event-time'),*/}
                                                {/*editor: DateRange,*/}
                                                {/*props: {*/}
                                                {/*}*/}
                                            {/*},*/}
                                        {/*}}*/}
                                        {/*value={filterForm}*/}
                                    {/*/>*/}
                                {/*</div>*/}
                                {/*<footer>*/}
                                    {/*<button onClick={this.onFullTextSearchDatabase}>{lt('btn-search')}</button>*/}
                                {/*</footer>*/}
                            {/*</div>*/}
                    {/*}*/}
                {/*</TabView>*/}
                <div className='c-box fixed search'>
                    <header>
                        {lt('hdr-search')}
                    </header>
                    <div className="content">
                        <DtList
                            useCheckbox={true}
                            lng={lng}
                            defaultSelectedLabelTypes={defaultSelectedLabelTypes}
                            selectedDtIds={selectedDtIds}
                            dtsEventCount={dtsEventCount}
                            currentDtId={currentDtId}
                            cfg={_.pick(cfg, ['dt', 'ds'])}
                            onCurrentDtChange={this.handleCurrentDtChange}
                            onDtSelectionChange={this.handleDtSelectionChange}/>
                    </div>
                    <div className="content filter-form fixed">
                        <SearchForm
                            id={id}
                            formClassName='c-form'
                            onChange={this.handleFilterFormChange}
                            fields={{
                                query: {label: lt('form-fulltext'), editor: Input},
                                time: {
                                    label: lt('form-event-time'),
                                    editor: DateRange,
                                    props: {
                                        enableTime: true
                                    }
                                },
                            }}
                            value={filterForm}
                        />
                    </div>
                    <footer>
                        <button onClick={this.onFullTextSearchDatabase}>{lt('btn-search')}</button>
                    </footer>
                </div>
                {this.renderSerp()}
            </div>
            {this.renderInnerEditor()}
        </div>
    }
}

export default localize(Search)
