import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

let t = null;

/**
 * Config Syslog config export charts
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the export charts form
 */
class ExportCharts extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Set input value change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      [event.target.name]: event.target.value
    });
  }
  /**
   * Check if item is already in the selected list
   * @method
   * @param {string} id - checked item ID
   * @returns boolean true/false
   */
  checkSelectedItem = (id) => {
    return _.includes(this.props.exportConfigList, id);
  }
  /**
   * Display service name checkboxes
   * @method
   * @param {object} val - content of the service name list
   * @param {number} i - index of the service name list
   * @returns HTML DOM
   */
  displayServiceName = (val, i) => {
    return (
      <FormControlLabel
        key={i}
        label={val.name + ' (Port: ' + val.port + ')'}
        control={
          <Checkbox
            className='checkbox-ui'
            name={val.id}
            checked={this.checkSelectedItem(val.id)}
            onChange={this.props.toggleCheckbox}
            color='primary' />
        } />
    )
  }
  render() {
    const {netProxyData, exportChartsIpList, value} = this.props;

    return (
      <div className='group-content'>
        <TextField
          className='export-hostIp'
          name='hostIp'
          label={t('syslogFields.txt-hostIP')}
          select
          variant='outlined'
          size='small'
          value={value.hostIp}
          onChange={this.handleDataChange}>
          <MenuItem value=''></MenuItem>
          {exportChartsIpList}
        </TextField>
        <TextField
          className='export-hostName'
          name='hostName'
          label={t('syslogFields.txt-hostName')}
          variant='outlined'
          size='small'
          value={value.hostName || ''}
          disabled={true} />
        <div className='config-section'>
          {value.hostIp &&
            netProxyData.configs[value.hostIp].map(this.displayServiceName)
          }
        </div>
      </div>
    )
  }
}

ExportCharts.propTypes = {
  activeContent: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired
};

export default ExportCharts;