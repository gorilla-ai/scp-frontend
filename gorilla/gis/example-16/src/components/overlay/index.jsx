import React, { useCallback, useEffect } from 'react';

import { ListItem, ListItemText } from '@material-ui/core';

import { useStateViewer } from 'services/state';
import { useGis, useMapData } from 'services/customs/gis';
import GisDashboard from 'components/commons/gis-dashboard';

import MapOptions, { DefaultState, DragMode, Manipulations } from './gis-config';


// TODO: Custom Functions
function useDrawerEvents(gis, { selection = {} }, dispatch) {
  const useNvlFn = useCallback(fn => !gis ? () => {} : fn, [ gis ]);
  const MapData = useMapData();

  useEffect(() => {
    if (gis) {
      const { x: lng, y: lat } = gis.map._size;

      gis.setMaxBounds(
        { lat: 0, lng: 0 },
        { lat, lng: 9560 * lat / 5000 },
        true
      );
    }
  }, [ gis ]);

  return {
    handleDragModeChange: useCallback(({ value }) => useNvlFn(() => {
      const [ dragMode, regionType = null ] = value.split('-');

      gis.setDragMode(dragMode, regionType);
      dispatch({ dragMode, regionType, ...('draw' === dragMode ? { drawType: 'marker' } : {}) });
    }), [ gis, dispatch ]),

    handleLoadSymbols: useCallback(({ value } = {}) => useNvlFn(() => {
      gis.setSymbol(MapData[value]);

      dispatch({
        action: `Load symbols ${ value }`,
        visible: gis.visible
      });
    }), [ gis, dispatch ]),

    handleZoomToFitSelection: useCallback(() => useNvlFn(() => {
      gis.zoomToFit(gis.getSelection());
    }), [ gis ]),

    handleFilterMarkers: useCallback(() => useNvlFn(() => {
      gis.filterSymbol(symbol => symbol.type === 'marker');

      dispatch({
        action: 'Filter markers',
        visible: gis.visible
      });
    }), [ gis, dispatch ]),

    handleSymbolsVisible: useCallback(({ value, isShow }) => useNvlFn(() => {
      gis[isShow ? 'showSymbol' : 'hideSymbol'](value ? (symbol => symbol.type === value) : null);
  
      dispatch({
        action: `${ isShow ? 'Show' : 'Hide' } ${ value || 'all symbol' }s`,
        visible: gis.visible
      });
    }), [ gis, dispatch ]),

    handleSelectSymbols: useCallback(({ value: type }) => useNvlFn(() => {
      gis.setSelection(type ? { type } : gis.visible);
      dispatch({ action: `Select ${ type || 'all symbol' }s` });
    }), [ gis, dispatch ]),

    handleRemoveSymbols: useCallback(() => useNvlFn(() => {
      const ids = gis.getSelection();

      gis.removeSymbol(ids);

      dispatch({
        action: `Remove selected ${ ids } symbols`,
        visible: gis.visible,
        selection: {
          ...selection,
          ids: gis.selected
        }
      });
    }), [ gis, selection, dispatch ]),

    handleClear: useCallback(() => useNvlFn(() => {
      gis.clear();

      dispatch({
        action: 'Clear',
        visible: gis.visible,
        selection: {}
      });
    }), [ gis, dispatch ])
  };
}

export default function Overlay() {
  const [ state, dispatch ] = useStateViewer(DefaultState);
  const { gis, handleMapRender } = useGis(MapOptions, { dispatch });
  const drawerItemEvents = useDrawerEvents(gis, state, dispatch);

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
