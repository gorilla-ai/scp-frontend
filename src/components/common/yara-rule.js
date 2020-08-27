import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {ReactMultiEmail} from 'react-multi-email';

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import RadioGroup from 'react-ui/build/src/components/radio-group'
import Textarea from 'react-ui/build/src/components/textarea'

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
        path: []
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
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleDataChange = (type, value) => {
    let tempYaraRule = {...this.state.yaraRule};
    tempYaraRule[type] = value;

    this.setState({
      yaraRule: tempYaraRule
    });
  }
  /**
   * Handle scan type data change
   * @method
   * @param {string} val - scan type ('process' or 'filePath')
   */
  handleScanTypeChange = (val) => {
    let tempYaraRule = {...this.state.yaraRule};

    if (val === 'process') {
      tempYaraRule.path = [];

      this.setState({
        yaraRule: tempYaraRule
      });
    }

    this.setState({
      scanType: val,
      info: ''
    });
  }
  /**
   * Handle yara rule path delete
   * @method
   * @param {function} removePath - function to remove yara rule path
   * @param {number} index - index of the yara rule path list array
   */
  deleteSettingsPath = (removePath, index) => {
    removePath(index);
  }
  /**
   * Handle yara rule path delete
   * @method
   * @param {string} path - individual yara rule path
   * @param {number} index - index of the yara rule path list array
   * @param {function} removePath - function to remove yara rule path
   * @returns HTML DOM
   */
  getLabel = (path, index, removePath) => {
    return (
      <div data-tag key={index}>
        {path}
        <span data-tag-handle onClick={this.deleteSettingsPath.bind(this, removePath, index)}> <span className='font-bold'>x</span></span>
      </div>
    )
  }
  /**
   * Validate include path input
   * @method
   * @param {function} path - path from user's input
   */
  validatePathInput = (path) => {
    let valid = true;

    if (path.indexOf('/') > 0) { //Slash is not allowed
      valid = false;
    }

    if (path[path.length - 1] !== '\\') { //Path has to end with '\\'
      valid = false;
    }

    if (valid) {
      this.setState({
        info: ''
      });
      return path;
    } else {
      this.setState({
        info: t('network-inventory.txt-pathFormatError')
      });
    }
  }
  /**
   * Validate input data
   * @method
   */
  validateInputData = () => {
    const {yaraRule, scanType} = this.state;

    if (!yaraRule.rule || (scanType === 'filePath' && yaraRule.path.length === 0)) {
      this.setState({
        info: t('txt-checkRequiredFieldType')
      });
      return;
    }

    this.props.checkYaraRule(yaraRule);
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
          <label htmlFor='yaraRuleContent'>{t('network-inventory.txt-yaraRules')}</label>
          <Textarea
            id='yaraRuleContent'
            rows={10}
            required={true}
            value={yaraRule.rule}
            onChange={this.handleDataChange.bind(this, 'rule')} />
        </div>
        <div className='group'>
          <RadioGroup
            id='yaraScanType'
            className='radio-group'
            list={[
              {value: 'process', text: t('network-inventory.txt-scanProcess')},
              {value: 'filePath', text: t('network-inventory.txt-scanFilePath')}
            ]}
            value={scanType}
            onChange={this.handleScanTypeChange} />
        </div>
        {scanType === 'filePath' &&
          <div className='group'>
            <label>{t('network-inventory.txt-includePath')} ({t('txt-commaSeparated')})</label>
            <ReactMultiEmail
              emails={yaraRule.path}
              validateEmail={this.validatePathInput}
              onChange={this.handleDataChange.bind(this, 'path')}
              getLabel={this.getLabel} />
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