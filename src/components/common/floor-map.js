import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import TreeView from 'react-ui/build/src/components/tree'

import {BaseDataContext} from './context';
import helper from './helper'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

/**
 * Floor Map
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the floor map and its settings
 */
class FloorMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      floorPlan: {
        treeData: {},
        type: '',
        rootAreaUUID: '',
        currentAreaUUID: '',
        currentAreaName: '',
        name: '',
        map: ''
      },
      mapAreaUUID: '',
      currentMap: '',
      currentBaseLayers: {},
      previewFloorMap: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getFloorPlan('firstLoad');
  }
  /**
   * Get and set floor plan data
   * @method
   */
  getFloorPlan = (options) => {
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
          tempFloorPlan.rootAreaUUID = floorPlanData.rootAreaUUID;
          tempFloorPlan.currentAreaUUID = areaUUID;
          tempFloorPlan.currentAreaName = floorPlanData.areaName;
          tempFloorPlan.name = floorPlanData.areaName;

          this.setState({
            floorPlan: tempFloorPlan
          }, () => {
            this.getAreaData(areaUUID);
          });
        } else {
          if (options === 'firstLoad') {
            tempFloorPlan.type = 'add';

            this.setState({
              floorPlan: tempFloorPlan
            });
          } else {
            this.setState({
              floorPlan: {
                treeData: {},
                type: '',
                rootAreaUUID: '',
                currentAreaUUID: '',
                currentAreaName: '',
                name: '',
                map: ''
              },
              mapAreaUUID: '',
              currentMap: '',
              currentBaseLayers: {},
              previewFloorMap: ''
            });         
          }
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

    this.ah.one({
      url: `${baseUrl}/api/area?uuid=${floorPlan}`,
      type: 'GET'
    })
    .then(data => {
      const areaName = data.areaName;
      const areaUUID = data.areaUUID;
      let currentMap = '';

      if (data.picPath) {
        const picPath = `${baseUrl}${contextRoot}/api/area/_image?path=${data.picPath}`;
        const picWidth = data.picWidth;
        const picHeight = data.picHeight;

        currentMap = {
          label: areaName,
          images: [
            {
              id: areaUUID,
              url: picPath,
              size: {width: picWidth, height: picHeight}
            }
          ]
        };
      }

      const currentBaseLayers = {};
      currentBaseLayers[floorPlan] = currentMap;

      this.setState({
        mapAreaUUID: floorPlan,
        currentMap,
        currentBaseLayers
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set input data change
   * @method
   * @param {string} type - input type
   * @param {string | object} value - input data to be set
   */
  handleDataChange = (type, value) => {
    let tempFloorPlan = {...this.state.floorPlan};
    tempFloorPlan[type] = value;

    if (type === 'map') {
      const file = value ? URL.createObjectURL(value) : '';

      this.setState({
        previewFloorMap: file
      });
    }

    this.setState({
      floorPlan: tempFloorPlan
    });
  }
  /**
   * Set floor plan based on user actions
   * @method
   * @param {string} type - action type ('add', 'edit' or 'clear')
   */
  handleMapActions = (type) => {
    if (type === 'clear') {
      this.setState({
        floorPlan: this.clearData('floorPlanData', 'clear'),
        currentMap: this.clearData('mapData')
      });
    } else {
      const {floorPlan} = this.state;
      let tempFloorPlan = {...floorPlan};
      tempFloorPlan.type = type;

      if (type === 'add') {
        tempFloorPlan.name = '';
      } else if (type === 'edit') {
        if (_.isEmpty(floorPlan.treeData)) {
          tempFloorPlan.type = 'add';
          tempFloorPlan.name = '';
        }
      }

      this.setState({
        floorPlan: tempFloorPlan
      });
    }
  }
  /**
   * Get tree data
   * @method
   * @param {object} tree - tree data
   * @param {string} selectedID - selected area UUID
   * @param {number} i - index of the floorPlan tree data
   * @returns TreeView component
   */
  getTreeView = (tree, selectedID, i) => {
    return (
      <TreeView
        id={tree.areaUUID}
        key={tree.areaUUID}
        data={tree}
        selected={selectedID}
        defaultOpened={[tree.areaUUID]}
        onSelect={this.selectTree.bind(this, i)} />
    )
  }
  /**
   * Display tree data for lefe nav
   * @method
   * @param {string} currentAreaUUID - current active area UUID
   * @param {object} value - floor plan data
   * @param {number} i - index of the tree array
   * @returns content of the TreeView component
   */
  displayTreeView = (currentAreaUUID, value, i) => {
    return this.getTreeView(value, currentAreaUUID, i); 
  }
  /**
   * Set floor plan based on user's section of the tree
   * @method
   * @param {number} i - index of the tree array
   * @param {string} areaUUID - current active area UUID
   * @param {object} eventData - event data
   */
  selectTree = (i, areaUUID, eventData) => {
    let tempFloorPlan = {...this.state.floorPlan};
    let tempArr = [];
    let pathStr = '';
    let pathNameStr = '';
    let pathParentStr = '';

    if (eventData.path.length > 0) {
      _.forEach(eventData.path, val => {
        if (val.index >= 0) {
          tempArr.push(val.index);
        }
      })
    }

    _.forEach(tempArr, val => {
      pathStr += 'children[' + val + '].'
    })

    pathNameStr = pathStr + 'label';
    pathParentStr = pathStr + 'parentAreaUUID';

    if (eventData.path[0].id) {
      tempFloorPlan.rootAreaUUID = eventData.path[0].id;
    }
    tempFloorPlan.currentAreaUUID = areaUUID;
    tempFloorPlan.currentAreaName = _.get(tempFloorPlan.treeData[i], pathNameStr);
    tempFloorPlan.currentParentAreaUUID = _.get(tempFloorPlan.treeData[i], pathParentStr);
    tempFloorPlan.name = tempFloorPlan.currentAreaName;
    tempFloorPlan.type = 'edit';

    this.setState({
      floorPlan: tempFloorPlan
    }, () => {
      this.getAreaData(areaUUID);
    });
  }
  /**
   * Display delete area content
   * @method
   * @returns HTML DOM
   */
  getDeleteAreaContent = () => {
    const {floorPlan} = this.state;

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {floorPlan.currentAreaName}?</span>
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

    ah.one({
      url: `${baseUrl}/api/area?uuid=${floorPlan.currentAreaUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          currentMap: this.clearData('mapData'),
          floorPlan: this.clearData('floorPlanData', 'delete')
        }, () => {
          this.getFloorPlan();
        });
      }
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
    const {floorPlan} = this.state;

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}?</span>
      </div>
    )
  }
  /**
   * Show the delete single area modal dialog
   * @method
   */
  openDeleteSingleAreaModal = () => {
    PopupDialog.prompt({
      title: t('network-topology.txt-deleteFloorPlan'),
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
      this.getFloorPlan();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display Add Floor content
   * @method
   */
  displayAddFloor = () => {
    const {currentMap, floorPlan, previewFloorMap} = this.state;
    const addTree = t('network-topology.txt-addTree');
    const selectTree = t('network-topology.txt-selectTree');
    const deselectTree = t('network-topology.txt-deselectTree');
    const editTree = t('network-topology.txt-editTree');
    const removeTree = t('network-topology.txt-removeTree');
    const removeMap = t('network-topology.txt-deleteFloorMap');
    let showMap = true;

    if (floorPlan.type === 'add') {
      showMap = false;
    }

    return (
      <div>
        <div className='text'>
          {floorPlan.currentAreaUUID &&
            <div>{t('network-topology.txt-selected-node')}: <span>{floorPlan.currentAreaName}</span></div>
          }
        </div>
        <div className='left'>
          <header>
            <i className='c-link fg fg-cancel' onClick={this.handleMapActions.bind(this, 'clear')} title={deselectTree}></i>
            {floorPlan.type === 'add' &&
             <i className='c-link fg fg-add active' title={addTree}></i>
            }
            {floorPlan.type === 'edit' &&
             <i className={cx('c-link', 'fg', 'fg-add', {'active': !floorPlan.currentAreaUUID})} onClick={this.handleMapActions.bind(this, 'add')} title={addTree}></i>
            }
            {floorPlan.currentAreaUUID && floorPlan.type === 'edit' &&
              <span>
                <i className='c-link fg-ft-edit' onClick={this.handleMapActions.bind(this, 'edit')} title={editTree}></i>
                <i className='c-link fg fg-trashcan' onClick={this.openDeleteAreaModal} title={removeTree}></i>
              </span>
            }
          </header>

          <div className='display-tree'>
            {floorPlan.treeData && floorPlan.treeData.length > 0 &&
              floorPlan.treeData.map(this.displayTreeView.bind(this, floorPlan.currentAreaUUID))
            }
          </div>
        </div>

        <div className='right'>
          <header className='add-floor'>
            <div className='field'>
              <label htmlFor='areaMapName'>{t('txt-name')}</label>
              <Input
                id='areaMapName'
                className='add'
                required={true}
                onChange={this.handleDataChange.bind(this, 'name')}
                value={floorPlan.name} />
            </div>

            <div className='field'>
              <label htmlFor='areaMapUpload'>{t('txt-network-map')}</label>
              <FileInput
                id='areaMapUpload'
                className='area-upload'
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
                onChange={this.handleDataChange.bind(this, 'map')} />
            </div>

            {showMap && currentMap && floorPlan.currentAreaUUID &&
              <i className='c-link fg fg-trashcan' onClick={this.openDeleteSingleAreaModal} title={removeMap}></i>
            }
          </header>
          <div className='map'>
            {previewFloorMap &&
              <img src={previewFloorMap} title={floorPlan.currentAreaName + ' ' + t('txt-floorMap')} />
            }
            {!previewFloorMap && showMap && currentMap.images &&
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
  handleFloorConfirm = () => {
    const {baseUrl} = this.context;
    const {floorPlan} = this.state;
    let formData = new FormData();
    let requestType = 'POST';
    let floorName = '';

    if (floorPlan.type === '') {
      this.closeDialog('reload');
      return;
    }

    if (floorPlan.type === 'clear') {
      helper.showPopupMsg(t('network-topology.txt-selected-node'), t('txt-error'));
      return;
    }

    if (floorPlan.name) {
      floorName = floorPlan.name;
    } else {
      helper.showPopupMsg(t('network-topology.txt-enterFloor'), t('txt-error'));
      return;
    }

    formData.append('areaName', floorName);
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
      floorPlan.currentAreaName = floorName;

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
    }

    this.ah.one({
      url: `${baseUrl}/api/area`,
      data: formData,
      type: requestType,
      processData: false,
      contentType: false
    })
    .then(data => {
      this.getFloorPlan();

      if (data) {
        this.getAreaData(data, 'setAreaUUID');
      } else {
        this.getAreaData();
      }

      this.closeDialog('reload');
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Clear floor plan data
   * @method
   * @param {string} type - data type to be cleared
   */
  clearData = (type, actionType) => {
    const {floorPlan} = this.state;
    let tempData = {};

    if (type === 'mapData') {
      tempData = {
        currentMap: ''
      };
    } else if (type === 'floorPlanData') {
      let action = '';

      if (actionType === 'clear') {
        action = actionType;
      }

      tempData = {
        treeData: floorPlan.treeData,
        type: action,
        rootAreaUUID: '',
        currentAreaUUID: '',
        currentAreaName: '',
        name: '',
        map: ''
      };
    }
    return tempData;
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
      if (!type) {
        this.props.closeDialog(options, 'fromFloorMap');
      } else if (type === 'cancel') {
        this.props.closeDialog();
      }
    });
  }
  render() {
    const {floorPlan} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog.bind(this, 'reload', 'cancel')},
      confirm: {text: t('txt-confirm'), handler: this.handleFloorConfirm}
    };
    let titleText = '';

    if (floorPlan.type === 'edit' || floorPlan.type === 'map') {
      titleText = t('network-topology.txt-editFloorMap');
    } else {
      titleText = t('network-topology.txt-addFloorMap');
    }

    return (
      <ModalDialog
        id='floorModalDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayAddFloor()}
      </ModalDialog>
    )
  }
}

FloorMap.contextType = BaseDataContext;

FloorMap.propTypes = {
};

const HocFloorMap = withLocale(FloorMap);
export { FloorMap, HocFloorMap };