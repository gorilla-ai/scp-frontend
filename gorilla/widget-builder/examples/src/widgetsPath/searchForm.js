import React from 'react'
import _ from 'lodash'
import im from 'object-path-immutable'
import Form from 'react-ui/build/src/components/form'

let log = require('loglevel').getLogger('formTest')

class test extends React.Component {
    constructor(props) {
        super(props)
        // this.initial()
        this.state = {info: 'initializing', data: props.data}
    }


    // componentDidUpdate(prevProps) {
    //     log.info(this)
    //     log.info(`test componentDidUpdate`)
    // }

    // handleChange(key, iValue) {
    //     let {onChange, value} = this.props
    //     onChange(im.set(value, key, iValue))
    // }
    onChange(key, value) {
        const {data} = this.state
        const newData = im.set(data, key, value)
        this.setState({data: newData})
    }

    onSearch() {
        const {onSearch} = this.props
        const {data} = this.state
        log.info("search",data)
        onSearch(data)
    }

    renderHOC() {
        return (value) => {
            _.set(newWidgetConfig, ['config', 'value'], value)
            return <HOC {...newWidgetConfig}/>
        }
    }

    render() {
        const {fields, HOC} = this.props
        const {data} = this.state
        const fieldsAfterHOC = _.mapValues(fields, (widgetConfig, fieldName) => {
            let newWidgetConfig = _.cloneDeep(widgetConfig)
            newWidgetConfig.config.onChange = (value) => this.onChange(fieldName, value)
            return {
                formatter: (value) => {
                    _.set(newWidgetConfig, ['config', 'value'], value)
                    return <HOC {...newWidgetConfig}/>
                }
            }
        })
        return <div className='c-box fixed'>
            <header>
                Search
            </header>
            <div className="content filter-form fixed">
                <Form
                    className='grow'
                    formClassName='c-form'
                    fields={fieldsAfterHOC}
                    // onChange={this.onChange}
                    value={data}/>
            </div>
            <footer>
                <button onClick={this.onSearch.bind(this)}>Search</button>
            </footer>
        </div>

    }
}

export default test