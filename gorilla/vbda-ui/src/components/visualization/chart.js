import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import PieChart from 'react-chart/build/src/components/pie'
import AreaChart from 'react-chart/build/src/components/area'
import BarChart from 'react-chart/build/src/components/bar'
import LineChart from 'react-chart/build/src/components/line'
import TableChart from 'react-chart/build/src/components/table'


let log = require('loglevel').getLogger('vbda/components/visualization/chart')

/**
 * Result Chart
 * @constructor
 * @param {string} [id] - Chart dom element #id
 * @param {string} [className] - Classname for the chart
 * @param {string} lng -
 * @param {array.<object>} data -
 * @param {object} cfg -
 * @param {string} cfg.name -
 * @param {'pie'|'area'|'line'|'bar'|'table'} cfg.chartType -
 * @param {object} cfg.dataCfg -
 * @param {object} [cfg.keyLocales] -
 * @param {object} [cfg.valueLocales] -
 *
 * @example

import _ from 'lodash'
import Chart from 'vbda/components/visualization/chart'

React.createClass({
    getInitialState() {
        return {
            data:[
                {_id:'xxxx',_index:'netflow-out-...', type:'logs', _source:{}},
                {_id:'yyyy',_index:'netflow-out-...', type:'logs', _source:{}}
            ]
        }
    },
    render() {
        const {data} = this.state
        return <Chart
            id='t1'
            lng='en_us'
            data={data}
            cfg={{
                chartType:'pie',
                name:'Netflow Pie',
                dataCfg:{
                    splitSlice:[
                        '_source.geoip_src_ipv4_dst_addr.country_name',
                        '_source.geoip_src_ipv4_dst_addr.city_name'
                    ],
                    sliceSize:'_source.netflow.in_pkts'
                },
                keyLocales:{
                    zh:{
                        '_source.geoip_src_ipv4_dst_addr.country_name':'國家',
                        '_source.geoip_src_ipv4_dst_addr.city_name':'城市',
                        '_source.netflow.in_pkts':'流量'
                    },
                    en:{
                        '_source.geoip_src_ipv4_dst_addr.country_name':'Country',
                        '_source.geoip_src_ipv4_dst_addr.city_name':'City',
                        '_source.netflow.in_pkts':'Traffic'
                    }
                },
                valueLocales:{
                    zh:{
                        '_source.geoip_src_ipv4_dst_addr.country_name':{
                          'Taiwan':'台灣'
                        }
                    }
                }
            }} />
    }
})
 */
class Chart extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        lng: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.object),
        cfg: PropTypes.shape({
            //agg: React.PropTypes.object,
            name: PropTypes.string,
            chartType: PropTypes.oneOf(['pie', 'area', 'line', 'bar', 'table']),
            dataCfg: PropTypes.object,
            keyLocales: PropTypes.objectOf(PropTypes.object),
            valueLocales: PropTypes.objectOf(PropTypes.objectOf(PropTypes.object))
        })
    };

    static defaultProps = {
    };

    handleClick = (eventInfo, data, cfg) => {
        const {onClick} = this.props
        onClick && onClick(data)
    };

    render() {
        const {id, className, data, cfg, lng} = this.props
        const {/*agg, */chartType, name, dataCfg, keyLocales={}, valueLocales={}, ...others} = cfg

        let Component
        switch (chartType) {
            case 'pie':
                Component = PieChart; break
            case 'area':
                Component = AreaChart; break
            case 'line':
                Component = LineChart; break
            case 'bar':
                Component = BarChart; break
            case 'table':
                Component = TableChart; break
            default:
                return <div className='c-error'>Chart type {chartType} not supported</div>
        }

        const props = {
            id,
            className: cx('c-vbda-chart', className),
            data, //parseAgg(agg, data),
            title: name,
            dataCfg,
            keyLabels: keyLocales[lng],
            valueLabels: valueLocales[lng],
            onClick: this.handleClick,
            ...others
        }
        return React.createElement(Component, props)
    }
}

export default Chart