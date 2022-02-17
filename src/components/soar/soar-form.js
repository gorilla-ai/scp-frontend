import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import { ReactMultiEmail } from 'react-multi-email'

import MenuItem from '@material-ui/core/MenuItem'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MultiOperator from './multi-operator'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const COUNT_LIST = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

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
      linkPriorityList: [],
      linkPriority: '',
      linkOperatorList: [],
      linkOperatorListReduce: [],
      nodeAdapterOperatorList: [],
      nodeOperatorList: [],
      nodeActionOperatorList: [],
      soarLinkOperator: '',
      soarLoopOperator: '',
      soarNodeAdapterOperator: '',
      soarNodeOperator: '',
      soarNodeActionArgs: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.setOperatorList();
  }
  /**
   * Set node and link operator list
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

    let nodeGroupList = [];
    nodeGroupList.push(<MenuItem value='' style={{height: '30px'}}></MenuItem>);

     _.map(COUNT_LIST, (val, i) => {
      nodeGroupList.push(<MenuItem key={i} value={val}>{val}</MenuItem>);
    });

    let linkPriorityList = [];
    linkPriorityList.push(<MenuItem value='' style={{height: '30px'}}></MenuItem>);

     _.map(COUNT_LIST, (val, i) => {
      linkPriorityList.push(<MenuItem key={i} value={val}>{val}</MenuItem>);
    });

    const linkOperatorList = _.map(soarColumns.linkOp, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });
    const linkOperatorListReduce = _.map(linkOp, (val, i) => {
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
      linkPriorityList,
      linkOperatorList,
      linkOperatorListReduce,
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

    let argsData = soarCondition.args;

    if ((soarCondition.op === 'and' || soarCondition.op === 'or') && soarCondition.args) {
      argsData = soarCondition.args.operators;
    }

    this.setState({
      soarLinkOperator: soarCondition.op,
      [soarCondition.op]: argsData
    });
  }
  /**
   * Set soar flow data
   * @method
   */
  setFlowData = () => {
    const {activeElementType, activeElement} = this.props;
    let argsData = activeElement.args;

    if (activeElementType === 'link') {
      if (activeElement.op === 'and' || activeElement.op === 'or') {
        argsData = activeElement.args ? activeElement.args.operators : [];
      }

      this.setState({
        nodeCustomName: activeElement.label,
        linkPriority: activeElement.priority,
        soarLinkOperator: activeElement.op,
        [activeElement.op]: argsData
      });
    } else if (activeElementType === 'node') {
      if (activeElement.componentType === 'adapter') {
        this.setState({
          nodeCustomName: activeElement.data.label,
          soarNodeAdapterOperator: activeElement.adapter_type,
          [activeElement.adapter_type]: activeElement.args
        });
      } else if (activeElement.componentType === 'node') {
        if (activeElement.op === 'loop') { //Special case for loop item
          this.setState({
            soarLoopOperator: activeElement.args.loopItem.op,
            [activeElement.args.loopItem.op]: activeElement.args.loopItem.args
          });
        }

        this.setState({
          nodeCustomName: activeElement.data.label,
          nodeCustomGroup: activeElement.group,
          soarNodeOperator: activeElement.op,
          [activeElement.op]: activeElement.args
        });
      } else if (activeElement.componentType === 'action') {
        argsData = activeElement.args ? activeElement.args.actions : [];

        this.setState({
          nodeCustomName: activeElement.data.label,
          soarNodeActionArgs: argsData
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
   * @param {string} type - data input type ('soarLinkOperator', 'soarNodeOperator', soarNodeAdapterOperator')
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
   * Display individual form
   * @method
   * @param {string} operator - soar operator
   * @param {string} key - key of the form data
   * @param {number} i - index of the form data
   */
  displayForm = (operator, key, i) => {
    const {from, soarColumns, activeElementType, activeElement} = this.props;
    const value = soarColumns.spec[operator][key];
    const operatorValue = this.state[operator];
    const textValue = (operatorValue ? operatorValue[key] : '') || '';
    let label = t('soar.txt-' + key);

    if (key === 'gap') { //Spcieal case for scp gap
      label = 'Gap (' + t('txt-minutes') + ')';
    }

    if (typeof value === 'string' && operatorValue) {
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
    } else if (typeof value === 'object' && operatorValue) {
      if (operator === 'loop') { //Special case for node loop item
        return (
          <div className='link-form'>
            {this.displayDropDownSelection('soarLoopOperator', 'linkOperatorListReduce')}
          </div>
        )
      } else if (operator === 'and' || operator === 'or') { //Special case for link and/or operator
        const data = {
          from,
          soarColumns,
          activeElementType,
          activeElement
        };
        const value = this.state[operator].operators ? this.state[operator].operators : this.state[operator];

        return (
          <MultiInput
            key={i}
            base={MultiOperator}
            defaultItemValue={{
                op: '',
                args: {}
              }
            }
            value={value}
            props={data}
            onChange={this.setMultiOperatorData.bind(this, operator)} />
        )
      }
    }
  }
  /**
   * Set multi operator data
   * @method
   * @param {string} type - operator type ('and', 'or' or 'soarNodeActionArgs')
   * @param {array} operatorData - operator data to be set
   */
  setMultiOperatorData = (type, operatorData) => {
    const {from, activeElement} = this.props;

    this.setState({
      [type]: operatorData
    });

    if (from === 'soarCondition') {
      this.props.setSoarConditionData(type, operatorData);
    } else if (from === 'soarFlow') {
      this.props.setSoarFlowData(type, operatorData, activeElement);
    }
  }
  /**
   * Show corresponding form group
   * @method
   * @param {string} operator - soar operator
   * @returns HTML DOM
   */
  showFormGroup = (operator) => {
    if (this.state[operator]) {
      return Object.keys(this.props.soarColumns.spec[this.state[operator]]).map(this.displayForm.bind(this, this.state[operator]));
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
            name='op'
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
    const {linkPriorityList, linkPriority, nodeGroupList, nodeCustomName, nodeCustomGroup} = this.state;

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
            onChange={this.handleNodeDataChange}
            disabled={activeElement.componentType === 'adapter'} />
        </div>
        {activeElement.componentType === 'link' &&
          <div className='group'>
            <TextField
              id='linkPriority'
              name='linkPriority'
              select
              label={t('txt-priority')}
              variant='outlined'
              fullWidth
              size='small'
              value={linkPriority}
              onChange={this.handleNodeDataChange}>
              {linkPriorityList}
            </TextField>
          </div>
        }
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
    const {soarNodeActionArgs} = this.state;
    const {from, soarColumns, activeElementType, activeElement} = this.props;

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
            {this.displayNameGroupForm()}
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
        const data = {
          from,
          soarColumns,
          activeElementType,
          activeElement
        };

        return (
          <div className='soar-form'>
            {this.displayNameGroupForm()}
            <MultiInput
              base={MultiOperator}
              defaultItemValue={{
                op: '',
                args: {},
              }}
              value={soarNodeActionArgs}
              props={data}
              onChange={this.setMultiOperatorData.bind(this, 'soarNodeActionArgs')} />
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