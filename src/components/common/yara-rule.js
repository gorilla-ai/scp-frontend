import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'

import helper from './helper'
import InputPath from './input-path'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

/**
 * Yara Rule input
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
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
      filePathChecked: false,
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
   * Handle checkbox check/uncheck
   * @method
   * @param {object} event - event object
   */
  toggleCheckbox = (event) => {
    let tempYaraRule = {...this.state.yaraRule};
    tempYaraRule.pathData = [{
      path: ''
    }];

    this.setState({
      yaraRule: tempYaraRule,
      filePathChecked: event.target.checked,
      info: ''
    });
  }
  /**
   * Validate input data
   * @method
   */
  validateInputData = () => {
    const {yaraRule, filePathChecked} = this.state;
    let errorMsg = '';

    if (!yaraRule.rule) {
      errorMsg = t('txt-checkRequiredFieldType');
    } else if (filePathChecked && yaraRule.pathData[0].path === '') {
      errorMsg = t('hmd-scan.txt-includePathEmpty');
    }

    if (errorMsg) {
      this.setState({
        info: errorMsg
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
    const {yaraRule, filePathChecked} = this.state;

    return (
      <div className='form-group normal'>
        <div className='group'>
          <TextField
            id='yaraRuleContent'
            name='rule'
            label={t('hmd-scan.txt-yaraRules')}
            multiline
            rows={10}
            variant='outlined'
            fullWidth
            size='small'
            value={yaraRule.rule}
            onChange={this.handleDataChange} />
        </div>
        <div className='group checkbox'>
          <FormControlLabel
            label={t('hmd-scan.txt-scanProcess')}
            control={
              <Checkbox
                id='yaraScanType'
                className='checkbox-ui'
                checked={true}
                color='primary'
                disabled  />
            } />
          <FormControlLabel
            label={t('hmd-scan.txt-scanFilePath')}
            control={
              <Checkbox
                id='filePath'
                className='checkbox-ui'
                name='filePath'
                checked={filePathChecked}
                onChange={this.toggleCheckbox}
                color='primary' />
            } />
        </div>
        {filePathChecked &&
          <div className='group'>
            <label>{t('hmd-scan.txt-includePath')}</label>
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