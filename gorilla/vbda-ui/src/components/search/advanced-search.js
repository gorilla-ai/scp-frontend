import React from 'react'
import _ from 'lodash'
import cx from 'classnames'

import TabView from 'react-ui/build/src/components/tabs'

import Form from '../visualization/form'

const AdvancedSearch = (props) => {
    const {lng, cfg, dtId, currentSearchId, onSearch, onSearchChange} = props
    const {dt, searches} = cfg

    if (!dtId) {
	    return null
    }

    const searchIds = dt[dtId].searches
    const searchCfgs = _.pick(searches, searchIds)
    const searchCfg = searches[currentSearchId]
    const SearchVis = searchCfg.vis || Form

    return <TabView
        className={cx('advanced-search fixed')}
        menu={_.mapValues(searchCfgs, (v, k)=>v.display_name || k)}
        current={currentSearchId}
        onChange={onSearchChange}>
        <SearchVis
            id={currentSearchId}
            lng={lng}
            cfg={searchCfg}
            onSearch={onSearch} />
    </TabView>
}

export default AdvancedSearch