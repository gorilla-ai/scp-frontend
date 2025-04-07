import React from 'react'
import _ from 'lodash'

import TableChart from 'chart/components/table'

import createExample from './example-factory'

import imdbData from '../mock/imdb.json'
import imdbData2 from '../mock/imdb-nested.json'

const {data:DATA, keyLabels:KEY_LABELS, valueLabels:VALUE_LABELS} = imdbData
const {data:DATA2, keyLabels:KEY_LABELS2, valueLabels:VALUE_LABELS2} = imdbData2

let Examples = {}

Examples.SplitTableChart = class extends React.Component {
    handleClick = (eventInfo, matched, cfg) => {
        this.setState({eventInfo, matched})
    };

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
}

Examples.TableChart = class extends React.Component {
    handleClick = (eventInfo, matched, cfg) => {
        this.setState({matched})
    };

    render() {
        return <TableChart
            id='actor-chart'
            title='Actors'
            data={DATA2}
            dataCfg={{
                splitRow: [['actor','imdb.id']],
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
