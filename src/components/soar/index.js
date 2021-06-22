import React, { Component, useRef } from 'react'
import { withRouter } from 'react-router'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls
} from 'react-flow-renderer';

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
let id = 0;

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
      flowData: []
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
        id: '1',
        type: 'input',
        data: { label: 'Input Node' },
        position: { x: 250, y: 25 }
      },
      {
        id: '2',
        data: { label: 'Default Node' },
        position: { x: 100, y: 125 }
      },
      {
        id: '3',
        type: 'output',
        data: { label: 'Output Node' },
        position: { x: 250, y: 250 }
      }
    ];

    this.setState({
      flowData
    });
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
      id: `dndnode_${id++}`,
      type,
      position,
      data: { label: `${type} node` }
    };
    let tempFlowData = _.cloneDeep(flowData);

    this.setState({
      flowData: tempFlowData.concat(newNode)
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
  onConnect = (params) => {
    this.setState({
      flowData: addEdge(params, this.state.flowData)
    }, () => {
      this.viewData();
    });
  }
  viewData = () => {
    console.log(this.state.flowData);
  }
  getNodeType = (val, i) => {
    return <div key={i} className={'dndnode ' + val} onDragStart={this.onDragStart.bind(this, val)} draggable>{helper.capitalizeFirstLetter(val)} Node</div>
  }
  render() {
    const {
      flowData
    } = this.state;

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
                onDrop={this.onDrop}
                onDragOver={this.onDragOver} >
                <Controls />
              </ReactFlow>
            </div>

            <aside>
              {NODE_TYPE.map(this.getNodeType)}
              <Button variant='outlined' color='primary' className='standard btn' onClick={this.viewData}>View Data</Button>
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