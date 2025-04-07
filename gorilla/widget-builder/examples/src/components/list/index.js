import $ from 'jquery'
import React from 'react'
import i18n from 'i18next'
import Input from 'react-ui/build/src/components/input'
import cx from 'classnames'


import * as api from 'app/utils/api-helper'
import {CONFIG_TYPE} from 'app/utils/api-helper'
import {HOC} from 'widget-builder'

const log = require('loglevel').getLogger('list')

const t = i18n.getFixedT(null, 'demo')
class List extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            search: null,
            widgetList: {}
        }

    }
    componentDidMount(){
        this.loadData()
    }
    loadData() {
        const mode = this.props.match.params.mode
        const data = {}
        // const tag = this.state.search
        // if (tag) {
        //     data.tags = tag
        // }
        api.getConfigList(mode ? mode : CONFIG_TYPE.WIDGET, {data, field: ['tags']})
            .then(res => {
                const data = _.chain(res.result)
                    .sortBy('__id')
                    .keyBy('__id')
                    .value()
                this.setState({widgetList: data, total: res.total})
            })
            .catch(err => {
                this.setState({info: err.message, error: true})
            })
    }

    switchWidget(widget) {
        this.setState({nowWidget: widget})
    }

    render() {
        const {widgetList, nowWidget, search} = this.state
        const mode = this.props.match.params.mode
        const list = _.pickBy(widgetList, (value, key) => {
            const matcher = new RegExp(".*" + (search ? search : '.*') + ".*", "g");
            return matcher.test(key)
        })
        return <div id='g-list' className='c-flex c-split vertical c-padding'>
            <div className='c-box fixed menu'>
                <header>清單
                    <label className={cx("link", {active: mode!=='dashboard'})}><a href={'/list/widget'}>widget</a></label>&nbsp;/&nbsp;
                    <label className={cx("link", {active: mode==='dashboard'})}><a href={'/list/dashboard'}>dashboard</a></label>
                </header>
                <div className='content'>
                    <div className={'c-flex aic'}>
                        <label className={'c-margin'}>Search</label>
                        <Input
                            className='grow'
                            type='text'
                            placeholder={'Search'}
                            onChange={(value) => {
                                this.setState({search: value})
                            }}
                            value={search}
                        />
                    </div>
                    {
                        _.map(list, (config, id) => {
                            return <button key={id} className='standard' title={id} onClick={this.switchWidget.bind(this, {id: id, ...config})}>
                                {id}
                            </button>
                        })
                    }
                </div>
            </div>
            <div className='c-flex fdc grow '>
                <div className='c-box grow'>
                    <header>測試區</header>
                    <div className='content main'>
                        {nowWidget ? <HOC $id={mode === 'dashboard' ? `${mode}/${nowWidget.id}` : nowWidget.id}/> : null}
                    </div>
                </div>
            </div>
        </div>
    }
}

export default List