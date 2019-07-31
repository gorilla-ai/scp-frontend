import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import Mark from './mark'

import withLocale from '../../hoc/locale-provider'

let t = null;

class MarkContent extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  render() {
    const {showMark} = this.props;

    return (
      <div className={cx('main-mark', {'active': showMark})}>
        <div className='header-text'>{t('syslogFields.query')}</div>
        <Mark
          inline={true}
          {...this.props} />
        <div className='button-group'>
          <button className='filter' onClick={this.props.handleSearchSubmit.bind(this, 'mark')}>{t('network.connections.txt-mark')}</button>
          <button className='clear' onClick={this.props.handleResetBtn.bind(this, 'mark')}>{t('network.connections.txt-clear')}</button>
        </div>
      </div>
    )
  }
}

MarkContent.propTypes = {
};

const HocMarkContent = withLocale(MarkContent);
export { MarkContent, HocMarkContent };