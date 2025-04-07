'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.auth = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.hasRight = hasRight;
exports.hasRole = hasRole;
exports.hasSomeRight = hasSomeRight;
exports.hasSomeRole = hasSomeRole;
exports.create = create;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('loglevel').getLogger('core/utils/auth-helper');

var auth = exports.auth = null;

function hasRight(a, b) {
    return _lodash2.default.includes(a, b);
}
function hasRole(a, b) {
    return _lodash2.default.includes(a, b);
}

function hasSomeRight(a, b) {
    return _lodash2.default.intersection(a, b).length > 0;
}
function hasSomeRole(a, b) {
    return _lodash2.default.intersection(a, b).length > 0;
}

var Auth = function () {
    function Auth(menu, pages) {
        var _this = this;

        _classCallCheck(this, Auth);

        this.menu = this._normalizeMenu(menu);
        this.pages = _lodash2.default.mapValues(pages, function (v, k) {
            return _extends({}, v, {
                menuPath: _this._findMenuPath(_this.menu, k)
            });
        });
        log.info('Auth::created', this.menu, this.pages);
    }

    _createClass(Auth, [{
        key: '_firstAccessiblePageKey',
        value: function _firstAccessiblePageKey(session, _ref) {
            var _this2 = this;

            var key = _ref.key,
                children = _ref.children;

            if (!children || children.length <= 0) {
                var pageObj = this.pages[key];
                if (!pageObj) {
                    log.error('Auth::Page key \'' + key + '\' specified in menu is not configured in page settings');
                    return null;
                }

                var access = pageObj.access;

                var ownHasRight = false;

                if (_lodash2.default.isFunction(access)) {
                    ownHasRight = access(session);
                } else {
                    ownHasRight = hasSomeRight(session.rights, access.rights) || hasSomeRight(session.roles, access.roles);
                }
                return ownHasRight ? key : null;
            }

            var matched = null;
            _lodash2.default.some(children, function (c) {
                matched = _this2._firstAccessiblePageKey(session, c);
                return !!matched;
            });
            return matched;
        }
    }, {
        key: '_normalizeMenu',
        value: function _normalizeMenu(menuTree) {
            var _this3 = this;

            return _lodash2.default.map(menuTree, function (item) {
                if (_lodash2.default.isString(item)) {
                    return {
                        key: item
                    };
                } else if (item.children) {
                    return {
                        key: item.key,
                        children: _this3._normalizeMenu(item.children)
                    };
                } else {
                    return item;
                }
            });
        }
    }, {
        key: '_findMenuPath',
        value: function _findMenuPath(menuTree, pageKey) {
            var _this4 = this;

            var foundPath = [];
            _lodash2.default.find(menuTree, function (c, idx) {
                if (c.key === pageKey) {
                    foundPath = [idx, 'children'];
                    return true;
                } else {
                    var foundSubPath = _this4._findMenuPath(c.children, pageKey);
                    if (foundSubPath.length <= 0) {
                        return false;
                    }
                    foundPath = [idx, 'children'].concat(_toConsumableArray(foundSubPath));
                    return true;
                }
            });

            return foundPath;
        }
    }, {
        key: 'getKeyOnPath',
        value: function getKeyOnPath(url) {
            var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var pageObj = _lodash2.default.find(this.pages, { url: url });
            if (!pageObj) {
                return null;
            }

            var menuPath = pageObj.menuPath.slice(0, level * 2 - 1);
            return _lodash2.default.get(this.menu, [].concat(_toConsumableArray(menuPath), ['key']));
        }
    }, {
        key: 'getMenu',
        value: function getMenu(session, parentKey) {
            var _this5 = this;

            var menu = [];

            var start = parentKey ? _lodash2.default.get(this.menu, _lodash2.default.get(this.pages, [parentKey, 'menuPath'], []), []) : this.menu;

            menu = _lodash2.default.reduce(start, function (acc, _ref2) {
                var key = _ref2.key,
                    children = _ref2.children;

                var page = null;
                if (!children) {
                    page = _this5._firstAccessiblePageKey(session, { key: key });
                } else {
                    _lodash2.default.some(children, function (c) {
                        var matched = _this5._firstAccessiblePageKey(session, c);
                        if (matched) {
                            page = matched;
                            return true;
                        }
                        return false;
                    });
                }

                if (page) {
                    acc.push({ key: key, url: _this5.pages[page].url, icon: _this5.pages[key].icon });
                }

                return acc;
            }, []);

            return menu;
        }
    }]);

    return Auth;
}();

function create(menu, pages) {
    exports.auth = auth = new Auth(menu, pages);
    return auth;
}

exports.default = {
    hasRole: hasRole,
    hasRight: hasRight,
    hasSomeRole: hasSomeRole,
    hasSomeRight: hasSomeRight,
    auth: auth,
    create: create
};