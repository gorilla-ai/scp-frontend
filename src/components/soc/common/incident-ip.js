import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import TextField from '@material-ui/core/TextField'

let t = null;
let it = null;

/**
 * Incident IP
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the Incident Form Incident IP
 */
class IncidentIP extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');
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
    const {type, disabledStatus, value: {ip, url, info}} = this.props;

    if (type === 'ip') {
      return (
        <div className='connection-content'>
          <div className='line'>
            <div className='group process'>
              <label htmlFor='incidentIP'>{it('txt-incident-ip')}</label>
              <TextField
                id='incidentIP'
                name='ip'
                variant='outlined'
                fullWidth
                size='small'
                value={ip}
                onChange={this.handleDataChange}
                disabled={disabledStatus} />
            </div>
          </div>
        </div>
      )
    } else if (type === 'url') {
      return (
        <div className='connection-content'>
          <div className='line'>
            <div className='group process'>
              <label htmlFor='incidentURL'>{it('txt-incident-url')}</label>
              <TextField
                id='incidentURL'
                name='url'
                variant='outlined'
                fullWidth
                size='small'
                value={url}
                onChange={this.handleDataChange}
                disabled={disabledStatus} />
            </div>
          </div>
        </div>
      )
    } else if (type === 'info') {
      return (
        <div className='connection-content'>
          <div className='line'>
            <div className='group process'>
              <label htmlFor='incidentInfo'>{it('txt-incident-info')}</label>
              <TextField
                id='incidentInfo'
                name='info'
                variant='outlined'
                fullWidth
                size='small'
                value={info}
                onChange={this.handleDataChange}
                disabled={disabledStatus} />
            </div>
          </div>
        </div>
      )
    }
  }
}

IncidentIP.propTypes = {
  value: PropTypes.object.isRequired
};

export default IncidentIP;