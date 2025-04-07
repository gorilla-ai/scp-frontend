import _ from 'lodash'

const log = require('loglevel').getLogger('core/utils/auth-helper')

export let auth = null

export function hasRight(a, b) {
    return _.includes(a, b)
}
export function hasRole(a, b) {
    return _.includes(a, b)
}

export function hasSomeRight(a, b) {
    return _.intersection(a, b).length > 0
}
export function hasSomeRole(a, b) {
    return _.intersection(a, b).length > 0
}

class Auth {
    constructor(menu, pages) {
        this.menu = this._normalizeMenu(menu)
        this.pages = _.mapValues(pages, (v, k)=>{
            return {
                ...v,
                menuPath: this._findMenuPath(this.menu, k)
            }
        })
        log.info('Auth::created', this.menu, this.pages)
    }

    _firstAccessiblePageKey(session, {key, children}) {
        if (!children || children.length <= 0) {
            const pageObj = this.pages[key]
            if (!pageObj) {
                log.error(`Auth::Page key '${key}' specified in menu is not configured in page settings`)
                return null
            }

            const {access} = pageObj
            let ownHasRight = false

            if (_.isFunction(access)) {
                ownHasRight = access(session)
            }
            else {
                ownHasRight = hasSomeRight(session.rights, access.rights) || hasSomeRight(session.roles, access.roles)
            }
            return ownHasRight ? key : null
        }

        let matched = null
        _.some(children, c=>{
            matched = this._firstAccessiblePageKey(session, c)
            return !!matched
        })
        return matched
    }

    _normalizeMenu(menuTree) {
        return _.map(menuTree, item=>{
            if (_.isString(item)) {
                return {
                    key: item
                }
            }
            else if (item.children) {
                return {
                    key: item.key,
                    children: this._normalizeMenu(item.children)
                }
            }
            else {
                return item
            }
        })
    }

    _findMenuPath(menuTree, pageKey) {
        let foundPath = []
        _.find(menuTree, (c, idx)=>{
            if (c.key===pageKey) {
                foundPath = [idx, 'children']
                return true
            }
            else {
                const foundSubPath = this._findMenuPath(c.children, pageKey)
                if (foundSubPath.length<=0) {
                    return false
                }
                foundPath = [idx, 'children', ...foundSubPath]
                return true
            }
        })

        return foundPath
    }

    getKeyOnPath(url, level=0) {
        const pageObj = _.find(this.pages, {url})
        if (!pageObj) {
            return null
        }

        const menuPath = pageObj.menuPath.slice(0, (level*2)-1)
        return _.get(this.menu, [...menuPath, 'key'])
    }

    getMenu(session, parentKey) {
        let menu = []

        const start = parentKey ? _.get(this.menu, _.get(this.pages, [parentKey, 'menuPath'], []), []) : this.menu

        menu = _.reduce(start, (acc, {key, children}) => {
            let page = null
            if (!children) {
                page = this._firstAccessiblePageKey(session, {key})
            }
            else {
                _.some(children, c=>{
                    const matched = this._firstAccessiblePageKey(session, c)
                    if (matched) {
                        page = matched
                        return true
                    }
                    return false
                })
            }

            if (page) {
                acc.push({key, url:this.pages[page].url, icon:this.pages[key].icon})
            }

            return acc
        }, [])

        return menu
    }

}

export function create(menu, pages) {
    auth = new Auth(menu, pages)
    return auth
}


export default {
    hasRole,
    hasRight,
    hasSomeRole,
    hasSomeRight,
    auth,
    create
}