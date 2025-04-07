import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import $ from 'jquery'
import im from 'object-path-immutable'
import cx from 'classnames'


import Form from 'core/components/form'
import {Combobox, Dropdown, Input, MultiInput/*, Form*/} from 'core/components'

import createExample from './example-factory'

let Examples = {}


Examples.Combobox = class extends React.Component {
    state = {
        movie: {
            selected: 'test',
            eventInfo: null,
            info: null,
            error: false,
            list: [{value:'test', text:'TEST'}]
        },
        tv: {
            selected: [],
            eventInfo: null,
            info: null,
            error: false,
            list: []
        },
        producers: {}
    };

    handleChange = (field, value, eventInfo) => {
        this.setState(
            im(this.state)
                .set(field+'.selected', value)
                .set(field+'.eventInfo', eventInfo)
                .value()
        )
    };

    handleSearch = (type, text) => {
        // ajax to fetch movies, but doesn't need to be ajax
        this.setState(
            im(this.state)
                .set(type+'.list', [])
                .set(type+'.error', false)
                .set(type+'.info', 'Loading...')
                .value(),
            () => {
                $.get(
                    `https://api.themoviedb.org/3/${text?'search':'discover'}/${type}`,
                    {
                        api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                        query: text
                    })
                    .done(({results:list=[], total_results:total=0})=>{
                        if (total <= 0) {
                            this.setState(
                                im(this.state)
                                    .set(type+'.list', [])
                                    .set(type+'.info', `No ${type} found`)
                                    .value()
                            )
                        }
                        else {
                            this.setState(
                                im(this.state)
                                    .set(type+'.list', _.map(list, ({id, name, title})=>({value:id, text:title||name})))
                                    .set(type+'.info', total>10 ? `There are ${total} results, only show the first 10 records` : null)
                                    .value()
                            )
                        }
                    })
                    .fail((xhr)=>{
                        this.setState(im.set(this.state, type+'.error', xhr.responseText))
                    })
            }
        )
    };

    render() {
        return <div className='c-form'>
            {
                ['movie', 'tv'].map(type=>{
                    let {info, error, list, selected} = this.state[type]

                    return <div key={type}>
                        <label htmlFor={type}>Select {type}</label>
                        <Combobox
                            id={type}
                            required={true}
                            onChange={this.handleChange.bind(this, type)}
                            search={{
                                enabled: true,
                                onSearch: this.handleSearch.bind(this, type)
                            }}
                            info={info}
                            infoClassName={cx({'c-error':error})}
                            list={list}
                            placeholder={type}
                            enableClear={type==='tv'}
                            multiSelect={{
                                enabled: type==='tv',
                                toggleAll: true,
                                toggleAllText: 'All'
                            }}
                            value={selected} />
                    </div>
                })
            }
            <div>
                <label htmlFor='producers'>Select producers</label>
                <Combobox
                    id='producers'
                    list={['abc', 'def', 'xyz', 'ijk'].map(i=>({value:i, text:i}))}
                    multiSelect={{
                        enabled: true,
                        toggleAll: true
                    }}
                    search={{
                        enabled: true
                    }}
                    info={(list)=>{
                        return list.length <=0 ? 'No Results Found' : ''
                    }}
                    onChange={this.handleChange.bind(this, 'producers')}
                    value={this.state.producers.selected} />
            </div>
        </div>
    }
}

Examples.MultiInput = class extends React.Component {
    state = {
        phones: [],
        movies: [],
        actors: [],
        files: [],
        forms: [{field1:'value1'}],
        settings: {
            layout: '',
            readOnly: false
        }
    };

    handleChange = (field, value) => {
        this.setState({[field]:value})
    };

    renderDemoSettings = () => {
        const {settings} = this.state
        return <Form
            className='demo-settings inline'
            fields={{
                layout: {
                    label: 'layout',
                    editor: 'RadioGroup',
                    props: {
                        className: 'inline',
                        list: _.map(['', 'inline', 'expand', 'boxed'], item=>({value:item, text:item||'default(none)'}))
                    }
                },
                readOnly: {
                    label: 'readOnly',
                    editor: 'Checkbox'
                }
            }}
            value={settings}
            onChange={newSettings=>{ this.setState({settings:newSettings}) }} />
    };

    render() {
        let {phones, movies, actors, forms, settings:{layout, readOnly}} = this.state
        const layoutProp = {[layout]:true}
        return <div>
            {this.renderDemoSettings()}
            <div className='c-form'>
                <div>
                    <label htmlFor='phones'>Enter phones</label>
                    <MultiInput
                        id='phones'
                        base='Input'
                        props={{validate: {
                            pattern: /^[0-9]{10}$/,
                            t: ()=>'Incorrect phone number, should read like 0900000000'
                        }}}
                        readOnly={readOnly}
                        {...layoutProp}
                        onChange={this.handleChange.bind(this, 'phones')}
                        value={phones} />
                </div>
                <div>
                    <label htmlFor='movies'>Select movies</label>
                    <MultiInput
                        id='movies'
                        base='Combobox'
                        props={{
                            enableClear: false,
                            list: ['abc', 'def', 'xyz', 'ijk'].map(i=>({value:i, text:i})),
                            search: {
                                enabled: true
                            }
                        }}
                        readOnly={readOnly}
                        {...layoutProp}
                        onChange={this.handleChange.bind(this, 'movies')}
                        value={movies} />
                </div>
                <div>
                    <label htmlFor='actors'>Select actors</label>
                    <MultiInput
                        id='actors'
                        base='Dropdown'
                        props={{list:['abc', 'def', 'xyz', 'ijk'].map(i=>({value:i, text:i}))}}
                        readOnly={readOnly}
                        {...layoutProp}
                        onChange={this.handleChange.bind(this, 'actors')}
                        value={actors} />
                </div>
                <div>
                    <label htmlFor='files'>Select files (using FileInput component)</label>
                    <MultiInput
                        id='files'
                        base='FileInput'
                        props={{
                            accept: '.csv',
                            enableClear: false
                        }}
                        readOnly={readOnly}
                        {...layoutProp}
                        persistKeys
                        onChange={this.handleChange.bind(this, 'files')} />
                </div>
                <div>
                    <label htmlFor='input'>React Native Inputs</label>
                    <MultiInput
                        id='react'
                        base='input'
                        props={{
                            type: 'text'
                        }}
                        readOnly={readOnly}
                        {...layoutProp}
                        onChange={this.handleChange.bind(this, 'react')} />
                </div>
                <div>
                    <label>Multi Forms</label>
                    <MultiInput
                        base='Form'
                        props={{
                            className: 'inline',
                            fields: {
                                field1: {editor:'Input'},
                                field2: {editor:'Input'},
                                field3: {editor:'Input'},
                                field4: {editor:'Input'}
                            }
                        }}
                        value={forms}
                        readOnly={readOnly}
                        {...layoutProp}
                        addText='Add New Form'
                        defaultItemValue={{}}
                        onChange={this.handleChange.bind(this, 'forms')} />
                </div>
            </div>
        </div>
    }
}


class Query extends React.Component {
    static propTypes = {
        onChange: PropTypes.func,
        value: PropTypes.shape({
            app: PropTypes.string,
            time: PropTypes.string
        })
    };

    handleChange = (field, value) => {
        let {onChange, value:curValue} = this.props
        onChange({
            ...curValue,
            [field]: value
        })
    };

    render() {
        let {value:{app, time}} = this.props
        const APPLICATIONS = ['Facebook', 'Twitter', 'Plurk', 'Line', 'Yahoo']
        return <div>
            <span> Web Application:
                <Dropdown
                    required={true}
                    onChange={this.handleChange.bind(this, 'app')}
                    value={app}
                    list={APPLICATIONS.map(type=>({value:type, text:type}))} />
            </span>
            <span>Time:
                <Input placeholder='Enter Time' onChange={this.handleChange.bind(this, 'time')} value={time} />
            </span>
        </div>
    }
}

Examples.MultiInputCustom = class extends React.Component {
    state = {
        queries: [
            {app:'Facebook', time:'2016-07-26 14:00'},
            {app:'Facebook', time:'2016-07-25 14:45'}
        ]
    };

    handleChange = (queries) => {
        this.setState({queries})
    };

    render() {
        let {queries} = this.state
        return <MultiInput
            base={Query}
            value={queries}
            addText='Add Query'
            removeText='Remove'
            defaultItemValue={{app:'Facebook'}}
            onChange={this.handleChange} />
    }
}

Examples.BasicForm = class extends React.Component {
    state = {
        movie: {
            id: 99,
            year: '1982',
            title: 'Blade Runner',
            director: 'Ridley Scott',
            languages: ['english', 'japanese'],
            reviews: 'Great movie!',
            genre: 'scifi', // index into 'scifi' drop down list
            notes: [],
            scores: {
                imdb: 8.2,
                rottenTomatoes: 8.9
            }
        },
        settings: {
            withActions: false,
            columns: 3,
            classNames: ['inline', 'left']
        }
    };

    handleChange = (movie, eventInfo) => {
        this.setState({movie, eventInfo})
    };

    handleSearch = (movie) => {
        // do some ajax here
        console.log('search for movie', {movie})
    };

    renderDemoSettings = () => {
        const {settings} = this.state
        return <Form
            className='demo-settings'
            formClassName='inline'
            fields={{
                withActions: {
                    label: 'Include Actions',
                    editor: 'Checkbox'
                },
                columns: {
                    label: '# columns',
                    editor: 'Dropdown',
                    props: {
                        list: _.map([1, 2, 3, 4], c=>({value:c, text:c}))
                    }
                },
                classNames: {
                    label: 'Apply classNames',
                    editor: 'CheckboxGroup',
                    props: {
                        className: 'inline',
                        list: _.map(['inline', 'aligned', 'left'], cn=>({value:cn, text:cn}))
                    }
                }
            }}
            value={settings}
            onChange={newSettings=>{ this.setState({settings:newSettings}) }} />
    };

    render() {
        const {settings:{withActions, classNames, columns}, movie} = this.state

        return <div>
            {this.renderDemoSettings()}
            <Form
                id='movie'
                formClassName={cx(classNames)}
                actions={withActions ? {
                    clear: {text:'Clear', clearForm:true},
                    search: {text:'Search', triggerOnComplete:false, handler:this.handleSearch}
                }: null}
                columns={columns}
                fields={{
                    id: {label:'ID', formatter:id=>`X${id}`},
                    year: {label:'Year', editor:'Input', props:{type:'integer', required:true, validate:{min:1900}}},
                    title: {label:'Title', editor:'Input', props:{required:true}},
                    director: {label:'Director', editor:'Input', props:{required:true}},
                    directedIn: {label:'Directed In', editor:'DatePicker', props:{}},
                    genre: {label: 'Genre', editor: 'Dropdown', props: {
                        list: [
                            {value:'drama', text:'Drama'},
                            {value:'horror', text:'Horror'},
                            {value:'scifi', text:'Sci-Fi'}
                        ],
                        defaultText: 'Please select a genre'
                    }},
                    languages: {label: 'Languages', className: 'group', editor: 'CheckboxGroup', props: {
                        list: [
                            {value:'english', text:'English'},
                            {value:'japanese', text:'Japanese'},
                            {value:'german', text:'German'},
                            {value:'xyz', text:'XYZ'}
                        ],
                        disabled: ['xyz']
                    }},
                    reviews: {label:'Reviews', editor:'Textarea', props:{required:false}},
                    notes: {label:'Notes', editor:'MultiInput', props:{base:'Input', inline:true}},
                    'scores.imdb': {label: 'IMDB Score', editor: 'Input', props: (data)=>{
                        // disable IMDB score when production year is in the future
                        if (data.year >= 2017) {
                            return {disabled:true}
                        }
                        else {
                            return {type:'number', validate:{min:0}}
                        }
                    }},
                    'scores.rottenTomatoes': {label:'Tomatoes Score', editor:'Input', props:{type:'number', validate:{min:0}}}
                }}
                onChange={this.handleChange}
                value={movie} />
        </div>
    }
}

Examples.ComplexForm = class extends React.Component {
    state = {
        movie: {
            id: 99,
            year: '1982',
            title: 'Blade Runner',
            director: 'Ridley Scott',
            languages: ['english', 'japanese'],
            genre: 'scifi', // index into 'scifi' drop down list
            notes: [],
            scores: {
                imdb: 8.2,
                rottenTomatoes: 8.9
            }
        },
        settings: {
            withActions: false,
            columns: 2,
            classNames: ['aligned', 'inline']
        }
    };

    handleChange = (movie, eventInfo) => {
        this.setState({movie, eventInfo})
    };

    handleSearch = (movie) => {
        // do some ajax here
        console.log('search for movie', {movie})
    };

    renderDemoSettings = () => {
        const {settings} = this.state
        return <Form
            className='demo-settings'
            formClassName='inline'
            fields={{
                withActions: {
                    label: 'Include Actions',
                    editor: 'Checkbox'
                },
                columns: {
                    label: '# columns',
                    editor: 'Dropdown',
                    props: {
                        list: _.map([1, 2, 3, 4], c=>({value:c, text:c}))
                    }
                },
                classNames: {
                    label: 'Apply classNames',
                    editor: 'CheckboxGroup',
                    props: {
                        className: 'inline',
                        list: _.map(['inline', 'aligned', 'left'], cn=>({value:cn, text:cn}))
                    }
                }
            }}
            value={settings}
            onChange={newSettings=>{ this.setState({settings:newSettings}) }} />
    };

    render() {
        const {settings:{withActions, classNames, columns}, movie} = this.state

        return <div>
            {this.renderDemoSettings()}
            <Form
                id='movie'
                header='Create New Movie'
                footer='* required fields'
                formClassName={cx(classNames)}
                actions={withActions ? {
                    clear: {text:'Clear', clearForm:true},
                    search: {text:'Search', triggerOnComplete:true, handler:this.handleSearch}
                }: null}
                columns={columns}
                fields={{
                    summary: {
                        merge: true,
                        editor: 'Form',
                        props: {
                            header: 'Movie',
                            formClassName: 'inline',
                            fields: {
                                id: {label:'ID', formatter:id=>`X${id}`},
                                year: {label:'Year', editor:'Input', props:{type:'integer', required:true, validate:{min:1900}}},
                                title: {label:'Title', editor:'Input', props:{required:true}}
                            }
                        }
                    },
                    director: {
                        merge: true,
                        editor: 'Form',
                        props: {
                            header: 'Director',
                            formClassName: 'inline',
                            fields: {
                                director: {label:'Director', editor:'Input', props:{required:true}},
                                directedIn: {label:'Directed In', editor:'DatePicker', props:{}}
                            }
                        }
                    },
                    misc: {
                        merge: true,
                        editor: 'Form',
                        props: {
                            header: 'Misc',
                            formClassName: cx('aligned', {left:_.includes(classNames, 'left')}),
                            fields: {
                                genre: {label: 'Genre', editor: 'Dropdown', props: {
                                    list: [
                                        {value:'drama', text:'Drama'},
                                        {value:'horror', text:'Horror'},
                                        {value:'scifi', text:'Sci-Fi'}
                                    ],
                                    defaultText: 'Please select a genre'
                                }},
                                languages: {label: 'Languages', editor: 'CheckboxGroup', props: {
                                    className: 'inline',
                                    list: [
                                        {value:'english', text:'English'},
                                        {value:'japanese', text:'Japanese'},
                                        {value:'german', text:'German'},
                                        {value:'xyz', text:'XYZ'}
                                    ],
                                    disabled: ['xyz']
                                }},
                                notes: {label:'Notes', editor:'MultiInput', props:{base:'Input', inline:false}}
                            }
                        }
                    },
                    scores: {
                        label: '',
                        editor: 'Form',
                        props: {
                            header: 'Reviews',
                            formClassName: cx('aligned', {left:_.includes(classNames, 'left')}),
                            fields: {
                                imdb: {label: 'IMDB', editor: 'Input', props: (data)=>{
                                    // disable IMDB score when production year is in the future
                                    if (data.year >= 2017) {
                                        return {disabled:true}
                                    }
                                    else {
                                        return {type:'number', validate:{min:0}}
                                    }
                                }},
                                rottenTomatoes: {label:'Rotten Tomatoes', editor:'Input', props:{type:'number', validate:{min:0}}}
                            }
                        }
                    }
                }}
                onComplete={this.handleSearch}
                onChange={this.handleChange}
                value={movie} />
        </div>
    }
}


export default () => <div id='example-form-advanced'>
    {
        _.map(Examples, (example, key)=>{
            return React.createElement(createExample(example, key), {key})
        })
    }
</div>
