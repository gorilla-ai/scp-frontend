
export default (state = null, {type, session=null}) => {
    switch (type) {
        case 'SET_SESSION':
            return session
        case 'CLEAR_SESSION':
            return null
        default:
            return state
    }
}


export function setSession(session) {
    return { type:'SET_SESSION', session }
}

export function clearSession(session) {
    return { type:'CLEAR_SESSION', session }
}
