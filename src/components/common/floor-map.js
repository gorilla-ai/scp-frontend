import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import TreeView from 'react-ui/build/src/components/tree'

import helper from './helper'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

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
  componentDidMount = () => {
    this.getFloorPlan();
  }
  getFloorPlan = () => {
    const {baseUrl} = this.props;

    this.ah.one({
      url: `${baseUrl}/api/area/_tree`,
      type: 'GET'
    })
    .then(data => {
      if (data && data.length > 0) {
        const floorPlanData = data[0];
        const areaUUID = floorPlanData.areaUUID;
        let tempFloorPlan = {...this.state.floorPlan};
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
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getAreaData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.props;
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
  handleDataChange = (type, value, info) => {
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
  getAddMapContent = (type) => {
    if (type === 'clear') {
      this.setState({
        floorPlan: this.clearData('floorPlanData'),
        currentMap: this.clearData('mapData')
      });
    } else {
      const {floorPlan} = this.state;
      let tempFloorPlan = {...floorPlan};

      if (type === 'add') {
        tempFloorPlan.type = type;
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
  showTreeView = (currentAreaUUID, value, i) => {
    return this.getTreeView(value, currentAreaUUID, i); 
  }
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
            {floorPlan.currentAreaUUID &&
              <i className='c-link fg fg-cancel' onClick={this.getAddMapContent.bind(this, 'clear')} title={deselectTree}></i>
            }
            <i className={cx('c-link', 'fg', 'fg-add', {'active': floorPlan.type === 'add' || !floorPlan.currentAreaUUID})} onClick={this.getAddMapContent.bind(this, 'add')} title={addTree}></i>
            {floorPlan.currentAreaUUID &&
              <span>
                <i className={cx('c-link', 'fg', 'fg-edit', {'active': floorPlan.type === 'edit'})} onClick={this.getAddMapContent.bind(this, 'edit')} title={editTree}></i>
                <i className='c-link fg fg-trashcan' onClick={this.openDeleteAreaModal} title={removeTree}></i>
              </span>
            }
          </header>

          <div className='display-tree'>
            {floorPlan.treeData && !_.isEmpty(floorPlan.treeData) &&
              floorPlan.treeData.map(this.showTreeView.bind(this, floorPlan.currentAreaUUID))
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
            {showMap && currentMap.images && !previewFloorMap &&
              <img src={currentMap.images[0].url} title={floorPlan.currentAreaName + ' ' + t('txt-floorMap')} />
            }
          </div>
        </div>
      </div>
    )
  }
  getTreeView = (value, selectedID, i) => {
    return (
      <TreeView
        id={value.areaUUID}
        key={value.areaUUID}
        data={value}
        selected={selectedID}
        defaultOpened={[value.areaUUID]}
        onSelect={this.selectTree.bind(this, i)} />
    )
  }
  selectTree = (i, areaUUID, eventData) => {
    const {baseUrl, contextRoot} = this.props;
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
  getDeleteAreaContent = () => {
    const {floorPlan} = this.state;

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {floorPlan.currentAreaName}?</span>
      </div>
    )
  }
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
  deleteAreaMap = () => {
    const {baseUrl, contextRoot} = this.props;
    const {floorPlan} = this.state;

    ah.one({
      url: `${baseUrl}/api/area?uuid=${floorPlan.currentAreaUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          currentMap: this.clearData('mapData'),
          floorPlan: this.clearData('floorPlanData')
        }, () => {
          this.getFloorPlan();
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), t('network-topology.txt-deleteChild'));
    })
  }
  handleFloorConfirm = () => {
    const {baseUrl, contextRoot} = this.props;
    const {floorPlan} = this.state;
    let formData = new FormData();
    let requestType = 'POST';
    let floorName = '';

    if (floorPlan.type === '') {
      this.closeDialog();
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
  clearData = (type) => {
    const {floorPlan} = this.state;
    let tempData = {};

    if (type === 'mapData') {
      tempData = {
        currentMap: ''
      };
    } else if (type === 'floorPlanData') {
      tempData = {
        treeData: floorPlan.treeData,
        type: '',
        rootAreaUUID: '',
        currentAreaUUID: '',
        currentAreaName: '',
        name: '',
        map: ''
      };
    }
    return tempData;
  }
  closeDialog = (option) => {
    let tempFloorPlan = {...this.state.floorPlan};
    tempFloorPlan.type = '';
    tempFloorPlan.name = tempFloorPlan.currentAreaName;
    tempFloorPlan.map = '';

    this.setState({
      floorPlan: tempFloorPlan,
      previewFloorMap: ''
    }, () => {
      this.props.closeDialog(option, 'all');
    });
  }
  render() {
    const {floorPlan} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog},
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

FloorMap.propTypes = {

};

const HocFloorMap = withLocale(FloorMap);
export { FloorMap, HocFloorMap };