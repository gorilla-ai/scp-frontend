import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import i18n from 'i18next'
import $ from 'jquery'
import {createInstance, getInstance} from 'react-ui/build/src/utils/ajax-helper'

//let log = require('loglevel').getLogger('chewbacca/hoc/locale-provider')

const initialState = JSON.parse(document.getElementById('initial-state').innerHTML || '{}')
const {envCfg:cfg} = initialState

let initialized = false

function withLocale(Component) {
  return class extends React.Component {
    static propTypes = {
      locale: PropTypes.oneOf(['zh', 'en'])
    };

    state = {
    };

    componentWillMount() {
      if (!initialized) {
        this.createLocale()
        initialized = true
      }
    }

    createLocale = () => {
      const lng = this.props.locale ? this.props.locale : 'zh';
      let baseUrl = '';
      let contextRoot = '';
      let customLocale = '';
      let url = '';

      if (cfg) {
        baseUrl = cfg.apiPrefix;
        contextRoot = cfg.contextRoot;
        customLocale = cfg.customLocale;
      }

      if (customLocale) {
        url = baseUrl + `/api/locale?lng=${lng}`;
      } else {
        url = `/build/locales/${lng}.json`;
      }

      Promise.resolve($.get(url))
        .then(data => {
          if (customLocale) {
            return data.rt;
          } else {
            return data;
          }
        })
        .catch(xhr => {
          log.error(xhr)
          return null;
        })
        .then(resources => {
          i18n.init({
            lng,
            fallbackLng: lng,
            resources: {[lng]:resources}
          }, err => {
            if (err) {
              log.error(err);
            } else {
              initialized = true;
              this.forceUpdate()
            }
          })
        })

      createInstance(
        'chewbacca',
        {
          parseSuccess: resp => resp.rt,
          parseFail: resp => ({
              code: _.get(resp, 'ret', -100),
              message: _.get(resp, 'message')
          }),
          et: i18n.getFixedT(null, 'errors')
        }
      )

      global.chewbaccaI18n = i18n;
    };

    render() {
      return <Component {...this.props} ref={ref=>{ this._component=ref }} />
    }
  };
}

export default withLocale