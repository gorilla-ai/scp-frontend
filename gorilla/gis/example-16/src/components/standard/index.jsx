import React, { useEffect, useState, useCallback } from 'react';
import _ from 'lodash';

import { ListItem, ListItemText } from '@material-ui/core';

import { useStateViewer } from 'services/state';
import { useGis, useMapData } from 'services/customs/gis';
import GisDashboard from 'components/commons/gis-dashboard';

import MapOptions, { DefaultState, DragModes, Manipulations, BasicEvents } from './gis-config';

import '@less/index.less';


// TODO: Custom Functions
function useHandleStates(gis) {
  return {
    getTriggeredState: useCallback((e, ids) => ({
      triggered: { ids, symbol: ids ? gis.getSymbol(ids) : null }
    }), [ gis ]),

    getMouseoverState: useCallback((e, ids) => ({
      triggered: { ids, symbol: null }
    }), []),

    getSelectionChangeState: useCallback((e, ids) => ({
      selection: { region: e.bounds || _.pick(e, ['radius', 'layerPoint']), ids },
      triggered: { ids }
    }), []),

    getMeasureendState: useCallback((e, { latlng, latlngs, distance }) => ({
      pathInfo: { latlng, latlngs, distance: `${ distance } meters` }
    }), [])
  };
}

function useDrawerEvents(gis, { selection = {} }, dispatch) {
  const useNvlFn = useCallback(fn => !gis ? () => {} : fn, [ gis ]);
  const MapData = useMapData();

  return {
    handleDragModeChange: useCallback(({ value }) => useNvlFn(() => {
      const [ dragMode, regionType = null ] = value.split('-');

      gis.setDragMode(dragMode, regionType);
      dispatch({ dragMode, regionType });
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

    handleSelectGroup: useCallback(({ value: group }) => useNvlFn(() => {
      gis.setSelection({ props: { group } });
      dispatch({ action: `Select ${ group || 'all symbol' }s` });
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


// TODO: Component
export default function Standard() {
  const [ state, dispatch ] = useStateViewer(DefaultState);
  const { gis, handleMapRender } = useGis(MapOptions, { dispatch, useHandleStates, basicEvents: BasicEvents });
  const drawerItemEvents = useDrawerEvents(gis, state, dispatch);

  return (
    <GisDashboard state={ state } onMapRender={ handleMapRender } menus={{
      dragModes: {
        groupName: 'Drag Modes',
        keyProp: 'value',
        items: DragModes,
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
