import React from 'react'
import _ from 'lodash'
import cx from 'classnames'

import {List} from 'core/components'
import Form from 'core/components/form'
import paginate from 'core/hoc/paginator'

import createExample from './example-factory'

let Examples = {}
const ListWithPageNav = paginate(List, {target:'list'})

Examples.List = class extends React.Component {
    state = {
        movies: _(_.range(0, 200)).map(i=>({id:`${i}`, title:`Movie ${i}`})).value(),
        selected: null,
        settings: {
            multicols: false,
            selectable: true,
            multiSelect: true
        }
    };

    handleSelectionChange = (selected) => {
        this.setState({selected})
    };

    handleClick = (id, movie) => {
        console.log('movie clicked', {id, movie})
    };

    renderDemoSettings = () => {
        const {settings} = this.state
        return <Form
            className='demo-settings'
            formClassName='inline'
            fields={{
                multicols: {
                    label: 'Multi-columns?',
                    editor: 'Checkbox'
                },
                selectable: {
                    label: 'Selectable?',
                    editor: 'Checkbox'
                },
                multiSelect: {
                    label: 'Multiple Selection?',
                    editor: 'Checkbox'
                }
            }}
            value={settings}
            onChange={newSettings=>{ this.setState({settings:newSettings}) }} />
    };

    render() {
        const {movies, settings:{multicols, selectable, multiSelect}, selected} = this.state

        return <div>
            {this.renderDemoSettings()}
            <List
                id='movies'
                className={cx({multicols})}
                list={movies}
                itemClassName='aic'
                itemStyle={{padding:'5px'}}
                selection={{enabled:selectable, multiSelect}}
                selected={selected}
                onSelectionChange={this.handleSelectionChange}
                onClick={this.handleClick}
                formatter={movie=>`${movie.id} - ${movie.title}`} />
        </div>
    }
}

Examples.ListWithPageNav = class extends React.Component {
    state = {
        movies: _(_.range(0, 200)).map(i=>({id:`${i}`, title:`Movie ${i}`})).value(),
        selected: null
    };

    handleSelectionChange = (selected) => {
        this.setState({selected})
    };

    render() {
        const {movies, selected} = this.state

        return <ListWithPageNav
            id='movies'
            list={movies}
            itemClassName='aic'
            selection={{enabled:true, multiSelect:true}}
            selected={selected}
            onSelectionChange={this.handleSelectionChange}
            formatter={movie=>`${movie.id} - ${movie.title}`}
            paginate={{
                pageSize: 20,
                defaultCurrent: 2
            }} />
    }
}


export default class extends React.Component {
    render() {
        return <div id='example-list'>
            {
                _.map(Examples, (example, key)=>{
                    return React.createElement(createExample(example, key), {key})
                })
            }
        </div>
    }
}

