import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import Form from '../components/form'
import Popover from '../components/popover'
import {wireSet} from './prop-wire'

const log = require('loglevel').getLogger('react-ui/hoc/search-provider')


export function withSearch(Component, options={}) {
    const {
        searchTarget='data',
        filterEntryField,
        defaultTitle='Search',
        defaultApplyText='Apply'
    } = options

    const propTypes = {
        [searchTarget]: PropTypes.arrayOf(PropTypes.object),
        id: PropTypes.string,
        actions: PropTypes.node,
        show: PropTypes.arrayOf(PropTypes.string),
        search: PropTypes.shape({
            title: PropTypes.string,
            applyText: PropTypes.string,
            filter: PropTypes.oneOfType([
                PropTypes.bool,
                PropTypes.object,
                PropTypes.func
            ]),
            form: PropTypes.object,
            value: PropTypes.object,
            onSearch: PropTypes.func
        })
    }


    return wireSet(class extends React.Component {
        static propTypes = propTypes;

        static defaultProps = {
            search: {}
        };

        constructor(props, context) {
            super(props, context);
            this.searchContainerId = `g-${props.id || Math.random()}-search-container`
            const {
                [searchTarget]: items,
                show,
                search: {
                    form: searchForm,
                    filter,
                    value: search
                }
            } = props

            if (_.isEmpty(searchForm)) {
                this.state = {};
                return;
            }

            this.state = {
                showSearch: false,
                show: this.getIdsToShow(items, show, searchForm, filter, search)
            };
        }

        componentWillReceiveProps(nextProps) {
            const {
                [searchTarget]: items,
                show,
                search: {
                    form: searchForm,
                    filter,
                    value: search
                }
            } = nextProps
            const {
                [searchTarget]: prevItems,
                show: prevShow,
                search: {
                    form: prevSearchForms,
                    value: prevSearch
                }
            } = this.props

            if (_.isEmpty(searchForm)) {
                return
            }

            if (items!==prevItems || !_.isEqual(search, prevSearch) || !_.isEqual(searchForm, prevSearchForms) || show!==prevShow) {
                log.debug('componentDidUpdate::re-calculate show', {search, prevSearch, show, prevShow})
                this.setState({
                    show: this.getIdsToShow(items, show, searchForm, filter, search)
                })
            }
        }

        componentWillUnmount() {
            Popover.closeId(this.searchContainerId)
        }

        compactSearch = (data) => {
            if (_.isString(data)) {
                return _.trim(data) || null
            }
            if (data === false) {
                return null
            }
            if (_.isObject(data)) {
                const compactedObj = _.reduce(data, (acc, v, k)=>{
                    const compactedVal = this.compactSearch(v)
                    if (compactedVal == null) {
                        return acc
                    }
                    return {
                        ...acc,
                        [k]: compactedVal
                    }
                }, {})
                return _.isEmpty(compactedObj) ? null : compactedObj
            }
            if (_.isArray(data)) {
                const compactedArr = _.reduce(data, (acc, v)=>{
                    const compactedVal = this.compactSearch(v)
                    if (compactedVal == null) {
                        return acc
                    }
                    return [
                        ...acc,
                        compactedVal
                    ]
                }, [])
                return _.isEmpty(compactedArr) ? null : compactedArr
            }
            return data
        };

        getIdsToShow = (items, show, searchForm, filter, search) => {
            const compactedSearch = this.compactSearch(search)

            log.debug('getIdsToShow', {filter})

            if (filter===false || _.isEmpty(compactedSearch)) {
                return show
            }

            let filterToApply = filter
            if (!filter || filter===true) {
                filterToApply = filterEntryField ? {[filterEntryField]:compactedSearch} : compactedSearch
            }

            const toShow = _(items)
                .filter(item=>{
                    const {id} = item
                    if (show && !_.includes(show, id)) {
                        return false
                    }


                    if (_.isFunction(filterToApply)) {
                        return filterToApply(item, compactedSearch)
                    }
                    else {
                        return _.isMatchWith(
                            item,
                            filterToApply,
                            (itemVal, filterVal)=>{
                                if (_.isString(filterVal) && _.trim(filterVal)==='') {
                                    return true
                                }
                                if (_.isString(itemVal) && _.isString(filterVal)) {
                                    return (itemVal+'').toLowerCase().indexOf(filterVal.toLowerCase())>=0
                                }
                                return undefined
                            }
                        )
                    }
                })
                .map('id')
                .value()
            return toShow
        };

        toggleSearchPanel = () => {
            this.setState(({showSearch})=>{
                return {
                    showSearch: !showSearch
                }
            }, ()=>{
                const {showSearch} = this.state

                if (!showSearch) {
                    Popover.closeId(this.searchContainerId)
                    return
                }

                const {
                    search: {
                        form: searchForm,
                        value: searchValue,
                        applyText: searchApplyText=(_.isFunction(defaultApplyText) ? defaultApplyText() : defaultApplyText)
                    }
                } = this.props

                const rect = this.searchBtnNode.getBoundingClientRect()
                const {bottom, left} = rect
                const position = {
                    x: left,
                    y: bottom
                }

                const SearchPanel = <Form
                    {...searchForm}
                    className={cx('search', searchForm.className)}
                    defaultValue={searchValue}
                    actions={{
                        apply: {
                            text: searchApplyText,
                            handler: this.handleSearch
                        }
                    }} />
                Popover.openId(this.searchContainerId, position, SearchPanel, {className:'nopad'})
            })
        };

        handleSearch = (search) => {
            const {search:{onSearch}} = this.props
            onSearch(search)
        };

        render() {
            const {
                search: {
                    title: searchTitle,
                    form: searchForm
                },
                actions: originalActions
            } = this.props

            if (_.isEmpty(searchForm)) {
                return <Component
                    {...this.props}
                    ref={ref=>{ this._component=ref }} />
            }

            const {showSearch, show} = this.state

            const actions = [
                <button
                    ref={ref=>{ this.searchBtnNode=ref }}
                    onClick={this.toggleSearchPanel}
                    className={cx('standard fg fg-search', {active:showSearch})}
                    title={searchTitle || (_.isFunction(defaultTitle) ? defaultTitle() : defaultTitle)} />,
                originalActions
            ]

            return <Component
                {..._.omit(this.props, ['search'])}
                actions={actions}
                show={show}
                ref={ref=>{ this._component=ref }} />
        }
    }, {
        search: {
            name: 'search.value',
            defaultName: 'search.defaultValue',
            defaultValue: {},
            changeHandlerName: 'search.onSearch'
        }
    });
}

export default withSearch