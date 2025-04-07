import React from 'react'
import _ from 'lodash'

import Dashboard from 'vbda/components/dashboard'

import config from '../mock/config/dashboard.json'

class DashboardExample extends React.Component {
    render() {
        return <Dashboard 
            cfg={config}
            url='/api/vbda/es'
            lng='en_us' />
    }
}


export default DashboardExample