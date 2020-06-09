import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'

import {BaseDataContext} from '../../common/context';
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];

/**
 * Add Threats
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Add Threats content
 */
class AddThreats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      severityList: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors')
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    let severityList = [];

    _.forEach(SEVERITY_TYPE, val => {
      severityList.push({
        value: val.toUpperCase(),
        text: val
      });
    })

    this.setState({
      severityList
    });
  }
  /**
   * Set add threats input value change
   * @method
   * @param {string} field - input type ('input' , 'type' and 'severity')
   * @param {string} value - input value
   */
  handleDataChange = (field, value) => {
    this.props.onChange({
      ...this.props.value,
      [field]: value
    });
  }
  render() {
    const {value} = this.props;
    const {severityList} = this.state;

    return (
      <div className='add-threats'>
        <label htmlFor='addThreatsText'></label>
        <Input
          id='addThreatsText'
          className={cx({'error': !value.validate})}
          required={true}
          value={value.input}
          onChange={this.handleDataChange.bind(this, 'input')} />
        <label htmlFor='addThreatsType'></label>
        <DropDownList
          id='addThreatsType'
          className='type'
          list={[
            {value: 'ip', text: 'IP'},
            {value: 'domainName', text: 'DomainName'},
            {value: 'url', text: 'URL'},
            {value: 'snort', text: 'SNORT'},
            {value: 'yara', text: 'YARA'},
            {value: 'certMd5', text: 'Certification (MD5)'},
            {value: 'certSha1', text: 'Certification (Sha1)'},
            {value: 'certSha256', text: 'Certification (Sha256)'},
            {value: 'fileHashMd5', text: 'FileHash (MD5)'},
            {value: 'fileHashSha1', text: 'FileHash (Sha1)'},
            {value: 'fileHashSha256', text: 'FileHash (Sha256)'}
          ]}
          required={true}
          value={value.type}
          onChange={this.handleDataChange.bind(this, 'type')} />
        <label htmlFor='addThreatsSeverity'></label>  
        <DropDownList
          id='addThreatsSeverity'
          className={'severity ' + value.severity.toLowerCase()}
          list={severityList}
          required={true}
          value={value.severity}
          onChange={this.handleDataChange.bind(this, 'severity')} />
      </div>
    )
  }
}

AddThreats.contextType = BaseDataContext;

AddThreats.propTypes = {
};

export default AddThreats;