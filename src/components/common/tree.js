import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Hierarchy from 'react-ui/build/src/components/hierarchy'

import Pagination from './pagination'

let t = null;

/**
 * Tree
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the tree data
 */
class Tree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showContent: true,
      tabData: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidMount() {
    this.loadTabData();
  }
  componentDidUpdate(prevProps) {
    this.loadTabData(prevProps);
  }
  /**
   * Construct and set the tab data for Events dropdown menu
   * @method
   * @param {object} prevProps - previous react props when the props have been updated
   */
  loadTabData = (prevProps) => {
    const {eventsCount, allTabData} = this.props;
    let tabData = [];

    _.forEach(allTabData, (val, key) => {
      _.forEach(eventsCount, (val2, key2) => {
        val2 = val2 ? val2 : 0;

        if (key2 === key) {
          tabData.push({
            value: key,
            text: val + ' (' + val2 + ')'
          });
        }
      })
    })

    if (!prevProps || (eventsCount !== prevProps.eventsCount)) {
      this.setState({
        tabData
      });
    }
  }
  /**
   * Toggle (show/hide) the left menu
   * @method
   */
  toggleLeftNav = () => {
    this.setState({
      showContent: !this.state.showContent
    });
  }
  /**
   * Show checkbox for Hierarchy component
   * @method
   * @param {string} key - tree name for the Threats page ('alert', 'private', 'public' and 'edge')
   * @returns enabled settings
   */
  showCheckBox = (key) => {
    if (key === 'edge') {
      return {
        enabled: true
      };
    }
  }
  /**
   * Handle checkbox selection change
   * @method
   * @param {array.<string>} selectedId - selected IDs for edge
   */
  handleSelectChange = (selected) => {
    this.props.handleSelectChange(selected);
  }
  /**
   * Show multiple tree data for Threats page
   * @method
   * @param {string} key - tree name for the Threats page ('alert', 'private', 'public' and 'edge')
   * @param {object} treeData - tree data of the Threats
   * @returns HTML DOM
   */
  showAlertTree = (key, treeData) => {
    const {showContent} = this.state;
    const className = key + '-tree';

    if (!_.isEmpty(treeData[key].data)) {
      return (
        <div key={key} className={className}>
          <label className={cx('header-text', {'hide': !showContent})}>{treeData[key].title}</label>
          <Hierarchy
            layout='tree'
            foldable={true}
            indent={[4, 0]}
            data={treeData[key].data}
            selection={this.showCheckBox(key)}
            onSelectionChange={this.handleSelectChange}
            defaultOpened={['all', 'All']}
            onLabelMouseOver={this.props.showTreeFilterBtn.bind(this, key)} />
        </div>
      )
    }
  }
  render() {
    const {projectID, activeTab, treeTitle, treeShowDropDown, treeData} = this.props;
    const {showContent, tabData} = this.state;

    return (
      <div className={cx('left-nav tree', {'collapse': !showContent})}>
        {activeTab === 'alert' && _.isEmpty(treeData.alert.data) &&
          <span className='loading'><i className='fg fg-loading-2'></i></span>
        }

        {activeTab === 'logs' && !treeData &&
          <span className='loading'><i className='fg fg-loading-2'></i></span>
        }

        {treeShowDropDown && tabData.length > 0 &&
          <div>
            <label htmlFor='analysisType' className={cx('header-text', {'hide': !showContent})}>{t('events.connections.txt-analysisType')}</label>
            <DropDownList
              id='analysisType'
              className='analysis-type'
              list={tabData}
              required={true}
              onChange={this.props.handleTabChange}
              value={activeTab} />
          </div>
        }

        {projectID && treeShowDropDown && !treeData &&
          <span className='loading'><i className='fg fg-loading-2'></i></span>
        }

        <div className='content'>
          {activeTab !== 'alert' && !_.isEmpty(treeData) &&
            <div>
              <label className={cx('header-text', {'hide': !showContent})}>{treeTitle}</label>
              <Hierarchy
                layout='tree'
                foldable={true}
                indent={[4, 0]}
                data={treeData}
                defaultOpened={['all', 'All']}
                onLabelMouseOver={this.props.showTreeFilterBtn} />
            </div>
          }
          {activeTab === 'alert' &&
            <div>
              {
                Object.keys(treeData).map(key =>
                  this.showAlertTree(key, treeData)
                )
              }
            </div>
          }
        </div>

        <div className='expand-collapse' onClick={this.toggleLeftNav}>
          {showContent &&
            <i className='fg fg-arrow-left'></i>
          }
          {!showContent &&
            <i className='fg fg-arrow-right'></i>
          }
        </div>
      </div>
    )
  }
}

Tree.propTypes = {
  activeTab: PropTypes.string.isRequired
};

const HocTree = Tree;
export { Tree, HocTree };