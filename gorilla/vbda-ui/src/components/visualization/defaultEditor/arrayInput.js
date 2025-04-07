import React from 'react'
import _ from 'lodash'
import MultiInput from 'react-ui/build/src/components/multi-input'

const ArrayInput = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        value: React.PropTypes.array,
        onChange: React.PropTypes.func
    },
    getDefaultProps() {
        return {}
    },
    getInitialState() {
        return {
        }
    },
    render() {
        const {id, value, onChange} = this.props
        return <div>
            <MultiInput
                id={id}
                base={'Input'}
                props={_.omit(this.props, 'value')}
                inline={true}
                onChange={(value) => {
                    onChange(value)
                }}
                value={value}
            />
        </div>
    }
})

export default ArrayInput