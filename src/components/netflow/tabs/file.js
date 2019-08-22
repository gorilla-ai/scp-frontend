import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Checkbox from 'react-ui/build/src/components/checkbox'
import Tabs from 'react-ui/build/src/components/tabs'

import {HocFilterContent as FilterContent} from '../../common/filter-content'
import helper from '../../common/helper'
import RadioGroup from 'react-ui/build/src/components/radio-group'
import TableContent from '../../common/table-content'
import {HocTree as Tree} from '../../common/tree'
import withLocale from '../../../hoc/locale-provider'

let t = null;
let et = null;

class File extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');    
  }
  render() {
    const {mainContentData} = this.props;

    return (
      <div className='data-content'>
        <Tree
          {...mainContentData} />

        <div className='data-table'>
          <FilterContent
            {...mainContentData} />

          <Tabs
            id='subTabMenu'
            menu={mainContentData.subTabMenu}
            current={mainContentData.activeSubTab}
            onChange={mainContentData.handleSubTabChange}>
          </Tabs>

          <div className='file-options'>
            <div className='c-flex aic imgCheckBox'>
              <label htmlFor='showImgCheckbox'>{t('network.connections.txt-showImageOnly')}</label>
              <Checkbox
                id='showImgCheckbox'
                onChange={mainContentData.handleShowImgCheckbox}
                checked={mainContentData.showImageValue}
                disabled={mainContentData.displayImgType === 'grid'} />
            </div>
            {(mainContentData.showImageValue) &&
              <RadioGroup
                id='displayFileType'
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
            {
              mainContentData.dataTableData.map((item, i) => {
                if (item.base64.indexOf('data:image/') >= 0) {
                  return <img src={item.base64} key={i} onClick={mainContentData.openImageModal(item.base64)} />;
                }
              })
            }
            </div>
          }

          <TableContent
            {...mainContentData} />
        </div>
      </div>
    )
  }
}

File.propTypes = {
  mainContentData: PropTypes.object.isRequired,
  tabChartData: PropTypes.object.isRequired
};

export default withLocale(File);