import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import withLocale from '../../hoc/locale-provider'

let t = null;

/**
 * Arrow Tree
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the file upload
 */
class ArrowTree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  test = () => {

  }
  toggleOpenNode = (id) => {
    const {opened} = this.state;
    let tempOpened = opened;

    if (_.includes(opened, id)) {
      _.remove(tempOpened, function(item) {
        return item === id;
      });
    } else {
      tempOpened.push(id);
    }

    this.setState({
      opened: tempOpened
    });
  }
  getSubcontent = (val, i) => {
    if (val.content) {
      return <div key={i}>{val.content}</div>
    } else if (val.children) {
      return val.children.map(this.getRuleContent);
    }
  }
  getRuleContent = (val, i) => {
    const {opened} = this.state;

    return (
      <div key={val + i} className='rule-content'>
        <div className='header' onClick={this.toggleOpenNode.bind(this, val.id)}>
          <i className={cx('fg fg-play', {'rotate': _.includes(opened, val.id)})}></i>
          <span>{val.label}</span>
        </div>
        {val.children &&
          <div className={cx('sub-content', {'hide': !_.includes(opened, val.id)})}>
            {val.children.map(this.getSubcontent)}
          </div>
        }
        {val.content &&
          <span className={cx({'hide': !_.includes(opened, val.id)})}>{val.content}</span>
        }
      </div>
    )
  }
  render() {
    const {data} = this.props;

    return (
      <div className='list'>
        <div className='group'>
          <div className='rule'>
            {data.children.map(this.getRuleContent)}
          </div>
        </div>
      </div>
    )
  }
}

ArrowTree.propTypes = {
  data: PropTypes.object.isRequired
};

const HocArrowTree = withLocale(ArrowTree);
export { ArrowTree, HocArrowTree };