import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import { ReactMultiEmail } from 'react-multi-email'

import MenuItem from '@material-ui/core/MenuItem'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import MultiInput from 'react-ui/build/src/components/multi-input'

import helper from '../common/helper'
import requestHeaders from './request-headers'

const ACTION_TYPE = ['shutdownHost', 'logoffAllUsers', 'netcut', 'netcutResume'];
const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const REQUEST_TYPE = ['GET', 'POST', 'DELETE', 'PATCH'];

let t = null;
let et = null;

/**
 * SOAR Multi Operators
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the SOAR multi operator
 */
class MultiOperator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openRuleSection: false,
      actionTypeList: [],
      severityTypeList: [],
      requestTypeList: [],
      linkOperatorList: [],
      nodeActionOperatorList: [],
      soarActiveOperator: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
  }
  componentDidMount() {
    this.setOperatorList();
    this.setDropDownList();
    this.setRequestTypeList();
  }
  componentDidUpdate(prevProps) {
    if (!prevProps || (this.props.value !== prevProps.value)) {
      this.setOperatorData();
    }
  }
  /**
   * Set link operator list
   * @method
   */
  setOperatorList = () => {
    const {soarColumns} = this.props;
    let linkOp = _.cloneDeep(soarColumns.linkOp);
    let index = '';
    index = linkOp.indexOf('and');
    linkOp.splice(index, 1);
    index = linkOp.indexOf('or');
    linkOp.splice(index, 1);

    const linkOperatorList = _.map(linkOp, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });
    const nodeActionOperatorList = _.map(soarColumns.action, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    this.setState({
      linkOperatorList,
      nodeActionOperatorList
    }, () => {
      this.setInitializeState();
    });
  }
  /**
   * Set dropdown list for severity type
   * @method
   */
  setDropDownList = () => {
    const actionTypeList = _.map(ACTION_TYPE, val => {
      return <MenuItem value={val}>{t('hmd-scan.txt-' + val)}</MenuItem>
    });

    const severityTypeList = _.map(SEVERITY_TYPE, val => {
      return <MenuItem value={'DEFINED_IOC_' + val.toUpperCase()}>{val}</MenuItem>
    });

    this.setState({
      actionTypeList,
      severityTypeList
    });
  }
  /**
   * Set dropdown list for request type
   * @method
   */
  setRequestTypeList = () => {
    const requestTypeList = _.map(REQUEST_TYPE, val => {
      return <MenuItem value={val}>{val}</MenuItem>
    });

    this.setState({
      requestTypeList
    });
  }
  /**
   * Set intialize soar data
   * @method
   */
  setInitializeState = () => {
    const {soarColumns} = this.props;

    Object.keys(soarColumns.spec).forEach(key => {
      this.setState({
        [key]: soarColumns.spec[key]
      }, () => {
        this.setOperatorData();
      });
    });
  }
  /**
   * Set soar operator data
   * @method
   */
  setOperatorData = () => {
    const {value} = this.props;

    if (value.op) {
      this.setState({
        soarActiveOperator: value.op,
        [value.op]: value.args
      });
    }
  }
  /**
   * Toggle rule section on/off
   * @method
   */
  toggleRuleOpen = () => {
    this.setState({
      openRuleSection: !this.state.openRuleSection
    });
  }
  /**
   * Handle operator data change
   * @method
   * @param {object} event - event object
   */
  handleOperatorDataChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      [event.target.name]: event.target.value,
      args: this.state[event.target.value]
    });

    this.setState({
      soarActiveOperator: event.target.value
    });
  }
  /**
   * Handle form data change
   * @method
   * @param {string | array.<string>} type - data input type
   * @param {object} event - event object
   */
  handleDataChange = (type, event) => {
    let tempNewValue = _.cloneDeep(this.props.value);
    let tempData = {...this.state[type]};

    if (!tempNewValue.args) {
      tempNewValue.args = {};
    }

    if (type === 'email' && _.isArray(event)) { //Special case for email recipient
      tempNewValue.args.receiver = event;
      tempData.receiver = event;
    } else {
      tempNewValue.args[event.target.name] = event.target.value;
      tempData[event.target.name] = event.target.value;
    }

    this.props.onChange({
      ...tempNewValue
    });

    this.setState({
      [type]: tempData
    });
  }
  /**
   * Handle email delete
   * @method
   * @param {function} removeEmail - function to remove email
   * @param {number} index - index of the emails list array
   */
  deleteEmail = (removeEmail, index) => {
    removeEmail(index);
  }
  /**
   * Handle email delete
   * @method
   * @param {string} email - individual email
   * @param {number} index - index of the emails list array
   * @param {function} removeEmail - function to remove email
   * @returns HTML DOM
   */
  getLabel = (email, index, removeEmail) => {
    return (
      <div data-tag key={index}>
        {email}
        <span data-tag-handle onClick={this.deleteEmail.bind(this, removeEmail, index)}> <span className='font-bold'>x</span></span>
      </div>
    )
  }
  /**
   * Set request header data
   * @method
   * @param {array} requestHeadersData - request headers data
   */
  setRequestHeaderData = (requestHeadersData) => {
    let tempNewValue = _.cloneDeep(this.props.value);
    let tempData = {...this.state.restful_api};
    tempNewValue.args.headers = requestHeadersData;
    tempData.headers = requestHeadersData;

    this.props.onChange({
      ...tempNewValue
    });

    this.setState({
      restful_api: tempData
    });
  }
  /**
   * Display individual form
   * @method
   * @param {string} operator - soar operator
   * @param {string} key - key of the form data
   * @param {number} i - index of the form data
   */
  displayForm = (operator, key, i) => {
    const {actionTypeList, severityTypeList, requestTypeList} = this.state;
    const {soarColumns} = this.props;
    const label = t('soar.txt-' + key);
    const value = soarColumns.spec[operator][key];
    const operatorValue = this.state[operator];
    const textValue = (operatorValue ? operatorValue[key] : '') || '';

    if (typeof value === 'string' && operatorValue) {
      if (key === 'content' || key === 'requestBody') { //For email content or restful api request body
        return (
          <div key={i} className='group'>
            <label>{label}</label>
            <TextareaAutosize
              name={key}
              className='textarea-autosize'
              rows={3}
              value={textValue}
              onChange={this.handleDataChange.bind(this, operator)} />
          </div>
        )
      } else if (key === 'senderPassword') { //For email password
        return (
          <div key={i} className='group'>
            <TextField
              name={key}
              type='password'
              label={label}
              variant='outlined'
              fullWidth
              size='small'
              required
              error={!textValue}
              helperText={textValue ? '' : t('txt-required')}
              value={textValue}
              onChange={this.handleDataChange.bind(this, operator)} />
          </div>
        )
      } else if (key === 'action' || key === 'severityType') {
        let dropDownList = '';

        if (key === 'action') {
          dropDownList = actionTypeList;
        } else if (key === 'severityType') {
          dropDownList = severityTypeList;
        }

        return (
          <div key={i} className='group'>
            <TextField
              name={key}
              select
              label={label}
              variant='outlined'
              fullWidth
              size='small'
              value={textValue}
              onChange={this.handleDataChange.bind(this, operator)}>
              {dropDownList}
            </TextField>
          </div>
        )
      } else if (key === 'method') {
        return (
          <div key={i} className='group'>
            <TextField
              name={key}
              select
              label={label}
              variant='outlined'
              fullWidth
              size='small'
              value={textValue}
              onChange={this.handleDataChange.bind(this, operator)}>
              {requestTypeList}
            </TextField>
          </div>
        )
      } else {
        return (
          <div key={i} className='group'>
            <TextField
              name={key}
              label={label}
              variant='outlined'
              fullWidth
              size='small'
              required
              error={!textValue}
              helperText={textValue ? '' : t('txt-required')}
              value={textValue}
              onChange={this.handleDataChange.bind(this, operator)} />
          </div>
        )
      }
    } else if (typeof value === 'boolean' && operatorValue) {
      return (
        <div key={i} className='group'>
          <TextField
            name={key}
            select
            label={label}
            variant='outlined'
            fullWidth
            size='small'
            value={operatorValue[key]}
            onChange={this.handleDataChange.bind(this, operator)}>
            <MenuItem value={true}>True</MenuItem>
            <MenuItem value={false}>False</MenuItem>
          </TextField>
        </div>
      )
    } else if (typeof value === 'number' && operatorValue) {
      return (
        <div key={i} className='group'>
          <TextField
            name={key}
            type='number'
            label={label}
            variant='outlined'
            fullWidth
            size='small'
            InputProps={{inputProps: { min: 0 }}}
            required
            error={!textValue}
            helperText={textValue ? '' : t('txt-required')}
            value={textValue}
            onChange={this.handleDataChange.bind(this, operator)} />
        </div>
      )
    } else if (typeof value === 'object') {
      if (key === 'headers') { //For request headers
        const data = {};

        return (
          <MultiInput
            key={i}
            className='request-multi'
            base={requestHeaders}
            defaultItemValue={{
                header: '',
                value: ''
              }
            }
            value={textValue}
            props={data}
            onChange={this.setRequestHeaderData} />
        )
      } else if (operator === 'email' && key === 'receiver') { //For email recipient
        return (
          <div key={i} className='group'>
            <label>{label}</label>
            <ReactMultiEmail
              emails={textValue}
              onChange={this.handleDataChange.bind(this, operator)}
              getLabel={this.getLabel} />
          </div>
        )
      }
    }
  }
  /**
   * Show corresponding form group
   * @method
   * @returns HTML DOM
   */
  showFormGroup = () => {
    const {soarActiveOperator} = this.state;

    if (soarActiveOperator) {
      return Object.keys(this.props.soarColumns.spec[soarActiveOperator]).map(this.displayForm.bind(this, soarActiveOperator));
    }    
  }
  render() {
    const {activeElementType, activeElement} = this.props;
    const {openRuleSection, linkOperatorList, nodeActionOperatorList, soarActiveOperator} = this.state;
    let multiHeader = '';
    let operatorList = '';

    if (activeElementType === 'link' || activeElement.componentType === 'link') {
      multiHeader = t('txt-rule');
      operatorList = linkOperatorList;
    } else if (activeElement.componentType === 'action') {
      multiHeader = 'Action';
      operatorList = nodeActionOperatorList;
    }

    return (
      <div className='multi-operator'>
        <div className='header'>
          <i className={`c-link fg fg-arrow-${openRuleSection ? 'top' : 'bottom'}`} onClick={this.toggleRuleOpen}></i> <span>{multiHeader}</span>
        </div>
        {openRuleSection &&
          <div className='operator'>
            <TextField
              name='op'
              select
              label='Operator'
              variant='outlined'
              fullWidth
              size='small'
              value={soarActiveOperator}
              onChange={this.handleOperatorDataChange}>
              {operatorList}
            </TextField>
            {this.showFormGroup()}
          </div>
        }
      </div>
    )
  }
}

MultiOperator.propTypes = {
  value: PropTypes.array.isRequired
};

export default MultiOperator;