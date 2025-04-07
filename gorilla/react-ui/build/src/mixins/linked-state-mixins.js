'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LinkedDeepStateMixin = exports.LinkedStateMixin = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
                                                                                                                                                                                                                    * @module linked-state-mixins
                                                                                                                                                                                                                    * @description Input mixin methods for React components.
                                                                                                                                                                                                                    */

var log = require('loglevel').getLogger('core/mixins/linked-state-mixins');

/**
 * Mixin methods for React components. <br>
 * Used for linking input value with component's state
 *
 * @mixin
 * @todo Change this into HOC or pure js module, to avoid prerequisites
 */
var LinkedStateMixin = exports.LinkedStateMixin = {
    requestChange: function requestChange(field, newValue) {
        this.setState(_defineProperty({}, field, newValue));
    },
    linkState: function linkState(field) {
        var value = _lodash2.default.get(this.state, field, null);

        return {
            requestChange: this.requestChange.bind(this, field),
            value: value
        };
    }
};

/**
 * Mixin methods for React components. <br>
 * Used for linking input value with component's NESTED state
 *
 * @mixin
 * @todo Change this into HOC or pure js module, to avoid prerequisites
 */
var LinkedDeepStateMixin = exports.LinkedDeepStateMixin = {
    requestDeepChange: function requestDeepChange(field, newValue) {
        this.setState(_objectPathImmutable2.default.set(this.state, field, newValue));
    },
    linkDeepState: function linkDeepState(field) {
        var value = _lodash2.default.get(this.state, field, null);

        return {
            requestChange: this.requestDeepChange.bind(this, field),
            value: value
        };
    }
};