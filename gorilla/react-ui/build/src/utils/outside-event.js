'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.subscribe = subscribe;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  * @module outside-event
  * @description A subscription for clicking on inside/outside events
  */

var log = require('loglevel').getLogger('core/utils/outside-event');

function unsubscribe() {
    log.debug('unsubscribe');
    (0, _jquery2.default)('html').off();
}

/**
 * @typedef {Object} handler
 * @property {function} onInside attach inside event
 * @property {function} onOutside attach outside event
 * @property {function} unsubscribe unsubscribe from event
 */

/**
 * Subscribe to inside/outside events.
 * @param {dom} node - node to initialze handler for
 * @return {handler} handler for attaching or unsubscribe from the event
 *
 * @example
 * let handler = subscribe(document.getElementById('region'))
 *     .onInside(target=>{ console.log('inside is clicked') })
 *     .onOutside(target=>{ console.log('outside is clicked') })
 *
 * handler.unsubscribe()
 */
function subscribe(node) {
    log.debug('subscribe');

    var onInside = void 0,
        onOutside = void 0,
        handle = void 0;

    var register = function register(type, func) {
        if (!func || !_lodash2.default.isFunction(func)) {
            log.error('register event failed');
            return null;
        }
        if (type === 'inside') {
            onInside = func;
        } else if (type === 'outside') {
            onOutside = func;
        } else {
            log.error('unsupported event type', type);
        }
        return handle;
    };

    handle = {
        unsubscribe: unsubscribe,
        onInside: register.bind(null, 'inside'),
        onOutside: register.bind(null, 'outside')
    };

    (0, _jquery2.default)('html').on('click', function (evt) {
        var target = evt.target;

        if (node) {
            if (target.id !== 'overlay' && _jquery2.default.contains(node, target)) {
                onInside && onInside(target);
            } else {
                onOutside && onOutside(target);
            }
        }
    });

    return handle;
}

exports.default = subscribe;