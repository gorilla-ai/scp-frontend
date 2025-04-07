'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (_ref, eventsCfg) {
    var nodes = _ref.nodes,
        labels = _ref.labels;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    log.info({ nodes: nodes, labels: labels }, eventsCfg);
    var labelOthers = options.labelOthers;
    var labelsCfg = eventsCfg.labels;

    var result = '';
    /*const groups = _.groupBy(labels, 'type')
    _.forEach(groups, (group, labelType)=>{
        const section = []
        const {display_name:labelName, properties:labelProps} = labelsCfg[labelType] || {display_name:'others', properties:{}}
        const columns = _.map(labelProps, (labelProp, labelPropKey)=>{
            return _.get(labelProp, 'display_name', labelPropKey)
        })
        const header = 'Type,'+columns.join(',')
        const content = _.map(group, label=>{
            return labelName+','+_.map(columns, column=>{
                let str = _.get(label.propsReadable, column, '')
                if (str !== '') {
                    str = `"${_.replace(str, /"/g, '""')}"`
                }
                return str
            }).join(',')
        }).join('\n')
        result += header+'\n'
        result += content+'\n\n'
    })
    */

    var groups = _.groupBy(nodes, function (node) {
        return _(labels).pick(node.labels).map('type').join(',');
    });
    _.forEach(groups, function (group, groupType) {
        var nodeColumns = _.reduce(group, function (acc, node) {
            return [].concat(_toConsumableArray(acc), _toConsumableArray(_.keys(node.propsReadable)));
        }, []);
        var labelTypes = groupType.split(',');
        var labelColumns = _.reduce(labelTypes, function (acc, labelType) {
            var _ref2 = labelsCfg[labelType] || {},
                _ref2$properties = _ref2.properties,
                labelProps = _ref2$properties === undefined ? {} : _ref2$properties;

            _.forEach(labelProps, function (labelProp, labelPropKey) {
                acc = [].concat(_toConsumableArray(acc), [_.get(labelProp, 'display_name', labelPropKey)]);
            });
            return _.uniq(acc);
        }, []);
        var columns = _.uniq([].concat(_toConsumableArray(labelColumns), _toConsumableArray(nodeColumns)));

        var header = ',' + columns.join(',');
        var content = _.map(group, function (node) {
            var labelProps = _.reduce(node.labels, function (acc, label) {
                return _extends({}, acc, labels[label].propsReadable);
            }, {});
            var labelNames = _.reduce(node.labels, function (acc, label) {
                return [].concat(_toConsumableArray(acc), [labels[label].typeReadable || labelOthers]);
            }, []).join(',');
            var allProps = _extends({}, node.propsReadable, labelProps);
            return '"' + labelNames + '",' + _.map(columns, function (column) {
                var str = _.get(allProps, column, '');
                if (str !== '') {
                    str = '"' + _.replace(str, /"/g, '""') + '"';
                }
                return str;
            }).join(',');
        }).join('\n');
        result += header + '\n';
        result += content + '\n\n';
    });

    return result;
    /*_.forEach(items, (item) => {
        const {type:itemType, id:itemId, hi:hidden, d:itemData, t='', c} = item
         if (hidden) {
            return
        }
         if (itemType === 'node') {
            const {labels:labelIds, props:nodeProps} = itemData
            const nodeLabels = _.pick(labels, labelIds)
            const labelsProps = _(nodeLabels).values().map('props').reduce((acc,props)=>({...acc, ...props}),{})
            const description = `${_.values({...labelsProps, ...nodeProps}).join(', ')}`
            const nodeIcons = _(nodeLabels).values().map('type').value().join(',')//labelIconMapping[type] || type
             i2Items.push({
                '@Label': t,
                '@Description': description,
                End:{
                    Entity: {
                        '@EntityId': itemId,
                        '@Identity': t,
                        '@LabelIsIdentity': true,
                        Icon: {
                            IconStyle: {
                                '@Type':nodeIcons
                            }
                        }
                    }
                }
            })
        }
        else {
            // link
            const {id1, id2, a1, a2} = item
            const {propsHistory} = itemData
             const description = `${_.values(_.last(propsHistory).props).join(', ')}`
            let arrowStyle = 'ArrowNone'
            if (a1 || a2) {
                if (a1 && a2) {
                    arrowStyle = 'ArrowOnBoth'
                }
                else if (a1) {
                    arrowStyle = 'ArrowOnTail'
                }
                else {
                    arrowStyle = 'ArrowOnHead'
                }
            }
            i2Items.push({
                '@Label': t,
                '@Description': description,
                Link:{
                    '@End1Id':id1,
                    '@End2Id':id2,
                    LinkStyle: {
                        '@ArrowStyle': arrowStyle
                    }
                }
            })
        }
    })
     const chart = {
        Chart: {
            ChartItemCollection: {
                ChartItem: i2Items
            }
        }
    }
    log.info(chart)
    const xml = builder.create(chart).end({ pretty: true })
    //log.info(xml)
    return xml*/
};

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var log = require('loglevel').getLogger('vbda/exporter/labels');