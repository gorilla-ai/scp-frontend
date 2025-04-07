'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (items) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var resolveDescription = options.resolveDescription,
        resolveIcon = options.resolveIcon;


    var i2Items = [];

    _lodash2.default.forEach(items, function (item) {
        var itemType = item.type,
            itemId = item.id,
            hidden = item.hi,
            itemData = item.d,
            _item$t = item.t,
            t = _item$t === undefined ? '' : _item$t;


        if (hidden) {
            return;
        }

        if (itemType === 'node') {
            var description = resolveDescription ? resolveDescription(item) : '' + retrieveProps(itemData).join(', ');
            var nodeIcons = resolveIcon ? resolveIcon(item) : '';

            i2Items.push({
                '@Label': t,
                '@Description': description,
                End: {
                    Entity: {
                        '@EntityId': itemId,
                        '@Identity': t,
                        '@LabelIsIdentity': true,
                        Icon: {
                            IconStyle: {
                                '@Type': nodeIcons
                            }
                        }
                    }
                }
            });
        } else {
            // link
            var id1 = item.id1,
                id2 = item.id2,
                a1 = item.a1,
                a2 = item.a2;

            var _description = resolveDescription ? resolveDescription(item) : '' + retrieveProps(itemData).join(', ');
            var arrowStyle = 'ArrowNone';
            if (a1 || a2) {
                if (a1 && a2) {
                    arrowStyle = 'ArrowOnBoth';
                } else if (a1) {
                    arrowStyle = 'ArrowOnTail';
                } else {
                    arrowStyle = 'ArrowOnHead';
                }
            }
            i2Items.push({
                '@Label': t,
                '@Description': _description,
                Link: {
                    '@End1Id': id1,
                    '@End2Id': id2,
                    LinkStyle: {
                        '@ArrowStyle': arrowStyle
                    }
                }
            });
        }
    });

    var chart = {
        Chart: {
            ChartItemCollection: {
                ChartItem: i2Items
            }
        }
    };
    log.info('result', chart);
    var xml = _xmlbuilder2.default.create(chart).end({ pretty: true });
    return xml;
};

var _xmlbuilder = require('xmlbuilder');

var _xmlbuilder2 = _interopRequireDefault(_xmlbuilder);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var log = require('loglevel').getLogger('react-la/utils/i2-exporter');

function retrieveProps(item) {
    if (item == null) {
        return [];
    } else if (_lodash2.default.isArray(item) || _lodash2.default.isObject(item)) {
        return _lodash2.default.reduce(item, function (acc, v) {
            return [].concat(_toConsumableArray(acc), _toConsumableArray(retrieveProps(v)));
        }, []);
    } else {
        return [item];
    }
}