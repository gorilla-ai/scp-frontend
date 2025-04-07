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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactUi = require('react-ui');

var _propWire = require('react-ui/build/src/hoc/prop-wire');

var _label = require('./label');

var _label2 = _interopRequireDefault(_label);

var _localeProvider = require('../../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var lt = global.vbdaI18n.getFixedT(null, 'analysis');
var gt = global.vbdaI18n.getFixedT(null, 'vbda');

var log = require('loglevel').getLogger('vbda/components/analysis/labels');

var PAGE_SIZE = 20;

var Labels = function (_React$Component) {
    _inherits(Labels, _React$Component);

    function Labels(props, context) {
        _classCallCheck(this, Labels);

        var _this = _possibleConstructorReturn(this, (Labels.__proto__ || Object.getPrototypeOf(Labels)).call(this, props, context));

        _initialiseProps.call(_this);

        var labels = props.source.labels;

        var labelTypes = _this.getLabelTypes(labels);

        _this.state = {
            displayType: 'grouped',
            page: 1,
            search: '',
            labelTypes: labelTypes,
            labelStats: _this.getLabelStats(labels),
            currentLabelType: null
        };
        return _this;
    }

    _createClass(Labels, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var labels = nextProps.source.labels;

            var labelTypes = this.getLabelTypes(labels);
            var currentLabelType = this.state.currentLabelType;

            this.setState({
                labelTypes: labelTypes,
                labelStats: this.getLabelStats(labels),
                currentLabelType: _lodash2.default.includes(labelTypes, currentLabelType) ? currentLabelType : null
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                className = _props.className;
            var displayType = this.state.displayType;

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)(className, 'c-flex fdc c-vbda-labels') },
                displayType === 'grouped' ? this.renderList() : this.renderTree()
            );
        }
    }]);

    return Labels;
}(_react2.default.Component);

Labels.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    source: _propTypes2.default.shape({
        labels: _propTypes2.default.objectOf(_propTypes2.default.shape({
            nodeId: _propTypes2.default.string,
            props: _propTypes2.default.object
        })),
        nodes: _propTypes2.default.object,
        links: _propTypes2.default.object
    }),
    sourceCfg: _propTypes2.default.shape({
        dt: _propTypes2.default.object,
        labels: _propTypes2.default.objectOf(_propTypes2.default.shape({
            icon_url: _propTypes2.default.string
        }))
    }).isRequired,
    selectable: _propTypes2.default.bool,
    selected: _propTypes2.default.arrayOf(_propTypes2.default.string),
    hilited: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onSelectionChange: _propTypes2.default.func,
    onClick: _propTypes2.default.func
};
Labels.defaultProps = {
    source: {},
    sourceCfg: {},
    selectable: false,
    selected: [],
    hilited: []
};

var _initialiseProps = function _initialiseProps() {
    var _this2 = this;

    this.getLabelStats = function (labels) {
        return (0, _lodash2.default)(labels).countBy('type').mapValues(function (labelCount) {
            return { total: labelCount };
        }).value();
    };

    this.getLabelTypes = function (labels) {
        return (0, _lodash2.default)(labels).map('type').uniq().value();
    };

    this.handleLabelTypeChange = function (labelType) {
        var currentLabelType = _this2.state.currentLabelType;

        _this2.setState({
            currentLabelType: labelType === currentLabelType ? null : labelType,
            page: 1
        });
    };

    this.handleSelectionChange = function (changedLabel, selected) {
        var _props2 = _this2.props,
            labels = _props2.source.labels,
            selectedLabels = _props2.selected,
            onSelectionChange = _props2.onSelectionChange;


        var newSelectedLabels = void 0;
        if (!changedLabel) {
            // select / unselect all
            newSelectedLabels = selected ? _lodash2.default.keys(labels) : [];
        } else if (_lodash2.default.isArray(changedLabel)) {
            // select / unselect labels
            newSelectedLabels = selected ? _lodash2.default.union(selectedLabels, changedLabel) : _lodash2.default.difference(selectedLabels, changedLabel);
        } else {
            // select / unselect label
            newSelectedLabels = selected ? [].concat(_toConsumableArray(selectedLabels), [changedLabel]) : _lodash2.default.without(selectedLabels, changedLabel);
        }

        onSelectionChange(newSelectedLabels);
    };

    this.handleDisplayTypeChange = function (displayType) {
        _this2.setState({ displayType: displayType });
    };

    this.applyFilter = function () {
        var search = _this2.filterNode.value;
        _this2.setState({ search: search, page: 1 });
    };

    this.handleClearFilter = function () {
        _this2.filterNode.value = '';
        _this2.applyFilter();
    };

    this.gotoPage = function (page) {
        _this2.setState({ page: page });
    };

    this.openSelectedLabels = function () {
        var _props3 = _this2.props,
            sourceCfg = _props3.sourceCfg,
            _props3$source = _props3.source,
            nodes = _props3$source.nodes,
            links = _props3$source.links,
            labels = _props3$source.labels,
            selectedLabelIds = _props3.selected,
            onSelectionChange = _props3.onSelectionChange;

        var selectedLabels = _lodash2.default.pick(labels, selectedLabelIds);
        var newSelectedLabelIds = void 0;
        _reactUi.PopupDialog.promptId('g-selected-intel-dialog', {
            title: lt('dlg-selected-labels'),
            display: _react2.default.createElement(WiredLabels, {
                source: { nodes: nodes, links: links, labels: selectedLabels },
                sourceCfg: sourceCfg,
                selectable: true,
                defaultSelected: _lodash2.default.keys(selectedLabels),
                onSelectionChange: function onSelectionChange(newSelectedLabels) {
                    newSelectedLabelIds = newSelectedLabels;
                } }),
            cancelText: gt('btn-cancel'),
            confirmText: gt('btn-confirm'),
            act: function act(confirmed) {
                if (confirmed) {
                    onSelectionChange(newSelectedLabelIds);
                }
            }
        });
    };

    this.renderList = function () {
        var _props4 = _this2.props,
            labelsCfg = _props4.sourceCfg.labels,
            _props4$source = _props4.source,
            nodes = _props4$source.nodes,
            labels = _props4$source.labels,
            selectable = _props4.selectable,
            selected = _props4.selected,
            hilited = _props4.hilited,
            onClick = _props4.onClick;
        var _state = _this2.state,
            labelTypes = _state.labelTypes,
            currentLabelType = _state.currentLabelType,
            labelStats = _state.labelStats,
            search = _state.search,
            page = _state.page;


        var filteredLabels = _lodash2.default.filter(labels, function (_ref) {
            var nodeId = _ref.nodeId,
                labelProps = _ref.props;

            var nodeProps = nodes[nodeId].props;
            return !search || _lodash2.default.some(_lodash2.default.values(_extends({}, labelProps, nodeProps)), function (item) {
                return (item + '').toLowerCase().indexOf(search.toLowerCase()) >= 0;
            });
        });
        var filteredLabelGroups = _lodash2.default.groupBy(filteredLabels, 'type');
        var filteredLabelIds = _lodash2.default.map(filteredLabels, 'id');
        var selectedFilteredLabelIds = _lodash2.default.intersection(selected, filteredLabelIds);
        // filtered and selected labels
        var selectedFilteredLabelGroups = (0, _lodash2.default)(selectedFilteredLabelIds).map(function (selectedLabel) {
            return labels[selectedLabel];
        }).groupBy('type').value();

        return _react2.default.createElement(
            'div',
            { className: 'grow c-flex fdc c-margin' },
            _react2.default.createElement(
                'div',
                { className: 'c-flex aic fixed search' },
                _react2.default.createElement('input', { className: 'grow', type: 'text', placeholder: lt('ph-search'), ref: function ref(_ref2) {
                        _this2.filterNode = _ref2;
                    } }),
                _react2.default.createElement('i', { className: 'fg fg-close', onClick: _this2.handleClearFilter }),
                _react2.default.createElement(
                    'button',
                    { className: 'fixed', onClick: _this2.applyFilter },
                    gt('btn-search')
                )
            ),
            _lodash2.default.map(labelTypes, function (labelType) {
                var isCurrent = labelType === currentLabelType;
                var labelGroup = filteredLabelGroups[labelType] || [];
                var labelIds = _lodash2.default.map(labelGroup, 'id');
                var selectedLabelGroup = selectedFilteredLabelGroups[labelType] || [];
                var numLabels = labelStats[labelType].total;

                var _ref3 = labelsCfg[labelType] || {},
                    iconUrl = _ref3.icon_url,
                    _ref3$display_name = _ref3.display_name,
                    displayName = _ref3$display_name === undefined ? labelType : _ref3$display_name;

                return _react2.default.createElement(
                    'div',
                    { key: labelType, className: isCurrent ? 'grow c-flex fdc group selected' : 'fixed' },
                    _react2.default.createElement(
                        'div',
                        { className: 'header c-flex fixed', onClick: _this2.handleLabelTypeChange.bind(_this2, labelType) },
                        selectable && _react2.default.createElement(_reactUi.Checkbox, {
                            className: (0, _classnames2.default)({ partial: selectedLabelGroup.length < labelGroup.length }),
                            checked: selectedLabelGroup.length > 0,
                            onChange: _this2.handleSelectionChange.bind(_this2, labelIds) }),
                        iconUrl && _react2.default.createElement('img', { className: 'icon', src: iconUrl }),
                        _react2.default.createElement(
                            'span',
                            { className: 'title' },
                            !labelType ? lt('label-types.others') : displayName
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: (0, _classnames2.default)('c-bullet end', { small: !search }) },
                            search ? labelGroup.length + '/' + numLabels : numLabels
                        )
                    ),
                    isCurrent && _react2.default.createElement(
                        'div',
                        { className: 'list c-flex fww grow' },
                        _lodash2.default.map(_lodash2.default.slice(labelGroup, (page - 1) * PAGE_SIZE, page * PAGE_SIZE), function (labelItem) {
                            return _react2.default.createElement(_label2.default, {
                                key: labelItem.id,
                                className: (0, _classnames2.default)({ hilite: _lodash2.default.includes(hilited, labelItem.id) }),
                                selectable: selectable,
                                selected: selectable ? _lodash2.default.includes(selected, labelItem.id) : false,
                                labelData: labelItem,
                                nodeData: nodes[labelItem.nodeId],
                                onSelect: selectable ? _this2.handleSelectionChange : null,
                                onClick: onClick });
                        })
                    ),
                    isCurrent && labelGroup.length > PAGE_SIZE && _react2.default.createElement(_reactUi.PageNav, {
                        className: 'fixed c-margin center',
                        pages: Math.ceil(labelGroup.length / PAGE_SIZE),
                        current: page,
                        thumbnails: 7,
                        onChange: _this2.gotoPage })
                );
            }),
            selectable && _react2.default.createElement(
                'div',
                { className: 'fixed' },
                _react2.default.createElement(
                    'div',
                    { className: 'header c-flex' },
                    _react2.default.createElement(_reactUi.Checkbox, {
                        className: (0, _classnames2.default)({ partial: selectedFilteredLabelIds.length < filteredLabels.length }),
                        checked: selectedFilteredLabelIds.length > 0,
                        onChange: _this2.handleSelectionChange.bind(_this2, filteredLabelIds) }),
                    _react2.default.createElement(
                        'span',
                        { className: 'title' },
                        lt('lbl-select-all')
                    ),
                    _react2.default.createElement(
                        'span',
                        { className: 'end c-link', onClick: _this2.openSelectedLabels },
                        lt('txt-selected', { total: selected.length })
                    )
                )
            )
        );
    };

    this.renderTree = function () {};
};

var WiredLabels = (0, _propWire.wire)(Labels, 'selected', [], 'onSelectionChange');
exports.default = (0, _localeProvider2.default)(WiredLabels);