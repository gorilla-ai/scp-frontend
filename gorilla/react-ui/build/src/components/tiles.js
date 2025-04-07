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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * React Tiles - view made up of tiles, could be used for laying out images, videos, div,
 * or any self defined components.
 *
 * Allow specifying:
 * * spacing between tiles
 * * max # tiles, or auto calculate # tiles based on container size and tile size
 *
 * || max=number | max=auto | max=undefined |
 * | :-- | :-- | :-- | :-- |
 * | itemSize has width+height| flex layout, display max. # tiles| calculate # tiles from item & container size| flex layout |
 * | itemSize undefined | flex layout, display max. # tiles| flex layout | flex layout |
 *
 * Restrictions:
 * * All items in a row must (or forced to) have same height
 * * width/height of individual tile specified in css will be ignored
 *
 * @alias module:Tiles
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {string|function} base - React class to use for rendering the tile, eg 'div', 'img', <SelfDefinedComponent/>
 * @param {array.<object>} items - Tiles supplied as props to base component
 * @param {string} items.id - tile id
 * @param {number} [items.width] - tile width
 * @param {number} [items.height] - tile height
 * @param {number} [total=items.length] - Total number of tiles available, if total>max, overlay will be rendered on last tile
 * @param {'auto' | number} [max] - Max number of tiles. If 'auto' will try to calculate max, if not specified, will display all tiles
 * @param {function | boolean} [overlay=true] - overlay render function to call if total > max
 * @param {number} overlay.max - configured or automatically calculated max # of tiles
 * @param {number} overlay.total - total # of tiles
 * @param {object} [itemProps] - Props for individual tile
 * @param {object} [itemSize] - Default tile size, will be overwritten by size specified in individual tiles
 * @param {number} [itemSize.width] - Default tile width
 * @param {number} [itemSize.height] - Default tile height
 * @param {number} [spacing=0] - Spacing (in px) between tiles
 * @param {'%' | 'px'} [unit='px'] - itemSize unit
 * @param {function} [onClick] - Function to call when clicked
 * @param {object} onClick.id - tile id clicked
 * @param {object} onClick.eventInfo - other event info
 * @param {number} onClick.eventInfo.index - current array index of clicked tile
 * @param {number} onClick.eventInfo.max - max (configured of auto calculated) # tiles
 * @param {number} onClick.eventInfo.total - total # tiles
 * @param {boolean} onClick.eventInfo.isLast - is the clicked event the last one of this bunch?
 * @param {function} [onMouseOver] - Function to call when mouse over, see onClick for callback function spec
 * @param {function} [onMouseOut] - Function to call when mouse out, see onClick for callback function spec
 *
 *
 * @example
import {Tiles, Popover} from 'react-ui'
import _ from 'lodash'

const IMAGES = [
    'bs', 'camera', 'car', 'drug', 'email', 'fb_messenger', 'goods',
    'gun', 'home', 'ic_airplane', 'ic_alert_2', 'ic_bs',
    'ic_cam_2', 'ic_cam_3', 'ic_car_2', 'ic_case', 'ic_creditcard', 'ic_database', 'ic_drug',
    'ic_email', 'ic_etag', 'ic_etag_gate', 'ic_globe', 'ic_goods', 'ic_gun', 'ic_help', 'ic_home', 'ic_info', 'ic_ip',
    'ip', 'landline', 'line', 'mobile', 'parking', 'person'
]

React.createClass({
    getInitialState() {
        return {
            selected: null,
            max: null,
            isLast: false,
            hasMore: false
        }
    },
    handleClick(id, {index, max, total, isLast}) {
        this.setState({
            selected: id,
            max,
            isLast,
            hasMore: total>max
        })
    },
    openPopover(id, data, evt) {
        Popover.openId(
            'my-popover-id',
            evt,
            <div className='c-box'>
                <header>{id}</header>
                <div className='content c-result aligned'>
                    {
                        _.map(data, (v,k)=><div key={k}>
                            <label>{k}</label>
                            <div>{v+''}</div>
                        </div>)
                    }
                </div>
            </div>,
            {pointy:true}
        )
    },
    closePopover() {
        Popover.closeId('my-popover-id')
    },
    render() {
        return <Tiles id='auto'
            base='img'
            itemSize={{
                width:30,
                height:20
            }}
            unit='%'
            spacing={5}
            items={_.map(IMAGES, item=>({id:item, src:`/images/tiles/${item}.png`}))}
            max='auto'
            onClick={this.handleClick}
            onMouseOver={this.openPopover}
            onMouseOut={this.closePopover} />
    }
})
 */

var Tiles = function (_React$Component) {
    _inherits(Tiles, _React$Component);

    function Tiles() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Tiles);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Tiles.__proto__ || Object.getPrototypeOf(Tiles)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            containerWidth: 0,
            containerHeight: 0
        }, _this.updateDimension = function () {
            var _this$node$getBoundin = _this.node.getBoundingClientRect(),
                containerWidth = _this$node$getBoundin.width,
                containerHeight = _this$node$getBoundin.height;

            _this.setState({
                containerHeight: containerHeight,
                containerWidth: containerWidth
            });
        }, _this.renderItem = function (item, index, _ref2, max, columns) {
            var width = _ref2.width,
                height = _ref2.height;
            var _this$props = _this.props,
                base = _this$props.base,
                items = _this$props.items,
                itemProps = _this$props.itemProps,
                spacing = _this$props.spacing,
                overlay = _this$props.overlay,
                onClick = _this$props.onClick,
                onMouseOver = _this$props.onMouseOver,
                onMouseOut = _this$props.onMouseOut;
            var itemId = item.id;


            var tileStyle = {
                height: height + 'px',
                width: width + 'px',
                marginTop: index <= columns - 1 ? 0 : spacing + 'px', // only items in first row do not have top margin
                marginLeft: index % columns === 0 ? 0 : spacing + 'px', // only items in first column do not have left margin
                marginRight: 0,
                marginBottom: 0
            };

            var isLast = index === max - 1;
            var tile = _react2.default.createElement(base, _extends({}, itemProps, item));

            // For last tile's overlay
            var total = _lodash2.default.has(_this.props, 'total') ? _this.props.total : items.length;
            var tileOverlay = isLast && total > max && overlay ? _this.renderOverlay(overlay, max, total) : null;

            var eventArgs = [itemId, { index: index, max: max, total: total, isLast: isLast }];

            return _react2.default.createElement(
                'div',
                {
                    key: 'tile-' + itemId,
                    className: (0, _classnames2.default)('tile-wrapper c-flex aic jcc', { last: isLast }),
                    style: tileStyle,
                    onClick: onClick ? onClick.bind.apply(onClick, [null].concat(eventArgs)) : null,
                    onMouseOver: onMouseOver ? onMouseOver.bind.apply(onMouseOver, [null].concat(eventArgs)) : null,
                    onMouseOut: onMouseOut ? onMouseOut.bind.apply(onMouseOut, [null].concat(eventArgs)) : null },
                tile,
                tileOverlay
            );
        }, _this.renderOverlay = function (overlay, max, total) {
            return _react2.default.createElement(
                'span',
                { className: 'tile-overlay c-flex aic jcc' },
                _lodash2.default.isFunction(overlay) ? overlay(max - 1, total) : '+' + (total - max + 1)
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Tiles, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            window.addEventListener('resize', this.updateDimension);
            this.updateDimension();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('resize', this.updateDimension);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                items = _props.items,
                _props$itemSize = _props.itemSize,
                itemWidth = _props$itemSize.width,
                itemHeight = _props$itemSize.height,
                max = _props.max,
                unit = _props.unit,
                spacing = _props.spacing;
            var _state = this.state,
                containerWidth = _state.containerWidth,
                containerHeight = _state.containerHeight;

            // Calculate the width and height by ratio when unit is '%'

            var tileSize = {
                height: unit === '%' ? Math.floor(containerHeight / 100 * itemHeight) : itemHeight,
                width: unit === '%' ? Math.floor(containerWidth / 100 * itemWidth) : itemWidth

                // number of row/column of tiles
            };var rows = Math.floor((containerHeight + spacing) / (tileSize.height + spacing));
            var columns = Math.floor((containerWidth + spacing) / (tileSize.width + spacing));
            var maxTiles = max === 'auto' ? columns * rows : max;
            this.maxTiles = maxTiles;

            return _react2.default.createElement(
                'div',
                {
                    id: id,
                    className: (0, _classnames2.default)('c-tiles c-flex aic jcc acc fww', className),
                    ref: function ref(_ref3) {
                        _this2.node = _ref3;
                    } },
                (0, _lodash2.default)(items).slice(0, maxTiles).map(function (el, i) {
                    return _this2.renderItem(el, i, tileSize, maxTiles, columns);
                }).value()
            );
        }
    }]);

    return Tiles;
}(_react2.default.Component);

Tiles.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    base: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]).isRequired,
    items: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        id: _propTypes2.default.string,
        width: _propTypes2.default.number,
        height: _propTypes2.default.number
    })).isRequired,
    total: _propTypes2.default.number,
    max: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    overlay: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.func]),
    itemProps: _propTypes2.default.object,
    itemSize: _propTypes2.default.shape({
        width: _propTypes2.default.number,
        height: _propTypes2.default.number
    }),
    spacing: _propTypes2.default.number,
    unit: _propTypes2.default.oneOf(['%', 'px']),
    onClick: _propTypes2.default.func,
    onMouseOver: _propTypes2.default.func,
    onMouseOut: _propTypes2.default.func
};
Tiles.defaultProps = {
    items: [],
    overlay: true,
    itemProps: {},
    spacing: 0,
    unit: 'px'
};
exports.default = Tiles;