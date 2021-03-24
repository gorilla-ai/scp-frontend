import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import Gis from 'react-gis/build/src/components'
import VbdaLA from 'vbda-ui/build/src/components/analysis/la'

import {BaseDataContext} from '../../../common/context';
import DataChart from '../../../common/data-chart'
import FilterContent from '../../../common/filter-content'
import helper from '../../../common/helper'
import Pagination from '../../../common/pagination'
import TableContent from '../../../common/table-content'
import Tree from '../../../common/tree'

/**
 * Events Netflow Connections
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Netflow Connections
 */
class Connections extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {contextRoot, language} = this.context;
    const {mainContentData, tabChartData, tableMouseOver} = this.props;
    const assetsPath = `${contextRoot}/lib/keylines/assets/`;
    const tabsMenu = _.map(mainContentData.subTabMenu, (val, key) => {
      return <Tab label={val} value={key} />
    });

    return (
      <div className='data-content'>
        <Tree
          {...mainContentData} />

        <div className='parent-content'>
          <FilterContent
            {...mainContentData} />

          <DataChart
            mainContentData={mainContentData}
            tabChartData={tabChartData}
            tableMouseOver={tableMouseOver} />

          <div className='main-content'>
            <Tabs
              indicatorColor='primary'
              textColor='primary'
              value={mainContentData.activeSubTab}
              onChange={mainContentData.handleSubTabChange}>
              {tabsMenu}
            </Tabs>

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
                    paginationOptions={[
                      {value: 500, text: '500'},
                      {value: 1000, text: '1000'},
                      {value: 2000, text: '2000'},
                      {value: 5000, text: '5000'}
                    ]}
                    totalCount={mainContentData.paginationTotalCount}
                    pageSize={mainContentData.paginationAlertPageSize}
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
                    pageSize={mainContentData.paginationAlertPageSize}
                    currentPage={mainContentData.paginationCurrentPage}
                    onPageChange={mainContentData.paginationAlertPageChange.bind(this, 'map')}
                    onDropDownChange={mainContentData.paginationAlertDropDownChange.bind(this, 'map')} />
                </footer>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

Connections.contextType = BaseDataContext;

Connections.propTypes = {
  mainContentData: PropTypes.object.isRequired,
  tabChartData: PropTypes.object.isRequired
};

export default Connections;