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

var _propTypes3 = require('../consts/prop-types');

var _propWire = require('../hoc/prop-wire');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/search');

/**
A React Search bar
 * @constructor
 * @param {string} [id] - container element #id
 * @param {string} [className] - Classname for the container
 * @param {string} [placeholder] - Placeholder for search input
 * @param {string|number} [defaultValue] - Default search value
 * @param {string|number} [value] - Current search value
 * @param {boolean} [enableClear=true] - Can this field be cleared?
 * @param {boolean} [interactive=false] - Determine if search is interactive<br>
 * @param {number} [delaySearch=0] - If search is interactive, this setting will trigger onSearch event after *delaySearch* milliseconds<br>
 * true: onSearch event called as user types; <br>
 * false: onSearch event called when user hits enter
 * @param {function} [onSearch] - Callback function when search is changed. <br> Required when value prop is supplied
 * @param {string|number} onSearch.search - updated search value
 *
 * @example

import {Search} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            movies:[]
        }
    },
    handleSearch(search) {
        // after ajax request get back list of movies
        let movies = ['My big fat greek wedding','Starlight Hotel']
        this.setState({movies})
    },
    render() {
        let {movies} = this.state;
        return <div>
            <Search placeholder='Please enter movie title' onSearch={this.handleSearch}/>
            <div>
            {
                _.map(movies, (movie, i)=>`${i}. ${movie}`)
            }
            </div>
        </div>
    }
})
 */

var Search = function (_React$Component) {
    _inherits(Search, _React$Component);

    function Search(props) {
        _classCallCheck(this, Search);

        var _this = _possibleConstructorReturn(this, (Search.__proto__ || Object.getPrototypeOf(Search)).call(this, props));

        _initialiseProps.call(_this);

        var value = props.value;


        _this.state = {
            value: value
        };
        return _this;
    }

    _createClass(Search, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var value = nextProps.value;

            this.setState({
                value: value
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                enableClear = _props.enableClear,
                placeholder = _props.placeholder;
            var value = this.state.value;


            return _react2.default.createElement(
                'span',
                { id: id, ref: function ref(_ref2) {
                        _this2.node = _ref2;
                    }, className: (0, _classnames2.default)('c-search', className, { clearable: enableClear }) },
                _react2.default.createElement('input', {
                    ref: function ref(_ref) {
                        _this2.input = _ref;
                    },
                    type: 'text',
                    value: value,
                    placeholder: placeholder,
                    onKeyDown: this.handleKeyDown,
                    onChange: function onChange(evt) {
                        _this2.handleSearch(evt.target.value, false);
                    } }),
                _react2.default.createElement(
                    'span',
                    { className: 'actions c-flex aic' },
                    enableClear && _react2.default.createElement('i', { className: 'fg fg-close', onClick: function onClick() {
                            _this2.handleSearch('', true);
                        } }),
                    _react2.default.createElement('i', { className: 'fg fg-search', onClick: function onClick() {
                            _this2.handleSearch(value, true);
                        } })
                )
            );
        }
    }]);

    return Search;
}(_react2.default.Component);

Search.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    placeholder: _propTypes3.SIMPLE_VALUE_PROP,
    value: _propTypes3.SIMPLE_VALUE_PROP,
    onSearch: _propTypes2.default.func.isRequired,
    enableClear: _propTypes2.default.bool,
    interactive: _propTypes2.default.bool,
    delaySearch: _propTypes2.default.number
};
Search.defaultProps = {
    enableClear: false,
    interactive: false,
    delaySearch: 0
};

var _initialiseProps = function _initialiseProps() {
    var _this3 = this;

    this.focus = function () {
        _this3.input.focus();
    };

    this.handleSearch = function (value, force) {
        var _props2 = _this3.props,
            interactive = _props2.interactive,
            onSearch = _props2.onSearch,
            delaySearch = _props2.delaySearch;

        if (force || interactive) {
            var searchText = _lodash2.default.trim(value).toLowerCase();
            if (interactive) {
                if (_this3.timer) {
                    clearTimeout(_this3.timer);
                    delete _this3.timer;
                }

                _this3.setState({ value: value }, function () {
                    _this3.timer = setTimeout(function () {
                        _this3.timer = null;
                        onSearch(searchText);
                    }, delaySearch);
                });
            } else {
                onSearch(searchText);
            }
        } else {
            _this3.setState({ value: value });
        }
    };

    this.handleKeyDown = function (e) {
        if (e.keyCode === 13) {
            _this3.handleSearch(_this3.state.value, true);
        }
    };
};

exports.default = (0, _propWire.wire)(Search, 'value', '', 'onSearch');