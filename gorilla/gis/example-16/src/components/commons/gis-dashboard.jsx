import React, { createElement, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4';
import cn from 'classnames';
import styled from 'styled-components';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { AppBar, Toolbar, IconButton, Drawer, Divider, List, ListSubheader, Grid, NoSsr, makeStyles } from '@material-ui/core';

import GisState from 'services/state';


// TODO: Custom Functions
const useStyles = makeStyles(() => ({
  container: {
    position: 'relative'
  },
  toolbar: {
    minHeight: 48,
    color: 'white',
    background: '#585D62'
  },
  drawer: {
    '& > div': {
      position: 'absolute',
      color: 'white',
      background: '#585D62'
    },
    '& hr': {
      background: 'rgba(255, 255, 255, .4)'
    }
  },
  dashboard: {
    height: 'calc(100% - 48px)'
  },
  subheader: {
    color: '#ccc'
  },
  collapseBtn: {
    width: '100%',
    justifyContent: 'start'
  },
  menuBtn: {
    marginLeft: 'auto',
    color: 'white'
  }
}));


// TODO: Components
const MainViewer = styled(function({ className, children, onRender = () => {} }) {
  const map = useRef(null);
  const [ mapId ] = useState(uuidv4());

  useEffect(() => {
    if (map.current)
      onRender(mapId, map.current);
  }, [ map, onRender ]);

  return (
    <Grid container className={ className }>
      <Grid ref={ map } item xs={ 12 } sm={ 8 } id={ mapId } className="gis-dashboard-map" />
      <Grid item xs={ 12 } sm={ 4 } className="gis-dashboard-state" component={ GisState.Viewer } />

      { children && (
        <Grid item xs={ 12 }>
          { children }
        </Grid>
      )}
    </Grid>
  );
})`
  @media (max-width: 599px) {
    div.MuiGrid-item.gis-dashboard-map, div.MuiGrid-item.gis-dashboard-state {
      height: 50% !important;
    }
  }
`;

export default function GisDashboard({
  state,
  menus = {},
  children,
  onMapRender = () => {},
  classNames: { container, toolbar, drawer, dashboard } = {}
}) {
  const classes = useStyles();
  const [ isMenuOpen, setMenuOpen ] = useState(true);

  return (
    <GisState.Builder state={ state }>
      <div className={ cn(classes.container, container) }>
        <AppBar position="static">
          <Toolbar className={ cn(classes.toolbar, toolbar) }>
            <IconButton className={ classes.menuBtn } size="small" onClick={ () => setMenuOpen(!isMenuOpen) }>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer className={ cn(classes.drawer, drawer) } variant="persistent" anchor="right" open={ isMenuOpen }>
          <div>
            <IconButton className={ classes.collapseBtn } color="inherit" onClick={ () => setMenuOpen(false) }>
              <ChevronRightIcon />
            </IconButton>
          </div>

          { Object.keys(menus).map(menuKey => {
            const { groupName, keyProp, items = [], render } = menus[menuKey];
            const btns = items.filter(({ displayOn: { field, value } = {} }) => !field || state[field] === value);

            return btns.length > 0 && (
              <List key={ groupName } subheader={(
                <ListSubheader className={ classes.subheader }>{ groupName }</ListSubheader>
              )}>
                { btns.map(options => {
                  const { type, props: { children, ...elProps } } = render(options);
  
                  return createElement(type, { ...elProps, key: options[keyProp] }, children);
                })}
              </List>
            );
          }).filter(el => !!el).reduce((res, element, i) => res.concat((
            <Divider key={`divider-${ i }`} />
          ), element), [])}
        </Drawer>

        <NoSsr>
          <MainViewer className={ cn(classes.dashboard, dashboard) } onRender={ onMapRender }>
            { children }
          </MainViewer>
        </NoSsr>
      </div>
    </GisState.Builder>
  );
};

GisDashboard.propTypes = {
  state: PropTypes.object.isRequired,
  children: PropTypes.node,
  onMapRender: PropTypes.func,
  classNames: PropTypes.exact({
    container: PropTypes.string,
    toolbar: PropTypes.string,
    drawer: PropTypes.string,
    dashboard: PropTypes.string,
    map: PropTypes.string
  }),
  menus: PropTypes.objectOf(
    PropTypes.exact({
      groupName: PropTypes.string.isRequired,
      keyProp: PropTypes.string.isRequired,
      items: PropTypes.array,
      render: PropTypes.func.isRequired
    })
  )
};
