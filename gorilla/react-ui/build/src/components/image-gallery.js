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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _tiles = require('./tiles');

var _tiles2 = _interopRequireDefault(_tiles);

var _image = require('./image');

var _image2 = _interopRequireDefault(_image);

var _propWire = require('../hoc/prop-wire');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/image-gallery');

/**
 * React ImageGallery - Image Gallery made up of a row of images/tiles, with prev and next icons.
 *
 * Uses Tiles internally.
 *
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {string|function} [base='img'] - React class to use for rendering the tile, eg 'div', 'img', <SelfDefinedComponent/>
 * @param {array.<object>} items - Props supplied to tile. See [Tiles]{@link module:Tiles} for API
 * @param {'auto' | number} [max] - Max number of tiles. If 'auto' will try to calculate max, if not specified, will display all tiles
 * @param {object} [itemProps] - props for individual image/tile
 * @param {object} [itemSize] - image/tile size
 * @param {number} [itemSize.width] - image/tile width
 * @param {number} [itemSize.height] - image/tile height
 * @param {number} [spacing=0] - Spacing (in px) between images/tiles
 * @param {'%' | 'px'} [unit='px'] - itemSize unit
 * @param {function} [onClick] - Function to call when clicked
 * @param {object} onClick.id - image/tile id clicked
 * @param {object} onClick.eventInfo - other event info
 * @param {number} onClick.eventInfo.index - current array index of clicked image/tile
 * @param {number} onClick.eventInfo.max - number of visible images/tiles
 * @param {number} onClick.eventInfo.total - total # images/tiles
 * @param {function} [onMouseOver] - Function to call when mouse over tile, see onClick for callback function spec
 * @param {function} [onMouseOut] - Function to call when mouse out tile, see onClick for callback function spec
 * @param {number} [start=0] - index to start displaying images/tiles from, if absent start will be uncontrolled
 * @param {number} [defaultStart=0] - Default index to start displaying images/tiles from
 * @param {boolean} [hasPrev=auto detect] - should previous icon be displayed
 * @param {boolean} [hasNext=auto detect] - should next icon be displayed
 * @param {boolean} [repeat=false] - Repeat the play list?
 * @param {object} [autoPlay] - autoPlay configuration
 * @param {boolean} [autoPlay.enabled=false] - Allow autoPlay/filter list?
 * @param {string} [autoPlay.interval=7000] - Interval between slides in milliseconds
 * @param {function} [onMove] - Function to call when prev or next icon is clicked, move forward/backward by *step* when not specified
 * @param {string} onMove.start - new start index
 * @param {object} onMove.eventInfo - eventInfo associated with move
 * @param {boolean} onMove.eventInfo.backward - is previous icon clicked
 * @param {number} onMove.eventInfo.step - how many items to move forward/backward?
 *
 *
 * @example

import {ImageGallery} from 'react-ui'
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
            total: null,
            start: 3,
            prevStart: null,
            moveBackward: false,
            step: null
        }
    },
    handleClick(id, {index, max, total}) {
        this.setState({
            selected: id,
            max,
            total
        })
    },
    handleMove(start, {before:prevStart, backward:moveBackward, step}) {
        // start is uncontrolled
        this.setState({
            start,
            prevStart,
            moveBackward,
            step
        })
    },
    render() {
        const {start} = this.state

        return <ImageGallery
            id='gallery-images'
            items={_.map(IMAGES, item=>({id:item, src:`/images/tiles/${item}.png`}))}
            itemSize={{width:120, height:90}}
            unit='px'
            spacing={3}
            defaultStart={start}
            onMove={this.handleMove}
            onClick={this.handleClick}
            repeat
            autoPlay={{
                enabled: true,
                interval: 3000
            }} />
    }
})


 */

var ImageGallery = function (_React$Component) {
    _inherits(ImageGallery, _React$Component);

    function ImageGallery() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ImageGallery);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ImageGallery.__proto__ || Object.getPrototypeOf(ImageGallery)).call.apply(_ref, [this].concat(args))), _this), _this.createTimer = function () {
            var _this$props$autoPlay$ = _this.props.autoPlay.interval,
                interval = _this$props$autoPlay$ === undefined ? 7000 : _this$props$autoPlay$;

            _this.clearTimer();
            _this.timer = setInterval(function () {
                _this.slide();
            }, interval);
        }, _this.clearTimer = function () {
            if (_this.timer) {
                clearInterval(_this.timer);
            }
        }, _this.slide = function () {
            var backward = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
            var resetAutoPlay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var _this$props = _this.props,
                start = _this$props.start,
                max = _this$props.max,
                items = _this$props.items,
                onMove = _this$props.onMove,
                autoPlay = _this$props.autoPlay,
                repeat = _this$props.repeat;

            var total = _this.props.total || items.length;
            var numTiles = _this.tiles.maxTiles;
            var itemsToMove = max === 'auto' ? numTiles : max;

            var newStart = void 0;
            if (backward) {
                newStart = repeat ? (start - itemsToMove + total) % total : Math.max(start - itemsToMove, 0);
            } else {
                if (repeat) {
                    newStart = (start + itemsToMove) % total;
                } else if (start + itemsToMove >= total) {
                    return;
                } else {
                    newStart = start + itemsToMove;
                }
            }

            if (autoPlay.enabled && resetAutoPlay) {
                _this.createTimer();
            }

            onMove(newStart, { step: itemsToMove, total: total, backward: backward });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ImageGallery, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var autoPlay = this.props.autoPlay;


            this.forceUpdate(); // re-render so the left/right arrows will be shown according to current maxTiles
            if (autoPlay.enabled) {
                this.createTimer();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.clearTimer();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                base = _props.base,
                items = _props.items,
                start = _props.start,
                hasPrev = _props.hasPrev,
                hasNext = _props.hasNext,
                repeat = _props.repeat,
                tilesProps = _objectWithoutProperties(_props, ['id', 'className', 'base', 'items', 'start', 'hasPrev', 'hasNext', 'repeat']);

            var numTiles = this.tiles ? this.tiles.maxTiles : 0;

            var showPrev = hasPrev;
            var showNext = hasNext;

            if (repeat) {
                showPrev = true;
                showNext = true;
            } else {
                if (showPrev == null) {
                    showPrev = start > 0;
                }
                if (showNext == null) {
                    showNext = (this.props.total || items.length) > start + numTiles;
                }
            }

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-image-gallery c-flex', className) },
                _react2.default.createElement('i', { className: (0, _classnames2.default)('fg fg-arrow-left fixed asc large', { 'c-link': showPrev, disabled: !showPrev }), onClick: showPrev && this.slide.bind(this, true, true) }),
                _react2.default.createElement(_tiles2.default, _extends({
                    base: base,
                    className: 'grow',
                    overlay: false,
                    max: 'auto',
                    items: [].concat(_toConsumableArray(_lodash2.default.slice(items, start)), _toConsumableArray(_lodash2.default.take(items, repeat ? numTiles : 0))),
                    ref: function ref(_ref2) {
                        _this2.tiles = _ref2;
                    }
                }, tilesProps)),
                _react2.default.createElement('i', { className: (0, _classnames2.default)('fg fg-arrow-right fixed asc large', { 'c-link': showNext, disabled: !showNext }), onClick: showNext && this.slide.bind(this, false, true) })
            );
        }
    }]);

    return ImageGallery;
}(_react2.default.Component);

ImageGallery.propTypes = {
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
    itemProps: _propTypes2.default.object,
    itemSize: _propTypes2.default.shape({
        width: _propTypes2.default.number,
        height: _propTypes2.default.number
    }),
    spacing: _propTypes2.default.number,
    unit: _propTypes2.default.oneOf(['%', 'px']),
    onClick: _propTypes2.default.func,
    onMouseOver: _propTypes2.default.func,
    onMouseOut: _propTypes2.default.func,
    start: _propTypes2.default.number,
    hasPrev: _propTypes2.default.bool,
    hasNext: _propTypes2.default.bool,
    repeat: _propTypes2.default.bool,
    autoPlay: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        interval: _propTypes2.default.number
    }),
    onMove: _propTypes2.default.func
};
ImageGallery.defaultProps = {
    base: _image2.default,
    items: [],
    max: 'auto',
    repeat: false,
    autoPlay: {
        enabled: false
    },
    start: 0
};
exports.default = (0, _propWire.wire)(ImageGallery, 'start', 0, 'onMove');