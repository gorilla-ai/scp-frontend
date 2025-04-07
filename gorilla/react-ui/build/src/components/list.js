'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _propWire = require('../hoc/prop-wire');

var _checkbox = require('./checkbox');

var _checkbox2 = _interopRequireDefault(_checkbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/list');

/**
 * A React List view, currently effective classNames are multicols, decimal, disc
 * @todo Better support for defining how many columns; better support for rendering list items
 *
 * @constructor
 * @param {string} [id] - List dom element #id
 * @param {string} [className] - Classname for the container, avaiable built-in classnames:
 * * selectable - Change color when hovering over list item
 * * multicols - SShow list as multi-columns
 * @param {object|array} list - Data list
 * @param {string} [itemIdField='id'] - The field key which will be used as item dom #id
 * @param {string | function} [itemClassName] - Classname of a list item
 * @param {string | function} [itemStyle] - Style of a list item
 * @param {function} [formatter] - Function to render list item
 * @param {object} [selection] - List item selection settings
 * @param {boolean} [selection.enabled=false] - Are list items selectable? If yes checkboxes will appear
 * @param {boolean} [selection.multiSelect=true] - Can select multiple items?
 * @param {string | array.<string>} [defaultSelected] - Selected item id(s)
 * @param {string | array.<string>} [selected] - Default selected item id(s)
 * @param {object} [selectedLink] - Link to update selections. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} selectedLink.value - value to update
 * @param {function} selectedLink.requestChange - function to request value change
 * @param {function} [onSelectionChange] - Callback function when item is selected. <br> Required when selected prop is supplied
 * @param {string | array} onSelectionChange.value - current selected item ids
 * @param {object} onSelectionChange.eventInfo - event related info
 * @param {string | array} onSelectionChange.eventInfo.before - previous selected item ids
 * @param {string} onSelectionChange.eventInfo.id - id triggering change
 * @param {boolean} onSelectionChange.eventInfo.selected - selected?
 * @param {function} [onClick] [description]
 * @param {renderable} [info] - React renderable object, display additional information about the list
 * @param {string} [infoClassName] - Assign className to info node
 *
 * @example

import _ from 'lodash'
import {List} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            movies: _(_.range(0, 200)).map(i=>({id:`${i}`, title:`Movie ${i}`})).value() // 200 movies
        }
    },
    render() {
        const {movies} = this.state
        return <List
            id='movies'
            list={movies}
            itemClassName='c-flex aic'
            selection={{enabled:true}}
            formatter={movie=>`${movie.id} - ${movie.title}`} />
    }
})
 */

var List = function (_React$Component) {
    _inherits(List, _React$Component);

    function List() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, List);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = List.__proto__ || Object.getPrototypeOf(List)).call.apply(_ref, [this].concat(args))), _this), _this.handleToggleSelection = function (id, selected) {
            var _this$props = _this.props,
                _this$props$selection = _this$props.selection.multiSelect,
                multiSelect = _this$props$selection === undefined ? true : _this$props$selection,
                curSelected = _this$props.selected,
                onSelectionChange = _this$props.onSelectionChange;

            if (multiSelect) {
                var newSelected = selected ? [].concat(_toConsumableArray(curSelected), [id]) : _lodash2.default.without(curSelected, id);
                onSelectionChange(newSelected, { id: id, selected: selected });
            } else {
                onSelectionChange(selected ? id : '');
            }
        }, _this.renderListItem = function (item, id) {
            var _this$props2 = _this.props,
                formatter = _this$props2.formatter,
                itemClassName = _this$props2.itemClassName,
                itemStyle = _this$props2.itemStyle,
                _this$props2$selectio = _this$props2.selection,
                selectable = _this$props2$selectio.enabled,
                _this$props2$selectio2 = _this$props2$selectio.multiSelect,
                multiSelectable = _this$props2$selectio2 === undefined ? true : _this$props2$selectio2,
                selected = _this$props2.selected,
                onClick = _this$props2.onClick;


            var content = item;

            if (formatter && _lodash2.default.isFunction(formatter)) {
                content = formatter(item, id);
            }

            var _itemClassName = itemClassName;
            if (itemClassName) {
                if (_lodash2.default.isFunction(itemClassName)) {
                    _itemClassName = itemClassName(item);
                }
            }

            var _itemStyle = itemStyle;
            if (itemStyle) {
                if (_lodash2.default.isFunction(itemStyle)) {
                    _itemStyle = itemStyle(item);
                }
            }

            var itemSelected = multiSelectable && _lodash2.default.includes(selected, id) || !multiSelectable && selected === id;
            if (itemSelected) {
                _itemClassName = [_itemClassName, 'selected'];
            }

            return _react2.default.createElement(
                'li',
                {
                    key: id,
                    id: id,
                    className: (0, _classnames2.default)('c-flex', _itemClassName),
                    style: _itemStyle,
                    onClick: onClick ? onClick.bind(null, id, item) : null },
                selectable && _react2.default.createElement(_checkbox2.default, { checked: itemSelected, onChange: _this.handleToggleSelection.bind(_this, id) }),
                content
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(List, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                list = _props.list,
                itemIdField = _props.itemIdField,
                info = _props.info,
                infoClassName = _props.infoClassName,
                selectable = _props.selection.enabled;


            return _react2.default.createElement(
                'ul',
                { id: id, className: (0, _classnames2.default)('c-list', { selectable: selectable }, className) },
                info ? _react2.default.createElement(
                    'li',
                    { className: (0, _classnames2.default)('c-info', infoClassName) },
                    info
                ) : _lodash2.default.map(list, function (item, key) {
                    return _this2.renderListItem(item, '' + _lodash2.default.get(item, itemIdField, key));
                })
            );
        }
    }]);

    return List;
}(_react2.default.Component);

List.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    list: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.array]),
    itemClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
    itemStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
    itemIdField: _propTypes2.default.string,
    formatter: _propTypes2.default.func,
    selection: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        multiSelect: _propTypes2.default.bool
    }),
    selected: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string)]),
    onSelectionChange: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    info: _propTypes2.default.node,
    infoClassName: _propTypes2.default.string
};
List.defaultProps = {
    list: {},
    itemIdField: 'id',
    selection: {
        enabled: false
    }
};
exports.default = (0, _propWire.wireSet)(List, {
    selected: {
        changeHandlerName: 'onSelectionChange',
        defaultValue: function defaultValue(_ref2) {
            var _ref2$selection = _ref2.selection,
                selection = _ref2$selection === undefined ? {} : _ref2$selection;
            var enabled = selection.enabled,
                _selection$multiSelec = selection.multiSelect,
                multiSelect = _selection$multiSelec === undefined ? true : _selection$multiSelec;

            if (enabled) {
                return multiSelect ? [] : '';
            }
            return '';
        }
    }
});