import React from 'react'
import _ from 'lodash'
import $ from 'jquery'
import im from 'object-path-immutable'
import cx from 'classnames'

import Heatmap from 'chart/components/combobox'

import createExample from './example-factory'

let Examples = {}


Examples.Heatmap = class extends React.Component {
    state = {
        movie: {
            selected: 'test',
            eventInfo: null,
            info: null,
            error: false,
            list: [{imdbID:'test', Title:'TEST'}]
        },
        series: {
            selected: [],
            eventInfo: null,
            info: null,
            error: false,
            list: []
        }
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
                $.get('http://www.omdbapi.com', {s:text, type})
                    .done(({Error:error, Search:list=[], totalResults:total=0})=>{
                        if (error) {
                            this.setState(im(this.state).set(type+'.error', true).set(type+'.info', error).value())
                        }
                        else if (total <= 0) {
                            this.setState(im.set(this.state, type+'.info', `No ${type} found`))
                        }
                        else {
                            this.setState(
                                im(this.state)
                                    .set(type+'.list', list)
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
        return <div className='pure-form-aligned'>
            {
                ['movie', 'series'].map(type=>{
                    let {info, error, list, selected} = this.state[type]
                    list = _.map(list, ({imdbID, Title})=>({value:imdbID, text:Title}))

                    return <div key={type} className='pure-control-group'>
                        <label htmlFor={type}>Select {type}</label>
                        <Heatmap
                            id={type}
                            required={true}
                            onChange={this.handleChange.bind(this, type)}
                            onSearch={this.handleSearch.bind(this, type)}
                            info={info}
                            infoClassName={cx({'c-error':error})}
                            list={list}
                            placeholder={type}
                            multiValue={type==='series'}
                            value={selected} />
                    </div>
                })
            }
        </div>
    }
}

export default () => <div>
    {
        _.map(Examples, (example, key)=>{
            return React.createElement(createExample(example, key), {key})
        })
    }
</div>
