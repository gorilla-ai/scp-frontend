import React from 'react'
import cx from 'classnames'
import $ from 'jquery'
import _ from 'lodash'
import im from 'object-path-immutable'

import Form from 'core/components/form'
import {Table, PageNav, Search, Dropdown, Input} from 'core/components'

import subscribeGrid from 'core/utils/grid-event'

import createExample from './example-factory'

const FIELDS = {
    id: { label:'ID', sortable:true },
    title: { label:'Title', sortable:true},
    adult: {
        label: 'Adult',
        formatter: {
            type: 'mapping',
            list: {true:'Yes', false:'No'}
        },
        className: 'center'
    },
    original_language: {
        label: 'Language',
        formatter: {
            type: 'mapping',
            list: [
                {lang:'en', desc:'English'},
                {lang:'de', desc:'German'}
            ],
            listTransform: {
                value: 'lang',
                text: 'desc'
            }
        }
    },
    popularity: {label:'Popularity'},
    release_date: {
        label: 'Year',
        formatter: {type:'date', format:'YYYY-MM-DD'},
        sortable: true,
        style: {
            width: 100,
            minWidth: 100
        }
    }
}

let Examples = {}

Examples.PagedTable = class extends React.Component {
    state = {
        settings: {
            classNames: []
        },
        search: null,
        page: 1,
        pages: null,
        sort: {
            field: 'title',
            desc: false
        },
        info: null,
        error: false,
        data: []
    };

    handleSort = (sort) => {
        let {search} = this.state
        if (search) {
            this.loadList({sort})
        }
        else {
            this.setState({sort})
        }
    };

    handleSearch = (search) => {
        this.loadList({search, page:1})
    };

    gotoPage = (page) => {
        this.loadList({page})
    };

    handleInputChange = (rid, field, value) => {
        let {data} = this.state
        let index = _.findIndex(data, ({id})=>id==rid)
        this.setState({data:im.set(data, [index, field], value)})
    };

    loadList = (newState) => {
        this.setState({...newState, data:[], info:'Loading...', error:false}, () => {
            let {page, sort:{field:sortBy, desc:sortDesc}, search} = this.state

            $.get(`https://api.themoviedb.org/3/${search?'search':'discover'}/movie`,
                {
                    api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                    query: search,
                    page,
                    sortBy,
                    sortDesc
                })
                .done(({results:list=[], total_results:total=0, total_pages:pages=null}) => {
                    if (total === 0) {
                        this.setState({info:'No movies found!', pages:null})
                        return
                    }

                    this.setState({info:null, data:list, pages})
                })
                .fail(xhr => {
                    this.setState({info:xhr.responseText, error:true})
                })
        })
    };

    renderDemoSettings = () => {
        const {settings} = this.state
        return <Form
            className='demo-settings'
            fields={{
                classNames: {
                    label: 'Apply classNames',
                    editor: 'CheckboxGroup',
                    props: {
                        className: 'inline',
                        list: _.map([
                            'bland', 'nohover', 'fixed-header', 'column',
                            'border-inner-vertical', 'border-inner-horizontal',
                            'border-inner', 'border-outer', 'border-all'], cn=>({value:cn, text:cn}))
                    }
                }
            }}
            value={settings}
            onChange={newSettings=>{ this.setState({settings:newSettings}) }} />
    };

    render() {
        let {settings:{classNames}, data, sort, pages, page, info, error} = this.state

        return <div className='c-box noborder'>
            {this.renderDemoSettings()}
            <header className='c-flex aic'>
                <Search className='end' onSearch={this.handleSearch} enableClear />
            </header>
            <div className='content nopad'>
                <Table
                    id='paged-table'
                    data={data}
                    fields={{
                        ...FIELDS,
                        rate: {
                            label: 'Rating',
                            editor: Dropdown,
                            props: {
                                list: _.map(_.range(1, 11), i=>({value:i, text:i}))
                            }
                        },
                        actions: {label: '', formatter: (val, {id})=>{
                            return <span>
                                <i className='c-link fg fg-eye' onClick={()=>{ window.alert(`open ${id} edit box!`) }} />
                            </span>
                        }}
                    }}
                    rowIdField='id'
                    className={cx(classNames)}
                    info={info}
                    infoClassName={cx({'c-error':error})}
                    onInputChange={this.handleInputChange}
                    sort={sort}
                    onSort={this.handleSort} />
            </div>
            <footer className='c-flex'>
                <PageNav pages={pages} current={page} className='center' onChange={this.gotoPage} />
            </footer>
        </div>
    }
}


Examples.SelectableTable = class extends React.Component {
    state = {
        search: null,
        selected: {ids:[], eventInfo:null},
        clicked: {id:null, eventInfo:null},
        info: null,
        error: false,
        data: []
    };

    handleSearch = (search) => {
        this.loadList({search})
    };

    handleSelect = (ids, eventInfo) => {
        this.setState({selected:{ids, eventInfo}})
    };

    handleClick = (id, data) => {
        this.setState({clicked:{id, data}})
    };

    loadList = (newState) => {
        this.setState({...newState, data:[], info:'Loading...', error:false}, () => {
            let {search} = this.state

            $.get(`https://api.themoviedb.org/3/${search?'search':'discover'}/movie`,
                {
                    api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                    query: search
                })
                .done(({results:list=[], total_results:total=0}) => {
                    if (total === 0) {
                        this.setState({info:'No movies found!', pages:null})
                        return
                    }

                    this.setState({info:null, data:list})
                })
                .fail(xhr => {
                    this.setState({info:xhr.responseText, error:true})
                })
        })
    };

    render() {
        let {data, info, error} = this.state

        return <div className='c-box noborder'>
            <header className='c-flex'>
                <Search className='end' onSearch={this.handleSearch} />
            </header>
            <div className='content'>
                <Table
                    id='selectable-table'
                    className='fixed-header'
                    data={data}
                    fields={FIELDS}
                    rowIdField='id'
                    info={info}
                    infoClassName={cx({'c-error':error})}
                    defaultSort={{
                        field: 'title',
                        desc: false
                    }}
                    onRowClick={this.handleClick}
                    selection={{
                        enabled: true,
                        toggleAll: true,
                        multiSelect: true
                    }}
                    onSelectionChange={this.handleSelect} />
            </div>
        </div>
    }
}

Examples.DataGrid = class extends React.Component {
    state = {
        info: null,
        error: false,
        data: []
    };

    componentDidMount() {
        this.addGridEvent()
        this.loadList()
    }

    componentWillUnmount() {
        this.removeGridEvent()
    }

    addGridEvent = () => {
        this.removeGridEvent()
        this.handle = subscribeGrid(this.node)
            .on('row', () => {

            })
            .on('column', () => {

            })
    };

    removeGridEvent = () => {
        this.handle && this.handle.unsubscribe()
    };

    loadList = () => {
        this.setState({data:[], info:'Loading...', error:false}, () => {
            $.get('https://api.themoviedb.org/3/search/movie',
                {
                    api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                    query: 'blade'
                })
                .done(({results:list=[], total_results:total=0}) => {
                    if (total === 0) {
                        this.setState({info:'No movies found!', pages:null})
                        return
                    }

                    this.setState({info:null, data:list})
                })
                .fail(xhr => {
                    this.setState({info:xhr.responseText, error:true})
                })
        })
    };

    handleInputChange = (rid, field, value) => {
        let {data} = this.state
        let index = _.findIndex(data, ({id})=>id==rid)
        this.setState({data:im.set(data, [index, field], value)})
    };

    render() {
        let {data, info, error} = this.state

        return <div className='c-box noborder' ref={ref=>{ this.node=ref }}>
            <div className='content'>
                <Table
                    id='data-grid'
                    data={data}
                    fields={_.mapValues(FIELDS, (cfg, key)=>{
                        return key==='id' ? cfg : {
                            ...cfg,
                            sortable: false,
                            editor: Input
                        }
                    })}
                    onInputChange={this.handleInputChange}
                    className='fixed-header c-grid border-inner'
                    rowIdField='id'
                    info={info}
                    infoClassName={cx({'c-error':error})}
                    defaultSort={{
                        field: 'title',
                        desc: false
                    }} />
            </div>
        </div>
    }
}

export default class extends React.Component {
    render() {
        return <div id='example-table'>
            {
                _.map(Examples, (example, key)=>{
                    return React.createElement(createExample(example, key), {key})
                })
            }
        </div>
    }
}

