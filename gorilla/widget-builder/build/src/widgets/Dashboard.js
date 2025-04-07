'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _reactUi = require('react-ui');

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _dashboard = require('react-chart/build/src/components/dashboard');

var _dashboard2 = _interopRequireDefault(_dashboard);

var _ajaxHelper = require('react-ui/build/src/utils/ajax-helper');

var _ajaxHelper2 = _interopRequireDefault(_ajaxHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var gt = _i18next2.default.getFixedT(null, 'app');

var log = require('loglevel').getLogger('chart/components/tes');

var PROGRESS_STATUS = {
    LOADING: 'loading',
    ERROR: 'error',
    DONE: 'done',
    INIT: 'init'
};
var STORE_STATUS = {
    LOADING: 'loading',
    ERROR: 'error',
    DONE: 'done'

    /**
     * Dashboard support add multiple widget inside.
     * @constructor
     * @description storeCfg:{
     *     [key] :{
     *          type: 'rawData'
     *          description: ''
     *          data: { }
     *          or
     *          type: 'request'
     *          description: ''
     *          query:{
     *              type:'GET/POST',
     *              url:''
     *              data:{ }
     *          }
     *          selectKey:'' *
     *          isMulti:'' *
     *          errorMessage: '' or {'statusName':'message'}
     *     }
     * }
     */
};
var Dashboard = function (_React$Component) {
    _inherits(Dashboard, _React$Component);

    function Dashboard(props) {
        _classCallCheck(this, Dashboard);

        var _this = _possibleConstructorReturn(this, (Dashboard.__proto__ || Object.getPrototypeOf(Dashboard)).call(this, props));

        var widgets = _this.initial();
        var layoutCfg = _extends({}, props.layoutCfg, { layout: _this.initialLayout() });
        var sqlConfig = _extends({}, props.sqlConfig);
        var _props$widgetStatus = props.widgetStatus,
            widgetStatus = _props$widgetStatus === undefined ? {} : _props$widgetStatus;

        _this.state = {
            info: null,
            initialProgress: {
                "loadStoreData": {
                    text: 'load Store Data',
                    status: PROGRESS_STATUS.INIT
                }
            },
            widgets: widgets,
            layoutCfg: layoutCfg,
            sqlConfig: sqlConfig,
            $store: {},
            $widget: {},
            lastStoreCfg: _lodash2.default.cloneDeep(props.storeCfg),
            // initialled: false,
            widgetStatus: widgetStatus
        };
        return _this;
    }

    _createClass(Dashboard, [{
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps, nextState) {
            var _this2 = this;

            var widgetStatus = nextProps.widgetStatus;

            if (!_lodash2.default.isEmpty(widgetStatus)) {
                _lodash2.default.forEach(widgetStatus, function (status, id) {
                    _this2.state.widgetStatus[id] = status;
                });
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            var lastStoreCfg = prevState.lastStoreCfg;
            var storeCfg = this.props.storeCfg;

            if (!_lodash2.default.isEqual(prevProps, this.props) //check if props change, state's storeCfg change will load store data its self
            && !_lodash2.default.isEqual(lastStoreCfg, storeCfg)) this.loadStoreData(storeCfg, lastStoreCfg);
            // const {initialled, initialProgress} = this.state
            // if(!initialled &&
            //     _.find(initialProgress, (o) => o.status !== PROGRESS_STATUS.DONE) === undefined){
            //     this.setState({initialled: true})
            // }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var storeCfg = this.props.storeCfg;

            this.loadStoreData(storeCfg);
        }
    }, {
        key: 'loadStoreData',
        value: function loadStoreData(storeCfg, lastStoreCfg) {
            var _this3 = this;

            //TODO 只讀部分不要每次更新就全部都重新整理
            var requestList = {};
            var rawData = {};
            var storesStatus = {};
            _lodash2.default.forEach(storeCfg, function (config, storeId) {
                var status = STORE_STATUS.DONE;
                if (!lastStoreCfg //初始化不會有lastStoreCfg
                || !_lodash2.default.isEqual(config, lastStoreCfg[storeId])) {
                    //若是之後的更新需要比較
                    if (config.type === 'request') {
                        requestList[storeId] = config;
                        status = STORE_STATUS.LOADING;
                    } else rawData[storeId] = config.data;
                }
                storesStatus[storeId] = {
                    status: status
                };
            });

            //TODO 確認會不會有還在loading又被trigger loadStoreData()的情況
            if (_lodash2.default.isEmpty(requestList)) {
                //no need load
                log.info('Dashboard no need to load store data');
                this.setState({ $store: rawData, storesStatus: storesStatus, initialProgress: this.getUpdateProgress("loadStoreData", PROGRESS_STATUS.DONE) });
                return;
            } else {
                log.info('Dashboard loading store data................');
                this.setState({ $store: rawData, storesStatus: storesStatus, initialProgress: this.getUpdateProgress("loadStoreData", PROGRESS_STATUS.LOADING) });
            }

            var process = [];
            _lodash2.default.forEach(requestList, function (config, storeId) {
                var selectKey = config.selectKey,
                    query = config.query,
                    _config$errorMessage = config.errorMessage,
                    errorMessage = _config$errorMessage === undefined ? 'Server connect failed.' : _config$errorMessage;

                var type = _lodash2.default.upperCase(query.type);
                switch (type) {
                    case 'GET':
                        break;
                    default:
                        //others
                        query.data = JSON.stringify(query.data);
                        query.contentType = 'application/json';
                }
                log.info('load store[' + storeId + '] with', query);
                process.push(_ajaxHelper2.default.one(query, { showProgress: false, parseFail: failParser, eh: { getMsg: function getMsg() {
                            return errorMessage;
                        } } }).then(function (data) {
                    if (selectKey) {
                        data = _lodash2.default.get(data, selectKey);
                    }
                    log.info('Store [' + storeId + '] loaded success.', data);
                    return { key: storeId, data: data, error: false, message: "" };
                }).catch(function (errors) {
                    // PopupDialog.alertId(
                    //     `store-${storeId}`,
                    //     {
                    //         title: 'Error',
                    //         display: <div className='c-error'>{errors.message}</div>,
                    //         confirmText: gt('btn-close')
                    //     }
                    // )
                    log.error('Store[' + storeId + '] Error.', errors);
                    return { key: storeId, error: true, message: errorMessage };
                }));
            });
            return Promise.all(process).then(function (data) {
                var store = _lodash2.default.chain(data).mapKeys('key').mapValues(function (val) {
                    return val.data;
                }).value();
                var storesStatus = _lodash2.default.chain(data).mapKeys('key').mapValues(function (val) {
                    var error = val.error,
                        message = val.message;

                    return {
                        status: error ? STORE_STATUS.ERROR : STORE_STATUS.DONE,
                        info: message
                    };
                }).value();
                log.info('dashboard load store data END', store);
                _this3.setState({ $store: _extends({}, _this3.state.store, store), initialProgress: _this3.getUpdateProgress("loadStoreData", PROGRESS_STATUS.DONE), storesStatus: storesStatus });
            }).catch(function (err) {
                log.error(err);
                _this3.setState({ initialProgress: _this3.getUpdateProgress("loadStoreData", PROGRESS_STATUS.ERROR) });
            });
        }
    }, {
        key: 'getUpdateProgress',
        value: function getUpdateProgress(key, status) {
            var initialProgress = this.state.initialProgress;

            return _objectPathImmutable2.default.set(initialProgress, [key, 'status'], status);
        }
    }, {
        key: 'initial',
        value: function initial() {
            var _this4 = this;

            var widgets = _lodash2.default.cloneDeep(this.props.widgets);
            _lodash2.default.forEach(widgets, function (_ref, widgetId) {
                var widgetConfig = _ref.widgetConfig,
                    eventListeners = _ref.eventListeners;

                var eventListenerFunctions = _lodash2.default.chain(eventListeners).mapValues(function (eventListenerConfig) {
                    var target = eventListenerConfig.target;

                    var eventListenerFunction = function eventListenerFunction() {
                        for (var _len = arguments.length, _arguments = Array(_len), _key = 0; _key < _len; _key++) {
                            _arguments[_key] = arguments[_key];
                        }

                        var lastStoreCfg = _this4.state.lastStoreCfg;

                        var targetState = {};
                        _lodash2.default.forEach(target, function (paths, argumentPath) {
                            _lodash2.default.forEach(paths, function (targetPath) {
                                if (_lodash2.default.startsWith(targetPath, '$store')) {
                                    //modify store
                                    targetPath = targetPath.replace(/^\$store./, '');
                                    var value = _lodash2.default.get(_arguments, argumentPath, undefined);
                                    if (_lodash2.default.isString(value) ? value === '' : _lodash2.default.isEmpty(value)) value = undefined;
                                    lastStoreCfg = _objectPathImmutable2.default.set(lastStoreCfg, targetPath, value);
                                } else {
                                    //directly to widget
                                    var _value = _lodash2.default.get(_arguments, argumentPath, undefined);
                                    if (_lodash2.default.isString(_value) ? _value === '' : _lodash2.default.isEmpty(_value)) {
                                        //clear and cause the hoc dont get wrong data//TODO WHYYYY?
                                        if (_value || !_value) _lodash2.default.set(targetState, targetPath, _value);else _lodash2.default.set(targetState, targetPath, undefined);
                                    } else _lodash2.default.set(targetState, targetPath, _value);
                                }
                            });
                        });
                        log.info(targetState);
                        _this4.setState({ $widget: targetState, lastStoreCfg: lastStoreCfg }, function () {
                            _this4.loadStoreData(lastStoreCfg);
                        });
                    };
                    return eventListenerFunction;
                }).mapKeys(function (eventListenerConfig, eventListenerConfigName) {
                    //create an _listener for hoc
                    return eventListenerConfigName;
                }).value();
                // if(!widgetConfig.config)//for?
                //     widgetConfig.config = {}
                // widgetConfig.config = {...widgetConfig.config, ...eventListenerFunctions}
                _lodash2.default.forEach(eventListenerFunctions, function (value, keyPath) {
                    _lodash2.default.set(widgetConfig.config, keyPath, value);
                });
                log.info('dashboard:', widgetId, '-', widgetConfig);
                widgets[widgetId].widgetConfig = widgetConfig;
            });
            log.info('widgets initialled', widgets);
            return widgets;
        }
    }, {
        key: 'initialLayout',
        value: function initialLayout() {
            var widgets = this.props.widgets;

            return _lodash2.default.map(widgets, function (_ref2) {
                var layout = _ref2.layout;

                return layout;
            });
        }

        // renderHOC() {
        //     const {widgets} = this.props
        //     return _.map(widgets, ({layout}) => {
        //         return layout
        //     })
        // }

    }, {
        key: 'renderProgress',
        value: function renderProgress(initialProgress) {
            var _props$debug = this.props.debug,
                debug = _props$debug === undefined ? false : _props$debug;

            if (!debug) {
                _lodash2.default.forEach(initialProgress, function (_ref3, id) {
                    var text = _ref3.text,
                        status = _ref3.status;

                    log.info('[' + id + ']' + text + ': ' + status);
                });
                return _react2.default.createElement(
                    'div',
                    { className: 'c-center' },
                    _react2.default.createElement('i', { className: 'fg fg-loading-2 fg-spin' })
                );
            }
            return _react2.default.createElement(
                'div',
                null,
                _lodash2.default.map(initialProgress, function (_ref4, id) {
                    var text = _ref4.text,
                        status = _ref4.status;

                    return _react2.default.createElement(
                        'div',
                        { key: id, className: 'aligned c-form' },
                        _react2.default.createElement(
                            'div',
                            { className: 'row' },
                            _react2.default.createElement(
                                'label',
                                { className: '' },
                                text
                            ),
                            _react2.default.createElement(
                                'div',
                                null,
                                status
                            )
                        )
                    );
                })
            );
        }
    }, {
        key: 'handleStatusChange',
        value: function handleStatusChange(widgetId, status) {
            var widgetStatus = this.state.widgetStatus;

            widgetStatus[widgetId] = status;
            this.setState({ widgetStatus: widgetStatus });
        }
    }, {
        key: 'renderStoreStatus',
        value: function renderStoreStatus(storeStatus) {
            switch (storeStatus.status) {
                case STORE_STATUS.ERROR:
                    return _react2.default.createElement(
                        'div',
                        { className: 'c-center' },
                        _react2.default.createElement(
                            'div',
                            { className: 'c-error c-flex jcc' },
                            storeStatus.info
                        )
                    );
                case STORE_STATUS.LOADING:
                    return _react2.default.createElement(
                        'div',
                        { className: 'c-center' },
                        this.renderLoading()
                    );

            }
        }
    }, {
        key: 'renderLoading',
        value: function renderLoading() {
            return _react2.default.createElement(
                'svg',
                { version: '1.0', width: '38px', height: '38px', viewBox: '0 0 128 128' },
                _react2.default.createElement(
                    'g',
                    null,
                    _react2.default.createElement('circle', { cx: '16', cy: '64', r: '16', fill: '#4A4A4A', 'fill-opacity': '1' }),
                    _react2.default.createElement('circle', { cx: '16', cy: '64', r: '14.344', fill: '#4A4A4A', 'fill-opacity': '1', transform: 'rotate(45 64 64)' }),
                    _react2.default.createElement('circle', { cx: '16', cy: '64', r: '12.531', fill: '#4A4A4A', 'fill-opacity': '1', transform: 'rotate(90 64 64)' }),
                    _react2.default.createElement('circle', { cx: '16', cy: '64', r: '10.75', fill: '#4A4A4A', 'fill-opacity': '1', transform: 'rotate(135 64 64)' }),
                    _react2.default.createElement('circle', { cx: '16', cy: '64', r: '10.063', fill: '#4A4A4A', 'fill-opacity': '1', transform: 'rotate(180 64 64)' }),
                    _react2.default.createElement('circle', { cx: '16', cy: '64', r: '8.063', fill: '#4A4A4A', 'fill-opacity': '1', transform: 'rotate(225 64 64)' }),
                    _react2.default.createElement('circle', { cx: '16', cy: '64', r: '6.438', fill: '#4A4A4A', 'fill-opacity': '1', transform: 'rotate(270 64 64)' }),
                    _react2.default.createElement('circle', { cx: '16', cy: '64', r: '5.375', fill: '#4A4A4A', 'fill-opacity': '1', transform: 'rotate(315 64 64)' }),
                    _react2.default.createElement('animateTransform', { attributeName: 'transform', type: 'rotate', values: '0 64 64;315 64 64;270 64 64;225 64 64;180 64 64;135 64 64;90 64 64;45 64 64', calcMode: 'discrete', dur: '720ms', repeatCount: 'indefinite' })
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var _props = this.props,
                HOC = _props.HOC,
                _props$onLayoutChange = _props.onLayoutChange,
                _onLayoutChange = _props$onLayoutChange === undefined ? null : _props$onLayoutChange;

            var _state = this.state,
                widgets = _state.widgets,
                layoutCfg = _state.layoutCfg,
                sqlConfig = _state.sqlConfig,
                initialProgress = _state.initialProgress,
                $store = _state.$store,
                $widget = _state.$widget,
                initialled = _state.initialled,
                widgetStatus = _state.widgetStatus,
                _state$storesStatus = _state.storesStatus,
                storesStatus = _state$storesStatus === undefined ? [] : _state$storesStatus;
            // if (!initialled// once initialled wont enter again
            //     // &&_.find(initialProgress, (o) => o.status !== PROGRESS_STATUS.DONE) !== undefined
            // ) {
            //     return this.renderProgress(initialProgress)
            // }

            return _react2.default.createElement(
                _dashboard2.default,
                { className: 'layout-hoc', layoutCfg: layoutCfg,
                    onLayoutChange: function onLayoutChange(layoutArray) {
                        if (typeof _onLayoutChange === 'function') {
                            var keys = Object.keys(widgets);
                            _onLayoutChange(layoutArray.map(function (layout, index) {
                                layout.id = keys[index];
                                return layout;
                            }));
                        }
                    }
                },
                _lodash2.default.map(widgets, function (_ref5, widgetId) {
                    var widgetConfig = _ref5.widgetConfig,
                        eventListenerConfig = _ref5.eventListenerConfig,
                        boxTitle = _ref5.boxTitle,
                        storeRef = _ref5.storeRef,
                        sqlMode = _ref5.sqlMode;

                    var newWidgetConfig = _lodash2.default.cloneDeep(widgetConfig);
                    if (_lodash2.default.has($widget, widgetId)) {
                        var toMerge = $widget[widgetId];
                        newWidgetConfig = _lodash2.default.merge(newWidgetConfig, toMerge);
                        //log.info(newWidgetConfig)//TODO 只取代data這件事跟取代整個widget這件事
                    }
                    if (sqlMode) {
                        var server = '';
                        switch (sqlConfig.sqlServerType) {
                            case 'postgresql':
                                server = 'postgresql';
                                break;
                            case 'mysql':
                                server = 'mysql';
                                break;
                            case 'mssql':
                            default:
                                server = 'sqlserver';
                                break;
                        }
                        var obj = {
                            connection: {
                                jdbcUrl: 'jdbc:' + server + '://' + sqlConfig.ip + ':' + sqlConfig.port + (sqlConfig.sqlServerType === 'postgresql' || sqlConfig.sqlServerType === 'mysql' ? '/' + sqlConfig.databaseName : ';databaseName=' + sqlConfig.databaseName),
                                username: sqlConfig.user,
                                password: sqlConfig.password,
                                sqlType: sqlConfig.sqlServerType
                            }
                        };
                        _lodash2.default.set(newWidgetConfig, 'config.widgetSQL', obj);
                    }
                    var storeStatus = null;
                    if (!_lodash2.default.isNil(storeRef)) {
                        //if need store data
                        _lodash2.default.forEach(storeRef, function (storePaths, targetPath) {
                            var storeDataReferenceFound = false;
                            _lodash2.default.forEach(storePaths, function (storePath) {
                                if (_lodash2.default.get($store, storePath) !== undefined) {
                                    _lodash2.default.set(newWidgetConfig, targetPath, _lodash2.default.get($store, storePath));
                                    // log.info(storePath,'=>',targetPath,$store)
                                    storeDataReferenceFound = true;
                                    return false; //stop loop//找到有的就不再找其他store，忘記需求是什麼//TODO確認有沒有必要
                                }
                            });
                            if (!storeDataReferenceFound) {
                                //TODO未來看看怎麼樣 目前先拿第一個的store當代表
                                var storeName = storePaths[0].split('.')[0];
                                if (storesStatus[storeName]) {
                                    if (storesStatus[storeName].status !== STORE_STATUS.DONE) storeStatus = storesStatus[storeName];else {
                                        //TODO
                                    }
                                }
                            }
                        });
                    }
                    // if (widgetStatus[widgetId] === STATUS.LOADING) {
                    //     return <i className='fg fg-loading-2 fg-spin'/>
                    // }
                    return _react2.default.createElement(
                        'div',
                        { id: widgetId, key: widgetId, className: (0, _classnames2.default)({ 'c-box': boxTitle }, 'dashboard-item') },
                        boxTitle && _react2.default.createElement(
                            'header',
                            null,
                            boxTitle
                        ),
                        _lodash2.default.get(widgetStatus, widgetId) === PROGRESS_STATUS.LOADING ? _react2.default.createElement(
                            'div',
                            { className: 'content c-center' },
                            _this5.renderLoading()
                        ) : storeStatus !== null ? _this5.renderStoreStatus(storeStatus) : _react2.default.createElement(
                            'div',
                            { className: (0, _classnames2.default)({ "content": boxTitle }) },
                            _react2.default.createElement(HOC, newWidgetConfig)
                        )
                    );
                })
            );
        }
    }]);

    return Dashboard;
}(_react2.default.Component);

exports.default = Dashboard;


function failParser(json, text, status) {
    if (json) {
        var code = _lodash2.default.get(json, 'code', status),
            message = _lodash2.default.get(json, 'message', 'Get remote data fail.');

        return {
            code: code,
            message: message
        };
    }

    if (text) {
        return {
            message: text
        };
    }

    return {};
};

function getMsg(errors) {
    return errors.map(function (_ref6) {
        var code = _ref6.code,
            message = _ref6.message;
        return '[' + code + '] ' + message;
    }).join('<br/>');
};