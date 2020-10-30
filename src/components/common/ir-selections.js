import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

const FULL_IR_LIST = ['dumpMemory', 'getSystemInfoFile', 'getFileInfo', 'getProcessInfo', 'getAutoruns', 'getTaskScheduler', 'getBrowserData', 'getOutlookData', 'getRegistryBackup', 'getEventLogFile', 'getRecycleFile', 'getRecentFile', 'getPictureFile', 'getVideoFile', 'getMicrosoftFile', 'getKeyWordFile'];
const QUICK_IR_LIST = ['getSystemInfoFile', 'getProcessInfo', 'getAutoruns', 'getTaskScheduler', 'getRegistryBackup', 'getEventLogFile'];
const STANDARD_IR_LIST = ['dumpMemory', 'getSystemInfoFile', 'getFileInfo', 'getProcessInfo', 'getAutoruns', 'getTaskScheduler', 'getRegistryBackup', 'getEventLogFile', 'getRecentFile'];

let t = null;

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
 * IR combo selections
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the IR combo selection list
 */
class IrSelections extends Component {
  constructor(props) {
    super(props);

    this.state = {
      irComboSelected: 'quick', //'quick', 'standard', 'full'
      irItemList: [],
      irItemOptions: {}
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidMount() {
    this.setIrList();
    this.setCurrentOptions('quick');
  }
  /**
   * Set IR list for display
   * @method
   * @param {object} event - event object
   */
  setIrList = () => {
    const irItemList = _.map(FULL_IR_LIST, (val, i) => {
      const item = i + 1;

      return {
        value: val,
        text: item + ' - ' + t('network-inventory.ir-list.txt-list' + item)
      };
    });

    this.setState({
      irItemList
    });
  }
  /**
   * Set IR options
   * @method
   * @param {object} type - IR type ('quick', 'standard' or 'full')
   */
  setCurrentOptions = (type) => {
    let irItemOptions = {};

    if (type === 'full') {
      _.forEach(FULL_IR_LIST, val => {
        irItemOptions[val] = true;
      })
    } else {
      if (type === 'quick' || type === 'standard') {
        let irList = '';

        if (type === 'quick') {
          irList = QUICK_IR_LIST;
        } else if (type === 'standard') {
          irList = STANDARD_IR_LIST;
        }

        _.forEach(FULL_IR_LIST, val => {
          irItemOptions[val] = false;

          _.forEach(irList, val2 => {
            if (val2 === val) {
              irItemOptions[val] = true;
            }
          })
        })
      }
    }

    this.setState({
      irItemOptions
    });
  }
  /**
   * Handle IR combo dropdown change
   * @method
   * @param {object} event - event object
   */
  handleIrComboChange = (event) => {
    this.setCurrentOptions(event.target.value);

    this.setState({
      irComboSelected: event.target.value
    });
  }
  /**
   * Handle checkbox selections
   * @method
   * @param {object} event - event object
   */
  toggleCheckboxOptions = (event) => {
    let tempIrItemOptions = {...this.state.irItemOptions};
    tempIrItemOptions[event.target.name] = event.target.checked;

    this.setState({
      irItemOptions: tempIrItemOptions
    });
  }
  /**
   * Display checkbox for IR selections
   * @method
   * @param {object} val - individual IR type
   * @param {number} i - index of the IR type
   * @returns HTML DOM
   */
  showCheckboxList = (val, i) => {
    return (
      <FormControlLabel
        key={i}
        label={val.text}
        control={
          <Checkbox
            className='checkbox-ui'
            name={val.value}
            checked={this.state.irItemOptions[val.value]}
            onChange={this.toggleCheckboxOptions}
            color='primary' />
        } />
    )
  }
  /**
   * Display IR selection content
   * @method
   * @returns HTML DOM
   */
  displayIRselection = () => {
    const {irComboSelected, irItemList} = this.state;
    const dropDownList = _.map(['quick', 'standard', 'full'], (val, i) => {
      return <MenuItem key={i} value={val}>{t('network-inventory.ir-type.txt-' + val)}</MenuItem>
    });

    return (
      <div>
        <StyledTextField
          className='ir-comboList'
          select
          variant='outlined'
          fullWidth={true}
          size='small'
          value={irComboSelected}
          onChange={this.handleIrComboChange}>
          {dropDownList}
        </StyledTextField>
        <div className='ir-selections'>
          {irItemList.map(this.showCheckboxList)}
        </div>
      </div>
    )
  }
  /**
   * Handle IR selection confirm
   * @method
   */
  confirmIRselection = () => {
    let selectedIrArr = [];

    _.forEach(this.state.irItemOptions, (val, key) => {
      if (val) {
        selectedIrArr.push(key);
      }
    });

    this.props.triggerTask(selectedIrArr);
  }
  render() {
    const titleText = t('network-inventory.txt-itemSelection');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.toggleSelectionIR},
      confirm: {text: t('txt-confirm'), handler: this.confirmIRselection}
    };

    return (
      <ModalDialog
        id='irSelectionDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayIRselection()}
      </ModalDialog>
    )
  }
}

IrSelections.propTypes = {
  toggleSelectionIR: PropTypes.func.isRequired,
  triggerTask: PropTypes.func.isRequired
};

export default IrSelections;