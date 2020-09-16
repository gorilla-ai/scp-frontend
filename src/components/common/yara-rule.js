import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import RadioGroup from 'react-ui/build/src/components/radio-group'
import Textarea from 'react-ui/build/src/components/textarea'

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
      tempYaraRule.pathData = [{
        path: ''
      }];

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