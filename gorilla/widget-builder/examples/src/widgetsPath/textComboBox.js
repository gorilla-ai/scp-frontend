import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import ComboBox from 'react-ui/build/src/components/combobox'
import im from 'object-path-immutable'

class TextComboBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selected: [],
            info: null,
            error: false,
            list: []
        }
    }

    handleChange(value, eventInfo) {
        let {onChange} = this.props
        onChange(value)
        this.setState(
            im(this.state)
                .set('selected', value)
                .value()
        )
    }

    handleSearch(text) {
        const {list} = this.props
        this.setState({
            'list': _.filter(list, o => {
                return o.text.indexOf(text) > -1
            })
        })
    }

    render() {
        let {info, error,  selected} = this.state
        const {list} = this.props
        let {id,required=false} = this.props
        return <ComboBox
            id={id + '-comboDropDownList'}
            required={required}
            onChange={this.handleChange.bind(this)}
            search={{
                // onSearch: this.handleSearch.bind(this),
                delaySearch: 0
            }}
            info={info}
            infoClassName={cx({'c-error': error})}
            list={list}
            placeholder={''}
            enableClear={true}
            multiSelect={{
                enabled: true,
                toggleAll: true,
                toggleAllText: 'All'
            }}
            value={selected}/>
    }
}

export default TextComboBox
