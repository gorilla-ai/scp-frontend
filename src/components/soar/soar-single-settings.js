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
import SoarForm from './soar-form'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

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
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
  }
  ryan = () => {}
  /**
   * Display settings content
   * @method
   * @returns HTML DOM
   */
  displaySettings = () => {
    const {soarColumns, activeElementType, activeElement} = this.props;

    return (
      <SoarForm
        from='soarFlow'
        soarColumns={soarColumns}
        activeElementType={activeElementType}
        activeElement={activeElement}
        setSoarFlowData={this.props.setSoarFlowData} />
    )
  }
  render() {
    const {activeElementType} = this.props;
    const titleText = t('soar.txt-' + activeElementType + 'Settings');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.props.confirmSoarFlowData}
    };

    return (
      <ModalDialog
        id='soarSettingsDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displaySettings()}
      </ModalDialog>
    )
  }
}

SoarSingleSettings.contextType = BaseDataContext;

SoarSingleSettings.propTypes = {
  soarColumns: PropTypes.object.isRequired,
  activeElementType: PropTypes.string.isRequired,
  activeElement: PropTypes.object.isRequired,
  setSoarFlowData: PropTypes.func.isRequired,
  confirmSoarFlowData: PropTypes.func.isRequired,
  closeDialog: PropTypes.func.isRequired
};

export default SoarSingleSettings;