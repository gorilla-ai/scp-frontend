import React, {Component} from 'react'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid from '@material-ui/core/Grid'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../../common/context'
import helper from '../../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const INIT = {
  open: false,
  adConfig: {
    ip: '',
    port: '',
    domain: '',
    adminAccount: '',
    adminPassword: '',
    isSSL: false, 
    enabled: false
  }
};

let t = null;
let c = null;
let et = null;

/**
 * AdConfig
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the AD Config dialog
 */
class AdConfig extends Component {
  constructor(props) {
    super(props);

    this.state = _.cloneDeep(INIT);

    t = global.chewbaccaI18n.getFixedT(null, 'accounts');
    c = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  /**
   * Get and set AD config data
   * @method
   */
  openADconfig = () => {
    const {baseUrl} = this.context;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/common/config?configId=config.ad`
    })
    .then(data => {
      let adConfig = {
        ip: '',
        port: '',
        domain: '',
        adminAccount: '',
        adminPassword: '',
        isSSL: false,
        enabled: false
      };

      if (data) {
        adConfig = JSON.parse(data.rt.value);
      }

      this.setState({
        open: true,
        adConfig
      });
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
    })
  }
  /**
   * Handle AD input value
   * @method
   * @param {object} event - event object
   */
  handleAdChange = (event) => {
    let temp = {...this.state.adConfig};
    temp[event.target.name] = event.target.value;

    this.setState({
      adConfig: temp
    });
  }
  /**
   * Handle AD switch value
   * @method
   * @param {object} event - event object
   */
  handleAdStatusChange = (event) => {
    let temp = {...this.state.adConfig};
    temp[event.target.name] = event.target.checked;

    this.setState({
      adConfig: temp
    });
  }
  /**
   * Display AD config content
   * @method
   * @returns HTML DOM
   */
  displayADcontent = () => {
    const {adConfig} = this.state;

    return (
      <div className='content'>
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <TextField
              name='ip'
              label='IP'
              variant='outlined'
              fullWidth
              size='small'
              value={adConfig.ip}
              onChange={this.handleAdChange} />
          </Grid>
          <Grid item xs={3}>
            <TextField
              name='port'
              label='Port'
              variant='outlined'
              fullWidth
              size='small'
              type='number'
              value={adConfig.port}
              onChange={this.handleAdChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name='domain'
              label={c('txt-domain')}
              variant='outlined'
              fullWidth
              size='small' 
              value={adConfig.domain}
              onChange={this.handleAdChange} />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name='adminAccount'
              label={c('auto-settings.txt-username')}
              variant='outlined'
              fullWidth
              size='small' 
              value={adConfig.adminAccount}
              onChange={this.handleAdChange} />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name='adminPassword'
              label={c('auto-settings.txt-password')}
              variant='outlined'
              fullWidth
              size='small'
              type='password'
              value={adConfig.adminPassword}
              onChange={this.handleAdChange} />
          </Grid>
        </Grid>

        <div className='switch'>
          <FormControlLabel
            className='switch-control'
            control={
              <Switch
                name='isSSL'
                checked={adConfig.isSSL}
                onChange={this.handleAdStatusChange}
                color='primary' />
            }
            label={t('txt-ssl-connect')} />
          <FormControlLabel
            className='switch-control'
            control={
              <Switch
                name='enabled'
                checked={adConfig.enabled}
                onChange={this.handleAdStatusChange}
                color='primary' />
            }
            label={c('txt-switch')} />
          <Button variant='contained' color='primary' className='btn' onClick={this.handleTestAD} disabled={!adConfig.enabled}>{t('txt-test-connect')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Handle AD confirm
   * @method
   */
  handleADconfirm = () => {
    const {baseUrl} = this.context;
    const {adConfig} = this.state;
    const payload = {
      configId: 'config.ad',
      value: JSON.stringify(adConfig)
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/common/config`,
        data: JSON.stringify(payload),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json'
    })
    .then(data => {
      this.closeDialog();
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
    })
  }
  /**
   * Close AD config dialog and clear data
   * @method
   */
  closeDialog = () => {
    this.setState(_.cloneDeep(INIT));
  }
  /**
   * Handle test AD button
   * @method
   */
  handleTestAD = () => {
    const {baseUrl} = this.context;
    const {adConfig} = this.state;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/ad/_test`,
      data: JSON.stringify(adConfig),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      helper.showPopupMsg(c('auto-settings.txt-connectionsSuccess'));
    })
    .catch(err => {
      helper.showPopupMsg(c('auto-settings.txt-connectionsFail'), c('txt-error'));
    })
  }
  render() {
    const actions = {
      cancel: {text: c('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: c('txt-confirm'), handler: this.handleADconfirm}
    };

    if (!this.state.open) {
      return null;
    }

    return (
      <ModalDialog
        id='adConfigModalDialog'
        className='modal-dialog'
        title={t('txt-ad-config')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayADcontent()}
      </ModalDialog>
    )
  }
}

AdConfig.contextType = BaseDataContext;

export default AdConfig;