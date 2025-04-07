'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.multiTraverse = multiTraverse;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function multiTraverse(obj, paths, defaultValue) {
    return _lodash2.default.reduce(paths, function (acc, path) {
        return _lodash2.default.get(acc, path, defaultValue);
    }, obj);
}

exports.default = {
    multiTraverse: multiTraverse
};