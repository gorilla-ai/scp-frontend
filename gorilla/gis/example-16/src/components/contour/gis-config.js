import { contour } from '@json/demo-state.json';


export const DefaultState = {
  layout: 'standard',
  dragMode: 'pan',
  regionType: null
};

export const { SetMap, Manipulations } = contour;

export default {
  ...DefaultState,
  baseMap: {
    url: 'https://mt{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3']
  },
  mapOptions: {
    center: [25.0400826, 121.5119547],
    zoom: 10,
    doublieClickZoom: false
  }
};
