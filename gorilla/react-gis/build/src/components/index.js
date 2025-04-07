'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _reactUi = require('react-ui');

var _propWire = require('react-ui/build/src/hoc/prop-wire');

var _searchProvider = require('react-ui/build/src/hoc/search-provider');

var _searchProvider2 = _interopRequireDefault(_searchProvider);

var _download = require('react-ui/build/src/utils/download');

var _src = require('gis/build/src');

var _src2 = _interopRequireDefault(_src);

var _localeProvider = require('../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-gis/components');

var lt = global.gisI18n.getFixedT(null, 'gis');
//const gt = global.gisI18n.getFixedT(null, 'global')

var LAYOUTS = ['standard', 'track', 'heatmap', 'contour'];
var DRAG_MODES = ['pan', 'measure', 'region'];
var REGION_TYPES = ['circle', 'rectangle'];
var BASE_MAPS = { __google: { layer: 'https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}' }

    /**
     * A wrapper React GIS Component for [gis]{@link http://ivs.duckdns.org:10080/web-ui/gis/tree/develop} library.
     * @constructor
     * @param {string} [id] - Gis element #id
     * @param {function} [_ref] - Reference to the underlying component
     * @param {'en'|'zh'} [lng] - lang to use
     * @param {renderable} [title] - Gis title
     * @param {string} [className] - Classname for the container
     * @param {renderable} [actions] - Self defined actions to be appended to the actions panel
     * @param {object} [mapOptions] - global map options to be supplied to [leaflet]{@link https://leafletjs.com/reference-1.3.0.html#map-option}
     * @param {object} [truncateLabels] - whether to truncate symbol label content
     * @param {number} [truncateLabels.maxLength=13] - max # of characters to show in label
     * @param {boolean} [truncateLabels.shownOnHover] - show complete label text when hover over symbol?
     * @param {array.<object>} [data] - array of symbols to show on map, see [gis symbol]{@link http://ivs.duckdns.org:10080/web-ui/gis/blob/develop/docs/symbol.md}
     * @param {array.<string>} [show] - ids of symbols to show on map, if not specified, all symbols will be shown
     * @param {array.<string>} [defaultSelected] - default ids of symbols to be selected on map
     * @param {array.<string>} [selected] - ids of symbols to be selected on map
     * @param {function} [onSelectionChange] - Callback function when symbol is selected/deselected. <br> Required when *selected* prop is supplied
     * @param {string|array.<string>} onSelectionChange.id - selected id(s)
     * @param {object} onSelectionChange.eventInfo - event related info
     * @param {string|array.<string>} onSelectionChange.eventInfo.before - previously selected id(s)
     * @param {object} [baseLayers] - base layers represented by object of id-layer(layer config) or id-images pairs, note at any time at most one layer can be shown
     * @param {string} baseLayers.id - layer id
     * @param {string} [baseLayers.id.label=id] - layer label
     * @param {string|object|array.<Layer>} baseLayers.id.layer - layer config
     * * url for the tile server
     * * tile layer object to be supplied to leaflet
     * * array of leaflet [layers]{@link https://leafletjs.com/reference-1.3.0.html#map-layers}
     * @param {object} [baseLayers.id.size] - if current base layer is of image type, this defines the total viewable plan size in xy coords,
     * if not specifed, the total plan size is calculated from the image sizes
     * @param {number} [baseLayers.id.size.width] - width of the total plan size
     * @param {number} [baseLayers.id.size.height] - height of the total plan size
     * @param {array.<object>} [baseLayers.id.images] - list of images to show
     * @param {string} [baseLayers.id.images.id] - image id
     * @param {string} baseLayers.id.images.url - image url
     * @param {object} [baseLayers.id.images.xy] - starting position of this image relative to the entire plane
     * @param {number} [baseLayers.id.images.xy.x=0] - x coord
     * @param {number} [baseLayers.id.images.xy.y=0] - y coord
     * @param {object} baseLayers.id.images.size - size represented by this image
     * @todo auto retrieve image size if not specified
     * @param {number} baseLayers.id.images.size.width - width
     * @param {number} baseLayers.id.images.size.height - height
     * @param {number} [baseLayers.id.images.scale=1] - scale the image *size* by this factor
     * @param {number} [baseLayers.id.images.zoom] - only show this image when *zoom*>=current zoom
     * @param {number} [baseLayers.id.images.opacity=1] - image opacity
     * @param {string} [defaultBaseLayer] - default base layer id to be shown
     * @param {string} [baseLayer] - base layer id to be shown
     * @param {function} [onBaseLayerChange] - Callback function when bae layer is changed. <br> Required when baseLayer prop is supplied
     * @param {string} onBaseLayerChange.value - current selected base layer id
     * @param {object} onBaseLayerChange.eventInfo - event related info
     * @param {string} onBaseLayerChange.eventInfo.before - previous selected base layer id
     * @param {string|object|array.<Layer>} [baseMap] - base map layer
     * * url for the tile server
     * * tile layer object to be supplied to leaflet
     * * array of leaflet [layers]{@link https://leafletjs.com/reference-1.3.0.html#map-layers}
     * @param {array.<'standard'|'track'|'heatmap'|'contour'>} [layouts=['standard', 'track', 'heatmap', 'contour']] - list of layouts for the user the choose between
     * @param {'standard'|'track'|'heatmap'|'contour'} [defaultLayout=first of layouts] - default layout id to show
     * @param {'standard'|'track'|'heatmap'|'contour'} [layout] - current layout id to show
     * @param {function} [onLayoutChange] - Callback function when layout is changed. <br> Required when *layout* prop is supplied
     * @param {string} onLayoutChange.value - current selected layout id
     * @param {object} onLayoutChange.eventInfo - event related info
     * @param {string} onLayoutChange.eventInfo.before - previous selected layout id
     * @param {array.<'pan'|'measure'|'region'>} [dragModes=['pan', 'measure', 'region']] - list of drag modes for the user the choose between
     * @param {'pan'|'measure'|'region'} [defaultDragMode=first of dragModes] - default drag mode id to show
     * @param {'pan'|'measure'|'region'} [dragMode] - current drag mode id to show
     * @param {function} [onDragModeChange] - Callback function when drag mode is changed. <br> Required when *dragMode* prop is supplied
     * @param {string} onDragModeChange.value - current selected drag mode id
     * @param {object} onDragModeChange.eventInfo - event related info
     * @param {string} onDragModeChange.eventInfo.before - previous selected drag mode id
     * @param {array.<'circle'|'rectangle'>} [regionTypes=['circle', 'rectangle']] - when dragMode='region', list of selection region types for the user the choose between
     * @param {'circle'|'rectangle'} [defaultRegionType=first of regionTypes] - default region type id to show
     * @param {'circle'|'rectangle'} [dragMode] - current region type id to show
     * @param {function} [onRegionTypeChange] - Callback function when region type is changed. <br> Required when *regionType* prop is supplied
     * @param {string} onRegionTypeChange.value - current selected region type id
     * @param {object} onRegionTypeChange.eventInfo - event related info
     * @param {string} onRegionTypeChange.eventInfo.before - previous selected region type id
     * @param {array.<object>} [symbolOptions] - additional style and behaviour to append to symbols, see [gis symbol doc]{@link http://ivs.duckdns.org:10080/web-ui/gis/blob/develop/docs/symbol.md}
     * @param {array.<object>} [trackOptions] - style and behaviour to apply to tracks when symbol has *track* defined, see [gis symbol doc]{@link http://ivs.duckdns.org:10080/web-ui/gis/blob/develop/docs/symbol.md}
     * @param {object} [heatmapOptions] - configuration options for heatmap mode, see [gis heatmap doc]{@link http://ivs.duckdns.org:10080/web-ui/gis/blob/develop/docs/gis.md#heatmap-options}
     * @param {object} [measureOptions] - configuration options for measure mode, see [gis measure doc]{@link http://ivs.duckdns.org:10080/web-ui/gis/blob/develop/docs/gis.md#measure-options}
     * @param {object} [contourOptions] - configuration options for contour mode, see [gis contour doc]{@link http://ivs.duckdns.org:10080/web-ui/gis/blob/develop/docs/gis.md#contour-options}
     * @param {array.<object>} [clusterOptions] - style and behaviour to apply to clusters when symbol has *cluster* defined, see [gis cluster doc]{@link http://ivs.duckdns.org:10080/web-ui/gis/blob/develop/docs/gis.md#cluster-options}
     * @param {object} [layers] - layers of symbols users can toggle to show/hide, represented by object of id-layer(layer config) pairs, note at any time multiple layers can co-exist
     * @param {string} layers.id - layer id
     * @param {string} [layers.id.label=id] - layer label
     * @param {boolean} [layers.id.interactive=true] - if set to false, this will not show in layers panel
     * @param {array.<object>} [layers.id.data] - same as data props
     * @param {array.<string>} [defaultActiveLayers] - default layer ids to be shown
     * @param {array.<string>} [activeLayers] - layer ids to be shown
     * @param {function} [onLayersChange] - Callback function when layers are changed. <br> Required when *activeLayers* prop is supplied
     * @param {array.<string>} onLayersChange.value - current active layer ids
     * @param {object} onLayersChange.eventInfo - event related info
     * @param {string} onLayersChange.eventInfo.before - previous active layer ids
     * @param {string} onLayersChange.eventInfo.value - which layer triggered change?
     * @param {boolean} onLayersChange.eventInfo.checked - activate or deactivate?
     * @param {object} onLayersChange.eventInfo.view - current map view
     * @param {boolean} [resetViewOnFilter=false] - reset layout when filter is applied (ie *show* is changed)?
     * @param {object} [searchCfg] - search settings
     * @param {string} [searchCfg.title='Search'] - search title
     * @param {string} [searchCfg.applyText='Apply'] - search apply button text
     * @param {object} [searchCfg.forms] - search forms config, in key-config pair, each key represents a form id, note when this is absent, search will be disabled
     * @param {object} [searchCfg.forms.key] - search config for this **key** form
     * @param {string} [searchCfg.forms.key.title] - title/legend for this form
     * @param {object} [searchCfg.forms.key.form] - form props supplied to [Form Component]{@link http://172.18.0.166:8095/docs/Form.html}
     * @param {boolean|function} [searchCfg.forms.key.filter=true] - filter *data*, by default(true) will filter based on symbol's data attribute and search form data
     * * false to turn off auto filter
     * * filter function which returns true/false for individual items, arguments are (item, formData)
     * @param {array.<array.<string>>} [searchCfg.filterGroups] - when present, this will define which forms are grouped together to construct and/or logic when filtering
     * @param {object} [search] - Current search parameters in key(form id)-value(form value object) pairs
     * @param {function} [onSearch] - Callback function when search is applied. <br> Required when *search* prop is supplied
     * @param {object} [scale] - Configuration for showing scales on map
     * @param {boolean} [scale.enabled=true] - show scale on map?
     * @param {object} [download] - Configuration for downloading gis map as png image
     * @param {boolean} [download.enabled=true] - allow download?
     * @param {function} [download.afterDownload] - function to call after download
     * @param {function} [onViewChange] - Callback function when map view is changed
     * @param {object} onViewChange.view - current map view
     * @param {object} onViewChange.view.ne - northeast corner the map view in {lat, lng} format
     * @param {object} onViewChange.view.sw - southwest corner the map view in {lat, lng} format
     * @param {object} onViewChange.view.center - center of the map in {lat, lng} format
     * @param {object} onViewChange.view.radius - radius of the visible map view from center, in meters
     * @param {function} [onClick] - Callback function when map is clicked
     * @param {string|array.<string>} onClick.id - clicked symbol id(s)
     * @param {object} onClick.eventInfo - event related info
     * @param {function} [onDoubleClick] - Callback function when map is double-clicked
     * @param {string|array.<string>} onDoubleClick.id - clicked symbol id(s)
     * @param {object} onDoubleClick.eventInfo - event related info
     * @param {function} [onMouseOver] - Callback function when map is hovered
     * @param {string|array.<string>} onMouseOver.id - hovered symbol id(s)
     * @param {object} onMouseOver.eventInfo - event related info
     * @param {function} [onContextMenu] - Callback function when map is right-clicked
     * @param {string|array.<string>} onContextMenu.id - clicked symbol id(s)
     * @param {object} onContextMenu.eventInfo - event related info
     *
     *
     *
     * @example
    // See [basic example]{@link http://ivs.duckdns.org:10080/web-ui/react-gis/blob/master/examples/src/basic.js}
    // See [advanced example]{@link http://ivs.duckdns.org:10080/web-ui/react-gis/blob/master/examples/src/advanced.js}
    // See [floormap example]{@link http://ivs.duckdns.org:10080/web-ui/react-gis/blob/master/examples/src/floormap.js}
     */
};
var ReactGis = function (_React$Component) {
    _inherits(ReactGis, _React$Component);

    function ReactGis() {
        var _ref2;

        var _temp, _this, _ret;

        _classCallCheck(this, ReactGis);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = ReactGis.__proto__ || Object.getPrototypeOf(ReactGis)).call.apply(_ref2, [this].concat(args))), _this), _this.state = {
            layersPanelOpened: false
        }, _this.removeMap = function () {
            if (_this.gis && _this.gis.map) {
                _this.gis.clear();
                _this.gis.removeImageOverlay();
                _this.gis.map.remove();
            }
        }, _this.init = function () {
            var _this$props = _this.props,
                mapOptions = _this$props.mapOptions,
                truncateLabels = _this$props.truncateLabels,
                baseLayers = _this$props.baseLayers,
                baseLayer = _this$props.baseLayer,
                baseMap = _this$props.baseMap,
                symbolOptions = _this$props.symbolOptions,
                trackOptions = _this$props.trackOptions,
                heatmapOptions = _this$props.heatmapOptions,
                contourOptions = _this$props.contourOptions,
                measureOptions = _this$props.measureOptions,
                clusterOptions = _this$props.clusterOptions,
                _this$props$scale$ena = _this$props.scale.enabled,
                showScale = _this$props$scale$ena === undefined ? true : _this$props$scale$ena,
                layout = _this$props.layout,
                dragMode = _this$props.dragMode,
                regionType = _this$props.regionType,
                onViewChange = _this$props.onViewChange,
                onClick = _this$props.onClick,
                onDoubleClick = _this$props.onDoubleClick,
                onMouseOver = _this$props.onMouseOver,
                onContextMenu = _this$props.onContextMenu,
                onSelectionChange = _this$props.onSelectionChange;


            _this.areaLayer = undefined;
            _this.removeMap();

            var isAreaMap = baseLayer && baseLayers[baseLayer].images;
            var baseImage = void 0;
            var areaMapOptions = {};
            var areaClusterOptions = {};

            if (isAreaMap) {
                var _this$gisNode = _this.gisNode,
                    clientHeight = _this$gisNode.clientHeight,
                    clientWidth = _this$gisNode.clientWidth;
                var _baseLayers$baseLayer = baseLayers[baseLayer],
                    size = _baseLayers$baseLayer.size,
                    baseImages = _baseLayers$baseLayer.images;

                var planSize = size;
                if (!planSize) {
                    planSize = _lodash2.default.reduce(baseImages, function (acc, imgCfg) {
                        var imageSize = imgCfg.size,
                            _imgCfg$scale = imgCfg.scale,
                            scale = _imgCfg$scale === undefined ? 1 : _imgCfg$scale,
                            _imgCfg$xy = imgCfg.xy,
                            xy = _imgCfg$xy === undefined ? {} : _imgCfg$xy;

                        acc.width = Math.max(acc.width, imageSize.width * scale + _lodash2.default.get(xy, 'x', 0));
                        acc.height = Math.max(acc.height, imageSize.height * scale + _lodash2.default.get(xy, 'y', 0));
                        return acc;
                    }, { width: 0, height: 0 });
                }

                baseImage = _lodash2.default.map(baseImages, function (imgCfg) {
                    var _imgCfg$scale2 = imgCfg.scale,
                        scale = _imgCfg$scale2 === undefined ? 1 : _imgCfg$scale2,
                        imageSize = imgCfg.size;

                    return _extends({
                        xy: { x: 0, y: 0 }
                    }, imgCfg, {
                        size: { width: imageSize.width * scale, height: imageSize.height * scale }
                    });
                });

                var scale = Math.min(clientWidth / planSize.width, clientHeight / planSize.height);
                var fitZoom = Math.log2(scale);
                var minZoom = Math.min(0, fitZoom);
                var maxZoom = Math.max(0, fitZoom);
                var maxBounds = [[0, 0], [planSize.height, planSize.width]];
                areaMapOptions = {
                    zoomSnap: 0,
                    zoomDelta: 0.25,
                    crs: _leaflet2.default.CRS.Simple,
                    minZoom: minZoom,
                    zoom: minZoom,
                    maxZoom: maxZoom,
                    maxBounds: maxBounds
                };

                _this.areaLayer = {
                    planSize: planSize,
                    minZoom: minZoom,
                    maxBounds: maxBounds
                };

                areaClusterOptions = { disableClusteringAtZoom: 0 };
                log.info('init area', { areaLayer: _this.areaLayer });
            }

            var gis = _this.gis = new _src2.default(_this.gisNode, {
                mapOptions: _extends({}, areaMapOptions, {
                    zoomControl: false,
                    attributionControl: false,
                    touchExtend: false }, mapOptions),
                baseImage: baseImage,
                truncateLabels: truncateLabels,
                layout: layout,
                dragMode: dragMode,
                regionType: regionType,
                trackOptions: [{
                    selectedProps: {
                        color: '#63a200'
                    }
                }].concat(_toConsumableArray(trackOptions)),
                measureOptions: _extends({
                    pointerTooltip: function pointerTooltip(dist) {
                        return dist.toFixed(2) + ' ' + lt('meters');
                    },
                    endTooltip: function endTooltip(dist) {
                        return dist.toFixed(2) + ' ' + lt('meters');
                    },
                    hint: lt('measure-hint')
                }, measureOptions),
                clusterOptions: [{
                    props: _extends({}, areaClusterOptions, {
                        symbol: {
                            type: 'marker',
                            icon: {
                                iconSize: [30, 30],
                                iconAnchor: [15, 15]
                            }
                        }
                    })
                }].concat(_toConsumableArray(clusterOptions)),
                symbolOptions: [{
                    match: {
                        type: 'marker'
                    },
                    props: {
                        icon: {
                            iconSize: [30, 30],
                            iconAnchor: [15, 15],
                            popupAnchor: [0, -15],
                            tooltipAnchor: [15, 0]
                            /*icon: (symbol) => {
                                const {icon} = symbol
                                 if (_.isEmpty(icon) || !icon.iconSize) {
                                    return {
                                        iconSize: [30,30],
                                        iconAnchor: [15,15]
                                    }
                                }
                                 const {iconSize, iconAnchor} = icon
                                if (!iconAnchor) {
                                    return {
                                        iconAnchor: [iconSize[0]/2, iconSize[1]/2]
                                    }
                                }
                                 return undefined
                            }*/
                        } }
                }].concat(_toConsumableArray(symbolOptions)),
                heatmapOptions: heatmapOptions,
                contourOptions: contourOptions
            });

            if (!isAreaMap) {
                if (baseMap) {
                    gis.map.addLayer(_lodash2.default.isString(baseMap) || _lodash2.default.isPlainObject(baseMap) ? _leaflet2.default.tileLayer(baseMap) : baseMap);
                }

                _this.initBaseLayers();
            }

            if (onViewChange) {
                gis.map.on('moveend', function () {
                    onViewChange(_this.getView());
                });
            }
            if (onClick) {
                gis.on('click', function (info, id) {
                    var latlng = info.latlng;

                    onClick(id, _extends({}, info, { xy: { x: latlng.lng, y: latlng.lat } }));
                });
            }
            if (onDoubleClick) {
                gis.on('dblclick', function (info, id) {
                    var latlng = info.latlng;

                    onDoubleClick(id, _extends({}, info, { xy: { x: latlng.lng, y: latlng.lat } }));
                });
            }
            if (onMouseOver) {
                gis.on('mouseover', function (info, id) {
                    var latlng = info.latlng;

                    onMouseOver(id, _extends({}, info, { xy: { x: latlng.lng, y: latlng.lat } }));
                });
            }
            if (onContextMenu) {
                gis.on('contextmenu', function (info, id) {
                    var latlng = info.latlng;

                    onContextMenu(id, _extends({}, info, { xy: { x: latlng.lng, y: latlng.lat } }));
                });
            }
            if (onSelectionChange) {
                gis.on('selectionChange', function (info, id) {
                    onSelectionChange(_lodash2.default.isString(id) ? [id] : id, info);
                });
            }

            if (showScale) {
                _leaflet2.default.control.scale({
                    position: 'bottomright',
                    imperial: false
                }).addTo(gis.map);
            }

            if (mapOptions.zoomControl !== false) {
                // Add zoom control to bottom right
                _leaflet2.default.control.zoom({
                    position: 'bottomright',
                    zoomInTitle: lt('tt-zoomin'),
                    zoomOutTitle: lt('tt-zoomout')
                }).addTo(gis.map);
            }

            _this.load(true);
            _this.loadLayers();
        }, _this.initBaseLayers = function () {
            var _this$props2 = _this.props,
                baseLayers = _this$props2.baseLayers,
                baseLayer = _this$props2.baseLayer;

            var map = _this.gis.map;

            _lodash2.default.forEach(_this.baseLayers, function (l) {
                if (map.hasLayer(l)) {
                    map.removeLayer(l);
                }
            });

            _this.baseLayers = _lodash2.default.mapValues(baseLayers, function (_ref3) {
                var layer = _ref3.layer;

                return _lodash2.default.isString(layer) || _lodash2.default.isPlainObject(layer) ? _leaflet2.default.tileLayer(layer) : layer;
            });

            if (baseLayer) {
                map.addLayer(_this.baseLayers[baseLayer]);
            }
        }, _this.zoomToFit = function () {
            if (_this.areaLayer) {
                _this.gis.map.fitBounds(_this.areaLayer.maxBounds);
            } else {
                _this.gis.zoomToFit();
            }
        }, _this.load = function (zoomToFit) {
            var _this$props3 = _this.props,
                data = _this$props3.data,
                selected = _this$props3.selected,
                show = _this$props3.show,
                timeRange = _this$props3.timeRange;

            log.info('load::start');
            var gis = _this.gis;

            gis.clear();

            _reactUi.Progress.startSpin();
            setTimeout(function () {
                gis.setSymbol(_this.areaLayer ? _lodash2.default.map(data, function (item) {
                    return _extends({
                        latlng: [item.xy[1], item.xy[0]]
                    }, item);
                }) : data);

                if (show || timeRange) {
                    gis.filterSymbol(show, timeRange);
                }

                if (!_lodash2.default.isEmpty(selected)) {
                    gis.setSelection(selected);
                }

                log.info('load::done');
                if (zoomToFit) {
                    _this.zoomToFit();
                }

                _reactUi.Progress.done();
            });
        }, _this.loadLayers = function () {
            var _this$props4 = _this.props,
                layers = _this$props4.layers,
                activeLayers = _this$props4.activeLayers;

            _lodash2.default.forEach(activeLayers, function (activeLayerId) {
                var layer = layers[activeLayerId];
                if (layer) {
                    _this.addLayer(activeLayerId, layer.data);
                }
            });
        }, _this.handleBaseLayerChange = function (baseLayer) {
            var onBaseLayerChange = _this.props.onBaseLayerChange;

            onBaseLayerChange(baseLayer);
        }, _this.handleLayersChange = function (activeLayers, info) {
            var onLayersChange = _this.props.onLayersChange;

            onLayersChange(activeLayers, _extends({}, info, { view: _this.getView() }));
        }, _this.handleDragModeChange = function (dragMode) {
            var onDragModeChange = _this.props.onDragModeChange;

            onDragModeChange(dragMode);
        }, _this.handleLayoutChange = function (layout) {
            var onLayoutChange = _this.props.onLayoutChange;

            onLayoutChange(layout);
        }, _this.handleRegionTypeChange = function (regionType) {
            var onRegionTypeChange = _this.props.onRegionTypeChange;

            onRegionTypeChange(regionType);
        }, _this.resize = function () {
            _this.gis.map.invalidateSize();
        }, _this.toggleLayers = function () {
            _this.setState(function (_ref4) {
                var layersPanelOpened = _ref4.layersPanelOpened;

                return {
                    layersPanelOpened: !layersPanelOpened
                };
            });
        }, _this.getView = function () {
            var map = _this.gis.map;

            var _map$getBounds = map.getBounds(),
                ne = _map$getBounds._northEast,
                sw = _map$getBounds._southWest;

            var center = map.getCenter();
            var radius = map.distance(center, ne);
            if (_this.areaLayer) {
                center = { x: center.lng, y: center.lat };
                ne = { x: ne.lng, y: ne.lat };
                sw = { x: sw.lng, y: sw.lat };
            }
            var zoom = map.getZoom();
            return { center: center, ne: ne, sw: sw, radius: radius, zoom: zoom };
        }, _this.addLayer = function (layerId, data) {
            var gis = _this.gis;
            var isAreaMap = !!_this.areaLayer;

            log.info('addLayer::start', layerId);

            gis.setSymbol(_lodash2.default.map(data, function (item) {
                return _extends({
                    latlng: isAreaMap ? [item.xy[1], item.xy[0]] : undefined
                }, item, {
                    group: layerId
                });
            }));

            log.info('addLayer::done');
        }, _this.removeLayer = function (layerId) {
            _this.gis.removeSymbol({ group: layerId });
        }, _this.downloadAsImg = function () {
            var afterDownload = _this.props.download.afterDownload;

            var filename = 'gis_' + (0, _moment2.default)().format('YYYY-MM-DD-HH-mm');

            (0, _download.downloadHtmlAsImage)(_this.gisNode, filename);
            afterDownload && afterDownload({ filename: filename });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ReactGis, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _ref = this.props._ref;


            this.areaLayer = undefined;
            this.baseLayers = {};
            this.layers = {};

            if (_ref) {
                _ref(this);
            }
            this.init();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var _this2 = this;

            var _props = this.props,
                baseLayers = _props.baseLayers,
                baseLayer = _props.baseLayer,
                layers = _props.layers,
                activeLayers = _props.activeLayers,
                data = _props.data,
                selected = _props.selected,
                show = _props.show,
                timeRange = _props.timeRange,
                layout = _props.layout,
                dragMode = _props.dragMode,
                regionType = _props.regionType,
                resetViewOnFilter = _props.resetViewOnFilter;
            var prevBaseLayers = prevProps.baseLayers,
                prevBaseLayer = prevProps.baseLayer,
                prevLayers = prevProps.layers,
                prevActiveLayers = prevProps.activeLayers,
                prevData = prevProps.data,
                prevSelected = prevProps.selected,
                prevShow = prevProps.show,
                prevTimeRange = prevProps.timeRange,
                prevLayout = prevProps.layout,
                prevDragMode = prevProps.dragMode,
                prevRegionType = prevProps.regionType;


            var isAreaMap = baseLayers[baseLayer] && baseLayers[baseLayer].images;

            if (!_lodash2.default.isEqual(baseLayers, prevBaseLayers)) {
                log.info('componentDidUpdate::baseLayers changed', prevBaseLayers, baseLayers);
                if (isAreaMap) {
                    this.init();
                    return;
                } else {
                    this.initBaseLayers();
                }
            }

            if (baseLayer !== prevBaseLayer) {
                log.info('componentDidUpdate::baseLayer changed', prevBaseLayer, baseLayer);

                var wasAreaMap = !!this.areaLayer;
                if (isAreaMap || wasAreaMap) {
                    this.init();
                    return;
                }

                if (this.baseLayers[prevBaseLayer]) {
                    this.gis.map.removeLayer(this.baseLayers[prevBaseLayer]);
                }
                this.gis.map.addLayer(this.baseLayers[baseLayer]);
            }

            if (data !== prevData) {
                log.info('componentDidUpdate::data changed', prevData, data);
                this.load(true);
            } else {
                if (show !== prevShow || timeRange !== prevTimeRange) {
                    log.debug('componentDidUpdate::show/time range changed', prevShow, show, prevTimeRange, timeRange);
                    if (!show && !timeRange) {
                        this.gis.showSymbol();
                    } else {
                        this.gis.setGisInterval(timeRange || []);
                        this.gis.filterSymbol(show || function () {
                            return true;
                        }, timeRange);
                    }
                    if (resetViewOnFilter) {
                        this.zoomToFit();
                    }
                }
                if (selected !== prevSelected) {
                    log.info('componentDidUpdate::selected changed', prevSelected, selected);
                    this.gis.setSelection(selected);
                }
            }

            if (layout !== prevLayout) {
                log.info('componentDidUpdate::layout changed', prevLayout, layout);
                this.gis.setLayout(layout);
            }
            if (dragMode !== prevDragMode) {
                log.info('componentDidUpdate::dragMode changed', prevDragMode, dragMode);
                this.gis.setDragMode(dragMode, regionType);
            }
            if (regionType !== prevRegionType) {
                log.info('componentDidUpdate::regionType changed', prevRegionType, regionType);
                this.gis.setRegionType(regionType);
            }
            if (layers !== prevLayers || activeLayers !== prevActiveLayers) {
                log.info('componentDidUpdate::layers changed', { layers: layers, prevLayers: prevLayers, activeLayers: activeLayers, prevActiveLayers: prevActiveLayers });
                var layerIdsToRemove = _lodash2.default.difference(prevActiveLayers, activeLayers);
                _lodash2.default.forEach(layerIdsToRemove, function (layerId) {
                    _this2.removeLayer(layerId);
                });
                _lodash2.default.forEach(activeLayers, function (layerId) {
                    var layer = layers[layerId];
                    var prevLayer = prevLayers[layerId];
                    if (!_lodash2.default.includes(prevActiveLayers, layerId)) {
                        _this2.addLayer(layerId, layer.data);
                    } else if (prevLayer.data !== layer.data) {
                        _this2.removeLayer(layerId);
                        _this2.addLayer(layerId, layer.data);
                    }
                });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.removeMap();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props,
                id = _props2.id,
                title = _props2.title,
                className = _props2.className,
                actions = _props2.actions,
                _props2$download$enab = _props2.download.enabled,
                enableDownload = _props2$download$enab === undefined ? true : _props2$download$enab,
                baseLayers = _props2.baseLayers,
                baseLayer = _props2.baseLayer,
                layers = _props2.layers,
                activeLayers = _props2.activeLayers,
                dragModes = _props2.dragModes,
                dragMode = _props2.dragMode,
                layouts = _props2.layouts,
                layout = _props2.layout,
                regionTypes = _props2.regionTypes,
                regionType = _props2.regionType,
                children = _props2.children;
            var layersPanelOpened = this.state.layersPanelOpened;

            var interactiveLayers = _lodash2.default.pickBy(layers, function (l) {
                return l.interactive !== false;
            });

            return _react2.default.createElement(
                'div',
                { id: id, ref: function ref(_ref8) {
                        _this3.node = _ref8;
                    }, className: (0, _classnames2.default)('c-box c-gis', className) },
                title && _react2.default.createElement(
                    'header',
                    { className: 'c-flex aic' },
                    title
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'actions end c-flex' },
                    layouts.length > 1 && _react2.default.createElement(_reactUi.Dropdown, { required: true, list: layouts.map(function (l) {
                            return { text: lt('layout-types.' + l), value: l };
                        }), value: layout, onChange: this.handleLayoutChange }),
                    dragModes.length > 1 && _react2.default.createElement(_reactUi.ButtonGroup, { list: dragModes.map(function (m) {
                            return { text: lt('drag-modes.' + m), value: m };
                        }), value: dragMode, onChange: this.handleDragModeChange }),
                    dragMode === 'region' && regionTypes.length > 1 && _react2.default.createElement(_reactUi.Dropdown, { required: true, list: regionTypes.map(function (r) {
                            return { text: lt('region-types.' + r), value: r };
                        }), value: regionType, onChange: this.handleRegionTypeChange }),
                    enableDownload && _react2.default.createElement('button', { className: 'standard fg fg-data-download', title: lt('tt-download'), onClick: this.downloadAsImg }),
                    _react2.default.createElement('button', { className: 'standard fg fg-update', title: lt('tt-reset'), onClick: this.zoomToFit }),
                    !_lodash2.default.isEmpty(interactiveLayers) && _react2.default.createElement(
                        'button',
                        { onClick: this.toggleLayers, className: (0, _classnames2.default)('standard layers', { active: layersPanelOpened }) },
                        lt('layers')
                    ),
                    actions
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'content c-fill nopad full' },
                    _react2.default.createElement('div', { ref: function ref(_ref5) {
                            _this3.gisNode = _ref5;
                        } }),
                    _lodash2.default.size(baseLayers) > 1 && _react2.default.createElement(
                        'div',
                        { className: 'base-layers c-box content' },
                        _react2.default.createElement(_reactUi.RadioGroup, {
                            list: _lodash2.default.map(baseLayers, function (_ref6, layerId) {
                                var label = _ref6.label;
                                return { value: layerId, text: label || layerId };
                            }),
                            value: baseLayer,
                            onChange: this.handleBaseLayerChange })
                    ),
                    layersPanelOpened && _react2.default.createElement(
                        'div',
                        { className: 'layers c-box' },
                        _react2.default.createElement(
                            'header',
                            { className: 'c-flex' },
                            lt('layers'),
                            _react2.default.createElement('i', { className: 'c-link fg fg-close end', onClick: this.toggleLayers })
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'content' },
                            _react2.default.createElement(_reactUi.CheckboxGroup, {
                                onChange: this.handleLayersChange,
                                value: activeLayers,
                                list: _lodash2.default.map(interactiveLayers, function (_ref7, layerId) {
                                    var label = _ref7.label;
                                    return { value: layerId, text: label || layerId };
                                }) })
                        )
                    )
                ),
                children
            );
        }
    }]);

    return ReactGis;
}(_react2.default.Component);

ReactGis.propTypes = {
    id: _propTypes2.default.string,
    _ref: _propTypes2.default.func,
    title: _propTypes2.default.node,
    className: _propTypes2.default.string,
    actions: _propTypes2.default.node,
    children: _propTypes2.default.node,
    mapOptions: _propTypes2.default.object,
    truncateLabels: _propTypes2.default.object,
    data: _propTypes2.default.arrayOf(_propTypes2.default.object),
    show: _propTypes2.default.arrayOf(_propTypes2.default.string),
    timeRange: _propTypes2.default.arrayOf(_propTypes2.default.number),
    selected: _propTypes2.default.arrayOf(_propTypes2.default.string),
    baseLayers: _propTypes2.default.objectOf(_propTypes2.default.shape({
        label: _propTypes2.default.string,
        size: _propTypes2.default.shape({ // for area map
            width: _propTypes2.default.number,
            height: _propTypes2.default.number
        }),
        images: _propTypes2.default.arrayOf(_propTypes2.default.shape({
            id: _propTypes2.default.string,
            url: _propTypes2.default.string,
            xy: _propTypes2.default.shape({
                x: _propTypes2.default.number,
                y: _propTypes2.default.number
            }),
            size: _propTypes2.default.shape({
                width: _propTypes2.default.number,
                height: _propTypes2.default.number
            }),
            scale: _propTypes2.default.number,
            opacity: _propTypes2.default.number,
            zoom: _propTypes2.default.number
        })),
        layer: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object, _propTypes2.default.array])
    })),
    baseLayer: _propTypes2.default.string,
    onBaseLayerChange: _propTypes2.default.func,
    baseMap: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object, _propTypes2.default.array]),
    layouts: _propTypes2.default.arrayOf(_propTypes2.default.oneOf(LAYOUTS)),
    layout: _propTypes2.default.oneOf(LAYOUTS),
    onLayoutChange: _propTypes2.default.func,
    dragModes: _propTypes2.default.arrayOf(_propTypes2.default.oneOf(DRAG_MODES)),
    dragMode: _propTypes2.default.oneOf(DRAG_MODES),
    onDragModeChange: _propTypes2.default.func,
    regionTypes: _propTypes2.default.arrayOf(_propTypes2.default.oneOf(REGION_TYPES)),
    regionType: _propTypes2.default.oneOf(REGION_TYPES),
    onRegionTypeChange: _propTypes2.default.func,
    symbolOptions: _propTypes2.default.array,
    trackOptions: _propTypes2.default.array,
    heatmapOptions: _propTypes2.default.object,
    contourOptions: _propTypes2.default.object,
    measureOptions: _propTypes2.default.object,
    clusterOptions: _propTypes2.default.array,
    layers: _propTypes2.default.objectOf(_propTypes2.default.shape({
        label: _propTypes2.default.string,
        interactive: _propTypes2.default.bool,
        data: _propTypes2.default.array
    })),
    activeLayers: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onLayersChange: _propTypes2.default.func,
    resetViewOnFilter: _propTypes2.default.bool,
    scale: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool
    }),
    download: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        afterDownload: _propTypes2.default.func
    }),
    onViewChange: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func,
    onMouseOver: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func,
    onSelectionChange: _propTypes2.default.func
};
ReactGis.defaultProps = {
    mapOptions: {},
    truncateLabels: {},
    data: [],
    selected: [],
    baseLayers: BASE_MAPS,
    layouts: LAYOUTS,
    dragModes: DRAG_MODES,
    regionTypes: REGION_TYPES,
    symbolOptions: [],
    trackOptions: [],
    heatmapOptions: {},
    contourOptions: {},
    measureOptions: {},
    clusterOptions: [],
    layers: {},
    resetViewOnFilter: false,
    scale: {
        enabled: true
    },
    download: {
        enabled: true
    }
};
exports.default = (0, _searchProvider2.default)((0, _localeProvider2.default)((0, _propWire.wireSet)(ReactGis, {
    layout: { defaultValue: function defaultValue(_ref9) {
            var layouts = _ref9.layouts;
            return _lodash2.default.first(layouts || LAYOUTS);
        }, changeHandlerName: 'onLayoutChange' },
    dragMode: { defaultValue: function defaultValue(_ref10) {
            var dragModes = _ref10.dragModes;
            return _lodash2.default.first(dragModes || DRAG_MODES);
        }, changeHandlerName: 'onDragModeChange' },
    regionType: { defaultValue: function defaultValue(_ref11) {
            var regionTypes = _ref11.regionTypes;
            return _lodash2.default.first(regionTypes || REGION_TYPES);
        }, changeHandlerName: 'onRegionTypeChange' },
    baseLayer: { defaultValue: function defaultValue(_ref12) {
            var baseMap = _ref12.baseMap,
                baseLayers = _ref12.baseLayers;
            return baseMap ? null : _lodash2.default.keys(baseLayers || BASE_MAPS)[0];
        }, changeHandlerName: 'onBaseLayerChange' },
    activeLayers: { defaultValue: [], changeHandlerName: 'onLayersChange' },
    selected: { defaultValue: [], changeHandlerName: 'onSelectionChange' }
})), { searchTarget: 'data', filterEntryField: 'data' });