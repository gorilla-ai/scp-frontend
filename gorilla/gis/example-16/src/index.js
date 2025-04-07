import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';

import App from 'components/app';

import '@less/index.less';

render((
  <React.Fragment>
    <CssBaseline />

    <HashRouter>
      <App />
    </HashRouter>
  </React.Fragment>
), document.getElementById('root'));
