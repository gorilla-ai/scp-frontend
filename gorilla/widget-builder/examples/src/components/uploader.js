import React from 'react'
import Promise from 'bluebird'
import i18n from 'i18next'
import PopupDialog from 'core/components/popup-dialog'

import ah from 'core/utils/ajax-helper'

const log = require('loglevel').getLogger('uploader')

const gt = i18n.getFixedT(null, 'app')

export function upload(url, accept, title, callback, children, id) {
    PopupDialog.prompt({
        title,
        id,
        display: <div>
            <label className='required' htmlFor='file'>{gt('lbl-select-file')}</label>
            <input id='file' type='file' accept={accept} />
            {children}
        </div>,
        cancelText: gt('btn-cancel'),
        confirmText: gt('btn-ok'),
        act: (confirmed, data) => {
            log.info('upload', {confirmed, data})

            if (confirmed) {
                const {file} = data

                if (!file) {
                    return Promise.reject(new Error(gt('lbl-select-file')))
                }

                return ah.multi(url, data, {gt})
                    .then((respData) => {
                        callback(null, respData)
                        return null
                    })
                    .catch(err => {
                        callback(err)
                        throw err
                    })
            }
            return null
        }
    })
}

export default {
    upload
}