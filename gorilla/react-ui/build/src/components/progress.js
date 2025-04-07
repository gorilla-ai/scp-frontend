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

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _modalDialog = require('./modal-dialog');

var _modalDialog2 = _interopRequireDefault(_modalDialog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @module progress
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @description A module to help with blocking user access by displaying a shield and text.<br>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * It supports various styles of display.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * * Progress.startXxxxx starts up blocking display
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * * Progress.setXxxxx updates blocking display
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * * Progress.done closes blocking display
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */

var log = require('loglevel').getLogger('react-ui/components/progress');

var globalProgress = null;

var INITIAL_STATE = {
    display: null,
    loaded: null,
    total: null,
    className: '',
    style: {}
};

var Progress = function (_React$Component) {
    _inherits(Progress, _React$Component);

    function Progress() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Progress);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Progress.__proto__ || Object.getPrototypeOf(Progress)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Progress, [{
        key: 'render',
        value: function render() {
            var _state = this.state,
                display = _state.display,
                loaded = _state.loaded,
                total = _state.total,
                opacity = _state.opacity,
                className = _state.className,
                style = _state.style,
                global = _state.global;


            return _react2.default.createElement(
                _modalDialog2.default,
                {
                    id: 'g-progress',
                    show: !!display,
                    opacity: opacity,
                    global: global,
                    useTransition: true,
                    className: className, style: style },
                display,
                total && _react2.default.createElement('progress', { value: loaded, max: total }),
                total && _react2.default.createElement(
                    'span',
                    null,
                    Math.floor(loaded / total * 100),
                    '%'
                )
            );
        }
    }]);

    return Progress;
}(_react2.default.Component);

Progress.propTypes = {};

var _initialiseProps = function _initialiseProps() {
    var _this3 = this;

    this.state = _lodash2.default.clone(INITIAL_STATE);

    this.setDisplay = function (display) {
        _this3.setState({ display: display });
    };

    this.setProgress = function (loaded, total) {
        _this3.setState({ loaded: loaded, total: total });
    };

    this.open = function (args) {
        _this3.setState(_extends({ global: true, opacity: 0.5 }, args));
    };

    this.done = function () {
        _this3.setState(_lodash2.default.clone(INITIAL_STATE));
    };
};

var Shield = function (_React$Component2) {
    _inherits(Shield, _React$Component2);

    function Shield() {
        var _ref2;

        var _temp2, _this2, _ret2;

        _classCallCheck(this, Shield);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_ref2 = Shield.__proto__ || Object.getPrototypeOf(Shield)).call.apply(_ref2, [this].concat(args))), _this2), _initialiseProps2.call(_this2), _temp2), _possibleConstructorReturn(_this2, _ret2);
    }

    _createClass(Shield, [{
        key: 'render',
        value: function render() {
            var _state2 = this.state,
                show = _state2.show,
                opacity = _state2.opacity;

            return _react2.default.createElement(
                'section',
                { id: 'g-progress', className: (0, _classnames2.default)('c-modal', { show: show }) },
                _react2.default.createElement('div', { id: 'overlay', style: { opacity: opacity } })
            );
        }
    }]);

    return Shield;
}(_react2.default.Component);

Shield.propTypes = {};

var _initialiseProps2 = function _initialiseProps2() {
    var _this4 = this;

    this.state = {
        show: false
    };

    this.open = function (args) {
        _this4.setState(_extends({}, args, { show: true }));
    };

    this.done = function () {
        _this4.setState({ show: false });
    };
};

function showProgress(args, shieldOnly) {
    if (!globalProgress) {
        var node = document.createElement('DIV');
        var ProgressComponent = shieldOnly ? Shield : Progress;

        node.id = 'g-progress-container';
        document.body.appendChild(node);

        _reactDom2.default.render(_react2.default.createElement(ProgressComponent, { ref: function ref(el) {
                globalProgress = el;
                globalProgress && globalProgress.open(args);
            } }), document.getElementById('g-progress-container'));
    } else {
        globalProgress && globalProgress.open(args);
    }
}

exports.default = {
    /**
     * Show blocking display
     * @param {object} cfg - Display config
     * @param {number} [cfg.opacity=0.5] -
     * @param {*} [cfg.className] -
     * @param {boolean} [cfg.global=true] -
     * @param {renderable} cfg.display -
     * @param {object} [cfg.style] -
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.start({
    className:['my-class-name','my-other-class-name'],
    display:<div>In progress...</div>
    })
       */
    start: function start(args) {
        showProgress(args);
    },


    /**
     * Show blocking progress display
     * @param {renderable} display -
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.startProgress(<div>Start upload...</div>)
       */
    startProgress: function startProgress(display) {
        showProgress({
            opacity: 0.5,
            className: 'progress-bar',
            display: display
        });
    },


    /**
     * Show blocking spinner
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.startSpin()
       */
    startSpin: function startSpin() {
        showProgress({
            opacity: 0.2,
            className: 'spin',
            display: _react2.default.createElement('i', { style: { fontSize: '1.8em', margin: '10px' }, className: 'fg fg-loading-2 fg-spin' })
        });
    },


    /**
     * Show blocking transparent shield
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.startShield()
       */
    startShield: function startShield() {
        showProgress({ opacity: 0 }, true);
    },


    /**
     * Update display text
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.set(<div>5 more minutes...</div>)
       */
    set: function set(display) {
        globalProgress.setDisplay(display);
    },


    /**
     * Update percentage information
     * @param {number} complete - complete count
     * @param {number} total - total count
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.setProgress(1,40) // will display 2.5%
       */
    setProgress: function setProgress(loaded, total) {
        globalProgress.setProgress(loaded, total);
    },


    /**
     * Turn off blocking display
     * @param {number} [delay=0] - turn off after specified time (in milliseconds)
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.done()
    Progress.done(3000)
       */
    done: function done() {
        var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        setTimeout(function () {
            globalProgress.done();
        }, delay);
    }
};