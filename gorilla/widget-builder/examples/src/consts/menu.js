import _ from 'lodash'

import {RIGHTS} from './access'

export const MENU = [
    {
        key: 'projects'
    },
    {
        key: 'system',
        children: ['sys-config', 'audit']
    },
    {
        key: 'user',
        children: ['accounts', 'roles', 'groups']
    },
    'page1',
    {
        key: 'page2',
        children: ['page2-1', 'page2-2']
    },
    {
        key: 'page3',
        children: [
            'page3-1',
            {
                key: 'page3-2',
                children: [
                    'page3-2-1',
                    {
                        key: 'page3-2-2',
                        children: ['page3-2-2-1', 'page3-2-2-2']
                    }
                ]
            },
            'page3-3'
        ]
    }
]

export const PAGES = {
    page1: { url:'/page1', access:{rights:[RIGHTS.PAGE1]}, icon:'dashboard'},
    page2: { url:'/page2', icon:'case'},
    'page2-1': { url:'/page2/1', access:{rights:[RIGHTS.PAGE2]}},
    'page2-2': { url:'/page2/2', access:{rights:[RIGHTS.PAGE2]}},
    page3: { url:'/page3', icon:'box-product'},
    'page3-1': { url:'/page3/1', access:{rights:[RIGHTS.PAGE3_1]}},
    'page3-2': { url:'/page3/2'},
    'page3-2-1': { url:'/page3/2/1', access:{rights:[RIGHTS.PAGE3_2]}},
    'page3-2-2': { url:'/page3/2/2'},
    'page3-2-2-1': { url:'/page3/2/2/1', access:{rights:[RIGHTS.PAGE3_2]}},
    'page3-2-2-2': { url:'/page3/2/2/2', access:{rights:[RIGHTS.PAGE3_2]}},
    'page3-3': { url:'/page3/3', access:(session)=>session.username==='page3-3'},
    projects: { url:'/projects', access:{rights:[RIGHTS.PROJECTS]}, icon:'case'},
    system: { url:'/system', icon:'setting'},
    'sys-config': { url:'/system/config', access:{rights:[RIGHTS.SYS_CONFIG]}},
    audit: { url:'/system/audit', access:{rights:[RIGHTS.AUDIT]}},
    user: { url:'/user', icon:'ppl-face-1'},
    accounts: { url:'/user/accounts', access:(session)=>_.includes(session.rights, RIGHTS.ACCOUNT_MGMT) || session.isGroupOwner },
    roles: { url:'/user/roles', access:{rights:[RIGHTS.ROLE_MGMT]}},
    groups: { url:'/user/groups', access:(session)=>_.includes(session.rights, RIGHTS.GROUP_MGMT) || session.isGroupOwner }
}
