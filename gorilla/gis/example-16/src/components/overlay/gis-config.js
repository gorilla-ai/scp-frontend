import PNG_DAAN_B from '@images/daan_B.png';

import { overlay } from '@json/demo-state.json';


export const DefaultState = {
  layout: 'standard',
  dragMode: 'pan',
  regionType: null
};

export const { DragMode, Manipulations } = overlay;

export default function(mapId, el) {
  const height = el.clientHeight;
  const width = el.clientWidth;

  return {
    ...DefaultState,
    baseImage: [
      {id: 'B', url: PNG_DAAN_B, size: { width: 9560 * height / 5000, height }}
    ],
    mapOptions: {
      doublieClickZoom: false,
      crs: L.CRS.Simple,
      minZoom: 0
    },
    measureOptions: {
      color: '#000000',
      hint: true,
      pointerTooltip: (distance, latlng) => `YX: ${parseFloat(latlng[0]).toPrecision(3)}/${parseFloat(latlng[1]).toPrecision(3)}`,
      endTooltip: (distance) => `${parseFloat(distance).toPrecision(2)} units`
    }
  };
}
