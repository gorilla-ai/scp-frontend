import React from 'react'
import moment from 'moment'
import _ from 'lodash'

import Timebar from '../../src/components'

import createExample from './example-factory'


const MIN_TIME = moment('2018-05-01').valueOf()
const MAX_TIME = moment().valueOf()
const SAMPLE = _.map(_.range(300000), (idx)=>{
    return {
        id: `x-${idx}`,
        dt: Math.floor(Math.random()*(MAX_TIME-MIN_TIME))+MIN_TIME,
        group: Math.random()<0.5 ? 'group-1' : 'group-2',
        v: Math.ceil(Math.random()*10)
    }
})


let Examples = {}

Examples.Timebar = class extends React.Component {
    state = {
    };

    render() {
        return <Timebar
            items={SAMPLE}
            groups={{
                'group-1': {},
                'group-2': {}
            }}
            onClick={(...args)=>{
                console.log('clicked', args)
            }}
            onDoubleClick={(...args)=>{
                console.log('double clicked', args)
            }}
            onMouseOver={(...args)=>{
                console.log('hovered', args)
            }}
            onContextMenu={(...args)=>{
                console.log('right clicked', args)
            }}
            onRangeChange={(...args)=>{
                console.log('range changed', args)
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

