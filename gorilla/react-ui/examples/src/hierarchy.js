import React from 'react'
import _ from 'lodash'
import im from 'object-path-immutable'

import {Tree, Hierarchy} from 'core/components'
import Form from 'core/components/form'

import createExample from './example-factory'

const log = require('loglevel').getLogger('examples/tree')

let Examples = {}

const INITIAL_DATA = {
    id: 'home',
    label: 'Home',
    children: [
        {
            id: 'C', label: 'C - click to load children dynamically',
            children: []
        },
        {
            id: 'A',
            children: [
                {
                    id: 'A.a',
                    children: [
                        {id:'A.a.1'},
                        {
                            id: 'A.a.2',
                            children: [
                                {id:'A.a.2.x'},
                                {id:'A.a.2.y'}
                            ]
                        }
                    ]
                },
                {
                    id: 'A.b',
                    children: [
                        {id:'A.b.1', disabled:true},
                        {id:'A.b.2'},
                        {id:'A.b.3'}
                    ]
                }
            ]
        },
        {
            id: 'B', label: 'B',
            children: [
                {id:'B.a', label:'B.a custom label'},
                {id:'B.b', label:'B.b custom label'}
            ]
        }
    ]
}

Examples.Hierarchy = class extends React.Component {
    state = {
        current: 'A.a',
        selected: [],
        data: INITIAL_DATA,
        settings: {
            showRoot: false,
            foldable: true,
            selectable: true,
            layout: 'accordion'
        }
    };

    handleLabelClick = (current) => {
        this.setState({current})
    };

    handleSelectChange = (selected) => {
        this.setState({selected})
    };

    renderDemoSettings = () => {
        const {settings} = this.state
        return <Form
            className='demo-settings'
            formClassName='inline'
            fields={{
                showRoot: {
                    label: 'Show Root?',
                    editor: 'Checkbox'
                },
                foldable: {
                    label: 'Allow Expand/Collapse?',
                    editor: 'Checkbox'
                },
                selectable: {
                    label: 'Selectable?',
                    editor: 'Checkbox'
                },
                layout: {
                    label: 'Layout',
                    editor: 'RadioGroup',
                    props: {
                        className: 'inline',
                        list: _.map(['tree', 'accordion'], l=>({value:l, text:l}))
                    }
                }
            }}
            value={settings}
            onChange={newSettings=>{ this.setState({settings:newSettings}) }} />
    };

    render() {
        let {data, current, selected, settings:{showRoot, foldable, selectable, layout}} = this.state

        return <div>
            {this.renderDemoSettings()}
            <Hierarchy
                layout={layout}
                foldable={foldable}
                data={showRoot?data:{children:data.children}}
                selection={{
                    enabled: selectable
                }}
                selected={selected}
                onSelectionChange={this.handleSelectChange}
                current={current}
                onLabelClick={this.handleLabelClick}
                onLabelMouseOver={(...args)=>{ console.log('label mouseover', args) }}
                defaultOpened={['home', 'A']} />
        </div>
    }
}

Examples.Panels = class extends React.Component {
    state = {
    };

    render() {
        return <div>
            <Hierarchy
                className='c-border'
                layout='accordion'
                foldable={true}
                indent={[4, 0]}
                data={{
                    id: 'all',
                    foldable: false,
                    children: [
                        {
                            id: 'A',
                            children: [
                                {
                                    id: 'A.a',
                                    label: <div className='c-result nopad'>
                                        <div>
                                            <label>key 1</label>
                                            <div>value 1</div>
                                        </div>
                                        <div>
                                            <label>key 2</label>
                                            <div>value 2</div>
                                        </div>
                                    </div>
                                },
                                {
                                    id: 'A.b',
                                    label: <div className='c-result nopad'>
                                        <div>
                                            <label>key 1</label>
                                            <div>value 1</div>
                                        </div>
                                        <div>
                                            <label>key 2</label>
                                            <div>value 2</div>
                                        </div>
                                    </div>
                                }
                            ]
                        },
                        {
                            id: 'B',
                            children: [
                                {
                                    id: 'B.a',
                                    label: <div className='c-result nopad'>
                                        <div>
                                            <label>key 1</label>
                                            <div>value 1</div>
                                        </div>
                                        <div>
                                            <label>key 2</label>
                                            <div>value 2</div>
                                        </div>
                                    </div>
                                },
                                {
                                    id: 'B.b',
                                    label: <div className='c-result nopad'>
                                        <div>
                                            <label>key 1</label>
                                            <div>value 1</div>
                                        </div>
                                        <div>
                                            <label>key 2</label>
                                            <div>value 2</div>
                                        </div>
                                    </div>
                                }
                            ]
                        }
                    ]
                }}
                defaultOpened={['all']} />
        </div>
    }
}

Examples.Tree = class extends React.Component {
    state = {
        selected: 'A.a',
        data: INITIAL_DATA,
        settings: {
            allowToggle: true
        }
    };

    selectEntry = (selected) => {
        this.setState({selected})
    };

    toggleOpen = (opened, eventData) => {
        let {id, open, path} = eventData

        if (id === 'C' && open) {
            let setPath = (
                _(path)
                    .map(p=>p.index)
                    .tail()
                    .map(p=>'children.'+p)
                    .value()
            ).join('.')+'.children'

            log.info(`loading more data for ${id}: ${setPath}`)

            let newData = im.set(this.state.data, setPath, [
                {id:'C.a'},
                {id:'C.b'}
            ])
            this.setState({data:newData})
        }
    };

    renderDemoSettings = () => {
        const {settings} = this.state
        return <Form
            className='demo-settings'
            formClassName='inline'
            fields={{
                allowToggle: {
                    label: 'Allow Toggle?',
                    editor: 'Checkbox',
                    className: 'inline aic'
                }
            }}
            value={settings}
            onChange={newSettings=>{ this.setState({settings:newSettings}) }} />
    };

    render() {
        let {data, selected, settings:{allowToggle}} = this.state

        return <div>
            {this.renderDemoSettings()}
            <Tree
                data={data}
                allowToggle={allowToggle}
                selected={selected}
                defaultOpened={['home', 'A']}
                onToggleOpen={this.toggleOpen}
                onSelect={this.selectEntry} />
        </div>
    }
}

export default class extends React.Component {
    render() {
        return <div id='example-tree'>
            {
                _.map(Examples, (example, key)=>{
                    return React.createElement(createExample(example, key), {key})
                })
            }
        </div>
    }
}

