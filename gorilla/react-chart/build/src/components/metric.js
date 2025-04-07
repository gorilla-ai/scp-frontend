'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _widgetProvider = require('../hoc/widget-provider');

var _widgetProvider2 = _interopRequireDefault(_widgetProvider);

var _traversal = require('../utils/traversal');

var _propTypes3 = require('../consts/prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('chart/components/metric');

var GROUP_PROP_TYPE = _propTypes2.default.shape({
    header: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.node, _propTypes2.default.func]),
    vertical: _propTypes2.default.bool
});

var BaseMetricChart = function (_React$Component) {
    _inherits(BaseMetricChart, _React$Component);

    function BaseMetricChart() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, BaseMetricChart);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = BaseMetricChart.__proto__ || Object.getPrototypeOf(BaseMetricChart)).call.apply(_ref, [this].concat(args))), _this), _this.getDefaultHeader = function (obj) {
            // Get default header if not provided
            var _this$props = _this.props,
                dataCfg = _this$props.dataCfg,
                valueLabels = _this$props.valueLabels;

            var splitGroup = dataCfg.splitGroup;
            var header = '';

            if (splitGroup) {
                _lodash2.default.forEach(splitGroup, function (val) {
                    var data = _lodash2.default.get(obj, val);
                    var mappedHeader = (0, _traversal.multiTraverse)(valueLabels, [val, data]); // Map the header with the value labels

                    if (mappedHeader) {
                        data = mappedHeader;
                    }
                    header += data + ' - ';
                });
                header = header.slice(0, -3);
            }

            if (_lodash2.default.isNumber(header)) {
                // Convert Number to String for '0' case
                header = header.toString();
            }

            return header;
        }, _this.getGroupHeader = function (mainHeader, header) {
            // Determine the header for different cases (global, main and sub)
            var newHeader = '';

            if (header === false) {
                return false;
            }

            if (!header && mainHeader === false) {
                return false;
            }

            if (header === true || !header) {
                if (mainHeader) {
                    newHeader = mainHeader;
                }
            } else {
                newHeader = header;
            }

            return newHeader;
        }, _this.getGroupVertical = function (group, globalVertical) {
            if (group || group === false) {
                return group;
            } else {
                return globalVertical;
            }
        }, _this.getMatchedData = function (customGroupList) {
            var _this$props2 = _this.props,
                data = _this$props2.data,
                dataCfg = _this$props2.dataCfg;

            var groupBy = dataCfg.splitGroup[0];
            var aggregated = [];
            var splitGroupArr = [];
            var currentValue = '';
            var groupedData = {};

            _lodash2.default.forEach(data, function (item) {
                if (_lodash2.default.get(item, groupBy) && _lodash2.default.get(item, groupBy).toString() !== currentValue) {
                    currentValue = _lodash2.default.get(item, groupBy);
                    splitGroupArr.push(currentValue);
                }
            });

            if (_lodash2.default.isArray(customGroupList) && !_lodash2.default.isEmpty(customGroupList)) {
                splitGroupArr = customGroupList;
            }

            groupedData = _lodash2.default.omit(_lodash2.default.groupBy(data, function (item) {
                return _lodash2.default.get(item, groupBy);
            }), ['undefined']);

            _lodash2.default.forEach(splitGroupArr, function (val) {
                aggregated.push(groupedData[val]);
            });

            return {
                groupedData: groupedData,
                aggregated: aggregated
            };
        }, _this.handleOnClick = function (infoData, data, configData, evt) {
            _this.props.onClick && _this.props.onClick(infoData, data, configData, evt);
        }, _this.handleOnContextMenu = function (infoData, data, configData, evt) {
            _this.props.onContextMenu && _this.props.onContextMenu(infoData, data, configData, evt);
        }, _this.handleOnDoubleClick = function (infoData, data, configData, evt) {
            _this.props.onDoubleClick && _this.props.onDoubleClick(infoData, data, configData, evt);
        }, _this.renderGroup = function (group, groupMatched, vertical, header, globalClass, customClass, index) {
            var _this$props3 = _this.props,
                dataCfg = _this$props3.dataCfg,
                _this$props3$dataCfg = _this$props3.dataCfg,
                splitGroup = _this$props3$dataCfg.splitGroup,
                agg = _this$props3$dataCfg.agg,
                keyLabels = _this$props3.keyLabels,
                valueLabels = _this$props3.valueLabels,
                onClick = _this$props3.onClick,
                onContextMenu = _this$props3.onContextMenu,
                onDoubleClick = _this$props3.onDoubleClick;

            var headerFunction = typeof header === 'function';
            var aggFunction = typeof agg === 'function';
            var configData = {
                dataCfg: dataCfg,
                keyLabels: keyLabels,
                valueLabels: valueLabels
            };
            var infoData = {};
            var data = [];
            var formattedData = [];

            globalClass = globalClass ? ' ' + globalClass : '';
            customClass = customClass ? ' ' + customClass : '';

            if (group[0]) {
                // When the group is an array
                if (splitGroup) {
                    data = groupMatched[_lodash2.default.get(group[0], splitGroup[0])];

                    if (splitGroup.length > 1) {
                        var dataObj = {};

                        _lodash2.default.forEach(splitGroup, function (val, i) {
                            if (i !== 0) {
                                _lodash2.default.set(dataObj, val, _lodash2.default.get(group[0], val));
                            }
                        });
                        data = _lodash2.default.filter(data, dataObj);
                    }
                }
            } else {
                // When the group is an object
                if (splitGroup) {
                    var _dataObj = {};
                    var matchStr = '';

                    _lodash2.default.forEach(splitGroup, function (val, i) {
                        var dataVal = _lodash2.default.get(group, val);

                        if (val.length === 0 && i !== 0) {
                            _dataObj[val] = dataVal;
                        }

                        if (val.length > 0) {
                            if (i === 0) {
                                matchStr = dataVal;
                            } else {
                                _lodash2.default.set(_dataObj, val, dataVal);
                            }
                        }
                    });

                    if (matchStr) {
                        data = _lodash2.default.filter(groupMatched[matchStr], _dataObj);
                    } else {
                        data = _lodash2.default.filter(groupMatched[group[splitGroup[0]]], _dataObj);
                    }

                    if (data.length === 0) {
                        return;
                    }
                }
                group = [group];
            }

            if (!splitGroup) {
                data = groupMatched;
            }

            infoData = {
                isMainGroup: typeof index === 'undefined',
                matched: data.length
            };

            if (!header && header !== false && splitGroup) {
                header = _this.getDefaultHeader(group[0]);
            }

            _lodash2.default.forEach(group, function (val) {
                formattedData.push(_lodash2.default.pick(val, agg)); // Filter out the keys that are not in agg
            });

            if (splitGroup) {
                var splitGroupValue = [];

                _lodash2.default.forEach(splitGroup, function (val) {
                    splitGroupValue.push(_lodash2.default.get(group[0], val));
                });

                infoData = _extends({}, infoData, {
                    splitGroup: splitGroupValue
                });
            }

            if (agg && !aggFunction) {
                var aggValue = [];

                _lodash2.default.forEach(agg, function (val) {
                    aggValue.push(_lodash2.default.get(formattedData[0], val));
                });

                infoData = _extends({}, infoData, {
                    agg: aggValue
                });
            }

            if (headerFunction) {
                // If custom header function is provided
                header = header(infoData, data, configData);
            }

            return _react2.default.createElement(
                'div',
                {
                    className: (0, _classnames2.default)('group-parent' + globalClass + customClass, { vertical: vertical }),
                    key: index },
                header && !header.type && _react2.default.createElement(
                    'header',
                    {
                        onClick: onClick ? _this.handleOnClick.bind(_this, infoData, data, configData) : null,
                        onContextMenu: onContextMenu ? _this.handleOnContextMenu.bind(_this, infoData, data, configData) : null,
                        onDoubleClick: onDoubleClick ? _this.handleOnDoubleClick.bind(_this, infoData, data, configData) : null },
                    header
                ),
                header && header.type === 'img' && _react2.default.createElement(
                    'header',
                    {
                        onClick: onClick ? _this.handleOnClick.bind(_this, infoData, data, configData) : null,
                        onContextMenu: onContextMenu ? _this.handleOnContextMenu.bind(_this, infoData, data, configData) : null,
                        onDoubleClick: onDoubleClick ? _this.handleOnDoubleClick.bind(_this, infoData, data, configData) : null },
                    _react2.default.createElement('img', { src: header.props.src, title: header.props.title, alt: header.props.title })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'group' },
                    aggFunction && _react2.default.createElement(
                        'div',
                        {
                            onClick: onClick ? _this.handleOnClick.bind(_this, infoData, data, configData) : null,
                            onContextMenu: onContextMenu ? _this.handleOnContextMenu.bind(_this, infoData, data, configData) : null,
                            onDoubleClick: onDoubleClick ? _this.handleOnDoubleClick.bind(_this, infoData, data, configData) : null },
                        agg(infoData, data, configData)
                    ),
                    !aggFunction && _lodash2.default.keys(formattedData[0]).map(function (key, i) {
                        return _this.renderItem(formattedData[0], infoData, data, configData, key, i);
                    })
                )
            );
        }, _this.renderItem = function (item, infoData, data, configData, key, index) {
            var _this$props4 = _this.props,
                dataCfg = _this$props4.dataCfg,
                keyLabels = _this$props4.keyLabels,
                valueLabels = _this$props4.valueLabels,
                onClick = _this$props4.onClick,
                onContextMenu = _this$props4.onContextMenu,
                onDoubleClick = _this$props4.onDoubleClick;

            var value = '';
            var origKey = key;
            var pathArr = [];
            var newInfoData = _extends({}, infoData);

            if (typeof item[key] === 'string' || typeof item[key] === 'number') {
                value = item[key];
            } else {
                if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object') {
                    origKey = dataCfg.agg[0];
                    value = _lodash2.default.get(item, origKey);
                } else {
                    pathArr.push(key);
                    pathArr.push(_lodash2.default.keys(item[key]).toString());
                    pathArr.push(_lodash2.default.get(item, pathArr));
                    value = (0, _traversal.multiTraverse)(valueLabels, pathArr);
                }
            }
            key = keyLabels[key] ? keyLabels[key] : key;
            newInfoData.aggKey = origKey;

            return _react2.default.createElement(
                'div',
                {
                    className: 'item',
                    key: index,
                    onClick: onClick ? _this.handleOnClick.bind(_this, newInfoData, data, configData) : null,
                    onContextMenu: onContextMenu ? _this.handleOnContextMenu.bind(_this, newInfoData, data, configData) : null,
                    onDoubleClick: onDoubleClick ? _this.handleOnDoubleClick.bind(_this, newInfoData, data, configData) : null },
                _react2.default.createElement(
                    'span',
                    { className: 'value' },
                    value
                ),
                _react2.default.createElement(
                    'span',
                    { className: 'label' },
                    key
                )
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(BaseMetricChart, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                title = _props.title,
                data = _props.data,
                _props$dataCfg = _props.dataCfg,
                splitGroup = _props$dataCfg.splitGroup,
                agg = _props$dataCfg.agg,
                group = _props.group,
                groups = _props.groups;

            var mainData = {};
            var customGroupList = '';
            var aggregated = [];
            var groupedData = {};
            var subAggregated = [];
            var globalVertical = '';
            var globalClass = '';
            var mainHeader = '';
            var mainVertical = '';
            var mainGroupClass = '';
            var subTitle = '';
            var subClass = '';
            var subHeader = '';
            var subVertical = '';
            var subGroupClass = '';

            if (groups.list) {
                if (typeof groups.list === 'function') {
                    customGroupList = groups.list();
                } else {
                    customGroupList = groups.list;
                }
            }

            if (typeof agg === 'function') {
                // If custom agg function is provided
                mainData = this.getMatchedData(customGroupList);
                aggregated = mainData.aggregated;
                groupedData = mainData.groupedData;
            } else {
                var groupBy = splitGroup;

                aggregated = _lodash2.default.values(_lodash2.default.reduce(data, function (acc, item) {
                    var keyObj = _lodash2.default.pick(item, groupBy);
                    var key = JSON.stringify(keyObj);

                    if (!acc[key]) {
                        acc[key] = _extends({}, keyObj, { __raw: [] });
                    }

                    _lodash2.default.forEach(agg, function (val) {
                        _lodash2.default.set(acc[key], val, _lodash2.default.get(acc[key], val, 0) + _lodash2.default.get(item, val, 0));
                    });

                    acc[key].__raw.push(item);

                    return acc;
                }, []));

                if (_lodash2.default.isArray(customGroupList) && !_lodash2.default.isEmpty(customGroupList)) {
                    var splitGroupArr = customGroupList;
                    var dataObj = {};
                    var newAggregated = [];

                    _lodash2.default.forEach(splitGroupArr, function (item) {
                        _lodash2.default.forEach(groupBy, function (val, i) {
                            _lodash2.default.set(dataObj, val, item[i]);
                        });
                        newAggregated.push(_lodash2.default.filter(aggregated, dataObj));
                    });
                    aggregated = newAggregated;
                }

                if (groupBy) {
                    mainData = this.getMatchedData(customGroupList);
                    groupedData = mainData.groupedData;
                } else {
                    groupedData = data;
                }
            }

            if (groups.sort) {
                var sortOption = groups.sort;
                var field = [];
                var desc = [];

                _lodash2.default.forEach(sortOption, function (item) {
                    field.push(item.field);

                    if (item.desc) {
                        desc.push('desc');
                    } else {
                        desc.push('asc');
                    }
                });
                aggregated = _lodash2.default.orderBy(aggregated, field, desc);
            }

            // For global group
            mainHeader = this.getGroupHeader('', group.header);
            globalVertical = this.getGroupVertical(group.vertical, true);
            mainVertical = globalVertical;

            if (group.className) {
                globalClass = group.className;
            }

            if (aggregated.length > 1) {
                subAggregated = _lodash2.default.cloneDeep(aggregated);
                subAggregated.shift();

                if (!_lodash2.default.isEmpty(groups)) {
                    if (groups.main && groups.main.group) {
                        // For main group
                        mainHeader = this.getGroupHeader(mainHeader, groups.main.group.header);
                        mainVertical = this.getGroupVertical(groups.main.group.vertical, globalVertical);
                        mainGroupClass = groups.main.group.className;
                    }

                    if (groups.sub) {
                        // For sub group
                        subTitle = groups.sub.title ? groups.sub.title : '';
                        subClass = groups.sub.className;

                        if (groups.sub.group) {
                            subHeader = this.getGroupHeader(mainHeader, groups.sub.group.header);
                            subVertical = this.getGroupVertical(groups.sub.group.vertical, globalVertical);
                            subGroupClass = groups.sub.group.className;
                        } else {
                            subHeader = mainHeader;
                            subVertical = globalVertical;
                        }
                    }
                }
            }

            subClass = subClass ? ' ' + subClass : '';

            return _react2.default.createElement(
                'div',
                { id: id, className: 'c-chart-metric' },
                title && _react2.default.createElement(
                    'div',
                    { className: 'chart-title' },
                    title
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'content' },
                    !_lodash2.default.isEmpty(aggregated) && _react2.default.createElement(
                        'div',
                        { className: 'main-container' },
                        this.renderGroup(aggregated[0], groupedData, mainVertical, mainHeader, globalClass, mainGroupClass)
                    ),
                    !_lodash2.default.isEmpty(subAggregated) && _react2.default.createElement(
                        'div',
                        { className: 'sub-container' + subClass },
                        subTitle && _react2.default.createElement(
                            'div',
                            { className: 'sub-title' },
                            subTitle
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'sub-content' },
                            subAggregated.map(function (val, index) {
                                return _this2.renderGroup(val, groupedData, subVertical, subHeader, globalClass, subGroupClass, index);
                            })
                        )
                    )
                )
            );
        }
    }]);

    return BaseMetricChart;
}(_react2.default.Component);

/**
 * A React Metric Chart
 * @constructor
 * @param {string} [id] - Chart dom element #id
 * @param {string} [className] - Classname for the chart
 * @param {renderable} [title] - Title for the chart
 * @param {array} data - Data, see below example
 * @param {object} dataCfg - Mapping between data shape and chart
 * @param {string | array.<string>} [dataCfg.splitChart] - if specified, will split into multiple charts based on the given key/path
 * @param {array.<string | array.<string>>} [dataCfg.splitGroup] - if specified, split into multiple metric groups based on the given keys/paths
 * @param {array.<string | array.<string>> | function} dataCfg.agg - aggregation setting
 * * array - specify aggregation columns
 * * function - function returning customized aggrgated value, given params (info, data, cfg) (see onClick event below)
 * @param {object} [group] - global metric group setting
 * @param {boolean | renderable | function} [group.header] - group header to show at the top of the group
 * * absent - default to corresponding value derived from *splitGroup* prop
 * * boolean - show/hide header
 * * renderable - static header
 * * function - function returning customized header, given params (info, data, cfg) (see onClick event below)
 * @param {boolean} [group.vertical=true] - whether group items are displayed in vertical layout
 * @param {object} [groups] - metric groups setting
 * @param {array} [groups.sort] - metric groups sort order
 * @param {array | function} [groups.list] - metric groups list
 * @param {object} [groups.main] - metric main group setting
 * @param {object} [groups.main.group] - group setting for main group, will overwrite global *group* prop if present
 * @param {object} [groups.sub] - metric subgroups setting
 * @param {string} [groups.sub.className] - className for subgroups container
 * @param {renderable} [groups.sub.title] - title for subgroups container
 * @param {object} [groups.sub.group] - group setting to apply to individual group in subgroups, will overwrite global *group* prop if present
 * @param {object} [keyLabels] - Key/label pairs for all the keys, see below for example
 * @param {object} [valueLabels] - Value/label pairs for all the values, see below for example
 * @param {function} [onClick] - Function to call when clicked
 * @param {object} onClick.eventInfo - info on the clicked item
 * @param {number} onClick.eventInfo.matched - number of data items associated with this item
 * @param {string} onClick.eventInfo.splitChart - associated chart value
 * @param {array} onClick.eventInfo.splitGroup - associated group value
 * @param {array} onClick.eventInfo.agg - associated aggregation value
 * @param {object} onClick.data - data of the current hovered item
 * @param {object} onClick.cfg - data related cfg for this chart
 * @param {object} onClick.cfg.dataCfg
 * @param {object} [onClick.cfg.keyLabels]
 * @param {object} [onClick.cfg.valueLabels]
 * @param {function} [onContextMenu] - Function to call when right clicked, see onClick for callback function spec
 * @param {function} [onDoubleClick] - Function to call when double clicked, see onClick for callback function spec
 *
 * @example
//
 */


BaseMetricChart.propTypes = {
    id: _propTypes2.default.string,
    title: _propTypes2.default.node,
    data: _propTypes2.default.arrayOf(_propTypes3.DATA_ITEM_PROP).isRequired,
    dataCfg: _propTypes2.default.shape({
        splitGroup: _propTypes2.default.arrayOf(_propTypes3.KEY_MAPPING_PROP),
        agg: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes3.KEY_MAPPING_PROP), _propTypes2.default.func]).isRequired
    }),
    group: GROUP_PROP_TYPE,
    groups: _propTypes2.default.shape({
        list: _propTypes2.default.oneOfType([_propTypes2.default.array, _propTypes2.default.func]),
        sort: _propTypes2.default.arrayOf(_propTypes2.default.shape({
            field: _propTypes2.default.string,
            desc: _propTypes2.default.bool
        })),
        main: _propTypes2.default.shape({
            group: GROUP_PROP_TYPE
        }),
        sub: _propTypes2.default.shape({
            className: _propTypes2.default.string,
            title: _propTypes2.default.node,
            group: GROUP_PROP_TYPE
        })
    }),
    keyLabels: _propTypes3.DATA_ITEM_PROP,
    valueLabels: _propTypes2.default.objectOf(_propTypes3.DATA_ITEM_PROP),
    onClick: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func
};
BaseMetricChart.defaultProps = {
    data: [],
    group: {},
    groups: {},
    keyLabels: {},
    valueLabels: {}
};
var MetricChart = (0, _widgetProvider2.default)(BaseMetricChart);

exports.default = MetricChart;