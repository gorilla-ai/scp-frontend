/**
 * Check out:
 * https://github.com/Igor-Vladyka/leaflet.motion
 * https://github.com/ewoken/Leaflet.MovingMarker
 * From: https://leafletjs.com/plugins.html
 */
import React from 'react';
import Gis from 'gis';
import _ from 'lodash';

// const log = logger(cfg.env, loglevel, cfg.log);

import createExample from './example-factory';
import set1 from '../mock/events-1.json';
import set2 from '../mock/events-2.json';

const log = require('loglevel').getLogger('GIS/motion');

const DATA = {
  set1,
  set2
};

const Examples = {};

Examples.GIS = class extends React.Component {
  state = {
    layout: 'standard',
    dragMode: 'region',
    regionType: 'circle',
    selection: [],
    event: '',
    triggered: null
  };

  componentDidMount() {
    const { layout, dragMode, regionType } = this.state;
    const gis = new Gis('map', {
      baseMap: {
        url: 'https://mt{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
        subdomains: ['0', '1', '2', '3']
      },
      // correspond to leaflet map options
      layout,
      dragMode,
      regionType,
      mapOptions: {
        center: [46.777128, 103.505101],
        zoom: 4,
        doublieClickZoom: false
      },
      trackOptions: [{
        props: {
          directed: true,
          showInvisible: true,
          showOngoing: true,
          startSymbol: {
            icon: {
              iconUrl: 'images/home.png',
              iconSize: [25, 25]
            }
          },
          endSymbol: {
            id: 'helloEnd',
            type: 'spot',
            selectedProps: {
              backgroundColor: 'red'
            }
          }
          // hideMidPoints: true
        }
      }],
      symbolOptions: [{
        match: { type: 'marker' },
        props: {
          className: 'normal',
          icon: item => ((item.data && item.data.thing === 'person') ? '/images/mobile_small.png' : '/images/mobile_small.png')
        }
      }, {
        match: { type: 'circle' },
        props: { tooltip: symObj => (`Circle ${symObj.id}`) }
      }]
    }, DATA.set2);

    gis.on('click', (e, id) => {
      this.setState({
        event: 'click',
        triggered: { id, symbol: id ? gis.getSymbol(id) : null }
      });
    });

    // Bind events to all ongoing nodes through props:{isOngoingNode:true},
    // or any other attributes like id, type, props defined in trackOptions.props.endSymbol
    gis.on('contextmenu', { props: { isOngoingNode: true } }, (e, id) => {
      log.info('contenxtmenu clicke.....');
      this.setState({
        event: 'contextmenu',
        triggered: { id, symbol: id ? gis.getSymbol(id) : null }
      });
    });

    gis.on('selectionChange', (e, ids) => {
      log.info('selectionChange clicke.....');
      // const selectedSymbols = _.isPlainObject(gis.getSymbol(ids))
      //   ? [gis.getSymbol(ids)]
      //   : gis.getSymbol(ids);

      // gis.setSymbol(_.map(selectedSymbols, s => { return {...s, firstname:'Tom'} }))

      this.setState({
        selection: ids
      });
    });

    this.gis = gis;
  }

  changeLayout = () => {
    const { gis } = this;
    const { layout } = this.state;
    const nextLayout = (layout === 'standard') ? 'track' : 'standard';

    gis.setLayout(nextLayout);

    this.setState({
      layout: nextLayout
    });
  };

  changeDragMode = (e) => {
    const mode = e.target.value.split('-');
    this.gis.setDragMode(mode[0], mode[1] || null);

    this.setState({
      dragMode: mode[0],
      regionType: mode[1] || 'rectangle'
    });
  };

  setTrackStyle = () => {
    this.gis.setTrack({
      color: 'purple'
    });
  };

  loadSymbols = (e) => {
    const { gis } = this;

    gis.setSymbol(DATA[e.target.value]);

    this.setState({
      action: `Load symbols ${e.target.value}`,
      visible: gis.visible
    });
  };

  zoomToFitSelection = () => {
    const { gis } = this;
    const selected = gis.getSelection();

    gis.zoomToFit(selected);
  };

  filterTrack = (track) => {
    const { gis } = this;
    gis.filterTrack(track);
  };

  hideSymbol = () => {
    this.gis.hideSymbol(this.gis.selected);
    // this.gis.setGisInterval([1495676997286, 1502000000000])
    // this.gis.setGisInterval([1496499720000, 1496509210000])
    //         .filterSymbol(sbl => (sbl.type === 'marker' || sbl.type === 'spot'), this.gis.interval)
  };

  clear = () => {
    this.gis.clear();
  };

  render() {
    return (
      <div className="c-flex c-gis">
        <div id="map" className="map" />
        <div className="c-flex fdc map-func">
          <div className="c-flex fdc">
            <h4>Set Map</h4>
            <button type="button" onClick={this.changeLayout}>Standard / Track</button>
            <button type="button" onClick={this.changeDragMode} value="pan">Pan</button>
            <button type="button" onClick={this.changeDragMode} value="region-circle">Cicle Select</button>
            <button type="button" onClick={this.changeDragMode} value="region-rectangle">Rectangle Select</button>
            <button type="button" onClick={this.setTrackStyle}>Set Track Style</button>
          </div>
          <div className="c-flex fdc">
            <h4>Manipulate</h4>
            <button type="button" onClick={this.loadSymbols} value="set1">Load Symbols 1</button>
            <button type="button" onClick={this.loadSymbols} value="set2">Load Symbols 2</button>
            <button type="button" onClick={this.hideSymbol}>Hide Selected</button>
            <button type="button" onClick={this.zoomToFitSelection}>Set View To Selected</button>
            <button type="button" onClick={this.filterTrack.bind(this, { id: 'mobile_0912345678' })}>Filter Track 1</button>
            <button type="button" onClick={this.filterTrack.bind(this, { id: 'robbery_track_2' })}>Filter Track 2</button>
            <button type="button" onClick={this.filterTrack.bind(this, { type: 'track' })}>Show All Track</button>
            <button type="button" onClick={this.clear}>Clear</button>
          </div>
        </div>
      </div>
    );
  }
};

export default () => (
  <div>{_.map(Examples, (example, key) => (React.createElement(createExample(example, key), { key })))}</div>
);
