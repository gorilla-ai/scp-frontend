import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import { ReactMultiEmail } from 'react-multi-email'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import MultiInput from 'react-ui/build/src/components/multi-input'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MultiOperator from './multi-operator'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const GROUP_LIST = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

let t = null;
let et = null;

/**
 * SoarForm
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the SOAR individual form
 */
class SoarForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nodeGroupList: [],
      nodeCustomName: '',
      nodeCustomGroup: '',
      linkOperatorList: [],
      nodeAdapterOperatorList: [],
      nodeOperatorList: [],
      nodeActionOperatorList: [],
      soarLinkOperator: '',
      soarNodeAdapterOperator: '',
      soarNodeOperator: '',
      soarNodeActionOperator: '',
      multiOperator: {
        and: {
          operators: [{
            op: '',
            args: {}
          }]
        },
        or: {
          operators: [{
            op: '',
            args: {}
          }]
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.setOperatorList();
  }
  ryan = () => {}
  /**
   * Set node and link operator list
   * @method
   */
  setOperatorList = () => {
    const {soarColumns} = this.props;
    const nodeGroupList = _.map(GROUP_LIST, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });
    const linkOperatorList = _.map(soarColumns.linkOp, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });
    const nodeAdapterOperatorList = _.map(soarColumns.adapter, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });
    const nodeOperatorList = _.map(soarColumns.nodeOp, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });
    const nodeActionOperatorList = _.map(soarColumns.action, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    this.setState({
      nodeGroupList,
      linkOperatorList,
      nodeAdapterOperatorList,
      nodeOperatorList,
      nodeActionOperatorList
    }, () => {
      this.setInitializeState();
    });
  }
  /**
   * Set intialize soar data
   * @method
   */
  setInitializeState = () => {
    const {from, soarColumns} = this.props;

    Object.keys(soarColumns.spec).forEach(key => {
      this.setState({
        [key]: soarColumns.spec[key]
      }, () => {
        if (from === 'soarCondition') {
          this.setSoarCondition();
        } else if (from === 'soarFlow') {
          this.setFlowData();
        }
      });
    });
  }
  /**
   * Set soar condition data
   * @method
   */
  setSoarCondition = () => {
    const {soarCondition} = this.props;

    if (!soarCondition.op) {
      return;
    } 

    if (soarCondition.op === 'and' || soarCondition.op === 'or') {
      this.setState({
        soarLinkOperator: soarCondition.op,
        [soarCondition.op]: soarCondition.args.operators
      });

    } else {
      this.setState({
        soarLinkOperator: soarCondition.op,
        [soarCondition.op]: soarCondition.args
      });
    }
  }
  /**
   * Set soar flow data
   * @method
   */
  setFlowData = () => {
    const {activeElementType, activeElement} = this.props;

    if (activeElementType === 'link') {
      this.setState({
        nodeCustomName: activeElement.label,
        soarLinkOperator: activeElement.op,
        [activeElement.op]: activeElement.args
      });
    } else if (activeElementType === 'node') {
      if (activeElement.componentType === 'adapter') {
        this.setState({
          soarNodeAdapterOperator: activeElement.adapter_type,
          [activeElement.adapter_type]: activeElement.args
        });
      } else if (activeElement.componentType === 'node') {
        this.setState({
          nodeCustomName: activeElement.data.label,
          nodeCustomGroup: activeElement.group,
          soarNodeOperator: activeElement.op,
          [activeElement.op]: activeElement.args
        });
      } else if (activeElement.componentType === 'action') {
        this.setState({
          nodeCustomName: activeElement.data.label,
          soarNodeOperator: activeElement.op,
          [activeElement.op]: activeElement.args
        });
      }
    }
  }
  /**
   * Handle node name/group data change
   * @method
   * @param {object} event - event object
   */
  handleNodeDataChange = (event) => {
    const {activeElement} = this.props;

    this.setState({
      [event.target.name]: event.target.value
    });

    this.props.setSoarFlowData(event.target.name, event.target.value, activeElement);
  }
  /**
   * Handle operator data change
   * @method
   * @param {string} type - data input type ('soarLinkOperator', 'soarNodeOperator', soarNodeAdapterOperator' or 'soarNodeActionOperator')
   * @param {object} event - event object
   */
  handleOperatorDataChange = (type, event) => {
    const {from, activeElement} = this.props;

    this.setState({
      [type]: event.target.value
    });

    if (from === 'soarCondition') {
      this.props.setSoarConditionData(event.target.value, this.state[event.target.value]);
    } else if (from === 'soarFlow') {
      this.props.setSoarFlowData(event.target.value, this.state[event.target.value], activeElement);
    }
  }
  /**
   * Handle form data change
   * @method
   * @param {string} type - data input type
   * @param {object} event - event object
   */
  handleDataChange = (type, event) => {
    const {from, activeElement} = this.props;
    let tempData = {...this.state[type]};
    tempData[event.target.name] = event.target.value;

    this.setState({
      [type]: tempData
    });

    if (from === 'soarCondition') {
      this.props.setSoarConditionData(type, tempData);
    } else if (from === 'soarFlow') {
      this.props.setSoarFlowData(type, tempData, activeElement);
    }
  }
  /**
   * Set test emails list
   * @method
   * @param {array} newEmails - new emails list
   */
  handleEmailChange = (newEmails) => {
    const {activeElement} = this.props;
    let tempEmail = {...this.state.email};
    tempEmail.receiver = newEmails;

    this.setState({
      email: tempEmail
    });

    //this.props.setSoarFlowData('email', tempData, activeElement);
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
   * Display individual form
   * @method
   * @param {string} operator - soar operator
   * @param {string} key - key of the form data
   * @param {number} i - index of the form data
   */
  displayForm = (operator, key, i) => {
    const {from, soarColumns, activeElementType, activeElement} = this.props;
    const {multiOperator} = this.state;
    const value = soarColumns.spec[operator][key];
    const label = t('soar.txt-' + key);
    const operatorValue = this.state[operator];
    const textValue = (operatorValue ? operatorValue[key] : '') || '';

    if (typeof value === 'string' && operatorValue) {
      if (key === 'content') { //For email content
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
            required
            error={!textValue}
            helperText={textValue ? '' : t('txt-required')}
            value={textValue}
            onChange={this.handleDataChange.bind(this, operator)} />
        </div>
      )
    } else if (typeof value === 'object' && operatorValue) {
      if (operator === 'and' || operator === 'or') {
        const data = {
          from,
          soarColumns,
          activeElementType,
          activeElement,
          operatorValue: operator
        };

        return (
          <MultiInput
            key={i}
            base={MultiOperator}
            value={this.state[operator].operators}
            props={data}
            onChange={this.setMultiOperatorData.bind(this, operator)} />
        )
      } else if (operator === 'email' && key === 'receiver') { //For email recipient
        return (
          <div key={i} className='group'>
            <label>{label}</label>
            <ReactMultiEmail
              emails={textValue}
              onChange={this.handleEmailChange}
              getLabel={this.getLabel} />
          </div>
        )
      }
    }
  }
  /**
   * Set multi operator data
   * @method
   * @param {string} type - operator type ('and' or 'or')
   * @param {array} operatorData - operator data to be set
   */
  setMultiOperatorData = (type, operatorData) => {
    const {from, activeElement} = this.props;
    let tempData = {...this.state[type]};
    tempData.operators = operatorData;

    this.setState({
      [type]: tempData
    });

    if (from === 'soarCondition') {
      this.props.setSoarConditionData(type, operatorData);
    } else if (from === 'soarFlow') {
      //this.props.setSoarFlowData(type, tempData, activeElement);
    }
  }
  /**
   * Show corresponding form group
   * @method
   * @param {string} operator - soar operator
   * @returns HTML DOM
   */
  showFormGroup = (operator) => {
    const operatorValue = this.state[operator];

    if (operatorValue) {
      return Object.keys(this.props.soarColumns.spec[operatorValue]).map(this.displayForm.bind(this, operatorValue));
    }
  }
  /**
   * Display dropdown selection
   * @method
   * @param {string} operator - soar operator
   * @param {string} operatorList - soar operator list
   */
  displayDropDownSelection = (operator, operatorList) => {
    return (
      <React.Fragment>
        <div className='group'>
          <TextField
            id={operator}
            name='operator'
            select
            label='Operator'
            variant='outlined'
            fullWidth
            size='small'
            value={this.state[operator]}
            onChange={this.handleOperatorDataChange.bind(this, operator)}>
            {this.state[operatorList]}
          </TextField>
        </div>
        {this.showFormGroup(operator)}
      </React.Fragment>
    )
  }
  /**
   * Display name/group form
   * @method
   */
  displayNameGroupForm = () => {
    const {activeElement} = this.props;
    const {nodeGroupList, nodeCustomName, nodeCustomGroup} = this.state;

    return (
      <React.Fragment>
        <div className='group'>
          <TextField
            id='nodeCustomName'
            name='nodeCustomName'
            label={t('txt-name')}
            variant='outlined'
            fullWidth
            size='small'
            value={nodeCustomName}
            onChange={this.handleNodeDataChange} />
        </div>
        {activeElement.componentType === 'node' &&
          <div className='group'>
            <TextField
              id='nodeCustomGroup'
              name='nodeCustomGroup'
              select
              label={t('txt-group')}
              variant='outlined'
              fullWidth
              size='small'
              value={nodeCustomGroup}
              onChange={this.handleNodeDataChange}>
              {nodeGroupList}
            </TextField>
          </div>
        }
      </React.Fragment>
    )
  }
  render() {
    const {from, activeElementType, activeElement} = this.props;

    if (activeElementType === 'link') {
      return (
        <div className='soar-form'>
          {from === 'soarFlow' &&
            this.displayNameGroupForm()
          }
          {this.displayDropDownSelection('soarLinkOperator', 'linkOperatorList')}
        </div>
      )
    } else if (activeElementType === 'node') {
      if (activeElement.componentType === 'adapter') {
        return (
          <div className='soar-form'>
            {this.displayDropDownSelection('soarNodeAdapterOperator', 'nodeAdapterOperatorList')}
          </div>
        )
      } else if (activeElement.componentType === 'node') {
        return (
          <div className='soar-form'>
            {this.displayNameGroupForm()}
            {this.displayDropDownSelection('soarNodeOperator', 'nodeOperatorList')}
          </div>
        )
      } else if (activeElement.componentType === 'action') {
        return (
          <div className='soar-form'>
            {this.displayNameGroupForm()}
            {this.displayDropDownSelection('soarNodeActionOperator', 'nodeActionOperatorList')}
          </div>
        )
      }
    }
  }
}

SoarForm.contextType = BaseDataContext;

SoarForm.propTypes = {
  from: PropTypes.string.isRequired,
  soarColumns: PropTypes.object.isRequired,
  activeElementType: PropTypes.string.isRequired,
  soarCondition: PropTypes.object,
  soarFlow: PropTypes.array,
  activeElement: PropTypes.object,
  setSoarConditionData: PropTypes.func,
  setSoarFlowData: PropTypes.func
};

export default SoarForm;