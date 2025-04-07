import React from 'react'
import DatePicker from 'react-ui/build/src/components/date-picker'
import moment from "moment";

const DataPickerWrapper = React.createClass({
    propTypes: {},
    getDefaultProps() {
        return {}
    },
    getInitialState() {
        return {}
    },
    handleChange(value) {
        if (this.props.enableTime)
            value = moment(value).utcOffset('+0800').format('YYYY-MM-DDTHH:mm:ssZ')
        this.props.onChange(value)
    },
    render() {
        // const value = moment(this.props.value).format('YYYY-MM-DD HH:mm:ss')
        return <div>
            <DatePicker
                {...this.props}
                onChange={this.handleChange}
            />
        </div>
    }
})

export default DataPickerWrapper