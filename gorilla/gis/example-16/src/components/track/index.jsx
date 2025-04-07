import React, { useCallback } from 'react';

import { ListItem, ListItemText } from '@material-ui/core';

import { useStateViewer } from 'services/state';
import { useGis, useMapData } from 'services/customs/gis';
import GisDashboard from 'components/commons/gis-dashboard';

import MapOptions, { DefaultState, SetMap, Manipulations } from './gis-config';


// TODO: Custom Functions
function useDrawerEvents(gis, { layout }, dispatch) {
  const useNvlFn = useCallback(fn => !gis ? () => {} : fn, [ gis ]);
  const MapData = useMapData();

  return {
    handleDragModeChange: useCallback(({ value }) => useNvlFn(() => {
      const [ dragMode, regionType = null ] = value.split('-');

      gis.setDragMode(dragMode, regionType);
      dispatch({ dragMode, regionType });
    }), [ gis, dispatch ]),

    handleLayoutChange: useCallback(() => useNvlFn(() => {
      const nextLayout = layout === 'standard' ? 'track' : 'standard';
  
      gis.setLayout(nextLayout);
      dispatch({ layout: nextLayout });
    }), [ gis, layout, dispatch ]),

    handleSetTrackStyle: useCallback(() => useNvlFn(() => {
      gis.setTrack({ color: 'purple' });
    }), [ gis ]),

    handleLoadSymbols: useCallback(({ value }) => useNvlFn(() => {
      gis.setSymbol(MapData[value]);

      dispatch({
        action: `Load symbols ${ value }`,
        visible: gis.visible
      });
    }), [ gis, dispatch ]),

    handleHideSymbols: useCallback(() => useNvlFn(() => {
      gis.hideSymbol(gis.selected);
      dispatch({ visible: gis.visible });
    }), [ gis, dispatch ]),

    handleZoomToFitSelection: useCallback(() => useNvlFn(() => {
      gis.zoomToFit(gis.getSelection());
    }), [ gis ]),

    handleFilterTrack: useCallback(options => useNvlFn(() => {
      gis.filterTrack(options);
    }), [ gis ]),

    handleClear: useCallback(() => useNvlFn(() => {
      gis.clear();
      dispatch({ visible: gis.visible });
    }), [ gis, dispatch ])
  };
}


// TODO: Component
export default function Track() {
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
