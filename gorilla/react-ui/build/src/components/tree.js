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

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _propWire = require('../hoc/prop-wire');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/tree');

/**
 * A React Tree Component.
 *
 * * Currently supports only single select
 *
 * @constructor
 * @param {string} [id] - Tree element #id
 * @param {string} [className] - Classname for the container
 * @param {object} [data={}] - Data to fill tree with
 * @param {string} [data.id] - node id. Note if top level id is not specified, then root node will not be displayed
 * @param {renderable} [data.label] - node label
 * @param {array<data>} [data.children] - children of the node (can be defined recursively)
 * @param {boolean} [allowToggle=true] - Allow toggle? If false all tree structure will show
 * @param {string} [selected] - Current selected node id
 * @param {string} [defaultSelected] - Default selected node id
 * @param {object} [selectedLink] - link to update selected node id. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {string} selectedLink.value - value to update
 * @param {function} selectedLink.requestChange - function to request selection change
 * @param {function} [onSelect] - Callback function when selection is changed. <br> Required when selected prop is supplied
 * @param {string} onSelect.value - current selected node id
 * @param {object} onSelect.eventInfo - event related info
 * @param {string} onSelect.eventInfo.before - previously selected node id
 * @param {array} onSelect.eventInfo.path - selected node in the form of path (array), with id & child index
 * @param {array<string>} [opened] - Current opened node ids
 * @param {array<string>} [defaultOpened] - Default opened node ids
 * @param {object} [openedLink] - link to update opened node ids. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {array<string>} openedLink.value - value to update
 * @param {function} openedLink.requestChange - function to request open change
 * @param {function} [onToggleOpen] - Callback function when open is changed. <br> Required when opened prop is supplied
 * @param {array<string>} onToggleOpen.value - current opened node ids
 * @param {object} onToggleOpen.eventInfo - event related info
 * @param {array<string>} onToggleOpen.eventInfo.before - previously opened node ids
 * @param {string} onToggleOpen.eventInfo.id - triggering id
 * @param {boolean} onToggleOpen.eventInfo.open - triggered by opening?
 * @param {array<string>} onToggleOpen.eventInfo.path - selected node in the form of path (array), with id & child index
 *
 * @example
// controlled

import _ from 'lodash'
import im from 'object-path-immutable'
import {Tree} from 'react-ui'

const INITIAL_DATA = {
    id:'home',
    label:'Home',
    children:[
        {
            id:'C', label:'C - click to load children dynamically',
            children:[]
        },
        {
            id:'A',
            children: [
                {
                    id:'A.a',
                    children: [
                        {id:'A.a.1'},
                        {
                            id:'A.a.2',
                            children:[
                                {id:'A.a.2.x'},
                                {id:'A.a.2.y'}
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id:'B', label:'B',
            children: [
                {id:'B.a', label:'B.a custom label'},
                {id:'B.b', label:'B.b custom label'}
            ]
        }
    ]
}

React.createClass({
    getInitialState() {
        return {
            allowToggle:true,
            selected:'A.a',
            data:INITIAL_DATA
        }
    },
    toggleAll() {
        let {allowToggle} = this.state;
        this.setState({allowToggle: !allowToggle})
    },
    selectEntry(selected, eventData) {
        this.setState({selected})
    },
    toggleOpen(opened, eventData) {
        let {id, open, path} = eventData;

        if (id === 'C' && open) {
            let setPath = (_(path).map(p=>p.index).tail().map(p=>'children.'+p).value()).join('.')+'.children'

            console.log(`loading more data for ${id}: ${setPath}`)

            let newData = im.set(this.state.data, setPath, [
                {id:'C.a'},
                {id:'C.b'}
            ])
            this.setState({data:newData})
        }
    },
    render() {
        let {data, selected, allowToggle} = this.state;

        return <div>
            <button onClick={this.toggleAll}>{allowToggle?'Disable':'Enable'} toggle</button>
            <Tree
                data={data}
                allowToggle={allowToggle}
                selected={selected}
                defaultOpened={['home','A']}
                onToggleOpen={this.toggleOpen}
                onSelect={this.selectEntry}/>
        </div>
    }
});
 */

var Tree = function (_React$Component) {
    _inherits(Tree, _React$Component);

    function Tree() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Tree);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Tree.__proto__ || Object.getPrototypeOf(Tree)).call.apply(_ref, [this].concat(args))), _this), _this.selectNode = function (id, isBranch, path) {
            var _this$props = _this.props,
                allowToggle = _this$props.allowToggle,
                onSelect = _this$props.onSelect,
                opened = _this$props.opened,
                onToggleOpen = _this$props.onToggleOpen;


            if (isBranch && allowToggle) {
                var idIndex = _lodash2.default.findIndex(opened, function (item) {
                    return item === id;
                });
                var open = idIndex < 0;

                var newOpened = open ? [].concat(_toConsumableArray(opened), [id]) : _objectPathImmutable2.default.del(opened, idIndex);
                onToggleOpen(newOpened, { open: open, id: id, path: path });
            }

            // to resolve onToggleOpen & onSelect setState conflict (onSelect will overwrite onToggleOpen's state)
            // use timeout
            // TODO: think of better way to address
            setTimeout(function () {
                onSelect(id, { path: path });
            }, 0);
        }, _this.renderNode = function (id, isBranch, label, openBranch, path) {
            var _this$props2 = _this.props,
                selected = _this$props2.selected,
                allowToggle = _this$props2.allowToggle;

            var isSelected = id === selected;

            return _react2.default.createElement(
                'span',
                {
                    className: (0, _classnames2.default)(isBranch ? 'branch' : 'leaf', { selected: isSelected }),
                    onClick: _this.selectNode.bind(_this, id, isBranch, path) },
                isBranch && allowToggle ? _react2.default.createElement(
                    'span',
                    null,
                    '[',
                    _react2.default.createElement('i', { className: (0, _classnames2.default)('fg', openBranch ? 'fg-less' : 'fg-add') }),
                    ']',
                    _react2.default.createElement(
                        'span',
                        { className: 'label' },
                        label || id
                    )
                ) : label || id
            );
        }, _this.renderTree = function (root, parentPath, index) {
            var _this$props3 = _this.props,
                allowToggle = _this$props3.allowToggle,
                opened = _this$props3.opened;
            var id = root.id,
                label = root.label,
                children = root.children;


            if (!id) {
                log.error('renderTree::A child without id');
                return null;
            }

            var currentPath = [].concat(_toConsumableArray(parentPath), [{ id: id, index: index }]);

            if (children) {
                var shouldOpen = !allowToggle || _lodash2.default.find(opened, function (item) {
                    return item === id;
                });

                return _react2.default.createElement(
                    'li',
                    { key: id },
                    _this.renderNode(id, true, label, shouldOpen, currentPath),
                    shouldOpen ? _react2.default.createElement(
                        'ul',
                        null,
                        _lodash2.default.map(children, function (child, i) {
                            return _this.renderTree(child, currentPath, i);
                        })
                    ) : null
                );
            } else {
                return _react2.default.createElement(
                    'li',
                    { key: id },
                    _this.renderNode(id, false, label, false, currentPath)
                );
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Tree, [{
        key: 'render',


        // TODO: allow customizing leaf node and parent nodes
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                data = _props.data,
                className = _props.className;
            var rootId = data.id;


            return _react2.default.createElement(
                'ul',
                { id: id, className: (0, _classnames2.default)('c-tree', className) },
                rootId ? this.renderTree(data, []) : _lodash2.default.map(data.children, function (item, i) {
                    return _this2.renderTree(item, [], i);
                })
            );
        }
    }]);

    return Tree;
}(_react2.default.Component);

Tree.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    data: _propTypes2.default.shape({
        id: _propTypes2.default.string,
        label: _propTypes2.default.node,
        children: _propTypes2.default.arrayOf(_propTypes2.default.shape({
            id: _propTypes2.default.string.isRequired,
            label: _propTypes2.default.node,
            children: _propTypes2.default.array
        }))
    }),
    allowToggle: _propTypes2.default.bool, // when false, will overwrite opened config, since full tree will always be opened (opened=true)
    selected: _propTypes2.default.string,
    onSelect: _propTypes2.default.func,
    opened: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onToggleOpen: _propTypes2.default.func
};
Tree.defaultProps = {
    data: {},
    allowToggle: true,
    opened: []
};
exports.default = (0, _propWire.wireSet)(Tree, {
    selected: { defaultValue: '', changeHandlerName: 'onSelect' },
    opened: { defaultValue: [], changeHandlerName: 'onToggleOpen' }
});