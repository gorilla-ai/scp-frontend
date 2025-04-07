import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'

import DataTable from 'react-ui/build/src/components/table'
import toWidget from '../hoc/widget-provider'
import {multiTraverse} from '../utils/traversal'

import {DATA_ITEM_PROP, KEY_MAPPING_PROP} from '../consts/prop-types'
//import PageNav from '../page-nav'

let log = require('loglevel').getLogger('chart/components/table')

class BaseTableChart extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        title: PropTypes.node,
        data: PropTypes.arrayOf(DATA_ITEM_PROP).isRequired,
        dataCfg: PropTypes.shape({
            splitRow: PropTypes.arrayOf(KEY_MAPPING_PROP).isRequired,
            agg: PropTypes.arrayOf(KEY_MAPPING_PROP)
            //pageSize: React.PropTypes.number
        }),
        keyLabels: DATA_ITEM_PROP,
        valueLabels: PropTypes.objectOf(DATA_ITEM_PROP),
        onClick: PropTypes.func,
        onContextMenu: PropTypes.func,
        onDoubleClick: PropTypes.func
    };

    static defaultProps = {
        data: []/*,
        pageSize:10*/
    };

    handleEvent = (eventType, table, rid, row) => {
        const {dataCfg, keyLabels, valueLabels} = this.props
        const {splitRow, agg} = dataCfg
        this.props[eventType](
            {
                matched: row.__raw.length,
                splitRow: splitRow.map(k=>row[k]),
                agg: agg.map(k=>row[k])
            },
            row.__raw,
            {dataCfg, keyLabels, valueLabels}
        )
    };

    render() {
        const {id, title, data, dataCfg:{splitRow, agg}, keyLabels, valueLabels, onClick, onDoubleClick, onContextMenu} = this.props

        let aggregated = _.values(_.reduce(data, (acc, item) => {
            let keyObj = _.pick(item, splitRow)
            let key = JSON.stringify(keyObj)
            if (!acc[key]) {
                acc[key] = {...keyObj, __raw:[]}
            }
            _.forEach(agg, a=>{
                _.set(acc[key], a, _.get(acc[key], a, 0)+_.get(item, a, 0))
            })

            acc[key].__raw.push(item)

            return acc
        }, []))

        return <DataTable
            key={id}
            id={id}
            className='c-chart-table fixed-header'
            caption={title}
            data={aggregated}
            fields={_.reduce([...splitRow, ...agg], (acc, k)=>{
                return {
                    ...acc,
                    [k]: {
                        label: _.get(keyLabels, k, k),
                        keyPath: k,
                        sortable: true,
                        formatter: (v)=>{
                            return multiTraverse(valueLabels, [k, v], v)
                        }
                    }
                }
            }, {})}
            defaultSort={{
                field: _.first(splitRow),
                desc: false
            }}
            onRowClick={onClick && this.handleEvent.bind(this, 'onClick', id)}
            onRowDoubleClick={onDoubleClick && this.handleEvent.bind(this, 'onDoubleClick', id)}
            onRowContextMenu={onContextMenu && this.handleEvent.bind(this, 'onContextMenu', id)} />
    }
}


/**
 * A React Table Chart
 * @constructor
 * @param {string} [id] - Chart dom element #id
 * @param {string} [className] - Classname for the chart
 * @param {string} [title] - Title for the chart
 * @param {array} data - Data, see below example
 * @param {object} dataCfg - Mapping between data shape and chart
 * @param {string | array.<string>} [dataCfg.splitChart] - if specified, will split into multiple charts based on the given key/path
 * @param {array.<string | array.<string>>} dataCfg.splitRow - split into rows based on the given keys/paths
 * @param {array.<string | array.<string>>} [dataCfg.agg] - if specified, columns to aggregate
 * @param {object} [keyLabels] - Key/label pairs for all the keys, see below for example
 * @param {object} [valueLabels] - Value/label pairs for all the values, see below for example
 * @param {function} [onClick] - Function to call when clicked
 * @param {object} onClick.eventInfo - info on the clicked row
 * @param {number} onClick.eventInfo.matched - number of data items associated with this row
 * @param {string} onClick.eventInfo.splitChart - associated table value
 * @param {string} onClick.eventInfo.splitRow - associated row
 * @param {string} onClick.eventInfo.agg - associated aggregation
 * @param {object} onClick.data - data of the current hovered item
 * @param {object} onClick.cfg - data related cfg for this chart
 * @param {object} onClick.cfg.dataCfg
 * @param {object} [onClick.cfg.keyLabels]
 * @param {object} [onClick.cfg.valueLabels]
 * @param {function} [onContextMenu] - Function to call when right clicked, see onClick for callback function spec
 * @param {function} [onDoubleClick] - Function to call when double clicked, see onClick for callback function spec
 *
 * @example

import TableChart from 'chart/components/table'

const {data:DATA, keyLabels:KEY_LABELS, valueLabels:VALUE_LABELS} = {
    "data":[
        { "director":"martin", "actor":"tom", "movies":2, "tvs":1, "year":1990 },
        { "director":"martin", "actor":"tom", "movies":3, "tvs":2, "year":1990 },
        { "director":"martin", "actor":"tom", "movies":3, "year":1991 },
        { "director":"martin", "actor":"tom", "movies":2, "year":1992 },
        { "director":"martin", "actor":"tom", "movies":10, "year":1996 },
        { "director":"martin", "actor":"tom", "movies":2, "year":1997 },
        { "director":"martin", "actor":"tom", "movies":5, "year":2000 },
        { "director":"martin", "actor":"nicole", "movies":5, "year":1990 },
        { "director":"martin", "actor":"nicole", "movies":4, "year":1991 },
        { "director":"martin", "actor":"nicole", "movies":3, "year":1992 },
        { "director":"martin", "actor":"nicole", "movies":6, "year":1993 },
        { "director":"martin", "actor":"nicole", "movies":1, "year":1994 },
        { "director":"martin", "actor":"nicole", "movies":0, "year":1997 },
        { "director":"martin", "actor":"nicole", "movies":1, "year":2000 },
        { "director":"francis", "actor":"tom", "movies":4, "year":1990 },
        { "director":"francis", "actor":"tom", "movies":2, "year":1991 },
        { "director":"francis", "actor":"tom", "movies":7, "year":1992 },
        { "director":"francis", "actor":"tom", "movies":2, "year":1996 },
        { "director":"francis", "actor":"tom", "movies":1, "year":1997 },
        { "director":"francis", "actor":"tom", "movies":1, "year":2000 },
        { "director":"francis", "actor":"nicole", "movies":1, "year":1990 },
        { "director":"francis", "actor":"nicole", "movies":3, "year":1991 },
        { "director":"francis", "actor":"nicole", "movies":4, "year":1992 },
        { "director":"francis", "actor":"nicole", "movies":1, "year":1993 },
        { "director":"francis", "actor":"nicole", "movies":2, "year":1994 },
        { "director":"francis", "actor":"nicole", "movies":0, "year":1997 },
        { "director":"francis", "actor":"nicole", "movies":2, "year":2000 },
        { "director":"francis", "movies":2, "year":2000 },
        { "actor":"tom", "movies":2, "year":1994 },
        { "actor":"nicole", "movies":2, "year":2001 }
    ],
    "keyLabels":{
        "director": "Director",
        "actor": "Actor",
        "year": "Year"
    },
    "valueLabels":{
        "director": {"martin":"Martin Scorsese", "francis":"Francis Copola"},
        "actor": {"tom":"Tom Cruise", "nicole":"Nicole Kidman"}
    }
}

React.createClass({
    handleClick(eventInfo, data, {dataCfg, keyLabels, valueLabels}) {

    },
    render() {
        return <TableChart
            id='director-split-actor-chart'
            className='c-flex'
            data={DATA}
            dataCfg={{
                splitChart: 'director',
                splitRow: ['actor', 'year'],
                agg: ['movies', 'tvs']
            }}
            keyLabels={KEY_LABELS}
            valueLabels={VALUE_LABELS}
            onClick={this.handleClick} />
    }
})
 */
const TableChart = toWidget(BaseTableChart)

export default TableChart