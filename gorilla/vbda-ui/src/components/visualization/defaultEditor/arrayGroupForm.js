import React from "react";
import $ from "jquery";

import Form from './baseForm'
import GroupForm from './groupForm'
import cx from "classnames";
import im from "object-path-immutable";
import _ from "lodash";

const gt = global.vbdaI18n.getFixedT(null, 'vbda')

const ArrayGroupForm = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        onChange: React.PropTypes.func.isRequired,
        value: React.PropTypes.array,
        fields: React.PropTypes.object.isRequired,
        groupGridWidth: React.PropTypes.string// defined each group width
    },
    getInitialState() {
        let newFields = _.mapValues(this.props.fields, (field, key) => {
            const gridWidth = _.get(field, ['gridWidth'], '24')
            _.set(field, ['className'], `pure-u-${gridWidth}-24 c-padding`)
            return field
        })
        return {
            open: false,
            fields: newFields
        }
    },
    handleAdd() {
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
    },
    handleDataChange(rid, value) {
        let {onChange, value: wholeValue} = this.props
        onChange(im.set(wholeValue, rid, value))
    },
    handleChange(value) {
        let {onChange} = this.props
        onChange(value)
    },
    handleDataDelete(rid) {
        let {id, onChange, value} = this.props
        const rowData = value[rid]
        const groupFormId = `${id}-${rid}`;
        if($(`#${groupFormId}`).find('img').length){
            alert(gt('txt-delete-file-first'))
            return
        }
        onChange([...value.slice(0, rid), ...value.slice(++rid)])
    },
    render() {
        let {id, value, label, fields, disabled, groupGridWidth=24} = this.props
        if (_.isNil(value))
            value = []
        _.forEach(fields, field=>{
            _.set(field, ['props', 'disabled'], disabled)
        })
        return <div id={id} className={'c-flex fdc'}>
            <div>
                <button
                    onClick={() => {
                        this.handleAdd()
                    }}
                >新增
                </button>
            </div>
            <div className={'pure-g'}>
            {
                _.map(value, (subValue, index) => {
                    const newFields = _.cloneDeep(_.mapValues(fields, (field, key) => {//改成包含index的路徑
                        field.targetFieldName = `${id}.${index}.${key}`
                        // console.log(`${id}.${index}.${key}`)
                        return field
                    }))
                    return <GroupForm
                        id={id + '-' + index}
                        key={index}
                        className={`pure-u-${groupGridWidth}-24`}
                        label={<div className='c-flex'>
                            {label + ' - ' + index}
                            <div className='end' onClick={() => {
                                this.handleDataDelete(index)
                            }}>
                                <i className="c-link fg fg-close"/>
                            </div>
                        </div>}
                        formClassName='c-form c-grid-form pure-g'
                        fields={newFields}
                        onChange={(value) => {
                            this.handleDataChange(index, value)
                        }}
                        disabled={disabled}
                        value={subValue}
                    />
                })
            }
            </div>
        </div>
    }
})
export default ArrayGroupForm