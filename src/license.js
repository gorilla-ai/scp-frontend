import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Input from 'react-ui/build/src/components/input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import helper from './components/common/helper'
import withLocale from './hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;
let lt = null;

class License extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      lms: {
        returnCode: null,
        expireDate: null,
        isValid: null
      },
      originalKey: '',
      key: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    lt = global.chewbaccaI18n.getFixedT(null, 'lms');
    this.ah = getInstance('chewbacca');    
  }
  componentDidMount() {
    this.loadData();
  }
  /**
   * Load LMS data
   * @method
   * @returns HTML DOM
   */
  loadData = () => {
    const {baseUrl, contextRoot} = this.props;
    const apiArr = [
      {
        url: `${baseUrl}/api/lms/_registerKey`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/lms/verifyOnline`,
        data: JSON.stringify({}),
        type: 'POST',
        contentType: 'text/plain'
      }
    ];

    this.ah.all(apiArr)
    .then(data => {
      if (data) {
        this.setState({
          originalKey: data[0],
          key: data[0],
          lms: data[1]
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle license input change
   * @method
   * @param {string} value - input value from user
   */
  handleInputChange = (value) => {
    this.setState({
      key: value
    });
  }
  /**
   * Handle license activate button
   * @method
   */
  activateLicense = () => {
    const {baseUrl, contextRoot, from} = this.props;
    const {originalKey, key} = this.state;

    if (originalKey === key) {
      helper.showPopupMsg(lt('key-acivated'), t('txt-error'));
      return;
    }

    let formData = new FormData();
    formData.append('key', key);

    const apiArr = [
      {
        url: `${baseUrl}/api/lms/_registerKey`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/lms/activate`,
        data: formData,
        type: 'POST',
        processData: false,
        contentType: false
      }
    ];

    this.ah.all(apiArr)
    .then(data => {
      if (data[1].returnCode !== '0') {
        helper.showPopupMsg('', t('txt-error'), lt(`${data[1].returnCode}`));
      } else {
        PopupDialog.alert({
          id: 'modalWindowSmall',
          confirmText: t('txt-ok'),
          display: (
            <div className='content'><span>{lt('l-activate-success')}</span></div>
          ),
          act: (confirmed) => {
            if (confirmed && from === 'login') {
              this.props.onPass();
            }
          }
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {from} = this.props;
    const {lms, key} = this.state;
    let text = lt('l-license-none');
    let licenseDate = '';
    let error = true;

    if (lms.expireDate) {
      licenseDate = Moment(lms.expireDate, 'YYYYMMDD').format('YYYY-MM-DD');

      if (lms.returnCode === '0') {
        text = lt('l-license-already');
        error = false;
      } else {
        text = lt(`${lms.returnCode}`);
      }
    }

    return (
      <div id='g-login' className={cx('c-center global c-flex fdc', {'config': from === 'config'})}>
        <div className='lms'>
          <div>
            <span className='msg'>{lt('l-license-status')}:</span>
            <span className={cx({'error': error})}>{text}</span>
          </div>
          {licenseDate &&
            <div>
              <span className='msg'>{lt('l-license-expiry')}:</span>
              <span>{licenseDate}</span>
            </div>
          }
          <div className='key'>
            <span>{lt('l-license-key')}</span>
            <Input
              value={key}
              onChange={this.handleInputChange} />
            <button onClick={this.activateLicense}>{lt('l-activate')}</button>
          </div>
        </div>
      </div>
    )
  }
}

License.propTypes = {
};

export default withLocale(License);