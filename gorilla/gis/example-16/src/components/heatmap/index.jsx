import React, { useCallback } from 'react';
import _ from 'lodash';

import { ListItem, ListItemText } from '@material-ui/core';

import { useStateViewer } from 'services/state';
import { useGis, useMapData } from 'services/customs/gis';
import GisDashboard from 'components/commons/gis-dashboard';

import MapOptions, { DefaultState, SetMap, SetHeatmap } from './gis-config';


// TODO: Custom Functions
function useDrawerEvents(gis, { layout }, dispatch) {
  const useNvlFn = useCallback(fn => !gis ? () => {} : fn, [ gis ]);
  const MapData = useMapData();

  return {
    handleLayoutChange: useCallback(() => useNvlFn(() => {
      const nextLayout = layout === 'standard' ? 'heatmap' : 'standard';
  
      gis.setLayout(nextLayout);
      dispatch({ layout: nextLayout });
    }), [ gis, layout, dispatch ]),
    
    handleDragModeChange: useCallback(({ value }) => useNvlFn(() => {
      const [ dragMode, regionType = null ] = value.split('-');

      gis.setDragMode(dragMode, regionType);
      dispatch({ dragMode, regionType });
    }), [ gis, dispatch ]),

    handleLoadSymbols: useCallback(({ value }) => useNvlFn(() => {
      gis.setSymbol(MapData[value]);

      dispatch({
        action: `Load symbols ${ value }`,
        visible: gis.visible
      });
    }), [ gis, dispatch ]),

    handleSetHeatmap: useCallback(({ propName, value }) => useNvlFn(() => {
      switch (propName) {
        case 'gradient':
          gis.setHeatmap({
            gradient: {
              0.2: '#41b6c4',
              0.4: '#1d91c0',
              0.6: '#225ea8',
              0.8: '#253494',
              '1.0': '#081d58'
            }
          });
          break;
        case 'reset':
          gis.setHeatmap(DefaultState.heatmapOptions);
          break;
        default:
          gis.setHeatmap({ [ propName ]: value });
      }
      dispatch({ heatmapOptions: gis.heatmap.cfg });
    }), [ gis, dispatch ])
  };
}


// TODO: Component
export default function Heatmap() {
  const [ state, dispatch ] = useStateViewer(DefaultState);
  const { gis, handleMapRender } = useGis(MapOptions, { dispatch });
  const drawerItemEvents = useDrawerEvents(gis, state, dispatch);

  return (
    <GisDashboard state={ state } onMapRender={ handleMapRender } menus={{
      setMap: {
        groupName: 'Set Map',
        keyProp: 'text',
        items: SetMap,
        render: ({ text, handleFn, ...eventParams }) => (
          <ListItem button onClick={ drawerItemEvents[ handleFn ](eventParams) }>
            <ListItemText primary={ text } />
          </ListItem>
        )
      },

      setHeatmap: {
        groupName: 'Set Heatmap',
        keyProp: 'text',
        items: SetHeatmap,
        render: ({ text, handleFn, ...eventParams }) => (
          <ListItem button onClick={ drawerItemEvents[ handleFn ](eventParams) }>
            <ListItemText primary={ text } />
          </ListItem>
        )
      }
    }} />
  );
}
