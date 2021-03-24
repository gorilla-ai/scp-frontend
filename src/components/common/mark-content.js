import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import Button from '@material-ui/core/Button';

import MarkInput from './mark-input'

let t = null;

/**
 * Mark Content
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the mark menu content
 */
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
        <MarkInput
          inline={true}
          {...this.props} />
        <div className='button-group'>
          <Button id='confirmQueryBtn' variant='contained' color='primary' className='filter' onClick={this.props.handleSearchSubmit.bind(this, 'mark')}>{t('events.connections.txt-mark')}</Button>
          <Button id='clearQueryBtn' variant='outlined' color='primary' className='clear' onClick={this.props.handleResetBtn.bind(this, 'mark')}>{t('events.connections.txt-clear')}</Button>
        </div>
      </div>
    )
  }
}

MarkContent.propTypes = {
  showMark: PropTypes.bool.isRequired
};

export default MarkContent;