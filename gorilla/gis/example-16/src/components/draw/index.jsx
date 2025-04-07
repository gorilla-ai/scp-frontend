import React, { useCallback } from 'react';

import { ListItem, ListItemText } from '@material-ui/core';

import { useStateViewer } from 'services/state';
import { useGis } from 'services/customs/gis';
import GisDashboard from 'components/commons/gis-dashboard';

import MapOptions, { DefaultState, DragMode, DrawMode, Manipulations } from './gis-config';


// TODO: Custom Functions
function useDrawerEvents(gis, dispatch) {
  const useNvlFn = useCallback(fn => !gis ? () => {} : fn, [ gis ]);

  return {
    handleDragModeChange: useCallback(({ value }) => useNvlFn(() => {
      const [ dragMode, regionType = null ] = value.split('-');

      gis.setDragMode(dragMode, regionType);
      dispatch({ dragMode, regionType, ...('draw' === dragMode ? { drawType: 'marker' } : {}) });
    }), [ gis, dispatch ]),

    handleDrawModeChange: useCallback(({ value, options = {} }) => useNvlFn(() => {
      gis.setDrawType(value, options);
      dispatch({ drawType: value });
    }), [ gis, dispatch ]),

    handleZoomToFitSelection: useCallback(() => useNvlFn(() => {
      gis.zoomToFit(gis.getSelection());
    }), [ gis ]),

    handleFilterMarkers: useCallback(() => useNvlFn(() => {
      gis.filterSymbol(symbol => symbol.type === 'marker');
      dispatch({ visible: gis.visible });
    }), [ gis, dispatch ]),

    handleSetSymbolsVisibled: useCallback(({ asShow }) => useNvlFn(() => {
      gis[asShow ? 'showSymbol' : 'hideSymbol']();
      dispatch({ visible: gis.visible });
    }), [ gis, dispatch ]),

    handleClear: useCallback(() => useNvlFn(() => {
      gis.setDragMode('pan');
      gis.clear();

      dispatch({
        dragMode: 'pan',
        regionType: null,
        visible: gis.visible
      });
    }), [ gis, dispatch ])
  };
}


// TODO: Component
export default function Draw() {
  const [ state, dispatch ] = useStateViewer(DefaultState);
  const { gis, handleMapRender } = useGis(MapOptions, { dispatch });
  const drawerItemEvents = useDrawerEvents(gis, dispatch);

  return (
    <GisDashboard state={ state } onMapRender={ handleMapRender } menus={{
      dragModes: {
        groupName: 'Drag Modes',
        keyProp: 'text',
        items: DragMode,
        render: ({ text, handleFn, ...eventParams }) => (
          <ListItem button onClick={ drawerItemEvents[ handleFn ](eventParams) }>
            <ListItemText primary={ text } />
          </ListItem>
        )
      },

      drawModes: {
        groupName: 'Draw Modes',
        keyProp: 'text',
        items: DrawMode,
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
