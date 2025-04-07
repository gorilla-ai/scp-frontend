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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/page-nav');

/**
A React Page Navigation Component, containing following:
 * * (possible) prev button
 * * thumbnails for pages, up to configurable number of thumbnails (default to 9),
 * if total number of pages exceed configured number, will display '...' where appropriate
 * * (possible) next button
 *
 * @constructor
 * @param {number} [pages] - Total number of pages
 * @param {number} [current=1] - Current (highlighted) page number
 * @param {number} [thumbnails=9] - Maximum number of thumbnails to display
 * @param {string} [className] - Classname for the container
 * @param {function} onChange - Callback function when from/to is changed. <br> Required when value prop is supplied
 * @param {number} onChange.page - current selected page
 *
 * @example
 *
import _ from 'lodash'
import {PageNav} from 'react-ui'
 *
const PAGE_SIZE = 30

React.createClass({
    getInitialState() {
        return {
            movies:_(_.range(0,100)).map(i=>`Movie ${i}`), // 100 movies
            currentPage:1
        }
    },
    handleChange(currentPage) {
        this.setState({currentPage})
    },
    render() {
        let {movies, currentPage} = this.state;
        movies = movies.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE)
        return <div>
            <ul>
            {
                movies.map(movie=><li>{movie}</li>)
            }
            </ul>
            <PageNav pages={Math.ceil(movies/PAGE_SIZE)}
                current={currentPage}
                onChange={this.handleChange}/>
        </div>
    }
})

 */

var PageNav = function (_React$Component) {
    _inherits(PageNav, _React$Component);

    function PageNav() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, PageNav);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PageNav.__proto__ || Object.getPrototypeOf(PageNav)).call.apply(_ref, [this].concat(args))), _this), _this.gotoPage = function (page) {
            var onChange = _this.props.onChange;

            onChange(page);
        }, _this.renderThumb = function (page, key) {
            var current = _this.props.current;

            return _react2.default.createElement(
                'button',
                {
                    key: key,
                    className: (0, _classnames2.default)('thumb', { current: current === page }),
                    disabled: !page,
                    onClick: _this.gotoPage.bind(_this, page) },
                page || '...'
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(PageNav, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                thumbnails = _props.thumbnails,
                current = _props.current,
                pages = _props.pages,
                className = _props.className;


            if (!pages) {
                return null;
            }

            // let endThumbs = Math.floor(thumbnails/4);
            var endThumbs = 2; // display 2 at both ends
            var midThumbs = thumbnails - endThumbs * 2 - 2;
            var list = [];

            var midStart = Math.max(current - Math.floor(midThumbs / 2), endThumbs + 1);
            var midEnd = midStart + midThumbs - 1;
            var lastSkipped = false;

            if (midEnd >= pages - endThumbs) {
                midStart = Math.max(endThumbs + 1, midStart - (midEnd - (pages - endThumbs)));
                midEnd = pages - endThumbs;
                midStart--;
            }

            if (midStart === endThumbs + 1) {
                midEnd++;
            }

            if (midStart === endThumbs + 2) {
                midStart--;
            }
            if (midEnd === pages - endThumbs - 1) {
                midEnd++;
            }

            _lodash2.default.forEach(_lodash2.default.range(1, pages + 1), function (i) {
                if (i <= endThumbs || i > pages - endThumbs || i >= midStart && i <= midEnd) {
                    list.push(_this2.renderThumb(i, i));
                    lastSkipped = false;
                } else {
                    if (!lastSkipped) {
                        list.push(_this2.renderThumb(null, i));
                        lastSkipped = true;
                    }
                }
            });

            return _react2.default.createElement(
                'div',
                { className: (0, _classnames2.default)('c-page-nav', className) },
                _react2.default.createElement('button', { className: 'thumb fg fg-arrow-left', disabled: current === 1, onClick: this.gotoPage.bind(this, current - 1) }),
                list,
                _react2.default.createElement('button', { className: 'thumb fg fg-arrow-right', disabled: current === pages, onClick: this.gotoPage.bind(this, current + 1) })
            );
        }
    }]);

    return PageNav;
}(_react2.default.Component);

PageNav.propTypes = {
    pages: _propTypes2.default.number,
    current: _propTypes2.default.number,
    thumbnails: _propTypes2.default.number,
    className: _propTypes2.default.string,
    onChange: _propTypes2.default.func.isRequired
};
PageNav.defaultProps = {
    pages: null,
    current: 1,
    thumbnails: 9
};
exports.default = PageNav;