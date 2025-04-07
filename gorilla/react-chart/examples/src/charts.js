import React from 'react'
import _ from 'lodash'
import $ from 'jquery'
import queryString from 'query-string'

import AreaChart from 'chart/components/area'
import BarChart from 'chart/components/bar'
import LineChart from 'chart/components/line'
import PieChart from 'chart/components/pie'
import Timeline from 'chart/components/timeline'
import ah from 'react-ui/build/src/utils/ajax-helper'

import createExample from './example-factory'

import imdbData from '../mock/imdb.json'
import imdbData2 from '../mock/imdb-key.json'
import imdbData3 from '../mock/imdb-nested.json'

let Examples = {}

const {data:DATA, keyLabels:KEY_LABELS, valueLabels:VALUE_LABELS} = imdbData
const {data:DATA2, keyLabels:KEY_LABELS2, valueLabels:VALUE_LABELS2} = imdbData2
const {data:DATA3, keyLabels:KEY_LABELS3, valueLabels:VALUE_LABELS3} = imdbData3


Examples.BarChart = class extends React.Component {
    state = {
    };

    render() {
        return <div>
            <BarChart
                title='Simple minimal bars'
                data={DATA3}
                keyLabels={KEY_LABELS3}
                valueLabels={VALUE_LABELS3}
                xAxis={{lineWidth:0, tickWidth:0,type:'category'}}
                yAxis={{visible:false}}
                legend={{enabled:false}}
                dataCfg={{
                    x: ['actor','imdb.id'],
                    y: 'movies'
                }} />
            <BarChart
                title='Actors by Year (column, stacked)'
                stacked
                vertical
                data={DATA}
                keyLabels={KEY_LABELS}
                valueLabels={VALUE_LABELS}
                onTooltip={true}
                dataCfg={{
                    splitSeries: 'actor',
                    x: 'year',
                    y: 'movies'
                }} />
            <BarChart
                title='Actors by Year (bar, side by side)'
                data={DATA}
                keyLabels={KEY_LABELS}
                valueLabels={VALUE_LABELS}
                colors={{
                    tom:'#c1b748',
                    nicole:'#2b908f'
                }}
                dataCfg={{
                    splitSeries: 'actor',
                    x: 'year',
                    y: 'movies'
                }} />
            <BarChart
                title='Actors by Director (bar key as series name)'
                vertical
                data={DATA2}
                keyLabels={KEY_LABELS2}
                valueLabels={VALUE_LABELS2}
                colors={{
                    tom:'#c1b748',
                    nicole:'#2b908f'
                }}
                dataCfg={{
                    splitChart: 'director',
                    splitSeries: ['nicole','tom'],
                    x: 'year'
                }} />
        </div>
    }
}

Examples.AreaChart = class extends React.Component {
    state = {
    };

    render() {
        return <AreaChart
            className='c-test'
            title='Area Chart by Director'
            stacked
            data={DATA}
            keyLabels={KEY_LABELS}
            valueLabels={VALUE_LABELS}
            plotOptions={{series:{fillOpacity:0.4,marker:{enabled:false}}}}
            dataCfg={{
                splitChart: 'director',
                splitSeries: 'actor',
                x: 'year',
                y: 'movies'
            }} />
    }
}

Examples.PieChart = class extends React.Component {
    state = {
    };

    render() {
        return <div>
            <PieChart
                title='Pie Charts By Director'
                data={DATA3}
                keyLabels={KEY_LABELS3}
                valueLabels={VALUE_LABELS3}
                holeSize={70}
                dataCfg={{
                    splitChart: 'director',
                    splitSlice: ['produced.year', ['actor','imdb.id']],
                    sliceSize: 'movies'
                }} />
            <PieChart
                title='Single Pie Chart'
                data={[
                    {name:'a',age:{band:30},occupation:'teacher',appears:10}, 
                    {name:'b',age:{band:40},occupation:'criminal',appears:15},
                    {name:'c',age:{band:40},occupation:'teacher',appears:15}
                ]}
                colors={{
                    age:{
                        band:{
                            30:'#c1b748',
                            40:'#2b908f'
                        }
                    },
                    occupation:{
                        teacher:'#f15c80',
                        criminal:'#8085e9'
                    }
                }}
                holeSize={70}
                centerText={<div><b>Center</b>Text</div>}
                keyLabels={{
                    age:{
                        band:'Age Range'
                    }
                }}
                dataCfg={{
                    splitSlice: [['age','band'], 'occupation'],
                    sliceSize: 'appears'
                }} />
            <PieChart
                title='Single Pie Chart 2'
                data={[
                    {name:'a', count:20},
                    {name:'b', count:80}
                ]}
                colors={{
                    name:{
                        a:'#c1b748',
                        b:'#2b908f'
                    }
                }}
                holeSize={70}
                centerText='80%'
                dataCfg={{
                    splitSlice: ['name'],
                    sliceSize: 'count'
                }} />
        </div>
    }
}

Examples.LineChart = class extends React.Component {
    state = {
    };

    render() {
        return <LineChart
            title='Line Charts by Actor'
            stacked
            vertical
            data={DATA}
            keyLabels={KEY_LABELS}
            valueLabels={VALUE_LABELS}
            dataCfg={{
                splitChart: 'actor',
                splitSeries: 'director',
                x: 'year',
                y: 'movies'
            }} />
    }
}

Examples.Timeline = class extends React.Component {
    state = {
        eventInfo: {},
        data: {},
        dataCfg: {}
    };

    handleClick = (eventInfo, data, {dataCfg, keyLabels, valueLabels}) => {
        this.setState({
            eventInfo,
            data,
            dataCfg
        })
    };

    // Example of generate color by function
    // renderColor(eventInfo, data, {dataCfg, keyLabels, valueLabels}) {
    //     let color = '#001B34'
    //     if (data.tvs) {
    //         color = '#2b908f'
    //     }
    //     else if (data.movies) {
    //         color = '#c1b748'
    //     }

    //     return color
    // },
    handleRangeChanged = (eventInfo, data, {dataCfg, keyLabels, valueLabels}) => {
        this.setState({
            eventInfo,
            data,
            dataCfg
        })
    };

    render() {
        return <div>
            <Timeline
                ref={node => { this.chartNode = node }}
                id='actor-timeline'
                title='Actor Timeline'
                data={DATA}
                keyLabels={KEY_LABELS}
                valueLabels={VALUE_LABELS}
                dataCfg={{
                    splitGroup: 'actor',
                    timeStart: 'timeStart',
                    timeEnd: 'timeEnd',
                    agg: ['movies','tvs']
                }} 
                colors={{
                    movies: '#c1b748',
                    tvs: '#2b908f'
                }}
                // colors={this.renderColor}
                verticalScroll={true}
                onClick={this.handleClick}
                onRangeChanged={this.handleRangeChanged} />
        </div>
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
