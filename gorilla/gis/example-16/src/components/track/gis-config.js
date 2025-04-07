import PNG_HOME from '@images/home.png';
import PNG_MOBILE_SMALL from '@images/mobile_small.png';

import { track } from '@json/demo-state.json';


export const DefaultState = {
  layout: 'standard',
  dragMode: 'pan',
  regionType: null
};

export const { SetMap, Manipulations } = track;

export default {
  ...DefaultState,
  baseMap: {
    url: 'https://mt{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3']
  },
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
          iconUrl: PNG_HOME,
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
    }
  }],
  symbolOptions: [{
    match: { type: 'marker' },
    props: {
      className: 'normal',
      icon: PNG_MOBILE_SMALL
    }
  }, {
    match: { type: 'circle' },
    props: { tooltip: symObj => (`Circle ${symObj.id}`) }
  }]
};
