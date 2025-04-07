import React, { createContext, useMemo, useContext, useReducer } from "react";
import cn from 'classnames';

// TODO: Context & Reducer
const StateContext = createContext({});

function StateStore(prevState, nextState) {
  return {
    ...prevState,
    ...nextState
  }
}

// TODO: Custom Functions
export function useStateViewer(initState) {
  return useReducer(StateStore, initState);
}

// TODO: Component
export default {
  Builder({ state, children }) {
    return (
      <StateContext.Provider value={ state }>
        { children }
      </StateContext.Provider>
    );
  },
  Viewer({ className }) {
    const state = useContext(StateContext);
    const display = useMemo(() => Object.keys(state).sort().reduce((result, name) => ({ ...result, [name]: state[name] }), {}), [ state ]);

    return (
      <div className={ cn('state-viewer', className) }>
        <h2>GIS State Detail</h2>
        <pre className="state-detail">{ JSON.stringify(display, null, '  ') }</pre>
      </div>
    );
  }
}
