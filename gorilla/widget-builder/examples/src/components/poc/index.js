import React from 'react'
import i18n from 'i18next'


import {default as ah} from 'core/utils/ajax-helper'
import * as api from 'app/utils/api-helper'
import {HOC} from 'widget-builder'
import Table from 'core/components/table'

const log = require('loglevel').getLogger('poc')

const t = i18n.getFixedT(null, 'poc')

class Index extends React.Component {
    constructor(props) {
        super(props)
        this.loadData()
        this.state = {
            uiConfig: {}
        }

    }

    loadData() {
        api.getUIFrameworkConfig('api/poc/config/all')
            .then(data => {
                this.setState({uiConfig: data})
            })
            .catch(err => {
                this.setState({info: err.message, error: true})
            })
    }

    renderCount() {
        const {count} = this.state
        if (!count) {
            return null
        }
        return <div className="c-flex fdc tac">
            <div>總共</div>
            <div style={{fontWeight: 'bold',fontSize: "80px"}}>{count}</div>
        </div>
    }

    renderAggsByCaseType() {
        const {aggsByCaseType, uiConfig} = this.state
        if (!aggsByCaseType) {
            return null
        }
        const aggsByCaseTypeWidgetConfig = {...uiConfig['aggsByCaseType']}
        _.set(aggsByCaseTypeWidgetConfig, "config.data", aggsByCaseType)
        return <div>
            <HOC {...aggsByCaseTypeWidgetConfig}/>
        </div>
    }

    renderAggsByOccurBranchCode() {
        const {aggsByOccurBranchCode, uiConfig} = this.state
        if (!aggsByOccurBranchCode) {
            return null
        }
        const aggsByOccurBranchCodeWidgetConfig = {...uiConfig['aggsByOccurBranchCode']}
        _.set(aggsByOccurBranchCodeWidgetConfig, "config.data", aggsByOccurBranchCode)
        return <div>
            <HOC {...aggsByOccurBranchCodeWidgetConfig}/>
        </div>
    }

    renderAggsBydate() {
        const {aggsBydate, uiConfig} = this.state
        if (!aggsBydate) {
            return null
        }
        const aggsBydateWidgetConfig = {...uiConfig['aggsBydate'], data: aggsBydate}
        _.set(aggsBydateWidgetConfig, "config.data", aggsBydate)
        return <div>
            <HOC {...aggsBydateWidgetConfig}/>
        </div>
    }

    renderTable() {
        const {table, uiConfig} = this.state
        if (!table) {
            return null
        }
        const data = _.sampleSize(_.map(table, data => {
            return data._source
        }), 10)
        const tableWidgetConfig = {...uiConfig['table']}
        _.set(tableWidgetConfig, "config.events", data)
        return <HOC {...tableWidgetConfig}/>
    }

    onSearch(value) {
        const formJson = _.mapValues(value, (v, k) => {
            if (v.type === 'file' || _.isString(v)) {
                return v
            }
            else {
                return JSON.stringify(v)
            }
        })
        ah.multi('http://192.168.10.224:13667/uif/cibd/cibdcode/enter', formJson)
            .then(data => {
                const {codeSearchResult: {hits, aggregations: {aggsByOccurBranchCode, aggsByCaseType, aggsBydate}}} = data
                this.setState({
                    count: hits.total,
                    aggsByOccurBranchCode: aggsByOccurBranchCode.buckets,
                    aggsByCaseType: aggsByCaseType.buckets,
                    aggsBydate: aggsBydate.buckets,
                    table: hits.hits
                })
            })
            .catch(err => {
                this.setState({info: err.message, error: true})
            })
    }

    render() {
        const {uiConfig, nowWidget} = this.state
        if (!uiConfig || _.isEmpty(uiConfig)) {
            return null
        }
        const searchFormWidgetConfig = uiConfig['pocForm']
        _.set(searchFormWidgetConfig, ['config', 'onSearch'], this.onSearch.bind(this))
        return <div id='g-demo' className='c-flex c-split vertical c-padding'>
            <HOC {...searchFormWidgetConfig}/>
            <div id='g-page2-2' className='c-flex c-margin c-split vertical inner grow'>
                <div className='c-box grow'>
                    <header>報表模式</header>
                    <div className='content c-flex fdc grow c-split horizontal inner'>
                        <div className='c-flex grow c-split vertical inner chart-box-group'>
                            <div className='c-box grow chart-box'>
                                <header>刑案總數</header>
                                <div className='content c-center'>
                                    {this.renderCount()}
                                </div>
                            </div>
                            <div className='c-box grow chart-box'>
                                <header>刑案統計-依類型</header>
                                <div className='content'>
                                    {this.renderAggsByCaseType()}
                                </div>
                            </div>
                            <div className='c-box grow chart-box'>
                                <header>刑案統計-依地區</header>
                                <div className='content'>
                                    {this.renderAggsByOccurBranchCode()}
                                </div>
                            </div>
                            <div className='c-box grow chart-box'>
                                <header>刑案統計-依時間</header>
                                <div className='content'>
                                    {this.renderAggsBydate()}
                                </div>
                            </div>
                        </div>
                        <div className='c-box c-flex grow poc-table'>
                            <header>報表</header>
                            <div className='content'>
                                {this.renderTable()}
                            </div>
                        </div>
                    </div>
                </div>
                {/*<div className='c-flex fdc grow c-split horizontal inner'>*/}
                {/*<div className='c-box fixed'>*/}
                {/*<header>1 Header</header>*/}
                {/*<div className='content'>*/}
                {/*1*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div className='c-box grow'>*/}
                {/*<header>2 Header</header>*/}
                {/*<div className='content'>*/}
                {/*2*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div className='c-flex fdc grow c-split horizontal inner'>*/}
                {/*<div className='c-box grow'>*/}
                {/*<header>3 Header</header>*/}
                {/*<div className='content'>*/}
                {/*3*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div className='c-flex grow c-split vertical inner'>*/}
                {/*<div className='c-box fixed'>*/}
                {/*<header>4 Header</header>*/}
                {/*<div className='content'>*/}
                {/*4*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div className='c-flex fdc grow c-split horizontal inner'>*/}
                {/*<div className='c-box grow'>*/}
                {/*<header>5 Header</header>*/}
                {/*<div className='content'>*/}
                {/*5*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div className='c-box grow'>*/}
                {/*<header>6 Header</header>*/}
                {/*<div className='content'>*/}
                {/*6*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
            </div>


            {/*<div className='c-flex fdc grow c-split horizontal inner'>*/}
            {/*<div className='c-box fixed'>*/}
            {/*<header>測試區</header>*/}
            {/*<div className='content'>*/}
            {/*<div className='c-box fixed'>*/}
            {/*<header>測試區</header>*/}
            {/*<div className='content'>*/}
            {/*</div>*/}
            {/*<header>測試區</header>*/}
            {/*<div className='content'>*/}
            {/*</div>*/}
            {/*<header>測試區</header>*/}
            {/*<div className='content'>*/}
            {/*</div>*/}
            {/*</div>*/}
            {/*</div>*/}
            {/*</div>*/}
            {/*</div>*/}
        </div>
    }
}

export default Index