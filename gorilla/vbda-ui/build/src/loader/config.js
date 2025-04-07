'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.setupPrefix = setupPrefix;
exports.loadAllInOneCfg = loadAllInOneCfg;
exports.loadAllDSIds = loadAllDSIds;
exports.loadLabels = loadLabels;
exports.loadLACfg = loadLACfg;
exports.loadES2Neo4jCfgForDS = loadES2Neo4jCfgForDS;
exports.loadUICfgForDS = loadUICfgForDS;
exports.processAll = processAll;
exports.processDataMappings = processDataMappings;
exports.processRefDataMappings = processRefDataMappings;
exports.loadAll = loadAll;
exports.loadAllIncremental = loadAllIncremental;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _ajaxHelper = require('react-ui/build/src/utils/ajax-helper');

var _ajaxHelper2 = _interopRequireDefault(_ajaxHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var log = require('loglevel').getLogger('vbda/loader/config');

var CFG_API_PREFIX = '/api/configurations';

var DT_ORDERS = ['monitor', 'p_geo', 'smartpatrol', 'hotspot', 'terminal', 'account', 'calllog', 'chat', 'email', 'message', 'contact', 'account_sync', 'case', 'ccpss', 'workrecord', 'caserecord', 'judiccialdoc', 'interrogationuse', 'vil_case', 'querylog', 'suspect', 'fraudulentdriver', 'onesixfive', 'goldparty', 'crimemedia', 'crowdfight', 'casino', 'unredeemedpledgedcars', 'rightcars', 'lunatic', 'person'];

function setupPrefix(prefix) {
    CFG_API_PREFIX = prefix;
}

function loadAllInOneCfg() {
    log.info('loadAllInOneCfg');
    return _ajaxHelper2.default.one('' + CFG_API_PREFIX);
}

function loadAllDSIds() {
    log.info('loadAllDSIds');
    return _ajaxHelper2.default.one(CFG_API_PREFIX + '/dataSourceNames');
}

function loadLabels() {
    log.info('loadLabels');
    return _ajaxHelper2.default.one(CFG_API_PREFIX + '/labels');
}

function loadLACfg() {
    log.info('loadLACfg');
    return _ajaxHelper2.default.one(CFG_API_PREFIX + '/laRenders');
}

function loadES2Neo4jCfgForDS(ds) {
    log.info('loadES2Neo4jCfgForDS', ds);
    return _ajaxHelper2.default.one({
        url: CFG_API_PREFIX + '/dataMappings',
        data: { dataSourceName: ds }
    });
}

function loadUICfgForDS(ds) {
    log.info('loadUICfgForDS', ds);
    return _ajaxHelper2.default.one({
        url: CFG_API_PREFIX + '/portals',
        data: { dataSourceName: ds }
    });
}

function processAll(cfg, ds) {
    var lng = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'en';
    var _cfg$la_renders = cfg.la_renders,
        la_renders = _cfg$la_renders === undefined ? [] : _cfg$la_renders,
        _cfg$data_sources = cfg.data_sources,
        data_sources = _cfg$data_sources === undefined ? {} : _cfg$data_sources,
        _cfg$labels = cfg.labels,
        labels = _cfg$labels === undefined ? {} : _cfg$labels,
        _cfg$labels_portal = cfg.labels_portal,
        labels_portal = _cfg$labels_portal === undefined ? {} : _cfg$labels_portal;


    log.info('processAll::start', { cfg: cfg, ds: ds, lng: lng });

    var result = { ds: {}, dt: {}, searches: {}, renders: {}, labels: {}, la: {} };
    var dsIds = _lodash2.default.keys(data_sources);

    result.labels = _lodash2.default.reduce(labels, function (acc, labelCfg, labelName) {
        // const trackable = _.includes(trackableLabels, labelName)
        var unique_property = labelCfg.unique_property,
            _labelCfg$indexed_pro = labelCfg.indexed_properties,
            indexed_properties = _labelCfg$indexed_pro === undefined ? [] : _labelCfg$indexed_pro;


        if (!labelName) {
            log.warn('processAll::label skipped due to missing label name', labelCfg);
            return acc;
        }
        if (!unique_property) {
            log.warn('processAll::label \'' + labelName + '\' skipped due to missing unique property', labelCfg);
            return acc;
        }

        var labelLocale = _lodash2.default.get(labels_portal, [labelName, 'locales', lng], {});

        var _labelLocale$properti = labelLocale.properties,
            propsLocale = _labelLocale$properti === undefined ? {} : _labelLocale$properti,
            metaLocale = _objectWithoutProperties(labelLocale, ['properties']);

        return _extends({}, acc, _defineProperty({}, labelName, _extends({}, _lodash2.default.merge(labelCfg, metaLocale), {
            properties: _lodash2.default.reduce(_lodash2.default.uniq([unique_property].concat(_toConsumableArray(indexed_properties))), function (acc, propName) {
                var propLocale = propsLocale[propName] || {};
                return _extends({}, acc, _defineProperty({}, propName, propLocale));
            }, {})
        })));
    }, {});

    //let trackableLabels = []

    _lodash2.default.forEach(data_sources, function (dsCfg, dsId) {
        var _dsCfg$data_mapping = dsCfg.data_mapping,
            data_mapping = _dsCfg$data_mapping === undefined ? {} : _dsCfg$data_mapping,
            _dsCfg$portal = dsCfg.portal,
            uiCfg = _dsCfg$portal === undefined ? {} : _dsCfg$portal;
        var _data_mapping$data_ty = data_mapping.data_types,
            data_types = _data_mapping$data_ty === undefined ? [] : _data_mapping$data_ty;
        var dsName = uiCfg.display_name,
            dsDescription = uiCfg.description,
            _uiCfg$data_types = uiCfg.data_types,
            ui_data_types = _uiCfg$data_types === undefined ? {} : _uiCfg$data_types,
            searches = uiCfg.searches,
            renders = uiCfg.renders;

        // do not want to process this data source

        if (ds && !_lodash2.default.includes(ds, dsId)) {
            return;
        }

        // porcess data definitions and node/link mappings
        result.ds[dsId] = {
            display_name: dsName || dsId,
            description: dsDescription || '',
            dts: _lodash2.default.map(data_types, 'name')
        };

        _lodash2.default.forEach(data_types, function (dtCfg) {
            var dtId = dtCfg.name,
                dtName = dtCfg.display_name,
                dtDescription = dtCfg.description,
                _dtCfg$properties = dtCfg.properties,
                properties = _dtCfg$properties === undefined ? {} : _dtCfg$properties,
                _dtCfg$nodes = dtCfg.nodes,
                nodes = _dtCfg$nodes === undefined ? [] : _dtCfg$nodes,
                _dtCfg$relationships = dtCfg.relationships,
                relationships = _dtCfg$relationships === undefined ? [] : _dtCfg$relationships,
                data_group = dtCfg.data_group,
                _dtCfg$geo_points = dtCfg.geo_points,
                geo_points = _dtCfg$geo_points === undefined ? {} : _dtCfg$geo_points,
                _dtCfg$geo_address = dtCfg.geo_address,
                geo_address = _dtCfg$geo_address === undefined ? {} : _dtCfg$geo_address,
                representative_time = dtCfg.representative_time,
                _dtCfg$file = dtCfg.file,
                file = _dtCfg$file === undefined ? {} : _dtCfg$file;
            // unused props: partition, active_image_processing

            var _ref = ui_data_types[dtId] || {},
                _ref$locales = _ref.locales,
                localesCfg = _ref$locales === undefined ? {} : _ref$locales,
                uiDtCfg = _objectWithoutProperties(_ref, ['locales']);

            var _ref2 = localesCfg[lng] || {},
                _ref2$properties = _ref2.properties,
                propsLocale = _ref2$properties === undefined ? {} : _ref2$properties,
                _ref2$nodes = _ref2.nodes,
                nodesLocale = _ref2$nodes === undefined ? {} : _ref2$nodes,
                _ref2$relationships = _ref2.relationships,
                relationsLocale = _ref2$relationships === undefined ? {} : _ref2$relationships,
                metaLocale = _objectWithoutProperties(_ref2, ['properties', 'nodes', 'relationships']);

            var geoPointsCfg = _lodash2.default.reduce(geo_points, function (acc, gCfg, geoName) {
                var latitude = gCfg.latitude,
                    longitude = gCfg.longitude;

                if (!latitude || !longitude) {
                    log.warn('processAll::datatype \'' + dtId + '\': geopoint \'' + geoName + '\' ignored due to missing latitude/longitude', gCfg);
                    return acc;
                }
                var latPropFieldToCheck = latitude.replace(/\./g, '.properties.');
                var lngPropFieldToCheck = longitude.replace(/\./g, '.properties.');
                if (!_lodash2.default.get(properties, latPropFieldToCheck) || !_lodash2.default.get(properties, lngPropFieldToCheck)) {
                    log.warn('processAll::datatype \'' + dtId + '\': geopoint \'' + geoName + '\' ignored, latitude \'' + latPropFieldToCheck + '\'/ longitude \'' + lngPropFieldToCheck + '\' not present in properties', gCfg);
                    return acc;
                }
                var propField = geoName;
                return _extends({}, acc, _defineProperty({}, propField, _extends({}, gCfg, {
                    //type: 'geo_address',
                    type: 'geo_point',
                    //coordinate: [..._.initial(propField.split('.')), propField],
                    latitude: latitude.split('.'),
                    longitude: longitude.split('.')
                })));
            }, {});
            var geoAddressCfg = _lodash2.default.reduce(geo_address, function (acc, gCfg, geoName) {
                var address = gCfg.address;

                if (!address) {
                    log.warn('processAll::datatype \'' + dtId + '\': geoaddress \'' + geoName + '\' ignored due to missing address', gCfg);
                    return acc;
                }
                var propFieldToCheck = address.replace(/\./g, '.properties.');
                if (!_lodash2.default.get(properties, propFieldToCheck)) {
                    log.warn('processAll::datatype \'' + dtId + '\': geoaddress \'' + geoName + '\' ignored, address \'' + propFieldToCheck + '\' not present in properties', gCfg);
                    return acc;
                }
                var parent = _lodash2.default.initial(address.split('.'));
                var propField = (_lodash2.default.isEmpty(parent) ? '' : parent.join('.') + '.') + geoName + '.coordinate';
                return _extends({}, acc, _defineProperty({}, propField, _extends({}, gCfg, {
                    type: 'geo_address',
                    coordinate: propField.split('.')
                })));
            }, {});
            var geoCfg = _extends({}, geoPointsCfg, geoAddressCfg);

            var dtProperties = _lodash2.default.reduce(propsLocale, function (acc, propLocale, propName) {
                var propPath = propName.replace(/\./g, '.properties.');
                if (_lodash2.default.get(properties, propPath) == null) {
                    return acc;
                }

                return _objectPathImmutable2.default.assign(acc, propPath, propLocale);
            }, properties);

            var nodesCfg = _lodash2.default.reduce(nodes, function (acc, _ref3) {
                var nodeName = _ref3.name,
                    nCfg = _objectWithoutProperties(_ref3, ['name']);

                if (!nodeName) {
                    log.warn('processAll::datatype \'' + dtId + '\': node skipped due to missing node name', nCfg);
                    return acc;
                }

                var labelsCfg = _lodash2.default.reduce(nCfg.labels, function (acc, lCfg) {
                    var labelName = lCfg.label_name;


                    if (!labelName) {
                        log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' label skipped due to missing label name', lCfg);
                        return acc;
                    }
                    if (!result.labels[labelName]) {
                        log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' label \'' + labelName + '\' skipped, not configured in global labels', lCfg);
                        return acc;
                    }

                    var validPropNames = _lodash2.default.keys(result.labels[labelName].properties);

                    var labelPropertiesCfg = _lodash2.default.reduce(lCfg.properties, function (acc, _ref4) {
                        var propName = _ref4.name,
                            pCfg = _objectWithoutProperties(_ref4, ['name']);

                        var reference = pCfg.reference,
                            value = pCfg.value;

                        if (!propName) {
                            log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' label \'' + labelName + '\' property skipped due to missing property name', pCfg);
                            return acc;
                        }
                        if (!_lodash2.default.includes(validPropNames, propName)) {
                            log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' label \'' + labelName + '\' property \'' + propName + '\' skipped, not a valid prop name', pCfg);
                            return acc;
                        }
                        if (!reference && _lodash2.default.isUndefined(value)) {
                            log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' label \'' + labelName + '\' property \'' + propName + '\' skipped due to missing property reference/value', pCfg);
                            return acc;
                        }

                        if (reference) {
                            var propFieldToCheck = reference.replace(/\./g, '.properties.');
                            if (!_lodash2.default.get(properties, propFieldToCheck)) {
                                log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' label \'' + labelName + '\' property \'' + propName + '\' skipped, reference ' + propFieldToCheck + ' not present in properties', pCfg);
                                return acc;
                            }
                            pCfg.reference = reference.split('.');
                        }

                        return _extends({}, acc, _defineProperty({}, propName, pCfg));
                    }, {});

                    if (_lodash2.default.isEmpty(labelPropertiesCfg)) {
                        log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' label \'' + labelName + '\' skipped due to missing valid properties', lCfg);
                        return acc;
                    }

                    return [].concat(_toConsumableArray(acc), [_extends({}, lCfg, {
                        conditions: _lodash2.default.reduce(lCfg.conditions, function (acc, _ref5) {
                            var cName = _ref5.name,
                                cCfg = _objectWithoutProperties(_ref5, ['name']);

                            var value = cCfg.value;

                            if (!cName || _lodash2.default.isUndefined(value)) {
                                log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' label \'' + labelName + '\' condition skipped due to missing name/value', cCfg);
                                return acc;
                            }

                            var propFieldToCheck = cName.replace(/\./g, '.properties.');
                            if (!_lodash2.default.get(properties, propFieldToCheck)) {
                                log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' label \'' + labelName + '\' condition skipped, reference ' + propFieldToCheck + ' not present in properties', cCfg);
                                return acc;
                            }

                            return [].concat(_toConsumableArray(acc), [_extends({}, cCfg, {
                                reference: cName.split('.')
                            })]);
                        }, []),
                        properties: labelPropertiesCfg
                    })]);
                }, []);

                var _ref6 = nodesLocale[nodeName] || {},
                    _ref6$properties = _ref6.properties,
                    nodePropsLocale = _ref6$properties === undefined ? {} : _ref6$properties,
                    nodeMetaLocale = _objectWithoutProperties(_ref6, ['properties']);

                var propertiesCfg = _lodash2.default.reduce(nCfg.properties, function (acc, _ref7) {
                    var propName = _ref7.name,
                        pCfg = _objectWithoutProperties(_ref7, ['name']);

                    var reference = pCfg.reference,
                        value = pCfg.value;

                    if (!propName) {
                        log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' property skipped due to missing property name', pCfg);
                        return acc;
                    }
                    if (!reference && _lodash2.default.isUndefined(value)) {
                        log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' property \'' + propName + '\' skipped due to missing property reference/value', pCfg);
                        return acc;
                    }

                    var dtField = reference ? _lodash2.default.get(dtProperties, reference.replace(/\./g, '.properties.')) : null;

                    if (reference && !dtField) {
                        log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' property \'' + propName + '\' skipped, reference ' + reference.replace(/\./g, '.properties.') + ' not present in properties', reference);
                        return acc;
                    }

                    if (reference) {
                        pCfg.reference = reference.split('.');
                    }

                    return _extends({}, acc, _defineProperty({}, propName, _extends({}, _lodash2.default.pick(dtField, 'display_name'), pCfg, nodePropsLocale[propName])));
                }, {});

                var trackCfg = null;
                if (nCfg.track) {
                    var _nCfg$track = nCfg.track,
                        location = _nCfg$track.location,
                        datetime = _nCfg$track.datetime;


                    if (!location || !datetime) {
                        log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' track skipped due to missing location/datetime', nCfg.track);
                    } else if (!geoCfg[location] && !_lodash2.default.get(properties, location.replace(/\./g, '.properties.'))) {
                        log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' track skipped due to unfound location \'' + location + '\' in geo_points/property cfg', nCfg.track);
                    } else {
                        if (!geoCfg[location]) {
                            geoCfg[location] = {
                                type: 'geo_point_raw',
                                coordinate: location.split('.')
                            };
                        }
                        //trackableLabels = _.uniq([...trackableLabels, ..._.map(labelsCfg, 'label_name')])
                        trackCfg = {
                            datetime: datetime.split('.'),
                            location: location
                        };
                    }
                }

                //const imagesCfg = _.map(_.compact(nCfg.images), iCfg=>(['__file_service_images_original', iCfg]))
                var imagesCfg = _lodash2.default.map(_lodash2.default.compact(nCfg.images), function (iCfg) {
                    var arr = iCfg.split('.');
                    var initial = _lodash2.default.initial(arr);
                    var last = _lodash2.default.last(arr);
                    return [].concat(_toConsumableArray(initial), ['__' + last]);
                });

                var locationsCfg = _lodash2.default.reduce(nCfg.locations, function (acc, locationKey) {
                    if (geoCfg[locationKey] || _lodash2.default.get(properties, locationKey.replace(/\./g, '.properties.'))) {
                        if (!geoCfg[locationKey]) {
                            geoCfg[locationKey] = {
                                type: 'geo_point_raw',
                                coordinate: locationKey.split('.')
                            };
                        }
                        return [].concat(_toConsumableArray(acc), [locationKey]);
                    }

                    log.warn('processAll::datatype \'' + dtId + '\': node \'' + nodeName + '\' location \'' + locationKey + '\' skipped, no valid geo_points or property config');
                    return acc;
                }, []);

                return _extends({}, acc, _defineProperty({}, nodeName, _extends({}, _lodash2.default.merge(nCfg, nodeMetaLocale), {
                    labels: labelsCfg,
                    properties: propertiesCfg,
                    locations: locationsCfg,
                    track: trackCfg,
                    images: imagesCfg
                })));
            }, {});

            var relationshipsCfg = _lodash2.default.reduce(relationships, function (acc, _ref8) {
                var relationName = _ref8.name,
                    rCfg = _objectWithoutProperties(_ref8, ['name']);

                var _ref9 = relationsLocale[relationName] || {},
                    _ref9$properties = _ref9.properties,
                    relationPropsLocale = _ref9$properties === undefined ? {} : _ref9$properties,
                    relationMetaLocale = _objectWithoutProperties(_ref9, ['properties']);

                var node_a = rCfg.node_a,
                    node_b = rCfg.node_b,
                    description = rCfg.description;


                if (!relationName) {
                    log.warn('processAll::datatype \'' + dtId + '\': relation skipped due to missing relation name', rCfg);
                    return acc;
                }
                if (!node_a || !node_b) {
                    log.warn('processAll::datatype \'' + dtId + '\': relation \'' + relationName + '\' skipped due to missing node a/b', rCfg);
                    return acc;
                }
                if (!nodesCfg[node_a] || !nodesCfg[node_b]) {
                    log.warn('processAll::datatype \'' + dtId + '\': relation \'' + relationName + '\' skipped, nodes a(\'' + node_a + '\') and/or b(\'' + node_b + '\') not valid', rCfg);
                    return acc;
                }

                var directionsCfg = _lodash2.default.reduce(rCfg.directions, function (acc, dCfg) {
                    var value = dCfg.value;

                    if (!_lodash2.default.includes([1, 2, 3], value)) {
                        log.warn('processAll::datatype \'' + dtId + '\': relation \'' + relationName + '\' condition skipped due to missing invalid value', dCfg);
                        return acc;
                    }
                    return [].concat(_toConsumableArray(acc), [_extends({}, dCfg, {
                        conditions: _lodash2.default.reduce(dCfg.conditions, function (acc, _ref10) {
                            var cName = _ref10.name,
                                cCfg = _objectWithoutProperties(_ref10, ['name']);

                            var value = cCfg.value;

                            if (!cName || _lodash2.default.isUndefined(value)) {
                                log.warn('processAll::datatype \'' + dtId + '\': relation \'' + relationName + '\' direction condition skipped due to missing name/value', cCfg);
                                return acc;
                            }
                            return [].concat(_toConsumableArray(acc), [_extends({}, cCfg, {
                                reference: cName.split('.')
                            })]);
                        }, [])
                    })]);
                }, []);

                if (_lodash2.default.isEmpty(directionsCfg)) {
                    log.warn('processAll::datatype \'' + dtId + '\': relation \'' + relationName + '\' skipped, no valid directions cfg', rCfg.directions);
                    return acc;
                }

                var propertiesCfg = _lodash2.default.reduce(rCfg.properties, function (acc, _ref11) {
                    var propName = _ref11.name,
                        pCfg = _objectWithoutProperties(_ref11, ['name']);

                    var reference = pCfg.reference,
                        value = pCfg.value;

                    if (!propName) {
                        log.warn('processAll::datatype \'' + dtId + '\': relation \'' + relationName + '\' property skipped due to missing property name', pCfg);
                        return acc;
                    }
                    if (!reference && _lodash2.default.isUndefined(value)) {
                        log.warn('processAll::datatype \'' + dtId + '\': relation \'' + relationName + '\' property \'' + propName + '\' skipped due to missing property reference/value', pCfg);
                        return acc;
                    }

                    var dtField = reference ? _lodash2.default.get(dtProperties, reference.replace(/\./g, '.properties.')) : null;

                    if (reference && !dtField) {
                        log.warn('processAll::datatype \'' + dtId + '\': relation \'' + relationName + '\' property \'' + propName + '\' skipped, reference ' + reference.replace(/\./g, '.properties.') + ' not present in properties', reference);
                        return acc;
                    }

                    if (reference) {
                        pCfg.reference = reference.split('.');
                    }

                    return _extends({}, acc, _defineProperty({}, propName, _extends({}, _lodash2.default.pick(dtField, 'display_name'), pCfg, relationPropsLocale[propName])));
                }, {});

                return _extends({}, acc, _defineProperty({}, relationName, _extends({
                    display_name: description
                }, _lodash2.default.merge(rCfg, relationMetaLocale), {
                    conditions: _lodash2.default.reduce(rCfg.conditions, function (acc, _ref12) {
                        var cName = _ref12.name,
                            cCfg = _objectWithoutProperties(_ref12, ['name']);

                        var value = cCfg.value;

                        if (!cName || _lodash2.default.isUndefined(value)) {
                            log.warn('processAll::datatype \'' + dtId + '\': relation \'' + relationName + '\' condition skipped due to missing name/value', cCfg);
                            return acc;
                        }

                        var propFieldToCheck = cName.replace(/\./g, '.properties.');
                        if (!_lodash2.default.get(properties, propFieldToCheck)) {
                            log.warn('processAll::datatype \'' + dtId + '\': relation \'' + relationName + '\' condition skipped, reference ' + propFieldToCheck + ' not present in properties', cCfg);
                            return acc;
                        }

                        return [].concat(_toConsumableArray(acc), [_extends({}, cCfg, {
                            reference: cName.split('.')
                        })]);
                    }, []),
                    directions: directionsCfg,
                    properties: propertiesCfg
                })));
            }, {});

            var normalizedDtCfg = {
                ds: dsId,
                fields: dtProperties,
                geo_points: geoPointsCfg,
                geo_address: geoAddressCfg,
                geo: geoCfg,
                representative_time: representative_time,
                data_group: data_group,
                nodes: nodesCfg,
                relationships: relationshipsCfg,
                labels: (0, _lodash2.default)(nodesCfg).map('labels').flatten().map('label_name').uniq().value(),
                showSearch: !_lodash2.default.isEmpty(uiDtCfg.fulltext_search),
                display_name: dtName || dtId,
                description: dtDescription || '',
                file: file
            };

            result.dt[dtId] = _extends({
                sort_order: _lodash2.default.includes(DT_ORDERS, dtId) ? _lodash2.default.indexOf(DT_ORDERS, dtId) + 1 : null
            }, normalizedDtCfg, uiDtCfg, metaLocale);
            if (_lodash2.default.has(propsLocale, ['__dataType', 'display_name']) && !_lodash2.default.isNil(propsLocale['__dataType']['display_name'])) result.dt[dtId].display_name = _lodash2.default.get(propsLocale, ['__dataType', 'display_name']);
        });

        _lodash2.default.forEach(searches, function (searchCfg, searchId) {
            result.searches[searchId] = searchCfg;
        });
        _lodash2.default.forEach(renders, function (renderCfg, renderId) {
            result.renders[renderId] = renderCfg;
        });
    });
    //log.info('trackable', trackableLabels)


    result.la = la_renders;

    log.info('processAll::end', result);

    return result;
}

function processDataMappings(data_mappings) {
    log.info('load DataMapping');
    var urlMappingList = _lodash2.default.omitBy(data_mappings, function (_ref13) {
        var type = _ref13.type;

        return type !== 'url';
    });
    var jsonDataMappings = {};
    _lodash2.default.forEach(data_mappings, function (data_mapping, key) {
        var type = data_mapping.type;

        switch (type) {
            case 'url':
                urlMappingList[key] = data_mapping;
                break;
            case 'json':
            default:
                var json = data_mapping.json;

                if (!_lodash2.default.isNil(json)) jsonDataMappings[key] = JSON.parse(json);
                break;
        }
    });
    return _bluebird2.default.all(_lodash2.default.map(urlMappingList, function (data_mapping, fieldName) {
        var url = data_mapping.url,
            _data_mapping$options = data_mapping.options,
            _data_mapping$options2 = _data_mapping$options.valueField,
            valueField = _data_mapping$options2 === undefined ? 'value' : _data_mapping$options2,
            _data_mapping$options3 = _data_mapping$options.textField,
            textField = _data_mapping$options3 === undefined ? 'text' : _data_mapping$options3;

        return _ajaxHelper2.default.one({
            url: url
        }).then(function (dataMappings) {
            var dataMapping = _lodash2.default.chain(dataMappings).keyBy(valueField).mapValues(function (o) {
                return o[textField];
            }).value();
            return { //整理好mapping的array
                fieldName: fieldName,
                dataMapping: dataMapping
            };
        });
    })).then(function (data) {
        var dataMappings = _lodash2.default.chain(data) //抽出fieldName當key
        .keyBy('fieldName').mapValues(function (o) {
            return o.dataMapping;
        }).value();
        return _extends({}, jsonDataMappings, dataMappings);
    }).catch(function (err) {
        log.error(err);
    });
}

function processRefDataMappings(data_mappings) {
    var urlMappingList = _lodash2.default.omitBy(data_mappings, function (_ref14) {
        var type = _ref14.type;

        return type !== 'ref';
    });
    return _bluebird2.default.all(_lodash2.default.map(urlMappingList, function (data_mapping, fieldName) {
        var url = data_mapping.url,
            _data_mapping$options4 = data_mapping.options,
            valueField = _data_mapping$options4.valueField,
            textField = _data_mapping$options4.textField,
            groupByField = _data_mapping$options4.groupByField;

        return _ajaxHelper2.default.one({
            url: url
        }).then(function (dataMappings) {
            var dataMapping = void 0;
            if (groupByField) dataMapping = _lodash2.default.chain(dataMappings).groupBy(groupByField).mapValues(function (o) {
                return _lodash2.default.map(o, function (o2) {
                    return { value: o2[valueField], text: o2[textField] };
                });
            }).value();else dataMapping = _lodash2.default.chain(dataMappings).keyBy(valueField) //重複的會覆蓋，可避免重複
            .map(function (o) {
                return { value: o[valueField], text: o[textField] };
            }).value();
            return { //整理好mapping的array
                fieldName: fieldName,
                dataMapping: dataMapping
            };
        });
    })).then(function (data) {
        var dataMappings = _lodash2.default.chain(data) //抽出fieldName當key
        .keyBy('fieldName').mapValues(function (o) {
            return o.dataMapping;
        }).value();
        log.info('Ref DataMappings Loaded', dataMappings);
        return dataMappings;
    }).catch(function (err) {
        log.error(err);
    });
}

function loadAll(lng) {
    return loadAllInOneCfg().then(function (cfg) {
        return processAll(cfg, null, lng);
    }).catch(function (err) {
        log.error(err);
        throw new Error(err.message);
    });
}

function loadAllIncremental() {
    var result = { ds: {}, dt: {}, searches: {}, renders: {}, labels: {}, la: {} };
    var dsIds = [];
    return loadAllDSIds().then(function (ds) {
        //dsIds = ds
        dsIds = _lodash2.default.without(ds, 'task');
        log.info('ds', ds);
        return _bluebird2.default.all(_lodash2.default.map(dsIds, function (dsId) {
            return loadUICfgForDS(dsId);
        }));
    }).then(function (uiCfgs) {
        _lodash2.default.forEach(uiCfgs, function (dsCfg) {
            var data_source = dsCfg.data_source,
                display_name = dsCfg.display_name,
                description = dsCfg.description,
                data_types = dsCfg.data_types,
                searches = dsCfg.searches,
                renders = dsCfg.renders;

            result.ds[data_source] = {
                display_name: display_name,
                description: description,
                dts: _lodash2.default.keys(data_types)
            };
            _lodash2.default.forEach(data_types, function (dtCfg, dtId) {
                result.dt[dtId] = _extends({}, dtCfg, { ds: data_source });
            });
            _lodash2.default.forEach(searches, function (searchCfg, searchId) {
                result.searches[searchId] = searchCfg;
            });
            _lodash2.default.forEach(renders, function (renderCfg, renderId) {
                result.renders[renderId] = renderCfg;
            });
        });
        return _bluebird2.default.all(_lodash2.default.map(dsIds, function (dsId) {
            return loadES2Neo4jCfgForDS(dsId);
        }));
    }).then(function (es2Neo4jCfgs) {
        _lodash2.default.forEach(es2Neo4jCfgs, function (dsCfg) {
            var data_types = dsCfg.data_types;

            _lodash2.default.forEach(data_types, function (cfg) {
                var name = cfg.name,
                    properties = cfg.properties,
                    nodes = cfg.nodes,
                    relationships = cfg.relationships,
                    data_group = cfg.data_group,
                    geo_points = cfg.geo_points,
                    representative_time = cfg.representative_time;
                // unused props: partition, active_image_processing

                if (!_lodash2.default.has(result.dt, name)) {
                    log.error('data type ' + name + ' configured in portal but not in mapping');
                    return;
                }
                result.dt[name].fields = properties;
                result.dt[name].locations = _lodash2.default.get(geo_points, 'locations');
                result.dt[name].representative_time = representative_time;
                result.dt[name].data_group = data_group;
                result.dt[name].la = {
                    nodes: nodes, relationships: relationships
                };
                result.dt[name].labels = (0, _lodash2.default)(nodes).map('labels').flatten().map('label_name').uniq().value();
            });
        });
        return loadLabels();
    })
    // .then(labelsCfg=>{
    //     result.labels = labelsCfg
    //     return result
    // })
    .then(function (labelsCfg) {
        result.labels = labelsCfg;
        return loadLACfg();
    }).then(function (laCfg) {
        result.la = laCfg;
        return result;
    }).catch(function (err) {
        log.error(err.message);
        throw new Error(err.message);
    });
}

exports.default = {
    processAll: processAll,
    setupPrefix: setupPrefix,
    loadAllDSIds: loadAllDSIds,
    loadLabels: loadLabels,
    loadLACfg: loadLACfg,
    loadES2Neo4jCfgForDS: loadES2Neo4jCfgForDS,
    loadUICfgForDS: loadUICfgForDS,
    loadAllIncremental: loadAllIncremental,
    loadAllInOneCfg: loadAllInOneCfg,
    loadAll: loadAll,
    processDataMappings: processDataMappings,
    processRefDataMappings: processRefDataMappings
};