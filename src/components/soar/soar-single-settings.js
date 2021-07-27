import React, { Component } from 'react'
import PropTypes from 'prop-types'
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
      newLoopItem: {},
      newSoarFlow: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
  }
  ryan = () => {}
  /**
   * Set flow settings data
   * @method
   * @param {string} type - soar operator type
   * @param {object} data - soar object
   * @param {object} element - active element
   */
  setSoarFlowData = (type, data, element) => {
    const {soarFlow} = this.props;
    const {newLoopItem, newSoarFlow} = this.state;
    const selectedFlowIndex = _.findIndex(soarFlow, { 'id': element.id });
    let tempSoarFlow = _.cloneDeep(soarFlow);

    if (type === 'nodeCustomName') {
      if (element.componentType === 'link') {
        tempSoarFlow[selectedFlowIndex].label = data;
      } else {
        tempSoarFlow[selectedFlowIndex].data = {
          label: data
        };
      }
    } else if (type === 'nodeCustomGroup') {
      tempSoarFlow[selectedFlowIndex].group = data;
    }  else if (type === 'loopItem') {
      this.setState({
        newLoopItem: data
      });
      return;
    } else {
      if (element.componentType === 'adapter') {
        tempSoarFlow[selectedFlowIndex].adapter_type = type;
      } else  {
        tempSoarFlow[selectedFlowIndex].op = type;
      }

      if (element.componentType === 'node') {
        tempSoarFlow[selectedFlowIndex].args = data;

        if (!_.isEmpty(newLoopItem)) {
          tempSoarFlow[selectedFlowIndex].args.loopItem = _.cloneDeep(newLoopItem);
        }
      } else if (element.componentType === 'action') {
        tempSoarFlow[selectedFlowIndex].args.actions = data;
      } else {
        if (type === 'and' || type === 'or') {
          tempSoarFlow[selectedFlowIndex].args.operators = data;
        } else {
          tempSoarFlow[selectedFlowIndex].args = data;
        }
      }
    }

    this.setState({
      newSoarFlow: tempSoarFlow
    });
  }
  /**
   * Handle individual settings confirm
   * @method
   */
  handleSoarSettingsConfirm = () => {
    const {soarFlow, activeElement} = this.props;
    const {newLoopItem, newSoarFlow} = this.state;

    if (activeElement.componentType === 'node' && !_.isEmpty(newLoopItem)) {
      let loopFlow = [];

      if (_.isEmpty(newSoarFlow)) {
        loopFlow = _.cloneDeep(soarFlow);
      } else {
        loopFlow = _.cloneDeep(newSoarFlow);
      }

      const selectedFlowIndex = _.findIndex(loopFlow, { 'id': activeElement.id });
      loopFlow[selectedFlowIndex].args.loopItem = _.cloneDeep(newLoopItem);
      //console.log(loopFlow);
      this.props.confirmSoarFlowData(loopFlow);
    } else {
      if (_.isEmpty(newSoarFlow)) {
        //console.log(soarFlow);
        this.props.confirmSoarFlowData(soarFlow);
      } else {
        //console.log(newSoarFlow);
        this.props.confirmSoarFlowData(newSoarFlow);
      }
    }
  }
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
        setSoarFlowData={this.setSoarFlowData} />
    )
  }
  render() {
    const {activeElementType} = this.props;
    const {newSoarFlow} = this.state;
    const titleText = t('soar.txt-' + activeElementType + 'Settings');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.handleSoarSettingsConfirm}
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
  soarFlow: PropTypes.array.isRequired,
  activeElementType: PropTypes.string.isRequired,
  activeElement: PropTypes.object.isRequired,
  confirmSoarFlowData: PropTypes.func.isRequired,
  closeDialog: PropTypes.func.isRequired
};

export default SoarSingleSettings;