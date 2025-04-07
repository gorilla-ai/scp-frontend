'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.analyze = analyze;
exports.analyzeTrack = analyzeTrack;
exports.analyzeLabels = analyzeLabels;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var log = require('loglevel').getLogger('vbda/analyzer');

function resolveProps(props) {
    return _lodash2.default.merge.apply(_lodash2.default, [{}].concat(_toConsumableArray(props))).props;
}

function parseGeo(locationCfg, event, base) {
    var geoType = locationCfg.type;
    var latitude = void 0,
        longitude = void 0;
    if (geoType === 'geo_point') {
        latitude = Number(getPropFromRef(event, locationCfg.latitude, base));
        longitude = Number(getPropFromRef(event, locationCfg.longitude, base));
    } else if (geoType === 'geo_address' || geoType === 'geo_point_raw') {
        var coordinate = getPropFromRef(event, locationCfg.coordinate, base);
        if (coordinate && coordinate.indexOf(',') > 0) {
            var _coordinate$split = coordinate.split(','),
                _coordinate$split2 = _slicedToArray(_coordinate$split, 2),
                c1 = _coordinate$split2[0],
                c2 = _coordinate$split2[1];

            if (Number(_lodash2.default.trim(c1)) + '' === _lodash2.default.trim(c1)) {
                latitude = Number(c1);
            }
            if (Number(_lodash2.default.trim(c2)) + '' === _lodash2.default.trim(c2)) {
                longitude = Number(c2);
            }
        }
    }

    if (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude)) {
        return null;
    }
    if (latitude === 0 && longitude === 0 || latitude === 1 && longitude === 1) {
        return null;
    }

    return {
        latitude: latitude,
        longitude: longitude
    };
}

function getPropsFromCfg(cfg, event, base) {
    log.debug('getPropsFromCfg::start', { event: event, cfg: cfg, base: base });
    var result = _lodash2.default.reduce(cfg, function (acc, p, name) {
        var val = void 0;
        if (p.reference) {
            val = getPropFromRef(event, p.reference, base);
        }
        if (val == null) {
            val = p.value;
        }
        if (val === '' || val == null) {
            return acc;
        }
        return _extends({}, acc, _defineProperty({}, name, val));
    }, {});
    log.debug('getPropsFromCfg::end', result);
    return result;
}

function getPropFromRef(originalEvent, ref, base) {
    var isFile = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    var event = originalEvent;
    if (base && base.ref && base.ref.length > 0 && ref.join('.').indexOf(base.ref.join('.')) === 0) {
        event = _lodash2.default.get(originalEvent, base.path);
        ref = _lodash2.default.slice(ref, base.ref.length);
    }

    var paths = getEventPropPaths(event, ref);
    var result = (0, _lodash2.default)(paths).map(function (path) {
        return _lodash2.default.get(event, path);
    }).filter(function (item) {
        return item != null && item !== '';
    }).value();

    if (result.length <= 0) {
        result = null;
    } else {
        if (isFile) {
            result = _lodash2.default.reduce(result, function (acc, item) {
                if (_lodash2.default.isEmpty(item)) {
                    return acc;
                }

                var uuids = _lodash2.default.isArray(item) ? item : [item];
                var filePaths = (0, _lodash2.default)(uuids).map(function (uuid) {
                    return _lodash2.default.get(_lodash2.default.find(originalEvent.__fileInfo, { uuid: uuid }), 'fileServerPath');
                }).compact().value();
                return [].concat(_toConsumableArray(acc), _toConsumableArray(filePaths));
            }, []);
        }

        if (result.length === 1) {
            result = result[0];
        }
    }

    return result;
}

function getEventPropPaths(event, segments) {
    var workingPath = [];
    var explodeBasePath = [];
    var explodedRelPaths = [];
    _lodash2.default.forEach(segments, function (segment) {
        workingPath = [].concat(_toConsumableArray(workingPath), [segment]);
        explodeBasePath = [].concat(_toConsumableArray(explodeBasePath), [segment]);
        var subEvent = _lodash2.default.get(event, workingPath);
        if (_lodash2.default.isArray(subEvent)) {
            explodedRelPaths.push(_lodash2.default.map(_lodash2.default.range(subEvent.length), function (index) {
                return [].concat(_toConsumableArray(explodeBasePath), [index]);
            }));
            explodeBasePath = [];
        }
    });
    if (explodeBasePath.length > 0) {
        explodedRelPaths.push([explodeBasePath]);
    }

    var explodedPaths = _lodash2.default.reduce(explodedRelPaths, function (a, b) {
        return _lodash2.default.flatten(_lodash2.default.map(a, function (x) {
            return _lodash2.default.map(b, function (y) {
                return _lodash2.default.flatten(x.concat([y]));
            });
        }), false);
    }, [[]]);

    return explodedPaths;
}

function getBaseRef(event, nodeCfg, labelsCfg) {
    // find the first label having unique property, this property will decide how to split the nodes
    var propsCfg = nodeCfg.properties,
        nodeLabelsCfg = nodeCfg.labels;

    var ref = null;

    _lodash2.default.some(nodeLabelsCfg, function (cfg) {
        var label_name = cfg.label_name,
            conditions = cfg.conditions,
            properties = cfg.properties;

        var globalLabelCfg = labelsCfg[label_name];

        if (!globalLabelCfg) {
            return false;
        }

        var uniqueProp = properties[globalLabelCfg.unique_property];

        if (!uniqueProp) {
            return false;
        }

        var uniquePropVal = getPropFromRef(event, uniqueProp.reference);
        if (uniquePropVal == null) {
            return false;
        }
        /*
                if (conditions) {
                    const eventHasLabel = _.every(conditions, c=>{
                        const res = getPropFromRef(event, c.reference)
                        log.info('condition xxxxxxxxxx', res, c.value)
                        return res === c.value
                    })
        
                    if (!eventHasLabel) {
                        return false
                    }
                }*/

        ref = _lodash2.default.initial(uniqueProp.reference);
        return true;
    });

    return ref;
}

function explodeNodeCfgs(event, nodeSetCfg, labelsCfg) {
    log.debug('explodeNodeCfgs::start', event, nodeSetCfg);
    var segments = getBaseRef(event, nodeSetCfg, labelsCfg);

    var explodedPaths = getEventPropPaths(event, segments);

    log.debug('explodeNodeCfgs::explodedPaths', explodedPaths);

    var explodedNodeCfgs = _lodash2.default.map(explodedPaths, function (p) {
        return _extends({
            base: {
                ref: segments,
                path: p
            }
        }, nodeSetCfg);
    });
    log.debug('explodeNodeCfgs::end', explodedNodeCfgs);
    return explodedNodeCfgs;
}

// base is mutable (if supplied)
function analyze(source, _ref) {
    var dtCfg = _ref.dt,
        labelsCfg = _ref.labels;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    log.debug('analyze::start', { source: source, dtCfg: dtCfg, labelsCfg: labelsCfg, options: options });
    var _options$base = options.base,
        base = _options$base === undefined ? {} : _options$base,
        _options$tags = options.tags,
        tags = _options$tags === undefined ? [] : _options$tags,
        _options$analyzeGis = options.analyzeGis,
        analyzeGis = _options$analyzeGis === undefined ? true : _options$analyzeGis,
        _options$analyzeLinks = options.analyzeLinks,
        analyzeLinks = _options$analyzeLinks === undefined ? true : _options$analyzeLinks,
        _options$propsResolve = options.propsResolver,
        propsResolver = _options$propsResolve === undefined ? {} : _options$propsResolve,
        _options$ignoreSingle = options.ignoreSingletonNodes,
        ignoreSingletonNodes = _options$ignoreSingle === undefined ? false : _options$ignoreSingle,
        _options$labelIds = options.labelIds,
        labelIdsToAnalyze = _options$labelIds === undefined ? undefined : _options$labelIds,
        _options$labelTypes = options.labelTypes,
        labelTypesToAnalyze = _options$labelTypes === undefined ? undefined : _options$labelTypes,
        _options$locationType = options.locationTypes,
        locationTypesToAnalyze = _options$locationType === undefined ? undefined : _options$locationType,
        _options$imagePrefix = options.imagePrefix,
        imagePrefix = _options$imagePrefix === undefined ? '' : _options$imagePrefix;


    if (!_lodash2.default.isEmpty(labelTypesToAnalyze)) {
        labelsCfg = _lodash2.default.pick(labelsCfg, labelTypesToAnalyze);
    }

    var _base$nodes = base.nodes,
        nodes = _base$nodes === undefined ? {} : _base$nodes,
        _base$links = base.links,
        links = _base$links === undefined ? {} : _base$links,
        _base$labels = base.labels,
        labels = _base$labels === undefined ? {} : _base$labels;


    var nodesPropsHistory = {};
    var labelsPropsHistory = {};

    _lodash2.default.forEach(source, function (event, eid) {
        var dtId = event.__data_type,
            dsId = event.__data_source;


        if (!dtCfg[dtId]) {
            log.warn('analyze::analysis of event ' + eid + ' skipped, data type ' + dtId + ' not configured');
            return;
        }
        if (dtCfg[dtId].ds !== dsId) {
            log.error('analyze::analysis of event ' + eid + ' skipped, event data source ' + dsId + ' does not match with data source ' + dtCfg[dtId].ds + ' for data type ' + dtId + ' in config');
            return;
        }

        var _dtCfg$dtId = dtCfg[dtId],
            nodeSetsCfg = _dtCfg$dtId.nodes,
            linksCfg = _dtCfg$dtId.relationships,
            tsCfg = _dtCfg$dtId.representative_time,
            locationsCfg = _dtCfg$dtId.geo;


        if (!_lodash2.default.isEmpty(locationTypesToAnalyze)) {
            locationsCfg = _lodash2.default.pick(locationsCfg, locationTypesToAnalyze);
        }

        var nodeTs = _lodash2.default.get(event, tsCfg);

        var nodeNameToIds = {};

        //log.debug('analyze::analyze node::start')
        _lodash2.default.forEach(nodeSetsCfg, function (nodeSetCfg, nodeName) {
            var description = nodeSetCfg.description;


            var nodesCfg = explodeNodeCfgs(event, nodeSetCfg, labelsCfg);
            var nodeIds = [];

            _lodash2.default.forEach(nodesCfg, function (nodeCfg) {
                var base = nodeCfg.base,
                    nodePropsCfg = nodeCfg.properties,
                    nodeLabelsCfg = nodeCfg.labels,
                    nodeLocationsCfg = nodeCfg.locations,
                    nodeTrackCfg = nodeCfg.track,
                    nodeImagesCfg = nodeCfg.images;


                var nProps = getPropsFromCfg(nodePropsCfg, event, base);
                var nPropsReadable = _lodash2.default.mapKeys(nProps, function (v, k) {
                    return nodePropsCfg[k].display_name || k;
                });

                var lProps = {};
                var lPropsReadable = {};

                var labelIds = _lodash2.default.uniq(_lodash2.default.reduce(nodeLabelsCfg, function (acc, labelCfg) {
                    var label_name = labelCfg.label_name,
                        conditions = labelCfg.conditions,
                        labelPropsCfg = labelCfg.properties;


                    var globalLabelCfg = labelsCfg[label_name];

                    if (!globalLabelCfg) {
                        return acc;
                    }

                    if (!conditions || _lodash2.default.every(conditions, function (c) {
                        return getPropFromRef(event, c.reference, base) == c.value;
                    })) {
                        // generate label props
                        var labelProps = getPropsFromCfg(labelPropsCfg, event, base);

                        if (_lodash2.default.isEmpty(labelProps)) {
                            return acc;
                        }

                        var labelId = label_name + '__' + _lodash2.default.get(labelProps, globalLabelCfg.unique_property, '@@' + _lodash2.default.size(nodes));

                        if (!_lodash2.default.isEmpty(labelIdsToAnalyze) && !_lodash2.default.includes(labelIdsToAnalyze, labelId)) {
                            return acc;
                        }

                        var labelPropsReadable = _lodash2.default.mapKeys(labelProps, function (v, k) {
                            return _lodash2.default.get(globalLabelCfg, ['properties', k, 'display_name'], k);
                        });

                        lProps[labelId] = labelProps;
                        lPropsReadable[labelId] = labelPropsReadable;

                        return [].concat(_toConsumableArray(acc), [labelId]);
                    }
                    return acc;
                }, []));

                // retrieve all images as single layer array
                var images = _lodash2.default.isEmpty(nodeImagesCfg) ? [] : (0, _lodash2.default)(nodeImagesCfg).reduce(function (acc, imageCfg) {
                    var retrievedImages = getPropFromRef(event, imageCfg, base, true);
                    if (_lodash2.default.isEmpty(retrievedImages)) {
                        return acc;
                    }
                    if (_lodash2.default.isArray(retrievedImages)) {
                        return [].concat(_toConsumableArray(acc), _toConsumableArray(_lodash2.default.map(retrievedImages, function (img) {
                            return imagePrefix + '/' + img;
                        })));
                    }
                    return [].concat(_toConsumableArray(acc), [imagePrefix + '/' + retrievedImages]);
                }, []);

                // do not create node if no node props or label props
                if (_lodash2.default.isEmpty(nProps) && _lodash2.default.isEmpty(lProps) && _lodash2.default.isEmpty(images)) {
                    log.debug('analyze::missing props: no node created', { event: event, nodeSetsCfg: nodeSetsCfg, nodeCfg: nodeCfg });
                    return;
                }

                if (_lodash2.default.isEmpty(labelIds)) {
                    if (ignoreSingletonNodes) {
                        log.warn('analyze::no labels: no node created', { event: event, nodeSetsCfg: nodeSetsCfg, nodeCfg: nodeCfg });
                        return;
                    }
                    labelIds = ['__' + _lodash2.default.size(nodes)];
                }

                var locations = null;
                var track = null;
                if (analyzeGis) {
                    // process node locations
                    locations = _lodash2.default.isEmpty(nodeLocationsCfg) ? null : _lodash2.default.reduce(nodeLocationsCfg, function (acc, key) {
                        var locationCfg = locationsCfg[key];

                        if (!locationCfg) {
                            return acc;
                        }

                        var latlng = parseGeo(locationCfg, event, base);

                        if (!latlng) {
                            return acc;
                        }

                        return [].concat(_toConsumableArray(acc), [_extends({
                            type: key
                        }, latlng)]);
                    }, []);

                    // process node track
                    if (!_lodash2.default.isEmpty(nodeTrackCfg)) {
                        var locationCfg = locationsCfg[nodeTrackCfg.location];
                        if (locationCfg) {
                            var latlng = parseGeo(locationCfg, event, base);
                            if (latlng) {
                                track = {
                                    datetime: getPropFromRef(event, nodeTrackCfg.datetime, base),
                                    location: latlng
                                };
                            }
                        }
                    }
                }

                var nodeId = null;

                // find node id from an existing label (if exists)
                _lodash2.default.some(labelIds, function (labelId) {
                    var existingLabel = labels[labelId];
                    if (existingLabel && existingLabel.nodeId) {
                        nodeId = existingLabel.nodeId;
                        return true;
                    }
                    return false;
                });

                if (!nodeId) {
                    nodeId = _lodash2.default.size(nodes) + '';
                    log.debug('analyze::create new node', nodeId);
                    nodes[nodeId] = {
                        type: 'node',
                        id: nodeId,
                        names: [],
                        labels: [],
                        events: [],
                        tags: []
                    };
                }

                if (!nodesPropsHistory[nodeId]) {
                    nodesPropsHistory[nodeId] = [];
                }

                var nodeToUpdate = nodes[nodeId];
                _lodash2.default.assign(nodeToUpdate, {
                    names: _lodash2.default.uniq([].concat(_toConsumableArray(nodeToUpdate.names), [nodeName])),
                    images: images,
                    locations: locations,
                    track: track,
                    labels: _lodash2.default.uniq([].concat(_toConsumableArray(nodeToUpdate.labels), _toConsumableArray(labelIds))),
                    events: _lodash2.default.uniq([].concat(_toConsumableArray(nodeToUpdate.events), [eid])),
                    tags: _lodash2.default.uniq([].concat(_toConsumableArray(nodeToUpdate.tags), _toConsumableArray(tags)))
                });

                nodesPropsHistory[nodeId].push({
                    nodeName: nodeName,
                    dt: dtId,
                    event: eid,
                    ts: nodeTs,
                    props: nProps,
                    propsReadable: nPropsReadable
                });

                // update labels
                _lodash2.default.forEach(labelIds, function (labelId) {
                    var _labelId$split = labelId.split('__'),
                        _labelId$split2 = _toArray(_labelId$split),
                        labelType = _labelId$split2[0],
                        localId = _labelId$split2.slice(1);

                    if (!labels[labelId]) {
                        labels[labelId] = {
                            id: labelId,
                            type: labelType,
                            typeReadable: labelType ? labelsCfg[labelType].display_name || labelType : '',
                            localId: localId.join('__'),
                            tags: []
                        };
                    }

                    if (!labelsPropsHistory[labelId]) {
                        labelsPropsHistory[labelId] = [];
                    }

                    labels[labelId].nodeId = nodeId;
                    labels[labelId].tags = _lodash2.default.uniq([].concat(_toConsumableArray(labels[labelId].tags), _toConsumableArray(tags)));
                    labelsPropsHistory[labelId].push({
                        nodeName: nodeName,
                        dt: dtId,
                        event: eid,
                        label: labelId,
                        ts: nodeTs,
                        props: lProps[labelId],
                        propsReadable: lPropsReadable[labelId]
                    });
                });

                nodeIds.push(nodeId);
            });

            nodeNameToIds[nodeName] = nodeIds;
        });

        if (analyzeLinks) {
            //log.debug('analyze::analyze link::start')

            _lodash2.default.forEach(linksCfg, function (linkCfg, linkName) {
                var description = linkCfg.description,
                    conditions = linkCfg.conditions,
                    node_a = linkCfg.node_a,
                    node_b = linkCfg.node_b,
                    directionsCfg = linkCfg.directions,
                    type = linkCfg.type,
                    display_name = linkCfg.display_name,
                    properties = linkCfg.properties,
                    representative_time = linkCfg.representative_time;


                var linkTs = _lodash2.default.get(event, representative_time);

                if (!conditions || _lodash2.default.every(conditions, function (c) {
                    return _lodash2.default.get(event, c.reference) == c.value;
                })) {
                    var id1s = nodeNameToIds[node_a];
                    var id2s = nodeNameToIds[node_b];

                    _lodash2.default.forEach(id1s, function (id1) {
                        _lodash2.default.forEach(id2s, function (id2) {
                            var sortedNodeIds = [id1, id2].sort();

                            var linkId = sortedNodeIds[0] + '-' + sortedNodeIds[1] + '-' + type;
                            var rProps = getPropsFromCfg(properties, event);
                            var rPropsReadable = _lodash2.default.mapKeys(rProps, function (v, k) {
                                return properties[k].display_name || k;
                            });
                            var linkProp = {
                                event: eid,
                                ts: linkTs,
                                a1: false,
                                a2: false,
                                type: type,
                                typeReadable: display_name || type,
                                props: rProps,
                                propsReadable: rPropsReadable
                            };

                            if (!links[linkId]) {
                                links[linkId] = {
                                    type: 'link',
                                    id: linkId,
                                    id1: id1,
                                    id2: id2,
                                    a1: false,
                                    a2: false,
                                    types: [],
                                    events: [],
                                    ts: [],
                                    propsHistory: [],
                                    tags: []
                                };
                            }

                            var linkToUpdate = links[linkId];

                            var directions = _lodash2.default.uniq(_lodash2.default.reduce(directionsCfg, function (acc, directionCfg) {
                                var dirConditions = directionCfg.conditions,
                                    dirValue = directionCfg.value;

                                if (!dirConditions || _lodash2.default.every(dirConditions, function (c) {
                                    return _lodash2.default.get(event, c.reference) == c.value;
                                })) {
                                    return [].concat(_toConsumableArray(acc), [dirValue]);
                                }
                                return acc;
                            }, []));

                            if (_lodash2.default.includes(directions, 3) || _lodash2.default.includes(directions, 1)) {
                                linkProp.a2 = true;
                                linkToUpdate.a2 = true;
                            }
                            if (_lodash2.default.includes(directions, 3) || _lodash2.default.includes(directions, 2)) {
                                linkProp.a1 = true;
                                linkToUpdate.a1 = true;
                            }

                            _lodash2.default.assign(linkToUpdate, {
                                propsHistory: [].concat(_toConsumableArray(linkToUpdate.propsHistory), [linkProp]),
                                ts: _lodash2.default.compact(_lodash2.default.uniq([].concat(_toConsumableArray(linkToUpdate.ts), [linkTs]))),
                                types: _lodash2.default.uniq([].concat(_toConsumableArray(linkToUpdate.types), [type])),
                                events: _lodash2.default.uniq([].concat(_toConsumableArray(linkToUpdate.events), [eid])),
                                tags: _lodash2.default.uniq([].concat(_toConsumableArray(linkToUpdate.tags), _toConsumableArray(tags)))
                            });
                        });
                    });
                }
            });
        }
    });

    log.debug('==========cleaning up nodes/links==========', nodes, links);
    _lodash2.default.forEach(nodes, function (node, nodeId) {
        if (node.labels.length > 0) {
            // remove labels from node if it does not match with the nodeId defined in labels
            // this will happen when two nodes are linked to same label, then latest node is used to represent the label
            node.labels = _lodash2.default.filter(node.labels, function (labelId) {
                return labels[labelId].nodeId === nodeId;
            });

            // if after clean up, no labels are left, remove this node
            if (node.labels.length <= 0) {
                log.debug('deleting node ' + nodeId);
                delete nodes[nodeId];
                delete nodesPropsHistory[nodeId];
            }
        }
    });
    _lodash2.default.forEach(links, function (link, linkId) {
        var id1 = link.id1,
            id2 = link.id2,
            propsHistory = link.propsHistory;

        if (!nodes[id1] || !nodes[id2]) {
            log.debug('deleting link ' + linkId);
            delete links[linkId];
        } else {
            // post-process link props
            links[linkId].propsHistory = _lodash2.default.orderBy(propsHistory, 'ts');
        }
    });

    log.debug('==========resolving props==========');
    var propsHistory = {
        nodes: nodesPropsHistory,
        labels: labelsPropsHistory
    };
    var allEntities = {
        nodes: nodes, labels: labels
    };
    _lodash2.default.forEach(['node', 'label' /*, 'link'*/], function (type) {
        _lodash2.default.forEach(propsHistory[type + 's'], function (propsList, id) {
            var resolveFn = propsResolver[type];
            var resolvedProps = void 0;
            if (resolveFn) {
                resolvedProps = resolveFn(propsList);
            } else {
                resolvedProps = (0, _lodash2.default)(propsList).groupBy('event').map(function (items) {
                    return _lodash2.default.merge.apply(_lodash2.default, [{}].concat(_toConsumableArray(items)));
                }).last();
            }
            allEntities[type + 's'][id].props = _lodash2.default.merge(allEntities[type + 's'][id].props || {}, resolvedProps.props);
            allEntities[type + 's'][id].propsReadable = _lodash2.default.merge(allEntities[type + 's'][id].propsReadable || {}, resolvedProps.propsReadable);
            log.debug('resolving ' + type + ' props', id, propsList, resolvedProps);
        });
    });

    var result = {
        nodes: nodes,
        links: links,
        labels: labels
    };

    log.debug('analyze::end', result);
    return result;
}

function analyzeTrack(source, cfg, labelId) {
    var result = analyzeLabels(source, cfg, { labelIds: [labelId], ignoreMissingTrack: true })[labelId];
    return result;
}

function analyzeLabels(source, cfg) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    log.info('analyzeLabels::start', { source: source, cfg: cfg, options: options });

    var _options$ignoreMissin = options.ignoreMissingTrack,
        ignoreMissingTrack = _options$ignoreMissin === undefined ? false : _options$ignoreMissin,
        _options$ignoreMissin2 = options.ignoreMissingLocations,
        ignoreMissingLocations = _options$ignoreMissin2 === undefined ? false : _options$ignoreMissin2,
        filter = options.filter,
        _options$base2 = options.base,
        base = _options$base2 === undefined ? {} : _options$base2,
        _options$tags2 = options.tags,
        tags = _options$tags2 === undefined ? [] : _options$tags2,
        otherOptions = _objectWithoutProperties(options, ['ignoreMissingTrack', 'ignoreMissingLocations', 'filter', 'base', 'tags']);

    var list = _lodash2.default.mapValues(source, function (event, eid) {
        return analyze(_defineProperty({}, eid, event), cfg, _extends({ analyzeLinks: false }, otherOptions));
    });

    var result = _lodash2.default.clone(base);

    log.info('analyzeLabels::list', list);
    _lodash2.default.forEach(list, function (_ref2, eventId) {
        var nodes = _ref2.nodes,
            labels = _ref2.labels;

        _lodash2.default.forEach(nodes, function (node) {
            var nodeLabelIds = node.labels,
                nodeProps = node.props,
                nodePropsReadable = node.propsReadable,
                track = node.track,
                images = node.images,
                locations = node.locations;

            _lodash2.default.forEach(nodeLabelIds, function (labelId) {
                if (ignoreMissingTrack && _lodash2.default.isEmpty(track)) {
                    return;
                }
                if (ignoreMissingLocations && _lodash2.default.isEmpty(locations)) {
                    return;
                }

                var _labels$labelId = labels[labelId],
                    type = _labels$labelId.type,
                    typeReadable = _labels$labelId.typeReadable,
                    localId = _labels$labelId.localId,
                    lProps = _labels$labelId.props,
                    lPropsReadable = _labels$labelId.propsReadable;


                var labelHistoryItem = {
                    props: nodeProps,
                    propsReadable: nodePropsReadable,
                    lProps: lProps,
                    lPropsReadable: lPropsReadable,
                    event: eventId,
                    images: images,
                    locations: locations,
                    track: track,
                    tags: tags
                };
                if (filter && !filter(labelHistoryItem)) {
                    return;
                }

                if (!result[labelId]) {
                    result[labelId] = {
                        type: type,
                        typeReadable: typeReadable,
                        localId: localId,
                        history: [],
                        tags: []
                    };
                }

                result[labelId].tags = _lodash2.default.uniq([].concat(_toConsumableArray(result[labelId].tags), _toConsumableArray(tags)));
                result[labelId].history.push(labelHistoryItem);
            });
        });
    });

    log.info('analyzeLabels::end', result);
    return result;
}

exports.default = {
    analyze: analyze,
    analyzeLabels: analyzeLabels,
    analyzeTrack: analyzeTrack
};