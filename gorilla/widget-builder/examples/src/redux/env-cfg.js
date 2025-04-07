export default (state = null, {type, cfg={}}) => {
    switch (type) {
        case 'SET_ENV_CFG':
            return cfg
        default:
            return state
    }
}
