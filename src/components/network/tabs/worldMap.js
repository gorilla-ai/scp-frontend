import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Gis from 'react-gis/build/src/components'

import {HocFilterContent as FilterContent} from '../../common/filter-content'
import helper from '../../common/helper'
import {HocPagination as Pagination} from '../../common/pagination'
import {HocTimebarChart as TimebarChart} from '../../common/timebar-chart'

import withLocale from '../../../hoc/locale-provider'

let t = null;

class WorldMap extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  render() {
    const {baseUrl, contextRoot, mainContentData, tabChartData, tableMouseOver} = this.props;

    return (
      <div className='map-content'>
        <FilterContent
          {...mainContentData} />

        <TimebarChart
          baseUrl={baseUrl}
          contextRoot={contextRoot}
          mainContentData={mainContentData}
          tabChartData={tabChartData}
          tableMouseOver={tableMouseOver} />

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
            pageSize={mainContentData.paginationPageSize}
            currentPage={mainContentData.paginationCurrentPage}
            onPageChange={this.props.mainContentData.paginationPageChange}
            onDropDownChange={this.props.mainContentData.paginationDropDownChange} />
        </footer>
      </div>
    )
  }
}

WorldMap.propTypes = {
  mainContentData: PropTypes.object.isRequired,
  tabChartData: PropTypes.object.isRequired
};

export default withLocale(WorldMap);