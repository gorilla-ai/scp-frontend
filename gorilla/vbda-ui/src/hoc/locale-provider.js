import _ from 'lodash'
import PropTypes from 'prop-types';
import React from 'react'
import i18n from 'i18next'

import vbdaI18nResEn from '../../locales/en/vbda.json'
import vbdaI18nResZh from '../../locales/zh/vbda.json'
import analysisI18nResEn from '../../locales/en/analysis.json'
import analysisI18nResZh from '../../locales/zh/analysis.json'
import searchI18nResEn from '../../locales/en/search.json'
import searchI18nResZh from '../../locales/zh/search.json'

let log = require('loglevel').getLogger('vbda/hoc/localize')

const LOCALES = {
    en: {
        vbda: vbdaI18nResEn,
        analysis: analysisI18nResEn,
        search: searchI18nResEn,
    },
    zh: {
        vbda: vbdaI18nResZh,
        analysis: analysisI18nResZh,
        search: searchI18nResZh
    }
}
global.vbdaI18n = i18n.createInstance()
let vbdaI18nLoaded = false


export function localize(Component, keyToDetect) {
    let propTypes = {
        lng: PropTypes.string
    }
    if (keyToDetect) {
        propTypes[keyToDetect] = PropTypes.object
    }

    return class extends React.Component {
        static propTypes = propTypes;

        componentWillMount() {
            if (!vbdaI18nLoaded) {
                log.info('creating vbda locale')
                this.createLocale()
                vbdaI18nLoaded = true
            }
        }

        createLocale = () => {
            const {lng} = this.props
            global.vbdaI18n.init({
                lng,
                fallbackLng: 'en',
                resources: LOCALES
            }, err => {
                err && log.error(err)
            })
            //setupErrorTranslate(global.chewbaccaI18n.getFixedT(null, 'errors'))
        };

        render() {
            if (!keyToDetect) {
                return <Component 
                    {...this.props} 
                    ref={ref=>{this._component=ref}}/>
            }

            let {locales, ...main} = this.props[keyToDetect]
            let lng = this.props.lng

            return React.createElement(Component, {
                ..._.omit(this.props, keyToDetect),
                [keyToDetect]: locales && locales[lng] ? _.merge(main, locales[lng]) : main,
                ref: ref=>{this._component=ref}
            })
        }
    };
}

export default localize