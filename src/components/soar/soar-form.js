import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

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
      linkOperatorList: [],
      nodeAdapterOperatorList: [],
      nodeOperatorList: [],
      nodeActionOperatorList: [],
      soarLinkOperator: '',
      soarNodeAdapterOperator: '',
      soarNodeOperator: '',
      soarNodeActionOperator: ''
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

    this.setState({
      soarLinkOperator: soarCondition.op,
      [soarCondition.op]: soarCondition.args
    });
  }
  /**
   * Set soar flow data
   * @method
   */
  setFlowData = () => {
    const {activeElementType, activeElement} = this.props;

    if (activeElementType === 'link') {
      this.setState({
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
          soarNodeOperator: activeElement.op,
          [activeElement.op]: activeElement.args
        });
      } else if (activeElement.componentType === 'action') {
        // this.setState({
        //   soarNodeOperator: activeElement.op,
        //   [activeElement.op]: activeElement.args
        // });
      }
    }
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
   * Display individual form
   * @method
   * @param {string} operator - soar operator
   * @param {string} key - key of the form data
   * @param {number} i - index of the form data
   */
  displayForm = (operator, key, i) => {
    const value = this.props.soarColumns.spec[operator][key];
    const label = t('soar.txt-' + key);
    const operatorValue = this.state[operator];
    const textValue = (operatorValue ? operatorValue[key] : '') || '';

    if (typeof value === 'string' && operatorValue) {
      return (
        <div className='group' key={i}>
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
        <div className='group' key={i}>
          <TextField
            name={key}
            select
            label={label}
            variant='outlined'
            fullWidth
            size='small'
            value={textValue}
            onChange={this.handleDataChange.bind(this, operator)}>
            <MenuItem value={true}>True</MenuItem>
            <MenuItem value={false}>False</MenuItem>
          </TextField>
        </div>
      )
    } else if (typeof value === 'number' && operatorValue) {
      return (
        <div className='group' key={i}>
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
      <div className='soar-form'>
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
      </div>
    )
  }
  render() {
    const {activeElementType, activeElement} = this.props;

    if (activeElementType === 'link') {
      return this.displayDropDownSelection('soarLinkOperator', 'linkOperatorList');
    } else if (activeElementType === 'node') {
      if (activeElement.componentType === 'adapter') {
        return this.displayDropDownSelection('soarNodeAdapterOperator', 'nodeAdapterOperatorList');
      } else if (activeElement.componentType === 'node') {
        return this.displayDropDownSelection('soarNodeOperator', 'nodeOperatorList');
      } else if (activeElement.componentType === 'action') {
        return this.displayDropDownSelection('soarNodeActionOperator', 'nodeActionOperatorList');
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
  soarFlow: PropTypes.object,
  activeElement: PropTypes.object,
  setSoarConditionData: PropTypes.func
};

export default SoarForm;