import React from 'react'
import _ from 'lodash'

import {RadioGroup} from 'react-ui'
import La from 'react-la/build/src/components'
import SAMPLE_1 from '../mock/sample-1.json'
import SAMPLE_2 from '../mock/sample-2.json'

import createExample from './example-factory'

const DATA = {
    sample1: SAMPLE_1,
    sample2: _.map(SAMPLE_2, (props)=>{
        const {type} = props
        const isLink = type==='INPUT' || type==='OUTPUT'
        if (isLink) {
            return {
                id1: props.start,
                id2: props.end,
                id: `${props.start}-${props.end}`,
                t: props.type,
                type: 'link',
                d: props
            }
        }
        else {
            return {
                id: props.id,
                t: `${props.name}`,
                tooltip: props.description || '',
                type: 'node',
                d: props
            }
        }
    })
}

let Examples = {}

Examples.Basic = class extends React.Component {
    state = {
        sample: _.first(_.keys(DATA))
    };

    handleSampleChange = (sample) => {
        this.setState({sample})
    };

    render() {
        const {sample} = this.state

        return <div id='la'>
            <div className='sample c-flex jcc'>
                <RadioGroup
                    className='inline'
                    list={_.map(DATA, (v, k)=>({value:k, text:k}))}
                    value={sample}
                    onChange={this.handleSampleChange} />
            </div>
            <La
                defaultIcon='/images/ic_question.png'
                items={DATA[sample]} />
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

