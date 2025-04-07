import _ from 'lodash'

export function multiTraverse(obj, paths, defaultValue) {
    return _.reduce(paths, (acc, path)=>{
        return _.get(acc, path, defaultValue)
    }, obj)
}

export default {
    multiTraverse
}