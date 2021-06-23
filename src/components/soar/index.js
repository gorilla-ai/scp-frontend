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
  Background,  
} from 'react-flow-renderer';

import JSONTree from 'react-json-tree'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import TextField from '@material-ui/core/TextField'
import TreeItem from '@material-ui/lab/TreeItem'
import TreeView from '@material-ui/lab/TreeView'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'

import {downloadWithForm} from 'react-ui/build/src/utils/download'
import Gis from 'react-gis/build/src/components'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NODE_TYPE = ['input', 'default', 'output'];
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
      selectedNode: {}
    };

    this.reactFlowWrapper = React.createRef();
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
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
    }, () => {
      this.viewData();
    });
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
    }, () => {
      this.viewData();
    });

    event.preventDefault();
  }
  onDragStart = (nodeType, event) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }
  onElementsRemove = (elementsToRemove) => {
    this.setState({
      flowData: removeElements(elementsToRemove, this.state.flowData)
    }, () => {
      this.viewData();
    });
  }
  onNodeClick = (event) => {
    const {flowData} = this.state;
    const nodeId = !_.isEmpty(event.target.dataset) ? event.target.dataset.id : '';

    if (nodeId) {
      const selectedFlowIndex = _.findIndex(flowData, { 'id': nodeId });
      const selectedNode = flowData[selectedFlowIndex];

      this.setState({
        selectedNode
      });
    } else {
      this.setState({
        selectedNode: {}
      });
    }
  }
  onConnect = (params) => {
    let edgeParams = {...params};
    edgeParams.id = ++id + '_' + 'Link';
    edgeParams.animated = true;
    edgeParams.arrowHeadType = 'arrow';
    edgeParams.type = 'smoothstep';
    edgeParams.nodeType = 'link';

    this.setState({
      flowData: addEdge(edgeParams, this.state.flowData)
    }, () => {
      this.viewData();
    });
  }
  onEdgeUpdate = (oldEdge, newConnection) => {
    let edgeParams = {...newConnection};
    edgeParams.id = oldEdge.id;

    this.setState({
      flowData: updateEdge(oldEdge, edgeParams, this.state.flowData)
    }, () => {
      this.viewData();
    });
  }
  viewData = () => {
    console.log(this.state.flowData);
  }
  getNodeType = (val, i) => {
    return <div key={i} className={'dndnode ' + val} onDragStart={this.onDragStart.bind(this, val)} draggable>{this.getNodeText(val)}</div>
  }
  render() {
    const {flowData, selectedNode} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='outlined' color='primary' className='' title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
          </div>
        </div>

        <div className='data-content'>
          <ReactFlowProvider>
            <div className='reactflow-wrapper' ref={this.reactFlowWrapper}>
              <ReactFlow
                elements={flowData}
                onLoad={this.onLoad}
                onConnect={this.onConnect}
                onElementsRemove={this.onElementsRemove}
                deleteKeyCode={46}
                onClick={this.onNodeClick}
                onDrop={this.onDrop}
                onDragOver={this.onDragOver}
                onEdgeUpdate={this.onEdgeUpdate} >
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