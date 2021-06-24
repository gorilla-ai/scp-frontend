import React, { Component, useRef } from 'react'
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

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'

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
class SoarController extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      reactFlowInstance: null,
      flowData: [],
      selectedNode: {},
      contextAnchor: {
        node: null,
        link: null
      },
      activeElementType: '',
      activeElement: {
        node: null,
        link: null
      }
    };

    this.reactFlowWrapper = React.createRef();
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    localforage.config({
      name: 'react-flow-demo',
      storeName: 'flows',
    });

    this.getFlowData();
  }
  ryan = () => {

  }
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
  render() {
    const {flowData, selectedNode, contextAnchor} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
          </div>
        </div>

        <div className='data-content react-flow-demo'>
          <Menu
            anchorEl={contextAnchor.node || contextAnchor.link}
            keepMounted
            open={Boolean(contextAnchor.node || contextAnchor.link)}
            onClose={this.handleCloseMenu}>
            <MenuItem onClick={this.onElementsRemove}>Remove</MenuItem>
          </Menu>

          <ReactFlowProvider>
            <div className='reactflow-wrapper' ref={this.reactFlowWrapper}>
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

            <aside>
              {NODE_TYPE.map(this.getNodeType)}
              <div className='btn-group'>
                <Button variant='contained' color='primary' onClick={this.onSave}>Save</Button>
                <Button variant='contained' color='primary' onClick={this.onRestore}>Restore</Button>
              </div>
              <div className='selected-node'>
                <div>Selected Node:</div>
                <JSONTree data={selectedNode} theme={helper.getJsonViewTheme()} />
              </div>
              <div>
                <div>Node Data:</div>
                <JSONTree data={flowData} theme={helper.getJsonViewTheme()} />
              </div>
            </aside>
          </ReactFlowProvider>
        </div>
      </div>
    )
  }
}

SoarController.contextType = BaseDataContext;

SoarController.propTypes = {
};

export default SoarController;