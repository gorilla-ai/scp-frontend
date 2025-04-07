'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ajaxHelper = require('react-ui/build/src/utils/ajax-helper');

var instance = (0, _ajaxHelper.getInstance)('vbda');
if (!instance) {
    console.log('create vbda ajax instance');

    instance = (0, _ajaxHelper.createInstance)('vbda', {
        parseFail: function parseFail(json) {
            return {
                code: json.errorCode,
                message: json.message
            };
        },
        parseSuccess: function parseSuccess(json) {
            return json;
        }
    });
}

exports.default = instance;