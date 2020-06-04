import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'

import {BaseDataContext} from '../../common/context';
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

const validationIp_Domain = {
  pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/,
  // patternReadable: 'xxx.xxx.xxx.xxx',
  t: (code, {value, pattern}) => {
    if (code[0] === 'missing') {
      return t('txt-required');
    } else if (code[0] === 'no-match') {
      return t('threat.txt-mode1-ValidationFail');
    }
  }
}

const DEFINED_IOC_EMERGENCY = 'DEFINED_IOC_EMERGENCY';
const DEFINED_IOC_CRITICAL = 'DEFINED_IOC_CRITICAL';
const DEFINED_IOC_ALERT = 'DEFINED_IOC_ALERT';
const DEFINED_IOC_WARNING = 'DEFINED_IOC_WARNING';
const DEFINED_IOC_NOTICE = 'DEFINED_IOC_NOTICE';

const SeverityTypeList = [
  {
    value: DEFINED_IOC_EMERGENCY,
    text: 'EMERGENCY'
  },
  {
    value: DEFINED_IOC_CRITICAL,
    text: 'CRITICAL'
  },
  {
    value: DEFINED_IOC_ALERT,
    text: 'ALERT'
  },
  {
    value: DEFINED_IOC_WARNING,
    text: 'WARNING'
  },
  {
    value: DEFINED_IOC_NOTICE,
    text: 'NOTICE'
  }
];

class AddThreats extends Component {
  constructor(props) {
    super(props);

    this.state = {

    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  ryan = () => {

  }
  /**
   * Handle relationships input value change
   * @method
   * @param {string} field - input field
   * @param {string} value - input value
   */
  handleDataChange = (field, value) => {
    let {value: curValue, threats} = this.props;

    if (field === 'name') {

    } else {
      this.props.onChange({...curValue, [field]: value});
    }
  }
  render() {
    const {value} = this.props;

    return (
      <div className='syslogs'>
        <Input
          className={cx({'error': !value.validate})}
          onChange={this.handleDataChange.bind(this, 'value')}
          value={value.value}/>
        <DropDownList
          id='threatType'
          className={value.type}
          list={SeverityTypeList}
          value={value.type}
          onChange={this.handleDataChange.bind(this, 'type')}
          />
      </div>
    )
  }
}

AddThreats.contextType = BaseDataContext;

AddThreats.propTypes = {
};

export default AddThreats;