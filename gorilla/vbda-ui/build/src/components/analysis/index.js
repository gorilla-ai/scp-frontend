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

var _reactUi = require('react-ui');

var _download = require('react-ui/build/src/utils/download');

var _gis = require('./gis');

var _gis2 = _interopRequireDefault(_gis);

var _la = require('./la');

var _la2 = _interopRequireDefault(_la);

var _labels = require('./labels');

var _labels2 = _interopRequireDefault(_labels);

var _analyzer = require('../../analyzer');

var _labels3 = require('../../exporter/labels');

var _labels4 = _interopRequireDefault(_labels3);

var _localeProvider = require('../../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/components/analysis');

var lt = global.vbdaI18n.getFixedT(null, 'analysis');
var gt = global.vbdaI18n.getFixedT(null, 'vbda');

var Analysis = function (_React$Component) {
    _inherits(Analysis, _React$Component);

    function Analysis() {
        var _ref2;

        var _temp, _this, _ret;

        _classCallCheck(this, Analysis);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Analysis.__proto__ || Object.getPrototypeOf(Analysis)).call.apply(_ref2, [this].concat(args))), _this), _this.state = {
            laSource: {},
            gisSource: {},
            selectedLabels: [],
            chartedLabels: [],
            currentLabels: [],
            fullscreen: ''
        }, _this.analyzeSource = function (events, eventsCfg) {
            var laOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var gisOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var _this$props$gis$enabl = _this.props.gis.enabled,
                enableGis = _this$props$gis$enabl === undefined ? true : _this$props$gis$enabl;


            log.info('analyzeSource::start', events);
            _reactUi.Progress.startSpin();
            var laSource = (0, _analyzer.analyze)(events, eventsCfg, _extends({}, laOptions, { analyzeGis: enableGis }));
            var gisSource = !enableGis ? {} : (0, _analyzer.analyzeLabels)(events, eventsCfg, _extends({}, gisOptions, {
                filter: function filter(item) {
                    return !_lodash2.default.isEmpty(item.locations) || !_lodash2.default.isEmpty(item.track);
                }
            }));
            var result = {
                laSource: laSource,
                gisSource: gisSource
            };
            _reactUi.Progress.done();
            log.info('analyzeSource::done', result);
            return result;
        }, _this.handleLabelSelectionChange = function (selectedLabels) {
            _this.setState({ selectedLabels: selectedLabels });
        }, _this.handleLabelClick = function (labelId) {
            var labels = _this.state.laSource.labels;

            var nodeId = labels[labelId].nodeId;
            log.info('handleLabelClick', labelId, nodeId);

            _this.setState({ currentLabels: [labelId] });
        }, _this.handleDelete = function (itemIds) {
            var nodes = _this.state.laSource.nodes;

            var labelIds = (0, _lodash2.default)(itemIds).map(function (itemId) {
                return _lodash2.default.get(nodes, [itemId, 'labels'], []);
            }).flatten().uniq().value();
            _this.toggleLabels(labelIds, false);
        }, _this.toggleLabels = function (labelIds, on) {
            var selectedLabels = _this.state.selectedLabels;

            var newSelectedLabels = on ? _lodash2.default.uniq([].concat(_toConsumableArray(selectedLabels), _toConsumableArray(labelIds))) : _lodash2.default.without.apply(_lodash2.default, [selectedLabels].concat(_toConsumableArray(labelIds)));
            _this.setState({
                selectedLabels: newSelectedLabels,
                chartedLabels: newSelectedLabels
            });
        }, _this.toggleFullscreen = function (panel) {
            _this.setState({ fullscreen: panel }, function () {
                _this.laAnalysis._component.resize();
                _this.gisAnalysis._component.resize();
            });
        }, _this.applySelection = function () {
            _this.analysisInitiated = true;
            var selectedLabels = _this.state.selectedLabels;

            _this.setState({ chartedLabels: selectedLabels });
        }, _this.clearAnalysis = function () {
            _this.setState({
                chartedLabels: []
            });
        }, _this.downloadIntelSource = function () {
            var _this$props = _this.props,
                afterDownload = _this$props.labels.afterDownload,
                events = _this$props.events,
                eventsCfg = _this$props.eventsCfg;
            var _this$state$laSource = _this.state.laSource,
                nodes = _this$state$laSource.nodes,
                labels = _this$state$laSource.labels;
            //downloadFile(JSON.stringify(events), 'intel', 'json')

            var csv = (0, _labels4.default)({ events: events, nodes: nodes, labels: labels }, eventsCfg, { labelOthers: lt('label-types.others') });
            (0, _download.downloadDataUrl)('data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csv), 'intel', 'csv');
            afterDownload && afterDownload();
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Analysis, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var _props = this.props,
                _ref = _props._ref,
                events = _props.events,
                eventsCfg = _props.eventsCfg,
                analyzeOptions = _props.analyzeOptions;


            setTimeout(function () {
                var source = _this2.analyzeSource(events, eventsCfg, analyzeOptions);
                _this2.setState(_extends({}, source, {
                    selectedLabels: _lodash2.default.keys(source.laSource.labels)
                }));
            }, 0);

            if (_ref) {
                _ref(this);
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var events = nextProps.events,
                eventsCfg = nextProps.eventsCfg,
                analyzeOptions = nextProps.analyzeOptions,
                keepStateOnEventsChange = nextProps.keepStateOnEventsChange;
            var prevEvents = this.props.events;
            var _state = this.state,
                selectedLabels = _state.selectedLabels,
                chartedLabels = _state.chartedLabels,
                laSource = _state.laSource;

            if (events !== prevEvents) {
                log.info('componentWillReceiveProps::events changed', prevEvents, events);
                var source = this.analyzeSource(events, eventsCfg, analyzeOptions);

                var appendedLabels = _lodash2.default.difference(_lodash2.default.keys(source.laSource.labels), _lodash2.default.keys(laSource.labels));
                var newSelectedLabels = [].concat(_toConsumableArray(selectedLabels), _toConsumableArray(appendedLabels));

                this.setState(_extends({}, source, {
                    selectedLabels: keepStateOnEventsChange && this.analysisInitiated ? newSelectedLabels : _lodash2.default.keys(source.laSource.labels),
                    chartedLabels: keepStateOnEventsChange && this.analysisInitiated ? newSelectedLabels : []
                }));
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props,
                id = _props2.id,
                className = _props2.className,
                events = _props2.events,
                eventsCfg = _props2.eventsCfg,
                lng = _props2.lng,
                labelsCfg = _props2.labels,
                _props2$la = _props2.la,
                _props2$la$enabled = _props2$la.enabled,
                enableLa = _props2$la$enabled === undefined ? true : _props2$la$enabled,
                laCfg = _objectWithoutProperties(_props2$la, ['enabled']),
                _props2$gis = _props2.gis,
                _props2$gis$enabled = _props2$gis.enabled,
                enableGis = _props2$gis$enabled === undefined ? true : _props2$gis$enabled,
                gisCfg = _objectWithoutProperties(_props2$gis, ['enabled']);

            var _state2 = this.state,
                laSource = _state2.laSource,
                gisSource = _state2.gisSource,
                selectedLabels = _state2.selectedLabels,
                chartedLabels = _state2.chartedLabels,
                fullscreen = _state2.fullscreen,
                currentLabels = _state2.currentLabels;


            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)(className, 'c-flex c-join vertical c-vbda-analysis') },
                _react2.default.createElement(
                    'div',
                    { className: 'c-box labels fixed search' },
                    _react2.default.createElement(
                        'header',
                        { className: 'c-flex aic' },
                        lt('hdr-intel-list'),
                        labelsCfg.enableDownload && _react2.default.createElement('button', {
                            className: 'end standard fg fg-data-download',
                            title: lt('tt-labels-download'),
                            disabled: _lodash2.default.isEmpty(laSource),
                            onClick: this.downloadIntelSource })
                    ),
                    _lodash2.default.isEmpty(laSource) ? _react2.default.createElement(
                        'div',
                        { className: 'content' },
                        gt('txt-loading')
                    ) : _react2.default.createElement(_labels2.default, {
                        className: 'content nopad',
                        source: laSource,
                        sourceCfg: eventsCfg,
                        selectable: true,
                        selected: selectedLabels,
                        hilited: currentLabels,
                        onClick: this.handleLabelClick,
                        onSelectionChange: this.handleLabelSelectionChange }),
                    _react2.default.createElement(
                        'footer',
                        { className: 'c-flex' },
                        _react2.default.createElement(
                            'button',
                            { onClick: this.applySelection },
                            lt('btn-analyze')
                        ),
                        _react2.default.createElement(
                            'button',
                            { onClick: this.clearAnalysis },
                            lt('btn-clear')
                        )
                    )
                ),
                enableLa && _react2.default.createElement(_la2.default, _extends({
                    id: 'g-la',
                    title: lt('hdr-la'),
                    className: (0, _classnames2.default)({ hide: fullscreen === 'gis' }),
                    sourceCfg: eventsCfg,
                    events: events,
                    source: laSource
                }, laCfg, {
                    ref: function ref(_ref3) {
                        _this3.laAnalysis = _ref3;
                    },
                    show: chartedLabels,
                    selected: currentLabels,
                    lng: lng,
                    onReady: function onReady() {
                        _this3.laAnalysis._component.resize();
                    },
                    onDelete: this.handleDelete,
                    actions: enableGis ? fullscreen === 'la' ? _react2.default.createElement('button', { className: 'standard fg fg-fullscreen-exit', title: lt('tt-exit-fullscreen'), onClick: this.toggleFullscreen.bind(this, null) }) : _react2.default.createElement('button', { className: 'standard fg fg-fullscreen', title: lt('tt-fullscreen'), onClick: this.toggleFullscreen.bind(this, 'la') }) : null })),
                enableGis && _react2.default.createElement(_gis2.default, _extends({
                    id: 'g-gis',
                    title: lt('hdr-gis'),
                    className: (0, _classnames2.default)({ hide: fullscreen === 'la' }),
                    sourceCfg: eventsCfg,
                    events: events,
                    source: gisSource
                }, gisCfg, {
                    ref: function ref(_ref4) {
                        _this3.gisAnalysis = _ref4;
                        _this3.gisAnalysis && _this3.gisAnalysis._component.resize();
                    },
                    show: chartedLabels,
                    selected: currentLabels,
                    lng: lng,
                    actions: enableLa ? fullscreen === 'gis' ? _react2.default.createElement('button', { className: 'standard fg fg-fullscreen-exit', title: lt('tt-exit-fullscreen'), onClick: this.toggleFullscreen.bind(this, null) }) : _react2.default.createElement('button', { className: 'standard fg fg-fullscreen', title: lt('tt-fullscreen'), onClick: this.toggleFullscreen.bind(this, 'gis') }) : null }))
            );
        }
    }]);

    return Analysis;
}(_react2.default.Component);

Analysis.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    lng: _propTypes2.default.string,
    _ref: _propTypes2.default.func,
    events: _propTypes2.default.objectOf(_propTypes2.default.object),
    eventsCfg: _propTypes2.default.shape({
        dt: _propTypes2.default.object
    }).isRequired,
    analyzeOptions: _propTypes2.default.object,
    labels: _propTypes2.default.shape({
        enableDownload: _propTypes2.default.bool
    }),
    la: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool
    }),
    gis: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool
    })
};
Analysis.defaultProps = {
    events: {},
    eventsCfg: {},
    analyzeOptions: {},
    labels: {
        enableDownload: false
    },
    la: {
        enabled: true
    },
    gis: {
        enabled: true
    }
};
exports.default = (0, _localeProvider2.default)(Analysis);