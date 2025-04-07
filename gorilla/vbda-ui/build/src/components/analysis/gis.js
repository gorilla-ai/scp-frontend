'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.generateGraph = generateGraph;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _reactUi = require('react-ui');

var _reactGis = require('react-gis');

var _reactGis2 = _interopRequireDefault(_reactGis);

var _timeline = require('react-gis/build/src/components/timeline');

var _timeline2 = _interopRequireDefault(_timeline);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _localeProvider = require('../../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var log = require('loglevel').getLogger('vbda/components/analysis/gis');

var lt = global.vbdaI18n.getFixedT(null, 'analysis');
var gt = global.vbdaI18n.getFixedT(null, 'vbda');

var VIEW_SOURCE_BUTTON_ID = 'g-vbda-gis-source-btn';
var LAYOUTS = ['standard', 'track', 'heatmap', 'contour'];

function mergeProps(cfgs, label, snapshot, location) {
    // generate all visualization props for all cfgs
    var allVis = _lodash2.default.map(cfgs, function (cfg) {
        return _lodash2.default.reduce(cfg, function (acc, v, k) {
            var newKey = k;
            var newVal = v;
            if (_lodash2.default.endsWith(k, 'Template')) {
                newKey = _lodash2.default.replace(k, /Template$/, '');
                newVal = _lodash2.default.template(v)({ label: label, snapshot: snapshot, location: location });
            } else if (_lodash2.default.endsWith(k, 'Key')) {
                newKey = _lodash2.default.replace(k, /Key$/, '');
                newVal = _lodash2.default.get({ label: label, snapshot: snapshot, location: location }, v);
            } else if (_lodash2.default.isFunction(v)) {
                newVal = v(label, snapshot, location);
            }

            return _extends({}, acc, _defineProperty({}, newKey, newVal));
        }, {});
    });

    return _lodash2.default.merge.apply(_lodash2.default, [{}].concat(_toConsumableArray(allVis)));
}

function getSymbolLabel(_ref) {
    var type = _ref.type,
        typeReadable = _ref.typeReadable,
        localId = _ref.localId;

    if (!type) {
        // no label
        return '';
    }
    if (localId.indexOf('@@') === 0) {
        // label but no unique id
        return typeReadable;
    }
    return localId + ' (' + typeReadable + ')';
}

function visualizeGraphItem(cfgs, labelsCfg, isTrack, item) {
    var labelId = item.id,
        history = item.history,
        labelType = item.type;

    var iconUrl = _lodash2.default.get(labelsCfg, [labelType, 'icon_url']);
    var defaultLabel = getSymbolLabel(item);

    if (isTrack) {
        cfgs = [{
            type: 'marker',
            id: function id(label, snapshot) {
                return labelId + '__' + snapshot.event;
            },
            //label: defaultLabel,
            tooltip: defaultLabel,
            popup: function popup(label, _ref2) {
                var propsReadable = _ref2.propsReadable,
                    lPropsReadable = _ref2.lPropsReadable,
                    track = _ref2.track,
                    images = _ref2.images;
                return _server2.default.renderToStaticMarkup(_react2.default.createElement(_node2.default, {
                    nodeData: { propsReadable: _extends({}, propsReadable, _defineProperty({}, lt('lbl-time'), track.datetime ? (0, _moment2.default)(track.datetime).format('YYYY-MM-DD HH:mm:ss') : null)), images: images },
                    labelData: _defineProperty({}, labelId, { propsReadable: lPropsReadable }),
                    contentClassName: 'inline' }));
            },
            icon: iconUrl ? {
                iconUrl: iconUrl
            } : undefined,
            enableViewEvents: false,
            track: labelId,
            ts: function ts(label, _ref4) {
                var track = _ref4.track;
                return track.datetime ? (0, _moment2.default)(track.datetime).valueOf() : null;
            },
            data: function data(label, _ref5) {
                var event = _ref5.event,
                    tags = _ref5.tags;
                return {
                    labelId: labelId,
                    labelType: labelType,
                    event: event,
                    tags: tags
                };
            }
        }].concat(_toConsumableArray(cfgs));
    } else {
        cfgs = [{
            type: 'marker',
            id: function id(label, _ref6, location) {
                var event = _ref6.event;
                return label.id + '__' + event + '__' + location.type;
            },
            label: defaultLabel,
            //tooltip: defaultLabel,
            popup: function popup(label, _ref7) {
                var propsReadable = _ref7.propsReadable,
                    lPropsReadable = _ref7.lPropsReadable,
                    images = _ref7.images;
                return _server2.default.renderToStaticMarkup(_react2.default.createElement(_node2.default, {
                    nodeData: { propsReadable: propsReadable, images: images },
                    labelData: _defineProperty({}, labelId, { propsReadable: lPropsReadable }),
                    contentClassName: 'inline' }));
            },
            icon: iconUrl ? {
                iconUrl: iconUrl
            } : undefined,
            enableViewEvents: false,
            group: '__base__',
            cluster: labelType,
            data: function data(label, _ref9, location) {
                var event = _ref9.event,
                    tags = _ref9.tags;
                return {
                    labelId: labelId,
                    labelType: labelType,
                    event: event,
                    locationType: location.type,
                    tags: tags
                };
            }
        }].concat(_toConsumableArray(cfgs));
    }

    var symbols = [];
    _lodash2.default.forEach(history, function (snapshot) {
        var _snapshot$locations = snapshot.locations,
            locations = _snapshot$locations === undefined ? [] : _snapshot$locations,
            _snapshot$track = snapshot.track,
            track = _snapshot$track === undefined ? {} : _snapshot$track;


        if (isTrack && track && track.location) {
            var latlng = _lodash2.default.values(track.location);
            if (!latlng) {
                return;
            }
            var computedProps = mergeProps(cfgs, item, snapshot);

            symbols.push(_extends({
                latlng: latlng
            }, computedProps));
        } else if (!isTrack && locations && locations.length > 0) {
            _lodash2.default.forEach(locations, function (location) {
                var computedProps = mergeProps(cfgs, item, snapshot, location);
                symbols.push(_extends({
                    latlng: [location.latitude, location.longitude]
                }, computedProps));
            });
        }
    });

    _lodash2.default.forEach(symbols, function (symbol) {
        if (symbol.enableViewEvents) {
            symbol.popup = '<div>\n                ' + symbol.popup + '\n                <button id=' + VIEW_SOURCE_BUTTON_ID + ' value=' + symbol.data.event + '>' + lt('btn-view-source') + '</button>\n            </div>';
        }
        //delete symbol.enableViewEvents
    });
    return symbols;
}

function generateGraph(_ref10) {
    var _ref10$source = _ref10.source,
        source = _ref10$source === undefined ? {} : _ref10$source,
        _ref10$labelsCfg = _ref10.labelsCfg,
        labelsCfg = _ref10$labelsCfg === undefined ? {} : _ref10$labelsCfg,
        _ref10$sourceSymbolOp = _ref10.sourceSymbolOptions,
        sourceSymbolOptions = _ref10$sourceSymbolOp === undefined ? [] : _ref10$sourceSymbolOp,
        _ref10$isTrack = _ref10.isTrack,
        isTrack = _ref10$isTrack === undefined ? false : _ref10$isTrack;

    return _lodash2.default.flatten(_lodash2.default.map(source, function (item, labelId) {
        var matchedProfiles = _lodash2.default.filter(sourceSymbolOptions, function (_ref11) {
            var match = _ref11.match;

            if (_lodash2.default.isFunction(match)) {
                return match(item);
            }
            return _lodash2.default.every(match, function (v, k) {
                if (k === 'labels') {
                    return _lodash2.default.includes(v, item.type);
                } else {
                    return _lodash2.default.get(item, k) == v;
                }
            });
        });

        return visualizeGraphItem(_lodash2.default.map(matchedProfiles, 'props'), labelsCfg, isTrack, _extends({ id: labelId }, item));
    }));
}

var GisAnalysis = function (_React$Component) {
    _inherits(GisAnalysis, _React$Component);

    function GisAnalysis(props, context) {
        _classCallCheck(this, GisAnalysis);

        var _this = _possibleConstructorReturn(this, (GisAnalysis.__proto__ || Object.getPrototypeOf(GisAnalysis)).call(this, props, context));

        _initialiseProps.call(_this);

        var labelsCfg = props.sourceCfg.labels,
            source = props.source,
            sourceSymbolOptions = props.sourceSymbolOptions,
            selected = props.selected,
            show = props.show,
            layout = props.layout,
            layouts = props.layouts,
            layers = props.layers;

        var isTrack = (layout || _lodash2.default.first(layouts)) === 'track';
        var data = generateGraph({ source: source, labelsCfg: labelsCfg, sourceSymbolOptions: sourceSymbolOptions, isTrack: isTrack });

        _this.state = {
            data: data,
            isTrack: isTrack,
            show: _this.labelIdsToSymbolIds(data, show, isTrack),
            selected: _this.labelIdsToSymbolIds(data, selected, isTrack) || [],
            layers: _lodash2.default.mapValues(layers, function (layer) {
                if (layer.source) {
                    return {
                        label: layer.label,
                        data: generateGraph({ source: layer.source, labelsCfg: labelsCfg, sourceSymbolOptions: sourceSymbolOptions, isTrack: isTrack })
                    };
                }
                return layer;
            })
        };
        return _this;
    }

    _createClass(GisAnalysis, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            (0, _jquery2.default)('body').on('click', 'button#' + VIEW_SOURCE_BUTTON_ID, function (evt) {
                _this2.showEvents([evt.target.value]);
            });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this3 = this;

            var labelsCfg = nextProps.sourceCfg.labels,
                source = nextProps.source,
                sourceSymbolOptions = nextProps.sourceSymbolOptions,
                selected = nextProps.selected,
                show = nextProps.show,
                layout = nextProps.layout,
                layers = nextProps.layers;
            var _props = this.props,
                prevSelected = _props.selected,
                prevShow = _props.show,
                prevSource = _props.source,
                prevLayout = _props.layout,
                prevLayers = _props.layers;


            var isTrack = layout ? layout === 'track' : this.state.isTrack;
            var wasTrack = this.state.isTrack;

            var stateToUpdate = {};
            if (isTrack !== wasTrack) {
                stateToUpdate.isTrack = isTrack;
            }

            if (source !== prevSource || isTrack !== wasTrack) {
                log.info('componentWillReceiveProps::source/isTrack changed', { prevSource: prevSource, source: source, prevLayout: prevLayout, isTrack: isTrack });
                stateToUpdate.data = generateGraph({ source: source, labelsCfg: labelsCfg, sourceSymbolOptions: sourceSymbolOptions, isTrack: isTrack });
                log.info('end', stateToUpdate.data);
            }

            if (show !== prevShow) {
                log.info('componentWillReceiveProps::show changed', { prevShow: prevShow, show: show });
                stateToUpdate.show = this.labelIdsToSymbolIds(stateToUpdate.data || this.state.data, show, isTrack);
            }
            if (selected !== prevSelected) {
                log.info('componentWillReceiveProps::selected changed', { prevSelected: prevSelected, selected: selected });
                stateToUpdate.selected = this.labelIdsToSymbolIds(stateToUpdate.data || this.state.data, selected, isTrack) || [];
            }

            if (layers !== prevLayers) {
                log.info('componentWillReceiveProps::layers changed', { layers: layers, prevLayers: prevLayers });
                var newLayers = _lodash2.default.mapValues(layers, function (layer, layerId) {
                    var prevLayer = prevLayers[layerId];
                    if (!prevLayer || layer.source !== prevLayer.source || layer.data !== prevLayer.data) {
                        // update layer data from new source/data
                        if (layer.source) {
                            return {
                                label: layer.label,
                                data: generateGraph({ source: layer.source, labelsCfg: labelsCfg, sourceSymbolOptions: sourceSymbolOptions, isTrack: isTrack })
                            };
                        }
                        return layer;
                    } else {
                        // layer not changed, use existing layer from state
                        return _this3.state.layers[layerId];
                    }
                });
                stateToUpdate.layers = newLayers;
            }

            if (!_lodash2.default.isEmpty(stateToUpdate)) {
                this.setState(stateToUpdate);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            (0, _jquery2.default)('body').off('click', 'button#' + VIEW_SOURCE_BUTTON_ID);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _props2 = this.props,
                className = _props2.className,
                _props2$timebar = _props2.timebar;
            _props2$timebar = _props2$timebar === undefined ? {} : _props2$timebar;
            var enableTimebar = _props2$timebar.enabled,
                _props2$clusterOption = _props2.clusterOptions,
                clusterOptions = _props2$clusterOption === undefined ? [] : _props2$clusterOption,
                _props2$heatmapOption = _props2.heatmapOptions,
                heatmapOptions = _props2$heatmapOption === undefined ? {} : _props2$heatmapOption,
                labelsCfg = _props2.sourceCfg.labels,
                defaultIcon = _props2.defaultIcon;
            var _state = this.state,
                data = _state.data,
                show = _state.show,
                selected = _state.selected,
                layers = _state.layers;


            var propsToPass = _lodash2.default.omit(this.props, ['events', 'source', 'sourceCfg', 'sourceSymbolOptions']);
            var defaultProps = enableTimebar ? { showStatic: true } : {};

            var Gis = enableTimebar ? _timeline2.default : _reactGis2.default;

            var defaultLabelsClusterOptions = {
                props: {
                    spiderfyOnMaxZoom: false,
                    showListOnClick: {
                        enabled: true,
                        formatter: function formatter(_ref12) {
                            var enableViewEvents = _ref12.enableViewEvents,
                                label = _ref12.label,
                                data = _ref12.data;

                            var labelText = _lodash2.default.get(label, 'content');
                            if (!labelText) {
                                return undefined;
                            } else {
                                return _react2.default.createElement(
                                    'div',
                                    { className: 'c-flex aic jcsb' },
                                    labelText,
                                    enableViewEvents && _react2.default.createElement('button', { className: 'standard button fg fg-eye', id: VIEW_SOURCE_BUTTON_ID, value: data.event })
                                );
                            }
                        }
                    },
                    symbol: {
                        type: 'marker',
                        icon: function icon(_ref13) {
                            var cluster = _ref13.data.cluster;

                            return {
                                iconUrl: _lodash2.default.get(labelsCfg, [cluster, 'icon_url'], defaultIcon),
                                iconSize: [30, 30],
                                iconAnchor: [15, 15]
                            };
                        },
                        label: function label(_ref14) {
                            var _ref14$data = _ref14.data,
                                cluster = _ref14$data.cluster,
                                count = _ref14$data.count;

                            return count + ' ' + _lodash2.default.get(labelsCfg, [cluster, 'display_name'], cluster);
                        }
                    }
                }
            };
            var defaultHeatmapOptions = {
                legend: {
                    enabled: true
                }
            };
            return _react2.default.createElement(Gis, _extends({}, defaultProps, propsToPass, {
                ref: function ref(_ref15) {
                    _this4.containerNode = _ref15;
                },
                className: (0, _classnames2.default)('grow c-vbda-analysis-gis', className),
                clusterOptions: [defaultLabelsClusterOptions].concat(_toConsumableArray(clusterOptions)),
                heatmapOptions: _extends({}, defaultHeatmapOptions, heatmapOptions),
                data: data,
                show: show,
                selected: selected,
                onSelectionChange: this.handleSelectionChange,
                layers: layers,
                onLayoutChange: this.handleLayoutChange }));
        }
    }]);

    return GisAnalysis;
}(_react2.default.Component);

GisAnalysis.propTypes = {
    className: _propTypes2.default.string,
    events: _propTypes2.default.object,
    source: _propTypes2.default.object,
    sourceCfg: _propTypes2.default.shape({
        dt: _propTypes2.default.object
    }).isRequired,
    sourceSymbolOptions: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        match: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.object]),
        props: _propTypes2.default.object
    })),
    clusterOptions: _propTypes2.default.array,
    layouts: _propTypes2.default.arrayOf(_propTypes2.default.oneOf(LAYOUTS)),
    layout: _propTypes2.default.oneOf(LAYOUTS),
    onLayoutChange: _propTypes2.default.func,
    layers: _propTypes2.default.objectOf(_propTypes2.default.shape({
        label: _propTypes2.default.node,
        events: _propTypes2.default.object,
        source: _propTypes2.default.object,
        data: _propTypes2.default.array
    })),
    show: _propTypes2.default.arrayOf(_propTypes2.default.string),
    selected: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onSelectionChange: _propTypes2.default.func
};
GisAnalysis.defaultProps = {
    events: {},
    source: {},
    sourceCfg: {},
    sourceSymbolOptions: [],
    layouts: LAYOUTS,
    layers: {}
};

var _initialiseProps = function _initialiseProps() {
    var _this5 = this;

    this.labelIdsToSymbolIds = function (data, labelIds, isTrack) {
        if (!labelIds) {
            return null;
        }
        var symbolsIds = (0, _lodash2.default)(data).filter(function (item) {
            return _lodash2.default.includes(labelIds, item.data.labelId);
        }).map('id').value();

        return isTrack ? [].concat(_toConsumableArray(labelIds), _toConsumableArray(symbolsIds)) : symbolsIds;
    };

    this.handleLayoutChange = function (layout, eventInfo) {
        var onLayoutChange = _this5.props.onLayoutChange;
        var prevLayout = eventInfo.before;


        if ((layout === 'track' || prevLayout === 'track') && !_lodash2.default.has(_this5.props, 'layout')) {
            // uncontrolled
            var _props3 = _this5.props,
                labelsCfg = _props3.sourceCfg.labels,
                source = _props3.source,
                sourceSymbolOptions = _props3.sourceSymbolOptions,
                selected = _props3.selected,
                show = _props3.show;

            var isTrack = layout === 'track';
            var data = generateGraph({ source: source, labelsCfg: labelsCfg, sourceSymbolOptions: sourceSymbolOptions, isTrack: isTrack });
            _this5.setState({
                data: data,
                isTrack: isTrack,
                show: _this5.labelIdsToSymbolIds(data, show, isTrack),
                selected: _this5.labelIdsToSymbolIds(data, selected, isTrack) || []
            });
        }

        if (onLayoutChange) {
            onLayoutChange(layout, eventInfo);
        }
    };

    this.handleSelectionChange = function (selected, eventInfo) {
        var onSelectionChange = _this5.props.onSelectionChange;

        if (!onSelectionChange) {
            _this5.setState({ selected: selected });
        } else {
            onSelectionChange(selected, eventInfo);
        }
    };

    this.showEvents = function (eventIds) {
        var _props4 = _this5.props,
            events = _props4.events,
            eventsCfg = _props4.sourceCfg;

        var nodeEvents = _lodash2.default.pick(events, eventIds);
        _reactUi.PopupDialog.alertId('g-vbda-gis-source-container', {
            title: lt('hdr-source'),
            display: _react2.default.createElement(_events2.default, {
                events: nodeEvents,
                eventsCfg: eventsCfg }),
            confirmText: gt('btn-close')
        });
    };

    this.resize = function () {
        var _props$timebar = _this5.props.timebar;
        _props$timebar = _props$timebar === undefined ? {} : _props$timebar;
        var enableTimebar = _props$timebar.enabled;

        if (enableTimebar) {
            _this5.containerNode.resize();
        } else {
            _this5.containerNode._component._component._component._component.resize();
        }
    };
};

exports.default = (0, _localeProvider2.default)(GisAnalysis);