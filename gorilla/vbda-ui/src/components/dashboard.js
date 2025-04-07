import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import {DATA_ITEM_PROP, KEY_MAPPING_PROP} from 'react-chart/build/src/consts/prop-types'
import DashboardBase from 'react-chart/build/src/components/dashboard'
import Chart from './visualization/chart'

import parseAgg from '../parser/es-agg'

import ah from 'react-ui/build/src/utils/ajax-helper'

let log = require('loglevel').getLogger('vbda/components/dashboard')

/**
 * VBDA dashboard
 * @constructor
 * @param {string} [id] - Dashboard dom element #id
 * @param {string} [className] - Classname for the dashboard
 * @param {object} [cfg] - Config for this dashboard
 *
 * @example

import cfg from '../mock/dashboard.json'
import Dashboard from 'vbda/components/dashboard'

React.createClass({
    render() {
        return <Dashboard
            cfg={config}
            url='/api/vbda/es'
            lng='en_us' />
    }
})

 */
class Dashboard extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        lng: PropTypes.string,
        url: PropTypes.string,
        cfg: PropTypes.shape({
            title: PropTypes.string,
            query: PropTypes.object,
            layout: PropTypes.objectOf(PropTypes.shape({
                x: PropTypes.number,
                y: PropTypes.number,
                w: PropTypes.number,
                h: PropTypes.number
            })),
            widgets: PropTypes.objectOf(PropTypes.shape({
                search: PropTypes.shape({
                    index: PropTypes.string.isRequired,
                    type: PropTypes.string,
                    body: PropTypes.object
                }),
                type: PropTypes.string,
                style: PropTypes.object,
                title: PropTypes.string,
                dataCfg: PropTypes.object,
                keyLocales: PropTypes.objectOf(DATA_ITEM_PROP),
                valueLocales: PropTypes.objectOf(PropTypes.objectOf(DATA_ITEM_PROP))
            })).isRequired
        }).isRequired
    };

    state = {
        data: {}
    };

    componentDidMount() {
        const {cfg:{query, widgets}} = this.props

        ah.all(_.map(widgets, v=>({
            type: 'POST',
            url: '/api/vbda/es',
            data: {
                search: JSON.stringify(_.merge({body:{query}}, v.search))
            }
        })))
            .then(data => {
                log.info('load done', data)
                let i=0
                let result = _.mapValues(widgets, (v, k)=>{
                    return data[i++]
                })
                this.setState({data:result})
            })
            .catch(err => {
                log.error(err.message)
            })
    }

    renderWidget = (id, cfg, data) => {
        if (!data) {
            return <div id={id} key={id}>No data for {id}</div>
        }

        const {lng} = this.props
        const {search, title:name, type:chartType, ...others} = cfg

        log.info('parsed', parseAgg(search.body, data))

        return <Chart
            id={id}
            key={id}
            lng={lng}
            data={parseAgg(search.body, data)}
            cfg={{
                name, chartType, ...others
            }} />
    };

    render() {
        const {cfg:{widgets, layout}} = this.props
        const {data} = this.state
        const longest = _.maxBy(_.values(layout), l=>l.x+l.w)
        return <DashboardBase
            layoutCfg={{
                cols: longest.x+longest.w,
                layout: _.map(widgets, (w, key)=>layout[key])
            }}>
            {
                _.map(widgets, (w, key)=>this.renderWidget(key, w, data[key]))
            }
        </DashboardBase>
    }
}

export default Dashboard