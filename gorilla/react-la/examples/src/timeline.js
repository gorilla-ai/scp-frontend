import React from 'react'
import _ from 'lodash'

import La from 'react-la/build/src/components/timeline'
import SAMPLE_DATA from '../mock/sample-1.json'

import createExample from './example-factory'


const SAMPLE = {
    items: SAMPLE_DATA
}

let Examples = {}

Examples.Timeline = class extends React.Component {
    state = {
    };

    render() {
        return <La
            {...SAMPLE}
            showStatic
            layoutOnPlay='tweak'
            _ref={ref=>{ this.laNode=ref }}
            onClick={(id)=>{
                const item = id ? this.laNode.la.getItem(id) : null
                console.log('clicked', id, item)
            }} />
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

