import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import Gis from 'react-gis/build/src/components'
import Tabs from 'react-ui/build/src/components/tabs'
import Timebar from 'react-timebar/build/src/components'

import {HocFilterContent as FilterContent} from '../../common/filter-content'
import helper from '../../common/helper'
import TableContent from '../../common/table-content'
import {HocPagination as Pagination} from '../../common/pagination'
import {HocTimebarChart as TimebarChart} from '../../common/timebar-chart'
import {HocTree as Tree} from '../../common/tree'
import Statistic from './statistic'
import VbdaLA from 'vbda-ui/build/src/components/analysis/la'

import withLocale from '../../../hoc/locale-provider'

let t = null;

let initialLoad = false;

class Alert extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  render() {
    const {baseUrl, contextRoot, language, chartsID, mainContentData, tabChartData, tableMouseOver} = this.props;
    const assetsPath = `${contextRoot}/lib/keylines/assets/`;

    return (
      <div className='data-content'>
        <Tree
          {...mainContentData} />

        <div className='data-table'>
          <FilterContent
            {...mainContentData} />

          <TimebarChart
            contextRoot={contextRoot}
            mainContentData={mainContentData}
            tabChartData={tabChartData}
            tableMouseOver={tableMouseOver} />

          <Tabs
            id='subTabMenu'
            menu={mainContentData.subTabMenu}
            current={mainContentData.activeSubTab}
            onChange={mainContentData.handleSubTabChange}>
          </Tabs>

          {mainContentData.activeSubTab === 'statistics' &&
            <Statistic
              baseUrl={baseUrl}
              chartsID={chartsID}
              alertStatisticData={mainContentData.alertStatisticData} />
          }

          {mainContentData.activeSubTab === 'table' &&
            <TableContent
              {...mainContentData} />
          }

          {mainContentData.activeSubTab === 'linkAnalysis' &&
            <div className='la-content'>
              <VbdaLA
                assetsPath={assetsPath}
                sourceCfg={mainContentData.LAconfig}
                events={mainContentData.mainEventsData}
                source={mainContentData.LAdata}
                sourceItemOptions={mainContentData.LAconfig.la}
                lng={language} />

              <footer>
                <Pagination
                  activeTab={mainContentData.activeTab}
                  page='linkAnalysis'
                  totalCount={mainContentData.paginationTotalCount}
                  pageSize='500'
                  currentPage={mainContentData.paginationCurrentPage}
                  onPageChange={mainContentData.paginationAlertPageChange.bind(this, 'la')}
                  onDropDownChange={mainContentData.paginationAlertDropDownChange.bind(this, 'la')} />
              </footer>
            </div>
          }

          {mainContentData.activeSubTab === 'worldMap' &&
            <div className='map-content'>
              <Gis
                id='gisMap'
                className='fit'
                data={mainContentData.geoJson.mapDataArr}
                layers={{
                  world: {
                    label: 'World Map',
                    interactive: false,
                    data: mainContentData.geoJson.attacksDataArr
                  }
                }}
                activeLayers={['world']}
                baseLayers={{
                  standard: {
                    id: 'world',
                    layer: 'world'
                  }
                }}
                mapOptions={{
                  crs: L.CRS.Simple
                }}
                onClick={mainContentData.showTopoDetail}
                symbolOptions={[{
                  match: {
                    type:'geojson'
                  },
                  selectedProps: {
                    'fill-color': 'white',
                    color: 'black',
                    weight: 0.6,
                    'fill-opacity': 1
                  }
                },
                {
                  match: {
                    type: 'spot'
                  },
                  props: {
                    'background-color': ({data}) => {
                      return data.tag === 'red' ? 'red' : 'yellow';
                    },
                    'border-color': '#333',
                    'border-width': '1px'
                  }
                }]}
                layouts={['standard']}
                dragModes={['pan']} />

              <footer>
                <Pagination
                  activeTab={mainContentData.activeTab}
                  page='worldMap'
                  totalCount={mainContentData.paginationTotalCount}
                  pageSize='500'
                  currentPage={mainContentData.paginationCurrentPage}
                  onPageChange={mainContentData.paginationAlertPageChange.bind(this, 'map')}
                  onDropDownChange={mainContentData.paginationAlertDropDownChange.bind(this, 'map')} />
              </footer>
            </div>
          }
        </div>
      </div>
    )
  }
}

Alert.propTypes = {
  mainContentData: PropTypes.object.isRequired,
  tabChartData: PropTypes.object.isRequired
};

export default withLocale(Alert);