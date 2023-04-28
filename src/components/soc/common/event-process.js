import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import TextField from '@material-ui/core/TextField'

let t = null;
let f = null;

/**
 * Event Process
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the Incident Form Event Process
 */
class EventProcess extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
  }
  componentDidMount() {
  }
  /**
   * Handle input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      [event.target.name]: event.target.value
    });
  }
  render() {
    const {disabledStatus, value: {process}} = this.props;

    return (
      <div className='connection-content'>
        <div className='line'>
          <div className='group process'>
            <label htmlFor='attackProcess'>{f('incidentFields.attackProcess')}</label>
            <TextField
              id='attackProcess'
              name='process'
              variant='outlined'
              fullWidth
              size='small'
              value={process}
              onChange={this.handleDataChange}
              disabled={disabledStatus} />
          </div>
        </div>
      </div>
    )
  }
}

EventProcess.propTypes = {
  value: PropTypes.object.isRequired
};

export default EventProcess;