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
let et = null;

class File extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');    
  }
  showGridImage = (val, i) => {
    const {mainContentData} = this.props;

    if (val.base64 && val.base64.indexOf('data:image/') >= 0) {
      return <img key={i} src={val.base64} onClick={mainContentData.openImageModal(val.base64)} />;
    }
  }
  render() {
    const {mainContentData} = this.props;

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

            <div className='file-options'>
              <div className='c-flex aic imgCheckBox'>
                <label htmlFor='showImgCheckbox'>{t('events.connections.txt-showImageOnly')}</label>
                <Checkbox
                  id='showImgCheckbox'
                  onChange={mainContentData.handleShowImgCheckbox}
                  checked={mainContentData.showImageValue}
                  disabled={mainContentData.displayImgType === 'grid'} />
              </div>
              {(mainContentData.showImageValue) &&
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

            {mainContentData.displayImgType === 'grid' &&
              <div className='grid-flex'>
                {mainContentData.dataTableData.map(this.showGridImage)}
              </div>
            }

            <TableContent
              {...mainContentData} />
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