'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (items, _ref) {
    var nodes = _ref.nodes,
        links = _ref.links,
        labels = _ref.labels;

    log.info(items, { nodes: nodes, links: links, labels: labels });
    var i2Items = [];
    _.forEach(items, function (item) {
        var itemType = item.type,
            itemId = item.id,
            hidden = item.hi,
            itemData = item.d,
            _item$t = item.t,
            t = _item$t === undefined ? '' : _item$t,
            c = item.c;


        if (hidden) {
            return;
        }

        if (itemType === 'node') {
            var labelIds = itemData.labels,
                nodeProps = itemData.props;

            var nodeLabels = _.pick(labels, labelIds);
            var labelsProps = _(nodeLabels).values().map('props').reduce(function (acc, props) {
                return _extends({}, acc, props);
            }, {});
            var description = '' + _.values(_extends({}, labelsProps, nodeProps)).join(', ');
            var nodeIcons = _(nodeLabels).values().map('type').value().join(','); //labelIconMapping[type] || type

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
            var propsHistory = itemData.propsHistory;


            var _description = '' + _.values(_.last(propsHistory).props).join(', ');
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
    log.info(chart);
    var xml = _xmlbuilder2.default.create(chart).end({ pretty: true });
    //log.info(xml)
    return xml;
};

var _xmlbuilder = require('xmlbuilder');

var _xmlbuilder2 = _interopRequireDefault(_xmlbuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = require('loglevel').getLogger('vbda/exporter/i2');

var labelIconMapping = {
    'bac': '',
    'ivarImage': '',
    'line': '',
    'facebook': '',
    'wechat': '',
    'fr': '',
    'mailer': '',
    'ivar': '',
    'lpr': '',
    'call': '',
    'testLogstash2': '',
    'phone': '',
    'facebook_page': '',
    'car': '',
    'person': '',
    'testLogstash': '',
    'etag': '',
    'connection': '',
    'facebook_info': '',
    'email': '',
    'case': '',
    'iod': ''
};