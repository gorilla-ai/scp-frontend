'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LABEL_TYPES = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getDtIdsByLabels = getDtIdsByLabels;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactAddonsCreateFragment = require('react-addons-create-fragment');

var _reactAddonsCreateFragment2 = _interopRequireDefault(_reactAddonsCreateFragment);

var _checkboxGroup = require('react-ui/build/src/components/checkbox-group');

var _checkboxGroup2 = _interopRequireDefault(_checkboxGroup);

var _checkbox = require('react-ui/build/src/components/checkbox');

var _checkbox2 = _interopRequireDefault(_checkbox);

var _buttonGroup = require('react-ui/build/src/components/button-group');

var _buttonGroup2 = _interopRequireDefault(_buttonGroup);

var _localeProvider = require('../../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var gt = global.vbdaI18n.getFixedT(null, 'vbda');
var lt = global.vbdaI18n.getFixedT(null, 'search');

var log = require('loglevel').getLogger('vbda/components/search/dt-list');

var LABEL_TYPES = exports.LABEL_TYPES = ['person', 'car', 'case', 'phone', 'others'];

function getDtIdsByLabels(dtCfg, labelTypes) {
    var ifShowOthers = _lodash2.default.indexOf(labelTypes, 'others') !== -1;
    var defaultLabel = ['person', 'car', 'case', 'phone'];
    var compareLabel = _lodash2.default.intersection(labelTypes, ['person', 'car', 'case', 'phone']);
    var dts = _lodash2.default.reduce(dtCfg, function (acc, _ref, dtId) {
        var showSearch = _ref.showSearch;

        if (!showSearch) {
            //檢查本身config，有沒有支援搜尋
            return acc;
        }
        if (labelTypes && _lodash2.default.intersection(labelTypes, dtCfg[dtId].labels).length > 0) {
            //人車案手機對應
            return [].concat(_toConsumableArray(acc), [dtId]);
        }
        if (ifShowOthers && _lodash2.default.intersection(defaultLabel, dtCfg[dtId].labels).length <= 0) {
            return [].concat(_toConsumableArray(acc), [dtId]);
        }
        return acc;
    }, []);
    return dts;
}

var DtList = function (_React$Component) {
    _inherits(DtList, _React$Component);

    function DtList(props) {
        _classCallCheck(this, DtList);

        var _this = _possibleConstructorReturn(this, (DtList.__proto__ || Object.getPrototypeOf(DtList)).call(this, props));

        _this.getAvailableDtList = function (selectedLabelTypes) {
            var _this$props = _this.props,
                _this$props$cfg = _this$props.cfg,
                dt = _this$props$cfg.dt,
                ds = _this$props$cfg.ds,
                currentDtId = _this$props.currentDtId,
                onCurrentDtChange = _this$props.onCurrentDtChange,
                dtsEventCount = _this$props.dtsEventCount;

            var availableDtIds = getDtIdsByLabels(dt, selectedLabelTypes);
            var availableDtList = _lodash2.default.chain(availableDtIds).map(function (dtId) {
                var _dt$dtId = dt[dtId],
                    display_name = _dt$dtId.display_name,
                    sort_order = _dt$dtId.sort_order,
                    dsId = _dt$dtId.ds;


                var dsText = ds[dsId].description || ds[dsId].display_name;
                var dtText = display_name;
                var count = _lodash2.default.get(dtsEventCount, [dtId]);
                var isError = count instanceof Error;

                return {
                    value: dtId,
                    text: '',
                    sort_order: sort_order,
                    children: _react2.default.createElement(
                        'span',
                        {
                            className: (0, _classnames2.default)('c-link c-flex aic', { current: currentDtId === dtId, zero: count === 0 }),
                            onClick: onCurrentDtChange.bind(null, dtId) },
                        dtText,
                        isError ? _react2.default.createElement('i', { className: 'fixed end fg fg-alert-1', title: count.message }) : count != null ? _react2.default.createElement(
                            'div',
                            { className: (0, _classnames2.default)("c-bullet count fixed end", { zero: count === 0 }) },
                            count
                        ) : null
                    )
                };
            }).sortBy('sort_order').map(function (o) {
                delete o.sort_order;
                return o;
            }).value();
            return availableDtList;
        };

        _this.handleLabelTypesChange = function (selectedLabelTypes) {
            _this.setState({ selectedLabelTypes: selectedLabelTypes });
        };

        _this.handleToggleAll = function (selected) {
            var dt = _this.props.cfg.dt;
            var selectedLabelTypes = _this.state.selectedLabelTypes;

            var dts = selected ? getDtIdsByLabels(dt, selectedLabelTypes) : [];
            _this.props.onDtSelectionChange(dts);
        };

        var defaultSelectedLabelTypes = props.defaultSelectedLabelTypes;


        _this.state = {
            selectedLabelTypes: _lodash2.default.isEmpty(defaultSelectedLabelTypes) ? LABEL_TYPES : defaultSelectedLabelTypes
        };
        return _this;
    }

    _createClass(DtList, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            //選擇第一筆有event的資料庫
            var dtsEventCount = nextProps.dtsEventCount;
            var selectedLabelTypes = this.state.selectedLabelTypes;
            var preDtsEventCount = this.props.dtsEventCount;

            if (_lodash2.default.isEmpty(dtsEventCount)) return;
            if (JSON.stringify(dtsEventCount) !== JSON.stringify(preDtsEventCount)) {
                //count不同
                var _props = this.props,
                    dt = _props.cfg.dt,
                    onCurrentDtChange = _props.onCurrentDtChange;

                var availableDtIds = getDtIdsByLabels(dt, selectedLabelTypes);
                var CurrentDtId = null;
                _lodash2.default.forEach(availableDtIds, function (dtId) {
                    if (dtsEventCount[dtId] > 0) {
                        CurrentDtId = dtId;
                        return false;
                    }
                });
                //如果找不到哪一個資料庫可選則清空
                onCurrentDtChange(CurrentDtId);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props2 = this.props,
                selectedDtIds = _props2.selectedDtIds,
                onDtSelectionChange = _props2.onDtSelectionChange,
                useCheckbox = _props2.useCheckbox;
            var selectedLabelTypes = this.state.selectedLabelTypes;

            var availableDtList = this.getAvailableDtList(selectedLabelTypes); //重 load 跟 重新 render  current
            var numSelected = selectedDtIds.length;
            var total = this.getAvailableDtList(LABEL_TYPES).length;
            var List = useCheckbox ? _react2.default.createElement(
                'div',
                { className: 'c-border' },
                _react2.default.createElement(
                    'div',
                    { className: 'all c-padding c-flex inline aic' },
                    _react2.default.createElement(_checkbox2.default, { checked: numSelected > 0,
                        className: (0, _classnames2.default)({ partial: numSelected > 0 && numSelected < total }),
                        onChange: this.handleToggleAll }),
                    _react2.default.createElement(
                        'label',
                        null,
                        lt('lbl-all-dt')
                    )
                ),
                _react2.default.createElement(_checkboxGroup2.default, {
                    id: 'dtList',
                    className: 'c-padding dt-list',
                    list: availableDtList,
                    value: selectedDtIds,
                    onChange: onDtSelectionChange })
            ) : _react2.default.createElement(
                'ul',
                { className: 'dt-list' },
                _lodash2.default.map(availableDtList, function (item, id) {
                    return _react2.default.createElement(
                        'li',
                        { key: id, id: id },
                        item.children
                    );
                })
            );
            var fragment = (0, _reactAddonsCreateFragment2.default)({
                label: _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        null,
                        lt('lbl-type')
                    ),
                    _react2.default.createElement(_buttonGroup2.default, {
                        id: 'types',
                        className: 'jcc',
                        list: _lodash2.default.map(LABEL_TYPES, function (type) {
                            return { value: type, text: lt('type-' + type) };
                        }),
                        multi: true,
                        onChange: function onChange(data) {
                            _this2.handleLabelTypesChange(data);
                        },
                        value: selectedLabelTypes })
                ),
                List: _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        null,
                        lt('lbl-database')
                    ),
                    List
                )
            });
            return _react2.default.createElement(
                'div',
                { className: 'c-vbda-dt-list c-form' },
                fragment
            );
        }
    }]);

    return DtList;
}(_react2.default.Component);

DtList.propTypes = {
    lng: _propTypes2.default.string,
    cfg: _propTypes2.default.shape({
        ds: _propTypes2.default.objectOf(_propTypes2.default.object),
        dt: _propTypes2.default.objectOf(_propTypes2.default.shape({
            searches: _propTypes2.default.arrayOf(_propTypes2.default.string)
        }))
    }).isRequired,
    onCurrentDtChange: _propTypes2.default.func,
    onDtSelectionChange: _propTypes2.default.func,
    defaultSelectedLabelTypes: _propTypes2.default.arrayOf(_propTypes2.default.string),
    selectedDtIds: _propTypes2.default.arrayOf(_propTypes2.default.string),
    currentDtId: _propTypes2.default.string,
    dtsEventCount: _propTypes2.default.object,
    useCheckbox: _propTypes2.default.bool

};
exports.default = (0, _localeProvider2.default)(DtList);