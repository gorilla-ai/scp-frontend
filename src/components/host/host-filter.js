import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

let t = null;

/**
 * Search Filter
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the Host filter input
 */
class HostFilter extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Set search filter input
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
    const {value} = this.props;
    const nameList = [
      {
        text: t('ipFields.ip'),
        value: 'ip'
      },
      {
        text: t('ipFields.mac'),
        value: 'mac'
      },
      {
        text: t('ipFields.hostName'),
        value: 'hostName'
      },
      {
        text: t('ipFields.deviceType'),
        value: 'deviceType'
      },
      {
        text: t('ipFields.system'),
        value: 'system'
      },
      {
        text: 'MD5',
        value: '_MD5'
      },
      {
        text: 'CVE-ID',
        value: 'cveId'
      },
      {
        text: 'CCE-ID',
        value: '_CceId'
      },
      {
        text: 'Filepath',
        value: '_Filepath'
      },
      {
        text: 'CPE-ID',
        value: 'cpe23Uri'
      }
    ];
    const filterList = _.map(nameList, (val, i) => {
      return <MenuItem id={'searchFilter' + val.value} key={i} value={val.value}>{val.text}</MenuItem>
    });

    return (
      <div>
        <TextField
          name='name'
          id='hostFilterDropdown'
          className='condition-select'
          select
          variant='outlined'
          fullWidth
          size='small'
          value={value.name}
          onChange={this.handleDataChange}>
          {filterList}
        </TextField>
        <TextareaAutosize
          name='query'
          id='searchFilterInput'
          className='textarea-autosize filter-inputbox'
          value={value.query}
          onChange={this.handleDataChange} />
      </div>
    )
  }
}

HostFilter.propTypes = {
  value: PropTypes.object.isRequired
};

export default HostFilter;