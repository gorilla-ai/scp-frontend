"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.onChangeEventInfoParse = onChangeEventInfoParse;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function onChangeEventInfoParse(eventInfo, defaultFieldName, wholeEventData) {
    var event = eventInfo.rawData,
        eventInfoTargetFieldName = eventInfo.targetFieldName;

    var targetFieldName = void 0;

    if (!_lodash2.default.isNil(eventInfoTargetFieldName)) {
        //確認是不是再array object裡面，如果是的話，直接指定到整個data
        if (/\.[0-9]+\./.test(eventInfoTargetFieldName)) {
            event = wholeEventData;
        }
        targetFieldName = eventInfoTargetFieldName;
    } else targetFieldName = defaultFieldName;
    return {
        event: event, targetFieldName: targetFieldName
    };
}