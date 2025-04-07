import React from 'react';
// import PropTypes from 'prop-types';
import _ from 'lodash';
import { Route, Link } from 'react-router';

import Standard from './standard';
import Track from './track';
import Heatmap from './heatmap';
import Contour from './contour';
import Overlay from './overlay';
import Draw from './draw';
import Motion from './motion';


const MENU = {
  standard: { component: Standard, title: 'Standard' },
  track: { component: Track, title: 'Track' },
  heatmap: { component: Heatmap, title: 'Heatmap' },
  contour: { component: Contour, title: 'Contour' },
  overlay: { component: Overlay, title: 'Overlay' },
  draw: { component: Draw, title: 'Draw' },
  motion: { component: Motion, title: 'Motion' },
};

const NoMatch = () => (<div>Page Not Found!</div>);

const Examples = (xprops) => {
  const { children } = xprops;
  return (
    <div id="g-app">
      <div id="g-header">
        <ul id="g-menu">
          {
            _.map(MENU, ({ title/* , component */ }, tag) => <Link key={tag} activeClassName="current" to={{ pathname: tag }}>{title}</Link>)
          }
          <li>
            <a href="https://git.gorilla-technology.com/gorilla/gis/tree/master/docs" target="_blank" rel="noopener noreferrer">API Documentation</a>
          </li>
        </ul>
      </div>
      <div>{children}</div>
    </div>
  );
};

// class Examples extends React.Component {
//   static propTypes = {
//     children: PropTypes.node
//   };

//   render() {
//     const { children } = this.props;
//     return (
//       <div id="g-app">
//         <div id="g-header">
//           <ul id="g-menu">
//             {
//               _.map(MENU, ({ title/* , component */ }, tag) => <Link key={tag} activeClassName="current" to={{ pathname: tag }}>{title}</Link>)
//             }
//             <li>
//               <a href="https://git.gorilla-technology.com/gorilla/gis/tree/master/docs" target="_blank" rel="noopener noreferrer">API Documentation</a>
//             </li>
//           </ul>
//         </div>
//         <div>{children}</div>
//       </div>
//     );
//   }
// }

export default (
  <Route path="/" component={Examples}>
    {
      _.map(MENU, ({ component }, tag) => <Route key={tag} path={tag} component={component} />)
    }
    <Route path="*" component={NoMatch} />
  </Route>
);

// export default Routes;
