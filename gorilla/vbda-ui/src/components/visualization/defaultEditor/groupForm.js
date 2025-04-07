import PropTypes from 'prop-types';
import React from "react";

import Form from './baseForm'
import cx from "classnames";

class GroupForm extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        value: PropTypes.object,
        id: PropTypes.string,
        fields: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        let newFields = _.mapValues(props.fields, (field, key) => {
            const gridWidth = _.get(field, ['gridWidth'], '24')
            _.set(field, ['className'], `pure-u-${gridWidth}-24 c-padding`)
            return field
        })

        this.state = {
            open: false,
            fields: newFields
        };
    }

    handleFormChange = (formData) => {
        // this.setState({data: formData})
        this.props.onChange(formData)
    };

    render() {
        let {id, value, label} = this.props
        const {fields} = this.state
        if (_.isNil(value))
            value = {}
        return <div id={`${id}`} className={cx('FormGroup', 'c-box')}>
            <header>{label}</header>
            <div className='content'>
                <Form
                    className='grow'
                    formClassName='c-form c-grid-form pure-g'
                    fields={fields}
                    onChange={this.handleFormChange}
                    value={value}
                />
            </div>
        </div>
    }
}

export default GroupForm