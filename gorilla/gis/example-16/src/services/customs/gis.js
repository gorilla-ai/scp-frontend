import { useState, useEffect, useMemo, useCallback } from 'react';
import Gis from 'gis';

import set1 from '@json/events-1.json';
import set2 from '@json/events-2.json';
import set3 from '@json/cibd.json';
import set4 from '@json/cib-case.json';


const CLUSTER = ['basestation', 'phone', 'wifi', true];
const GROUP = ['G1', 'G2', 'G3'];

function useEventState(gis, dispatch, useHandleStates = () => ({})) {
  const useNvlFn = useCallback(fn => !gis ? () => {} : fn, [ gis ]);
  const states = useHandleStates(gis);

  return useCallback(({ eventName, stateName }) => useNvlFn((e, ids, data) => {
    console.log(eventName, ids, data);

    dispatch({
      ...states[stateName](e, ids, data),
      event: eventName
    });
  }), [ states ]);
};

export function useMapData() {
  return useMemo(() => ({
    set1,
    set2,
    set3: _(set3).map(el => {
      if (el.type === 'marker') {
        el.cluster = CLUSTER[Math.floor(Math.random() * 4)];
        el.group = GROUP[Math.floor(Math.random() * 3)];
      }
      return el;
    }).take(5000).value(),
    set4: _(set4.hits.hits)
      .filter(el => { return el._source.OccurLatitude && el._source.OccurLongitude })
      .map(el => {
          return {
            id: el._id,
            type: 'marker',
            latlng: [el._source.OccurLatitude, el._source.OccurLongitude]
        }
      })
      .take(300)
      .value()
  }), []);
};

export function useGis(options, { dispatch, basicEvents, useHandleStates }, defaultSymbols) {
  const [ gis, setGis ] = useState(null);
  const getEventState = useEventState(gis, dispatch, useHandleStates);

  useEffect(() => {
    if (gis && basicEvents && Array.isArray(basicEvents)) basicEvents.forEach(({ binding = true, eventName, stateName, params }) =>
      gis[ binding ? 'on' : 'off' ](
        eventName,
        params,
        getEventState({ eventName, stateName })
      )
    );
  }, [ gis ])

  return {
    gis,

    handleMapRender: useCallback((mapId, el) => {
      const gis = new Gis(mapId, options instanceof Function ? options(mapId, el) : options, defaultSymbols);

      setGis(gis);
      dispatch({ visible: gis.visible });
    }, [ dispatch, setGis, options ])
  };
}
