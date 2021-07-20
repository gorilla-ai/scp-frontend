import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
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
      nodeOperatorList: [],
      soarLinkOperator: '',
      soarNodeOperator: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.setOperatorList();
    this.setInitializeState();
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
    const nodeOperatorList = _.map(soarColumns.nodeOp, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    this.setState({
      linkOperatorList,
      nodeOperatorList
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
        this.setSoarCondition();
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
   * Handle operator data change
   * @method
   * @param {string} type - data input type ('soarLinkOperator' or 'soarNodeOperator')
   * @param {object} event - event object
   */
  handleOperatorDataChange = (type, event) => {
    this.setState({
      [type]: event.target.value
    });

    this.props.setSoarConditionData(event.target.value, this.state[event.target.value]);
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

    this.props.setSoarConditionData(type, tempData);
  }
  /**
   * Display individual form
   * @method
   * @param {string} key - key of the form data
   * @param {number} i - index of the form data
   */
  displayForm = (key, i) => {
    const {soarColumns} = this.props;
    const {soarLinkOperator} = this.state;
    const value = soarColumns.spec[soarLinkOperator][key];

    if (value === '') {
      return (
        <div className='group' key={i}>
          <TextField
            name={key}
            label={helper.capitalizeFirstLetter(key)}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!this.state[soarLinkOperator][key]}
            helperText={this.state[soarLinkOperator][key] ? '' : t('txt-required')}
            value={this.state[soarLinkOperator][key]}
            onChange={this.handleDataChange.bind(this, soarLinkOperator)} />
        </div>
      )
    } else if (value === false) {
      return (
        <div className='group' key={i}>
          <TextField
            name={key}
            select
            label={helper.capitalizeFirstLetter(key)}
            variant='outlined'
            fullWidth
            size='small'
            value={this.state[soarLinkOperator][key]}
            onChange={this.handleDataChange.bind(this, soarLinkOperator)}>
            <MenuItem value={true}>True</MenuItem>
            <MenuItem value={false}>False</MenuItem>
          </TextField>
        </div>
      )
    } else if (value === 0) {
      return (
        <div className='group' key={i}>
          <TextField
            name={key}
            type='number'
            label={helper.capitalizeFirstLetter(key)}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!this.state[soarLinkOperator][key]}
            helperText={this.state[soarLinkOperator][key] ? '' : t('txt-required')}
            value={this.state[soarLinkOperator][key]}
            onChange={this.handleDataChange.bind(this, soarLinkOperator)} />
        </div>
      )
    }
  }
  /**
   * Show corresponding form group
   * @method
   * @returns HTML DOM
   */
  showFormGroup = () => {
    const {soarColumns, showOperator} = this.props;
    const {soarLinkOperator, soarNodeOperator} = this.state;

    if (showOperator === 'link') {
      if (soarLinkOperator) {
        return Object.keys(soarColumns.spec[soarLinkOperator]).map(this.displayForm);
      }
    } else if (showOperator === 'node') {
      return (
        <div></div>
      )
    }
  }
  render() {
    const {showOperator} = this.props;
    const {linkOperatorList, nodeOperatorList, soarLinkOperator, soarNodeOperator} = this.state;

    if (showOperator === 'link') {
      return (
        <React.Fragment>
          <div className='group'>
            <TextField
              id='soarLinkOperator'
              name='operator'
              select
              label='Operator'
              variant='outlined'
              fullWidth
              size='small'
              value={soarLinkOperator}
              onChange={this.handleOperatorDataChange.bind(this, 'soarLinkOperator')}>
              {linkOperatorList}
            </TextField>
          </div>
          {this.showFormGroup()}
        </React.Fragment>
      )
    } else if (showOperator === 'node') {
      return (
        <React.Fragment>
          <div className='group'>

          </div>
        </React.Fragment>
      )
    }
  }
}

SoarForm.contextType = BaseDataContext;

SoarForm.propTypes = {
  soarColumns: PropTypes.object.isRequired,
  showOperator: PropTypes.string.isRequired,
  soarCondition: PropTypes.object.isRequired,
  soarFlow: PropTypes.object.isRequired
};

export default SoarForm;