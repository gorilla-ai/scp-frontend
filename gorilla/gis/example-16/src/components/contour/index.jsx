import React, { useCallback } from 'react';
import _ from 'lodash';

import { ListItem, ListItemText } from '@material-ui/core';

import { useStateViewer } from 'services/state';
import { useGis, useMapData } from 'services/customs/gis';
import GisDashboard from 'components/commons/gis-dashboard';

import MapOptions, { DefaultState, SetMap, Manipulations } from './gis-config';


// TODO: Custom Functions
function useDrawerEvents(gis, { layout }, dispatch) {
  const useNvlFn = useCallback(fn => !gis ? () => {} : fn, [ gis ]);

  return {
    handleLayoutChange: useCallback(() => useNvlFn(() => {
      const nextLayout = layout === 'standard' ? 'contour' : 'standard';
  
      gis.setLayout(nextLayout);
      dispatch({ layout: nextLayout });
    }), [ gis, layout, dispatch ]),

    handleSetSymbolsVisibled: useCallback(({ asShow }) => useNvlFn(() => {
      gis[asShow ? 'showSymbol' : 'hideSymbol']();
      dispatch({ visible: gis.visible });
    }), [ gis, dispatch ])
  };
}


// TODO: Component
export default function Contour() {
  const [ state, dispatch ] = useStateViewer(DefaultState);
  const MapData = useMapData();
  const { gis, handleMapRender } = useGis(MapOptions, { dispatch }, MapData.set4);
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

      manipulations: {
        groupName: 'Manipulations',
        keyProp: 'text',
        items: Manipulations,
        render: ({ text, handleFn, ...eventParams }) => (
          <ListItem button onClick={ drawerItemEvents[ handleFn ](eventParams) }>
            <ListItemText primary={ text } />
          </ListItem>
        )
      }
    }} />
  );
}
