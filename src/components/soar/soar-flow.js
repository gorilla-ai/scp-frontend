import React, { Component, useRef } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import moment from 'moment'
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

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import SoarSingleSettings from './soar-single-settings'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NODE_TYPE = ['input', 'default', 'output'];
const FLOW_KEY = 'example-flow';
let id = 1;

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
      openRuleEditDialog: false,
      soarRule: {
        name: '',
        aggFieldId: ''
      },
      soarCondition: {
        operator: ''
      },
      operatorList: [],
      reactFlowInstance: null,
      flowData: [],
      selectedNode: {},
      contextAnchor: {
        node: null,
        link: null
      },
      activeElementType: '', //'node' or 'link'
      activeElement: {
        node: null,
        link: null
      }
    };

    this.reactFlowWrapper = React.createRef();
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {soarIndividualData} = this.props;

    localforage.config({
      name: 'react-flow-demo',
      storeName: 'flows',
    });

    this.setColumnData();
    this.getFlowData();

    if (!_.isEmpty(soarIndividualData)) {
      this.setIndividualSoarData();
    }
  }
  ryan = () => {}
  /**
   * Set column data list
   * @method
   */
  setColumnData = () => {
    const operatorList = _.map(this.props.soarColumns.linkOp, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    this.setState({
      operatorList
    });
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
        data: { label: 'Action' },
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

    // const flowData = [
    //   {
    //     id: '1_Adapter',
    //     type: 'input',
    //     data: { label: 'Adapter' },
    //     position: { x: 500, y: 50 }
    //   }
    // ];

    this.setState({
      flowData
    });
  }
  /**
   * Set individual soar data
   * @method
   */
  setIndividualSoarData = () => {
    const {soarIndividualData} = this.props;
    const {soarRule, soarCondition} = this.state;
    let tempSoarRule = {...soarRule};
    let tempSoarCondition = {...soarCondition};
    tempSoarRule.name = soarIndividualData.flowName;
    tempSoarRule.aggFieldId = soarIndividualData.aggField;

    this.setState({
      soarRule: tempSoarRule
    });
  }
  getNodeText = (val) => {
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

    return nodeText;
  }
  onLoad = (_reactFlowInstance) => {
    this.setState({
      reactFlowInstance: _reactFlowInstance
    });
  }
  onConnect = (params) => {
    const edgeParams = {
      ...params,
      id: ++id + '_' + 'Link',
      label: 'default link',
      arrowHeadType: 'arrow',
      labelStyle: {
        fill: 'red',
        fontWeight: 700
      },
      animated: true,
      type: 'smoothstep'
    };

    this.setState({
      flowData: addEdge(edgeParams, this.state.flowData)
    });
  }
  setActiveElement = (type, from, event, element) => {
    const {contextAnchor, activeElement} = this.state;
    let tempActiveElement = {...activeElement};
    tempActiveElement[type] = [element];

    if (from === 'contextMenu') {
      let tempContextAnchor = {...contextAnchor};
      tempContextAnchor[type] = event.currentTarget;

      this.setState({
        contextAnchor: tempContextAnchor
      });
    }

    this.setState({
      activeElementType: type,
      activeElement: tempActiveElement
    });

    event.preventDefault();
  }
  onElementClick = (event, element) => {
    const {flowData} = this.state;
    const type = element.source ? 'link' : 'type';
    const selectedFlowIndex = _.findIndex(flowData, { 'id': element.id });
    const selectedNode = flowData[selectedFlowIndex];

    this.setState({
      selectedNode
    }, () => {
      this.setActiveElement(type, 'click', event, element);
    });   
  }
  onElementsRemove = () => {
    const {flowData, activeElementType, activeElement} = this.state;

    this.setState({
      flowData: removeElements(activeElement[activeElementType], flowData)
    });
    this.handleCloseMenu();
  }
  onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
  onDrop = (event) => {
    const {reactFlowInstance, flowData} = this.state;
    const reactFlowBounds = this.reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    const newNode = {
      id: ++id + '_' + this.getNodeText(type),
      type,
      position,
      data: { label: this.getNodeText(type) }
    };
    const tempFlowData = _.cloneDeep(flowData);
    const newFlowData = tempFlowData.concat(newNode)

    this.setState({
      flowData: newFlowData
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
  onNodeContextMenu = (event, node) => {
    this.setActiveElement('node', 'contextMenu', event, node);
  }
  onEdgeContextMenu = (event, link) => {
    this.setActiveElement('link', 'contextMenu', event, link);
  }
  onDragStart = (nodeType, event) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }
  onEdgeUpdate = (oldEdge, newConnection) => {
    let edgeParams = {...newConnection};
    edgeParams.id = oldEdge.id;

    this.setState({
      flowData: updateEdge(oldEdge, edgeParams, this.state.flowData)
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
          flowData: flow.elements || []
        });
      }
    };

    restoreFlow();
  }
  /**
   * Handle input data change
   * @method
   * @param {string} type - data type ('soarRule' or 'soarCondition')
   * @param {object} event - event object
   */
  handleDataChange = (type, event) => {
    if (type === 'soarRule') {
      let tempSoarRule = {...this.state.soarRule};
      tempSoarRule[event.target.name] = event.target.value;

      this.setState({
        soarRule: tempSoarRule
      });
    } else if (type === 'soarCondition') {
      let tempSoarCondition = {...this.state.soarCondition};
      tempSoarCondition[event.target.name] = event.target.value;

      this.setState({
        soarCondition: tempSoarCondition
      });
    }
  }
  /**
   * Toggle rule settings dialog
   * @method
   */
  toggleRuleEditDialog = () => {
    this.setState({
      openRuleEditDialog: !this.state.openRuleEditDialog
    });

    this.handleCloseMenu();
  }
  /**
   * Handle rule edit confirm
   * @method
   */
  handleRuleEditConfirm = () => {
    const {baseUrl} = this.context;
    const {testEmails} = this.state;


    this.ah.one({
      url: `${baseUrl}/api/notification/mailServer/_test?${dataParams}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {

      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Close dialog
   * @method
   */
  closeDialog = () => {
    this.setState({
      openRuleEditDialog: false
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
      },
      soarCondition: {
        operator: ''
      }
    }, () => {
      if (options === 'table') {
        this.props.toggleContent(options);
      }
    });
  }
  render() {
    const {
      openRuleEditDialog,
      soarRule,
      soarCondition,
      operatorList,
      flowData,
      selectedNode,
      contextAnchor,
      activeElementType
    } = this.state;

    return (
      <div>
        {openRuleEditDialog &&
          <SoarSingleSettings
            activeElementType={activeElementType}
            handleRuleEditConfirm={this.handleRuleEditConfirm}
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
                <MenuItem onClick={this.toggleRuleEditDialog}><i className='fg fg-edit' title={t('txt-edit')}></i></MenuItem>
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
                          value={soarRule.name}
                          onChange={this.handleDataChange.bind(this, 'soarRule')} />
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
                          onChange={this.handleDataChange.bind(this, 'soarRule')} />
                      </div>
                      <header>{t('soar.txt-soarRuleCondition')}</header>
                      <div className='group'>
                        <TextField
                          id='soarRuleCondition'
                          className='query-name dropdown'
                          name='operator'
                          select
                          label='Operator'
                          variant='outlined'
                          fullWidth
                          size='small'
                          required
                          value={soarCondition.operator}
                          onChange={this.handleDataChange.bind(this, 'soarCondition')}>
                          {operatorList}
                        </TextField>
                      </div>
                    </div>
                  </aside>

                  <div className='reactflow-wrapper'>
                    <div className='drag-section'>
                      {NODE_TYPE.map(this.getNodeType)}
                    </div>
                    <div ref={this.reactFlowWrapper}>
                      <ReactFlow
                        elements={flowData}
                        onLoad={this.onLoad}
                        onConnect={this.onConnect}
                        onElementClick={this.onElementClick}
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
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SoarFlow.contextType = BaseDataContext;

SoarFlow.propTypes = {
  soarColumns: PropTypes.object.isRequired,
  soarIndividualData: PropTypes.object.isRequired,
  toggleContent: PropTypes.func.isRequired
};

export default SoarFlow;