import React, { Component } from 'react'
import PropTypes from 'prop-types'

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'

import helper from './helper'
import InputPath from './input-path'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

/**
 * Yara Rule input
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to display yara rule input box
 */
class YaraRule extends Component {
  constructor(props) {
    super(props);

    this.state = {
      yaraRule: {
        rule: '',
        pathData: [{
          path: ''
        }]
      },
      scanType: 'process', //'process' or 'filePath'
      info: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  /**
   * Handle yara rule input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempYaraRule = {...this.state.yaraRule};
    tempYaraRule[event.target.name] = event.target.value;

    this.setState({
      yaraRule: tempYaraRule
    });
  }
  /**
   * Handle scan type data change
   * @method
   * @param {object} event - event object
   */
  handleScanTypeChange = (event) => {
    const value = event.target.value;
    let tempYaraRule = {...this.state.yaraRule};

    if (value === 'process') {
      tempYaraRule.pathData = [{
        path: ''
      }];

      this.setState({
        yaraRule: tempYaraRule
      });
    }

    this.setState({
      scanType: value,
      info: ''
    });
  }
  /**
   * Validate input data
   * @method
   */
  validateInputData = () => {
    const {yaraRule, scanType} = this.state;

    if (!yaraRule.rule || (scanType === 'filePath' && yaraRule.pathData.length === 0)) {
      this.setState({
        info: t('network-inventory.txt-includePathEmpty')
      });
      return;
    }

    this.props.checkYaraRule(yaraRule);
  }
  /**
   * Set path data
   * @method
   * @param {array} pathData - path data to be set
   */
  setPathData = (pathData) => {
    let tempYaraRule = {...this.state.yaraRule};
    tempYaraRule.pathData = pathData;

    this.setState({
      yaraRule: tempYaraRule
    });
  }
  /**
   * Display yara rule content
   * @method
   * @returns HTML DOM
   */
  displayYaraRule = () => {
    const {yaraRule, scanType} = this.state;

    return (
      <div className='form-group normal'>
        <div className='group'>
          <TextField
            id='yaraRuleContent'
            name='rule'
            label={t('network-inventory.txt-yaraRules')}
            multiline={true}
            rows={10}
            variant='outlined'
            fullWidth={true}
            size='small'
            value={yaraRule.rule}
            onChange={this.handleDataChange} />
        </div>
        <div className='group'>
          <RadioGroup
            id='yaraScanType'
            className='radio-group'
            value={scanType}
            onChange={this.handleScanTypeChange}>
            <FormControlLabel
              value='process'
              control={
                <Radio
                  className='radio-ui'
                  color='primary' />
              }
              label={t('network-inventory.txt-scanProcess')} />
            <FormControlLabel
              value='filePath'
              control={
                <Radio
                  className='radio-ui'
                  color='primary' />
              }
              label={t('network-inventory.txt-scanFilePath')} />
          </RadioGroup>
        </div>
        {scanType === 'filePath' &&
          <div className='group'>
            <label>{t('network-inventory.txt-includePath')}</label>
            <MultiInput
              base={InputPath}
              inline={false}
              value={yaraRule.pathData}
              onChange={this.setPathData} />
          </div>
        }
      </div>
    )
  }
  render() {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.toggleYaraRule},
      confirm: {text: t('txt-confirm'), handler: this.validateInputData}
    };

    return (
      <ModalDialog
        id='yaraRuleDialog'
        className='modal-dialog'
        draggable={true}
        global={true}
        actions={actions}
        info={this.state.info}
        closeAction='cancel'>
        {this.displayYaraRule()}
      </ModalDialog>
    )
  }
}

YaraRule.propTypes = {
  toggleYaraRule: PropTypes.func.isRequired,
  checkYaraRule: PropTypes.func.isRequired
};

export default YaraRule;