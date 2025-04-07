import React from 'react'
import Gis from 'gis'
import _ from 'lodash'

import createExample from './example-factory'
import CASES from '../mock/cib-case.json'

const DATA = _(CASES.hits.hits)
            .filter(el => { return el._source.OccurLatitude && el._source.OccurLongitude })
            .map(el => {
                return {
                    id: el._id,
                    type: 'marker',
                    latlng: [el._source.OccurLatitude, el._source.OccurLongitude]
                }
            })
            .take(300)
            .value()

let Examples = {}

Examples.GIS = React.createClass({
    getInitialState() {
        return {
            layout: 'standard',
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
                center: [25.0400826, 121.5119547],
                zoom: 10,
                doublieClickZoom: false
            }
        }, DATA)

        gis.on('click', (e, id) => {
            this.setState({
                event: 'click',
                triggered: {id, symbol:id ? gis.getSymbol(id) : null}
            })
        })

        gis.on('selectionChange', (e, ids) => {
            this.setState({
                selection: {region:e.bounds || _.pick(e, ['radius', 'layerPoint']), ids}
            })
        })

        this.gis = gis

        this.setState({
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
    clear() {
        const gis = this.gis
        gis.clear()
        this.setState({
            action: 'Clear',
            visible: gis.visible
        })
    },
    changeLayout() {
        const gis = this.gis
        const nextLayout = (this.state.layout === 'standard') ? 'contour' : 'standard'

        gis.setLayout(nextLayout)
        this.setState({
            layout: nextLayout
        })
    },
    render() {
        return <div className='c-flex c-gis'>
            <div id='map' className='map' />
            <div className='c-flex fdc map-func'>
                <div className='c-flex fdc'>
                    <h4>Set Map</h4>
                    <button onClick={this.changeLayout}>Standard / Contour</button>
                </div>
                <div className='c-flex fdc'>
                    <h4>Manipulate</h4>
                    <button onClick={this.showSymbols}>Show All Markers</button>
                    <button onClick={this.hideSymbols}>Hide All Markers</button>
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