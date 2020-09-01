import React, {Component} from 'react'
import {withRouter} from 'react-router'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import ContextMenu from 'react-ui/build/src/components/contextmenu'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Tabs from 'react-ui/build/src/components/tabs'

import {BaseDataContext} from '../common/context';
import helper from '../common/helper'
import SearchOptions from '../common/search-options'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * Host
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to handle the business logic for the threats page
 */
class HostController extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      showFilter: false,
      showLeftNav: true,
      //General
      datetime: {
        from: helper.getSubstractDate(1, 'hour'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      activeSubTab: 'hostList', //'hostList', 'deviceMap'
      //Tab IncidentDevice
      subTabMenu: {
        table: t('host.txt-hostList'),
        statistics: t('host.txt-deviceMap')
      },
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {

  }
  ryan = () => {

  }
  /**
   * Toggle (show/hide) the left menu
   * @method
   */
  toggleLeftNav = () => {
    this.setState({
      showLeftNav: !this.state.showLeftNav
    });
  }
  /**
   * Toggle filter content on/off
   * @method
   */
  toggleFilter = () => {
    this.setState({
      
    });
  }
  /**
   * Set new datetime and reload page data
   * @method
   * @param {object} datetime - new datetime object
   */
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  handleSearchSubmit = () => {

  }
  /**
   * Handle content tab change
   * @method
   * @param {string} type - content type ('hostList' or 'deviceMap')
   */
  handleSubTabChange = (type) => {
    this.setState({
      activeSubTab: type
    });
  } 
  render() {
    const {showLeftNav, datetime, activeSubTab} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
          </div>

          <SearchOptions
            datetime={datetime}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.handleSearchSubmit} />
        </div>

        <div className='data-content'>
          <div className={cx('left-nav', {'collapse': !showLeftNav})}>
            <div className='content'>
              ryan chen
            </div>
            <div className='expand-collapse' onClick={this.toggleLeftNav}>
              <i className={`fg fg-arrow-${showLeftNav ? 'left' : 'right'}`}></i>
            </div>
          </div>

          <div className='parent-content'>
            <div className='main-content'>
              <Tabs
                className='subtab-menu'
                menu={{
                  hostList: t('host.txt-hostList'),
                  deviceMap: t('host.txt-deviceMap')
                }}
                current={activeSubTab}
                onChange={this.handleSubTabChange}>
              </Tabs>

              {activeSubTab === 'hostList' &&
                <div className=''>
                </div>
              }

              {activeSubTab === 'deviceMap' &&
                <div className=''>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

HostController.contextType = BaseDataContext;

HostController.propTypes = {
};

export default withRouter(HostController);