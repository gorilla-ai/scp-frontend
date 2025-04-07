import React from 'react'
import Gis from 'gis'
import _ from 'lodash'

import createExample from './example-factory'
import set1 from '../mock/events-1.json'
import set2 from '../mock/events-2.json'

let log = require('loglevel').getLogger('src/standard')

const CLUSTER = ['basestation', 'phone', 'wifi', true]

const DATA = {
    set1,
    set2
}

let Examples = {}

Examples.GIS = React.createClass({
    getInitialState() {
        return {
            dragMode: 'pan',
            regionType: 'rectangle',
            visible: [],
            selection: null,
            event: '',
            action: '',
            triggered: null
        }
    },
    componentDidMount() {
        const gis = new Gis('map', {
            baseMap: {
                url: 'https://mt{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
                subdomains: ['0', '1', '2', '3']
            },
            // correspond to leaflet map options
            mapOptions: {
                center: [46.777128, 103.505101],
                zoom: 2,
                doublieClickZoom: false
            },
            symbolOptions: [{
                match: {type:'marker'},
                props: {
                    className: 'normal',
                    icon: (item) => {
                        const cluster = item.cluster
                        switch (cluster) {
                            case 'basestation':
                                return '/images/bs_small.png'
                                break
                            case 'phone':
                                return '/images/mobile_small.png'
                                break
                            case 'wifi':
                                return '/images/ip.png'
                                break
                            default:
                                return '/images/suspect.png'
                        }
                    }
                }
            }, {
                match: {type:'circle'},
                props: {
                    tooltip: (symObj) => {
                        return `Circle ${symObj.id}`
                    }
                }
            }],
            measureOptions: {
                color: '#000000',
                pointerTooltip: ((distance, latlng) => {
                    return `LatLng: ${parseFloat(latlng[0]).toPrecision(3)}/${parseFloat(latlng[1]).toPrecision(3)}`
                }),
                endTooltip: ((distance) => {
                    return `${parseFloat(distance).toPrecision(2)} meters`
                }),
                hint: true
            },
            drawOptions: {
                // defaultControl: true
                defaultControl: false,
                locale: {
                    draw: {
                        handlers: {
                            circle: {
                                tooltip: {
                                    start: '點擊後拖曳畫圓'
                                },
                                radius: '半徑'
                            }
                        }
                    }   
                }
            },
            clusterOptions: [
                {
                    props: {
                        symbol: {
                            selectedProps: {
                                className: 'selectedCluster'
                            }
                        }
                    }
                },
                {
                    id: true,
                    props: {
                        symbol: {
                            // You can set the cluster node as marker or spot. Default is marker
                            type: 'spot',
                            width: 15,
                            height: 15,
                            selectedProps: {
                                background: 'orange'
                            }
                        }
                    }
                },
                {
                    id: 'phone',
                    props: {
                        showCoverageOnHover: true,
                        symbol: {
                            icon: '/images/mobile.png',
                            label: symbol => { return `Mobi * ${symbol.data.count}` }
                        }
                    }
                },
                {
                    id: 'basestation',
                    props: {
                        symbol: {
                            icon: '/images/bs.png'
                        }
                    }
                },
                {
                    id: 'wifi',
                    props: {
                        symbol: {
                            icon: '/images/ip.png'
                        }
                    }
                }
            ]
        }, DATA.set2)

        // To remove specific event handler later, need to declare the function
        const ctxHandler = (e, ids, dataObj) => {
            log.info('contextmenu', ids, dataObj)
            this.setState({
                event: 'contextmenu',
                triggered: {ids, symbol:ids ? gis.getSymbol(ids) : null}
            })
        }

        gis
            .on('contextmenu', ctxHandler)
            .off('contextmenu', {type:'polyline'}, ctxHandler)
            .on('click', (e, ids, dataObj) => {
                log.info('click', ids, dataObj)
                this.setState({
                    event: 'click',
                    triggered: {ids, symbol:ids ? gis.getSymbol(ids) : null}
                })
            })
            .on('dblclick', (e, ids, dataObj) => {
                log.info('dblclick', ids, dataObj)
                this.setState({
                    event: 'dblclick',
                    triggered: {ids, symbol:ids ? gis.getSymbol(ids) : null}
                })
            })
            .on('mouseover', {props:{cluster:'wifi'}}, (e, ids, dataObj) => {
                log.info('mouseover', ids, dataObj)
                this.setState({
                    event: 'mouseover',
                    triggered: {ids, symbol:null}
                })
            })
            .on('selectionChange', (e, ids, dataObj) => {
                log.info('selectionChange', ids, dataObj)
                this.setState({
                    selection: {region:e.bounds || _.pick(e, ['radius', 'layerPoint']), ids},
                    event: 'selectionChange',
                    triggered: {ids}
                })
            })
            .on('measureend', (e, {latlng, latlngs, distance}) => {
                log.info('measureend', distance)
                this.setState({
                    pathInfo: {
                        latlng,
                        latlngs,
                        distance: `${distance} meters`
                    },
                    event: 'measureend'
                })
            })
            .on('create', (e, symbol) => {
                log.info('drawcreated', e, symbol)
                this.setState({
                    drawnSymbol: symbol.id,
                    event: 'drawcreated'
                })
            })
            .on('edit', (e, symbols) => {
                log.info('edit', e, symbols)
                this.setState({
                    drawnSymbol: _.keys(symbols),
                    event: 'edit'
                })
            })
            .on('editcontent', (e, symbol) => {
                log.info('editcontent', e, symbol)
                this.setState({
                    drawnSymbol: symbol.id,
                    event: 'editcontent'
                })
            })
            .on('delete', (e, symbols) => {
                log.info('delete', e, symbols)

                this.setState({
                    drawnSymbol: _.isArray(symbols) 
                                ? _.join(_.map(symbols, 'id'), ', ') : 
                                symbols.id,
                    event: 'delete'
                })
            })

        this.gis = gis
        this.setState({
            visible: this.gis.visible
        })
    },
    changeDragMode(e) {
        const mode = e.target.value.split('-')
        this.gis.setDragMode(mode[0], mode[1] || null)

        this.setState({
            dragMode: mode[0],
            regionType: mode[1] || 'rectangle'
        })
    },
    changeDrawType(e, drawConfig={}) {
        const type = _.get(e, 'target.value') || e
        this.gis.setDrawType(type, drawConfig)

        this.setState({
            drawType: type
        })
    },
    filterMarkers() {
        this.gis.filterSymbol((symbol) => {
            return symbol.type === 'marker'
        })

        this.setState({
            action: 'Filter markers',
            visible: this.gis.visible
        })
    },
    showSymbols(e) {
        if (e.target.value) {
            this.gis.showSymbol((symbol) => {
                return symbol.type === e.target.value
            })
        }
        else {
            this.gis.showSymbol()
        }

        this.setState({
            action: `Show ${e.target.value || 'all symbol'}s`,
            visible: this.gis.visible
        })
    },
    hideSymbols(e) {
        if (e.target.value) {
            this.gis.hideSymbol((symbol) => {
                return symbol.type === e.target.value
            })
        }
        else {
            this.gis.hideSymbol()
        }

        this.setState({
            action: `Hide ${e.target.value || 'all symbol'}s`,
            visible: this.gis.visible
        })
    },
    removeSymbols() {
        const {selection} = this.state
        const ids = this.gis.getSelection()
        this.gis.removeSymbol(ids)
        this.setState({
            action: `Remove selected ${ids} symbols`,
            visible: this.gis.visible,
            selection: {
                ...selection,
                ids: this.gis.selected
            }
        })
    },
    selectSymbols(e) {
        if (e.target.value) {
            this.gis.setSelection({type:e.target.value})
        }
        else {
            this.gis.setSelection(this.gis.visible)
        }

        this.setState({
            action: `Select ${e.target.value || 'all symbol'}s`
        })
    },
    selectGroup(e) {
        this.gis.setSelection({props:{group:e.target.value}})
        this.setState({
            action: `Select ${e.target.value || 'all symbol'}s`
        })
    },
    loadSymbols(e) {
        const gis = this.gis

        gis.setSymbol(DATA[e.target.value])

        this.setState({
            action: `Load symbols ${e.target.value}`,
            visible: gis.visible
        })
    },
    zoomToFitSelection() {
        const gis = this.gis,
            selected = gis.getSelection()

        gis.zoomToFit(selected)
    },
    clear() {
        const gis = this.gis
        gis.clear()
        this.setState({
            action: 'Clear',
            visible: gis.visible,
            selection: {}
        })
    },
    render() {
        return <div className='c-flex c-gis'>
            <div id='map' className='map' />
            <div className='c-flex fdc map-func'>
                <div className='c-flex fdc'>
                    <h4>Drag Mode</h4>
                    <button onClick={this.changeDragMode} value='pan'>Pan</button>
                    <button onClick={this.changeDragMode} value='region-circle'>Cicle Select</button>
                    <button onClick={this.changeDragMode} value='region-rectangle'>Rectangle Select</button>
                    <button onClick={this.changeDragMode} value='measure'>Measure</button>
                    <button onClick={this.changeDragMode} value='draw'>Draw</button>
                    <h4>Draw Type</h4>
                    <button onClick={this.changeDrawType} value='marker'>Draw Marker</button>
                    <button onClick={this.changeDrawType} value='spot'>Draw Spot</button>
                    <button onClick={this.changeDrawType} value='circle'>Draw Circle</button>
                    <button onClick={this.changeDrawType} value='rectangle'>Draw Rectangle</button>
                    <button onClick={this.changeDrawType} value='polyline'>Draw Polyline</button>
                    <button onClick={this.changeDrawType} value='polygon'>Draw Polygon</button>
                    <button onClick={this.changeDrawType.bind(null, 'edit', {editableIds:{type:'spot'}})}>Edit Draw</button>
                    <button onClick={this.changeDrawType} value='delete'>Delete Draw</button>
                </div>
                <div className='c-flex fdc'>
                    <h4>Manipulate</h4>
                    <button onClick={this.loadSymbols} value={'set1'}>Load Symbols 1</button>
                    <button onClick={this.loadSymbols} value={'set2'}>Load Symbols 2</button>
                    <button onClick={this.zoomToFitSelection}>Set View To Selected</button>
                    <button onClick={this.filterMarkers}>Show Only Markers</button>
                    <button onClick={this.showSymbols}>Show All Symbols</button>
                    <button onClick={this.hideSymbols}>Hide All Symbols</button>
                    <button onClick={this.selectSymbols} value='circle'>Select All Circles</button>
                    <button onClick={this.removeSymbols}>Remove Selected</button>
                    <button onClick={this.clear}>Clear</button>
                </div>
            </div>
        </div>
    }
})

export default React.createClass({
    render() {
        return <div>
            {
                _.map(Examples, (example, key)=>{
                    return React.createElement(createExample(example, key), {key})
                })
            }
        </div>
    }
})