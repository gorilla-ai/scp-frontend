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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/tabs');

/**
 * A React Tabs view component
 * @constructor
 * @param {string} [id] - Tab dom element #id
 * @param {string} [className] - Classname for the container
 * @param {object} menu Tab menu config
 * @param {object} menu.key menu item config
 * @param {renderable} menu.key.title menu item title
 * @param {string} menu.key.disabled is menu item disabled (cannot select)?
 * @param {string} [defaultCurrent] - Default selected tab key
 * @param {string} [current] - Current selected tab key
 * @param {object} [currentLink] - Link to update selected tab key. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} currentLink.value - value to update
 * @param {function} currentLink.requestChange - function to request value change
 * @param {object} [defaultContents] - Key-node pair of what to display in each tab by default
 * @param {renderable} [children] - Current tab content
 * @param {function} [onChange] - Callback function when tab is selected. <br> Required when current prop is supplied
 * @param {string} onChange.value - selected tab key
 * @param {object} onChange.eventInfo - event related info
 * @param {string} onChange.eventInfo.before - previously selected tab
 *
 * @todo  Maybe don't need defaultContents??
 *
 * @example
// controlled

import {Tabs} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            currentTab:'movies'
        }
    },
    handleTabChange(newTab) {
        this.setState({currentTab: newTab})
    },
    renderMovies() {
        return 'movie list'
    },
    renderActors() {
        return 'actor list'
    },
    render() {
        let {currentTab} = this.state;
        return <Tabs id='imdb'
            menu={{
                movies: 'MOVIES',
                actors: 'ACTORS',
                tv: {title:'TV', disabled:true}
            }}
            current={currentTab}
            onChange={this.handleTabChange}>
            {
                currentTab==='movies' ? this.renderMovies() : this.renderActors()
            }
        </Tabs>
    }
})
 */

var Tabs = function (_React$Component) {
    _inherits(Tabs, _React$Component);

    function Tabs() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Tabs);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Tabs.__proto__ || Object.getPrototypeOf(Tabs)).call.apply(_ref, [this].concat(args))), _this), _this.handleTabChange = function (evt) {
            var onChange = _this.props.onChange;


            onChange(evt.currentTarget.id);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Tabs, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                menu = _props.menu,
                current = _props.current,
                defaultContents = _props.defaultContents,
                id = _props.id,
                className = _props.className,
                children = _props.children;


            var defaultContent = defaultContents[current];

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-tabs', className) },
                _react2.default.createElement(
                    'ol',
                    { className: 'menu' },
                    _lodash2.default.map(menu, function (item, key) {
                        var isCurrent = key === current;
                        var disabled = false;
                        var title = '';
                        if (_lodash2.default.isString(item)) {
                            title = item;
                        } else {
                            title = item.title || key;
                            disabled = item.disabled;
                        }
                        var tabClassName = {
                            current: isCurrent,
                            disabled: disabled
                        };
                        return _react2.default.createElement(
                            'li',
                            {
                                id: key,
                                key: key,
                                className: (0, _classnames2.default)(tabClassName),
                                onClick: isCurrent || disabled ? null : _this2.handleTabChange },
                            title
                        );
                    })
                ),
                _react2.default.createElement(
                    'div',
                    { id: current, className: 'tabContent' },
                    children || defaultContent
                )
            );
        }
    }]);

    return Tabs;
}(_react2.default.Component);

Tabs.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    menu: _propTypes2.default.objectOf(_propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.shape({
        title: _propTypes2.default.node,
        disabled: _propTypes2.default.bool
    })])),
    current: _propTypes2.default.string,
    defaultContents: _propTypes2.default.objectOf(_propTypes2.default.node),
    children: _propTypes2.default.node,
    onChange: _propTypes2.default.func
};
Tabs.defaultProps = {
    menu: {},
    defaultContents: {}
};
exports.default = (0, _propWire.wire)(Tabs, 'current');