import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import { ReactMultiEmail } from 'react-multi-email'

import MenuItem from '@material-ui/core/MenuItem'
import MultiInput from 'react-ui/build/src/components/multi-input'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MultiOperator from './multi-operator'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

/**
 * SoarLinkForm
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the SOAR link form
 */
class SoarLinkForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      linkOperatorList: [],
      soarLinkOperator: ''
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
    let linkOp = _.cloneDeep(soarColumns.linkOp);
    let index = '';
    index = linkOp.indexOf('and');
    linkOp.splice(index, 1);
    index = linkOp.indexOf('or');
    linkOp.splice(index, 1);

    const linkOperatorList = _.map(linkOp, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    this.setState({
      linkOperatorList
    }, () => {
      this.setInitializeState();
    });
  }
  /**
   * Set intialize soar data
   * @method
   */
  setInitializeState = () => {
    const {soarColumns, loopItem} = this.props;

    Object.keys(soarColumns.spec).forEach(key => {
      this.setState({
        [key]: soarColumns.spec[key]
      }, () => {
        if (loopItem) {
          this.setFlowData();
        }
      });
    });
  }
  /**
   * Set soar flow data
   * @method
   */
  setFlowData = () => {
    const {loopItem} = this.props;

    this.setState({
      soarLinkOperator: loopItem.op,
      [loopItem.op]: loopItem.args
    });
  }
  /**
   * Handle operator data change
   * @method
   * @param {object} event - event object
   */
  handleOperatorDataChange = (type, event) => {
    this.setState({
      soarLinkOperator: event.target.value
    });

    this.props.setLoopItemData(event.target.value, this.state[event.target.value]);
  }
  /**
   * Handle form data change
   * @method
   * @param {string} type - data input type
   * @param {object} event - event object
   */
  handleDataChange = (type, event) => {
    let tempData = {...this.state[type]};
    tempData[event.target.name] = event.target.value;

    this.setState({
      [type]: tempData
    });

    this.props.setLoopItemData(type, tempData);
  }
  /**
   * Display individual form
   * @method
   * @param {string} operator - soar operator
   * @param {string} key - key of the form data
   * @param {number} i - index of the form data
   */
  displayForm = (operator, key, i) => {
    const {soarColumns} = this.props;
    const value = soarColumns.spec[operator][key];
    const operatorValue = this.state[operator];
    const textValue = (operatorValue ? operatorValue[key] : '') || '';
    let label = t('soar.txt-' + key);

    if (key === 'gap') {
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
    }
  }
  /**
   * Show corresponding form group
   * @method
   * @param {string} operator - soar operator
   * @returns HTML DOM
   */
  showFormGroup = (operator) => {
    if (operator) {
      return Object.keys(this.props.soarColumns.spec[operator]).map(this.displayForm.bind(this, operator));
    }
  }
  render() {
    const {linkOperatorList, soarLinkOperator} = this.state;

    return (
      <div className='link-form'>
        <div className='group'>
          <TextField
            id='soarLinkOperator'
            name='op'
            select
            label='Operator'
            variant='outlined'
            fullWidth
            size='small'
            value={soarLinkOperator}
            onChange={this.handleOperatorDataChange.bind(this, soarLinkOperator)}>
            {linkOperatorList}
          </TextField>
        </div>
        {this.showFormGroup(soarLinkOperator)}
      </div>
    )
  }
}

SoarLinkForm.contextType = BaseDataContext;

SoarLinkForm.propTypes = {
  soarColumns: PropTypes.object.isRequired,
  loopItem: PropTypes.object.isRequired,
  setLoopItemData: PropTypes.func.isRequired
};

export default SoarLinkForm;