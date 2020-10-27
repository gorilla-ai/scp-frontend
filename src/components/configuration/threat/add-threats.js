import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import cx from 'classnames'

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import {BaseDataContext} from '../../common/context';
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];

const StyledTextField = withStyles({
  root: {
    backgroundColor: '#fff',
    '& .Mui-disabled': {
      backgroundColor: '#f2f2f2'
    }
  }
})(TextField);

function TextFieldComp(props) {
  return (
    <StyledTextField
      id={props.id}
      className={props.className}
      name={props.name}
      type={props.type}
      label={props.label}
      multiline={props.multiline}
      rows={props.rows}
      maxLength={props.maxLength}
      variant={props.variant}
      fullWidth={props.fullWidth}
      size={props.size}
      InputProps={props.InputProps}
      required={props.required}
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled} />
  )
}

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
    this.setSeverityList();
  }
  /**
   * Set Severity list
   * @method
   */
  setSeverityList = () => {
    const severityList = _.map(SEVERITY_TYPE, (val, i) => {
      return <MenuItem key={i} value={val.toUpperCase()}>{val}</MenuItem>
    });

    this.setState({
      severityList
    });
  }
  /**
   * Set add threats input value change
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
    const {severityList} = this.state;

    return (
      <div className='add-threats'>
        <TextFieldComp
          id='addThreatsText'
          className={cx({'error': !value.validate})}
          name='input'
          variant='outlined'
          fullWidth={true}
          size='small'
          value={value.input}
          onChange={this.handleDataChange} />
        <StyledTextField
          id='addThreatsType'
          name='type'
          select
          variant='outlined'
          fullWidth={true}
          size='small'
          value={value.type}
          onChange={this.handleDataChange}>
          <MenuItem value={'ip'}>IP</MenuItem>
          <MenuItem value={'domainName'}>DomainName</MenuItem>
          <MenuItem value={'url'}>URL</MenuItem>
          <MenuItem value={'snort'}>SNORT</MenuItem>
          <MenuItem value={'yara'}>YARA</MenuItem>
          <MenuItem value={'certMd5'}>Certification (MD5)</MenuItem>
          <MenuItem value={'certSha1'}>Certification (Sha1)</MenuItem>
          <MenuItem value={'certSha256'}>Certification (Sha256)</MenuItem>
          <MenuItem value={'fileHashMd5'}>FileHash (MD5)</MenuItem>
          <MenuItem value={'fileHashSha1'}>FileHash (Sha1)</MenuItem>
          <MenuItem value={'fileHashSha256'}>FileHash (Sha256)</MenuItem>
          <MenuItem value={'fileHashWhiteMd5'}>FileHashWhite (MD5)</MenuItem>
        </StyledTextField>
        <StyledTextField
          id='addThreatsSeverity'
          className={'severity ' + value.severity.toLowerCase()}
          name='severity'
          select
          variant='outlined'
          fullWidth={true}
          size='small'
          value={value.severity}
          onChange={this.handleDataChange}>
          {severityList}
        </StyledTextField>
      </div>
    )
  }
}

AddThreats.contextType = BaseDataContext;

AddThreats.propTypes = {
};

export default AddThreats;