import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Accounts from './accounts'
import Privileges from './privileges'

const log = require('loglevel').getLogger('user');

const User = () => (
  <Switch>
    <Route path='/user/accounts' component={Accounts} />
    <Route path='/user/privileges' component={Privileges} />
  </Switch>
);

export default User;