import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {ReactMultiEmail} from 'react-multi-email';

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
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
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  ryan = () => {

  }
  /**
   * Handle yara rule input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleDataChange = (type, value) => {
    let tempRaraRule = {...this.state.yaraRule};
    tempRaraRule[type] = value;

    this.setState({
      yaraRule: tempRaraRule
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
   * Display yara rule content
   * @method
   * @returns HTML DOM
   */
  displayYaraRule = () => {
    const {yaraRule} = this.state;

    return (
      <div className='form-group normal'>
        <div className='group'>
          <label htmlFor='yaraRuleContent'>{t('network-inventory.txt-yaraRule')}</label>
          <Textarea
            id='yaraRuleContent'
            rows={10}
            value={yaraRule.rule}
            onChange={this.handleDataChange.bind(this, 'rule')} />
        </div>
        <div className='group'>
          <label>{t('network-inventory.txt-includePath')} ({t('txt-commaSeparated')})</label>
          <ReactMultiEmail
            emails={yaraRule.path}
            validateEmail={path => {
              return path;
            }}
            onChange={this.handleDataChange.bind(this, 'path')}
            getLabel={this.getLabel} />
        </div>
      </div>
    )
  }
  render() {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.toggleYaraRule},
      confirm: {text: t('txt-confirm'), handler: this.props.triggerTask.bind(this, ['compareIOC'], '', this.state.yaraRule)}
    };

    return (
      <ModalDialog
        id='yaraRuleDialog'
        className='modal-dialog'
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayYaraRule()}
      </ModalDialog>
    )
  }
}

YaraRule.propTypes = {
  toggleYaraRule: PropTypes.func.isRequired,
  triggerTask: PropTypes.func.isRequired
};

export default YaraRule;