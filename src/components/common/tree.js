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
  render() {
    const {activeTab, treeData} = this.props;
    const {showContent, tabData} = this.state;

    return (
      <div className={cx('left-nav tree', {'collapse': !showContent})}>
        <div className='content'>
          {activeTab !== 'alert' && activeTab !== 'logs' &&
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
          {activeTab !== 'alert' && activeTab !== 'logs' &&
            <div>
              <label className={cx('header-text', {'hide': !showContent})}>{t('events.connections.txt-top10text')}</label>
              <Hierarchy
                layout='tree'
                foldable={true}
                indent={[4, 0]}
                data={treeData}
                defaultOpened={['all', 'All']}
                onLabelMouseOver={this.props.showFilterBtn} />
            </div>
          }

          {activeTab === 'alert' &&
            <div>
              <label className={cx('header-text', {'hide': !showContent})}>{treeData.private.title}</label>
              <Hierarchy
                layout='tree'
                foldable={true}
                indent={[4, 0]}
                data={treeData.private.data}
                defaultOpened={['all', 'All']}
                onLabelMouseOver={this.props.showFilterBtn.bind(this, 'private')} />
              <label className={cx('header-text', {'hide': !showContent})}>{treeData.public.title}</label>
              <Hierarchy
                layout='tree'
                foldable={true}
                indent={[4, 0]}
                data={treeData.public.data}
                defaultOpened={['all', 'All']}
                onLabelMouseOver={this.props.showFilterBtn.bind(this, 'public')} />
              <label className={cx('header-text', {'hide': !showContent})}>{treeData.alert.title}</label>
              <Hierarchy
                layout='tree'
                foldable={true}
                indent={[4, 0]}
                data={treeData.alert.data}
                defaultOpened={['all', 'All']}
                onLabelMouseOver={this.props.showFilterBtn.bind(this, 'alert')} />
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
  activeTab: PropTypes.string.isRequired,
  treeData: PropTypes.object.isRequired
};

const HocTree = withLocale(Tree);
export { Tree, HocTree };