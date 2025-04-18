import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import _ from 'lodash'

import License from '../../../license'

import {BaseDataContext} from '../../common/context'
import Config from '../../common/configuration'
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

/**
 * Product Information
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Product info page
 */
class ProductInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      license: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);
    helper.inactivityTime(baseUrl, locale);
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  render() {
    const {baseUrl, contextRoot} = this.context;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            <div className='main-content'>
              <header className='main-header'>{t('txt-productInfo')}</header>
              <div className='table-content'>
                <div className='table no-pagination'>
                  <License
                    from='config' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ProductInfo.contextType = BaseDataContext;

ProductInfo.propTypes = {
};

export default withRouter(ProductInfo);