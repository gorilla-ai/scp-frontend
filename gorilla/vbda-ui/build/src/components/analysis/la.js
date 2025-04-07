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

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _reactUi = require('react-ui');

var _reactLa = require('react-la');

var _reactLa2 = _interopRequireDefault(_reactLa);

var _timeline = require('react-la/build/src/components/timeline');

var _timeline2 = _interopRequireDefault(_timeline);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _link = require('./link');

var _link2 = _interopRequireDefault(_link);

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _localeProvider = require('../../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var log = require('loglevel').getLogger('vbda/components/analysis/la');

var lt = global.vbdaI18n.getFixedT(null, 'analysis');
var gt = global.vbdaI18n.getFixedT(null, 'vbda');

var VIEW_SOURCE_BUTTON_ID = 'g-vbda-la-source-btn';

function getNodeLabel(_ref, labels) {
    var id = _ref.id,
        nodeTypes = _ref.names,
        nodeLabelIds = _ref.labels;

    if (nodeLabelIds && nodeLabelIds.length > 0) {
        return _lodash2.default.map(nodeLabelIds, function (nodeLabelId) {
            var label = labels[nodeLabelId];
            if (!label.type) {
                // no label
                return '';
            }
            if (label.localId.indexOf('@@') === 0) {
                // label but no unique id
                return label.typeReadable;
            }
            return label.localId + ' (' + label.typeReadable + ')';
        }).join(', ');
    }
    return ''; //`${nodeTypes.join(',')} ${id}`
}

function visualizeGraphItem(cfgs, labels, labelsCfg, item) {
    var id = item.id,
        type = item.type,
        id1 = item.id1,
        id2 = item.id2,
        a1 = item.a1,
        a2 = item.a2,
        d = _objectWithoutProperties(item, ['id', 'type', 'id1', 'id2', 'a1', 'a2']);

    // prepend cfgs with base cfg


    if (item.type === 'node') {
        var labelTypes = (0, _lodash2.default)(labels).pick(item.labels).map('type').compact().value();
        var labelText = getNodeLabel(item, labels);
        var defaultNodeCfg = {
            c: '#aaaaaa',
            popup: _server2.default.renderToStaticMarkup(_react2.default.createElement(_node2.default, { nodeData: item, labelData: _lodash2.default.pick(labels, item.labels), contentClassName: 'inline' })),
            t: labelText,
            enableViewEvents: false
        };

        if (!_lodash2.default.isEmpty(labelTypes)) {
            defaultNodeCfg.u = _lodash2.default.get(labelsCfg, [_lodash2.default.first(labelTypes), 'icon_url']);
        }

        cfgs = [defaultNodeCfg].concat(_toConsumableArray(cfgs));
    } else {
        cfgs = [{
            popup: _server2.default.renderToStaticMarkup(_react2.default.createElement(_link2.default, { data: item.propsHistory })),
            dt: _lodash2.default.map(item.ts, function (t) {
                return (0, _moment2.default)(t).valueOf();
            })
        }].concat(_toConsumableArray(cfgs));
    }

    // get props as render source

    var props = d.props,
        propsHistory = d.propsHistory,
        labelIds = d.labels,
        metadata = _objectWithoutProperties(d, ['props', 'propsHistory', 'labels']);

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

    var result = _lodash2.default.merge.apply(_lodash2.default, [type === 'node' ? { id: id, type: type, d: d } : { id: id, type: type, id1: id1, id2: id2, a1: a1, a2: a2, d: d }].concat(_toConsumableArray(allVis)));

    if (result.enableViewEvents) {
        result.popup = '<div>\n            ' + result.popup + '\n            <button id=' + VIEW_SOURCE_BUTTON_ID + ' value=' + item.events.join(',') + '>' + lt('btn-view-source') + '</button>\n        </div>';
    }

    delete result.enableViewEvents;
    return result;
}

function generateGraph(_ref2) {
    var _ref2$source = _ref2.source,
        source = _ref2$source === undefined ? {} : _ref2$source,
        _ref2$labelsCfg = _ref2.labelsCfg,
        labelsCfg = _ref2$labelsCfg === undefined ? {} : _ref2$labelsCfg,
        _ref2$sourceItemOptio = _ref2.sourceItemOptions,
        sourceItemOptions = _ref2$sourceItemOptio === undefined ? [] : _ref2$sourceItemOptio;
    var _source$nodes = source.nodes,
        nodes = _source$nodes === undefined ? {} : _source$nodes,
        _source$links = source.links,
        links = _source$links === undefined ? {} : _source$links,
        _source$labels = source.labels,
        labels = _source$labels === undefined ? {} : _source$labels;


    return _lodash2.default.map([].concat(_toConsumableArray(_lodash2.default.values(nodes)), _toConsumableArray(_lodash2.default.values(links))), function (item) {
        var matchedProfiles = _lodash2.default.filter(sourceItemOptions, function (_ref3) {
            var type = _ref3.type,
                match = _ref3.match;

            if (type && item.type !== type) {
                return false;
            }
            if (_lodash2.default.isFunction(match)) {
                return match(item, labels);
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

var LaAnalysis = function (_React$Component) {
    _inherits(LaAnalysis, _React$Component);

    function LaAnalysis(props, context) {
        _classCallCheck(this, LaAnalysis);

        var _this = _possibleConstructorReturn(this, (LaAnalysis.__proto__ || Object.getPrototypeOf(LaAnalysis)).call(this, props, context));

        _initialiseProps.call(_this);

        var _props$sourceCfg$labe = props.sourceCfg.labels,
            labelsCfg = _props$sourceCfg$labe === undefined ? {} : _props$sourceCfg$labe,
            sourceItemOptions = props.sourceItemOptions,
            source = props.source,
            selected = props.selected,
            show = props.show;

        var data = generateGraph({ source: source, labelsCfg: labelsCfg, sourceItemOptions: sourceItemOptions });

        _this.state = {
            data: data,
            show: _this.labelIdsToItemIds(data, show),
            selected: _this.labelIdsToItemIds(data, selected)
        };
        return _this;
    }

    _createClass(LaAnalysis, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            (0, _jquery2.default)('body').on('click', 'button#' + VIEW_SOURCE_BUTTON_ID, function (evt) {
                _this2.showEvents(evt.target.value.split(','));
            });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _nextProps$sourceCfg$ = nextProps.sourceCfg.labels,
                labelsCfg = _nextProps$sourceCfg$ === undefined ? {} : _nextProps$sourceCfg$,
                sourceItemOptions = nextProps.sourceItemOptions,
                source = nextProps.source,
                selected = nextProps.selected,
                show = nextProps.show;
            var _props = this.props,
                prevSource = _props.source,
                prevSelected = _props.selected,
                prevShow = _props.show;


            var stateToUpdate = {};

            if (source !== prevSource) {
                log.info('componentWillReceiveProps::source changed', { prevSource: prevSource, source: source });
                stateToUpdate.data = generateGraph({ source: source, labelsCfg: labelsCfg, sourceItemOptions: sourceItemOptions });
            }

            if (show !== prevShow) {
                log.info('componentWillReceiveProps::show changed', { prevShow: prevShow, show: show });
                stateToUpdate.show = this.labelIdsToItemIds(stateToUpdate.data || this.state.data, show);
            }
            if (selected !== prevSelected) {
                log.info('componentWillReceiveProps::selected changed', { prevSelected: prevSelected, selected: selected });
                stateToUpdate.selected = this.labelIdsToItemIds(stateToUpdate.data || this.state.data, selected);
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
            var _this3 = this;

            var _props2 = this.props,
                className = _props2.className,
                _props2$timebar = _props2.timebar;
            _props2$timebar = _props2$timebar === undefined ? {} : _props2$timebar;
            var enableTimebar = _props2$timebar.enabled;
            var _state = this.state,
                data = _state.data,
                show = _state.show,
                selected = _state.selected;


            var propsToPass = _lodash2.default.omit(this.props, ['events', 'source', 'sourceCfg', 'sourceItemOptions']);
            var defaultProps = enableTimebar ? { showStatic: true, layoutOnPlay: 'tweak', layoutOnFilter: true } : {};
            var La = enableTimebar ? _timeline2.default : _reactLa2.default;

            return _react2.default.createElement(La, _extends({}, defaultProps, propsToPass, {
                ref: function ref(_ref4) {
                    _this3.containerNode = _ref4;
                }
                //layoutOnFilter
                //snaOnFilter
                , className: (0, _classnames2.default)('grow c-vbda-analysis-la', className),
                items: data,
                show: show,
                selected: selected,
                onSelectionChange: this.handleSelectionChange }));
        }
    }]);

    return LaAnalysis;
}(_react2.default.Component);

LaAnalysis.propTypes = {
    className: _propTypes2.default.string,
    events: _propTypes2.default.object,
    source: _propTypes2.default.shape({
        labels: _propTypes2.default.objectOf(_propTypes2.default.shape({
            nodeId: _propTypes2.default.string,
            props: _propTypes2.default.object
        })),
        nodes: _propTypes2.default.object,
        links: _propTypes2.default.object
    }),
    sourceCfg: _propTypes2.default.shape({
        dt: _propTypes2.default.object
    }).isRequired,
    sourceItemOptions: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        type: _propTypes2.default.oneOf(['node', 'link']),
        match: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.object]),
        props: _propTypes2.default.object
    })),
    show: _propTypes2.default.arrayOf(_propTypes2.default.string),
    selected: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onSelectionChange: _propTypes2.default.func,
    hideSingletons: _propTypes2.default.bool
};
LaAnalysis.defaultProps = {
    events: {},
    source: {},
    sourceCfg: {},
    sourceItemOptions: []
};

var _initialiseProps = function _initialiseProps() {
    var _this4 = this;

    this.labelIdsToItemIds = function (data, labelIds) {
        if (!labelIds) {
            return null;
        }
        return (0, _lodash2.default)(data).filter(function (item) {
            return item.type === 'node' && _lodash2.default.intersection(labelIds, item.d.labels).length > 0;
        }).map('id').value();
    };

    this.handleSelectionChange = function (selected, eventInfo) {
        var onSelectionChange = _this4.props.onSelectionChange;

        if (!onSelectionChange) {
            _this4.setState({ selected: selected });
        } else {
            onSelectionChange(selected, eventInfo);
        }
    };

    this.showEvents = function (eventIds) {
        var _props3 = _this4.props,
            events = _props3.events,
            eventsCfg = _props3.sourceCfg;

        var nodeEvents = _lodash2.default.pick(events, eventIds);
        _reactUi.PopupDialog.alertId('g-vbda-la-source-container', {
            title: lt('hdr-source'),
            display: _react2.default.createElement(_events2.default, {
                events: nodeEvents,
                eventsCfg: eventsCfg }),
            confirmText: gt('btn-close')
        });
    };

    this.resize = function () {
        var _props$timebar = _this4.props.timebar;
        _props$timebar = _props$timebar === undefined ? {} : _props$timebar;
        var enableTimebar = _props$timebar.enabled;

        if (enableTimebar) {
            _this4.containerNode.resize();
        } else {
            _this4.containerNode._component._component._component._component.resize();
        }
    };
};

exports.default = (0, _localeProvider2.default)(LaAnalysis);