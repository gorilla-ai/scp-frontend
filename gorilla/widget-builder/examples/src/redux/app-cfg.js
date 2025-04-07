export default (state = {}, {type, cfg={}}) => {
    switch (type) {
        case 'SET_APP_CFG':
            return cfg
        default:
            return state
    }
}
