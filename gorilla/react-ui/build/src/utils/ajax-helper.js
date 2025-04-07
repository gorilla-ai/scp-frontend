'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.multi = exports.series = exports.all = exports.one = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                    * @module ajax-helper
                                                                                                                                                                                                                                                                    * @description Ajax utilities for request
                                                                                                                                                                                                                                                                    */

exports.createInstance = createInstance;
exports.getInstance = getInstance;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _progress = require('../components/progress');

var _progress2 = _interopRequireDefault(_progress);

var _errorHelper = require('./error-helper');

var _errorHelper2 = _interopRequireDefault(_errorHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('loglevel').getLogger('core/utils/ajax-helper');

var defaultFailParser = function defaultFailParser(json, text) {
    if (json) {
        var code = json.code,
            message = json.message,
            errors = json.errors;

        return {
            code: code,
            message: message,
            errors: errors
        };
    }

    if (text) {
        return {
            message: text
        };
    }

    return {};
};

var defaultSuccessParser = function defaultSuccessParser(json) {
    return json;
};

var defaultGt = function defaultGt(code) {
    var mapping = {
        'txt-uploading': 'Uploading...',
        'txt-uploaded': 'Done'
    };
    return mapping[code] || code;
};

/**
 * Send one ajax request
 * @param {string|Object} req - url string or jquery request object
 * @param {Object} [options] - options
 * @param {boolean} [options.showProgress=true] - whether blocking spinner will be shown during request (before response is received)
 * @param {string} [options.prefix] - prefix to prepend to requested url
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @param {function} [options.eh] - error handler instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.et] - error translator function for translating error
 * @param {function} [options.ft] - field translator function for translating field name upon receiving error
 * @return {Object} Promise object
 *
 * @example
 *
 * // use default parsers
 * ah.one('/url/...')
 *     .then(data=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 *
 * // use customized parsers
 * ah.one('/url/...', {
 *     parseSuccess:(json)=>json.data,
 *     parseFail:(json, text)=>({code:json.errCode, message:json.errMessage})
 * })
 *     .then(data=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 */
function _one(req) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$showProgress = options.showProgress,
        showProgress = _options$showProgress === undefined ? true : _options$showProgress,
        prefix = options.prefix,
        _options$parseFail = options.parseFail,
        parseFail = _options$parseFail === undefined ? defaultFailParser : _options$parseFail,
        _options$parseSuccess = options.parseSuccess,
        parseSuccess = _options$parseSuccess === undefined ? defaultSuccessParser : _options$parseSuccess,
        _options$eh = options.eh,
        eh = _options$eh === undefined ? _errorHelper2.default : _options$eh;


    showProgress && _progress2.default.startSpin();

    if (_lodash2.default.isString(req)) {
        req = {
            url: req
        };
    }

    if (prefix) {
        req = _extends({}, req, {
            url: _path2.default.join(prefix, req.url)
        });
    }

    return _bluebird2.default.resolve(_jquery2.default.ajax(_extends({ type: 'GET' }, req))).catch(function (xhr) {
        showProgress && _progress2.default.done();

        var _parseFail = parseFail(xhr.responseJSON, xhr.responseText, xhr.status),
            code = _parseFail.code,
            message = _parseFail.message,
            errors = _parseFail.errors;

        var tOptions = _lodash2.default.pick(options, ['et', 'ft']);
        if (!errors || errors.length === 0) {
            throw new Error(eh.getMsg([{ code: code, message: message }], tOptions));
        } else {
            throw new Error(eh.getMsg(errors, tOptions));
        }
    }).then(function (res) {
        showProgress && _progress2.default.done();
        return parseSuccess(res);
    });
}

/**
 * Send multiple ajax requests all at once
 * @param {array.<string|Object>} req - array of url strings or jquery request objects
 * @param {Object} [options] - options
 * @param {boolean} [options.showProgress=true] - whether blocking spinner will be shown during request (before response is received)
 * @param {string} [options.prefix] - prefix to prepend to requested urls
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @param {function} [options.eh] - error handler instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.et] - error translator function for translating error
 * @param {function} [options.ft] - field translator function for translating field name upon receiving error
 * @return {Object} Promise object
 *
 * @example
 *
 * ah.all([
 *     '/url/...',
 *     {type:'GET', url:'/url2/...', data:{key:'value'}}
 * ])
 *     .then(([data1, data2])=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 */
exports.one = _one;
function _all(reqArr) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$showProgress2 = options.showProgress,
        showProgress = _options$showProgress2 === undefined ? true : _options$showProgress2;


    showProgress && _progress2.default.startSpin();

    return _bluebird2.default.map(reqArr, function (reqItem) {
        return _one(reqItem, _extends({}, options, { showProgress: false }));
    }).then(function (result) {
        showProgress && _progress2.default.done();

        return result;
    }).catch(function (e) {
        showProgress && _progress2.default.done();

        throw new Error(e);
    });
}

/**
 * Send multiple ajax requests in sequence (send subsequest request upon completion of previous request)
 * @param {array.<string|Object>} req - array of url strings or jquery request objects
 * @param {Object} [options] - options
 * @param {boolean} [options.showProgress=true] - whether blocking spinner will be shown during request (before response is received)
 * @param {string} [options.prefix] - prefix to prepend to requested urls
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @param {function} [options.eh] - error handler instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.et] - error translator function for translating error
 * @param {function} [options.ft] - field translator function for translating field name upon receiving error
 * @return {Object} Promise object
 *
 * @example
 * ah.series([
 *     '/url/...',
 *     {type:'GET', url:'/url2/...', data:{key:'value'}}
 * ])
 *     .then(([data1, data2])=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 *
 */
exports.all = _all;
function _series(reqArr) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$showProgress3 = options.showProgress,
        showProgress = _options$showProgress3 === undefined ? true : _options$showProgress3;


    showProgress && _progress2.default.startSpin();

    return _bluebird2.default.reduce(reqArr, function (values, reqItem) {
        return _one(reqItem, _extends({}, options, { showProgress: false })).then(function (value) {
            values.push(value);
            return values;
        });
    }, []).then(function (result) {
        showProgress && _progress2.default.done();

        return result;
    }).catch(function (e) {
        showProgress && _progress2.default.done();

        throw new Error(e);
    });
}

/**
 * Send multi part ajax request
 * @param {url} req - url string
 * @param {Object} data - key-value pairs of input elements or raw data
 * @param {Object} [options] - options
 * @param {boolean} [options.showProgress=true] - whether blocking spinner will be shown during request (before response is received)
 * @param {string} [options.prefix] - prefix to prepend to requested url
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @param {function} [options.eh] - error handler instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.et] - error translator function for translating error
 * @param {function} [options.ft] - field translator function for translating field name upon receiving error
 * @return {Object} Promise object
 *
 * @example
 * ah.multi(
 *     '/url/...',
 *     {key:'value',file:FILE} // file is HTMLInputElement
 * )
 *     .then(data=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 */
exports.series = _series;
function _multi(url, data) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _options$showProgress4 = options.showProgress,
        showProgress = _options$showProgress4 === undefined ? true : _options$showProgress4,
        prefix = options.prefix,
        _options$parseFail2 = options.parseFail,
        parseFail = _options$parseFail2 === undefined ? defaultFailParser : _options$parseFail2,
        _options$parseSuccess2 = options.parseSuccess,
        parseSuccess = _options$parseSuccess2 === undefined ? defaultSuccessParser : _options$parseSuccess2,
        _options$gt = options.gt,
        gt = _options$gt === undefined ? defaultGt : _options$gt,
        _options$eh2 = options.eh,
        eh = _options$eh2 === undefined ? _errorHelper2.default : _options$eh2;


    var hasFile = _lodash2.default.some(data, function (v) {
        return v instanceof HTMLInputElement && v.type === 'file';
    });

    if (showProgress) {
        if (hasFile) {
            _progress2.default.startProgress(gt('txt-uploading'));
        } else {
            _progress2.default.startSpin();
        }
    }

    var p = void 0,
        result = void 0;

    if (prefix) {
        url = _path2.default.join(prefix, url);
    }

    if (window.FormData) {
        var formData = new FormData();

        _lodash2.default.forEach(data, function (v, k) {
            if (v instanceof HTMLInputElement) {
                if (v.type === 'file') {
                    formData.append(k, v.files[0]);
                } else {
                    formData.append(k, v.value);
                }
            } else {
                formData.append(k, v);
            }
        });

        p = _one({
            url: url,
            type: 'POST',
            contentType: false,
            processData: false,
            data: formData,
            progress: showProgress && hasFile && function (loaded, total) {
                _progress2.default.setProgress(loaded, total);
            }
        }, _extends({}, options, { showProgress: false }));
    } else {
        p = new _bluebird2.default(function (resolve, reject) {
            // Let's create the iFrame used to send our data
            var iframe = document.createElement('iframe');
            iframe.name = 'multi';

            // Next, attach the iFrame to the main document
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            // Define what should happen when the response is loaded
            iframe.addEventListener('load', function () {
                // iframe.contentWindow.document - for IE<7
                var doc = iframe.contentDocument;
                var innerHTML = doc.body.innerHTML;

                //plain text response may be  wrapped  in <pre> tag
                if (innerHTML.slice(0, 5).toLowerCase() === '<pre>' && innerHTML.slice(-6).toLowerCase() === '</pre>') {
                    innerHTML = doc.body.firstChild.firstChild.nodeValue;
                }

                // Remove iframe after receiving response
                document.body.removeChild(iframe);

                var json = void 0;
                try {
                    json = JSON.parse(innerHTML);

                    var _parseFail2 = parseFail(json),
                        code = _parseFail2.code,
                        message = _parseFail2.message,
                        errors = _parseFail2.errors;

                    if (code === 0) {
                        resolve(parseSuccess(json));
                    } else {
                        var tOptions = _lodash2.default.pick(options, ['et', 'ft']);
                        if (!errors || errors.length === 0) {
                            reject(new Error(eh.getMsg([{ code: code, message: message }], tOptions)));
                        } else {
                            reject(new Error(eh.getMsg(errors, tOptions)));
                        }
                    }
                } catch (e) {
                    reject(e);
                }
            });

            // create form
            var form = document.createElement('form');
            form.action = url;
            form.method = 'POST';
            form.enctype = 'multipart/form-data'; // others
            form.encoding = 'multipart/form-data'; // in IE
            form.target = iframe.name;

            // Add data to form
            _lodash2.default.forEach(data, function (v, k) {
                var node = document.createElement('input');
                node.name = k;

                if (v instanceof HTMLInputElement) {
                    if (v.type === 'file') {
                        node = (0, _jquery2.default)(v).clone(true);
                        v.name = k;
                        (0, _jquery2.default)(v).hide();
                        node.insertAfter(v);
                        form.appendChild(v);
                    } else {
                        node.value = v.value;
                        form.appendChild(node.cloneNode());
                    }
                } else {
                    node.value = v;
                    form.appendChild(node.cloneNode());
                }
            });

            form.style.display = 'none';
            document.body.appendChild(form);

            // submit form
            form.submit();

            // Remove form after sent
            document.body.removeChild(form);
        });
    }

    return p.then(function (res) {
        showProgress && hasFile && _progress2.default.set(gt('txt-uploaded'));
        result = res;
        return _bluebird2.default.delay(1000);
    }).then(function () {
        showProgress && _progress2.default.done();
        return result;
    }).catch(function (err) {
        showProgress && _progress2.default.done();
        throw err;
    });
}

exports.multi = _multi;

var Ajaxer = function () {
    function Ajaxer(id) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Ajaxer);

        this.id = id;
        var prefix = options.prefix,
            _options$parseFail3 = options.parseFail,
            parseFail = _options$parseFail3 === undefined ? defaultFailParser : _options$parseFail3,
            _options$parseSuccess3 = options.parseSuccess,
            parseSuccess = _options$parseSuccess3 === undefined ? defaultSuccessParser : _options$parseSuccess3,
            et = options.et;


        this.setupPrefix(prefix);
        this.setupResponseParser(parseFail, parseSuccess);
        this.setupErrorHandler(et);
    }

    _createClass(Ajaxer, [{
        key: 'setupPrefix',
        value: function setupPrefix(prefix) {
            this.prefix = prefix;
        }
    }, {
        key: 'setupResponseParser',
        value: function setupResponseParser(parseFail, parseSuccess) {
            if (parseFail) {
                this.parseFail = parseFail;
            }
            if (parseSuccess) {
                this.parseSuccess = parseSuccess;
            }
        }
    }, {
        key: 'setupErrorHandler',
        value: function setupErrorHandler(et) {
            if (et) {
                this.eh = (0, _errorHelper.createInstance)(this.id + '-eh', { et: et });
            } else {
                this.eh = _errorHelper2.default;
            }
        }
    }, {
        key: 'one',
        value: function one(req) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return _one(req, _extends({
                prefix: this.prefix,
                parseFail: this.parseFail,
                parseSuccess: this.parseSuccess,
                eh: this.eh
            }, options));
        }
    }, {
        key: 'all',
        value: function all(reqArr) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return _all(reqArr, _extends({
                prefix: this.prefix,
                parseFail: this.parseFail,
                parseSuccess: this.parseSuccess,
                eh: this.eh
            }, options));
        }
    }, {
        key: 'series',
        value: function series(reqArr) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return _series(reqArr, _extends({
                prefix: this.prefix,
                parseFail: this.parseFail,
                parseSuccess: this.parseSuccess,
                eh: this.eh
            }, options));
        }
    }, {
        key: 'multi',
        value: function multi(url, data) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            return _multi(url, data, _extends({
                prefix: this.prefix,
                parseFail: this.parseFail,
                parseSuccess: this.parseSuccess,
                eh: this.eh
            }, options));
        }
    }]);

    return Ajaxer;
}();

Ajaxer.instances = {};

/**
 * Create a new ajax handler instance
 * @param {string} id - instance id, may be used to retrieve instance in future calls
 * @param {Object} [options] - options
 * @param {function} [options.eh] - error handler instance used by this instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @return {Object} created ajax handler instance object
 *
 * @example
 *
 * const moduleAjaxer = createInstance(
 *     'module-id',
 *     {
 *         parseSuccess:(json)=>json.data,
 *         parseFail:(json, text)=>({code:json.errCode, message:json.errMessage})
 *     }
 * )
 */
function createInstance(id) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (Ajaxer.instances[id]) {
        log.error('Cannot create instance, instance with id ' + id + ' already exists');
        return null;
    }

    var newInstance = new Ajaxer(id, options);
    Ajaxer.instances[id] = newInstance;
    return newInstance;
}

/**
 * Retrieves ajax handler instance
 * @param {string} id - instance id, may be used to retrieve instance in future calls
 * @return {Object} ajax handler instance object
 *
 * @example
 * const moduleAjaxer = getInstance('module-id')
 */
function getInstance(id) {
    return Ajaxer.instances[id];
}

var ah = createInstance('global');

exports.default = ah;