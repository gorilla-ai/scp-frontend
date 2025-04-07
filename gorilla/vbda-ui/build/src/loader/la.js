'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.findNodes = findNodes;
exports.findLinks = findLinks;
exports.findShortestPath = findShortestPath;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _ajaxHelper = require('react-ui/build/src/utils/ajax-helper');

var _ajaxHelper2 = _interopRequireDefault(_ajaxHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findNodes(_ref) {
    var id = _ref.id,
        labels = _ref.labels,
        properties = _ref.properties;

    return _ajaxHelper2.default.one({
        url: '/api/cibd/la/nodes/_search',
        data: {
            id: id, labels: labels, properties: properties
        }
    });
}

function findLinks(_ref2) {
    var id = _ref2.id,
        type = _ref2.type,
        properties = _ref2.properties;

    return _ajaxHelper2.default.one({
        url: '/api/cibd/la/relationships/_search',
        data: {
            id: id, type: type, properties: properties
        }
    });
}

function findShortestPath(_ref3) {
    var node_a_id = _ref3.fromId,
        node_b_id = _ref3.toId,
        depth = _ref3.depth;

    return _ajaxHelper2.default.one({
        url: '/api/cibd/la/shortest_paths/_search',
        data: {
            node_a_id: node_a_id,
            node_b_id: node_b_id,
            depth: depth
        }
    });
}

exports.default = {
    findNodes: findNodes,
    findLinks: findLinks,
    findShortestPath: findShortestPath
};