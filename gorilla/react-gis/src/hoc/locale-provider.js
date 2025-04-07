import PropTypes from 'prop-types';
import React from 'react'
import i18n from 'i18next'

import globalI18nResEn from '../../locales/en/global.json'
import globalI18nResZh from '../../locales/zh/global.json'
import gisI18nResEn from '../../locales/en/gis.json'
import gisI18nResZh from '../../locales/zh/gis.json'

let log = require('loglevel').getLogger('react-gis/hoc/localize')

const LOCALES = {
    en: {
        global: globalI18nResEn,
        gis: gisI18nResEn
    },
    zh: {
        global: globalI18nResZh,
        gis: gisI18nResZh
    }
}
global.gisI18n = i18n.createInstance()
let i18nLoaded = false


export function localize(Component) {
    let propTypes = {
        lng: PropTypes.string
    }

    return class extends React.Component {
        static propTypes = propTypes;

        componentWillMount() {
            if (!i18nLoaded) {
                log.info('creating react-gis locale')
                this.createLocale()
                i18nLoaded = true
            }
        }

        componentWillReceiveProps(nextProps) {
            const {lng} = this.props
            const {lng:nextLng} = nextProps
            if (lng !== nextLng) {
                global.gisI18n.changeLanguage(nextLng)
            }
        }

        createLocale = () => {
            const {lng} = this.props
            global.gisI18n.init({
                lng,
                fallbackLng: 'en',
                resources: LOCALES
            }, err => {
                err && log.error(err)
            })
            //setupErrorTranslate(global.chewbaccaI18n.getFixedT(null, 'errors'))
        };

        render() {
            return <Component
                ref={ref=>{ this._component=ref }}
                {...this.props} />
        }
    };
}

export default localize
