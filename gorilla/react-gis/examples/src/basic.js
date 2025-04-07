import React from 'react'
import _ from 'lodash'

import {RadioGroup} from 'react-ui'
import Gis from 'react-gis/components'
import SAMPLE_1 from '../mock/sample-1.json'
import SAMPLE_2 from '../mock/sample-2.json'

import createExample from './example-factory'

const SAMPLES = {
    sample1: SAMPLE_1,
    sample2: _(SAMPLE_2.hits.hits)
            .filter(el => { return el._source.OccurLatitude && el._source.OccurLongitude })
            .map(el => {
                return {
                    id: el._id,
                    type: el._source.CaseType==='F003' ? 'marker' : 'spot',
                    latlng: [el._source.OccurLatitude, el._source.OccurLongitude],
                    data: el._source
                }
            })
            .take(300)
            .value()
}

let Examples = {}

Examples.Basic = class extends React.Component {
    state = {
        sample: _.first(_.keys(SAMPLES))
    };

    handleSampleChange = (sample) => {
        this.setState({sample})
    };

    render() {
        const {sample} = this.state

        return <div id='gis'>
            <div className='sample c-flex jcc'>
                <RadioGroup
                    className='inline'
                    list={_.map(SAMPLES, (v, k)=>({value:k, text:k}))}
                    value={sample}
                    onChange={this.handleSampleChange} />
            </div>
            <Gis
                data={SAMPLES[sample]}
                symbolOptions={[
                    {
                        match: {
                            type: 'marker'
                        },
                        props: {
                            heatmap: true
                        }
                    }
                ]}
                onClick={(id)=>{
                    console.log('clicked', id)
                }}
                heatmapOptions={{
                    radius: 500
                }} />
        </div>
    }
}


export default class extends React.Component {
    render() {
        return <div id='example'>
            {
                _.map(Examples, (example, key)=>{
                    return React.createElement(createExample(example, key), {key})
                })
            }
        </div>
    }
}

