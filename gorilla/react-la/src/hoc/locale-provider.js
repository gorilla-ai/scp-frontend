import PropTypes from 'prop-types';
import React from 'react'
import i18n from 'i18next'

import globalI18nResEn from '../../locales/en/global.json'
import globalI18nResZh from '../../locales/zh/global.json'
import laI18nResEn from '../../locales/en/la.json'
import laI18nResZh from '../../locales/zh/la.json'

let log = require('loglevel').getLogger('react-la/hoc/localize')

const LOCALES = {
    en: {
        global: globalI18nResEn,
        la: laI18nResEn
    },
    zh: {
        global: globalI18nResZh,
        la: laI18nResZh
    }
}
global.laI18n = i18n.createInstance()
let i18nLoaded = false


export function localize(Component) {
    let propTypes = {
        lng: PropTypes.string
    }

    return class extends React.Component {
        static propTypes = propTypes;

        componentWillMount() {
            if (!i18nLoaded) {
                log.info('creating react-la locale')
                this.createLocale()
                i18nLoaded = true
            }
        }

        componentWillReceiveProps(nextProps) {
            const {lng} = this.props
            const {lng:nextLng} = nextProps
            if (lng !== nextLng) {
                global.laI18n.changeLanguage(nextLng)
            }
        }

        createLocale = () => {
            const {lng} = this.props
            global.laI18n.init({
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