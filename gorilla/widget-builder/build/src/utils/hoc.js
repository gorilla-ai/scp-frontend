'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _widget = require('../loaders/widget');

var _widget2 = _interopRequireDefault(_widget);

var _hoc = require('./hoc');

var _hoc2 = _interopRequireDefault(_hoc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('hoc');

var STATUS = {
    INIT: 'initializing',
    LOAD_CONFIG: 'load-config',
    LOAD_STORE_DATA: 'loading-store-data',
    ERROR: 'error',
    DONE: 'done'
};

var HOC = function (_React$Component) {
    _inherits(HOC, _React$Component);

    function HOC(props) {
        _classCallCheck(this, HOC);

        var _this = _possibleConstructorReturn(this, (HOC.__proto__ || Object.getPrototypeOf(HOC)).call(this, props));

        _this.state = {
            info: null,
            status: STATUS.INIT,
            widgetConfigCache: {}
        };
        return _this;
    }

    _createClass(HOC, [{
        key: 'forceRefresh',
        value: function forceRefresh() {
            this.initial(this.props);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.initial(this.props);
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps) {
            var _this2 = this;

            if (this.state.status !== STATUS.INIT && this.state.status !== STATUS.LOAD_STORE_DATA) if (!_lodash2.default.isEqual(_lodash2.default.pick(nextProps, ['type', '$source', "$id"]), _lodash2.default.pick(this.props, ['type', '$source', "$id"]))) {
                //type or any source or id change
                this.state.status = STATUS.INIT;
                this.initial(nextProps);
            }
            var orginRestConfig = _lodash2.default.omit(this.props, ['type', '$source', "$id"]);
            var nextRestConfig = _lodash2.default.omit(nextProps, ['type', '$source', "$id"]);
            if (!_lodash2.default.isEqual(orginRestConfig, nextRestConfig)) {
                //if other props change
                if (_lodash2.default.isEqual(nextProps.$appendConfig, this.props.$appendConfig)) {
                    var newStoreCfg = _extends({}, nextProps.storeCfg, parseOldConfigToStoreConfig(nextProps.config));
                    if (_lodash2.default.has(nextProps, 'config')) this.state.config = nextProps.config;
                    if (!_lodash2.default.isEqual(this.state.storeCfg, newStoreCfg)) {
                        this.state.status = STATUS.LOAD_STORE_DATA;
                        this.state.storeCfg = newStoreCfg;
                        this.loadStoreData(newStoreCfg);
                    } else {
                        var _state = this.state,
                            $store = _state.$store,
                            config = _state.config,
                            storeCfg = _state.storeCfg;

                        _lodash2.default.forEach($store, function (storeData, storeId) {
                            var targetPaths = storeCfg[storeId].targetPaths;
                            targetPaths.forEach(function (targetPath) {
                                _this2.state.config = _objectPathImmutable2.default.set(config, targetPath, storeData);
                            });
                        });
                    }
                } else {
                    //TODO append do not reload widget
                    this.initial(nextProps);
                }
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState, snapshot) {
            if (this.state.status === STATUS.LOAD_STORE_DATA) {
                this.loadStoreData(this.state.storeCfg);
            }
        }
    }, {
        key: 'initial',
        value: function initial(props) {
            var _this3 = this;

            log.info('initial widget', props);
            this.loadRemoteWidgetConfig(props).then(function (widgetConfig) {
                var widget = _widget2.default.loadWidgetSync(widgetConfig.type);
                var lng = _widget2.default.getWidgetLocales();
                //append config
                if (props.$appendConfig) {
                    log.info("widgetConfig: ", _lodash2.default.cloneDeep(widgetConfig));
                    _lodash2.default.forEach(props.$appendConfig, function (val, key) {
                        _lodash2.default.set(widgetConfig, key, val);
                    });
                    log.info("$appendConfig: ", props.$appendConfig);
                }
                if (_lodash2.default.has(widgetConfig, 'locales')) {
                    _lodash2.default.forEach(_lodash2.default.get(widgetConfig, ['locales', lng], {}), function (value, key) {
                        _lodash2.default.set(widgetConfig.config, key, value);
                    });
                }
                var config = widgetConfig.config;
                var storeCfg = _extends({}, widgetConfig.storeCfg, parseOldConfigToStoreConfig(config));
                try {
                    _this3.setState({
                        widget: widget,
                        config: config,
                        storeCfg: storeCfg,
                        info: STATUS.LOAD_STORE_DATA,
                        status: STATUS.LOAD_STORE_DATA,
                        error: false
                    });
                } catch (err) {
                    log.error("onRenderError: ", err);
                    _this3.onRenderError(err);
                    throw err;
                }
            }).catch(function (err) {
                log.error(err);
                _this3.setState({ info: err.message, error: true, status: STATUS.ERROR });
            });
        }
    }, {
        key: 'loadRemoteWidgetConfig',
        value: function loadRemoteWidgetConfig(props) {
            var _this4 = this;

            //handle $source or $id
            var $source = props.$source,
                $id = props.$id;

            if ($id) {
                return _widget2.default.loadConfigById($id).then(function (remoteConfig) {
                    console.log(remoteConfig);
                    if (props.config) {
                        // might come from dashboard or...?
                        remoteConfig.config = _extends({}, remoteConfig.config, props.config);
                    }
                    _this4.setState({ id: $id });
                    return remoteConfig;
                });
            } else if ($source) {
                return _widget2.default.loadWidgetConfigByUrl($source).then(function (remoteConfig) {
                    if (props.config) {
                        // might come from dashboard or...?
                        remoteConfig.config = _extends({}, remoteConfig.config, props.config);
                    }
                    _this4.setState({ id: $source });
                    return remoteConfig;
                });
            } else {
                return new _bluebird2.default(function (resolve) {
                    _this4.setState({ id: 'hardCode' });
                    resolve(_lodash2.default.cloneDeep(props));
                });
            }
        }
    }, {
        key: 'onRenderError',
        value: function onRenderError(e) {
            var onRenderError = this.props.onRenderError;

            log.error('error while render', e);
            if (onRenderError) onRenderError(e);
        }
    }, {
        key: 'renderInner',
        value: function renderInner() {
            var _state2 = this.state,
                Widget = _state2.widget,
                id = _state2.id;

            var config = _lodash2.default.cloneDeep(this.state.config);
            var props = _extends({}, config, { HOC: HOC });
            return _react2.default.createElement(Widget, _extends({ id: 'widget-' + id }, props));
        }
    }, {
        key: 'loadStoreData',
        value: function loadStoreData(storeCfg) {
            var _this5 = this;

            var oldStoreCfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var requestList = {}; //only reload different store
            _lodash2.default.forEach(storeCfg, function (config, storeId) {
                if (!_lodash2.default.isEqual(config, oldStoreCfg[storeId])) requestList[storeId] = config;
            });

            if (_lodash2.default.isEmpty(requestList)) {
                //no need load
                this.setState({ status: STATUS.DONE });
            }

            log.info('Load store data BEGIN');
            var process = [];
            _lodash2.default.forEach(requestList, function (config, storeId) {
                process.push(_widget2.default.loadDataWithQueryConfig(config).then(function (data) {
                    return { key: storeId, data: data };
                }).catch(function (error) {
                    throw { message: 'Store [' + storeId + '] load data failed.', error: error };
                }));
            });
            if (process.length > 0) {
                _bluebird2.default.all(process).then(function (data) {
                    var store = _lodash2.default.chain(data).mapKeys('key').mapValues(function (val) {
                        return val.data;
                    }).value();
                    var $store = _extends({}, _this5.state.$store, store);
                    var config = _this5.state.config;

                    _lodash2.default.forEach($store, function (storeData, storeId) {
                        var targetPaths = storeCfg[storeId].targetPaths;
                        targetPaths.forEach(function (targetPath) {
                            config = _objectPathImmutable2.default.set(config, targetPath, storeData);
                        });
                    });
                    _this5.setState({ config: config, $store: $store, status: STATUS.DONE });
                    log.info('Load store data END', $store);
                }).catch(function (error) {
                    log.error(error);
                    var _error$message = error.message,
                        detail = _error$message === undefined ? '' : _error$message;

                    _this5.setState({ info: 'ERROR', status: STATUS.ERROR });
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _state3 = this.state,
                info = _state3.info,
                status = _state3.status;
            var id = this.state.id;

            if (this.props.id) {
                id = this.props.id;
            }

            switch (status) {
                case STATUS.INIT:
                case STATUS.LOAD_CONFIG:
                case STATUS.LOAD_STORE_DATA:
                    return _react2.default.createElement(
                        'div',
                        { className: 'c-center' },
                        _react2.default.createElement('i', { className: 'fg fg-loading-2 fg-spin' })
                    );
                case STATUS.ERROR:
                default:
                    return _react2.default.createElement(
                        'div',
                        { className: 'c-error c-center' },
                        info
                    );
                case STATUS.DONE:
                    return _react2.default.createElement(
                        'div',
                        { id: id, className: 'hoc-item' },
                        this.renderInner()
                    ); //TODO survey why div need
                // return this.renderInner()
            }
        }
    }]);

    return HOC;
}(_react2.default.Component);

exports.default = HOC;


HOC.propTypes = {
    $id: _propTypes2.default.string,
    $source: _propTypes2.default.string,
    config: _propTypes2.default.object,
    configSource: _propTypes2.default.object,
    data: _propTypes2.default.any,
    dataSource: _propTypes2.default.any,
    forceReload: _propTypes2.default.any,
    id: _propTypes2.default.string,
    onRenderError: _propTypes2.default.func,
    type: _propTypes2.default.string

    /**
     * Cause some old config may have Source config like dataSource etc.
     *
     */
};function parseOldConfigToStoreConfig(config) {
    var storeCfg = {};
    _lodash2.default.forEach(config, function (oldConfig, key) {
        if (!hasSourceEnd(key)) return;
        var query = oldConfig.query,
            selectKey = oldConfig.selectKey,
            isMulti = oldConfig.isMulti;

        var originKey = key.substring(0, key.lastIndexOf('Source'));
        storeCfg[key] = {
            type: "request",
            query: query, selectKey: selectKey, isMulti: isMulti, targetPaths: [originKey]
        };
    });
    return storeCfg;
}

function hasSourceEnd(key) {
    var index = key.lastIndexOf("Source");
    if (index === -1) return false;
    var x = key.length;
    return x - 6 === index;
}