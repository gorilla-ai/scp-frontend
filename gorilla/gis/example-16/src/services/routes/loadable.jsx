import React, { PureComponent } from 'react';
import LoadingMask from './loading';

export default ({ loader, loading = LoadingMask }) => class Loadable extends PureComponent {

  constructor(props) {
    super(props);
    loader().then(({ default: Route }) => this.setState({ Route }));
  }

  state = { Route: loading };

  render() {
    const { Route } = this.state;

    return (
      <Route { ...this.props } />
    );
  }
}
