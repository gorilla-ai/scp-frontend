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

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _serp = require('./serp');

var _serp2 = _interopRequireDefault(_serp);

var _advancedSearch = require('./advanced-search');

var _advancedSearch2 = _interopRequireDefault(_advancedSearch);

var _dtList = require('./dt-list');

var _dtList2 = _interopRequireDefault(_dtList);

var _input = require('react-ui/build/src/components/input');

var _input2 = _interopRequireDefault(_input);

var _dateRange = require('react-ui/build/src/components/date-range');

var _dateRange2 = _interopRequireDefault(_dateRange);

var _form = require('react-ui/build/src/components/form');

var _form2 = _interopRequireDefault(_form);

var _localeProvider = require('../../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _loader = require('../../loader');

var _progress = require('react-ui/build/src/components/progress');

var _progress2 = _interopRequireDefault(_progress);

var _dataHelper = require('../../utils/data-helper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var gt = global.vbdaI18n.getFixedT(null, 'vbda');
var lt = global.vbdaI18n.getFixedT(null, 'search');

var log = require('loglevel').getLogger('vbda/components/search');

var Search = function (_React$Component) {
    _inherits(Search, _React$Component);

    function Search(props) {
        _classCallCheck(this, Search);

        var _this = _possibleConstructorReturn(this, (Search.__proto__ || Object.getPrototypeOf(Search)).call(this, props));

        _initialiseProps.call(_this);

        var defaultSearch = props.defaultSearch,
            defaultSelectedLabelTypes = props.defaultSelectedLabelTypes,
            dt = props.cfg.dt;

        var time = {
            from: (0, _moment2.default)("20000101").format('YYYY-MM-DD HH:mm'),
            to: (0, _moment2.default)().format('YYYY-MM-DD HH:mm')
        };
        var selectedDtIds = (0, _dtList.getDtIdsByLabels)(dt, _lodash2.default.isEmpty(defaultSelectedLabelTypes) ? _dtList.LABEL_TYPES : defaultSelectedLabelTypes);
        var currentDtId = !_lodash2.default.isEmpty(defaultSearch) ? _lodash2.default.first(selectedDtIds) : null;
        var filterForm = _extends({ time: time }, defaultSearch);

        _this.state = {
            cfg: {},
            query: _lodash2.default.cloneDeep(filterForm),
            selectedDtIds: selectedDtIds,
            currentDtId: currentDtId,
            currentSearchId: currentDtId ? dt[currentDtId].fulltext_search : null,
            currentEvent: null,
            selectedEvents: {},
            errors: null,
            showAdvanceSearch: false,
            filterForm: filterForm,
            dtsEventCount: {},
            eventsCache: {},
            info: null
        };
        return _this;
    }

    _createClass(Search, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var defaultSearch = this.props.defaultSearch;

            if (!_lodash2.default.isEmpty(defaultSearch)) {
                this.onFullTextSearchDatabase();
            }
        }

        // toAdvanceSearch() {
        //     const {filterForm} = this.state
        //     log.info('to advance search with', filterForm)
        //     this.getDtHasEvent()
        //         .then(dtsEventCount => {
        //             this.setState({
        //                 // selectedDtIds: dtIdsWithEvent,
        //                 // showAdvanceSearch: true
        //                 dtsEventCount
        //             })
        //             if (!_.isEmpty(dtsEventCount)) {
        //                 let currentDtId = Object.keys(dtsEventCount)[0]
        //                 this.setState({
        //                     currentDtId,
        //                     currentSearchId: dt[currentDtId].searches[0],
        //                     query: {}
        //                 })
        //             }
        //
        //         })
        // },


        //region Event handle


        //endregion

    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                className = _props.className,
                defaultSelectedLabelTypes = _props.defaultSelectedLabelTypes,
                cfg = _props.cfg;
            var _state = this.state,
                errors = _state.errors,
                dtsEventCount = _state.dtsEventCount;

            //serp need

            var currentEvent = this.state.currentEvent;

            //dtlist need

            var _state2 = this.state,
                showAdvanceSearch = _state2.showAdvanceSearch,
                selectedDtIds = _state2.selectedDtIds,
                filterForm = _state2.filterForm,
                currentDtId = _state2.currentDtId;
            var lng = this.props.lng;


            if (!cfg || _lodash2.default.isEmpty(cfg)) {
                return _react2.default.createElement(
                    'div',
                    null,
                    gt('txt-loading')
                );
            } else if (errors) {
                return _react2.default.createElement(
                    'div',
                    { className: 'c-error' },
                    errors
                );
            }

            // if (currentEvent) {
            //     return this.renderEventInfo()
            // }
            // else
            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-vbda-search c-flex fdc', className) },
                this.renderToolBar(),
                _react2.default.createElement(
                    'div',
                    { className: 'grow c-flex c-split vertical c-margin' },
                    _react2.default.createElement(
                        'div',
                        { className: 'c-box fixed search' },
                        _react2.default.createElement(
                            'header',
                            null,
                            lt('hdr-search')
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'content' },
                            _react2.default.createElement(_dtList2.default, {
                                useCheckbox: true,
                                lng: lng,
                                defaultSelectedLabelTypes: defaultSelectedLabelTypes,
                                selectedDtIds: selectedDtIds,
                                dtsEventCount: dtsEventCount,
                                currentDtId: currentDtId,
                                cfg: _lodash2.default.pick(cfg, ['dt', 'ds']),
                                onCurrentDtChange: this.handleCurrentDtChange,
                                onDtSelectionChange: this.handleDtSelectionChange })
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'content filter-form fixed' },
                            _react2.default.createElement(_form2.default, {
                                id: id,
                                formClassName: 'c-form',
                                onChange: this.handleFilterFormChange,
                                fields: {
                                    query: { label: lt('form-fulltext'), editor: _input2.default },
                                    time: {
                                        label: lt('form-event-time'),
                                        editor: _dateRange2.default,
                                        props: {
                                            enableTime: true
                                        }
                                    }
                                },
                                value: filterForm
                            })
                        ),
                        _react2.default.createElement(
                            'footer',
                            null,
                            _react2.default.createElement(
                                'button',
                                { onClick: this.onFullTextSearchDatabase },
                                lt('btn-search')
                            )
                        )
                    ),
                    this.renderSerp()
                ),
                this.renderInnerEditor()
            );
        }
    }]);

    return Search;
}(_react2.default.Component);

Search.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    lng: _propTypes2.default.string,
    cfg: _propTypes2.default.shape({
        ds: _propTypes2.default.objectOf(_propTypes2.default.object),
        dt: _propTypes2.default.objectOf(_propTypes2.default.shape({
            searches: _propTypes2.default.arrayOf(_propTypes2.default.string)
        })),
        searches: _propTypes2.default.objectOf(_propTypes2.default.object)
    }).isRequired,
    defaultSelectedLabelTypes: _propTypes2.default.arrayOf(_propTypes2.default.string),
    defaultSearch: _propTypes2.default.object,
    afterSearch: _propTypes2.default.func,
    onCreateEvent: _propTypes2.default.func,
    onUpdateEvent: _propTypes2.default.func
};

var _initialiseProps = function _initialiseProps() {
    var _this2 = this;

    this.doSearch = function (query) {
        _this2.setState({ query: query });
    };

    this.handleSearchChange = function (currentSearchId) {
        _this2.setState({ currentSearchId: currentSearchId });
    };

    this.handleSelect = function (selectedEvents) {
        log.info('select Events', selectedEvents);
        _this2.setState({ selectedEvents: selectedEvents });
    };

    this.handleEventClick = function (currentEvent, eventsCache, total, nowPage) {
        var _props2 = _this2.props,
            dt = _props2.cfg.dt,
            onCurrentEventChange = _props2.onCurrentEventChange;

        onCurrentEventChange({ currentEvent: currentEvent, eventsCache: { eventsCache: eventsCache, total: total, nowPage: nowPage } });
        _this2.setState({ currentEvent: currentEvent, eventsCache: { eventsCache: eventsCache, total: total, nowPage: nowPage } });
    };

    this.handleDtSelectionChange = function (selectedDtIds) {
        _this2.setState({ selectedDtIds: selectedDtIds });
    };

    this.handleCurrentDtChange = function () {
        var currentDtId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var _props3 = _this2.props,
            dt = _props3.cfg.dt,
            onCurrentDtIdChange = _props3.onCurrentDtIdChange;

        onCurrentDtIdChange({ currentDtId: currentDtId });
        _this2.setState({
            currentDtId: currentDtId,
            currentSearchId: currentDtId ? dt[currentDtId].fulltext_search : null
        });
    };

    this.renderAdvanceSearch = function () {
        var _props4 = _this2.props,
            lng = _props4.lng,
            cfg = _props4.cfg;
        var _state3 = _this2.state,
            currentDtId = _state3.currentDtId,
            currentSearchId = _state3.currentSearchId;


        return _react2.default.createElement(_advancedSearch2.default, {
            lng: lng,
            cfg: cfg,
            dtId: currentDtId,
            currentSearchId: currentSearchId,
            onSearch: _this2.doSearch,
            onSearchChange: _this2.handleSearchChange });
    };

    this.renderSerp = function () {
        var _props5 = _this2.props,
            lng = _props5.lng,
            cfg = _props5.cfg,
            afterSearch = _props5.afterSearch,
            _onDeleteEvent = _props5.onDeleteEvent,
            _props5$eventsCache = _props5.eventsCache,
            eventsCache = _props5$eventsCache === undefined ? {} : _props5$eventsCache;
        var _state4 = _this2.state,
            filterForm = _state4.filterForm,
            currentDtId = _state4.currentDtId,
            currentSearchId = _state4.currentSearchId,
            query = _state4.query,
            info = _state4.info;


        return _react2.default.createElement(_serp2.default, {
            ref: function ref(_ref) {
                _this2.serp = _ref;
            },
            info: info,
            lng: lng,
            searchId: currentSearchId,
            dtId: currentDtId,
            query: query
            // setQuery={this.setQuery}
            , cfg: _lodash2.default.pick(cfg, ['searches', 'dt', 'renders']),
            onSelect: _this2.handleSelect,
            onClick: function onClick(event, eventsCache, total, nowPage) {
                return _this2.handleEventClick(event, eventsCache, total, nowPage);
            },
            onDeleteEvent: function onDeleteEvent(event) {
                _onDeleteEvent(event, function () {
                    _this2.serp.loadData();
                });
            },
            onEventEditorOpen: function onEventEditorOpen(event) {
                _this2.handleEventEditorOpen(event);
            },
            afterLoad: afterSearch.bind(null, { params: filterForm, database: currentDtId }, false),
            eventsCache: eventsCache
        });
    };

    this.handleEventEditorOpen = function () {
        var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _this2.eventEditor.open(event);
    };

    this.onFullTextSearchDatabase = function () {
        var filterForm = _this2.state.filterForm;


        var hasError = false;

        _progress2.default.startSpin();

        _this2.getDtHasEvent().then(function (dtsEventCount) {
            if (!_lodash2.default.isEmpty(dtsEventCount)) {
                // let currentDtId = null
                // _.forEach(dtsEventCount, (count, key) => {
                //     if (currentDtId === null) {
                //         if (count > 0) {
                //             currentDtId = key
                //             return false;
                //         }
                //     }
                // })
                // if (currentDtId)
                //     this.setState({
                //         currentDtId,
                //         currentSearchId: dts[currentDtId].fulltext_search,
                //         query: filterForm,
                //         dtsEventCount
                //     })
                var noData = true;
                _lodash2.default.forEach(dtsEventCount, function (count) {
                    if (count > 0) {
                        noData = false;
                        return false;
                    }
                });
                if (noData) _this2.setState({
                    query: filterForm,
                    dtsEventCount: dtsEventCount,
                    info: lt('txt-search-no-match-result')
                });else _this2.setState({
                    query: filterForm,
                    dtsEventCount: dtsEventCount,
                    info: null
                });
            } else _this2.setState({
                dtsEventCount: dtsEventCount,
                info: null
            });
        }).finally(function () {
            _progress2.default.done();
        });
    };

    this.setQuery = function (query) {
        _this2.setState({ query: query });
    };

    this.getDtHasEvent = function () {
        var _props$cfg = _this2.props.cfg,
            dts = _props$cfg.dt,
            searches = _props$cfg.searches;
        var _state5 = _this2.state,
            filterForm = _state5.filterForm,
            selectedDtIds = _state5.selectedDtIds;

        var dtsEventCount = {};
        // let queryString = ''
        // let originalQueryString = filterForm.query
        // if (originalQueryString && originalQueryString !== '') {
        //     queryString = esLoader.fulltextQueryParse(originalQueryString)
        // }
        // else
        //     queryString = originalQueryString

        var fields = {
            query: filterForm.query,
            time: {
                from: (0, _moment2.default)(filterForm.time.from).utc().format('YYYY-MM-DDTHH:mm:ss.000') + 'Z',
                to: (0, _moment2.default)(filterForm.time.to).utc().format('YYYY-MM-DDTHH:mm:ss.999') + 'Z'
            }
        };
        return _bluebird2.default.all(_lodash2.default.map(selectedDtIds, function (dtId) {
            return (0, _dataHelper.fulltextSearch)({ dtId: dtId, dtCfgs: dts, searches: searches, fields: fields }).then(function (res) {
                dtsEventCount[dtId] = res.total;
                return null;
            }).catch(function (err) {
                dtsEventCount[dtId] = err;
                return null;
            });
            // const dtCfg = dts[dtId]
            // const searchConfig = searches [dtCfg.fulltext_search]
            // switch (searchConfig.query_type) {
            //     case 'base_service':
            //     default:
            //         let fulltextTemplate = searchConfig.template
            //         return esLoader.find({
            //             ds: dtCfg.ds,
            //             dt: dtId,
            //             start: fields.time.from,
            //             end: fields.time.to,
            //             fields,
            //             template: fulltextTemplate,
            //             size: 0
            //         })
            //             .then(data => {
            //                 dtsEventCount[dtId] = data.hits.total
            //                 return null
            //             })
            //             .catch(err => {
            //                 dtsEventCount[dtId] = err
            //                 return null
            //             })
            //     case 'json_request':
            //         const {url, body} = searchConfig
            //         const query = syntaxParse(body, fields)
            //         return ah.one({
            //             url: url,
            //             type: 'POST',
            //             data: JSON.stringify(query),
            //             contentType: 'application/json'
            //         })
            //             .then(data => {
            //                 dtsEventCount[dtId] = data.total
            //                 return null
            //             })
            //             .catch(err => {
            //                 dtsEventCount[dtId] = err
            //                 return null
            //             })
            // }
        }, [])).then(function () {
            return dtsEventCount;
        }).catch(function (err) {
            log.error(err);
        });
    };

    this.backToSearch = function () {
        _this2.setState({ showAdvanceSearch: false });
    };

    this.renderEventInfo = function () {
        var _props6 = _this2.props,
            dt = _props6.cfg.dt,
            cfg = _props6.cfg,
            className = _props6.className,
            id = _props6.id;
        var _state6 = _this2.state,
            currentDtId = _state6.currentDtId,
            currentEvent = _state6.currentEvent;

        log.info('current event', currentEvent);
        if (!currentDtId) return null;
        var currentDt = dt[currentDtId];
        var EventDetail = currentDt.handler.detail;
        // const EventEditor = currentDt.handler.editor

        if (!EventDetail) {
            return _react2.default.createElement(
                'div',
                { className: 'c-error' },
                currentDtId,
                ' does not exist in detail cfg'
            );
        }
        return _react2.default.createElement(
            'div',
            { id: id, className: (0, _classnames2.default)('c-vbda-search c-fullscreen c-flex fdc', className) },
            _react2.default.createElement(SimpleHeader, { title: 'test' }),
            _react2.default.createElement(
                'div',
                { className: 'c-toolbar c-flex aic fixed' },
                _react2.default.createElement(
                    'div',
                    { className: 'c-link c-flex aic', onClick: function onClick() {
                            return _this2.setState({ currentEvent: null });
                        } },
                    _react2.default.createElement('i', { className: 'fg fg-arrow-left', title: lt('txt-back-to-search') }),
                    _react2.default.createElement(
                        'span',
                        null,
                        lt('txt-back-to-search')
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'end actions' },
                    _react2.default.createElement('button', { className: 'standard img fg fg-printer', title: gt('tt-print'), onClick: _this2.handleClickPrint })
                )
            ),
            _react2.default.createElement(EventDetail, { event: currentEvent,
                dtCfg: dt[currentDtId],
                lng: _i18next2.default.language
            })
        );
    };

    this.renderInnerEditor = function () {
        var _props7 = _this2.props,
            dt = _props7.cfg.dt,
            onCreateEvent = _props7.onCreateEvent,
            onUpdateEvent = _props7.onUpdateEvent,
            session = _props7.session;
        var currentDtId = _this2.state.currentDtId;

        if (!currentDtId) return null;
        var currentDt = dt[currentDtId];
        var EventEditor = currentDt.handler.editor;

        if (!EventEditor) {
            // return <div className='c-error'>{currentDtId} does not exist in editors cfg</div>
            log.info('no editor');
            return _react2.default.createElement(
                'div',
                { className: 'c-error' },
                null
            );
        }
        return _react2.default.createElement(EventEditor, {
            _ref: function _ref(ref) {
                _this2.eventEditor = ref;
            },
            lng: _i18next2.default.language,
            currentDt: currentDt,
            session: session,
            onCreate: function onCreate(event) {
                onCreateEvent(dt[currentDtId].ds, currentDtId, event, function () {
                    _this2.serp.loadData();
                });
            },
            onUpdate: function onUpdate(event) {
                onUpdateEvent(event, function () {
                    _this2.serp.loadData();
                });
            } });
    };

    this.handleFilterFormChange = function (filterForm) {
        _this2.setState({ filterForm: filterForm });
    };

    this.handleClickPrint = function () {
        window.print();
    };

    this.renderToolBar = function () {
        var cfg = _this2.props.cfg;
        var _props8 = _this2.props,
            onAddEvents = _props8.onAddEvents,
            onAddAllEvents = _props8.onAddAllEvents,
            onDownload = _props8.onDownload;
        var _state7 = _this2.state,
            currentSearchId = _state7.currentSearchId,
            currentDtId = _state7.currentDtId,
            selectedEvents = _state7.selectedEvents,
            query = _state7.query,
            dtsEventCount = _state7.dtsEventCount;

        var searchConfig = {};
        if (currentDtId) {
            searchConfig = cfg.searches[cfg.dt[currentDtId].fulltext_search];
        }
        return _react2.default.createElement(
            'div',
            { className: 'c-toolbar c-flex aic fixed' },
            _react2.default.createElement(
                'div',
                { className: 'end' },
                currentDtId ? _react2.default.createElement(
                    'div',
                    { className: 'c-flex actions' },
                    _react2.default.createElement(
                        'button',
                        { className: 'standard',
                            disabled: _lodash2.default.size(selectedEvents) <= 0,
                            onClick: onAddEvents.bind(null, selectedEvents, cfg.searches[currentSearchId], currentDtId, cfg.dt[currentDtId].ds) },
                        lt('btn-add-intel')
                    ),
                    _react2.default.createElement(
                        'button',
                        { className: 'standard',
                            disabled: dtsEventCount[currentDtId] <= 0 || dtsEventCount[currentDtId] > 10000,
                            onClick: function onClick() {
                                onAddAllEvents(query, cfg.searches[currentSearchId], currentDtId, cfg.dt[currentDtId].ds);
                            } },
                        lt('btn-add-all-intel')
                    ),
                    _react2.default.createElement('button', { className: 'img standard fg fg-data-download', onClick: onDownload.bind(null, currentDtId) }),
                    cfg.dt[currentDtId].handler.editor && cfg.dt[currentDtId].handler.editor.displayName || //暫時先以此做為客製化依據，未來應該要拿掉
                    _lodash2.default.has(cfg.dt[currentDtId], "editors.addFields") ? //使用default editor 須設定config
                    _react2.default.createElement('i', { className: 'c-link fg fg-add', title: lt('tt-create'), onClick: function onClick() {
                            return _this2.handleEventEditorOpen();
                        } }) : null
                ) : null
            )
        );
    };
};

exports.default = (0, _localeProvider2.default)(Search);