'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.generateGraph = generateGraph;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var log = require('loglevel').getLogger('vbda/la/plugin-source');

function getNodeLabel(_ref, labels) {
    var id = _ref.id,
        _ref$d = _ref.d,
        nodeTypes = _ref$d.names,
        nodeLabelIds = _ref$d.labels;

    if (nodeLabelIds && nodeLabelIds.length > 0) {
        return _lodash2.default.map(nodeLabelIds, function (nodeLabelId) {
            var label = labels[nodeLabelId];
            if (!label.type) {
                // no label
                return '';
            }
            if (label.localId.indexOf('@@') === 0) {
                // label but no unique id
                return label.type;
            }
            return label.localId + ' (' + label.typeReadable + ')';
        }).join(', ');
    }
    return ''; //`${nodeTypes.join(',')} ${id}`
}

function visualizeGraphItem(cfgs, labels, labelsCfg, item) {
    var _item = item,
        id = _item.id,
        type = _item.type,
        id1 = _item.id1,
        id2 = _item.id2,
        a1 = _item.a1,
        a2 = _item.a2,
        d = _objectWithoutProperties(_item, ['id', 'type', 'id1', 'id2', 'a1', 'a2']);

    if (type === 'node') {
        item = { id: id, type: type, d: d };
    } else {
        item = { id: id, type: type, id1: id1, id2: id2, a1: a1, a2: a2, d: d };
    }

    // prepend cfgs with base cfg
    if (item.type === 'node') {
        cfgs = [{
            c: function c(item) {
                if (!getNodeLabel(item, labels)) {
                    return '#aaaaaa';
                }
            },
            u: function u(item) {
                var labelTypes = _lodash2.default.map(_lodash2.default.pick(labels, item.d.labels), 'type');
                if (!_lodash2.default.isEmpty(labelTypes)) {
                    var labelType = _lodash2.default.first(labelTypes);
                    if (labelType) {
                        return labelsCfg[labelType].icon_url;
                    }
                }
            },
            t: function t(item) {
                return getNodeLabel(item, labels);
            }
        }].concat(_toConsumableArray(cfgs));
    } else {
        cfgs = [{
            dt: function dt(_ref2) {
                var ts = _ref2.d.ts;
                return _lodash2.default.map(ts, function (t) {
                    return (0, _moment2.default)(t).valueOf();
                });
            }
        }].concat(_toConsumableArray(cfgs));
    }

    // get props as render source

    var _item$d = item.d,
        props = _item$d.props,
        propsHistory = _item$d.propsHistory,
        labelIds = _item$d.labels,
        metadata = _objectWithoutProperties(_item$d, ['props', 'propsHistory', 'labels']);

    if (!props && propsHistory) {
        props = _lodash2.default.last(propsHistory).props;
    }
    props = _lodash2.default.merge.apply(_lodash2.default, [{}, metadata, props].concat(_toConsumableArray(_lodash2.default.map(_lodash2.default.pick(labels, labelIds), 'props'))));

    // generate all visualization props for all cfgs
    var allVis = _lodash2.default.map(cfgs, function (cfg) {
        return _lodash2.default.reduce(cfg, function (acc, v, k) {
            var newKey = k;
            var newVal = v;
            if (_lodash2.default.endsWith(k, 'Template')) {
                newKey = _lodash2.default.replace(k, /Template$/, '');
                newVal = _lodash2.default.template(v)(props);
            } else if (_lodash2.default.endsWith(k, 'Key')) {
                newKey = _lodash2.default.replace(k, /Key$/, '');
                newVal = _lodash2.default.get(props, v);
            } else if (_lodash2.default.isFunction(v)) {
                newVal = v(item, labels);
            }

            return _extends({}, acc, _defineProperty({}, newKey, newVal));
        }, {});
    });

    var finalVis = _lodash2.default.merge.apply(_lodash2.default, [{}].concat(_toConsumableArray(allVis)));

    return _extends({}, item, finalVis);
}

function generateGraph(nodes, links, _ref3, labels) {
    var laCfg = _ref3.la,
        labelsCfg = _ref3.labels;

    return _lodash2.default.map([].concat(_toConsumableArray(_lodash2.default.values(nodes)), _toConsumableArray(_lodash2.default.values(links))), function (item) {
        var matchedProfiles = _lodash2.default.filter(laCfg, function (_ref4) {
            var type = _ref4.type,
                match = _ref4.match;

            if (type && item.type !== type) {
                return false;
            }
            return _lodash2.default.every(match, function (v, k) {
                if (type === 'node' && k === 'labels') {
                    var nodeLabels = item.labels;

                    var labelsToCheck = v;
                    return _lodash2.default.some(nodeLabels, function (l) {
                        return _lodash2.default.includes(labelsToCheck, labels[l].type);
                    });
                } else if (type === 'link' && k === 'type') {
                    var linkTypes = item.types;

                    return _lodash2.default.includes(linkTypes, v);
                } else {
                    return _lodash2.default.get(item, k) == v;
                }
            });
        });

        return visualizeGraphItem(_lodash2.default.map(matchedProfiles, 'render'), labels, labelsCfg, item);
    });
}

function matchIds(a, b, fullCoverage) {
    var jointCount = _lodash2.default.intersection(a, b).length;
    if (fullCoverage) {
        return jointCount === b.length;
    }
    return jointCount > 0;
}

function bind(la) {
    var _source = {};
    var nodes = {};
    var links = {};
    var events = {};
    var labels = {};
    var items = [];

    la.getItems = function () {
        return items;
    };

    la.getSource = function () {
        return {
            nodes: nodes,
            links: links,
            labels: labels,
            events: events
        };
    };

    la.setSource = function (source) {
        var merge = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (!merge) {
            nodes = {};
            links = {};
            labels = {};
            events = {};
        }
        var newNodes = source.nodes,
            newLinks = source.links,
            newEvents = source.events,
            newLabels = source.labels;

        nodes = _extends({}, nodes, newNodes);
        links = _extends({}, links, newLinks);
        events = _extends({}, events, newEvents);
        labels = _extends({}, labels, newLabels);
    };

    la.loadFromSource = function (_ref5, onDone) {
        var cfg = _ref5.cfg,
            selectedLabels = _ref5.selectedLabels;

        var nodesToShow = _lodash2.default.pickBy(nodes, function (item) {
            return matchIds(_lodash2.default.map(item.labels, function (i) {
                return i + '';
            }), selectedLabels);
        });
        var linksToShow = _lodash2.default.pickBy(links, function (item) {
            return nodesToShow[item.id1] && nodesToShow[item.id2];
        });

        items = generateGraph(nodesToShow, linksToShow, cfg, labels);

        la.load({ type: 'LinkChart', items: items }, onDone);
    };

    la.mergeFromSource = function (_ref6, onDone) {
        var cfg = _ref6.cfg;

        items = generateGraph(nodes, links, cfg, labels);

        log.info('mergeSource:items after', items);
        la.merge(items, onDone);
    };

    la.filterSource = function (labelFilter, dtFilter) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var onDone = arguments[3];

        var showMissingLabels = options.showMissingLabels,
            chartOptions = _objectWithoutProperties(options, ['showMissingLabels']);

        var idsToShow = _lodash2.default.isArray(labelFilter) ? labelFilter : _lodash2.default.reduce(labels, function (acc, item, id) {
            if (labelFilter(item.props)) {
                return [].concat(_toConsumableArray(acc), [id]);
            }
            return acc;
        }, []);

        // deal with number<-->string type mismatch
        // TODO: handle it more gracefully
        la.filter(function (_ref7) {
            var d = _ref7.d;

            if ((!d.labels || d.labels.length <= 0) && showMissingLabels) {
                return true;
            }
            return matchIds(_lodash2.default.map(d.labels, function (i) {
                return i + '';
            }), idsToShow);
        }, _extends({ type: 'node' }, chartOptions), onDone);
    };

    la.filterEvent = function (filter) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var onDone = arguments[2];

        var idsToShow = _lodash2.default.reduce(events, function (acc, item, id) {
            if (filter(item)) {
                return [].concat(_toConsumableArray(acc), [id]);
            }
            return acc;
        }, []);

        // deal with number<-->string type mismatch
        // TODO: handle it more gracefully
        la.filter(function (_ref8) {
            var d = _ref8.d;
            return matchIds(_lodash2.default.map(d.events, function (i) {
                return i + '';
            }), idsToShow);
        }, options, onDone);
    };

    la.filterLabel = function (filter) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var onDone = arguments[2];

        var showMissingLabels = options.showMissingLabels,
            chartOptions = _objectWithoutProperties(options, ['showMissingLabels']);

        var idsToShow = _lodash2.default.isArray(filter) ? filter : _lodash2.default.reduce(labels, function (acc, item, id) {
            if (filter(item.props)) {
                return [].concat(_toConsumableArray(acc), [id]);
            }
            return acc;
        }, []);

        // deal with number<-->string type mismatch
        // TODO: handle it more gracefully
        la.filter(function (_ref9) {
            var d = _ref9.d;

            if ((!d.labels || d.labels.length <= 0) && showMissingLabels) {
                return true;
            }
            return matchIds(_lodash2.default.map(d.labels, function (i) {
                return i + '';
            }), idsToShow);
        }, _extends({ type: 'node' }, chartOptions), onDone);
    };

    la.getItemForSource = function () {};

    la.getSourceForItem = function (ids) {
        if (!_lodash2.default.isArray(ids)) {
            ids = [ids];
        }

        var selected = la.getItem(ids);
        var result = (0, _lodash2.default)(selected).map('d').reduce(function (acc, d) {
            return {
                events: d.events ? _lodash2.default.uniq([].concat(_toConsumableArray(acc.events), _toConsumableArray(d.events))) : acc.events,
                labels: d.labels ? _lodash2.default.uniq([].concat(_toConsumableArray(acc.labels), _toConsumableArray(d.labels))) : acc.labels
            };
        }, { events: [], labels: [] });

        return result;
    };

    la.hideSource = function (ids) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var onDone = arguments[2];

        if (!_lodash2.default.isArray(ids)) {
            ids = [ids];
        }
        var itemsToHide = [];
        la.each({}, function (_ref10) {
            var d = _ref10.d,
                id = _ref10.id;

            if (matchIds(d, ids)) {
                itemsToHide.push(id);
            }
        });

        la.hide(itemsToHide, options, onDone);
    };

    la.showSource = function (ids) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var onDone = arguments[2];

        if (!_lodash2.default.isArray(ids)) {
            ids = [ids];
        }
        var itemsToShow = [];
        la.each({}, function (_ref11) {
            var d = _ref11.d,
                id = _ref11.id;

            if (matchIds(d, ids)) {
                itemsToShow.push(id);
            }
        });

        la.show(itemsToShow, options, onDone);
    };

    la.removeSource = function (ids) {
        if (!_lodash2.default.isArray(ids)) {
            ids = [ids];
        }
        var itemsToRemove = [];
        la.each({}, function (item) {
            var d = item.d,
                id = item.id;

            if (matchIds(ids, d, true)) {
                itemsToRemove.push(id);
            }
        });

        _source = _lodash2.default.omit(_source, ids);
        la.removeItem(itemsToRemove);
    };

    la.serializeWithSource = function () {
        var graph = la.serialize();
        return {
            events: events,
            labels: labels,
            graph: graph
        };
    };
}

exports.default = bind;