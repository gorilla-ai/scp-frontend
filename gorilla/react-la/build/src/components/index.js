'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LAYOUTS = undefined;

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

var _reactUi = require('react-ui');

var _propWire = require('react-ui/build/src/hoc/prop-wire');

var _searchProvider = require('react-ui/build/src/hoc/search-provider');

var _searchProvider2 = _interopRequireDefault(_searchProvider);

var _download = require('react-ui/build/src/utils/download');

var _i2Exporter = require('../utils/i2-exporter');

var _i2Exporter2 = _interopRequireDefault(_i2Exporter);

var _localeProvider = require('../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-la/components');

var lt = global.laI18n.getFixedT(null, 'la');
var gt = global.laI18n.getFixedT(null, 'global');

var LAYOUTS = exports.LAYOUTS = ['standard', 'hierarchy', 'radial', 'structural', 'lens'];
var NODE_BASED_LAYOUTS = ['radial', 'hierarchy'];
var DOWNLOAD_TYPES = ['i2', 'img'];
var SNA_TYPES = ['same', 'degree', 'closeness', 'betweenness', 'pagerank', 'eigenvector'];
var LA_POPUP_ID = 'c-react-la-popup';

var selectedItemId = null;
var selectedItemOffset = null;

/**
 * A wrapper React LA Component for [la]{@link http://ivs.duckdns.org:10080/web-ui/la/tree/develop} library.
 * @constructor
 * @param {string} [id] - La element #id
 * @param {function} [_ref] - Reference to the underlying component
 * @param {'en'|'zh'} [lng] - lang to use
 * @param {renderable} [title] - La title
 * @param {string} [className] - Classname for the container
 * @param {renderable} [actions] - Self defined actions to be appended to the actions panel
 * @param {string} [assetsPath='/lib/keylines/assets/'] - path to KeyLines assets folder
 * @param {object} [chartOptions] - global chart options to be supplied to [KeyLines]{@link http://172.18.0.166:8191/docs/keylines/API%20Reference.html#ChartOptions}
 * @param {string} [defaultIcon] - default node icon path
 * @param {array.<object>} [items] - array of items to show on chart, see [KeyLines]{@link http://172.18.0.166:8191/docs/keylines/API%20Reference.html#formats_chart}, with additional supported properties for each item:
 * * tooltip - string/function(item)
 * * popup - string/function(item)
 * * contextmenu - array of {id, text} menu items to show when chart item is right-clicked
 * @param {array.<string>} [show] - ids of items to show on chart, if not specified, all items will be shown
 * @param {array.<string>} [defaultSelected] - default ids of items to be selected on chart
 * @param {array.<string>} [selected] - ids of items to be selected on chart
 * @param {function} [onSelectionChange] - Callback function when item is selected/deselected. <br> Required when *selected* prop is supplied
 * @param {string|array.<string>} onSelectionChange.id - selected id(s)
 * @param {object} onSelectionChange.eventInfo - event related info
 * @param {string|array.<string>} onSelectionChange.eventInfo.before - previously selected id(s)
 * @param {array.<'standard'|'hierarchy'|'radial'|'structural'|'lens'>} [layouts=['standard', 'hierarchy', 'radial', 'structural', 'lens']] - list of layouts for the user the choose between
 * @param {'standard'|'hierarchy'|'radial'|'structural'|'lens'} [defaultLayout=first of layouts] - default layout id to show
 * @param {'standard'|'hierarchy'|'radial'|'structural'|'lens'} [layout] - current layout id to show
 * @param {function} [onLayoutChange] - Callback function when layout is changed. <br> Required when *layout* prop is supplied
 * @param {string} onLayoutChange.value - current selected layout id
 * @param {object} onLayoutChange.eventInfo - event related info
 * @param {string} onLayoutChange.eventInfo.before - previous selected layout id
 * @param {array.<'same'|'degree'|'closeness'|'betweenness'|'pagerank'|'eigenvector'>} [snaTypes=['same', 'degree', 'closeness', 'betweenness', 'pagerank', 'eigenvector']] - list of SNA (social network analysis) types for the user the choose between
 * @param {'same'|'degree'|'closeness'|'betweenness'|'pagerank'|'eigenvector'} [defaultSnaType=first of snaTypes] - default SNA type id to show
 * @param {'same'|'degree'|'closeness'|'betweenness'|'pagerank'|'eigenvector'} [snaType] - current SNA type id to show
 * @param {function} [onSnaTypeChange] - Callback function when SNA type is changed. <br> Required when *snaType* prop is supplied
 * @param {string} onSnaTypeChange.value - current selected SNA type id
 * @param {object} onSnaTypeChange.eventInfo - event related info
 * @param {string} onSnaTypeChange.eventInfo.before - previous selected SNA type id
 * @param {array.<object>} [itemOptions] - additional style and behaviour to append to user defined items
 * @param {object} [itemOptions.match] - match properties object, this will decide which items to apply the *props* to
 * @param {object} itemOptions.props - what style and behaviour to apply to the matching items
 * * For a list of available props, see
 * * [KeyLines Node]{@link http://172.18.0.166:8191/docs/keylines/API%20Reference.html#formats_nodes}
 * * [KeyLines Link]{@link http://172.18.0.166:8191/docs/keylines/API%20Reference.html#formats_links}
 * @param {boolean|'standard'|'hierarchy'|'radial'|'structural'|'lens'|'tweak'} [layoutOnItemsChange=true] - layout when items reference is changed?
 * @param {boolean|'standard'|'hierarchy'|'radial'|'structural'|'lens'|'tweak'} [layoutOnFilter=false] - layout when filter is applied (ie *show* is changed)?
 * @param {boolean|'same'|'degree'|'closeness'|'betweenness'|'pagerank'|'eigenvector'} [snaOnFilter=false] - do network analysis when filter is applied (ie *show* is changed)?
 * @param {object} [search] - search settings
 * @param {string} [search.title='Search'] - search title
 * @param {string} [search.applyText='Apply'] - search apply button text
 * @param {object} [search.forms] - search forms config, in key-config pair, each key represents a form id, note when this is absent, search will be disabled
 * @param {object} [search.forms.key] - search config for this **key** form
 * @param {string} [search.forms.key.title] - title/legend for this form
 * @param {object} [search.forms.key.form] - form props supplied to [Form Component]{@link http://172.18.0.166:8095/docs/Form.html}
 * @param {boolean|function} [search.forms.key.filter=true] - filter *data*, by default(true) will filter based on symbol's data attribute and search form data
 * * false to turn off auto filter
 * * filter function which returns true/false for individual items, arguments are (item, formData)
 * @param {array.<array.<string>>} [search.filterGroups] - when present, this will define which forms are grouped together to construct and/or logic when filtering
 * @param {object} [search.value] - Current search parameters in key(form id)-value(form value object) pairs
 * @param {function} [search.onSearch] - Callback function when search is applied. <br> Required when *search.value* prop is supplied
 * @param {object} [download] - Configuration for downloading chart
 * @param {boolean} [download.enabled=true] - allow download?
 * @param {array.<'i2'|'img'>} [download.types=['i2', 'img']] - list of download types for the user the choose between
 * @param {function} [download.afterDownload] - function to call after download
 * @param {object} [download.i2] - i2 download options
 * @param {function} [download.i2.resolveDescription] - function for customizing item(node/link) description when exporting to i2
 * @param {function} [download.i2.resolveIcon] - function for customizing node icon when exporting to i2
 * @param {function} [onReady] - Callback function when chart is initialized and ready
 * @param {function} [onViewChange] - Callback function when chart view is changed, eg. zoom, pan
 * @param {function} [onClick] - Callback function when chart is clicked
 * @param {string|array.<string>} onClick.id - clicked item id(s)
 * @param {object} onClick.eventInfo - event related info
 * @param {number} onClick.eventInfo.x - x coords
 * @param {number} onClick.eventInfo.y - y coords
 * @param {function} [onDoubleClick] - Callback function when chart is double-clicked
 * @param {string|array.<string>} onDoubleClick.id - clicked item id(s)
 * @param {object} onDoubleClick.eventInfo - event related info
 * @param {number} onDoubleClick.eventInfo.x - x coords
 * @param {number} onDoubleClick.eventInfo.y - y coords
 * @param {function} [onMouseOver] - Callback function when chart is hovered
 * @param {string|array.<string>} onMouseOver.id - hovered item id(s)
 * @param {object} onMouseOver.eventInfo - event related info
 * @param {number} onMouseOver.eventInfo.x - x coords
 * @param {number} onMouseOver.eventInfo.y - y coords
 * @param {function} [onContextMenu] - Callback function when chart is right-clicked
 * @param {string|array.<string>} onContextMenu.id - clicked item id(s)
 * @param {object} onContextMenu.eventInfo - event related info
 * @param {number} onContextMenu.eventInfo.x - x coords
 * @param {number} onContextMenu.eventInfo.y - y coords
 * @param {string} onContextMenu.eventInfo.action - triggered action id
 * @param {function} [onDelete] - Callback function when item is deleted
 * @param {array.<string>} onDelete.id - deleted ids
 *
 *
 *
 * @example
// See [basic example]{@link http://ivs.duckdns.org:10080/web-ui/react-la/blob/master/examples/src/basic.js}
// See [advanced example]{@link http://ivs.duckdns.org:10080/web-ui/react-la/blob/master/examples/src/advanced.js}
 */

var ReactLa = function (_React$Component) {
    _inherits(ReactLa, _React$Component);

    function ReactLa() {
        var _ref2;

        var _temp, _this, _ret;

        _classCallCheck(this, ReactLa);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = ReactLa.__proto__ || Object.getPrototypeOf(ReactLa)).call.apply(_ref2, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ReactLa, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            if (!window.KeyLines) {
                log.error('KeyLines not found');
                return;
            }

            var _props = this.props,
                _ref = _props._ref,
                onReady = _props.onReady;

            if (_ref) {
                _ref(this);
            }

            window.addEventListener('resize', this.resize);

            this.init(function () {
                onReady && onReady();
                _this2.load(true);
            });
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var _props2 = this.props,
                items = _props2.items,
                selected = _props2.selected,
                show = _props2.show,
                layout = _props2.layout,
                snaType = _props2.snaType,
                layoutOnItemsChange = _props2.layoutOnItemsChange,
                layoutOnFilter = _props2.layoutOnFilter,
                snaOnFilter = _props2.snaOnFilter;
            var prevItems = prevProps.items,
                prevSelected = prevProps.selected,
                prevShow = prevProps.show,
                prevLayout = prevProps.layout,
                prevSnaType = prevProps.snaType;


            if (!this.la) {
                // chart not ready yet
                return;
            }

            if (items !== prevItems) {
                log.info('componentDidUpdate::items changed', prevItems, items);
                this.load(layoutOnItemsChange);
            } else {
                if (!_lodash2.default.isEqual(show, prevShow)) {
                    log.info('componentDidUpdate::show changed', prevShow, show);
                    this.applyFilter(snaOnFilter, layoutOnFilter, !layoutOnFilter);
                }
                if (!_lodash2.default.isEqual(selected, prevSelected)) {
                    log.info('componentDidUpdate::selected changed', prevSelected, selected);
                    this.la.selection(selected);
                }
                if (layout !== prevLayout) {
                    log.info('componentDidUpdate::layout changed', prevLayout, layout);
                    this.animateLayout(layout);
                }
                if (snaType !== prevSnaType) {
                    log.info('componentDidUpdate::snaType changed', prevSnaType, snaType);
                    this.animateSna(snaType);
                }
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.la.clear();
            _reactUi.Popover.closeId(LA_POPUP_ID);
            window.removeEventListener('resize', this.resize);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props3 = this.props,
                id = _props3.id,
                title = _props3.title,
                className = _props3.className,
                actions = _props3.actions,
                _props3$download$enab = _props3.download.enabled,
                enableDownload = _props3$download$enab === undefined ? true : _props3$download$enab,
                snaTypes = _props3.snaTypes,
                snaType = _props3.snaType,
                layouts = _props3.layouts,
                layout = _props3.layout,
                selected = _props3.selected,
                children = _props3.children;


            return _react2.default.createElement(
                'div',
                { id: id, ref: function ref(_ref5) {
                        _this3.node = _ref5;
                    }, className: (0, _classnames2.default)('c-box c-la', className) },
                title && _react2.default.createElement(
                    'header',
                    { className: 'c-flex aic' },
                    title
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'actions c-flex jcsb' },
                    _react2.default.createElement(
                        'div',
                        { className: 'left' },
                        layouts.length > 1 && _react2.default.createElement(_reactUi.ButtonGroup, {
                            list: layouts.map(function (l) {
                                return { text: lt('layout-types.' + l), value: l };
                            }),
                            disabled: _lodash2.default.isEmpty(selected) ? NODE_BASED_LAYOUTS : false,
                            value: layout,
                            onChange: this.handleLayoutChange })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'right c-flex' },
                        actions,
                        snaTypes.length > 1 && _react2.default.createElement(_reactUi.Dropdown, {
                            required: true,
                            list: snaTypes.map(function (m) {
                                return { text: lt('sna-types.' + m), value: m };
                            }),
                            value: snaType,
                            onChange: this.handleSnaTypeChange }),
                        enableDownload && _react2.default.createElement('button', { className: 'standard fg fg-data-download', title: lt('tt-download'), onClick: this.handleDownload }),
                        _react2.default.createElement('button', { className: 'standard fg fg-update', title: lt('tt-reset'), onClick: function onClick() {
                                _this3.resetView();
                            } })
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'content c-fill nopad full', ref: function ref(_ref4) {
                            _this3.laContainerNode = _ref4;
                        } },
                    _react2.default.createElement('div', { ref: function ref(_ref3) {
                            _this3.laNode = _ref3;
                        } })
                ),
                children
            );
        }
    }]);

    return ReactLa;
}(_react2.default.Component);

ReactLa.propTypes = {
    id: _propTypes2.default.string,
    _ref: _propTypes2.default.func,
    title: _propTypes2.default.node,
    className: _propTypes2.default.string,
    actions: _propTypes2.default.node,
    children: _propTypes2.default.node,
    assetsPath: _propTypes2.default.string,
    chartOptions: _propTypes2.default.object,
    defaultIcon: _propTypes2.default.string,
    items: _propTypes2.default.arrayOf(_propTypes2.default.object),
    show: _propTypes2.default.arrayOf(_propTypes2.default.string),
    selected: _propTypes2.default.arrayOf(_propTypes2.default.string),
    layouts: _propTypes2.default.arrayOf(_propTypes2.default.oneOf(LAYOUTS)),
    layout: _propTypes2.default.oneOf(LAYOUTS),
    onLayoutChange: _propTypes2.default.func,
    snaTypes: _propTypes2.default.arrayOf(_propTypes2.default.oneOf(SNA_TYPES)),
    snaType: _propTypes2.default.oneOf(SNA_TYPES),
    onSnaTypeChange: _propTypes2.default.func,
    itemOptions: _propTypes2.default.array,
    layoutOnItemsChange: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.oneOf([].concat(LAYOUTS, ['tweak']))]),
    layoutOnFilter: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.oneOf([].concat(LAYOUTS, ['tweak']))]),
    snaOnFilter: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.oneOf(SNA_TYPES)]),
    download: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        types: _propTypes2.default.arrayOf(_propTypes2.default.oneOf(DOWNLOAD_TYPES)),
        afterDownload: _propTypes2.default.func,
        i2: _propTypes2.default.shape({
            resolveDescription: _propTypes2.default.func,
            resolveIcon: _propTypes2.default.func
        })
    }),
    onReady: _propTypes2.default.func,
    onViewChange: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func,
    onMouseOver: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func,
    onSelectionChange: _propTypes2.default.func,
    onDelete: _propTypes2.default.func
};
ReactLa.defaultProps = {
    assetsPath: '/lib/keylines/assets/',
    chartOptions: {},
    items: [],
    selected: [],
    layouts: LAYOUTS,
    snaTypes: SNA_TYPES,
    itemOptions: [],
    layoutOnItemsChange: true,
    layoutOnFilter: false,
    snaOnFilter: false,
    download: {
        enabled: true
    }
};

var _initialiseProps = function _initialiseProps() {
    var _this4 = this;

    this.init = function (onDone) {
        var chartOptions = _this4.props.chartOptions;


        var g = window.KeyLines;
        var assetsPath = _this4.props.assetsPath;


        g.paths({
            assets: assetsPath
        });

        log.info('creating instance of LA module', _this4.laNode);

        g.create({
            element: _this4.laNode,
            type: 'chart',
            options: _extends({
                handMode: true,
                selfLinks: true,
                truncateLabels: {
                    minZoom: 0.01,
                    maxLength: 20
                }
            }, chartOptions)
        }, function (err, la) {
            _this4.la = la;
            log.info('la chart created', la);
            _this4.setupLaEvents();
            onDone && onDone();
        });
    };

    this.setupLaEvents = function () {
        var _props4 = _this4.props,
            onViewChange = _props4.onViewChange,
            onClick = _props4.onClick,
            onDoubleClick = _props4.onDoubleClick,
            onMouseOver = _props4.onMouseOver,
            onContextMenu = _props4.onContextMenu,
            onSelectionChange = _props4.onSelectionChange,
            onDelete = _props4.onDelete;


        var la = _this4.la;

        la.bind('hover', function (id, x, y) {
            if (selectedItemId) {
                return;
            }
            if (id && !_reactUi.Contextmenu.isOpen()) {
                var item = la.getItem(id);
                if (item.tooltip) {
                    var bb = _this4.getBoundingBox();
                    _this4.drawPopup({ x: x + (bb.x || bb.left), y: y + (bb.y || bb.top) }, _react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: item.tooltip } }));
                    return;
                }
            }

            _reactUi.Popover.closeId(LA_POPUP_ID);
        });

        la.bind('click', function (id, x, y) {
            if (id) {
                var item = la.getItem(id);
                if (item.popup) {
                    selectedItemId = id;
                    var bb = _this4.getBoundingBox();
                    _this4.drawPopup({ x: x + (bb.x || bb.left), y: y + (bb.y || bb.top) }, _react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: item.popup } }));
                    return;
                }
            }

            selectedItemId = null;
            _reactUi.Popover.closeId(LA_POPUP_ID);
        });

        // handle popup repositioning when node is dragged
        la.bind('dragstart', function (type, id, x, y) {
            if (id) {
                var item = la.getItem(id);
                if (item.popup) {
                    selectedItemId = id;

                    var _la$labelPosition = la.labelPosition(id),
                        x1 = _la$labelPosition.x1,
                        x2 = _la$labelPosition.x2,
                        y1 = _la$labelPosition.y1,
                        y2 = _la$labelPosition.y2;

                    selectedItemOffset = {
                        left: x1 - x,
                        right: x2 - x,
                        top: y1 - y,
                        bottom: y2 - y
                    };
                    window.addEventListener('mousemove', _this4.handleItemDrag);
                }
            }
        });
        la.bind('dragend', function () {
            window.removeEventListener('mousemove', _this4.handleItemDrag);
        });

        if (onContextMenu) {
            la.bind('contextmenu', function (id, x, y) {
                if (id) {
                    var item = la.getItem(id);
                    if (item.contextmenu) {
                        var bb = _this4.getBoundingBox();
                        _reactUi.Popover.closeId(LA_POPUP_ID);
                        _reactUi.Contextmenu.open({ pageX: x + (bb.x || bb.left) + 5, pageY: y + (bb.y || bb.top) + 5 }, _lodash2.default.map(item.contextmenu, function (menuItem) {
                            return _extends({}, menuItem, {
                                action: function action() {
                                    onContextMenu(id, { x: x, y: y, action: menuItem.id });
                                }
                            });
                        }));
                        return;
                    }
                }
                _reactUi.Contextmenu.close();

                onContextMenu(id, { x: x, y: y });
            });
        }

        if (onViewChange) {
            la.bind('viewchange', onViewChange);
        }

        if (onClick) {
            la.bind('click', function (id) {
                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = arguments[_key2];
                }

                var x = args[0],
                    y = args[1];

                onClick(id, { x: x, y: y });
            });
        }
        if (onDoubleClick) {
            la.bind('dblclick', function (id) {
                for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                    args[_key3 - 1] = arguments[_key3];
                }

                var x = args[0],
                    y = args[1];

                onDoubleClick(id, { x: x, y: y });
            });
        }
        if (onMouseOver) {
            la.bind('hover', function (id) {
                for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                    args[_key4 - 1] = arguments[_key4];
                }

                var x = args[0],
                    y = args[1];

                onMouseOver(id, { x: x, y: y });
            });
        }
        if (onSelectionChange) {
            la.bind('selectionchange', function () {
                var selected = la.selection();
                var prevSelected = _this4.props.selected;

                if (selected.length <= 0 && prevSelected.length <= 0) {
                    //keylines fires selectionchange when before=unselected & after=unselected
                    //prevent propagation of this event
                    return;
                }
                onSelectionChange(selected);
            });
        }
        if (onDelete) {
            la.bind('delete', function () {
                var selected = la.selection();
                onDelete(selected);
                return true;
            });
        }
    };

    this.handleItemDrag = function (evt) {
        if (selectedItemId) {
            var item = _this4.la.getItem(selectedItemId);
            _this4.drawPopup({
                left: evt.pageX + selectedItemOffset.left,
                right: evt.pageX + selectedItemOffset.right,
                top: evt.pageY + selectedItemOffset.top,
                bottom: evt.pageY + selectedItemOffset.bottom
            }, _react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: item.popup } }));
        }
    };

    this.drawPopup = function (location, content) {
        if (content) {
            _reactUi.Popover.openId(LA_POPUP_ID, location, _react2.default.createElement(
                'div',
                null,
                content
            ), {
                //draggable: true,
                pointy: true,
                boundBy: _this4.laContainerNode,
                className: ''
            });
        }
    };

    this.resetView = function (onDone) {
        var layout = _this4.props.layout;

        _this4.animateLayout(layout, null, onDone);
    };

    this.load = function (layout) {
        var _props5 = _this4.props,
            defaultIcon = _props5.defaultIcon,
            items = _props5.items,
            itemOptions = _props5.itemOptions,
            selected = _props5.selected,
            snaType = _props5.snaType,
            show = _props5.show;

        log.info('load::start');
        var la = _this4.la;

        var curChartItems = _this4.getChartItems();
        var curChartItemIds = _lodash2.default.map(curChartItems, 'id');
        var curChartNodeIds = (0, _lodash2.default)(curChartItems).filter({ type: 'node' }).map('id').value();

        _reactUi.Progress.startSpin();
        setTimeout(function () {
            var itemsToCreate = (0, _lodash2.default)(items).map(function (item) {
                var matchedOptions = _lodash2.default.reduce(itemOptions, function (acc, opt) {
                    var match = opt.match,
                        props = opt.props;


                    if (_lodash2.default.isFunction(match)) {
                        if (!match(item)) {
                            return acc;
                        }
                    } else if (!_lodash2.default.isMatch(item, match)) {
                        return acc;
                    }

                    return _extends({}, acc, props);
                }, {});

                var computedProps = {};
                if (!_lodash2.default.isEmpty(matchedOptions)) {
                    computedProps = _lodash2.default.mapValues(matchedOptions, function (v) {
                        if (_lodash2.default.isFunction(v)) {
                            return v(item);
                        }
                        return v;
                    });
                }

                var defaultProps = item.type === 'node' ? { u: defaultIcon } : {};
                return _extends({}, defaultProps, computedProps, item, {
                    hi: show != null && !_lodash2.default.includes(show, item.id)
                });
            }).value();

            var newChartNodeIds = (0, _lodash2.default)(itemsToCreate).filter({ type: 'node' }).map('id').value();
            var idsToRemove = _lodash2.default.difference(curChartItemIds, newChartNodeIds);
            var positionsToKeep = _lodash2.default.intersection(newChartNodeIds, curChartNodeIds);
            la.removeItem(idsToRemove);
            la.merge(itemsToCreate, function () {
                if (!_lodash2.default.isEmpty(selected)) {
                    la.selection(selected);
                }

                if (show) {
                    // even hi is set in items, still need to call applyFilter again
                    // since we want to show links attached to nodes when show contains only nodes
                    _this4.applyFilter(true, layout, positionsToKeep);
                } else {
                    _this4.animateSna(snaType, layout, positionsToKeep);
                }

                log.info('load::done');
                _reactUi.Progress.done();
            });
        });
    };

    this.handleLayoutChange = function (layout) {
        var onLayoutChange = _this4.props.onLayoutChange;

        onLayoutChange(layout);
    };

    this.handleSnaTypeChange = function (snaType) {
        var onSnaTypeChange = _this4.props.onSnaTypeChange;

        onSnaTypeChange(snaType);
    };

    this.getChartItems = function () {
        return _this4.la.serialize().items;
    };

    this.getBoundingBox = function () {
        return _this4.laContainerNode.getBoundingClientRect();
    };

    this.handleDownload = function () {
        var _props$download$types = _this4.props.download.types,
            downloadTypes = _props$download$types === undefined ? DOWNLOAD_TYPES : _props$download$types;

        var downloadType = _lodash2.default.first(downloadTypes);

        if (downloadTypes.length > 1) {
            _reactUi.PopupDialog.prompt({
                title: lt('dlg-download'),
                display: _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(_reactUi.RadioGroup, {
                        list: _lodash2.default.map(downloadTypes, function (option) {
                            return { text: lt('download-types.' + option), value: option };
                        }),
                        onChange: function onChange(type) {
                            downloadType = type;
                        },
                        defaultValue: downloadType })
                ),
                cancelText: gt('btn-cancel'),
                confirmText: gt('btn-confirm'),
                act: function act(confirmed) {
                    if (confirmed) {
                        _this4.download(downloadType);
                    }
                }
            });
        } else {
            _this4.download(downloadType);
        }
    };

    this.download = function (type) {
        if (type === 'i2') {
            _this4.downloadAsI2();
        } else {
            _this4.downloadAsImg();
        }
    };

    this.downloadAsI2 = function () {
        var _props$download = _this4.props.download,
            afterDownload = _props$download.afterDownload,
            resolveDescription = _props$download.resolveDescription,
            resolveIcon = _props$download.resolveIcon;

        var filename = 'la_' + (0, _moment2.default)().format('YYYY-MM-DD-HH-mm');
        var items = _this4.getChartItems();

        var xml = (0, _i2Exporter2.default)(items, { resolveDescription: resolveDescription, resolveIcon: resolveIcon });
        (0, _download.downloadDataUrl)('data:text/plain;charset=utf-8,' + encodeURIComponent(xml), filename, 'xml');
        afterDownload && afterDownload({ type: 'i2', filename: filename });
    };

    this.downloadAsImg = function () {
        var afterDownload = _this4.props.download.afterDownload;

        var filename = 'la_' + (0, _moment2.default)().format('YYYY-MM-DD-HH-mm');

        _this4.la.toDataURL(2000, 2000, { fit: 'oneToOne' }, function (dataUrl) {
            (0, _download.downloadDataUrl)(dataUrl, filename, 'jpg');
            afterDownload && afterDownload({ type: 'image', filename: filename });
        });
    };

    this.resize = function () {
        var laBb = _this4.getBoundingBox();
        window.KeyLines.setSize(_this4.laNode, laBb.width, laBb.height);
        _this4.animateLayout('tweak');
    };

    this.applyFilter = function (sna, layout, nodeIdsToFix, onDone) {
        var show = _this4.props.show;


        if (_lodash2.default.isEmpty(show)) {
            // applies when show=null (ie show all) or none
            _this4.animateFilter(show, sna, layout, nodeIdsToFix, {}, onDone);
        } else {
            var itemsToShow = _this4.la.getItem(show);
            var filterNodes = false;
            var filterLinks = false;
            _lodash2.default.some(itemsToShow, function (_ref8) {
                var type = _ref8.type;

                if (type === 'node') {
                    filterNodes = true;
                } else {
                    filterLinks = true;
                }
                if (filterNodes && filterLinks) {
                    // exit early to prevent unnecessary checks
                    return true;
                }
                return false;
            });
            _this4.animateFilter(show, sna, layout, nodeIdsToFix, {
                hideSingletons: false,
                type: filterNodes && filterLinks ? 'all' : filterNodes ? 'node' : 'link'
            }, onDone);
        }
    };

    this.animateFilter = function (nodeIdsToShow) {
        var sna = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var layout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        var nodeIdsToFix = arguments[3];
        var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
        var onDone = arguments[5];

        log.info('animateFilter::start', nodeIdsToShow, nodeIdsToFix, options);
        var filterFn = void 0;
        if (nodeIdsToShow == null) {
            filterFn = function filterFn() {
                return true;
            };
        } else {
            filterFn = function filterFn(item) {
                return _lodash2.default.includes(nodeIdsToShow, item.id);
            };
        }
        _this4.la.filter(filterFn, _extends({ animate: false }, options), function () {
            if (sna) {
                _this4.animateSna(_lodash2.default.isString(sna) ? sna : _this4.props.snaType, layout, nodeIdsToFix, onDone);
            } else {
                if (layout) {
                    _this4.animateLayout(_lodash2.default.isString(layout) ? layout : _this4.props.layout, nodeIdsToFix, onDone);
                } else {
                    onDone && onDone();
                }
            }
        });
    };

    this.animateLayout = function (newLayout, nodeIdsToFix, onDone) {
        log.info('animateLayout::start', { newLayout: newLayout, nodeIdsToFix: nodeIdsToFix });
        var selected = _this4.props.selected;

        var la = _this4.la;
        var options = { fit: true, fixed: nodeIdsToFix, animate: true, tidy: true };

        if (_lodash2.default.includes(NODE_BASED_LAYOUTS, newLayout)) {
            var top = [];
            _lodash2.default.forEach(selected, function (s) {
                var item = la.getItem(s);
                if (item.type === 'node') {
                    top.push(s);
                }
            });
            options = _extends({}, options, { flatten: true, top: top });
        }
        la.layout(newLayout, options, onDone);
    };

    this.animateSna = function (newSnaType) {
        var layout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var nodeIdsToFix = arguments[2];
        var onDone = arguments[3];

        log.info('animateSna::start', { newSnaType: newSnaType, nodeIdsToFix: nodeIdsToFix, layout: layout });
        var la = _this4.la;
        var fn = la.graph()[{ degree: 'degrees', eigenvector: 'eigenCentrality', pagerank: 'pageRank' }[newSnaType] || newSnaType];

        if (newSnaType !== 'same' && !fn) {
            log.error('sna::analysis type \'' + newSnaType + '\' unavailable');
            return;
        }

        var wrappedFn = fn;
        if (newSnaType === 'same') {
            var sizes = {};
            la.each({ type: 'node' }, function (node) {
                sizes[node.id] = 0;
            });
            wrappedFn = function wrappedFn(options, cb) {
                cb(sizes);
            };
        } else if (_lodash2.default.includes(['degree', 'pagerank', 'eigenvector'], newSnaType)) {
            wrappedFn = function wrappedFn(options, cb) {
                cb(fn(options));
            };
        }

        wrappedFn({}, function (nodeSizes) {
            var sizes = _lodash2.default.values(nodeSizes);
            var maxSize = Math.max.apply(Math, _toConsumableArray(sizes));
            var minSize = Math.min.apply(Math, _toConsumableArray(sizes));
            var props = _lodash2.default.map(nodeSizes, function (v, k) {
                var normalizedSize = maxSize === minSize ? minSize : (v - minSize) / (maxSize - minSize);
                /*let color = undefined
                if (normalizedSize < 0.25) {
                    color = 'rgb(254, 217, 118)'
                }
                else if (normalizedSize < 0.5) {
                    color = 'rgb(253, 141, 60)'
                }
                else if (normalizedSize < 0.75) {
                    color = 'rgb(252, 78, 42)'
                }
                else {
                    color = 'rgb(177, 0, 38)'
                }*/
                return {
                    id: k,
                    e: normalizedSize * 6 + 1 /*,
                                              c: color*/
                };
            });
            la.animateProperties(props, { animate: !layout }, function () {
                if (layout) {
                    _this4.animateLayout(_lodash2.default.isString(layout) ? layout : _this4.props.layout, nodeIdsToFix, onDone);
                } else {
                    onDone && onDone();
                }
            });
        });
    };
};

exports.default = (0, _searchProvider2.default)((0, _localeProvider2.default)((0, _propWire.wireSet)(ReactLa, {
    layout: { defaultValue: function defaultValue(_ref6) {
            var layouts = _ref6.layouts;
            return _lodash2.default.first(layouts || LAYOUTS);
        }, changeHandlerName: 'onLayoutChange' },
    snaType: { defaultValue: function defaultValue(_ref7) {
            var snaTypes = _ref7.snaTypes;
            return _lodash2.default.first(snaTypes || SNA_TYPES);
        }, changeHandlerName: 'onSnaTypeChange' },
    selected: { defaultValue: [], changeHandlerName: 'onSelectionChange' }
})), {
    searchTarget: 'items',
    filterEntryField: 'd',
    defaultTitle: function defaultTitle() {
        return lt('search.title');
    },
    defaultApplyText: function defaultApplyText() {
        return lt('search.btn-apply');
    } });