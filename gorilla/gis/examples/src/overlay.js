import React from 'react'
import Gis from 'gis'
import _ from 'lodash'

import createExample from './example-factory'
import set1 from '../mock/events-1.json'
import set2 from '../mock/events-2.json'

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
            triggered: null,
            zoomInfo: {}
        }
    },
    componentDidMount() {
        const container = document.getElementById('map')
        const height = container.clientHeight
        const width = container.clientWidth

        const gis = new Gis('map', {
            baseImage: [
                {id:'B1', url:'../images/daan_B1.png', xy:{y:0, x:0}, size:{width:width/2, height}, zoom:3},
                {id:'B2', url:'../images/daan_B2.png', xy:{y:0, x:width/2}, size:{width:width/2, height}}
            ],
            // correspond to leaflet map options
            mapOptions: {
                doublieClickZoom: false,
                crs: L.CRS.Simple,
                minZoom: 0
            },
            measureOptions: {
                color: '#000000',
                pointerTooltip: ((distance, latlng) => {
                    return `YX: ${parseFloat(latlng[0]).toPrecision(3)}/${parseFloat(latlng[1]).toPrecision(3)}`
                }),
                endTooltip: ((distance) => {
                    return `${parseFloat(distance).toPrecision(2)} units`
                }),
                hint: true
            }
        }, DATA.set2)

        gis.setMaxBounds({lat:0, lng:0}, {lat:height, lng:width}, true)

        gis
            .on('contextmenu', (e, id) => {
                this.setState({
                    event: 'contextmenu',
                    triggered: {id, symbol:gis.getSymbol(id)}
                })
            })
            .on('click', (e, id) => {
                this.setState({
                    event: 'click',
                    triggered: {id, symbol:id ? gis.getSymbol(id) : null}
                })
            })
            .on('zoomend', (e, zoomInfo) => {
                this.setState({
                    event: 'zoomend',
                    zoomInfo
                })
            })
            .on('selectionChange', (e, ids) => {
                const selectedSymbols = _.isPlainObject(gis.getSymbol(ids))
                                    ? [gis.getSymbol(ids)]
                                    : gis.getSymbol(ids)

                this.setState({
                    selection: {region:e.bounds || _.pick(e, ['radius', 'layerPoint']), ids},
                    event: 'selectionChange'
                })
            })
            .on('measureend', (e, {latlng, latlngs, distance}) => {
                this.setState({
                    pathInfo: {
                        latlng,
                        latlngs,
                        distance: `${distance} meters`
                    },
                    event: 'measureend'
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
                </div>
                <div className='c-flex fdc'>
                    <h4>Manipulate</h4>
                    <button onClick={this.loadSymbols} value={'set1'}>Load Symbols 1</button>
                    <button onClick={this.loadSymbols} value={'set2'}>Load Symbols 2</button>
                    <button onClick={this.zoomToFitSelection}>Set View To Selected</button>
                    <button onClick={this.filterMarkers}>Show Only Markers</button>
                    <button onClick={this.showSymbols} value='circle'>Show Circles</button>
                    <button onClick={this.hideSymbols} value='circle'>Hide Circles</button>
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