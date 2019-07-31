import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Hierarchy from 'react-ui/build/src/components/hierarchy'

import Pagination from './pagination'
import withLocale from '../../hoc/locale-provider'

let t = null;

class Tree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showContent: true,
      tabData: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidMount = () => {
    this.loadTabData();
  }
  componentDidUpdate = (prevProps) => {
    this.loadTabData(prevProps);
  }
  loadTabData = (prevProps) => {
    const {eventsCount, allTabData} = this.props;
    let tabData = [];

    _.forEach(allTabData, (val, key) => {
      _.forEach(eventsCount, (val2, key2) => {
        if (key2 === key) {
          tabData.push(
            {
              value: key,
              text: val + ' (' + val2 + ')'
            }
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
  toggleLeftNav = () => {
    this.setState({
      showContent: !this.state.showContent
    });
  }
  testFunction = (a, b, c) => {
    //console.log('you clicked me');
  }
  render() {
    const {activeTab, treeData} = this.props;
    const {showContent, tabData} = this.state;

    return (
      <div className='left-nav tree'>
        <div className={cx('toggle-content', {'hide': !showContent})}>
          {activeTab !== 'alert' && activeTab !== 'logs' &&
            <div>
              <label htmlFor='analysisType' className='header-text'>{t('network.connections.txt-analysisType')}</label>
              <DropDownList
                id='analysisType'
                className='analysis-type'
                list={tabData}
                required={true}
                onChange={this.props.handleTabChange}
                value={activeTab} />
            </div>
          }
          {activeTab !== 'alert' && activeTab !== 'logs' &&
            <div className='header-text'>{t('network.connections.txt-top10text')}</div>
          }
          <Hierarchy
            layout='tree'
            foldable={true}
            indent={[4, 0]}
            data={treeData}
            defaultOpened={['all', 'All']}
            onLabelMouseOver={this.props.showFilterBtn}
            onToggleOpen={this.testFunction} />
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
};

const HocTree = withLocale(Tree);
export { Tree, HocTree };