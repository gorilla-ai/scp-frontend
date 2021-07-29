import React, { Component, useRef } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import _ from 'lodash'
import cx from 'classnames'

import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  updateEdge,
  removeElements,
  MiniMap,
  Controls,
  Background
} from 'react-flow-renderer';

import JSONTree from 'react-json-tree'
import localforage from 'localforage';

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import SoarForm from './soar-form'
import SoarSingleSettings from './soar-single-settings'
import SoarLogTesting from './soar-log-testing'


import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NODE_TYPE = ['input', 'default', 'output'];
const FLOW_KEY = 'example-flow';
let flowCount = 0;

let t = null;
let f = null;

/**
 * SOAR
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to handle the business logic for the threats page
 */
class SoarFlow extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      openFlowSettingsDialog: false,
      openTestingFlowDialog: false,
      soarRule: {
        name: '',
        aggFieldId: ''
      },
      soarCondition: {
        op: '',
        args: {}
      },
      soarFlow: [],
      reactFlowInstance: null,
      contextAnchor: {
        node: null,
        link: null
      },
      activeElementType: '', //'node' or 'link'
      activeElement: {}
    };

    this.reactFlowWrapper = React.createRef();
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    localforage.config({
      name: 'react-flow-demo',
      storeName: 'flows',
    });
    flowCount = 0;

    this.setIndividualSoarData();
  }
  /**
   * Get soar flow data
   * @method
   */
  getFlowData = () => {
    const flowData = [
      {
        id: '0_Adapter',
        type: 'input',
        data: { label: 'Adapter' },
        position: { x: 500, y: 50 }
      },
      {
        id: '1_Node',
        data: { label: 'Node' },
        position: { x: 300, y: 200 }
      },
      {
        id: '2_Action',
        type: 'output',
        data: { label: 'Action', labelStyle: { fill: 'blue', fontWeight: 700 } },
        position: { x: 300, y: 400 }
      },
      {
        id: '3_Link',
        source: '1_Node',
        target: '2_Action',
        label: 'hello ABC',
        labelStyle: { fill: 'red', fontWeight: 700 },
        arrowHeadType: 'arrow',
        animated: true,
        type: 'smoothstep'
      }
    ];

    id = (flowData.length) - 1;

    // this.setState({
    //   flowData
    // });
  }
  /**
   * Set individual soar data
   * @method
   */
  setIndividualSoarData = () => {
    const {soarIndividualData} = this.props;
    const {soarRule, soarCondition} = this.state;

    if (_.isEmpty(soarIndividualData)) {
      return;
    }

    let tempSoarRule = {...soarRule};
    let tempSoarCondition = {...soarCondition};
    tempSoarRule.name = soarIndividualData.flowName;
    tempSoarRule.aggFieldId = soarIndividualData.aggField;
    tempSoarCondition.op = soarIndividualData.condition.op;
    tempSoarCondition.args = soarIndividualData.condition.args;
    flowCount = soarIndividualData.flow.length;

    this.setState({
      soarRule: tempSoarRule,
      soarCondition: tempSoarCondition,
      soarFlow: soarIndividualData.flow
    });
  }
  getNodeText = (val, options) => {
    let nodeText = '';

    switch (val) {
      case 'input':
        nodeText = 'Adapter';
        break;
      case 'default':
        nodeText = 'Node';
        break;
      case 'output':
        nodeText = 'Action';
        break;
    }

    if (options === 'lowerCase') {
      return nodeText.toLowerCase();
    } else {
      return nodeText;
    }
  }
  onLoad = (_reactFlowInstance) => {
    this.setState({
      reactFlowInstance: _reactFlowInstance
    });
  }
  onConnect = (params) => {
    const id = ++flowCount;
    const linkParams = {
      ...params,
      id: id.toString(),
      label: 'default link',
      componentType: 'link',
      arrowHeadType: 'arrow',
      animated: true,
      type: 'smoothstep'
    };

    this.setState({
      soarFlow: addEdge(linkParams, this.state.soarFlow)
    });
  }
  setActiveElement = (type, from, event, id) => {
    const {soarFlow, contextAnchor} = this.state;
    const selectedFlowIndex = _.findIndex(soarFlow, { 'id': id });
    const activeElement = soarFlow[selectedFlowIndex];

    if (from === 'contextMenu') {
      let tempContextAnchor = {...contextAnchor};
      tempContextAnchor[type] = event.currentTarget;

      this.setState({
        contextAnchor: tempContextAnchor
      });
    }

    this.setState({
      activeElementType: type,
      activeElement
    });

    event.preventDefault();
  }
  onElementsRemove = () => {
    const {soarFlow, activeElement} = this.state;

    this.setState({
      soarFlow: removeElements([activeElement], soarFlow)
    });
    this.handleCloseMenu();
  }
  onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
  onDrop = (event) => {
    const {reactFlowInstance, soarFlow} = this.state;
    const reactFlowBounds = this.reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    const id = ++flowCount;
    const newNode = {
      id: id.toString(),
      type,
      componentType: this.getNodeText(type, 'lowerCase'),
      position,
      data: { label: this.getNodeText(type) }
    };
    const tempFlowData = _.cloneDeep(soarFlow);
    const newFlowData = tempFlowData.concat(newNode)

    this.setState({
      soarFlow: newFlowData
    });

    event.preventDefault();
  }
  handleCloseMenu = (type) => {
    this.setState({
      contextAnchor: {
        node: null,
        link: null
      }
    });
  }
  onNodeDragStop = (event, node) => {
    const {soarFlow} = this.state;
    const selectedFlowIndex = _.findIndex(soarFlow, { 'id': node.id });
    let tempSoarFlow = _.cloneDeep(soarFlow);
    tempSoarFlow[selectedFlowIndex].position = node.position;

    this.setState({
      soarFlow: tempSoarFlow
    });
  }
  onNodeContextMenu = (event, node) => {
    this.setActiveElement('node', 'contextMenu', event, node.id);
  }
  onEdgeContextMenu = (event, link) => {
    this.setActiveElement('link', 'contextMenu', event, link.id);
  }
  onDragStart = (nodeType, event) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }
  onEdgeUpdate = (oldEdge, newConnection) => {
    let edgeParams = {...newConnection};
    edgeParams.id = oldEdge.id;

    this.setState({
      soarFlow: updateEdge(oldEdge, edgeParams, this.state.soarFlow)
    });
  }
  getNodeType = (val, i) => {
    return <div key={i} className={'dndnode ' + val} onDragStart={this.onDragStart.bind(this, val)} draggable>{this.getNodeText(val)}</div>
  }
  onSave = () => {
    const {reactFlowInstance} = this.state;

    if (reactFlowInstance) {
      localforage.setItem(FLOW_KEY, reactFlowInstance.toObject());
      helper.showPopupMsg(t('txt-saved', ''));
    }
  }
  onRestore = () => {
    const restoreFlow = async () => {
      const flow = await localforage.getItem(FLOW_KEY);

      if (flow) {
        this.setState({
          soarFlow: flow.elements || []
        });
      }
    };

    restoreFlow();
  }
  /**
   * Handle input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempSoarRule = {...this.state.soarRule};
    tempSoarRule[event.target.name] = event.target.value;

    this.setState({
      soarRule: tempSoarRule
    });
  }
  /**
   * Set soar condition data
   * @method
   * @param {string} type - soar operator type
   * @param {object | array} data - soar data object
   */
  setSoarConditionData = (type, data) => {
    let tempSoarCondition = {...this.state.soarCondition};
    tempSoarCondition.op = type;
    tempSoarCondition.args = {};

    if (type === 'and' || type === 'or') {
      tempSoarCondition.args.operators = data.operators ? data.operators : data;
    } else {
      tempSoarCondition.args = data;
    }

    this.setState({
      soarCondition: tempSoarCondition
    });
  }
  /**
   * Handle soar flow settings confirm
   * @method
   * @param {array.<object>} newSoarFlow - updated soar flow data
   */
  confirmSoarFlowData = (newSoarFlow) => {
    this.setState({
      soarFlow: newSoarFlow
    });

    this.closeDialog();
  }
  /**
   * Toggle rule settings dialog
   * @method
   */
  toggleFlowSettingsDialog = () => {
    this.setState({
      openFlowSettingsDialog: !this.state.openFlowSettingsDialog
    });

    this.handleCloseMenu();
  }
  toggleTestingDialog = () => {
    this.setState({
      openTestingFlowDialog: !this.state.openTestingFlowDialog
    });

    this.handleCloseMenu();
  }
  /**
   * Close dialog
   * @method
   */
  closeDialog = () => {
    this.setState({
      openFlowSettingsDialog: false,
      openTestingFlowDialog: false
    });
  }
  /**
   * Clear soar data
   * @method
   * @param {string} options - option for redirect
   */
  clearSoarData = (options) => {
    this.setState({
      soarRule: {
        name: '',
        aggFieldId: ''
      }
    }, () => {
      if (options === 'table') {
        this.props.toggleContent(options);
      }
    });
  }
  /**
   * Display individual error
   * @method
   * @param {object} val - error object
   * @param {number} i - index of the error
   * @returns HTML DOM
   */
  showIndividualError = (val, i) => {
    return (
      <tr key={i}>
        <td valign='top'>
          <div>{val.name}</div>
        </td>
        <td>
          <div>{t('soar.txt-error' + val.status)}</div>
        </td>
      </tr>
    )
  }
  /**
   * Display error info
   * @method
   * @param {number} mainError - main error code
   * @param {array.<object>} errorData - error data
   * @returns HTML DOM
   */
  showErrorInfo = (mainError, errorData) => {
    const errorMsg = t('soar.txt-error' + mainError);

    return (
      <div className='soar-error-table'>
        <div className='header'>{errorMsg}</div>
        <table className='c-table'>
          <thead>
            <tr>
              <th>{t('txt-name')}</th>
              <th>{t('txt-error')}</th>
            </tr>
          </thead>
          <tbody>
            {errorData.map(this.showIndividualError)}
          </tbody>
        </table>
      </div>
    )
  }
  /**
   * Handle soar save
   * @method
   */
  handleSoarFlowSave = () => {
    const {baseUrl} = this.context;
    const {flowActionType, soarIndividualData} = this.props;
    const {soarRule, soarCondition, soarFlow} = this.state;
    const url = `${baseUrl}/api/soar/flow`;
    let requestData = {
      flowName: soarRule.name,
      aggField: soarRule.aggFieldId,
      isEnable: soarIndividualData.isEnable,
      condition: soarCondition,
      flow: soarFlow
    };

    if (flowActionType === 'edit') {
      requestData.flowId = soarIndividualData.flowId;
    }

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        this.props.toggleContent('table', 'refresh');
      } else {
        if (data.rt === 0) {
          const errorMsg = t('soar.txt-error' + data.ret);
          helper.showPopupMsg('', t('txt-error'), errorMsg);
        } else {
          PopupDialog.alert({
            id: 'modalWindowSmall',
            title: t('txt-error'),
            confirmText: t('txt-close'),
            display: this.showErrorInfo(data.ret, data.rt)
          });
        }
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Check save button enable/disable
   * @method
   */
  // checkSaveDisable = () => {
  //   const {soarRule, soarCondition} = this.state;
  //   let disabled = false;

  //   if (!soarRule.name || !soarRule.aggFieldId || !soarCondition.op) {
  //     disabled = true;
  //   }

  //   if (_.isEmpty(soarCondition.args)) {
  //     disabled = true;
  //   } else {
  //     Object.keys(soarCondition.args).map(key => {
  //       const value = soarCondition.args[key];

  //       if (!value && typeof value === 'string') {
  //         disabled = true;
  //         return false;
  //       }
  //     });
  //   }

  //   return disabled;
  // }
  render() {
    const {soarColumns, soarIndividualData} = this.props;
    const {
      openFlowSettingsDialog,
      openTestingFlowDialog,
      soarRule,
      soarCondition,
      soarFlow,
      operatorList,
      contextAnchor,
      activeElementType,
      activeElement
    } = this.state;

    return (
      <div>
        {openFlowSettingsDialog &&
          <SoarSingleSettings
            soarColumns={soarColumns}
            soarFlow={soarFlow}
            activeElementType={activeElementType}
            activeElement={activeElement}
            confirmSoarFlowData={this.confirmSoarFlowData}
            closeDialog={this.closeDialog} />
        }

        {openTestingFlowDialog &&
          <SoarLogTesting
            soarColumns={soarColumns}
            soarFlow={soarFlow}
            soarRule={soarRule}
            soarCondition={soarCondition}
            soarIndividualData={soarIndividualData}
            activeElementType={activeElementType}
            activeElement={activeElement}
            confirmSoarFlowData={this.confirmSoarFlowData}
            closeDialog={this.closeDialog} />
        }

        <div className='sub-header'>
        </div>

        <div className='data-content soar-flow'>
          <div className='parent-content'>
            <div className='main-content basic-form'>
              <header className='main-header'>{t('soar.txt-soarFlow')}</header>
              <div className='content-header-btns'>
                <Button variant='outlined' color='primary' className='standard btn' onClick={this.clearSoarData.bind(this, 'table')}>{t('txt-backToList')}</Button>
              </div>
              <Menu
                anchorEl={contextAnchor.node || contextAnchor.link}
                keepMounted
                open={Boolean(contextAnchor.node || contextAnchor.link)}
                onClose={this.handleCloseMenu}>
                <MenuItem onClick={this.toggleFlowSettingsDialog}><i className='fg fg-edit' title={t('txt-edit')}></i></MenuItem>
                <MenuItem onClick={this.onElementsRemove}><i className='fg fg-trashcan' title={t('txt-remove')}></i></MenuItem>
              </Menu>

              <div className='flow-wrapper'>
                <ReactFlowProvider>
                  <aside>
                    <div className='form'>
                      <header>{t('soar.txt-soarRuleInfo')}</header>
                      <div className='group'>
                        <TextField
                          id='soarRuleInfo'
                          name='name'
                          label='Name'
                          variant='outlined'
                          fullWidth
                          size='small'
                          required
                          error={!soarRule.name}
                          helperText={soarRule.name ? '' : t('txt-required')}
                          value={soarRule.name}
                          onChange={this.handleDataChange} />
                      </div>
                      <div className='group'>
                        <TextField
                          id='soarRuleAggField'
                          name='aggFieldId'
                          label='Agg Field ID'
                          variant='outlined'
                          fullWidth
                          size='small'
                          value={soarRule.aggFieldId}
                          onChange={this.handleDataChange} />
                      </div>
                      <header>{t('soar.txt-soarRuleCondition')}</header>
                      <SoarForm
                        from='soarCondition'
                        soarColumns={soarColumns}
                        activeElementType='link'
                        soarCondition={soarCondition}
                        soarFlow={soarFlow}
                        setSoarConditionData={this.setSoarConditionData} />
                    </div>
                    <div>
                      {/*<JSONTree data={soarFlow} theme={helper.getJsonViewTheme()} />*/}
                    </div>
                  </aside>

                  <div className='reactflow-wrapper'>
                    <div className='drag-section'>
                      {NODE_TYPE.map(this.getNodeType)}
                    </div>
                    <div ref={this.reactFlowWrapper}>
                      <ReactFlow
                        elements={soarFlow}
                        onLoad={this.onLoad}
                        onConnect={this.onConnect}
                        onNodeDragStop={this.onNodeDragStop}
                        onElementsRemove={this.onElementsRemove}
                        onDragOver={this.onDragOver}
                        onDrop={this.onDrop}
                        onNodeContextMenu={this.onNodeContextMenu}
                        onEdgeContextMenu={this.onEdgeContextMenu}
                        onEdgeUpdate={this.onEdgeUpdate}
                        deleteKeyCode={46} >
                        <MiniMap
                          className='mini-map'
                          nodeStrokeColor={(n) => {
                            if (n.style && n.style.background) return n.style.background;
                            if (n.type === 'input') return '#0041d0';
                            if (n.type === 'output') return '#ff0072';
                            if (n.type === 'default') return '#1a192b';
                            return '#eee';
                          }}
                          nodeColor={(n) => {
                            if (n.style && n.style.background) return n.style.background;
                            return '#fff';
                          }}
                          nodeBorderRadius={2} />
                        <Controls />
                        <Background color='#aaa' gap={16} />
                      </ReactFlow>
                    </div>
                  </div>
                </ReactFlowProvider>
              </div>
              <div className='footer'>
                <Button variant='outlined' color='primary' className='standard' onClick={this.clearSoarData.bind(this, 'table')}>{t('txt-cancel')}</Button>
                <Button variant='outlined' color='primary' className='standard' onClick={this.toggleTestingDialog}>{t('soar.txt-Settings')}</Button>
                <Button variant='contained' color='primary' onClick={this.handleSoarFlowSave}>{t('txt-save')}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SoarFlow.contextType = BaseDataContext;

SoarFlow.propTypes = {
  flowActionType: PropTypes.string.isRequired,
  soarColumns: PropTypes.object.isRequired,
  soarIndividualData: PropTypes.object.isRequired,
  toggleContent: PropTypes.func.isRequired
};

export default SoarFlow;