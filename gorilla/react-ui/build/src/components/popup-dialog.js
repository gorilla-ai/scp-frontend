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

var _inputHelper = require('../utils/input-helper');

var _modalDialog = require('./modal-dialog');

var _modalDialog2 = _interopRequireDefault(_modalDialog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @module popup-dialog
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @description A module to help with opening/closing **global** popup dialog<br>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * This is to replace traditional window.alert, window.confirm, window.prompt
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */

var log = require('loglevel').getLogger('react-ui/components/popup-dialog');

var handles = {};

var TYPES = { ALERT: '1', CONFIRM: '2', PROMPT: '3' };

var GLOBAL_POPUP_ID = 'g-popup-container';

var PopupDialog = function (_React$Component) {
    _inherits(PopupDialog, _React$Component);

    function PopupDialog() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, PopupDialog);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PopupDialog.__proto__ || Object.getPrototypeOf(PopupDialog)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            open: false,
            error: null
        }, _this.open = function (type, title, display, id, style, cancelText, confirmText, act) {
            _this.setState({
                type: TYPES[type.toUpperCase()],
                title: title,
                display: display,
                id: id,
                style: style,
                cancelText: cancelText,
                confirmText: confirmText,
                act: act,
                open: true,
                error: null
            });
        }, _this.handleConfirm = function () {
            var act = _this.state.act;

            var result = (0, _inputHelper.retrieveFormData)(_reactDom2.default.findDOMNode(_this));

            var p = act && act(true, result);
            if (p && p.then) {
                // is promise
                p.then(function () {
                    _this.handleError();
                }).catch(function (err) {
                    _this.handleError(err.message);
                });
            } else {
                _this.handleError(p);
            }
        }, _this.handleError = function (err) {
            if (err) {
                _this.setState({ error: err });
            } else {
                _this.close();
            }
        }, _this.close = function () {
            _this.setState({ open: false, error: null });
        }, _this.handleCancel = function () {
            var act = _this.state.act;


            act(false);
            _this.close();
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(PopupDialog, [{
        key: 'render',
        value: function render() {
            var _state = this.state,
                type = _state.type,
                title = _state.title,
                display = _state.display,
                id = _state.id,
                style = _state.style,
                cancelText = _state.cancelText,
                confirmText = _state.confirmText,
                open = _state.open,
                error = _state.error;


            if (!open) {
                return null;
            }
            switch (type) {
                case TYPES.ALERT:
                    return _react2.default.createElement(
                        _modalDialog2.default,
                        {
                            title: title,
                            id: id,
                            defaultAction: 'confirm',
                            closeAction: 'confirm',
                            contentClassName: 'pure-form',
                            actions: {
                                confirm: {
                                    handler: this.handleConfirm,
                                    text: confirmText
                                }
                            },
                            global: true,
                            draggable: true,
                            style: style },
                        display
                    );
                case TYPES.CONFIRM:
                case TYPES.PROMPT:
                    return _react2.default.createElement(
                        _modalDialog2.default,
                        {
                            title: title,
                            id: id,
                            info: error,
                            infoClassName: 'c-error',
                            defaultAction: 'cancel',
                            closeAction: 'cancel',
                            contentClassName: 'pure-form',
                            actions: {
                                cancel: { handler: this.handleCancel, className: 'standard', text: cancelText },
                                confirm: {
                                    handler: this.handleConfirm,
                                    text: confirmText
                                }
                            },
                            global: true,
                            draggable: true,
                            style: style },
                        display
                    );

                default:
                    return null;
            }
        }
    }]);

    return PopupDialog;
}(_react2.default.Component);

PopupDialog.propTypes = {};


function openPopup(instance, args, type) {
    if (instance) {
        if (!_lodash2.default.isObject(args)) {
            args = { display: args };
        }

        instance.open(type, args.title, args.display, args.id, args.style, args.cancelText || 'Cancel', args.confirmText || 'Confirm', args.act);
    }
}

function openId(type, id, args) {
    if (!id) {
        log.error('openId:missing id');
        return;
    }

    var handle = handles[id];

    if (!handle) {
        var node = document.createElement('DIV');
        node.id = id;
        document.body.appendChild(node);
        _reactDom2.default.render(_react2.default.createElement(PopupDialog, { ref: function ref(el) {
                handle = handles[id] = el;
                openPopup(handle, args, type);
            } }), document.getElementById(id));
    } else {
        openPopup(handle, args, type);
    }
}

function openIdIf(type, id, condition, args) {
    if (condition) {
        openId(type, id, args);
    } else {
        args.act(true);
    }
}

function closeId(id) {
    handles[id] && handles[id].close();
}

/**
 * Config for the popup dialog
 * @typedef {object} PopupConfig
 * @property {renderable} [title] - Title of the dialog
 * @property {renderable} display - What to display in the dialog
 * @property {string} [id] - Container dom #id
 * @property {object} [style] - Style to apply to the container
 * @property {string} [cancelText='Cancel'] - Cancel button text, only used with prompt & confirm dialogs
 * @property {string} [confirmText='Confirm'] - Confirm button text
 * @property {function} act - Action to perform when submit buttn clicked.<br>Can return a promise or error text
 * @property {boolean} act.confirmed - did the user say 'ok'?
 * @property {object} act.data - Input data embedded inside display, only used with prompt & confirm dialogs
 */

exports.default = {
    /**
     * Open alert box
     * @param {PopupConfig | renderable} cfg - Popup config, or simple renderable string
     *
     * @example
     *
    import {PopupDialog} from 'react-ui'
    PopupDialog.alertId('g-custom-alert-container', 'Test')
    PopupDialog.alert('Test')
    PopupDialog.alert({display:'Test', act:(confirmed)=>{
    console.log('User is okay? ',confirmed)
    }})
     */
    alert: openId.bind(null, 'alert', GLOBAL_POPUP_ID),
    alertId: openId.bind(null, 'alert'),

    /**
     * Open confirm box
     * @param {PopupConfig | renderable} cfg - Popup config, or simple renderable string
     *
     * @example
     *
    import {PopupDialog} from 'react-ui'
    PopupDialog.confirm({
    display:'Fetch more data?',
    cancelText: 'No!',
    confirmText: 'Go Ahead',
    act:(confirmed)=>{
        if (confirmed) {
            $.get('...') // get more data
        }
    }
    })
     */
    confirm: openId.bind(null, 'confirm', GLOBAL_POPUP_ID),
    confirmId: openId.bind(null, 'confirm'),

    /**
     * Open confirm box if condition is satisfied.<br>
     * If condition is not satisfied (ie no need to confirm), act will be fired with confirmed=true
     * @param {boolean} condition - Should confirm first before proceed?
     * @param {PopupConfig | renderable} cfg - Popup config, or simple renderable string
     *
     * @example
     *
    import Promise from 'bluebird'
    import {PopupDialog} from 'react-ui'
    let userDidNotEnterAddress = !user.address;
    PopupDialog.confirmIf(userDidNotEnterAddress, {
    display:'You have not entered address, are you sure you want to proceed?',
    act:(confirmed)=>{
        if (confirmed) {
            // note if user has entered address, then it will reach here without popup
            return Promise.resolve($.post('/api/save/user',{data:user})) // post user information
            // if post returned with error (eg 404), error message will be displayed
        }
    }
    })
     */
    confirmIf: openIdIf.bind(null, 'confirm', GLOBAL_POPUP_ID),
    confirmIdIf: openIdIf.bind(null, 'confirm'),

    /**
     * Open prompt box
     * @param {PopupConfig | renderable} cfg - Popup config, or simple renderable string
     *
     * @example
     *
    import Promise from 'bluebird'
    import {PopupDialog} from 'react-ui'
    PopupDialog.prompt({
    display: <div>
        <label htmlFor='name'>Name</label><input id='name'/>
        <label htmlFor='phone'>Phone</label><input id='phone'/>
        <label htmlFor='address'>Address</label><input id='address'/>
    </div>,
    act:(confirmed, data)=>{
        if (confirmed) {
            console.log(data) // {name:'abc', phone:'012345678', address:'Taiwan'}
            return Promise.resolve($.post('/api/save/user',data)) // post user information
        }
    }
    })
     */
    prompt: openId.bind(null, 'prompt', GLOBAL_POPUP_ID),
    promptId: openId.bind(null, 'prompt'),

    /**
     * Close popup dialog
     *
     * @example
     *
    import {PopupDialog} from 'react-ui'
    PopupDialog.close()
    PopupDialog.closeId('g-g-custom-alert-container')
     */
    close: closeId.bind(null, GLOBAL_POPUP_ID),
    closeId: closeId
};