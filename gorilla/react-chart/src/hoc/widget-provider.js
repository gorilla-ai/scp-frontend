import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import splitCharts from './split-charts'
import {multiTraverse} from '../utils/traversal'

let log = require('loglevel').getLogger('chart/hoc/widget-provider')

function renderTooltip(eventInfo, matched, {dataCfg, keyLabels, valueLabels}) {
    const fields = _.reduce(dataCfg, (acc, keys, i)=>{
        const event = eventInfo[i]
        if (i==='splitSlice' || i === 'agg') {
            _.forEach(keys, (k, j)=>{
                acc.push({key:k, value:event[j]})
            })
        }
        else if (!dataCfg.y && i==='splitSeries') {
            acc.push({key:event, value:eventInfo.y})
        }
        else {
            acc.push({key:keys, value:event})
        }
        return acc
    }, [])
    return <span>
        {
            _.map(fields, ({key, value})=>{
                return <span key={key}>
                    {_.get(keyLabels, key, key)}:
                    {multiTraverse(valueLabels, [key, value], value)}
                    <br />
                </span>
            })
        }
    </span>
}

const toWidget = (BaseComponent) => {
    const SplitComponent = splitCharts(BaseComponent)

    return (props)=>{
        const {id, className, title, ...chartProps} = props
        const Component = chartProps.dataCfg.splitChart ? SplitComponent : BaseComponent
        const defaultTooltip = chartProps.onTooltip==null || chartProps.onTooltip===true

        return <div id={id} className={cx('c-chart', className)}>
            {title && <header>{title}</header>}
            <Component {...chartProps} onTooltip={defaultTooltip?renderTooltip:chartProps.onTooltip} />
        </div>
    }
}

export default toWidget