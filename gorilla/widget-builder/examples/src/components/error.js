import React from 'react'
import i18n from 'i18next'
import PopupDialog from 'core/components/popup-dialog'

import eh from 'core/utils/error-helper'

const log = require('loglevel').getLogger('error')

const gt = i18n.getFixedT(null, 'app')

export function popupErrors(errors, t) {
    PopupDialog.alert({
        title: gt('dlg-error'),
        display: <span dangerouslySetInnerHTML={{__html:eh.getMsg(errors, {ft:t})}} />,
        confirmText: gt('btn-ok')
    })
}

export function popupErrorMsg(msg, title) {
    PopupDialog.alert({
        title: title || gt('dlg-error'),
        display: <span dangerouslySetInnerHTML={{__html:msg}} />,
        confirmText: gt('btn-ok')
    })
}

export default {
    popupErrors,
    popupErrorMsg
}
