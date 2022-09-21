import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import TextField from '@material-ui/core/TextField'
import TreeItem from '@material-ui/lab/TreeItem'
import TreeView from '@material-ui/lab/TreeView'

import FileInput from 'react-ui/build/src/components/file-input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from './context';
import helper from './helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

/**
 * Floor Map
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the floor map and its settings
 */
class FloorMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      floorPlan: {
        treeData: [],
        type: '',
        rootAreaUUID: '',
        currentAreaUUID: '',
        currentAreaName: '',
        name: '',
        map: null
      },
      mapAreaUUID: '',
      currentMap: '',
      currentBaseLayers: {},
      previewFloorMap: '',
      floorNameError: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getFloorPlan();
  }
  /**
   * Get and set floor plan data
   * @method
   */
  getFloorPlan = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/area/_tree`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempFloorPlan = {...this.state.floorPlan};

        if (data.length > 0) {
          const floorPlanData = data[0];
          const areaUUID = floorPlanData.areaUUID;
          tempFloorPlan.treeData = data;
          tempFloorPlan.type = 'edit';
          tempFloorPlan.rootAreaUUID = floorPlanData.rootAreaUUID;
          tempFloorPlan.currentAreaUUID = areaUUID;
          tempFloorPlan.currentAreaName = floorPlanData.areaName;
          tempFloorPlan.name = floorPlanData.areaName;
          tempFloorPlan.map = null;

          this.setState({
            floorPlan: tempFloorPlan,
            previewFloorMap: ''
          }, () => {
            this.getAreaData(areaUUID);
          });
        } else {
          this.setState({
            floorPlan: {
              treeData: [],
              type: 'add',
              rootAreaUUID: '',
              currentAreaUUID: '',
              currentAreaName: '',
              name: '',
              map: null
            },
            previewFloorMap: ''
          });
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set area related data
   * @method
   * @param {string} areaUUID - area UUID
   */
  getAreaData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.context;
    const floorPlan = areaUUID || this.state.floorPlan.currentAreaUUID;

    if (!floorPlan) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/area?uuid=${floorPlan}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let currentMap = '';

        if (data.picPath) {
          const picPath = `${baseUrl}${contextRoot}/api/area/_image?path=${data.picPath}`;
          const picWidth = data.picWidth;
          const picHeight = data.picHeight;

          currentMap = {
            label: data.areaName,
            images: [
              {
                id: data.areaUUID,
                url: picPath,
                size: {width: picWidth, height: picHeight}
              }
            ]
          };
        }

        const currentBaseLayers = {
          [floorPlan]: currentMap
        };

        this.setState({
          mapAreaUUID: floorPlan,
          currentMap,
          currentBaseLayers
        });
        return null;
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempFloorPlan = {...this.state.floorPlan};
    tempFloorPlan[event.target.name] = event.target.value;  

    this.setState({
      floorPlan: tempFloorPlan
    });
  }
  /**
   * Set map data change
   * @method
   * @param {string | object} value - input data to be set
   */
  handleMapChange = (value) => {
    const specialCharacterCheck = /[!@#$%^&*+\=\[\]{};':"\\|,<>\/?~]/;
    let tempFloorPlan = {...this.state.floorPlan};
    tempFloorPlan.map = value;

    if (value && specialCharacterCheck.test(value.name)) {
      helper.showPopupMsg('', t('txt-error'), t('txt-specialCharacterError'));
      return;
    }

    this.setState({
      previewFloorMap: value ? URL.createObjectURL(value) : '',
      floorPlan: tempFloorPlan
    });
  }
  /**
   * Handle tree selection
   * @param {object} val - tree data
   * @method
   */
  handleSelectTree = (val) => {
    const areaUUID = val.areaUUID;
    let tempFloorPlan = {...this.state.floorPlan};
    tempFloorPlan.currentAreaName = val.areaName;
    tempFloorPlan.currentAreaUUID = areaUUID;
    tempFloorPlan.currentParentAreaUUID = val.parentAreaUUID;
    tempFloorPlan.name = val.areaName;
    tempFloorPlan.type = 'edit';

    this.setState({
      floorPlan: tempFloorPlan,
      previewFloorMap: '',
      floorNameError: false
    }, () => {
      this.fileInput.handleClick();
      this.getAreaData(areaUUID);
    });
  }
  /**
   * Display tree item
   * @method
   * @param {object} val - tree data
   * @param {number} i - index of the tree data
   * @returns TreeItem component
   */
  getTreeItem = (val, i) => {
    return (
      <TreeItem
        key={val.id + i}
        id={'floorMapTree_'+ val.label}
        nodeId={val.id}
        label={val.label}
        onLabelClick={this.handleSelectTree.bind(this, val)}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getTreeItem)
        }
      </TreeItem>
    )
  }
  /**
   * Get tree data
   * @method
   * @param {object} tree - tree data
   * @param {number} i - index of the floorPlan tree data
   * @returns TreeView component
   */
  displayTreeView = (tree, i) => {
    return (
      <TreeView
        key={i}
        id='floorMapTreeView'
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultSelected={tree.areaUUID}
        defaultExpanded={[tree.areaUUID]}
        selected={this.state.floorPlan.currentAreaUUID}>
        {tree.areaUUID &&
          <TreeItem
            id={'floorMapTree_'+ tree.areaName}
            nodeId={tree.areaUUID}
            label={tree.areaName}
            onLabelClick={this.handleSelectTree.bind(this, tree)}>
            {tree.children.length > 0 &&
              tree.children.map(this.getTreeItem)
            }
          </TreeItem>
        }
      </TreeView>
    )
  }
  /**
   * Display delete area content
   * @method
   * @returns HTML DOM
   */
  getDeleteAreaContent = () => {
    return (
      <div className='content delete'>
        <span>{t('network-topology.txt-deleteFloorMsg')}: {this.state.floorPlan.currentAreaName}?</span>
      </div>
    )
  }
  /**
   * Show the delete area modal dialog
   * @method
   */
  openDeleteAreaModal = () => {
    PopupDialog.prompt({
      title: t('network-topology.txt-deleteFloor'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteAreaContent(),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteAreaMap();
        }
      }
    });
  }
  /**
   * Delete specific area and reset the floor plan
   * @method
   */
  deleteAreaMap = () => {
    const {baseUrl} = this.context;
    const {floorPlan} = this.state;

    if (!floorPlan.currentAreaUUID) {
      return;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/area?uuid=${floorPlan.currentAreaUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          floorPlan: this.clearFloorPlanData('edit'),
          currentMap: ''
        }, () => {
          this.getFloorPlan();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), t('network-topology.txt-deleteChild'));
    })
  }
  /**
   * Display delete floor content
   * @method
   * @returns HTML DOM
   */
  getDeleteFloorContent = () => {
    return (
      <div className='content delete'>
        <span>{t('network-topology.txt-deleteFloorMapMsg')} ({this.state.floorPlan.currentAreaName})?</span>
      </div>
    )
  }
  /**
   * Show the delete single area modal dialog
   * @method
   */
  openDeleteSingleAreaModal = () => {
    PopupDialog.prompt({
      title: t('network-topology.txt-deleteFloorMap'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteFloorContent(),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteFloorMap();
        }
      }
    });
  }
  /**
   * Delete single floor map file
   * @method
   */
  deleteFloorMap = () => {
    const {baseUrl} = this.context;
    const {floorPlan} = this.state;
    const requestType = 'PATCH';
    let formData = new FormData();
    formData.append('areaName', floorPlan.name);
    formData.append('scale', 0);
    formData.append('areaUUID', floorPlan.currentAreaUUID);
    formData.append('rootAreaUUID', floorPlan.rootAreaUUID);
    formData.append('areaRoute', '');

    if (floorPlan.currentParentAreaUUID) {
      formData.append('parentAreaUUID', floorPlan.currentParentAreaUUID);
    } else {
      formData.append('parentAreaUUID', '');
    }

    formData.append('file', '');
    formData.append('updatePic', true);

    this.ah.one({
      url: `${baseUrl}/api/area`,
      data: formData,
      type: requestType,
      processData: false,
      contentType: false
    })
    .then(data => {
      this.setState({
        floorPlan: this.clearFloorPlanData('edit'),
        currentMap: ''
      }, () => {
        this.getFloorPlan();
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set floor plan based on user's actions
   * @method
   * @param {string} type - action type ('add' or 'clear')
   */
  handleMapActions = (type) => {
    if (type === 'add') {
      let tempFloorPlan = {...this.state.floorPlan};
      tempFloorPlan.type = type;
      tempFloorPlan.name = '';

      this.setState({
        floorPlan: tempFloorPlan
      });
    } else if (type === 'clear') {
      this.setState({
        floorPlan: this.clearFloorPlanData('clear'),
        currentMap: ''
      });
    }
  }
  /**
   * Display Add Floor content
   * @method
   * @returns HTML DOM
   */
  displayAddFloor = () => {
    const {floorPlan, currentMap, previewFloorMap, floorNameError} = this.state;

    return (
      <div>
        <div className='text'>
          {floorPlan.currentAreaUUID &&
            <div>{t('network-topology.txt-selected-node')}: <span>{floorPlan.currentAreaName}</span></div>
          }
        </div>
        <div className='left'>
          <header>
            {(!floorPlan.currentAreaUUID || floorPlan.type === 'add') &&
              <i className='fg fg-add active' title={t('network-topology.txt-addTree')}></i>
            }
            {floorPlan.currentAreaUUID && floorPlan.type === 'edit' &&
              <span>
                <i id='floorMapClearTree' className='c-link fg fg-cancel' onClick={this.handleMapActions.bind(this, 'clear')} title={t('network-topology.txt-deselectTree')}></i>
                <i id='floorMapAddTree' className='c-link fg fg-add' onClick={this.handleMapActions.bind(this, 'add')} title={t('network-topology.txt-addTree')}></i>
                <i id='floorMapRemoveTree' className='c-link fg fg-trashcan' onClick={this.openDeleteAreaModal} title={t('network-topology.txt-removeTree')}></i>
              </span>
            }
          </header>

          <div className='display-tree'>
            {floorPlan.treeData && floorPlan.treeData.length > 0 &&
              floorPlan.treeData.map(this.displayTreeView)
            }
          </div>
        </div>

        <div className='right'>
          <header className='add-floor'>
            <div className='field'>
              <label htmlFor='areaMapUpload'>{t('txt-name')}</label>
              <TextField
                id='floorMapAreaName'
                name='name'
                variant='outlined'
                fullWidth
                size='small'
                required
                error={floorNameError}
                helperText={floorNameError ? t('txt-required') : ''}
                value={floorPlan.name}
                onChange={this.handleDataChange} />
            </div>
            <div className='field upload'>
              <label htmlFor='areaMapUpload'>{t('txt-network-map')}</label>
              <FileInput
                ref={ref => { this.fileInput = ref }}
                id='areaMapUpload'
                className='file-input area-upload'
                name='file'
                btnText={t('txt-upload')}
                validate={{
                  max: 10,
                  extension: ['.jpg', '.jpeg', '.png'],
                  t: (code, params) => {
                    if (code[0] === 'file-wrong-format') {
                      return t('txt-file-format-error') + ` ${params.extension}`
                    }
                  }
                }}
                onChange={this.handleMapChange} />
            </div>

            <i id='floorMapSaveFloor' className='c-link fg fg-save' onClick={this.handleFloorSave} title={t('network-topology.txt-saveFloor')}></i>

            {floorPlan.type !== 'add' && floorPlan.currentAreaUUID && currentMap &&
              <i id='floorMapDeleteFloor' className='c-link fg fg-trashcan' onClick={this.openDeleteSingleAreaModal} title={t('network-topology.txt-deleteFloorMap')}></i>
            }
          </header>
          <div className='map'>
            {previewFloorMap &&
              <img src={previewFloorMap} title={floorPlan.currentAreaName + ' ' + t('txt-floorMap')} />
            }
            {!previewFloorMap && floorPlan.type !== 'add' && currentMap.images &&
              <img src={currentMap.images[0].url} title={floorPlan.currentAreaName + ' ' + t('txt-floorMap')} />
            }
          </div>
        </div>
      </div>
    )
  }
  /**
   * Add/Edit area floor map and reload the map/table
   * @method
   */  
  handleFloorSave = () => {
    const {baseUrl} = this.context;
    const {floorPlan} = this.state;
    let formData = new FormData();
    let requestType = 'POST';

    if (floorPlan.name) {
      this.setState({
        floorNameError: false
      });
    } else {
      this.setState({
        floorNameError: true
      });
      return;
    }

    formData.append('areaName', floorPlan.name);
    formData.append('scale', 0);

    if (floorPlan.type === 'add') {
      if (floorPlan.currentAreaUUID) {
        formData.append('parentAreaUUID', floorPlan.currentAreaUUID);
      }

      if (floorPlan.map) {
        formData.append('file', floorPlan.map);
      }
    } else if (floorPlan.type === 'edit') {
      requestType = 'PATCH';
      formData.append('areaUUID', floorPlan.currentAreaUUID);
      formData.append('rootAreaUUID', floorPlan.rootAreaUUID);
      formData.append('areaRoute', '');

      if (floorPlan.currentParentAreaUUID) {
        formData.append('parentAreaUUID', floorPlan.currentParentAreaUUID);
      } else {
        formData.append('parentAreaUUID', '');
      }

      if (floorPlan.map) {
        formData.append('file', floorPlan.map);
        formData.append('updatePic', true);
      } else {
        formData.append('file', '');
        formData.append('updatePic', false);
      }
    } else if (floorPlan.type === 'clear') {
      if (floorPlan.map) {
        formData.append('file', floorPlan.map);
        formData.append('updatePic', true);
      }
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/area`,
      data: formData,
      type: requestType,
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data.ret === 0) {
        helper.showPopupMsg(t('network-topology.txt-saveSuccess'));

        this.setState({
          floorPlan: this.clearFloorPlanData('edit'),
          currentMap: ''
        }, () => {
          this.fileInput.handleClick();
          this.getFloorPlan();
          this.getAreaData(data.rt); //areaUUID
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Clear floor plan data
   * @method
   * @param {string} actionType - action type to be cleared ('clear' or 'edit')
   * @returns data object
   */
  clearFloorPlanData = (type) => {
    return {
      treeData: this.state.floorPlan.treeData,
      type,
      rootAreaUUID: '',
      currentAreaUUID: '',
      currentAreaName: '',
      name: '',
      map: ''
    };
  }
  /**
   * Close dialog and reload the map/table
   * @method
   */
  handleFloorConfirm = () => {
    this.closeDialog('reload');
  }
  /**
   * Reset floor plan data before closing the modal dialog
   * @method
   * @param {string} options - option to reload the data
   * @param {string} type - option for 'confirm' or 'cancel'
   */
  closeDialog = (options, type) => {
    let tempFloorPlan = {...this.state.floorPlan};
    tempFloorPlan.type = '';
    tempFloorPlan.name = tempFloorPlan.currentAreaName;
    tempFloorPlan.map = '';

    this.setState({
      floorPlan: tempFloorPlan,
      previewFloorMap: ''
    }, () => {
      this.fileInput.handleClick();

      if (type) {
        if (type === 'cancel') {
          this.props.closeDialog();
        }
      } else {
        this.props.closeDialog(options, 'fromFloorMap');
      }
    });
  }
  render() {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.handleFloorConfirm}
    };
    const titleText = t('network-topology.txt-editFloorMap');

    return (
      <ModalDialog
        id='floorModalDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayAddFloor()}
      </ModalDialog>
    )
  }
}

FloorMap.contextType = BaseDataContext;

FloorMap.propTypes = {
};

export default FloorMap;