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
            layout: 'standard',
            dragMode: 'pan',
            regionType: 'rectangle',
            options: {},
            selection: [],
            event: '',
            action: '',
            triggered: null
        }
    },
    componentDidMount() {
        const heatmapOptions = {
            minOpacity: 0,
            blur: 0.75,
            radius: 2,
            gradient: {
                0.07: 'rgba(0, 255, 255, 0)',
                0.14: 'rgba(0, 255, 255, 1)',
                0.21: 'rgba(0, 191, 255, 1)',
                0.28: 'rgba(0, 127, 255, 1)',
                0.35: 'rgba(0, 63, 255, 1)',
                0.42: 'rgba(0, 0, 255, 1)',
                0.49: 'rgba(0, 0, 223, 1)',
                0.56: 'rgba(0, 0, 191, 1)',
                0.63: 'rgba(0, 0, 159, 1)',
                '0.70': 'rgba(0, 0, 127, 1)',
                0.77: 'rgba(63, 0, 91, 1)',
                0.84: 'rgba(127, 0, 63, 1)',
                0.91: 'rgba(191, 0, 31, 1)',
                0.98: 'rgba(255, 0, 0, 1)'
            }
        }

        const gis = new Gis('map', {
            baseMap: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
            // correspond to leaflet map options
            layout: 'standard',
            mapOptions: {
                center: [46.777128, 103.505101],
                zoom: 4,
                doublieClickZoom: false
            },
            heatmapOptions
        }, DATA.set2)

        this.gis = gis
        this.defaultHeatmap = _.cloneDeep(heatmapOptions)

        gis.on('click', (e, id) => {
            this.setState({
                event: 'click',
                triggered: {id, symbol:id ? gis.getSymbol(id) : null}
            })
        })

        gis.on('selectionChange', (e, ids) => {
            const selectedSymbols = _.isPlainObject(gis.getSymbol(ids))
                                    ? [gis.getSymbol(ids)]
                                    : gis.getSymbol(ids)

            gis.setSymbol(_.map(selectedSymbols, s => { return {...s, firstname:'Tom'} }))

            this.setState({
                selection: ids,
                event: 'selectionChange'
            })
        })

        this.setState({
            options: _.get(this.gis, 'heatmap.cfg', {})
        })
    },
    changeLayout() {
        let gis = this.gis
        let nextLayout = (this.state.layout === 'standard') ? 'heatmap' : 'standard'

        gis.setLayout(nextLayout)
        this.setState({
            layout: nextLayout
        })
    },
    changeDragMode(e) {
        let mode = e.target.value.split('-')
        this.gis.setDragMode(mode[0], mode[1] || null)

        this.setState({
            dragMode: mode[0],
            regionType: mode[1] || 'rectangle'
        })
    },
    setHeatmap(e) {
        let attr = e.target.textContent,
            style = {},
            event = null

        if (attr !== 'Reset' && attr !== 'gradient') {
            event = `Set heatmap ${attr}`
            style[attr] = Number(e.target.value)
        }
        else if (attr === 'gradient') {
            event = `Set heatmap ${attr}`
            style[attr] = {
                0.2: '#41b6c4',
                0.4: '#1d91c0',
                0.6: '#225ea8',
                0.8: '#253494',
                '1.0': '#081d58'
            }
        }
        else {
            event = 'Reset heatmap'
            style = this.defaultHeatmap
        }

        this.gis.setHeatmap(style)
        this.setState({
            action: event,
            options: this.gis.heatmap.cfg
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
    render() {
        return <div className='c-flex c-gis'>
            <div id='map' className='map' />
            <div className='c-flex fdc map-func'>
                <div className='c-flex fdc'>
                    <h4>Set Map</h4>
                    <button onClick={this.changeLayout}>Standard / Heatmap</button>
                    <button onClick={this.changeDragMode} value='pan'>Pan</button>
                    <button onClick={this.changeDragMode} value='region-circle'>Cicle Select</button>
                    <button onClick={this.changeDragMode} value='region-rectangle'>Rectangle Select</button>
                </div>
                <div className='c-flex fdc'>
                    <h4>Set Heatmap</h4>
                    <button onClick={this.loadSymbols} value={'set1'}>Load Symbols 1</button>
                    <button onClick={this.loadSymbols} value={'set2'}>Load Symbols 2</button>
                    <button onClick={this.setHeatmap} value={0.1}>minOpacity</button>
                    <button onClick={this.setHeatmap} value={1}>blur</button>
                    <button onClick={this.setHeatmap} value={3}>radius</button>
                    <button onClick={this.setHeatmap}>gradient</button>
                    <button onClick={this.setHeatmap}>Reset</button>
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