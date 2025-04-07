import React from 'react'
import _ from 'lodash'
import cx from 'classnames'

import Form from 'core/components/form'

import {
    /*Form, */CheckboxGroup, Checkbox, DateRange,
    DatePicker, RangeCalendar, Dropdown, Input, Textarea,
    RadioGroup, ButtonGroup, FileInput, Slider, ToggleButton
} from 'core/components'

import createExample from './example-factory'

let Examples = {}

Examples.Checkbox = class extends React.Component {
    state = {subscribe:false};

    handleChange = (subscribe) => {
        this.setState({subscribe})
    };

    render() {
        let {subscribe} = this.state
        return <div>
            <div className='c-flex aic'>
                <label htmlFor='subscribe'>Would you like to subscribe to this newsletter?</label>
                <Checkbox
                    id='subscribe'
                    onChange={this.handleChange}
                    checked={subscribe} />
            </div>
            <div className='c-flex aic'>
                <label htmlFor='subscribe-disabled'>Always checked</label>
                <Checkbox
                    id='subscribe-disabled'
                    checked={true}
                    disabled />
            </div>
        </div>
    }
}


Examples.CheckboxGroup = class extends React.Component {
    state = {
        movies: [1],
        eventInfo: null,
        settings: {
            enableAll: false,
            classNames: []
        }
    };

    handleChange = (movies, eventInfo) => {
        this.setState({movies, eventInfo})
    };

    renderDemoSettings = () => {
        const {settings} = this.state
        return <Form
            className='demo-settings'
            formClassName='inline'
            fields={{
                enableAll: {
                    label: 'Show All',
                    editor: 'Checkbox'
                },
                classNames: {
                    label: 'Apply classNames',
                    editor: 'CheckboxGroup',
                    props: {
                        list: _.map(['inline'], cn=>({value:cn, text:cn}))
                    }
                }
            }}
            value={settings}
            onChange={newSettings=>{ this.setState({settings:newSettings}) }} />
    };

    render() {
        const {movies, settings:{enableAll, classNames}} = this.state

        return <div>
            {this.renderDemoSettings()}
            <div className='c-form-item'>
                <label>Select movies</label>
                <CheckboxGroup
                    list={[
                        {value:1, text:'1 - Finding Dory (selected by default, cannot deselect)'},
                        {value:2, text:'2 - Wizard of Oz'},
                        {value:3, text:'3 - Citizen Kane', className:'ck'},
                        {value:4, text:'4 - Poppy Shakespear (cannot select)'}
                    ]}
                    className={cx(classNames)}
                    toggleAll={enableAll}
                    toggleAllText='Select/Unselect all'
                    onChange={this.handleChange}
                    value={movies}
                    disabled={[1, 4]} />
            </div>
        </div>
    }
}

Examples.RadioGroup = class extends React.Component {
    state = {
        movie: 'oz',
        eventInfo: null,
        settings: {
            classNames: []
        }
    };

    handleChange = (movie, eventInfo) => {
        this.setState({movie, eventInfo})
    };

    handleDemoSettingChange = (settings) => {
        this.setState({settings})
    };

    renderDemoSettings = () => {
        const {settings} = this.state
        return <Form
            className='demo-settings'
            formClassName='inline'
            fields={{
                classNames: {
                    label: 'Apply classNames',
                    editor: 'CheckboxGroup',
                    props: {
                        list: _.map(['inline'], cn=>({value:cn, text:cn}))
                    }
                }
            }}
            value={settings}
            onChange={this.handleDemoSettingChange} />
    };

    render() {
        const {movie, settings:{classNames}} = this.state
        return <div>
            {this.renderDemoSettings()}
            <div className='c-form-item'>
                <label>Select a movie</label>
                <RadioGroup
                    id='movie'
                    className={cx(classNames)}
                    list={[
                        {value:'dory', text:'dory - Finding Dory'},
                        {value:'oz', text:'oz - Wizard of Oz'},
                        {value:'kane', text:'kane - Citizen Kane', children:<input defaultValue='abc' type='text' />}
                    ]}
                    onChange={this.handleChange}
                    value={movie} />
            </div>
        </div>
    }
}

Examples.ButtonGroup = class extends React.Component {
    state = {
        type: 'movie',
        types: ['tv']
    };

    handleChange = (name, val) => {
        this.setState({[name]:val})
    };

    render() {
        let {type, types} = this.state
        return <div className='c-form'>
            <div>
                <label>Select a type</label>
                <ButtonGroup
                    id='type'
                    list={[
                        {value:'movie', text:'Movie'},
                        {value:'tv', text:'TV'},
                        {value:'actors', text:'Actors'}
                    ]}
                    onChange={this.handleChange.bind(this, 'type')}
                    value={type} />
            </div>
            <div>
                <label>Select multiple types (movie disabled)</label>
                <ButtonGroup
                    id='types'
                    list={[
                        {value:'movie', text:'Movie'},
                        {value:'tv', text:'TV'},
                        {value:'actors', text:'Actors'}
                    ]}
                    multi
                    disabled={['movie']}
                    onChange={this.handleChange.bind(this, 'types')}
                    value={types} />
            </div>
        </div>
    }
}

Examples.Dropdown = class extends React.Component {
    state = {
        movie: '',
        director: ''
    };

    handleChange = (field, value) => {
        this.setState({[field]:value})
    };

    render() {
        let {movie, director} = this.state
        return <div className='c-form' id='dropdown'>
            <div>
                <label htmlFor='movie'>Select movie (optional)</label>
                <Dropdown
                    id='movie'
                    list={[
                        {a:'fd', b:'Finding Dory'},
                        {a:'woo', b:'Wizard of Oz'},
                        {a:'ck', b:'Citizen Kane'}
                    ]}
                    listTransform={{value:'a', text:'b'}}
                    onChange={this.handleChange.bind(this, 'movie')}
                    defaultValue='fd'
                    value={movie} />
            </div>
            <div>
                <label htmlFor='director'>Select director (mandatory)</label>
                <Dropdown
                    id='director'
                    list={[
                        {value:'a', text:'Steven Spielberg'},
                        {value:'b', text:'Spike'},
                        {value:'c', text:'Lynch'},
                        {value:'d', text:'Bergman'}
                    ]}
                    size={3}
                    required={true}
                    onChange={this.handleChange.bind(this, 'director')}
                    defaultText='Please select a director'
                    value={director} />
            </div>
        </div>
    }
}

Examples.Input = class extends React.Component {
    state = {
        name: '',
        age: '',
        email: '',
        interest: '',
        job: ''
    };

    handleChange = (field, value) => {
        this.setState({[field]:value})
    };

    render() {
        let {name, age, email, interest, job} = this.state
        return <div className='c-form inline'>
            <div>
                <label htmlFor='name'>Name</label>
                <Input
                    id='name'
                    onChange={this.handleChange.bind(this, 'name')}
                    value={name}
                    required={true}
                    placeholder='Your name' />
            </div>
            <div>
                <label htmlFor='age'>Age</label>
                <Input
                    id='age'
                    type='number'
                    validate={{
                        max: 100,
                        t: (code, {value})=>`Age ${value} is invalid`
                    }}
                    className='my-age'
                    onChange={this.handleChange.bind(this, 'age')}
                    value={age}
                    placeholder='Your age' />
            </div>
            <div>
                <label htmlFor='email'>Email</label>
                <Input
                    id='email'
                    validate={{
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        patternReadable: 'xxx@xxx.xxx',
                        t: (code, {value, pattern})=>{
                            if (code==='missing') {
                                return 'You didn\'t enter an email address'
                            }
                            else { // assume pattern issue
                                return `${value} You didn't provide a valid email, the correct format should be ${pattern}`
                            }
                        }
                    }}
                    onChange={this.handleChange.bind(this, 'email')}
                    value={email} />
            </div>
            <div>
                <label htmlFor='interest'>Interest</label>
                <Input
                    id='interest'
                    onChange={this.handleChange.bind(this, 'interest')}
                    value={interest}
                    required={false}
                    placeholder='Your Interest' />
            </div>
            <div>
                <label htmlFor='job'>Job</label>
                <Input
                    id='job'
                    onChange={this.handleChange.bind(this, 'job')}
                    value={job}
                    required={true}
                    placeholder='Your Job' />
            </div>
        </div>
    }
}

Examples.Textarea = class extends React.Component {
    state = {
        feedback: ''
    };

    handleChange = (field, value) => {
        this.setState({[field]:value})
    };

    render() {
        const {feedback} = this.state
        return <div className='c-form inline'>
            <div>
                <label htmlFor='feedback'>Feedback</label>
                <Textarea
                    id='feedback'
                    onChange={this.handleChange.bind(this, 'feedback')}
                    value={feedback} />
            </div>
        </div>
    }
}

Examples.DateRange = class extends React.Component {
    state = {
        date: {
            from: '2012-04-26',
            to: '2012-10-26'
        },
        datetime: {
            from: '2012-10-26 12:00',
            to: '2012-10-26 17:00'
        }
    };

    handleChange = (field, value) => {
        this.setState({[field]:value})
    };

    render() {
        let {date, datetime} = this.state
        return <div className='c-form'>
            <div>
                <label htmlFor='date'>Select Date Range</label>
                <DateRange
                    id='date'
                    onChange={this.handleChange.bind(this, 'date')}
                    value={date}
                    t={(code, params) => {
                        if (code === 'missing') { return 'Please input date' }
                        else {
                            return `Invalid date format. Should be ${params.pattern}`
                        }
                    }} />
            </div>
            <div>
                <label htmlFor='datetime'>Select Date Time Range</label>
                <DateRange
                    id='datetime'
                    onChange={this.handleChange.bind(this, 'datetime')}
                    enableTime={true}
                    value={datetime}
                    t={(code, params) => {
                        if (code === 'missing') { return 'Please input date' }
                        else {
                            return `Invalid date format. Should be ${params.pattern}`
                        }
                    }} />
            </div>
        </div>
    }
}

Examples.Datepicker = class extends React.Component {
    state = {
        date: '2017-03-20',
        datetime: '2017-03-20 16:01'
    };

    handleChange = (field, value) => {
        this.setState({[field]:value})
    };

    render() {
        let {date, datetime} = this.state
        return <div className='c-form'>
            <div>
                <label htmlFor='date'>Select Date</label>
                <DatePicker
                    id='date'
                    onChange={this.handleChange.bind(this, 'date')}
                    value={date}
                    locale='zh'
                    t={(code, params) => {
                        if (code === 'missing') { return 'Please input date' }
                        else {
                            return `Invalid date format. Should be ${params.pattern}`
                        }
                    }} />
            </div>
            <div>
                <label htmlFor='datetime'>Select Date Time</label>
                <DatePicker
                    id='datetime'
                    onChange={this.handleChange.bind(this, 'datetime')}
                    enableTime={true}
                    value={datetime}
                    t={(code, params) => {
                        if (code === 'missing') { return 'Please input date' }
                        else {
                            return `Invalid date format. Should be ${params.pattern}`
                        }
                    }} />
            </div>
        </div>
    }
}

Examples.RangeCalendar = class extends React.Component {
    state = {
        date: {
            from: '2012-04-26',
            to: '2012-10-26'
        },
        datetime: {
            from: '2012-10-26 12:00',
            to: '2012-10-26 17:00'
        }
    };

    handleChange = (field, value) => {
        this.setState({[field]:value})
    };

    render() {
        let {date, datetime} = this.state
        return <div className='c-form'>
            <div>
                <label htmlFor='date'>Select Date Range</label>
                <RangeCalendar
                    id='date'
                    onChange={this.handleChange.bind(this, 'date')}
                    value={date}
                    shortcut
                    t={(code, params) => {
                        if (code === 'missing') { return 'Please input date' }
                        else {
                            return `Invalid date format. Should be ${params.pattern}`
                        }
                    }} />
            </div>
            <div>
                <label htmlFor='datetime'>Select Date Time Range</label>
                <RangeCalendar
                    id='datetime'
                    onChange={this.handleChange.bind(this, 'datetime')}
                    enableTime={true}
                    value={datetime}
                    shortcut={
                    [
                            {value:1, text:'Hour', unit:'hours'},
                            {value:1, text:'Day', unit:'days'},
                            {value:1, text:'Month', unit:'months'},
                            {value:1, text:'Quarter', unit:'quarters'},
                            {value:1, text:'Year', unit:'years'}
                    ]
                    }
                    t={(code, params) => {
                        if (code === 'missing') { return 'Please input date' }
                        else {
                            return `Invalid date format. Should be ${params.pattern}`
                        }
                    }} />
            </div>
        </div>
    }
}

Examples.FileInput = class extends React.Component {
    state = {
        name: '',
        type: '',
        size: 0
    };

    handleChange = (file) => {
        this.setState({
            name: file ? file.name : '',
            type: file ? file.type : '',
            size: file ? file.size : 0
        })
    };

    render() {
        return <div className='c-flex aic'>
            <FileInput
                onChange={this.handleChange} required={true} name='fileDemo'
                validate={{
                    max: 10,
                    extension: ['.mp3', '.wma', '.pdf'],
                    t: (code, params) => {
                        if (code === 'file-too-large') {
                            return `File size should be lower than ${params.max} MB`
                        }
                        else {
                            return `File format should be ${params.extension}`
                        }
                    }
                }} />
        </div>
    }
}

Examples.Slider = class extends React.Component {
    state = {value:40, value1:20};

    handleChange = (e) => {
        let value = e
        this.setState({value})
    };

    render() {
        let {value, value1} = this.state
        return (
            <div>
                <Slider value={value} onChange={this.handleChange} showProgress={true} min={0} max={100} step={5} />
                <Slider value={value1} showProgress={true} min={0} max={100} step={5} disabled />
            </div>
        )
    }
}

Examples.ToggleButton = class extends React.Component {
    state = {subscribe:false, subscribe1:false, subscribe2:true, subscribe3:false};

    handleChange = (subscribe) => {
        this.setState({subscribe})
    };

    handleChangeName = (subscribe1) => {
        // let result = {};
        // result[`${name}`]=obj;
        this.setState({subscribe1})
    };

    render() {
        let {subscribe, subscribe1, subscribe2, subscribe3} = this.state
        return (<div className='c-form'>
            <div className='inline'>
                <label htmlFor='subscribe'>Would you like to subscribe to this newsletter?</label>
                <ToggleButton
                    id='subscribe'
                    onChange={this.handleChange}
                    onText='On'
                    offText='Off'
                    on={subscribe} />
            </div>
            <div className='inline'>
                <ToggleButton
                    id='subscribe1'
                    onChange={this.handleChangeName}
                    onText='On'
                    offText='Off'
                    on={subscribe1} />
                <label htmlFor='subscribe1'>Primary toggle button</label>
            </div>
            <div className='inline'>
                <ToggleButton
                    id='subscribe2'
                    onText='On'
                    offText='Off'
                    on={subscribe2}
                    disabled />
                <label htmlFor='subscribe2'>Primary toggle button disabled</label>
            </div>
            <div className='inline'>
                <ToggleButton
                    id='subscribe3'
                    onText='On'
                    offText='Off'
                    on={subscribe3}
                    disabled />
                <label htmlFor='subscribe3'>Primary toggle button disabled</label>
            </div>
        </div>)
    }
}


export default class extends React.Component {
    render() {
        return <div id='example-form'>
            {
                _.map(Examples, (example, key)=>{
                    return React.createElement(createExample(example, key), {key})
                })
            }
        </div>
    }
}
