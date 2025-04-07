
export default (state = {}, {type, name, cache=null}) => {
    switch (type) {
        case 'SET_CACHE':
            return {...state, [name]:cache}
        case 'CLEAR_CACHE':
            return {...state, [name]:null}
        default:
            return state
    }
}


export function setCache(name, cache) {
    return { type:'SET_CACHE', name, cache }
}

export function clearCache(name) {
    return { type:'CLEAR_CACHE', name }
}
