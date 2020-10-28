import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

const IR_MAPPINGS = {
  1: 'dumpMemory',
  2: 'getSystemInfoFile',
  3: 'getFileInfo',
  4: 'getProcessInfo',
  5: 'getAutoruns',
  6: 'getTaskScheduler',
  7: 'getBrowserData',
  8: 'getOutlookData',
  9:  'getRegistryBackup',
  10: 'getEventLogFile',
  11: 'getRecycleFile',
  12: 'getRecentFile',
  13: 'getPictureFile',
  14: 'getVideoFile',
  15: 'getMicrosoftFile',
  16: 'getKeyWordFile'
};
const DEFAULT_IR_SELECTED = [2, 4, 5, 6, 9, 10];

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
      irComboSelected: 'quick', //quick, standard, full
      irItemSelected: DEFAULT_IR_SELECTED
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Handle IR combo dropdown change
   * @method
   * @param {object} event - event object
   */
  handleIrComboChange = (event) => {
    const value = event.target.value;
    let irItemSelected = [];

    if (value === 'quick') {
      irItemSelected = DEFAULT_IR_SELECTED;
    } else if (value === 'standard') {
      irItemSelected = _.concat(_.range(1, 7), [9, 10, 12]);
    } else if (value === 'full') {
      irItemSelected = _.range(1, 17);
    }

    this.setState({
      irComboSelected: value,
      irItemSelected
    });
  }
  /**
   * Handle IR combo multi checkbox change
   * @method
   * @param {array} selected - selected checkbox array
   */
  handleIrSelectionChange = (selected) => {
    const irItemSelected = selected.sort((a, b) => {
      return a - b;
    });

    this.setState({
      irItemSelected
    });
  }
  /**
   * Display IR selection content
   * @method
   * @returns HTML DOM
   */
  displayIRselection = () => {
    const {irComboSelected, irItemSelected} = this.state;
    const dropDownList = _.map(['quick', 'standard', 'full'], (val, i) => {
      return <MenuItem key={i} value={val}>{t('network-inventory.ir-type.txt-' + val)}</MenuItem>
    });
    const checkBoxList = _.map(_.range(1, 17), val => {
      return {
        value: val,
        text: val + ' - ' + t('network-inventory.ir-list.txt-list' + val)
      };
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
        <CheckboxGroup
          list={checkBoxList}
          value={irItemSelected}
          onChange={this.handleIrSelectionChange} />
      </div>
    )
  }
  /**
   * Handle IR selection confirm
   * @method
   */
  confirmIRselection = () => {
    const selectedIrArr = _.map(this.state.irItemSelected, val => {
      return IR_MAPPINGS[val];
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