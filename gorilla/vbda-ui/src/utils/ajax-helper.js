import {createInstance, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let instance = getInstance('vbda')
if (!instance) {
    console.log('create vbda ajax instance')

    instance = createInstance('vbda', {
        parseFail: (json)=>({
            code: json.errorCode,
            message: json.message
        }),
        parseSuccess: (json)=>json
    })
}

export default instance