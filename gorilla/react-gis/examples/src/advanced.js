import React from 'react'
import _ from 'lodash'
import im from 'object-path-immutable'

import {RadioGroup, ButtonGroup, Dropdown as DropDownList} from 'react-ui'
import ah from 'react-ui/build/src/utils/ajax-helper'
import Gis from 'react-gis/components'
import SAMPLE_1 from '../mock/sample-1.json'
import SAMPLE_2 from '../mock/sample-2.json'
import SAMPLE_LAYER_1 from '../mock/sample-layer-1.json'
import SAMPLE_LAYER_2 from '../mock/sample-layer-2.json'

import createExample from './example-factory'

const SAMPLES = {
    sample1: {
        data: SAMPLE_1,
        searchCfg: {
            forms: {
                googlePlace: {
                    form: {
                        formClassName: 'c-form',
                        fields: {
                            place: {
                                label: 'Google Place',
                                editor: 'Input',
                                props: {
                                    placeholder: 'enter name/place'
                                }
                            }
                        }
                    },
                    filter: false
                }
            }
        }
    },
    sample2: {
        data: _(SAMPLE_2.hits.hits)
            .filter(el => { return el._source.OccurLatitude && el._source.OccurLongitude })
            .map(el => {
                return {
                    id: el._id,
                    type: el._source.CaseType==='F003' ? 'marker' : 'spot',
                    latlng: [el._source.OccurLatitude, el._source.OccurLongitude],
                    data: el._source
                }
            })
            //.take(3000)
            .value(),
        symbolOptions: [
            {
                match: {
                    type: 'marker'
                },
                props: {
                    heatmap: true
                }
            },
            {
                match: {
                    data: {
                        CaseType: 'F003'
                    }
                },
                props: {
                    cluster: 'assault',
                    className: 'assault',
                    label: ({data})=>data.OccurAddress
                }
            },
            {
                match: {
                    type: 'spot'
                },
                props: {
                    heatmap: true,
                    cluster: 'cases',
                    backgroundColor: '#72b300'
                }
            },
            {
                match: {
                    data: {
                        CaseType: 'B001'
                    }
                },
                props: {
                    cluster: 'intrusion',
                    backgroundColor: '#ff0000',
                    label: ({data})=>data.OccurAddress,
                    tooltip: ({data})=>data.OccurAddress,
                    popup: ({data})=>{
                        if (data.CrimeMethod1Name) {
                            return `${data.CrimeMethod1Name} (${data.CrimeTool1Name})`
                        }
                        return undefined
                    }
                }
            },
            {
                match: {
                    group: 'google'
                },
                props: {
                    icon: {
                        iconUrl: '/images/ic_place.png',
                        className: 'google'
                    }
                }
            }
        ],
        clusterOptions: [
            {
                id: 'cases',
                props: {
                    symbol: {
                        type: 'spot',
                        backgroundColor: '#00ff00',
                        width: 20,
                        height: 20,
                        label: (symbol)=>`${symbol.data.count} 案件`
                    }
                }
            },
            {
                id: 'intrusion',
                props: {
                    symbol: {
                        type: 'spot',
                        backgroundColor: '#aa0000',
                        width: 20,
                        height: 20,
                        label: (symbol)=>`${symbol.data.count} 入侵案件`
                    }
                }
            },
            {
                id: 'assault',
                props: {
                    symbol: {
                        type: 'marker',
                        label: (symbol)=>`${symbol.data.count} 攻擊事件`
                    }
                }
            }
        ],
        searchCfg: {
            forms: {
                case: {
                    form: {
                        formClassName: 'c-form',
                        fields: {
                            OccurUnitCode: {
                                label: 'Occurred Unit',
                                editor: 'Dropdown',
                                props: {
                                    list: _(SAMPLE_2.hits.hits)
                                        .map('_source.OccurUnitCode')
                                        .uniq()
                                        .map(item=>({value:item, text:item}))
                                        .value()
                                }
                            },
                            CaseType: {
                                label: 'Case Type',
                                editor: 'Dropdown',
                                props: {
                                    list: _(SAMPLE_2.hits.hits)
                                        .map('_source.CaseType')
                                        .uniq()
                                        .map(item=>({value:item, text:item}))
                                        .value()
                                }
                            },
                            OccurAddress: {
                                label: 'Occurred Address',
                                editor: 'Input',
                                props: {
                                    placeholder: 'enter address'
                                }
                            }
                        }
                    }
                },
                googlePlace: {
                    form: {
                        formClassName: 'c-form',
                        fields: {
                            place: {
                                label: 'Google Place',
                                editor: 'Input',
                                props: {
                                    placeholder: 'enter name/place'
                                }
                            }
                        }
                    },
                    filter: false
                }
            }
        }
    }
}

let Examples = {}

Examples.Advanced = class extends React.Component {
    constructor(props) {
        super(props);
        const sample = _.last(_.keys(SAMPLES))

        this.state = {
            lng: 'en',
            sample,
            title: 'My Map',
            showAll: true,
            show: null,
            baseLayers: {
                standard: {label:'標準', layer:'https://mt0.google.com/vt/lyrs=m&hl=zh-TW&x={x}&y={y}&z={z}'},
                satellite: {label:'衛星', layer:'https://mt0.google.com/vt/lyrs=y&hl=zh-TW&x={x}&y={y}&z={z}'}
            },
            //baseLayer: 'satellite',
            layouts: ['heatmap', 'standard', 'track', 'contour'],
            layout: 'standard',
            dragModes: ['pan', 'measure', 'region'],
            dragMode: 'region',
            regionTypes: ['circle', 'rectangle'],
            regionType: 'rectangle',
            layers: {
                google: {label:'Google Places', interactive:false},
                layer1: {label:'Layer 1', data:SAMPLE_LAYER_1},
                layer2: {label:'Layer 2', data:SAMPLE_LAYER_2}
            },
            activeLayers: ['google', 'layer2'],
            view: {},
            selected: [],
            search: {}
        };
    }

    handleLngChange = (lng) => {
        this.setState({lng})
    };

    handleSampleChange = (sample) => {
        this.setState({sample, showAll:true, show:null})
    };

    handleLayoutChange = (layout) => {
        this.setState({layout})
    };

    handleDragModeChange = (dragMode) => {
        this.setState({dragMode})
    };

    handleRegionTypeChange = (regionType) => {
        this.setState({regionType})
    };

    handleClick = (id, ...args) => {
        const symbols = id ? this.gis.gis.getSymbol(id) : null
        console.log('handleClick', {id, args, symbols})
    };

    handleDoubleClick = (id, ...args) => {
        const symbols = id ? this.gis.gis.getSymbol(id) : null
        console.log('handleDoubleClick', {id, args, symbols})
    };

    handleMouseOver = (id, ...args) => {
        const symbols = id ? this.gis.gis.getSymbol(id) : null
        console.log('handleMouseOver', {id, args, symbols})
    };

    handleContextMenu = (id, ...args) => {
        const symbols = id ? this.gis.gis.getSymbol(id) : null
        console.log('handleContextMenu', {id, args, symbols})
    };

    handleSelectionChange = (id, ...args) => {
        const symbols = id ? this.gis.gis.getSymbol(id) : null
        console.log('handleSelectionChange', {id, args, symbols})
        this.setState({
            selected: id ? (_.isArray(id)?id:[id]) : []
        })
    };

    handleBaseLayerChange = (baseLayer) => {
        this.setState({baseLayer})
    };

    handleLayersChange = (activeLayers, eventInfo) => {
        console.log('handleLayersChange', {activeLayers, eventInfo})
        this.setState({
            activeLayers,
            view: eventInfo.view
        })
    };

    handleShowChange = (showAll) => {
        if (showAll) {
            this.setState({showAll, show:null})
        }
        else {
            const {sample} = this.state
            const {data} = SAMPLES[sample]
            const show = _(data)
                .filter(()=>Math.random() < 0.125)
                .map('id')
                .value()
            this.setState({showAll, show})
        }
    };

    handleViewChange = (view) => {
        console.log('handleViewChange', view)

        const {layers} = this.state

        this.setState({
            /*layers: _.mapValues(layers, layer=>({
                ...layer,
                data: _.map(layer.data, item=>{
                    if (item.type==='marker') {
                        return {
                            ...item,
                            latlng: [item.latlng[0]-0.05, item.latlng[1]-0.05]
                        }
                    }
                    return item
                })
            })),*/
            view
        })
    };

    handleSearch = (search) => {
        console.log('handleSearch', search)

        const {lng} = this.state

        const {center, ne, sw, radius} = this.gis.getView()
        const placeToSearch = _.get(search, 'googlePlace.place')
        if (placeToSearch) {
            ah.one(
                {
                    url: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
                    data: {
                        name: placeToSearch,
                        location: `${center.lat},${center.lng}`,
                        radius,
                        language: lng,
                        key: 'AIzaSyDDA-v5OTqJDbQCdeJM2lwEQwztDpVuxr4'
                    }
                }
            )
                .then(({results}) => {
                    results = [
                        {
                            name: 'test',
                            vicinity: 'test 2',
                            geometry: {location:center}
                        }
                    ]
                    const googleResult = _.map(results, (place, idx)=>{
                        return {
                            id: `__google_${idx}`,
                            type: 'marker',
                            latlng: [
                                place.geometry.location.lat,
                                place.geometry.location.lng
                            ],
                            data: {
                                type: 'google'
                            },
                            group: 'google',
                            popup: `${place.name} (${place.vicinity})`
                        }
                    })

                    this.setState({
                        layers: im.set(this.state.layers, 'google.data', googleResult),
                        search
                    })
                })
        }
        else {
            this.setState({search})
        }
    };

    render() {
        const {
            lng, title,
            baseLayers, layers, activeLayers, show, selected,
            layouts, layout, dragModes, dragMode, regionTypes, regionType,
            sample, showAll, search
        } = this.state

        return <div id='gis'>
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
            <Gis
                _ref={(ref)=>{ this.gis=ref }}
                lng={lng}
                title={title}
                actions={<DropDownList
                    required
                    list={_.map(['en', 'zh'], lang=>({value:lang, text:lang}))}
                    value={lng}
                    onChange={this.handleLngChange} />
                }
                mapOptions={{
                    doubleClickZoom: false
                //    center: [25.047407, 121.547722],
                //    zoom:12
                }}
                truncateLabels={{
                    maxLength: 10,
                    shownOnHover: false
                }}
                resetViewOnFilter={false}
                data={SAMPLES[sample].data}
                show={show}
                selected={selected}
                //baseMap='https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
                baseLayers={baseLayers}
                //baseLayer={baseLayer}
                //onBaseLayerChange={this.handleBaseLayerChange}
                layouts={layouts}
                layout={layout}
                onLayoutChange={this.handleLayoutChange}
                dragModes={dragModes}
                dragMode={dragMode}
                onDragModeChange={this.handleDragModeChange}
                regionTypes={regionTypes}
                regionType={regionType}
                onRegionTypeChange={this.handleRegionTypeChange}
                symbolOptions={SAMPLES[sample].symbolOptions}
                heatmapOptions={{
                    radius: 500,
                    gradient: {
                        0.2: '#3489BD',
                        0.4: '#48AF4E',
                        0.6: '#FCD43D',
                        0.8: '#E29421',
                        '1.0': '#D53F50'
                    }
                }}
                clusterOptions={SAMPLES[sample].clusterOptions}
                layers={layers}
                activeLayers={activeLayers}
                onLayersChange={this.handleLayersChange}
                searchCfg={SAMPLES[sample].searchCfg}
                search={search}
                onSearch={this.handleSearch}
                download={{
                    enabled: true
                }}
                onViewChange={this.handleViewChange}
                onClick={this.handleClick}
                onDoubleClick={this.handleDoubleClick}
                //onMouseOver={this.handleMouseOver}
                onContextMenu={this.handleContextMenu}
                onSelectionChange={this.handleSelectionChange} />
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

