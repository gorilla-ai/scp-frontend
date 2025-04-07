import PropTypes from 'prop-types';
import React from "react";
import cx from 'classnames'
import im from "object-path-immutable";

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import {config as configLoader} from "vbda/loader";


const log = require('loglevel').getLogger('defaultEditor/MultiDropDownList')

const customPropType = function (props, propName, componentName) {
    if (props[propName] && props[propName] !== 'Input') {
        return new Error(propName + ' should be Input');
    }
}

class MultiDropDownList extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        value: PropTypes.object,
        id: PropTypes.string,
        // fields: React.PropTypes.array.isRequired,
        fields: PropTypes.arrayOf(PropTypes.shape({//需要順序，所以用array
            refDataMappings: PropTypes.string,
            fieldKey: PropTypes.string,
            refFieldKey: PropTypes.string,
            keep: PropTypes.bool,
            inputType: customPropType
        })),
        combineToFieldKey: PropTypes.string
    };

    state = {};

    onChange = (key, value) => {
        const {onChange, value: oldValue} = this.props
        onChange(im.set(oldValue, key, value))
    };

    onChangeBothParentAndChild = (fieldKey, fieldValue, childShouldClean) => {
        const {onChange, value: oldValue} = this.props
        let newValue = im.set(oldValue, fieldKey, fieldValue)
        _.forEach(childShouldClean, childFieldKey => {
            _.set(newValue, childFieldKey, '')
        })
        onChange(newValue)
    };

    renderInput = () => {
        const {fields, value, dataMappings} = this.props
        // const {dataMappings} = this.state
        let error = false
        return _.map(fields, (field, index) => {
            let list
            if (field.inputType === 'Input') {
                return <Input
                    key={field.fieldKey}
                    onChange={(value) => {
                        this.onChange(field.fieldKey, value)
                    }}
                    value={_.get(value, field.fieldKey, '')}
                />
            }
            if (!_.has(dataMappings, field.refDataMappings)) {//在datamapping 裡面找不到對應的資料可以顯示
                log.error('missing data mapping reference in:' + field.fieldKey)
                this.setState({info: 'missing data mapping reference', error: true})
                error = true
                return
            }
            if (error)
                return null
            if (field.refFieldKey) {
                const refFieldValue = _.get(value, field.refFieldKey, null)
                if (_.isNil(refFieldValue))
                    return <DropDownList key={field.fieldKey} disabled={true}/>
                list = _.get(dataMappings, [field.refDataMappings, refFieldValue], [])//根據其reference 的值來決定選單
            }
            else
                list = _.get(dataMappings, field.refDataMappings, [])
            return <DropDownList key={field.fieldKey} list={list}
                                 onChange={(value) => {
                                     let childShouldClean = []
                                     for (let i = index; i < fields.length; i++) {
                                         let childField = fields[i]
                                         if (childField.refFieldKey === field.fieldKey)
                                             childShouldClean.push(childField.fieldKey)
                                     }
                                     if (childShouldClean.length !== 0) {
                                         this.onChangeBothParentAndChild(field.fieldKey, value, childShouldClean)
                                     }
                                     else
                                         this.onChange(field.fieldKey, value)

                                 }}
                                 value={_.get(value, field.fieldKey, '')}
            />
        })
    };

    renderInfo = (text, error = false) => {
        return <div className="c-box grow">
            <div className={cx("content c-center c-info", {'c-error': error})}>{text}</div>
        </div>
    };

    render() {
        let {id} = this.props
        let {info, error} = this.state
        if (info) {
            return this.renderInfo(info, error)
        }
        return <div id={`${id}_MultiDropDownList MultiDropDownList`}>
            {this.renderInput()}
        </div>
    }
}

export default MultiDropDownList