'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _outsideEvent = require('../utils/outside-event');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @module contextmenu
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @description A module to help with opening/closing **global** context menu:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * * When user clicks on a menu item, callback function will be fired
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * * when user clicks elsewhere on screen, menu will be closed
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Note. There can only be one context menu displayed on screen at one point in time
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */

var log = require('loglevel').getLogger('react-ui/components/contextmenu');

var globalContextMenu = null;

var Contextmenu = function (_React$Component) {
    _inherits(Contextmenu, _React$Component);

    function Contextmenu() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Contextmenu);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Contextmenu.__proto__ || Object.getPrototypeOf(Contextmenu)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _this.onClickInside = function (target) {
            var targetId = target.id;
            var menu = _this.state.menu;


            var targetMenuItem = _lodash2.default.find(menu, { id: targetId });

            if (targetMenuItem && targetMenuItem.action) {
                targetMenuItem.action();
                _this.setState({ menu: [] });
            }
        }, _this.onClickOutside = function () {
            _this.setState({ menu: [] });
        }, _this.open = function (position, menu, id) {
            _this.setState({ menu: menu, position: position, id: id });
        }, _this.isOpen = function () {
            return !_lodash2.default.isEmpty(_this.state.menu);
        }, _this.addHandler = function () {
            _this.handler = (0, _outsideEvent.subscribe)(_this.node).onInside(_this.onClickInside).onOutside(_this.onClickOutside);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Contextmenu, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.addHandler();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.handler.unsubscribe();
            if (this.isOpen()) {
                this.addHandler();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.handler.unsubscribe();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state,
                menu = _state.menu,
                position = _state.position,
                id = _state.id;


            if (!this.isOpen()) {
                return null;
            } else {
                var x = position.x,
                    y = position.y;

                var style = { left: x + 'px', top: y + 'px' };
                return _react2.default.createElement(
                    'ul',
                    { ref: function ref(_ref3) {
                            _this2.node = _ref3;
                        }, id: id, className: 'c-contextmenu c-menu sub', style: style },
                    _lodash2.default.map(menu, function (_ref2, idx) {
                        var itemId = _ref2.id,
                            text = _ref2.text,
                            className = _ref2.className,
                            isHeader = _ref2.isHeader,
                            disabled = _ref2.disabled;

                        return _react2.default.createElement(
                            'li',
                            { className: (0, _classnames2.default)(className, { header: isHeader, disabled: disabled }), id: itemId, key: idx },
                            text || id
                        );
                    })
                );
            }
        }
    }]);

    return Contextmenu;
}(_react2.default.Component);

Contextmenu.propTypes = {};
exports.default = {
    /**
     * Open context menu
     * @param {event|object} evt - event or simuated event with location information
     * @param {number} evt.pageX - x position to open menu at
     * @param {number} evt.pageY - y position to open menu at
     * @param {Array.<object>} menu - Menu to show on screen<br>Each item has the follow properties:
     * @param {string} menu.id - menu item id/key
     * @param {renderable} [menu.text=id] - menu item text
     * @param {function} [menu.action] - function to call when item is clicked
     * @param {string} [menu.className] - className for this item
     * @param {boolean} [menu.isHeader=false] - whether this item denotes a header for a group of items
     * @param {boolean} [menu.disabled=false] - whether this item is disabled
     * @param {string} [id] - id for the contextmenu
     *
     * @example
     *
    import {Contextmenu} from 'react-ui'
    React.createClass({
    getInitialState() {
        return {}
    },
    fetchMovieDetails(source) {
        // load data from source
        this.setState({source})
    },
    handleContextMenu(evt) {
        let menuItems = _.map(['imdb','rotten'], source=>{
            return {id:source, text:`Fetch ${source} Data`, action:this.fetchMovieDetails.bind(this,source)}
        })
        Contextmenu.open(evt, menuItems);
    },
    render() {
        return <span className='c-link' onContextMenu={this.handleContextMenu}>
            Right click on me
        </span>
    }
    })
       */
    open: function open(evt, menu, id) {
        evt.preventDefault && evt.preventDefault();
        if (!globalContextMenu) {
            var node = document.createElement('DIV');
            node.id = 'g-cm-container';
            document.body.appendChild(node);
            globalContextMenu = _reactDom2.default.render(_react2.default.createElement(Contextmenu, null), document.getElementById('g-cm-container'));
        }
        globalContextMenu.open({ x: evt.pageX, y: evt.pageY }, menu, id);
    },


    /**
     * Check if context menu is open
     * @return {boolean} Is open?
     *
     * @example
    console.log(Contextmenu.isOpen())
     */
    isOpen: function isOpen() {
        return globalContextMenu && globalContextMenu.isOpen();
    },


    /**
     * Close context menu if opened
     *
     * @example
    Contextmenu.close();
     */
    close: function close() {
        globalContextMenu && globalContextMenu.onClickOutside();
    }
};