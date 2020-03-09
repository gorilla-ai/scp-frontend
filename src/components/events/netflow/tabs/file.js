import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Checkbox from 'react-ui/build/src/components/checkbox'
import RadioGroup from 'react-ui/build/src/components/radio-group'
import Tabs from 'react-ui/build/src/components/tabs'

import {HocFilterContent as FilterContent} from '../../../common/filter-content'
import helper from '../../../common/helper'
import TableContent from '../../../common/table-content'
import {HocTree as Tree} from '../../../common/tree'
import withLocale from '../../../../hoc/locale-provider'

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
                  <label htmlFor='showImgCheckbox'>{t('events.connections.txt-showImageOnly')}</label>
                  <Checkbox
                    id='showImgCheckbox'
                    onChange={mainContentData.handleShowImgCheckbox}
                    checked={mainContentData.showImageValue}
                    disabled={mainContentData.displayImgType === 'grid'} />
                </div>
                {mainContentData.showImageValue &&
                  <RadioGroup
                    className='display-file-type'
                    list={[
                      {
                        value: 'list',
                        text: t('txt-list')
                      },
                      {
                        value: 'grid',
                        text: t('txt-grid')
                      }
                    ]}
                    onChange={mainContentData.handleDisplayChange}
                    value={mainContentData.displayImgType}/>
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

export default withLocale(File);