

import { heatmap } from '@json/demo-state.json';


export const DefaultState = {
  layout: 'heatmap',
  dragMode: 'pan',
  regionType: null,
  heatmapOptions: {
    radius: 2,
    maxOpacity: 0.8,
    minOpacity: 0,
    blur: 0.75,
    scaleRadius: true,
    useLocalExtrema: false,
    latField: 'lat',
    lngField: 'lng',
    valueField: 'intensity',
    gradient: {
      '0.07': 'rgba(0, 255, 255, 0)',
      '0.14': 'rgba(0, 255, 255, 1)',
      '0.21': 'rgba(0, 191, 255, 1)',
      '0.28': 'rgba(0, 127, 255, 1)',
      '0.35': 'rgba(0, 63, 255, 1)',
      '0.42': 'rgba(0, 0, 255, 1)',
      '0.49': 'rgba(0, 0, 223, 1)',
      '0.56': 'rgba(0, 0, 191, 1)',
      '0.63': 'rgba(0, 0, 159, 1)',
      '0.70': 'rgba(0, 0, 127, 1)',
      '0.77': 'rgba(63, 0, 91, 1)',
      '0.84': 'rgba(127, 0, 63, 1)',
      '0.91': 'rgba(191, 0, 31, 1)',
      '0.98': 'rgba(255, 0, 0, 1)'
    },
    min: 0,
    max: 1,
    container: {}
  }
};

export const { SetMap, SetHeatmap } = heatmap;

export default {
  ...DefaultState,
  baseMap: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
  mapOptions: {
    center: [40.200057,140.4718902],
    zoom: 7,
    minZoom: 7,
    doublieClickZoom: false
  }
}
