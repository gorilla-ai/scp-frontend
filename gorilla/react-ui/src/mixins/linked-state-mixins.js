/**
  * @module linked-state-mixins
  * @description Input mixin methods for React components.
  */

import _ from 'lodash'
import im from 'object-path-immutable'

let log = require('loglevel').getLogger('core/mixins/linked-state-mixins')

/**
 * Mixin methods for React components. <br>
 * Used for linking input value with component's state
 *
 * @mixin
 * @todo Change this into HOC or pure js module, to avoid prerequisites
 */
export const LinkedStateMixin = {
    requestChange(field, newValue) {
        this.setState({[field]:newValue})
    },
    linkState(field) {
        let value = _.get(this.state, field, null)

        return {
            requestChange: this.requestChange.bind(this, field),
            value
        }
    }
}

/**
 * Mixin methods for React components. <br>
 * Used for linking input value with component's NESTED state
 *
 * @mixin
 * @todo Change this into HOC or pure js module, to avoid prerequisites
 */
export const LinkedDeepStateMixin = {
    requestDeepChange(field, newValue) {
        this.setState(im.set(this.state, field, newValue))
    },
    linkDeepState(field) {
        let value = _.get(this.state, field, null)

        return {
            requestChange: this.requestDeepChange.bind(this, field),
            value
        }
    }
}