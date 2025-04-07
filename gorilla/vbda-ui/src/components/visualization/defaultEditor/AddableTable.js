import PropTypes from 'prop-types';
import React from "react";
import im from "object-path-immutable";

import DataTable from 'react-ui/build/src/components/table'

class AddableTable extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        value: PropTypes.array,
        id: PropTypes.string,
        fields: PropTypes.object.isRequired
    };

    constructor(props, context) {
        super(props, context);
        let {fields} = props

        let newFields = {}
        newFields.__delete = {
            label: '刪除',
            formatter: (val, rowData, rid) => {
                return <div onClick={() => {
                    this.handleDataDelete(rid)
                }}>
                    <i className="c-link fg fg-close"/>
                </div>
            }
        }
        // _.map(fields, ({inputType}, key) => {
        //     fields[key].editor = this.getInputComponent(inputType)
        // })
        newFields = {...newFields, ...fields}

        this.state = {
            open: false,
            fields: newFields
        };
    }

    error = (msg) => {
        this.setState({info: msg, error: true})
    };

    handleAdd = () => {
        let {onChange, value, fields} = this.props
        if (!value)
            value = []
        let newRow = {}
        _.map(fields, (val, key) => {
            if (val.inputType === 'checkbox') {
                newRow[key] = 0
            }
        })
        value.push(newRow)
        onChange(value)
    };

    handleDataChange = (rid, name, value) => {
        let {onChange, value: wholeValue, fields} = this.props
        if (fields[name].inputType === 'checkbox')
            value = value ? 1 : 0
        let rowData = im.set(wholeValue[rid], name, value)
        onChange(im.set(wholeValue, rid, rowData))
    };

    handleDataDelete = (rid) => {
        let {onChange, value} = this.props
        onChange([...value.slice(0, rid), ...value.slice(++rid)])
    };

    render() {
        let {id, value} = this.props
        let {fields} = this.state
        return <div id={`${id}`} className='AddableTable'>
            <button
                onClick={() => {
                    this.handleAdd()
                }}
            >新增
            </button>
            <div>
            </div>
            {
                !value || value.length <= 0 ?
                    <div>no data</div>
                    :
                    <DataTable id=""
                               className="border-inner bland c-border"
                               data={value}
                               fields={fields}
                               onInputChange={(rid, name, value) => {
                                   this.handleDataChange(rid, name, value)
                               }}
                    />
            }
        </div>
    }
}

export default AddableTable