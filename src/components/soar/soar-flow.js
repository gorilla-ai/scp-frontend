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

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import SoarForm from './soar-form'
import SoarLogTesting from './soar-log-testing'
import SoarSingleSettings from './soar-single-settings'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NODE_TYPE = ['input', 'default', 'output'];
const EDGE_TYPE = ['default', 'straight', 'smoothstep'];

let t = null;
let f = null;

/**
 * SOAR
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the SOAR flow page
 */
class SoarFlow extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      openFlowSettingsDialog: false,
      openTestingFlowDialog: false,
      linkAnimated: true,
      showMiniMap: true,
      linkShapeType: 'default', //'default', 'straight', 'smoothstep'
      currentFlowID: '',
      soarRule: {
        name: '',
        aggFieldId: ''
      },
      soarCondition: {
        op: '',
        args: {}
      },
      soarFlow: [],
      formattedSoarFlow: [],
      reactFlowInstance: null,
      linkEditable: true,
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
    this.setIndividualSoarData();
  }
  /**
   * Set individual soar data
   * @method
   */
  setIndividualSoarData = () => {
    const {soarIndividualData} = this.props;
    const {soarRule, soarCondition} = this.state;
    let linkAnimated = '';
    let linkShapeType = '';

    if (_.isEmpty(soarIndividualData)) {
      return;
    }

    let tempSoarRule = {...soarRule};
    let tempSoarCondition = {...soarCondition};
    tempSoarRule.name = soarIndividualData.flowName;
    tempSoarRule.aggFieldId = soarIndividualData.aggField;
    tempSoarCondition.op = soarIndividualData.condition.op;
    tempSoarCondition.args = soarIndividualData.condition.args;

    _.forEach(soarIndividualData.flow, val => {
      if (val.source && val.target) {
        linkAnimated = val.animated;
        linkShapeType = val.type;
        return false;
      }
    })

    this.setState({
      linkAnimated,
      linkShapeType,
      soarRule: tempSoarRule,
      soarCondition: tempSoarCondition,
      soarFlow: soarIndividualData.flow,
      formattedSoarFlow: this.getFormattedSoarFlow(soarIndividualData.flow)
    });
  }
  /**
   * Get formatted Soar Flow data
   * @method
   * @param {array.<object>} flow - flow data
   * @returns formatted flow array
   */
  getFormattedSoarFlow = (flow) => {
    let formattedSoarFlow = [];

    _.forEach(flow, val => {
      if (val.componentType === 'link' && val.priority) {
        formattedSoarFlow.push({
          ...val,
          label: val.label + ' (' + val.priority + ')'
        });
      } else {
        formattedSoarFlow.push({
          ...val
        });
      }
    })

    return formattedSoarFlow;
  }
  /**
   * Get corresponding node text
   * @method
   * @param {string} type - node type
   * @param {string} [options] - option for 'component'
   */
  getNodeText = (type, options) => {
    let component = '';
    let nodeText = '';

    if (type === 'input') {
      component = 'Adapter';
      nodeText = t('soar.txt-adapter');
    } else if (type === 'default') {
      component = 'Node';
      nodeText = t('soar.txt-node');
    } else if (type === 'output') {
      component = 'Action';
      nodeText = t('soar.txt-action');
    }

    if (options === 'component') {
      return component.toLowerCase();
    } else {
      return nodeText;
    }
  }
  /**
   * Called after flow is initialized
   * @method
   * @param {string} _reactFlowInstance - react flow instance
   */
  onLoad = (_reactFlowInstance) => {
    this.setState({
      reactFlowInstance: _reactFlowInstance
    });
  }
  /**
   * Called when user connects two nodes
   * @method
   * @param {object} params - edge object
   */
  onConnect = (params) => {
    const {linkAnimated, linkShapeType} = this.state;
    const id = helper.getRandomNumber(0, 1000) + '_link';
    const linkParams = {
      id,
      type: linkShapeType,
      label: t('soar.txt-defaultLink'),
      componentType: 'link',
      arrowHeadType: 'arrow',
      ...params,
      animated: linkAnimated,
      labelStyle: { fontWeight: 700 }
    };

    this.setState({
      soarFlow: addEdge(linkParams, this.state.soarFlow)
    });
  }
  /**
   * Set current active element
   * @method
   * @param {object} type - element type ('node' or 'link')
   * @param {string} id - node ID
   * @param {object} event - event object
   */
  setActiveElement = (type, id, event) => {
    const {soarFlow, contextAnchor} = this.state;
    const selectedFlowIndex = _.findIndex(soarFlow, { 'id': id });
    const activeElement = soarFlow[selectedFlowIndex];
    let tempContextAnchor = {...contextAnchor};
    tempContextAnchor[type] = event.currentTarget;
    let linkEditable = true;

    if (activeElement.source && activeElement.source.indexOf('adapter') > -1) {
      linkEditable = false;
    }

    this.setState({
      activeElementType: type,
      activeElement,
      linkEditable,
      contextAnchor: tempContextAnchor
    });

    event.preventDefault();
  }
  /**
   * Called when user removes node or edge
   * @method
   */
  onElementsRemove = () => {
    const {soarFlow, activeElement} = this.state;

    this.setState({
      soarFlow: removeElements([activeElement], soarFlow)
    });
    this.handleCloseMenu();
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: {
        node: null,
        link: null
      }
    });
  }
  /**
   * Called when user drag element
   * @method
   * @param {object} event - event object
   */
  onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
  /**
   * Called when user drop element
   * @method
   * @param {object} event - event object
   */
  onDrop = (event) => {
    const {reactFlowInstance, soarFlow} = this.state;
    const reactFlowBounds = this.reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    const id = helper.getRandomNumber(0, 1000) + '_' + this.getNodeText(type, 'component');
    const newNode = {
      id,
      type,
      componentType: this.getNodeText(type, 'component'),
      position,
      data: { label: this.getNodeText(type) }
    };
    const tempFlowData = _.cloneDeep(soarFlow);
    const newFlowData = tempFlowData.concat(newNode)
    let adapterCount = 0;
    let valid = true;

    if (this.getNodeText(type, 'component') === 'adapter') { //Check adapter node couont
      _.forEach(soarFlow, val => {
        if (val.componentType === 'adapter') {
          adapterCount++;
        }

        if (adapterCount > 0) {
          helper.showPopupMsg('', t('txt-error'), t('soar.txt-adapterError'));
          valid = false;
          return false;
        }
      });

      if (!valid) {
        return;
      }
    }

    this.setState({
      soarFlow: newFlowData
    });

    event.preventDefault();
  }
  /**
   * Called when user stop dragging the element
   * @method
   * @param {object} event - event object
   * @param {object} node - node object
   */
  onNodeDragStop = (event, node) => {
    const {soarFlow} = this.state;
    const selectedFlowIndex = _.findIndex(soarFlow, { 'id': node.id });
    let tempSoarFlow = _.cloneDeep(soarFlow);
    tempSoarFlow[selectedFlowIndex].position = node.position;

    this.setState({
      soarFlow: tempSoarFlow
    });
  }
  /**
   * Node context menu
   * @method
   * @param {object} event - event object
   * @param {object} node - node object
   */
  onNodeContextMenu = (event, node) => {
    this.setActiveElement('node', node.id, event);
  }
  /**
   * Called when user does a right-click on an edge
   * @method
   * @param {object} event - event object
   * @param {object} link - link object
   */
  onEdgeContextMenu = (event, link) => {
    this.setActiveElement('link', link.id, event);
  }
  /**
   * Called when user starts to drag a selection
   * @method
   * @param {string} nodeType - node type ('input', 'default' or 'output')
   * @param {object} event - event object
   */
  onDragStart = (nodeType, event) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }
  /**
   * Called when the end of an edge gets dragged to another source or target
   * @method
   * @param {object} oldEdge - old edge object
   * @param {object} newConnection - new edge object
   */
  onEdgeUpdate = (oldEdge, newConnection) => {
    let edgeParams = {...newConnection};
    edgeParams.id = oldEdge.id;

    this.setState({
      soarFlow: updateEdge(oldEdge, edgeParams, this.state.soarFlow)
    });
  }
  /**
   * Display node element
   * @method
   * @param {object} val - node type ('input', 'default' or 'output')
   * @param {number} i - index of the node type
   * @returns HTML DOM
   */
  getNodeType = (val, i) => {
    return <div key={i} className={'dndnode ' + val} onDragStart={this.onDragStart.bind(this, val)} draggable>{this.getNodeText(val)}</div>
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
      soarFlow: newSoarFlow,
      formattedSoarFlow: this.getFormattedSoarFlow(newSoarFlow)
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
  /**
   * Toggle testing dialog
   * @method
   */
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
      currentFlowID: '',
      soarRule: {
        name: '',
        aggFieldId: ''
      }
    }, () => {
      if (options === 'table') {
        this.props.toggleContent(options, 'refresh');
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
          <span>{val.name}</span>
        </td>
        <td>
          <span>{t('soar.txt-error' + val.status)}</span>
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

    if (errorData.length > 0) {
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
  }
  /**
   * Handle soar save
   * @method
   */
  handleSoarFlowSave = () => {
    const {baseUrl} = this.context;
    const {flowActionType, soarIndividualData} = this.props;
    const {currentFlowID, soarRule, soarCondition, soarFlow} = this.state;
    const url = `${baseUrl}/api/soar/flow`;
    let requestData = {
      flowName: soarRule.name,
      aggField: soarRule.aggFieldId,
      isEnable: soarIndividualData.isEnable || true,
      condition: soarCondition,
      flow: soarFlow
    };
    let adapter = false;
    let valid = false;

    if (currentFlowID || flowActionType === 'edit') {
      requestData.flowId = currentFlowID || soarIndividualData.flowId;
    }

    _.forEach(soarFlow, val => {
      if (val.componentType === 'adapter') {
        adapter = true;
      }

      if (adapter && val.componentType === 'link' && val.source.indexOf('adapter') > -1) {
        valid = true;
        return false;
      }
    })

    if (adapter && !valid) {
      helper.showPopupMsg('', t('txt-error'), t('soar.txt-adapterErrorLink'));
      return;
    }

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) { //Success
        this.clearSoarData('table');
      } else {
        if (data.rt.length === 0) {
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
   * Show edge type options
   * @method
   * @param {string} val - edge type
   * @param {number} i - index of the edge type
   * @returns HTML DOM
   */
  showEdgeTypeOptions = (val, i) => {
    return (
      <FormControlLabel
        value={val}
        control={
          <Radio
            className='radio-ui'
            color='primary' />
        }
        label={t('soar.txt-linkType-' + val)} />
    )
  }
  /**
   * Handle link sahpe value change
   * @method
   * @param {object} event - event object
   */
  handleLinkShapeChange = (event) => {
    const tempSoarFlow = _.map(this.state.soarFlow, val => {
      if (val.source && val.target) {
        return {
          ...val,
          type: event.target.value
        };
      } else {
        return {
          ...val
        };
      }
    });

    this.setState({
      linkShapeType: event.target.value,
      soarFlow: tempSoarFlow
    });
  }
  /**
   * Toggle link animated checkbox
   * @method
   * @param {object} event - event object
   */
  toggleLinkAnimatedCheckbox = (event) => {
    const tempSoarFlow = _.map(this.state.soarFlow, val => {
      if (val.source && val.target) {
        return {
          ...val,
          animated: event.target.checked
        };
      } else {
        return {
          ...val
        };
      }
    });

    this.setState({
      linkAnimated: event.target.checked,
      soarFlow: tempSoarFlow
    });
  }
  /**
   * Toggle show mini map checkbox
   * @method
   * @param {object} event - event object
   */
  toggleShowMiniMapCheckbox = () => {
    this.setState({
      showMiniMap: event.target.checked
    });
  }
  /**
   * Get stroke color for flow mini map
   * @method
   * @param {object} n - flow object
   */
  getStrokeColor = (n) => {
    const theme = document.documentElement.getAttribute('data-theme');
    let defaultColor = '';

    if (theme === 'light') {
      defaultColor = '#1a192b';
    } else if (theme === 'dark') {
      defaultColor = '#ff0';
    }

    if (n.style && n.style.background) return n.style.background;
    if (n.type === 'input') return '#0041d0';
    if (n.type === 'output') return '#ff0072';
    if (n.type === 'default') return defaultColor;
    return '#eee';
  }
  render() {
    const {soarColumns, soarIndividualData} = this.props;
    const {
      openFlowSettingsDialog,
      openTestingFlowDialog,
      linkAnimated,
      showMiniMap,
      linkShapeType,
      soarRule,
      soarCondition,
      soarFlow,
      formattedSoarFlow,
      operatorList,
      linkEditable,
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
              </div>
              <Menu
                anchorEl={contextAnchor.node || contextAnchor.link}
                keepMounted
                open={Boolean(contextAnchor.node || contextAnchor.link)}
                onClose={this.handleCloseMenu}>
                {linkEditable &&
                  <MenuItem onClick={this.toggleFlowSettingsDialog}><i className='fg fg-edit' title={t('txt-edit')}></i></MenuItem>
                }
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
                          label={t('txt-name')}
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
                          label={t('soar.txt-aggFieldId')}
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
                  </aside>

                  <div className='reactflow-wrapper'>
                    <div className='drag-section'>
                      <div className='link-shape'>
                        <RadioGroup
                          id='linkShapeType'
                          className='radio-group'
                          name='type'
                          value={linkShapeType}
                          onChange={this.handleLinkShapeChange}>
                          {EDGE_TYPE.map(this.showEdgeTypeOptions)}
                        </RadioGroup>
                      </div>
                      <div className='link-animated'>
                        <FormControlLabel
                          label={t('soar.txt-linkAnimated')}
                          control={
                            <Checkbox
                              id='linkAnimatedCheckbox'
                              className='checkbox-ui'
                              checked={linkAnimated}
                              onChange={this.toggleLinkAnimatedCheckbox}
                              color='primary' />
                          } />
                      </div>
                      <div className='link-animated'>
                        <FormControlLabel
                          label={t('soar.txt-showMiniMap')}
                          control={
                            <Checkbox
                              id='showMiniMapCheckbox'
                              className='checkbox-ui'
                              checked={showMiniMap}
                              onChange={this.toggleShowMiniMapCheckbox}
                              color='primary' />
                          } />
                      </div>
                      <div className='node-type'>
                        {NODE_TYPE.map(this.getNodeType)}
                      </div>
                    </div>
                    <div ref={this.reactFlowWrapper}>
                      <ReactFlow
                        elements={formattedSoarFlow}
                        onLoad={this.onLoad}
                        onConnect={this.onConnect}
                        onNodeDragStop={this.onNodeDragStop}
                        onElementsRemove={this.onElementsRemove}
                        onDragOver={this.onDragOver}
                        onDrop={this.onDrop}
                        onNodeContextMenu={this.onNodeContextMenu}
                        onEdgeContextMenu={this.onEdgeContextMenu}
                        onEdgeUpdate={this.onEdgeUpdate}
                        deleteKeyCode={46}>
                        {showMiniMap &&
                          <MiniMap
                            className='mini-map'
                            nodeStrokeColor={(n) => {
                              return this.getStrokeColor(n);
                            }}
                            nodeColor={(n) => {
                              if (n.style && n.style.background) return n.style.background;
                              return '#fff';
                            }}
                            nodeBorderRadius={2} />
                        }
                        <Controls />
                        <Background />
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