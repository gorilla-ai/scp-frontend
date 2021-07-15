import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const ACTION_TYPE = ['shutdownHost', 'logoffAllUsers', 'netcut', 'netcutResume'];
const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];

let t = null;
let et = null;

/**
 * SoarSingleSettings
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the SOAR individual settings page
 */
class SoarSingleSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      adapterSettings: {
        type: '',
        ip: '',
        port: ''
      },
      nodeSettings: {
        type: '',
        ip: '',
        port: ''
      },
      linkSettings: {
        type: '',
        ip: '',
        port: ''
      },
      soarRule: {
        name: '',
        aggFieldId: ''
      },
      info: '',
      formValidation: {
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
  }
  ryan = () => {}
  /**
   * Handle input data change
   * @method
   * @param {string} string - data input type ('node' or 'link')
   * @param {object} event - event object
   */
  handleDataChange = (type, event) => {
    if (type === 'node') {
      let tempNodeSettings = {...this.state.nodeSettings};
      tempNodeSettings[event.target.name] = event.target.value;

      this.setState({
        nodeSettings: tempNodeSettings
      });
    } else if (type === 'link') {
      let tempLinkSettings = {...this.state.linkSettings};
      tempLinkSettings[event.target.name] = event.target.value;

      this.setState({
        linkSettings: tempLinkSettings
      });
    }
  }
  /**
   * Display rule edit content
   * @method
   * @returns HTML DOM
   */
  displayRuleEdit = () => {
    const {activeElementType} = this.props;
    const {adapterSettings, nodeSettings, linkSettings} = this.state;

    if (activeElementType === 'node') {
      return (
        <div className='form-group normal'>
          <div className='group'>
            <TextField
              id='nodeSettingsType'
              name='type'
              label='Type'
              variant='outlined'
              fullWidth
              size='small'
              value={nodeSettings.type}
              onChange={this.handleDataChange.bind(this, 'node')} />
          </div>
          <div className='group'>
            <TextField
              id='nodeSettingsIp'
              name='ip'
              label='IP'
              variant='outlined'
              fullWidth
              size='small'
              value={nodeSettings.ip}
              onChange={this.handleDataChange.bind(this, 'node')} />
          </div>
          <div className='group'>
            <TextField
              id='nodeSettingsPort'
              name='port'
              label='Port'
              variant='outlined'
              fullWidth
              size='small'
              value={nodeSettings.port}
              onChange={this.handleDataChange.bind(this, 'node')} />
          </div>
        </div>
      )
    } else if (activeElementType === 'link') {
      return (
        <div className='form-group normal'>
          <div className='group'>
            <TextField
              id='linkSettingsType'
              name='type'
              label='Type'
              variant='outlined'
              fullWidth
              size='small'
              value={linkSettings.type}
              onChange={this.handleDataChange.bind(this, 'link')} />
          </div>
          <div className='group'>
            <TextField
              id='linkSettingsIp'
              name='ip'
              label='IP'
              variant='outlined'
              fullWidth
              size='small'
              value={linkSettings.ip}
              onChange={this.handleDataChange.bind(this, 'link')} />
          </div>
        </div>
      )
    }
  }
  render() {
    const {activeElementType} = this.props;
    const titleText = activeElementType + ' ' + t('soar.txt-ruleEditSettings');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.closeDialog},
      confirm: {text: t('txt-send'), handler: this.props.handleRuleEditConfirm}
    };

    return (
      <ModalDialog
        id='ruleEditDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        info={this.state.info}
        closeAction='cancel'>
        {this.displayRuleEdit()}
      </ModalDialog>
    )
  }
}

SoarSingleSettings.contextType = BaseDataContext;

SoarSingleSettings.propTypes = {
  activeElementType: PropTypes.string.isRequired,
  handleRuleEditConfirm: PropTypes.func.isRequired,
  closeDialog: PropTypes.func.isRequired
};

export default SoarSingleSettings;