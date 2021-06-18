import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import TreeItem from '@material-ui/lab/TreeItem'
import TreeView from '@material-ui/lab/TreeView'

import helper from './helper'
import Pagination from './pagination'

let t = null;

/**
 * Tree
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
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
          tabData.push(
            <MenuItem key={key} value={key}>{val + ' (' + helper.numberWithCommas(val2) + ')'}</MenuItem>
          );
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
   * Display tree item
   * @method
   * @param {string} type - tree type ('syslog', 'netflow', alert', 'private', 'public' or 'edge')
   * @param {object} val - tree data
   * @param {number} i - index of the tree data
   * @returns TreeItem component
   */
  getTreeItem = (type, val, i) => {
    let treeItemParam = {};

    if (type !== 'edge') {
      treeItemParam.onLabelClick = (event) => {
        event.preventDefault();
      };
    }

    return (
      <TreeItem
        key={val.id + i}
        nodeId={val.id}
        label={val.label}
        {...treeItemParam}
        onMouseOver={this.props.showTreeFilterBtn.bind(this, type, val.key)}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getTreeItem.bind(this, type))
        }
      </TreeItem>
    )
  }
  /**
   * Show multiple tree data for Threats page
   * @method
   * @param {string} key - tree name for the Threats page ('alert', 'private', 'public' or 'edge')
   * @param {object} treeData - tree data of the Threats
   * @returns HTML DOM
   */
  showAlertTree = (key, treeData) => {
    if (!_.isEmpty(treeData[key].data)) {
      return (
        <div key={key}>
          <label id={key + 'TreeHeaer'} className={cx('header-text', {'hide': !this.state.showContent})}>{treeData[key].title}</label>
          <TreeView
            className='tree-view'
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            defaultExpanded={['All']}>
            <TreeItem
              nodeId={treeData[key].data.id}
              label={treeData[key].data.label}>
              {treeData[key].data.children.map(this.getTreeItem.bind(this, key))}
            </TreeItem>
          </TreeView>
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
            <TextField
              id='analysisType'
              className='analysis-type'
              select
              variant='outlined'
              fullWidth
              size='small'
              value={activeTab}
              onChange={this.props.handleTabChange}>
              {tabData}
            </TextField>
          </div>
        }

        {projectID && treeShowDropDown && !treeData &&
          <span className='loading'><i className='fg fg-loading-2'></i></span>
        }

        <div className='content'>
          {activeTab === 'alert' &&
            <Button id='alertDownloadBtn' variant='outlined' color='primary' className='standard csv-btn active' onClick={this.props.getLeftNavCSVfile} title={t('txt-exportCSV')}><i className='fg fg-file-csv'></i></Button>
          }

          {activeTab !== 'alert' && !_.isEmpty(treeData) &&
            <div>
              <label className={cx('header-text', {'hide': !showContent})}>{treeTitle}</label>
              <TreeView
                className='tree-view'
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                defaultExpanded={['all']}>
                <TreeItem
                  nodeId={treeData.id}
                  label={treeData.label}>
                  {treeData.children.length > 0 &&
                    treeData.children.map(this.getTreeItem.bind(this, activeTab))
                  }
                </TreeItem>
              </TreeView>
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
          <i className={`fg fg-arrow-${showContent ? 'left' : 'right'}`}></i>
        </div>
      </div>
    )
  }
}

Tree.propTypes = {
  activeTab: PropTypes.string.isRequired
};

export default Tree;