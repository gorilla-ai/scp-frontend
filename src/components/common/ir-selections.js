import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

const FULL_IR_LIST = ['dumpMemory', 'getSystemInfoFile', 'getFileInfo', 'getProcessInfo', 'getAutoruns', 'getTaskScheduler', 'getBrowserData', 'getOutlookData', 'getRegistryBackup', 'getEventLogFile', 'getRecycleFile', 'getRecentFile', 'getPictureFile', 'getVideoFile', 'getMicrosoftFile', 'getKeyWordFile'];
const QUICK_IR_LIST = ['getSystemInfoFile', 'getProcessInfo', 'getAutoruns', 'getTaskScheduler', 'getRegistryBackup', 'getEventLogFile'];
const STANDARD_IR_LIST = ['dumpMemory', 'getSystemInfoFile', 'getFileInfo', 'getProcessInfo', 'getAutoruns', 'getTaskScheduler', 'getRegistryBackup', 'getEventLogFile', 'getRecentFile'];
const LINUX_IR_LIST = ['getSystemInfoFile', 'getFileInfo', 'getProcessInfo'];

let t = null;

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
      irSelectedList: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidMount() {
    this.setIrList();
    this.setSelectedList('quick');
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
   * Set IR selected list
   * @method
   * @param {object} type - IR type ('quick', 'standard' or 'full')
   */
  setSelectedList = (type) => {
    const {currentDeviceData} = this.props;
    let irSelectedList = [];

    if (type === 'quick') {
      if (currentDeviceData.osType && currentDeviceData.osType === 'linux') {
        irSelectedList = _.cloneDeep(LINUX_IR_LIST);
      } else {
        irSelectedList = _.cloneDeep(QUICK_IR_LIST);
      }
    } else if (type === 'standard') {
      irSelectedList = _.cloneDeep(STANDARD_IR_LIST);
    } else if (type === 'full') {
      irSelectedList = _.cloneDeep(FULL_IR_LIST);
    }

    this.setState({
      irSelectedList
    });
  }
  /**
   * Handle IR combo dropdown change
   * @method
   * @param {object} event - event object
   */
  handleIrComboChange = (event) => {
    this.setSelectedList(event.target.value);

    this.setState({
      irComboSelected: event.target.value
    });
  }
  /**
   * Check if item is already in the selected list
   * @method
   * @param {string} val - checked item name
   * @returns boolean true/false
   */
  checkSelectedItem = (val) => {
    return _.includes(this.state.irSelectedList, val);
  }
  /**
   * Handle checkbox check/uncheck
   * @method
   * @param {object} event - event object
   */
  toggleCheckbox = (event) => {
    let irSelectedList = _.cloneDeep(this.state.irSelectedList);

    if (event.target.checked) {
      irSelectedList.push(event.target.name);
    } else {
      const index = irSelectedList.indexOf(event.target.name);
      irSelectedList.splice(index, 1);
    }

    this.setState({
      irSelectedList
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
    const {currentDeviceData} = this.props;
    let disabled = false;

    if (currentDeviceData.osType && currentDeviceData.osType === 'linux') {
      disabled = !_.includes(LINUX_IR_LIST, val.value);
    }

    return (
      <FormControlLabel
        key={i}
        label={val.text}
        control={
          <Checkbox
            className='checkbox-ui'
            name={val.value}
            checked={this.checkSelectedItem(val.value)}
            onChange={this.toggleCheckbox}
            color='primary' />
        }
        disabled={disabled} />
    )
  }
  /**
   * Display IR selection content
   * @method
   * @returns HTML DOM
   */
  displayIRselection = () => {
    const {currentDeviceData} = this.props;
    const {irComboSelected, irItemList} = this.state;
    let list = ['quick', 'standard', 'full'];

    if (currentDeviceData.osType && currentDeviceData.osType === 'linux') {
      list = ['quick'];
    }

    const dropDownList = _.map(list, (val, i) => {
      return <MenuItem key={i} value={val}>{t('network-inventory.ir-type.txt-' + val)}</MenuItem>
    });

    return (
      <div>
        <TextField
          className='ir-comboList'
          select
          variant='outlined'
          fullWidth={true}
          size='small'
          value={irComboSelected}
          onChange={this.handleIrComboChange}>
          {dropDownList}
        </TextField>
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
    this.props.triggerTask(this.state.irSelectedList);
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
  currentDeviceData: PropTypes.object.isRequired,
  toggleSelectionIR: PropTypes.func.isRequired,
  triggerTask: PropTypes.func.isRequired
};

export default IrSelections;