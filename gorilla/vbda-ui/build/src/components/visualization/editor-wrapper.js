'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _defaultEditor = require('./defaultEditor');

var _defaultEditor2 = _interopRequireDefault(_defaultEditor);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//相容舊式的呼叫方式
var EditorWrapper = _react2.default.createClass({
    displayName: 'EditorWrapper',
    getInitialState: function getInitialState() {
        return { isUpdate: false };
    },
    componentDidMount: function componentDidMount() {
        var _ref = this.props._ref;

        if (_ref) {
            _ref(this);
        }
    },
    open: function open(data) {
        var _this = this;

        var forceAdd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var isUpdate = !forceAdd && !_lodash2.default.isEmpty(data);
        this.setState({ isUpdate: isUpdate }, function () {
            return _this.targetEditor.open(data, { isUpdate: isUpdate, forceAdd: forceAdd });
        });
    },
    render: function render() {
        var _this2 = this;

        var isUpdate = this.state.isUpdate;

        var props = _extends({}, this.props);
        props._ref = function (ref) {
            _this2.targetEditor = ref;
        };
        props.actions = {
            onConfirm: {
                label: '確認',
                callBack: isUpdate ? this.props.onUpdate : this.props.onCreate
            }
        };
        return _react2.default.createElement(_defaultEditor2.default, props);
    }
});

exports.default = EditorWrapper;