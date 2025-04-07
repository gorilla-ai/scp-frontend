'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getMsg = exports.getSystemMsg = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                    * @module error-helper
                                                                                                                                                                                                                                                                    * @description Error message helpers
                                                                                                                                                                                                                                                                    */

exports.createInstance = createInstance;
exports.getInstance = getInstance;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('loglevel').getLogger('core/utils/error-helper');

var defaultEt = function defaultEt(codes) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return 'Error: ' + codes + ' - ' + JSON.stringify(_lodash2.default.values(params));
};

function _getMsg(_ref) {
    var code = _ref.code,
        _ref$params = _ref.params,
        params = _ref$params === undefined ? {} : _ref$params,
        message = _ref.message;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$et = options.et,
        et = _options$et === undefined ? defaultEt : _options$et,
        ft = options.ft;


    var msg = '';

    // try to localize 'field' parameter if exists
    if (params.field && ft) {
        msg += ft('fields.' + params.field) + ': ';
    }
    return msg + et(['' + code, '-1'], _extends({ code: code }, params, { message: message }));
}

function _getSystemMsg() {
    var et = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultEt;

    return et('-1');
}

/**
 * Converts error object(s) into an error message
 * @param {array.<Object>} errors - array of errors
 * @param {Object} [options] - options
 * @param {function} [options.et] - error translator
 * @param {function} [options.ft] - field translator
 * @return {string} error message
 *
 */
exports.getSystemMsg = _getSystemMsg;
function _getMsg2(errors) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!errors || errors.length === 0) {
        return _getSystemMsg();
    }
    return _lodash2.default.map(errors, function (error) {
        return _getMsg(error, options);
    }).join('<br/>');
}

exports.getMsg = _getMsg2;

var ErrorHandler = function () {
    function ErrorHandler(id) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, ErrorHandler);

        this.id = id;
        var _options$et2 = options.et,
            et = _options$et2 === undefined ? defaultEt : _options$et2;


        this.setupErrorTranslate(et);
    }

    _createClass(ErrorHandler, [{
        key: 'setupErrorTranslate',
        value: function setupErrorTranslate(et) {
            this.et = et;
        }
    }, {
        key: 'getSystemMsg',
        value: function getSystemMsg() {
            return _getSystemMsg(this.et);
        }
    }, {
        key: 'getMsg',
        value: function getMsg(errors) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            options = _lodash2.default.isObject(options) ? options : {};
            return _getMsg2(errors, _extends({ et: this.et }, options));
        }
    }]);

    return ErrorHandler;
}();

ErrorHandler.instances = {};

/**
 * Create a new error handler instance
 * @param {string} id - instance id, may be used to retrieve instance in future calls
 * @param {Object} [options] - options
 * @param {function} [options.et] - error translator
 * @return {Object} created error handler instance object
 *
 */
function createInstance(id, options) {
    if (ErrorHandler.instances[id]) {
        log.error('Cannot create instance, instance with id ' + id + ' already exists');
        return null;
    }

    var newInstance = new ErrorHandler(id, options);
    ErrorHandler.instances[id] = newInstance;
    return newInstance;
}

/**
 * Retrieves error handler instance
 * @param {string} id - instance id, may be used to retrieve instance in future calls
 * @return {Object} error handler instance object
 *
 * @example
 * const moduleErrorHandler = getInstance('module-id')
 */
function getInstance(id) {
    return ErrorHandler.instances[id];
}

var eh = createInstance('global');

exports.default = eh;