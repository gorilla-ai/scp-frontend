import _ from 'lodash'
import PropTypes from 'prop-types';
import React from 'react'

import {DATA_ITEM_PROP, KEY_MAPPING_PROP} from '../consts/prop-types'

let log = require('loglevel').getLogger('chart/hoc/split-charts')

const COLORS = [
    '#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
    '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1',
    '#b09901', '#06ce72', '#477e58', '#c26a6e', '#c1b748'
]

export default function splitCharts(Component) {
    return class extends React.Component {
        static propTypes = {
            data: PropTypes.arrayOf(DATA_ITEM_PROP).isRequired,
            dataCfg: PropTypes.shape({
                splitChart: KEY_MAPPING_PROP
            }),
            keyLabels: DATA_ITEM_PROP,
            valueLabels: PropTypes.objectOf(DATA_ITEM_PROP),
            colors: PropTypes.object
        };

        getChartTitle = (labels, splitChartPath, chartKey) => {
            if (chartKey==null || chartKey==='undefined') {
                return 'others'
            }
            return _.reduce([splitChartPath, chartKey], (acc, path)=>{
                return _.get(acc, path, chartKey)
            }, labels)
        };

        getAxisChartColors = () => {
            const {data, dataCfg:{y, splitSeries}} = this.props

            // Case 1: Not split by series (ie each split chart only has 1 series)
            // Case 2: Y is not given (use splitSeries as key)
            // Case 3: Both splitSeries & y given
            // For 1 & 2, don't need to sync coloring across charts, just use HightChart default
            if (splitSeries && y) {
                const keys = _(data)
                    .map(i=>_.get(i, splitSeries))
                    .uniq()
                    .value()
                return _.zipObject(keys, COLORS)
            }
            return null
        };

        getPieChartColors = () => {
            const {data, dataCfg:{splitSlice}} = this.props
            let colorIdx = 0
            const colors = _.reduce(splitSlice, (acc, slicePath)=>{
                const keys = _(data)
                    .map(i=>_.get(i, slicePath))
                    .uniq()
                    .value()
                const numColors = keys.length
                _.set(acc, slicePath, _.zipObject(keys, COLORS.slice(colorIdx, colorIdx+numColors)))
                colorIdx += numColors
                return acc
            }, {})
            return colors
        };

        renderChart = (id, data) => {
            const {keyLabels, valueLabels, dataCfg, colors} = this.props
            const {splitChart} = dataCfg
            const title = this.getChartTitle(valueLabels, splitChart, id)

            let propsToOverwrite = _.reduce(['onTooltip', 'onMouseOver', 'onClick', 'onDoubleClick', 'onContextMenu'], (acc, p)=>{
                if (_.has(this.props, p)) {
                    if (typeof this.props[p] === 'function') {
                        acc[p] = (eventInfo, matched, cfg)=>{
                            return this.props[p](
                                {splitChart:id, ...eventInfo},
                                matched,
                                cfg
                            )
                        }
                    }
                }
                return acc
            }, {})

            switch (Component.displayName) {
                case 'BaseTableChart':
                case 'BaseTimeline':
                    propsToOverwrite.title = title
                    break
                case 'BasePieChart':
                    propsToOverwrite.colors = colors || this.getPieChartColors()
                    propsToOverwrite.centerText = title
                    break
                /*case 'BarChart':
                case 'LineChart':
                case 'AreaChart':*/
                case 'BaseAxisChart':
                    propsToOverwrite.colors = colors || this.getAxisChartColors()
                    //propsToOverwrite.yAxis = {...this.props.yAxis, title}
                    propsToOverwrite.yAxis = _.merge({title:{text:title}}, this.props.yAxis)

                    break
                default:
                    break
            }
            return React.createElement(Component, {
                ...this.props,
                key: id,
                id,
                data,
                dataCfg,
                keyLabels,
                valueLabels,
                ...propsToOverwrite
            })
        };

        render() {
            const {data, dataCfg:{splitChart}} = this.props

            if (splitChart) {
                return <div className='c-chart-split'>
                    {
                    _(data)
                        .groupBy(item=>_.get(item, splitChart))
                        .map((v, k)=>{
                            return this.renderChart(k, v)
                        })
                        .value()
                }
                </div>
            }
            else {
                return <Component {...this.props} />
            }
        }
    };
}