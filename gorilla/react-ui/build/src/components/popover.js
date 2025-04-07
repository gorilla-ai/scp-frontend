'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactDraggable = require('react-draggable');

var _reactDraggable2 = _interopRequireDefault(_reactDraggable);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @module popover
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @description A module to help with opening/closing popovers
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Note. There can be multiple popovers appearing on the screen at the same time.<br>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * To achieve this, please use openId(..) instead of open()
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */

var log = require('loglevel').getLogger('react-ui/components/popover');

var handles = {};

var GLOBAL_POPOVER_ID = 'g-popover';

var Popover = function (_React$Component) {
    _inherits(Popover, _React$Component);

    function Popover() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Popover);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Popover.__proto__ || Object.getPrototypeOf(Popover)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            open: false,
            position: {},
            display: null,
            cfg: {}
        }, _this.setDragBounds = function () {
            var boundBy = _this.state.cfg.boundBy;

            var node = _this.node;

            var _boundBy$getBoundingC = boundBy.getBoundingClientRect(),
                boundLeft = _boundBy$getBoundingC.left,
                boundRight = _boundBy$getBoundingC.right,
                boundTop = _boundBy$getBoundingC.top,
                boundBottom = _boundBy$getBoundingC.bottom;

            var _node$getBoundingClie = node.getBoundingClientRect(),
                popLeft = _node$getBoundingClie.left,
                popRight = _node$getBoundingClie.right,
                popTop = _node$getBoundingClie.top,
                popBottom = _node$getBoundingClie.bottom;

            var _dragBounds = {
                left: boundLeft - popLeft,
                right: boundRight - popRight,
                top: boundTop - popTop,
                bottom: boundBottom - popBottom
            };
            _this.setState({ _dragBounds: _dragBounds });
        }, _this.snapToBounds = function () {
            var _this$state = _this.state,
                position = _this$state.position,
                _this$state$cfg = _this$state.cfg,
                draggable = _this$state$cfg.draggable,
                boundBy = _this$state$cfg.boundBy;

            var node = _this.node;
            var x = position.x,
                y = position.y,
                left = position.left,
                right = position.right,
                top = position.top,
                bottom = position.bottom;

            var _node$getBoundingClie2 = node.getBoundingClientRect(),
                popWidth = _node$getBoundingClie2.width,
                popHeight = _node$getBoundingClie2.height;

            var _boundBy$getBoundingC2 = boundBy.getBoundingClientRect(),
                boundLeft = _boundBy$getBoundingC2.left,
                boundRight = _boundBy$getBoundingC2.right,
                boundTop = _boundBy$getBoundingC2.top,
                boundWidth = _boundBy$getBoundingC2.width,
                boundBottom = _boundBy$getBoundingC2.bottom;

            log.debug('snapToBounds', _lodash2.default.pick(node.getBoundingClientRect(), ['left', 'right', 'top', 'bottom', 'width', 'height']), _lodash2.default.pick(boundBy.getBoundingClientRect(), ['left', 'right', 'top', 'bottom', 'width', 'height']), position);

            var _actualPosition = {};
            var defaultX = left != null && right != null ? (left + right) / 2 : x;
            _actualPosition.left = defaultX;
            if (defaultX + popWidth > boundRight) {
                if (popWidth >= boundWidth) {
                    _actualPosition.left = boundLeft;
                    _actualPosition.maxWidth = boundWidth;
                } else {
                    _actualPosition.left = boundRight - popWidth;
                }
            }

            var aroundTop = top == null ? y : top;
            var aroundBottom = bottom == null ? y : bottom;
            _actualPosition.top = aroundBottom;
            if (aroundBottom + popHeight > boundBottom) {
                // pick above or below, whichever having more vertical space
                var aboveSpace = aroundTop - boundTop;
                var belowSpace = boundBottom - aroundBottom;
                if (aboveSpace > belowSpace) {
                    _actualPosition.top = aroundTop - popHeight;
                    _actualPosition.maxHeight = Math.min(aboveSpace, popHeight);
                } else {
                    _actualPosition.maxHeight = belowSpace;
                }
            }

            /*        if (pointy) {
                        _actualPosition.top += 6
                    }*/
            _this.setState({ _actualPosition: _actualPosition }, function () {
                draggable && _this.setDragBounds();
            });
        }, _this.close = function () {
            if (_this.isOpen()) {
                _this.setState({ open: false });
            }
        }, _this.isOpen = function () {
            return _this.state.open;
        }, _this.open = function (position, display) {
            var cfg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            if (_this.isOpen() && !cfg.updateOnly) {
                // close and re-open, so previous styles (including those calculated by browser)
                // are properly erased
                _this.setState({ open: false }, function () {
                    _this.open(position, display, cfg);
                });
            } else {
                _this.setState({
                    _actualPosition: null,
                    _dragBounds: null,
                    position: position,
                    display: display,
                    cfg: cfg,
                    open: true
                }, function () {
                    // snap to bounds after initial display
                    // so it can retrieve dom width/height
                    _this.snapToBounds();
                });
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Popover, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state,
                _actualPosition = _state._actualPosition,
                display = _state.display,
                _dragBounds = _state._dragBounds,
                _state$cfg = _state.cfg,
                draggable = _state$cfg.draggable,
                style = _state$cfg.style,
                className = _state$cfg.className,
                open = _state.open;


            if (!open) {
                return null;
            } else {
                var popoverContent = _react2.default.createElement(
                    'div',
                    {
                        ref: function ref(_ref2) {
                            _this2.node = _ref2;
                        },
                        className: (0, _classnames2.default)('c-popover pure-form', { /*pointy, */handle: draggable }, className),
                        style: _extends({}, style, _actualPosition) },
                    display
                );

                return draggable ? _react2.default.createElement(
                    _reactDraggable2.default,
                    { handle: '.handle', bounds: _dragBounds },
                    popoverContent
                ) : popoverContent;
            }
        }
    }]);

    return Popover;
}(_react2.default.Component);

Popover.propTypes = {};


function openPopover(instance, pos, display, cfg) {
    if (instance) {
        var position = pos;

        if (pos && pos.target) {
            var rect = pos.target.getBoundingClientRect();
            position = _lodash2.default.pick(rect, ['x', 'y', 'left', 'right', 'top', 'bottom']);
        }

        instance.open(position, display, cfg);
    }
}

exports.default = {

    /**
     * Open global popover<br>
     * Uses openId, with id='g-popover'. See [openId()]{@link module:popover.openId}
     *
     * @param {object} position - open popover at this position (or around a box to avoid overlaying on the box)
     * @param {number} position.x - x position to open popover at
     * @param {number} position.y - y position to open popover at
     * @param {number} position.left - left bound to open popover around
     * @param {number} position.right - right bound to open popover around
     * @param {number} position.top - top bound to open popover around
     * @param {number} position.bottom - bottom bound to open popover around
     * @param {renderable} display - What to display in popover?
     * @param {object} cfg - display config
     * @param {boolean} [cfg.draggable=false] - Allow to drag popover?
     * @param {HTMLElement} [cfg.boundBy=document.body] - Bound the popover to specific region, this will force reposition of the popover
     * @param {boolean} [cfg.pointy=false] - disabled for now
     * @param {object} [cfg.style={}] - style to deploy to the popover
     * @param {string} [cfg.className=''] - className for the popover
     *
     */
    open: function open(pos, display, cfg) {
        this.openId(GLOBAL_POPOVER_ID, pos, display, cfg);
    },


    /**
     * Open popover with a given id, id will be the handler key
     * @param {string} id - popover handler id
     * @param {object} position - open popover at this position (or around a box to avoid overlaying on the box)
     * @param {number} position.x - x position to open popover at
     * @param {number} position.y - y position to open popover at
     * @param {number} position.left - left bound to open popover around
     * @param {number} position.right - right bound to open popover around
     * @param {number} position.top - top bound to open popover around
     * @param {number} position.bottom - bottom bound to open popover around
     * @param {renderable} display - What to display in popover?
     * @param {object} cfg - display config
     * @param {boolean} [cfg.draggable=false] - Allow to drag popover?
     * @param {HTMLElement} [cfg.boundBy=document.body] - Bound the popover to specific region, this will force reposition of the popover
     * @param {boolean} [cfg.pointy=false] - disabled for now
     * @param {object} [cfg.style={}] - style to deploy to the popover
     * @param {string} [cfg.className=''] - className for the popover
     *
     * @example
     *
    import {Popover} from 'react-ui'
    Popover.openId(
    'my-popover-id',
    {x:15,y:15},
    <img src='...' style={{maxWidth:100,maxHeight:100}}/>,
    {boundBy:document.body, draggable:false}
    )
       */
    openId: function openId(id, pos, display, cfg) {
        if (!id) {
            log.error('openId:missing id');
            return;
        }

        cfg = _lodash2.default.defaults(cfg || {}, {
            draggable: false,
            boundBy: document.body,
            pointy: false,
            style: {},
            className: ''
        });

        var handle = handles[id];

        if (!handle) {
            var node = document.createElement('DIV');
            node.id = id;
            document.body.appendChild(node);
            _reactDom2.default.render(_react2.default.createElement(Popover, { ref: function ref(_ref3) {
                    handle = handles[id] = _ref3;
                    openPopover(handle, pos, display, cfg);
                } }), document.getElementById(id));
        } else {
            openPopover(handle, pos, display, cfg);
        }
    },


    /**
     * Close popover
     *
     * @example
    Popover.close();
     */
    close: function close() {
        this.closeId(GLOBAL_POPOVER_ID);
    },


    /**
     * Close popover for given id
     * @param {string} id - close popover for this id
     *
     * @example
    Popover.closeId('my-popover-id');
     */
    closeId: function closeId(id) {
        handles[id] && handles[id].close();
    }
};