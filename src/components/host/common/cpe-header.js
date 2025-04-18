import React, { Component } from 'react'
import _ from 'lodash'

import TextField from '@material-ui/core/TextField'

import MultiInput from 'react-ui/build/src/components/multi-input'

import CpeList from './cpe-list'

let t = null;

/**
 * Host HMD Settings CPE header
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the CPE header group
 */
class CpeHeader extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Set input value change
   * @method
   * @param {string} field - input field
   * @param {string} value - input value
   */
  handleDataChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      header: event.target.value
    });
  }
  render() {
    const {activeContent, fieldEnable, value} = this.props;
    const data = {
      activeContent,
      fieldEnable
    };

    return (
      <div className='group-content cpe'>
        <label id='cpeHeaderLabel'>
          <span>{t('network-inventory.txt-softwareName')} *</span>
        </label>
        <TextField
          name='cpeHeader'
          className='cpe-header-input'
          variant='outlined'
          size='small'
          error={!value.validate}
          helperText={value.msg}
          value={value.header}
          onChange={this.handleDataChange}
          disabled={!fieldEnable.security} />
        <label id='cpeListLabel'>
          <span>{t('network-inventory.txt-cpeItem')} *</span>
        </label>
        <MultiInput
          id='hmdSettingsCpeList'
          className='cpe-list-group'
          base={CpeList}
          props={{
            ...data
          }}
          defaultItemValue={{
            cpe: '',
            validate: true
          }}
          value={value.list}
          onChange={this.props.setCpeData.bind(this, 'list', value)}
          disabled={!fieldEnable.security} />
      </div>
    )
  }
}

CpeHeader.propTypes = {

};

export default CpeHeader;