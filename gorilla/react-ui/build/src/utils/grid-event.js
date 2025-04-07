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
 * @module grid-event
 * @description An event addon for navigating between input cells in grid
 * With this module, a table can be turned into grid, with the following abilities:
 *
 * * left, right, up, down arrows to traverse between input cells
 * * receive row/column change events
 */

var log = require('loglevel').getLogger('core/mixins/grid-mixin');

function unsubscribe(node) {
    log.debug('unsubscribe');
    (0, _jquery2.default)(node).off();
}

/**
 * @typedef {Object} handler
 * @property {function} on attach event, possible events 'row'/'column' change
 * @property {function} unsubscribe unsubscribe from event
 */

/**
 * Subscribe to data grid input traverse events.
 *
 * @param {dom} node - node to attach grid events to
 * @param {boolean} [columnLayout=false] - is the table direction in columns (not rows)?
 * @return {handler} handler for attaching or unsubscribe from the event
 *
 * @example
 * let handler = subscribe(document.getElementById('table'), false)
 *     .on('row', (rowId)=>{ console.log('row changed',rowId)})
 *     .on('column', ()=>{ console.log('column changed')})
 *
 * handler.unsubscribe()
 */
function subscribe(node) {
    var columnLayout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    log.debug('subscribe');

    var left = 37,
        up = 38,
        right = 39,
        down = 40;

    if (columnLayout) {
        left = 38;
        right = 40;
        up = 37;
        down = 39;
    }

    var handle = void 0,
        register = void 0;
    var events = {};

    register = function register(type, func) {
        if (!func || !_lodash2.default.isFunction(func)) {
            log.error('register event failed');
            return null;
        }
        if (!type || !_lodash2.default.includes(['row', 'column'], type)) {
            log.error('event type must be row or column');
            return null;
        }

        events[type] = func;

        return handle;
    };

    handle = {
        unsubscribe: unsubscribe.bind(null, node),
        on: register
    };

    (0, _jquery2.default)(node).on('keydown', 'input, div[contenteditable]', function (evt) {
        var key = evt.which;
        var input = evt.target;
        var name = input.name || input.id;
        var tr = (0, _jquery2.default)(input).closest('tr');
        var td = (0, _jquery2.default)(input).closest('td');
        var targetItem = void 0;
        switch (key) {
            case left:
            case right:
                targetItem = key === left ? td.prev() : td.next();
                targetItem && targetItem.find('input, div[contenteditable]').focus();
                events.column && events.column();
                break;
            case up:
            case down:
                targetItem = key === up ? tr.prev() : tr.next();
                if (targetItem && targetItem.length > 0) {
                    targetItem.find('input[name="' + name + '"], div[id="' + name + '"][contenteditable]').focus();
                    events.row && events.row(targetItem[0].id);
                }
                break;
            default:
                break;
        }
    });

    return handle;
}

exports.default = subscribe;