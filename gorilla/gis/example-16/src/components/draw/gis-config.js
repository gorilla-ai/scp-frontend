import { draw } from '@json/demo-state.json';


export const DefaultState = {
  layout: 'standard',
  dragMode: 'pan',
  regionType: null
};

export const { DragMode, DrawMode, Manipulations } = draw;

export default {
  ...DefaultState,
  baseMap: {
    url: 'https://mt{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3']
  },
  mapOptions: {
    center: [46.777128, 103.505101],
    zoom: 2,
    doublieClickZoom: false
  }
};
