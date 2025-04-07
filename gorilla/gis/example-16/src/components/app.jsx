import React, { useMemo } from 'react';
import { Switch, Route, NavLink, useLocation } from 'react-router-dom';
import { AppBar, Tabs, Tab, SvgIcon, makeStyles } from '@material-ui/core';
import cs from 'classnames';

import routes from 'services/routes';

import '@less/app.less';
import '@less/animations.less';


// TODO: Custom Functions
const useStyles = makeStyles(() => ({
  homeIcon: {
    marginRight: 'auto'
  }
}));

// TODO: Component
export default function App() {
  const { pathname } = useLocation();
  const classes = useStyles();
  const actived = useMemo(() => routes.findIndex(({ path }) => path === pathname), [ pathname, routes ]);

  return (
    <div className="app">
      <AppBar className="app-header" position="sticky" color="primary" square>
        <Tabs value={ actived } variant="scrollable">
          { routes.map(({ path, text }, i) => (
            <Tab key={ i } id={`tab-${ i }`} aria-controls={`content-${ i }`} className={ cs({ [classes.homeIcon]: !text }) } href={`#${path}`} label={
              text ? text : (
                <SvgIcon>
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </SvgIcon>
              ) 
            } />
          ))}

          <Tab label="API Documentation" href="https://git.gorilla-technology.com/gorilla/gis/tree/master/docs" target="_blank" />
        </Tabs>
      </AppBar>

      <Switch>
        { routes.map(({ path, component, exact}, i) => (
          <Route key={ i } {...{ path, exact, component }} />
        ))}
      </Switch>
    </div>
  );
}
