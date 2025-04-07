'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _checkbox = require('./checkbox');

var _checkbox2 = _interopRequireDefault(_checkbox);

var _propWire = require('../hoc/prop-wire');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/hierarchy');

/**
 * A React Hierarchy Component. Can be visually presented as tree or accordion layout.
 *
 * @constructor
 * @param {string} [id] - Hierarchy element #id
 * @param {string} [className] - Classname for the container
 * @param {'accordion'|'tree'} [layout='accordion'] - How to display the hierarchy structure?
 * @param {boolean} [foldable=true] - Allow expand/collapse (branch) nodes? If false all hierarchy structure will show
 * @param {number|array<number>} [indent] - Indentation for each node level:
 * * if number, this will be used for indentation of all levels
 * * if array, each array item will represent indentation of corresponding levels, if number of levels exceed array size,
 * then last defined indentation will be used for all subsequent levels
 * @param {object} [data={}] - Data to fill hierarchy with
 * @param {string} [data.id] - node id. Note if top level id is not specified, then root node will not be displayed
 * @param {renderable} [data.label] - node label
 * @param {string} [data.className] - Classname for the node
 * @param {boolean} [data.foldable=true] - Allow expand/collapse this node? If specified will overwrite global *foldable* setting above
 * @param {number} [data.indent] - Indentation for this node. If specified will overwrite global *indent* setting above
 * @param {boolean} [data.disabled=false] - Turning off selection for this node?
 * @param {array<data>} [data.children] - children of the node (can be defined recursively)
 * @param {object} [selection] - Node selection settings
 * @param {boolean} [selection.enabled=false] - Allow selecting nodes?
 * @param {array.<string>} [defaultSelected] - Default selected (leaf) node ids
 * @param {array.<string>} [selected] - Selected (leaf) node ids
 * @param {function} [onSelectionChange] - Callback function when node is selected. <br> Required when selected prop is supplied
 * @param {array.<string>} onSelectionChange.value - current selected (leaf) node ids
 * @param {object} onSelectionChange.eventInfo - event related info
 * @param {array.<string>} onSelectionChange.eventInfo.before - previous selected (leaf) node ids
 * @param {array.<string>} onSelectionChange.eventInfo.ids - (leaf) node ids triggering change
 * @param {boolean} onSelectionChange.eventInfo.selected - selected?
 * @param {string} [current] - Current node id
 * @param {string} [defaultCurrent] - Default current node id
 * @param {function} [onLabelClick] - Callback function when current node is changed. <br> Required when current prop is supplied
 * @param {string} onLabelClick.value - current node id
 * @param {object} onLabelClick.eventInfo - event related info
 * @param {string} onLabelClick.eventInfo.before - previously current node id
 * @param {array} onLabelClick.eventInfo.path - current node in the form of path (array), with id & child index
 * @param {boolean} onLabelClick.eventInfo.isBranch - whether this node is branch
 * @param {function} [onLabelMouseOver] - Callback function when node label is hovered
 * @param {string} onLabelMouseOver.id - hovered node id
 * @param {object} onLabelMouseOver.eventInfo - event related info
 * @param {array} onLabelMouseOver.eventInfo.path - current hovered node in the form of path (array), with id & child index
 * @param {boolean} onLabelMouseOver.eventInfo.isBranch - whether this node is branch
 * @param {array.<string>} [opened] - Current opened node ids
 * @param {array.<string>} [defaultOpened] - Default opened node ids
 * @param {function} [onToggleOpen] - Callback function when open is changed. <br> Required when opened prop is supplied
 * @param {array.<string>} onToggleOpen.value - current opened (branch) node ids
 * @param {object} onToggleOpen.eventInfo - event related info
 * @param {array.<string>} onToggleOpen.eventInfo.before - previously opened (branch) node ids
 * @param {string} onToggleOpen.eventInfo.id - triggering (branch) node id
 * @param {boolean} onToggleOpen.eventInfo.open - triggered by opening?
 * @param {array.<string>} onToggleOpen.eventInfo.path - triggering node in the form of path (array), with id & child index
 *
 * @example
// controlled

import _ from 'lodash'
import {Form, Hierarchy} from 'react-ui'


const INITIAL_DATA = {
    id: 'home',
    label: 'Home',
    children: [
        {
            id: 'A',
            children: [
                {
                    id: 'A.a',
                    children: [
                        {id:'A.a.1'},
                        {
                            id: 'A.a.2',
                            children: [
                                {id:'A.a.2.x'},
                                {id:'A.a.2.y'}
                            ]
                        }
                    ]
                },
                {
                    id: 'A.b',
                    children: [
                        {id:'A.b.1'},
                        {id:'A.b.2'},
                        {id:'A.b.3'}
                    ]
                }
            ]
        },
        {
            id: 'B', label: 'B',
            children: [
                {id:'B.a', label:'B.a custom label'},
                {id:'B.b', label:'B.b custom label'}
            ]
        }
    ]
}

Examples.Hierarchy = React.createClass({
    getInitialState() {
        return {
            current: 'A.a',
            selected: [],
            data: INITIAL_DATA,
            settings: {
                showRoot: false,
                foldable: true,
                selectable: true,
                layout: 'accordion'
            }
        }
    },
    handleLabelClick(current) {
        this.setState({current})
    },
    handleSelectChange(selected) {
        this.setState({selected})
    },
    renderDemoSettings() {
        const {settings} = this.state
        return <Form
            className='demo-settings'
            formClassName='inline'
            fields={{
                showRoot: {
                    label: 'Show Root?',
                    editor: 'Checkbox'
                },
                foldable: {
                    label: 'Allow Expand/Collapse?',
                    editor: 'Checkbox'
                },
                selectable: {
                    label: 'Selectable?',
                    editor: 'Checkbox'
                },
                layout: {
                    label: 'Layout',
                    editor: 'RadioGroup',
                    props: {
                        className: 'inline',
                        list: _.map(['tree', 'accordion'], l=>({value:l, text:l}))
                    }
                }
            }}
            value={settings}
            onChange={newSettings=>{ this.setState({settings:newSettings}) }} />
    },
    render() {
        let {data, current, selected, settings:{showRoot, foldable, selectable, layout}} = this.state

        return <div>
            {this.renderDemoSettings()}
            <Hierarchy
                layout={layout}
                foldable={foldable}
                data={showRoot?data:{children:data.children}}
                selection={{
                    enabled: selectable
                }}
                selected={selected}
                onSelectionChange={this.handleSelectChange}
                current={current}
                onLabelClick={this.handleLabelClick}
                defaultOpened={['home', 'A']} />
        </div>
    }
})
 */

var Hierarchy = function (_React$Component) {
    _inherits(Hierarchy, _React$Component);

    function Hierarchy() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Hierarchy);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Hierarchy.__proto__ || Object.getPrototypeOf(Hierarchy)).call.apply(_ref, [this].concat(args))), _this), _this.getLeafNodeIds = function (path) {
            var data = _this.props.data;

            var pathIgnoringRoot = _lodash2.default.first(path).index == null ? _lodash2.default.tail(path) : path;
            var nodePath = _lodash2.default.isEmpty(pathIgnoringRoot) ? null : 'children.' + _lodash2.default.map(pathIgnoringRoot, 'index').join('.children.');
            var currentNode = nodePath ? _lodash2.default.get(data, nodePath) : data;
            var children = currentNode.children;
            if (!children) {
                return [currentNode.id];
            } else {
                var ids = _lodash2.default.flatten(_lodash2.default.map(children, function (child, idx) {
                    return _this.getLeafNodeIds([].concat(_toConsumableArray(path), [{ id: child.id, index: idx }]));
                }));
                return ids;
            }
        }, _this.handleToggleNode = function (id, path) {
            var _this$props = _this.props,
                opened = _this$props.opened,
                onToggleOpen = _this$props.onToggleOpen;


            var open = !_lodash2.default.includes(opened, id);

            var newOpened = open ? [].concat(_toConsumableArray(opened), [id]) : _lodash2.default.without(opened, id);
            onToggleOpen(newOpened, { open: open, id: id, path: path });
        }, _this.handleSelectLabel = function (id, path, isBranch) {
            var onLabelClick = _this.props.onLabelClick;

            onLabelClick(id, { path: path, isBranch: isBranch });
        }, _this.handleHoverLabel = function (id, path, isBranch) {
            var onLabelMouseOver = _this.props.onLabelMouseOver;

            onLabelMouseOver && onLabelMouseOver(id, { path: path, isBranch: isBranch });
        }, _this.handleSelectNode = function (path, checked) {
            var selected = _this.props.selected;
            var onSelectionChange = _this.props.onSelectionChange;

            var ids = _this.getLeafNodeIds(path);
            var newSelected = void 0;
            if (checked) {
                newSelected = _lodash2.default.uniq([].concat(_toConsumableArray(selected), _toConsumableArray(ids)));
            } else {
                newSelected = _lodash2.default.without.apply(_lodash2.default, [selected].concat(_toConsumableArray(ids)));
            }
            onSelectionChange(newSelected, { ids: ids, selected: checked });
        }, _this.renderNode = function (id, label, className, path, disabled, isBranch, foldable, openBranch) {
            var _this$props2 = _this.props,
                current = _this$props2.current,
                selected = _this$props2.selected,
                selectable = _this$props2.selection.enabled,
                layout = _this$props2.layout;

            var asTree = layout === 'tree';
            var isCurrent = id === current;
            var childrenIds = _this.getLeafNodeIds(path);
            var numSelected = _lodash2.default.intersection(selected, childrenIds).length;

            return _react2.default.createElement(
                'span',
                {
                    style: asTree ? null : { paddingLeft: _lodash2.default.last(path).indent },
                    className: (0, _classnames2.default)('c-flex node', className, { current: isCurrent, selected: numSelected > 0 }) },
                asTree && isBranch && foldable && _react2.default.createElement(
                    'span',
                    { className: 'toggler fixed', onClick: _this.handleToggleNode.bind(_this, id, path) },
                    '[',
                    _react2.default.createElement('i', { className: (0, _classnames2.default)('fg', openBranch ? 'fg-less' : 'fg-add') }),
                    ']'
                ),
                selectable && _react2.default.createElement(_checkbox2.default, {
                    checked: numSelected > 0,
                    disabled: disabled,
                    className: (0, _classnames2.default)('fixed selector', { partial: numSelected > 0 && numSelected < childrenIds.length }),
                    onChange: _this.handleSelectNode.bind(_this, path) }),
                _react2.default.createElement(
                    'span',
                    {
                        className: 'label grow',
                        onClick: _this.handleSelectLabel.bind(_this, id, path, isBranch),
                        onMouseOver: _this.handleHoverLabel.bind(_this, id, path, isBranch) },
                    label || id
                ),
                !asTree && isBranch && foldable && _react2.default.createElement(
                    'span',
                    { className: 'toggler fixed', onClick: _this.handleToggleNode.bind(_this, id, path) },
                    _react2.default.createElement('i', { className: (0, _classnames2.default)('fg', openBranch ? 'fg-arrow-top' : 'fg-arrow-bottom') })
                )
            );
        }, _this.renderHierarchy = function (root, parentPath, index) {
            var id = root.id;


            if (!id) {
                log.error('renderHierarchy::A child without id');
                return null;
            }

            var _this$props3 = _this.props,
                foldable = _this$props3.foldable,
                opened = _this$props3.opened,
                indent = _this$props3.indent;

            var indentCfg = _lodash2.default.isArray(indent) ? indent : [indent];
            var level = parentPath.length + 1;
            var label = root.label,
                className = root.className,
                _root$disabled = root.disabled,
                disableLayer = _root$disabled === undefined ? false : _root$disabled,
                _root$foldable = root.foldable,
                layerFoldable = _root$foldable === undefined ? foldable : _root$foldable,
                _root$indent = root.indent,
                layerIndent = _root$indent === undefined ? _lodash2.default.get(indentCfg, level - 1, _lodash2.default.last(indentCfg)) : _root$indent,
                children = root.children;

            var currentPath = [].concat(_toConsumableArray(parentPath), [{ id: id, index: index, indent: _lodash2.default.get(_lodash2.default.last(parentPath), 'indent', 0) + layerIndent }]);

            if (children) {
                var shouldOpen = !layerFoldable || _lodash2.default.find(opened, function (item) {
                    return item === id;
                });

                return _react2.default.createElement(
                    'li',
                    { key: id, className: (0, _classnames2.default)('branch', 'level-' + level) },
                    _this.renderNode(id, label, className, currentPath, disableLayer, true, layerFoldable, shouldOpen),
                    shouldOpen ? _react2.default.createElement(
                        'ul',
                        { className: 'children' },
                        _lodash2.default.map(children, function (child, i) {
                            return _this.renderHierarchy(child, currentPath, i);
                        })
                    ) : null
                );
            } else {
                return _react2.default.createElement(
                    'li',
                    { key: id, className: (0, _classnames2.default)('leaf', 'level-' + level) },
                    _this.renderNode(id, label, className, currentPath, disableLayer, false, false, false)
                );
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Hierarchy, [{
        key: 'render',


        // TODO: allow customizing leaf node and parent nodes
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                data = _props.data,
                className = _props.className,
                layout = _props.layout;
            var rootId = data.id;


            return _react2.default.createElement(
                'ul',
                { id: id, className: (0, _classnames2.default)('c-hierarchy', layout, className) },
                rootId ? this.renderHierarchy(data, []) : _lodash2.default.map(data.children, function (item, i) {
                    return _this2.renderHierarchy(item, [], i);
                })
            );
        }
    }]);

    return Hierarchy;
}(_react2.default.Component);

Hierarchy.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    layout: _propTypes2.default.oneOf(['tree', 'accordion']),
    foldable: _propTypes2.default.bool, // when false, will overwrite opened config, since full hierarchy will always be opened (opened=true)
    indent: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.arrayOf(_propTypes2.default.number)]),
    data: _propTypes2.default.shape({
        id: _propTypes2.default.string,
        label: _propTypes2.default.node,
        className: _propTypes2.default.string,
        foldable: _propTypes2.default.bool,
        indent: _propTypes2.default.number,
        disabled: _propTypes2.default.bool,
        children: _propTypes2.default.arrayOf(_propTypes2.default.shape({
            id: _propTypes2.default.string.isRequired,
            label: _propTypes2.default.node,
            className: _propTypes2.default.string,
            foldable: _propTypes2.default.bool,
            indent: _propTypes2.default.number,
            disabled: _propTypes2.default.bool,
            children: _propTypes2.default.array
        }))
    }),
    selection: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool
    }),
    selected: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onSelectionChange: _propTypes2.default.func,
    current: _propTypes2.default.string,
    onLabelClick: _propTypes2.default.func,
    onLabelMouseOver: _propTypes2.default.func,
    opened: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onToggleOpen: _propTypes2.default.func
};
Hierarchy.defaultProps = {
    layout: 'accordion',
    foldable: true,
    indent: [4, 30],
    data: {},
    selection: {
        enabled: false
    },
    selected: [],
    opened: []
};
exports.default = (0, _propWire.wireSet)(Hierarchy, {
    current: { defaultValue: '', changeHandlerName: 'onLabelClick' },
    selected: { defaultValue: [], changeHandlerName: 'onSelectionChange' },
    opened: { defaultValue: [], changeHandlerName: 'onToggleOpen' }
});