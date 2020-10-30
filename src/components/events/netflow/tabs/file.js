import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

import Tabs from 'react-ui/build/src/components/tabs'

import FilterContent from '../../../common/filter-content'
import helper from '../../../common/helper'
import TableContent from '../../../common/table-content'
import Tree from '../../../common/tree'

let t = null;

/**
 * Events Netflow File
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Netflow File
 */
class File extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Show image data in grid view
   * @method
   * @param {object} val - image files data
   * @param {number} i - index of the image data
   * @returns HTML DOM
   */
  showGridImage = (val, i) => {
    const {mainContentData} = this.props;

    if (val.base64 && val.base64.indexOf('data:image/') >= 0) {
      return <img key={i} src={val.base64} onClick={mainContentData.openImageModal(val.base64)} />
    }
  }
  render() {
    const {mainContentData} = this.props;
    let hideTable = false;
    let pageSize = 20;
    let paginationOptions = '';

    if (mainContentData.displayImgType === 'grid') { //Make an exception for File grid type display
      hideTable = true;
      pageSize = 50;
      paginationOptions = [
        {value: 50, text: '50'},
        {value: 100, text: '100'},
        {value: 150, text: '150'},
        {value: 200, text: '200'},
        {value: 300, text: '300'}
      ];
    }

    return (
      <div className='data-content'>
        <Tree
          {...mainContentData} />

        <div className='parent-content'>
          <FilterContent
            {...mainContentData} />

          <div className='main-content'>
            <Tabs
              className='subtab-menu'
              menu={mainContentData.subTabMenu}
              current={mainContentData.activeSubTab}
              onChange={mainContentData.handleSubTabChange}>
            </Tabs>

            {mainContentData.dataTableData && mainContentData.dataTableData.length > 0 &&
              <div className='file-options'>
                <div className='c-flex aic imgCheckBox'>
                  <FormControlLabel
                    label={t('events.connections.txt-showImageOnly')}
                    control={
                      <Checkbox
                        id='showImgCheckbox'
                        className='checkbox-ui'
                        checked={mainContentData.showImageValue}
                        onChange={mainContentData.handleShowImgCheckbox}
                        color='primary' />
                    }
                    disabled={mainContentData.displayImgType === 'grid'} />
                </div>
                {mainContentData.showImageValue &&
                  <RadioGroup
                    className='radio-group display-file-type'
                    value={mainContentData.displayImgType}
                    onChange={mainContentData.handleDisplayChange}>
                    <FormControlLabel
                      value='list'
                      control={
                        <Radio
                          className='radio-ui'
                          color='primary' />
                      }
                      label={t('txt-list')} />
                    <FormControlLabel
                      value='grid'
                      control={
                        <Radio
                          className='radio-ui'
                          color='primary' />
                      }
                      label={t('txt-grid')} />
                  </RadioGroup>
                }
              </div>
            }

            {mainContentData.displayImgType === 'grid' &&
              <div className='grid-flex'>
                {mainContentData.dataTableData && mainContentData.dataTableData.length > 0 &&
                  mainContentData.dataTableData.map(this.showGridImage)
                }
              </div>
            }

            <TableContent
              {...mainContentData}
              tableHeight='63vh'
              hideTable={hideTable}
              pageSize={pageSize}
              paginationOptions={paginationOptions} />
          </div>
        </div>
      </div>
    )
  }
}

File.propTypes = {
  mainContentData: PropTypes.object.isRequired
};

export default File;