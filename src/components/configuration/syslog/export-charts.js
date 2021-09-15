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
   * @param {string} type - form type ('select', 'checkbox' or 'selectAll')
   * @param {object} event - event object
   */
  handleDataChange = (type, event) => {
    const {netProxyData, value} = this.props;

    if (type === 'select') {
      let configList = {};

      _.forEach(netProxyData.configs[event.target.value], val => {
        configList[val.id] = true;
      })

      this.props.onChange({
        ...this.props.value,
        [event.target.name]: event.target.value,
        configList
      });
    } else if (type === 'checkbox') {
      this.props.onChange({
        ...this.props.value,
        configList: {
          ...value.configList,
          [event.target.name]: event.target.checked
        }
      });
    } else if (type === 'selectAll') {
      let configList = {};

      _.forEach(netProxyData.configs[event.target.name], val => {
        configList[val.id] = event.target.checked;
      })

      this.props.onChange({
        ...this.props.value,
        configList
      });
    }
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
            checked={this.props.value.configList[val.id]}
            onChange={this.handleDataChange.bind(this, 'checkbox')}
            color='primary' />
        } />
    )
  }
  /**
   * Check select all checkbox
   * @method
   * @returns boolean true/false
   */
  checkSelectAll = () => {
    const {value} = this.props;
    let selectAll = true;

    Object.keys(value.configList).map(val => {
      if (!value.configList[val]) {
        selectAll = false;
        return false;
      }
    });

    return selectAll;
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
          onChange={this.handleDataChange.bind(this, 'select')}>
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
            <FormControlLabel
              label={t('txt-selectAll')}
              className='select-all'
              control={
                <Checkbox
                  className='checkbox-ui'
                  name={value.hostIp}
                  checked={this.checkSelectAll()}
                  onChange={this.handleDataChange.bind(this, 'selectAll')}
                  color='primary' />
              } />
          }
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