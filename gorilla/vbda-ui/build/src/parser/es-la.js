'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (laCfg) {
    var nodes = laCfg.nodes,
        relationships = laCfg.relationships,
        representative_time = laCfg.representative_time,
        partition = laCfg.partition,
        active_image_processing = laCfg.active_image_processing; //dt[dtId].la

    var profiles = [];

    _lodash2.default.forEach(nodes, function (n) {
        var name = n.name,
            description = n.description,
            labels = n.labels,
            images = n.images;

        profiles.push({
            idKey: '_id',
            sh: 'circle',
            u: null,
            tKey: '_id',
            type: 'node',
            b: '#cccccc',
            e: 12,
            c: '#9a5d6f',
            dKey: ['__eventId', '__labels', '__props']
        });
    });

    _lodash2.default.forEach(relationships, function (r) {
        var name = r.name,
            description = r.description,
            type = r.type,
            direction = r.direction,
            node_a = r.node_a,
            node_b = r.node_b,
            properties = r.properties;
        //profiles.push({})
    });

    return profiles;
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }