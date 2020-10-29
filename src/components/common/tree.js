import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import cx from 'classnames'

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import Hierarchy from 'react-ui/build/src/components/hierarchy'

import helper from './helper'
import Pagination from './pagination'

let t = null;

const StyledTextField = withStyles({
  root: {
    backgroundColor: '#fff',
    '& .Mui-disabled': {
      backgroundColor: '#f2f2f2'
    }
  }
})(TextField);

function TextFieldComp(props) {
  return (
    <StyledTextField
      id={props.id}
      className={props.className}
      name={props.name}
      type={props.type}
      label={props.label}
      multiline={props.multiline}
      rows={props.rows}
      maxLength={props.maxLength}
      variant={props.variant}
      fullWidth={props.fullWidth}
      size={props.size}
      InputProps={props.InputProps}
      required={props.required}
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled} />
  )
}

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
      tabData: [],
      edgeSelectedNode: ''
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
   * Handle tree checkbox selection change
   * @method
   * @param {array.<string>} selected - selected IDs for edge
   */
  handleSelectChange = (selected) => {
    this.setState({
      edgeSelectedNode: selected
    });

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
    const {showContent, edgeSelectedNode} = this.state;
    const className = key + '-tree';

    if (!_.isEmpty(treeData[key].data)) {
      return (
        <div key={key} className={className}>
          <label className={cx('header-text', {'hide': !showContent})}>{treeData[key].title}</label>
          <Hierarchy
            layout='tree'
            foldable={true}
            data={treeData[key].data}
            selection={this.showCheckBox(key)}
            onSelectionChange={this.handleSelectChange}
            selected={edgeSelectedNode}
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
      <div className={cx('left-nav tree netflow', {'collapse': !showContent})}>
        {activeTab === 'alert' && _.isEmpty(treeData.alert.data) &&
          <span className='loading'><i className='fg fg-loading-2'></i></span>
        }

        {activeTab === 'logs' && !treeData &&
          <span className='loading'><i className='fg fg-loading-2'></i></span>
        }

        {treeShowDropDown && tabData.length > 0 &&
          <div>
            <label htmlFor='analysisType' className={cx('header-text', {'hide': !showContent})}>{t('events.connections.txt-analysisType')}</label>
            <StyledTextField
              id='analysisType'
              className='analysis-type'
              select
              variant='outlined'
              fullWidth={true}
              size='small'
              value={activeTab}
              onChange={this.props.handleTabChange}>
              {tabData}
            </StyledTextField>
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