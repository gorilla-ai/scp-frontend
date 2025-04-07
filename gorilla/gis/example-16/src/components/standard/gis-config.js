import PNG_BS_SMALL from '@images/bs_small.png';
import PNG_MOBILE_SMALL from '@images/mobile_small.png';
import PNG_IP from '@images/ip.png';
import PNG_SUSPECT from '@images/suspect.png';
import PNG_MOBILE from '@images/mobile.png';
import PNG_BS from '@images/bs.png';

import { standard } from '@json/demo-state.json';

export const DefaultState = {
  layout: 'standard',
  dragMode: 'pan',
  regionType: null
};

export const { DragModes, Manipulations, BasicEvents } = standard;

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
  },
  symbolOptions: [{
    match: { type: 'marker' },
    props: {
      className: 'normal',
      icon: ({ cluster }) => {
        switch (cluster) {
          case 'basestation' : return PNG_BS_SMALL;
          case 'phone'       : return PNG_MOBILE_SMALL;
          case 'wifi'        : return PNG_IP;
          default            : return PNG_SUSPECT;
        }
      }
    }
  }, {
    match: { type: 'circle' },
    props: {
      tooltip: symObj => (`Circle ${symObj.id}`)
    }
  }],
  measureOptions: {
    color: '#000000',
    pointerTooltip: ((distance, latlng) => (`LatLng: ${parseFloat(latlng[0]).toPrecision(3)}/${parseFloat(latlng[1]).toPrecision(3)}`)),
    endTooltip: (distance => (`${parseFloat(distance).toPrecision(2)} meters`)),
    hint: true
  },
  clusterOptions: [{
    props: {
      symbol: {
        selectedProps: { className: 'selectedCluster' }
      }
    }
  }, {
    id: true,
    props: {
      symbol: { // You can set the cluster node as marker or spot. Default is marker
        type: 'spot',
        width: 15,
        height: 15,
        selectedProps: { background: 'orange' }
      }
    }
  }, {
    id: 'phone',
    props: {
      showCoverageOnHover: true,
      symbol: {
        icon: PNG_MOBILE,
        label: symbol => (`Mobi * ${symbol.data.count}`)
      }
    }
  }, {
    id: 'basestation',
    props: {
      symbol: { icon: PNG_BS }
    }
  }, {
    id: 'wifi',
    props: {
      symbol: { icon: PNG_IP }
    }
  }]
};
