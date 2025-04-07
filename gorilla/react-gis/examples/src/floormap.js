import React from 'react'
import _ from 'lodash'

import Gis from 'react-gis/components'
import SAMPLE_1 from '../mock/sample-1.json'
import SAMPLE_SEATMAP from '../mock/sample-seatmap.json'

import createExample from './example-factory'

const SAMPLES = {
    first: {
        data: _.map(_.range(500), (i)=>{
            const isPerson = Math.random() > 0.1
            const icon = {
                iconUrl: isPerson ? '/images/ic_person.png' : '/images/ic_camera.png'
            }
            const cluster = isPerson ? 'person' : 'camera'
            return {
                id: `${cluster}-${i}`,
                type: 'marker',
                cluster,
                heatmap: {radius:500},
                xy: [Math.random()*3000, Math.random()*1500],
                icon,
                label: i+''
            }
        }),
        clusterOptions: [
            {
                id: 'person',
                props: {
                    symbol: {
                        type: 'marker',
                        icon: {
                            iconUrl: '/images/ic_person.png'
                        },
                        label: (symbol)=>`${symbol.data.count} People`
                    }
                }
            },
            {
                id: 'camera',
                props: {
                    symbol: {
                        type: 'marker',
                        icon: {
                            iconUrl: '/images/ic_camera.png'
                        },
                        label: (symbol)=>`${symbol.data.count} Cameras`
                    }
                }
            }
        ]
    },
    planeSeats: {
        data: SAMPLE_SEATMAP,
        symbolOptions: [{
            props: {
                icon: {
                    iconSize: [26, 26],
                    iconAnchor: [13, 13]
                }
            }
        }]
    },
    map: {
        data: SAMPLE_1
    }
}

let Examples = {}

Examples.FloorMap = class extends React.Component {
    state = {
        baseLayer: _.first(_.keys(SAMPLES))
    };

    handleBaseLayerChange = (baseLayer) => {
        this.setState({
            baseLayer
        })
    };

    render() {
        const {baseLayer} = this.state
        return <Gis
            _ref={ref=>{ this.gisNode=ref.gisNode }}
            data={_.get(SAMPLES, [baseLayer, 'data'], [])}
            baseLayers={{
                first: {
                    label: '1F',
                    images: [
                        {
                            id: '1F-west',
                            url: '/images/1F-west.gif',
                            size: {width:1685, height:1771}
                        },
                        {
                            id: '1F-east',
                            url: '/images/1F-east.gif',
                            xy: {x:1685, y:0},
                            size: {width:1361, height:1772}
                        }
                    ]
                },
                second: {
                    label: '2F',
                    images: [
                        {
                            id: '2F',
                            url: '/images/2F.gif',
                            size: {width:3179, height:1728}
                        }
                    ]
                },

                seatsSmall: {
                    label: 'Seat Map - Small',
                    images: [
                        {
                            id: 'seats',
                            url: '/images/seatmap-small.jpg',
                            size: {width:265, height:165},
                            scale: 1
                        }
                    ]
                },
                planeSeats: {
                    label: 'Plane Seat Map',
                    size: {width:4000, height:1500},
                    images: [
                        {
                            id: 'seats',
                            url: '/images/seatmap.jpg',
                            xy: {x:100, y:100},
                            size: {width:1715, height:500},
                            scale: 2
                        },
                        {
                            id: 'seats2',
                            url: '/images/seatmap-closeup.png',
                            xy: {x:670, y:500},
                            size: {width:700, height:354},
                            zoom: -1,
                            scale: 1
                        }
                    ]
                },
                map: {
                    label: 'MAP',
                    layer: 'https://mt0.google.com/vt/lyrs=m&hl=zh-TW&x={x}&y={y}&z={z}'
                }
            }}
            baseLayer={baseLayer}
            onBaseLayerChange={this.handleBaseLayerChange}
            onClick={(id, info)=>{
                console.log('clicked', id, info)
            }}
            onSelectionChange={(id, info)=>{
                console.log('selected', id, info)
            }}
            onViewChange={(info)=>{
                console.log('view changed', info)
            }}
            symbolOptions={_.get(SAMPLES, [baseLayer, 'symbolOptions'])}
            clusterOptions={_.get(SAMPLES, [baseLayer, 'clusterOptions'])} />
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

