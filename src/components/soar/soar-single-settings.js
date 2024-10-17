import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'

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
      newSoarFlow: [],
      viewLogs: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
  }
  /**
   * Set flow settings data
   * @method
   * @param {string} type - soar operator type
   * @param {object} data - soar object
   * @param {object} element - active element
   */
  setSoarFlowData = (type, data, element) => {
    const {soarFlow} = this.props;
    const {newSoarFlow} = this.state;
    const selectedFlowIndex = _.findIndex(soarFlow, { 'id': element.id });
    let tempSoarFlow = '';

    if (_.isEmpty(newSoarFlow)) {
      tempSoarFlow = _.cloneDeep(soarFlow);
    } else {
      tempSoarFlow = _.cloneDeep(newSoarFlow);
    }

    if (type === 'nodeCustomName') {
      if (element.componentType === 'link') {
        tempSoarFlow[selectedFlowIndex].label = data;
      } else {
        tempSoarFlow[selectedFlowIndex].data = {
          label: data
        };
      }
    } else if (type === 'linkPriority') {
      tempSoarFlow[selectedFlowIndex].priority = data;
    } else if (type === 'nodeCustomGroup') {
      tempSoarFlow[selectedFlowIndex].group = data;
    } else {
      if (element.componentType === 'adapter') {
        tempSoarFlow[selectedFlowIndex].adapter_type = type;
        tempSoarFlow[selectedFlowIndex].args = data;
      } else if (element.componentType === 'node') {
        if (_.includes(this.props.soarColumns.nodeOp, type) ) {
          tempSoarFlow[selectedFlowIndex].op = type;
          tempSoarFlow[selectedFlowIndex].args = data;
        } else { //Handle special case for Node loop
          if (!tempSoarFlow[selectedFlowIndex].args.loopItem) {
            tempSoarFlow[selectedFlowIndex].args.loopItem = {};
          }
          tempSoarFlow[selectedFlowIndex].args.loopItem.op = type;
          tempSoarFlow[selectedFlowIndex].args.loopItem.args = data;
        }
      } else if (element.componentType === 'action') {
        tempSoarFlow[selectedFlowIndex].op = type;
        tempSoarFlow[selectedFlowIndex].args = {};
        tempSoarFlow[selectedFlowIndex].args.actions = data;
      } else if (element.componentType === 'link') {
        tempSoarFlow[selectedFlowIndex].op = type;
        tempSoarFlow[selectedFlowIndex].args = {};

        if (type === 'and' || type === 'or') {
          tempSoarFlow[selectedFlowIndex].args.operators = data.operators ? data.operators : data;
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
    const {soarFlow} = this.props;
    const {newSoarFlow} = this.state;

    if (_.isEmpty(newSoarFlow)) {
      this.props.confirmSoarFlowData(soarFlow);
    } else {
      this.props.confirmSoarFlowData(newSoarFlow);
    }
  }
  /**
   * Toggle view logs on/off
   * @method
   */
  toggleViewLogs = () => {
    this.setState({
      viewLogs: !this.state.viewLogs
    });
  }
  /**
   * Display the source logs content
   * @method
   * @param {object} val - content of the source logs
   * @param {number} i - index of the source logs
   * @returns HTML DOM
   */
  showSourceLogs = (val, i) => {
    return (
      <div key={i}>
        <TextareaAutosize
          className='textarea-autosize disabled'
          minRows={10}
          value={val.log}
          disabled={true} />
      </div>
    )
  }
  /**
   * Display settings content
   * @method
   * @returns HTML DOM
   */
  displaySettings = () => {
    const {soarColumns, activeElementType, activeElement, soarParam, sourceLogs} = this.props;
    const {viewLogs} = this.state;
    const logStatus = viewLogs ? 'hide' : 'show';

    return (
      <div>
        <Button variant='contained' color='primary' className='view-logs-btn' onClick={this.toggleViewLogs} disabled={!sourceLogs || sourceLogs.length === 0}>{t(`soar.txt-${logStatus}Logs`)}</Button>
        <div className='form-settings'>
          <SoarForm
            from='soarFlow'
            soarColumns={soarColumns}
            activeElementType={activeElementType}
            activeElement={activeElement}
            soarParam={soarParam}
            setSoarFlowData={this.setSoarFlowData} />
          {viewLogs &&
            <div className='group view-logs'>
              <label>Logs</label>
              {sourceLogs.map(this.showSourceLogs)}
            </div>
          }
        </div>
      </div>
    )
  }
  render() {
    const {activeElement} = this.props;
    const {newSoarFlow} = this.state;
    const titleText = t('soar.txt-' + activeElement.componentType + 'Settings');
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
  soarParam: PropTypes.object.isRequired,
  sourceLogs: PropTypes.string.isRequired,
  confirmSoarFlowData: PropTypes.func.isRequired,
  closeDialog: PropTypes.func.isRequired
};

export default SoarSingleSettings;