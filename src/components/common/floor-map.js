import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import helper from './helper'
import withLocale from '../../hoc/locale-provider'

let t = null;

class FloorMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidMount = () => {

  }
  displayAddFloor = () => {
    const {currentMap, floorPlan} = this.props;
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
      <div className='wide-dialog add-floor'>
        <div className='content'>
          <div className='text'>
            {floorPlan.currentAreaUUID &&
              <div>{t('network-topology.txt-selected-node')}: <span>{floorPlan.currentAreaName}</span></div>
            }
          </div>
          <div className='left border'>
            <header>
              {floorPlan.currentAreaUUID &&
                <i className='c-link fg fg-cancel' onClick={this.props.getAddMapContent.bind(this, 'clear')} title={deselectTree}></i>
              }
              <i className={cx('c-link', 'fg', 'fg-add', {'active': floorPlan.type === 'add' || !floorPlan.currentAreaUUID})} onClick={this.props.getAddMapContent.bind(this, 'add')} title={addTree}></i>
              {floorPlan.currentAreaUUID &&
                <span>
                  <i className={cx('c-link', 'fg', 'fg-edit', {'active': floorPlan.type === 'edit'})} onClick={this.props.getAddMapContent.bind(this, 'edit')} title={editTree}></i>
                  <i className='c-link fg fg-trashcan' onClick={this.props.openDeleteAreaModal} title={removeTree}></i>
                </span>
              }
            </header>

            <div className='display-tree'>
              {floorPlan.treeData && !_.isEmpty(floorPlan.treeData) &&
                floorPlan.treeData.map((value, i) => {
                  return this.props.getTreeView(value, floorPlan.currentAreaUUID, i);
                })
              }
            </div>
          </div>

          <div className='right no-padding'>
            <header className='text-left add-floor'>
              <div className='field'>
                <label htmlFor='areaMapName'>{t('txt-name')}</label>
                <Input
                  id='areaMapName'
                  className='add'
                  value={floorPlan.name}
                  onChange={this.props.handleDataChange.bind(this, 'floorPlan', 'name')} />
              </div>

              <div className='field'>
                <label htmlFor='areaMapUpload'>{t('txt-network-map')}</label>
                <FileInput
                  id='areaMapUpload'
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
                  onChange={this.props.handleDataChange.bind(this, 'floorPlan', 'map')} />
              </div>

              {showMap && currentMap && floorPlan.currentAreaUUID &&
                <i className='c-link fg fg-trashcan' onClick={this.openDeleteSingleAreaModal} title={removeMap}></i>
              }
            </header>
            <div className='map'>
              {showMap && currentMap.images &&
                <img src={currentMap.images[0].url} title={floorPlan.currentAreaName + ' ' + t('txt-floorMap')} />
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
  render() {
    const {floorPlan} = this.props;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.props.handleFloorConfirm.bind(this, 'addFloor')}
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