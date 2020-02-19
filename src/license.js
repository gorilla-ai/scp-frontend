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
    const {baseUrl, contextRoot} = this.props;
    let formData = new FormData();
    formData.append('key', this.state.key);

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
            if (confirmed) {
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
    const {lms, key} = this.state;
    let text = lt(`${lms.returnCode}`);

    if (lms.returnCode === '0') {
      text = Moment(lms.expireDate, 'YYYYMMDD').format('YYYY-MM-DD');
    }

    return (
      <div id='g-login' className='c-center global c-flex fdc'>
        <div className='lms'>
          <div className='expire'>
            <span className='date'>{lt('l-license-expiry')}:</span>
            <span>{text}</span>
          </div>
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