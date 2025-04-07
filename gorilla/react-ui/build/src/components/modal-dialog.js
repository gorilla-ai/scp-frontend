'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsCssTransitionGroup = require('react-addons-css-transition-group');

var _reactAddonsCssTransitionGroup2 = _interopRequireDefault(_reactAddonsCssTransitionGroup);

var _reactDraggable = require('react-draggable');

var _reactDraggable2 = _interopRequireDefault(_reactDraggable);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes3 = require('../consts/prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/modal-dialog');

/**
 * A React modal dialog
 * @constructor
 * @param {string} [id] - Modal dialog element #id
 * @param {renderable} [title] - Title of the dialog
 * @param {object} actions - Define buttons and actions to trigger
 * @param {object} actions.key - Config for this **action**
 * @param {string} actions.key.text - action button text
 * @param {string} actions.key.className - action button className
 * @param {boolean} [actions.key.disabled=false] - disable this action
 * @param {function} actions.key.handler - function to invoke when action is triggered (ie button clicked)
 * @param {string} [closeAction] - Action to invoke when close(x) icon is clicked
 * @param {string} [defaultAction] - Default action button **key** to focus on
 * @param {string} [className] - Additional classnames for modal container
 * @param {string} [contentClassName] - Additional classnames for the dialog content
 * @param {string} [controlClassName] - Additional classnames for the action buttons
 * @param {object} [style] - Style for the dialog
 * @param {number} [opacity=0.5] - Opacity for the background shield
 * @param {boolean} [show=true] - Show dialog or not?
 * @param {boolean} [useTransition=false] - Transition effect?
 * @param {boolean} [draggable=false] - Draggable header?
 * @param {boolean} [boolean=false] - Make dialog center of page?
 * @param {renderable} [info] - React renderable object, display info at footer, eg error message
 * @param {string} [infoClassName] - Assign className to info node
 * @param {renderable} children - Content of the dialog
 *
 * @example

import _ from 'lodash'
import {ModalDialog, Dropdown} from 'react-ui'
import {LinkedStateMixin} from 'core/mixins/linked-state-mixins'

const INITIAL_STATE = {
    open:false,
    info:null,
    error:false,
    movieId:null
}
const RateMovieDialog = React.createClass({
    mixins:[LinkedStateMixin],
    getInitialState() {
        return _.clone(INITIAL_STATE)
    },
    open(movieId, {rating}) {
        // ajax get movie details by id
        this.setState({movieId, rating, open:true})
    },
    close(changed, data) {
        this.setState(_.clone(INITIAL_STATE), () => {
            this.props.onDone(changed, data);
        });
    },
    rateMovie() {
        let {rating} = this.state
        // can be ajax to post rating
        if (rating) {
            this.close(true, {rating})
        }
        else {
            this.setState({info:'Please select rating', error:true})
        }
    },
    render() {
        let {movieId, open, info, error} = this.state;
        if (!open) {
            return null
        }

        let actions = {
             cancel:{text:'Cancel', handler:this.close.bind(this,false,null)},
             confirm:{text:'OK!', className:'btn-ok', handler:this.rateMovie}
        }
        return <ModalDialog
             id='rate-movie-dialog'
             title={`Rate ${movieId}!`}
             draggable={true}
             global={true}
             info={info}
             infoClassName={cx({'c-error':error})}
             actions={actions}>
             <Dropdown list={_.map(_.range(1,11),i=>({value:i,text:i}))}
                 valueLink={this.linkState('rating')}/>
         </ModalDialog>
    }
})
 */

var ModalDialog = function (_React$Component) {
    _inherits(ModalDialog, _React$Component);

    function ModalDialog() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ModalDialog);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ModalDialog.__proto__ || Object.getPrototypeOf(ModalDialog)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            show: _this.props.show
        }, _this.toggle = function (show) {
            _this.setState({ show: show });
        }, _this.focusAction = function () {
            if (_this.state.show) {
                var defaultAction = _this.props.defaultAction;


                if (defaultAction) {
                    _this[defaultAction + 'Btn'].focus();
                }
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ModalDialog, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.focusAction();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.setState({ show: nextProps.show });
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.focusAction();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                useTransition = _props.useTransition;
            var show = this.state.show;


            var modalContent = null;

            if (show) {
                var _props2 = this.props,
                    title = _props2.title,
                    actions = _props2.actions,
                    closeActionKey = _props2.closeAction,
                    className = _props2.className,
                    contentClassName = _props2.contentClassName,
                    controlClassName = _props2.controlClassName,
                    dialogStyle = _props2.style,
                    opacity = _props2.opacity,
                    info = _props2.info,
                    infoClassName = _props2.infoClassName,
                    draggable = _props2.draggable,
                    global = _props2.global,
                    children = _props2.children;


                var actionNodes = _lodash2.default.map(_lodash2.default.keys(actions), function (actionKey) {
                    var action = actions[actionKey];
                    return _react2.default.createElement(
                        'button',
                        {
                            className: (0, _classnames2.default)(controlClassName, action.className),
                            disabled: action.disabled,
                            ref: function ref(_ref2) {
                                _this2[actionKey + 'Btn'] = _ref2;
                            },
                            key: actionKey,
                            name: actionKey,
                            onClick: action.handler },
                        action.text || actionKey
                    );
                });

                var closeAction = closeActionKey && actions[closeActionKey];

                var dialogContent = _react2.default.createElement(
                    'section',
                    { id: id + '-dialog', className: 'c-box dialog', style: dialogStyle },
                    title ? _react2.default.createElement(
                        'header',
                        { className: (0, _classnames2.default)({ handle: draggable }, 'c-flex') },
                        title,
                        _react2.default.createElement('i', { className: 'c-link fg fg-close end', onClick: closeAction ? closeAction.handler : this.toggle.bind(this, false) })
                    ) : null,
                    _react2.default.createElement(
                        'div',
                        { id: id + '-content', className: (0, _classnames2.default)('content', contentClassName) },
                        children
                    ),
                    (actionNodes.length > 0 || info) && _react2.default.createElement(
                        'footer',
                        null,
                        info && _react2.default.createElement('div', { className: (0, _classnames2.default)('c-info', infoClassName), dangerouslySetInnerHTML: { __html: info } }),
                        actionNodes
                    )
                );

                modalContent = _react2.default.createElement(
                    'section',
                    { id: id, className: (0, _classnames2.default)('c-modal show', global ? 'c-center global' : '', className) },
                    _react2.default.createElement('div', { id: 'overlay', style: { opacity: opacity } }),
                    draggable ? _react2.default.createElement(
                        _reactDraggable2.default,
                        { handle: '.handle', bounds: 'parent' },
                        dialogContent
                    ) : dialogContent
                );
            }

            return useTransition ? _react2.default.createElement(
                _reactAddonsCssTransitionGroup2.default,
                {
                    transitionName: 'c-modal',
                    transitionEnterTimeout: 200,
                    transitionLeaveTimeout: 300 },
                modalContent
            ) : modalContent;
        }
    }]);

    return ModalDialog;
}(_react2.default.Component);

ModalDialog.propTypes = {
    id: _propTypes2.default.string,
    title: _propTypes2.default.node,
    actions: _propTypes2.default.objectOf(_propTypes2.default.shape({
        className: _propTypes2.default.string,
        text: _propTypes2.default.node,
        disabled: _propTypes2.default.bool,
        handler: _propTypes2.default.func
    }).isRequired).isRequired,
    closeAction: _propTypes2.default.string,
    defaultAction: _propTypes2.default.string,
    className: _propTypes2.default.string,
    contentClassName: _propTypes2.default.string,
    controlClassName: _propTypes2.default.string,
    style: _propTypes3.SIMPLE_OBJECT_PROP,
    opacity: _propTypes2.default.number,
    show: _propTypes2.default.bool,
    useTransition: _propTypes2.default.bool,
    draggable: _propTypes2.default.bool,
    global: _propTypes2.default.bool,
    info: _propTypes2.default.node,
    infoClassName: _propTypes2.default.string,
    children: _propTypes2.default.node
};
ModalDialog.defaultProps = {
    title: '',
    actions: {},
    opacity: 0.5,
    show: true,
    useTransition: false,
    draggable: false,
    global: false,
    className: ''
};
exports.default = ModalDialog;