import React from 'react'
import _ from 'lodash'
import ReactDOMServer from 'react-dom/server'

import {RadioGroup, ButtonGroup, Dropdown as DropDownList} from 'react-ui'
import La from 'react-la/build/src/components'
import SAMPLE_1 from '../mock/sample-1.json'
import SAMPLE_2 from '../mock/sample-2.json'
import SAMPLE_2_EXPAND from '../mock/sample-2-expand.json'

import createExample from './example-factory'

const matchValue = (v, valToMatch)=>{
    if (v==null) {
        return false
    }
    else if (_.isArray(v)) {
        return _.some(v, (item)=>matchValue(item, valToMatch))
    }
    else if (_.isObject(v)) {
        return _.some(v, (item)=>matchValue(item, valToMatch))
    }
    else {
        return (v+'').toLowerCase().indexOf(valToMatch.toLowerCase())>=0
    }
}

const parseSample2Item = (item, extraProps={})=>{
    const isLink = item.type==='INPUT'||item.type==='OUTPUT'
    if (isLink) {
        return {
            id: `${item.start}-${item.end}`,
            id1: item.start,
            id2: item.end,
            type: 'link',
            d: item,
            ...extraProps
        }
    }
    else {
        return {
            id: item.id,
            type: 'node',
            d: item,
            ...extraProps
        }
    }
}

const SAMPLES = {
    sample1: {
        data: SAMPLE_1,
        searchCfg: {
            forms: {
                fts: {
                    form: {
                        fields: {
                            fts: {
                                label: '',
                                editor: 'Input',
                                props: {
                                    placeholder: 'Search Keyword'
                                }
                            }
                        }
                    },
                    filter: false
                },
                links: {
                    form: {
                        fields: {
                            threshold: {
                                label: 'Show nodes with link counts greater than: ',
                                editor: 'Input',
                                className: 'inline'
                            }
                        }
                    },
                    filter: (item, {threshold})=>{
                        if (item.type==='link') {
                            return false
                        }
                        const degrees = laChart.graph().degrees({all:true})
                        const neighbours = laChart.graph().neighbours(item.id, {all:true})
                        const show = degrees[item.id] > threshold || _.some(neighbours.nodes, n=>{
                            return degrees[n] > threshold
                        })
                        return show
                    }
                }
            }
        },
        download: {
            enabled: true,
            resolveDescription: (item)=>{
                if (item.type==='node') {
                    return `${_.values(item.d.propsReadable).join(', ')}`
                }
                else {
                    return `${_.values(_.last(item.d.propsHistory).propsReadable).join(', ')}`
                }
            }
        }
    },
    sample2: {
        data: _.map(SAMPLE_2, parseSample2Item),
        itemOptions: [
            {
                match: {
                    d: {type:'feature'}
                },
                props: {
                    b: '#0000ff',
                    t: ({d:{name}})=>name,
                    tooltip: ({d:{name, description}})=>ReactDOMServer.renderToStaticMarkup(<div>{name} ({description})</div>),
                    popup: ({d:{name, description}})=>ReactDOMServer.renderToStaticMarkup(<div>{name} ({description})</div>),
                    contextmenu: [
                        {id:'expand', text:'Find friends'},
                        {id:'delete', text:'Remove'}
                    ]
                }
            },
            {
                match: {
                    d: {type:'piece'}
                },
                props: {
                    b: '#ff0000',
                    t: ({d:{name}})=>name
                }
            },
            {
                match: {
                    dim: true
                },
                props: {
                    b: '#cccccc'
                }
            },
            {
                match: {
                    d: {type:'OUTPUT'}
                },
                props: {
                    t: ({d:{input}})=>input
                }
            }
        ],
        searchCfg: {
            title: 'Search!',
            applyText: 'Go!',
            filterGroups: [
                ['nodes'],
                ['links']
            ],
            forms: {
                nodes: {
                    title: 'Nodes',
                    form: {
                        formClassName: 'c-form aligned left',
                        fields: {
                            name: {
                                label: 'Name',
                                editor: 'Input'
                            },
                            type: {
                                label: 'Type',
                                editor: 'Dropdown',
                                props: {
                                    list: [
                                        {value:'feature', text:'Feature'},
                                        {value:'piece', text:'Piece'}
                                    ],
                                    defaultText: 'All'
                                }
                            }
                        }
                    }
                },
                links: {
                    title: 'Links',
                    form: {
                        formClassName: 'c-form',
                        fields: {
                            outputOnly: {
                                label: 'Show Output links only',
                                className: 'inline',
                                editor: 'Checkbox'
                            }
                        }
                    },
                    filter: (item, {outputOnly})=>item.type==='link'&&(outputOnly?_.get(item, 'd.type')==='OUTPUT':true)
                }
            }
        },
        search: {
            nodes: {
                name: 'o'
            }
        },
        download: {
            enabled: true,
            resolveDescription: (item)=>{
                if (item.type==='node') {
                    return `${item.d.name} (${item.d.type})`
                }
                else {
                    return `${item.d.type}`
                }
            }
        }
    }
}


let Examples = {}
let laChart = null

Examples.Advanced = class extends React.Component {
    constructor(props) {
        super(props);
        const sample = _.last(_.keys(SAMPLES))

        this.state = {
            lng: 'en',
            sample,
            title: 'My LA Chart',
            showAll: true,
            show: null,
            layouts: ['standard', 'structural', 'lens', 'hierarchy', 'radial'],
            layout: 'standard',
            snaTypes: ['same', 'betweenness', 'closeness'],
            snaType: 'betweenness',
            selected: [],
            search: SAMPLES[sample].search || {}
        };
    }

    handleLngChange = (lng) => {
        this.setState({lng})
    };

    handleSampleChange = (sample) => {
        this.setState({
            sample,
            showAll: true,
            show: null,
            selected: [],
            search: SAMPLES[sample].search || {}
        })
    };

    handleLayoutChange = (layout) => {
        this.setState({layout})
    };

    handleSnaTypeChange = (snaType) => {
        this.setState({snaType})
    };

    handleClick = (id, ...args) => {
        const items = id ? this.la.la.getItem(id) : null
        console.log('handleClick', {id, args, items})
    };

    handleDoubleClick = (id, ...args) => {
        const items = id ? this.la.la.getItem(id) : null
        console.log('handleDoubleClick', {id, args, items})
    };

    handleMouseOver = (id, ...args) => {
        const items = id ? this.la.la.getItem(id) : null
        console.log('handleMouseOver', {id, args, items})
    };

    handleContextMenu = (id, {action}) => {
        const items = id ? this.la.la.getItem(id) : null
        console.log('handleContextMenu', {id, action, items})

        if (action==='expand') {
            SAMPLES.sample2.data = [
                ...SAMPLES.sample2.data,
                ..._.map(SAMPLE_2_EXPAND, (props)=>{
                    if (props.type==='INPUT' || props.type==='OUTPUT') {
                        props.start = id
                    }
                    return parseSample2Item(props, {dim:true})
                })
            ]
            this.forceUpdate()
        }
    };

    handleSelectionChange = (selected, ...args) => {
        const items = this.la.la.getItem(selected)
        console.log('handleSelectionChange', {selected, args, items})
        this.setState({
            selected
        })
    };

    handleDelete = (selected) => {
        const {sample} = this.state
        SAMPLES[sample].data = _.filter(SAMPLES[sample].data, item=>!_.includes(selected, item.id))
        this.forceUpdate()
    };

    handleShowChange = (showAll) => {
        if (showAll) {
            this.setState({showAll, show:null})
        }
        else {
            const {sample} = this.state
            const data = SAMPLES[sample].data
            const show = _(data)
                .filter(()=>Math.random() < 0.5)
                .map('id')
                .value()
            this.setState({showAll, show})
        }
    };

    handleSearch = (search) => {
        console.log('handleSearch', search)

        const {sample} = this.state
        const data = SAMPLES[sample].data
        if (sample==='sample1') {
            const {fts} = search.fts || {}
            const show = fts ? _(data)
                .filter((item)=>matchValue(item.d, fts))
                .map('id')
                .value() : null
            this.setState({show, search})
        }
        else {
            this.setState({search})
        }
    };

    render() {
        const {
            lng, title,
            show, selected,
            layouts, layout, snaTypes, snaType,
            sample, showAll, search
        } = this.state

        return <div id='la'>
            <div className='sample c-flex jcc'>
                <RadioGroup
                    className='inline'
                    list={_.map(SAMPLES, (v, k)=>({value:k, text:k}))}
                    value={sample}
                    onChange={this.handleSampleChange} />
                <ButtonGroup
                    list={[{value:'all', text:'Show All'}, {value:'random', text:'Show Random'}]}
                    value={showAll?'all':'random'}
                    onChange={(showType)=>{ this.handleShowChange(showType==='all') }} />
            </div>
            <La
                _ref={(ref)=>{ this.la=ref }}
                lng={lng}
                title={title}
                actions={<DropDownList
                    required
                    list={_.map(['en', 'zh'], lang=>({value:lang, text:lang}))}
                    value={lng}
                    onChange={this.handleLngChange} />
                }
                chartOptions={{
                    truncateLabels: {
                        maxLength: 10,
                        shownOnHover: false
                    }
                }}
                items={SAMPLES[sample].data}
                show={show}
                selected={selected}
                layouts={layouts}
                layout={layout}
                onLayoutChange={this.handleLayoutChange}
                snaTypes={snaTypes}
                snaType={snaType}
                onSnaTypeChange={this.handleSnaTypeChange}
                itemOptions={SAMPLES[sample].itemOptions}
                layoutOnFilter={true}
                snaOnFilter={true}
                search={{
                    ...SAMPLES[sample].searchCfg,
                    value: search,
                    onSearch: this.handleSearch
                }}
                download={SAMPLES[sample].download}
                onReady={()=>{
                    laChart=this.la.la
                }}
                onClick={this.handleClick}
                onDoubleClick={this.handleDoubleClick}
                //onMouseOver={this.handleMouseOver}
                onContextMenu={this.handleContextMenu}
                onSelectionChange={this.handleSelectionChange}
                onDelete={this.handleDelete} />
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

