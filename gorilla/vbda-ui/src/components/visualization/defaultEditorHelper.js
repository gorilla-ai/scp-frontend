import _ from "lodash";

export function onChangeEventInfoParse(eventInfo, defaultFieldName, wholeEventData) {
    let {rawData: event, targetFieldName: eventInfoTargetFieldName} = eventInfo
    let targetFieldName;

    if(!_.isNil(eventInfoTargetFieldName)){
        //確認是不是再array object裡面，如果是的話，直接指定到整個data
        if(/\.[0-9]+\./.test(eventInfoTargetFieldName)){
            event = wholeEventData
        }
        targetFieldName = eventInfoTargetFieldName
    }
    else
        targetFieldName = defaultFieldName
    return {
        event, targetFieldName
    }
}