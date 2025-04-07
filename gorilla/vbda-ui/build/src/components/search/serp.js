'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _reactAddonsCreateFragment = require('react-addons-create-fragment');

var _reactAddonsCreateFragment2 = _interopRequireDefault(_reactAddonsCreateFragment);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _ajaxHelper = require('react-ui/build/src/utils/ajax-helper');

var _ajaxHelper2 = _interopRequireDefault(_ajaxHelper);

var _tabs = require('react-ui/build/src/components/tabs');

var _tabs2 = _interopRequireDefault(_tabs);

var _buttonGroup = require('react-ui/build/src/components/button-group');

var _buttonGroup2 = _interopRequireDefault(_buttonGroup);

var _table = require('../visualization/table');

var _table2 = _interopRequireDefault(_table);

var _chart = require('../visualization/chart');

var _chart2 = _interopRequireDefault(_chart);

var _loader = require('../../loader');

var _esHits = require('../../parser/es-hits');

var _esHits2 = _interopRequireDefault(_esHits);

var _dataHelper = require('vbda/utils/data-helper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gt = global.vbdaI18n.getFixedT(null, 'vbda');
var lt = global.vbdaI18n.getFixedT(null, 'search');

var log = require('loglevel').getLogger('vbda/components/search/serp');

var Serp = _react2.default.createClass({
    displayName: 'Serp',

    propTypes: {
        lng: _propTypes2.default.string,
        dtId: _propTypes2.default.string,
        searchId: _propTypes2.default.string,
        query: _propTypes2.default.object,
        cfg: _propTypes2.default.shape({
            dt: _propTypes2.default.objectOf(_propTypes2.default.shape({
                display_name: _propTypes2.default.string,
                renderSerp: _propTypes2.default.arrayOf(_propTypes2.default.string)
            })),
            renders: _propTypes2.default.objectOf(_propTypes2.default.shape({
                type: _propTypes2.default.string, //React.PropTypes.oneOf(['table','custom']),
                vis: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func])
            }))
        }).isRequired,
        onSelect: _propTypes2.default.func,
        onMouseOver: _propTypes2.default.func,
        onClick: _propTypes2.default.func,
        onDeleteEvent: _propTypes2.default.func,
        onEventEditorOpen: _propTypes2.default.func,
        afterLoad: _propTypes2.default.func,
        eventsCache: _propTypes2.default.object,
        useFullTextSearch: _propTypes2.default.bool
    },
    getDefaultProps: function getDefaultProps() {
        return {
            query: {}
        };
    },
    getInitialState: function getInitialState() {
        var _props = this.props,
            dtId = _props.dtId,
            eventsCache = _props.eventsCache;

        if (dtId) {
            if (eventsCache) return {
                selectedVis: _lodash2.default.first(this.getAllVis()),
                error: false,
                events: eventsCache.eventsCache,
                total: eventsCache.total,
                nowPage: eventsCache.nowPage,
                info: gt('txt-loading')
            };
        }
        return {
            selectedVis: _lodash2.default.first(this.getAllVis()),
            events: [],
            nowPage: 1,
            total: 0,
            info: gt('txt-loading'),
            error: false
        };
    },
    componentDidMount: function componentDidMount() {
        var _props2 = this.props,
            dtId = _props2.dtId,
            eventsCache = _props2.eventsCache;

        if (dtId) {
            if (eventsCache) this.loadData(eventsCache.nowPage);else this.loadData();
        }
    },
    componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
        var _this = this;

        var prevDtId = prevProps.dtId,
            prevQuery = prevProps.query;
        var _props3 = this.props,
            dtId = _props3.dtId,
            query = _props3.query,
            afterLoad = _props3.afterLoad;

        if (dtId !== prevDtId) {
            this.setState({
                selectedVis: _lodash2.default.first(this.getAllVis()),
                total: 0,
                events: [],
                nowPage: 1
            }, function () {
                _this.loadData();
                afterLoad && afterLoad();
            });
        } else if (query !== prevQuery) {
            //若query有更動才進行讀取
            log.info('query', query);
            this.loadData();
            afterLoad && afterLoad();
        }
    },
    getAllVis: function getAllVis() {
        var _props4 = this.props,
            dt = _props4.cfg.dt,
            dtId = _props4.dtId;

        return dt && dt[dtId] ? dt[dtId].renderSerp : [];
    },
    handleVisChange: function handleVisChange(selectedVis) {
        this.setState({ selectedVis: selectedVis });
    },
    onSort: function onSort(sortBy, sortDesc) {
        var _props5 = this.props,
            dt = _props5.cfg.dt,
            dtId = _props5.dtId;
        var nowPage = this.state.nowPage;
        var fields = dt[dtId].fields;

        if (_lodash2.default.get(fields, sortBy + '.type', null) === 'text(keyword)') {
            sortBy += '.keyword';
        }
        this.loadData(nowPage, sortBy, sortDesc);
    },
    loadData: function loadData(nowPage, sortBy, sortDesc) {
        var _this2 = this;

        var _props6 = this.props,
            _props6$cfg = _props6.cfg,
            dt = _props6$cfg.dt,
            searches = _props6$cfg.searches,
            dtId = _props6.dtId,
            searchId = _props6.searchId,
            _props6$useFullTextSe = _props6.useFullTextSearch,
            useFullTextSearch = _props6$useFullTextSe === undefined ? true : _props6$useFullTextSe;

        var dtCfg = dt[dtId];
        var originalQuery = this.props.query;

        if (!_lodash2.default.has(searches, searchId)) {
            return;
        }

        if (nowPage === undefined) {
            //資料庫切換
            this.setState({ info: gt('txt-loading'), error: false });
            nowPage = 1;
        }
        // let queryString = ''
        // let originalQueryString = originalQuery.query
        // if (originalQueryString && originalQueryString !== '') {
        //     queryString = esLoader.fulltextQueryParse(originalQueryString)
        // }
        // else
        //     queryString = originalQueryString
        if (!(originalQuery.query && originalQuery.query !== '')) {
            // queryString = '*'
            if (!sortBy) {
                sortBy = '__insertTime';
                sortDesc = true;
            }
        }
        var query = {
            query: originalQuery.query,
            time: {
                from: (0, _moment2.default)(originalQuery.time.from).utc().format('YYYY-MM-DDTHH:mm:ss.000') + 'Z',
                to: (0, _moment2.default)(originalQuery.time.to).utc().format('YYYY-MM-DDTHH:mm:ss.999') + 'Z'
            }

            //處理時間範圍
        };var timeStart = query.time.from;
        var timeEnd = query.time.to;

        var pageInfo = {};

        //region paginataion
        var renders = this.props.cfg.renders;
        var selectedVis = this.state.selectedVis;

        var visCfg = renders[selectedVis];
        pageInfo = {
            size: visCfg.page_size ? parseInt(visCfg.page_size.value) : 20, pageFrom: nowPage - 1
        };
        if (sortBy !== undefined) {
            pageInfo.sortBy = sortBy;
        }
        if (sortDesc !== undefined) {
            pageInfo.sortDesc = sortDesc;
        }
        //endregion

        (0, _dataHelper.fulltextSearch)({ dtId: dtId, dtCfgs: dt, searches: searches, fields: query, pageInfo: pageInfo }).then(function (res) {
            // log.info("loadData",parseEvents(data.hits.hits))
            // log.info("loadData",_.keyBy(parseEvents(data.hits.hits), '__s_uuid'))
            log.info('load data of ' + dtId, res);
            if (_lodash2.default.isEmpty(res.data)) _this2.setState({
                events: [],
                total: res.total,
                info: gt('txt-no-data'),
                nowPage: nowPage
            });else _this2.setState({
                // events: _.keyBy(parseEvents(data.hits.hits), '__s_uuid'), //TODO 目前key 用s_uuid，不確定未來有沒有統一格式
                events: res.data,
                total: res.total,
                info: null,
                nowPage: nowPage
            });
        }).catch(function (err) {
            log.error(err);
            var info = err.message;
            // if ((/Result window is too large/).test(info))
            //     info = gt('txt-error-result-window-too-large')
            _this2.setState({
                error: true,
                info: info
            });
        });
        // esLoader.find({
        //     ds: dtCfg.ds,
        //     dt: dtId,
        //     start: timeStart,
        //     end: timeEnd,
        //     fields: query,
        //     template: searches[searchId].template,
        //     ...pageInfo
        //     // sort: dtCfg.representative_time ? dtCfg.representative_time : "__s_uuid"
        // })
        //     .then(data => {
        //         // log.info("loadData",parseEvents(data.hits.hits))
        //         // log.info("loadData",_.keyBy(parseEvents(data.hits.hits), '__s_uuid'))
        //         log.info('load data of ' + dtId, data)
        //         if(_.isEmpty(data.hits.hits))
        //             this.setState({
        //                 events: [],
        //                 total: data.hits.total,
        //                 info: gt('txt-no-data'),
        //                 nowPage
        //             })
        //         else
        //             this.setState({
        //                 // events: _.keyBy(parseEvents(data.hits.hits), '__s_uuid'), //TODO 目前key 用s_uuid，不確定未來有沒有統一格式
        //                 events: parseEvents(data.hits.hits),
        //                 total: data.hits.total,
        //                 info: null,
        //                 nowPage
        //             })
        //     })
        //     .catch(err => {
        //         log.error(err)
        //         let info = err.message
        //         // if ((/Result window is too large/).test(info))
        //         //     info = gt('txt-error-result-window-too-large')
        //         this.setState({
        //             error: true,
        //             info
        //         })
        //     })
    },
    renderInfo: function renderInfo(text) {
        var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        return _react2.default.createElement(
            'div',
            { className: 'c-box grow' },
            _react2.default.createElement(
                'div',
                { className: (0, _classnames2.default)("content c-center c-info", { 'c-error': error }) },
                text
            )
        );
    },
    renderInner: function renderInner() {
        var _props7 = this.props,
            lng = _props7.lng,
            onSelect = _props7.onSelect,
            dtId = _props7.dtId,
            _props7$cfg = _props7.cfg,
            renders = _props7$cfg.renders,
            dt = _props7$cfg.dt,
            searches = _props7$cfg.searches,
            _onClick = _props7.onClick,
            onMouseOver = _props7.onMouseOver,
            onDeleteEvent = _props7.onDeleteEvent,
            onEventEditorOpen = _props7.onEventEditorOpen;
        var _state = this.state,
            selectedVis = _state.selectedVis,
            events = _state.events,
            total = _state.total,
            nowPage = _state.nowPage;

        var dtCfg = dt[dtId];
        var searchConfig = searches[dtCfg.fulltext_search];

        var visCfg = renders[selectedVis];
        var Vis = void 0;

        if (!visCfg) {
            return this.renderInfo(selectedVis + ' does not exist in renders cfg', true);
        }

        switch (visCfg.type) {
            case 'plugin':
                if (!visCfg.filepath) {
                    return this.renderInfo('Plugin filepath for \'' + selectedVis + '\' is not defined', true);
                }
                Vis = require('pluginsPath/' + visCfg.filepath).default;break;
            case 'table':
                Vis = _table2.default;break;
            case 'chart':
                Vis = _chart2.default;break;
            default:
                return this.renderInfo(visCfg.type + ' Vis Not Supported', true);
        }
        var ifEdit = dt[dtId].handler.editor && dt[dtId].handler.editor.displayName || //暫時先以此做為客製化依據，未來應該要拿掉
        _lodash2.default.get(dt[dtId], "editors.updateFields", null); //使用default editor 須設定config
        // dt[dtId].handler.editor.displayName !== 'defaultEditor' || //plugin可以直接使用
        // _.get(dt[dtId], "editors.updateFields", null)//使用default editor 須設定config
        return _react2.default.createElement(Vis, {
            id: dtId + '-' + selectedVis,
            lng: lng,
            cfg: { fields: visCfg.fields, dt: dt[dtId], page_size: visCfg.page_size ? visCfg.page_size : null },
            events: events,
            rowIdField: searchConfig.unique_id,
            total: total,
            onSelect: onSelect,
            onClick: function onClick(event, page) {
                _onClick(event, events, total, page);
            },
            onMouseOver: onMouseOver,
            onDelete: ifEdit ? onDeleteEvent : null,
            onEdit: ifEdit ? function (event) {
                onEventEditorOpen(_lodash2.default.cloneDeep(event));
            } : null,
            nowPage: nowPage,
            onReq: this.loadData,
            onSort: this.onSort
        });
    },
    render: function render() {
        var _props8 = this.props,
            dtId = _props8.dtId,
            _props8$cfg = _props8.cfg,
            dt = _props8$cfg.dt,
            searches = _props8$cfg.searches,
            searchId = _props8.searchId,
            info = _props8.info;
        var _state2 = this.state,
            selectedVis = _state2.selectedVis,
            stateInfo = _state2.info,
            stateError = _state2.error;


        if (info) {
            return this.renderInfo(info);
        }
        if (!dtId) {
            return this.renderInfo(lt('txt-select-database'));
        }
        if (!_lodash2.default.has(searches, searchId)) {
            return this.renderInfo('No matched searchId', true);
        }
        if (stateInfo) {
            return this.renderInfo(stateInfo, stateError);
        }

        var availableVisTypes = dt[dtId].renderSerp;
        if (!availableVisTypes) return this.renderInfo('availableVisTypes does not exist in ' + dtId + ' renderSerp cfg', true);

        if (availableVisTypes.length > 1) {
            return _react2.default.createElement(_buttonGroup2.default, {
                value: selectedVis,
                list: availableVisTypes.map(function (v) {
                    return { value: v, text: v };
                }),
                onChange: this.handleVisChange });
            {
                this.renderInner();
            }
        } else {
            return this.renderInner();
        }
    }
});

exports.default = Serp;