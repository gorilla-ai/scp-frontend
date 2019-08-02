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