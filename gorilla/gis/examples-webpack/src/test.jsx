/**
 * Check out:
 * https://github.com/Igor-Vladyka/leaflet.motion
 * https://github.com/ewoken/Leaflet.MovingMarker
 * From: https://leafletjs.com/plugins.html
 */
import React from 'react';
// import Gis from 'gis';
// import _ from 'lodash';
import L from 'leaflet';
// import 'leaflet.motion/dist/leaflet.motion';


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
    // seqGroup: null
  };

  componentDidMount() {
    this.map = L.map('map').setView([23.5789, 121.0205], 8);
    const baseMap = {
      // url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      url: 'https://mt0.google.com/vt/lyrs=m&hl=zh-TW&x={x}&y={y}&z={z}',
      subdomains: ['a', 'b', 'c'],
      // attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    };

    const bikeIcon = L.icon({
      iconUrl: '/images/marker-bike-green-shadowed.png',
      iconSize: [25, 39],
      iconAnchor: [12, 39],
      shadowUrl: null
    });

    L.tileLayer(baseMap.url, {
      subdomains: baseMap.subdomains,
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'your.mapbox.access.token'
    }).addTo(this.map);

    // const options = {
    //   draw: {
    //     circle: false, // Turns off this drawing tool
    //     rectangle: false,
    //     marker: false,
    //     circlemarker: false,
    //     polyline: false,
    //     polygon: false
    //   }
    // };

    // const drawControl = new L.Control.Draw(options);
    // this.map.addControl(drawControl);

    // const marker = L.marker([23.5789, 121.0205]).addTo(this.map);
    const marker = L.marker([51.5, -0.09]).addTo(this.map);

    const pointA = new L.LatLng(22.588654394218814, 118.90477120123329);
    const pointB = new L.LatLng(22.1823184841715, 123.47366161133968);
    const pointList = [pointA, pointB];

    this.firstpolyline = new L.Polyline(pointList, {
      color: 'red',
      weight: 3,
      opacity: 0.5,
      smoothFactor: 1
    });
    this.firstpolyline.addTo(this.map);

    this.firstpolyline.addLatLng({ lat: 24.145500459582394, lng: 120.6730685902289 });

    function onMapClick(e) {
      log.info(e.latlng);
      log.info(e.latlng.toString());
    }

    this.map.on('click', onMapClick);
  }

  /* createDraw = () => {
    // Initialise the FeatureGroup to store editable layers
    const editableLayers = new L.FeatureGroup();
    this.map.addLayer(editableLayers);

    const options = {
      position: 'topleft',
      draw: {
        polygon: {
          allowIntersection: false, // Restricts shapes to simple polygons
          drawError: {
            color: '#e1e100', // Color the shape will turn when intersects
            message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
          },
          shapeOptions: {
            color: '#97009c'
          }
        },
        polyline: {
          shapeOptions: {
            color: '#f357a1',
            weight: 10
          }
        },
        // disable toolbar item by setting it to false
        // polyline: true,
        circle: true, // Turns off this drawing tool
        // polygon: true,
        marker: true,
        rectangle: true,
      },
      edit: {
        featureGroup: editableLayers, // REQUIRED!!
        remove: true
      }
    };

    // Initialise the draw control and pass it the FeatureGroup of editable layers
    const drawControl = new L.Control.Draw(options);
    this.map.addControl(drawControl);

    const editableLayers2 = new L.FeatureGroup();
    this.map.addLayer(editableLayers2);

    this.map.on('draw:created', (e) => {
      const type = e.layerType;
      const { layer } = e;

      log.info('draw:created...', type);

      layer.bindPopup(`A ${type} !`);

      editableLayers2.addLayer(layer);
      layer.openPopup();
    });
  } */

  allStart = () => {
    this.seqGroup.motionStart();
    // this.seqGroup2.motionStart();
  }

  allStop = () => {
    this.seqGroup.motionStop();
    // this.seqGroup2.motionStop();
  }

  allPause = () => {
    this.seqGroup.motionPause();
    // this.seqGroup2.motionPause();
  }

  allResume = () => {
    this.seqGroup.motionResume();
    // this.seqGroup2.motionResume();
  }

  allToggle = () => {
    this.seqGroup.motionToggle();
    // this.map.removeLayer(this.firstpolyline);
    // console.log(this.map)
    this.firstpolyline.setLatLngs([
      { lat: 24.145500459582394, lng: 120.6730685902289 },
      { lat: 25.047866076041977, lng: 121.5172612943925 },
      { lat: 22.1823184841715, lng: 123.47366161133968 }
    ]);
    // this.seqGroup2.motionToggle();
    // for (let i in this.map._layers) {
    //   if(this.map._layers[i]._path != undefined) {
    //     console.log(this.map._layers[i]);
    //   }
    // }
  }

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
            <button type="button" onClick={this.allStart} value="set1">Start</button>
            <button type="button" onClick={this.allStop} value="set2">Stop</button>
            <button type="button" onClick={this.allPause}>Pause</button>
            <button type="button" onClick={this.allResume}>Resume</button>
            <button type="button" onClick={this.allToggle}>Toggle</button>
          </div>
        </div>
      </div>
    );
  }
};

export default () => (
  <div>{_.map(Examples, (example, key) => (React.createElement(createExample(example, key), { key })))}</div>
);
