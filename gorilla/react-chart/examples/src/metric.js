import React from 'react'
import _ from 'lodash'

import Metric from 'chart/components/metric'

import createExample from './example-factory'

import imdbData from '../mock/imdb.json'
import imdbData2 from '../mock/imdb-nested.json'

const {data:DATA, keyLabels:KEY_LABELS, valueLabels:VALUE_LABELS} = imdbData
const {data:DATA2, keyLabels:KEY_LABELS2, valueLabels:VALUE_LABELS2} = imdbData2

let Examples = {}

Examples.SingleValueMetric = class extends React.Component {
    handleClick = (eventInfo, matched, cfg) => {
        this.setState({eventInfo, matched, cfg})
    };

    render() {
        return <Metric
            id='single-value-metric'
            title='All Movies'
            data={DATA}
            dataCfg={{
                agg: ['movies']
            }}
            group={{
                header: 'Total',
                vertical:false
            }}
            keyLabels={KEY_LABELS}
            onClick={this.handleClick} />
    }
}

Examples.MultiValueMetric = class extends React.Component {
    handleClick = (eventInfo, matched, cfg) => {
        this.setState({eventInfo, matched, cfg})
    };

    render() {
        return <Metric
            id='multi-value-metric'
            title='All Movies/TVs'
            data={DATA}
            dataCfg={{
                agg: ['movies', 'tvs']
            }}
            group={{
                header: <img src='/images/ic_city.png' />
            }}
            keyLabels={KEY_LABELS}
            onClick={this.handleClick} />
    }
}

Examples.MultiGroupMetric = class extends React.Component {
    handleClick = (eventInfo, matched, cfg) => {
        this.setState({eventInfo, matched, cfg})
    };

    render() {
        return <Metric
            id='multi-group-metric'
            title='Years (most movies/tvs at top)'
            className='fdc'
            data={DATA}
            dataCfg={{
                splitGroup: ['year'],
                agg: ['movies', 'tvs']
            }}
            groups={{
                sort:[
                    {field:'movies', desc:true},
                    {field:'tvs', desc:true}
                ],
                sub: {
                    title: 'History',
                    group:{
                        vertical: false
                    }
                }
            }}
            keyLabels={KEY_LABELS}
            valueLabels={VALUE_LABELS}
            onClick={this.handleClick} />
    }
}

Examples.ComplexMultiGroupMetric = class extends React.Component {
    handleClick = (eventInfo, matched, cfg) => {
        this.setState({eventInfo, matched, cfg})
    };

    render() {
        return <Metric
            id='complex-multi-group-metric'
            title='Actors'
            className='fdc'
            data={DATA2}
            dataCfg={{
                splitGroup: [['actor', 'imdb.id']],
                agg: ['movies', 'tvs']
            }}
            group={{
                vertical: true,
                header: ({splitGroup})=>`Hi ${splitGroup}!`
            }}
            groups={{
                sort:[
                    {field:'movies', desc:true},
                    {field:'tvs', desc:true}
                ],
                sub: {
                    className:'c-flex fdc',
                    title: ''
                }
            }}
            keyLabels={KEY_LABELS2}
            valueLabels={VALUE_LABELS2}
            onClick={this.handleClick} />
    }
}

Examples.WeatherMetric = class extends React.Component {
    handleClick = (eventInfo, matched, cfg) => {
        this.setState({eventInfo, matched, cfg})
    };

    renderWeather = (info, data) => {
        console.log(info, data)
        const {isMainGroup} = info
        const low = _.minBy(data, 'low').low
        const high = _.maxBy(data, 'high').high
        return <div className={isMainGroup?'c-flex aic':'c-flex fdc'}>
            <img src={`/images/${(high>=26?'ic_airplane':'ic_etag_gate')}.png`}/>
            <span>{low}-{high}</span>
        </div>
    };

    render() {
        return <Metric
            id='weather-metric'
            title='Weather'
            data={[
                {day:'yesterday', time:'morning', low:22, high:25},
                {day:'yesterday', time:'afternoon', low:21, high:24},
                {day:'today', low:21, high:26},
                {day:'tomorrow', low:21, high:29}
            ]}
            dataCfg={{
                splitGroup: ['day'],
                agg: this.renderWeather
            }}
            groups={{
                list:['today','yesterday','today','tomorrow'],
                main: {
                    group: {
                        header: false,
                        vertical: false
                    }
                },
                sub:{
                    group:{
                        header: true,
                        vertical: true
                    }
                }
            }}
            valueLabels={{
                day:{
                    yesterday:'Yesterday',
                    today:'Today',
                    tomorrow:'Tomorrow'
                }
            }}
            onClick={this.handleClick} />
    }
}
Examples.SplitMetric = class extends React.Component {
    handleClick = (eventInfo, matched, cfg) => {
        this.setState({eventInfo, matched, cfg})
    };

    render() {
        return <Metric
            id='split-metric'
            className='c-flex fdc'
            data={DATA2}
            dataCfg={{
                splitChart: ['actor', 'imdb.id'],
                splitGroup: ['director'],
                agg: ['movies', 'tvs']
            }}
            keyLabels={KEY_LABELS2}
            valueLabels={VALUE_LABELS2}
            onClick={this.handleClick} />
    }
}

export default class extends React.Component {
    render() {
        return <div>
            {
                _.map(Examples, (example, key)=>{
                    return React.createElement(createExample(example, key), {key})
                })
            }
        </div>
    }
}