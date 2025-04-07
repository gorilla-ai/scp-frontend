/**
 * modify from react-ui
 */
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import im from 'object-path-immutable'

let log = require('loglevel').getLogger('core/components/form')

const BaseForm = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        fields: React.PropTypes.objectOf(React.PropTypes.shape({
            label: React.PropTypes.node,
            className: React.PropTypes.string,
            formatter: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.node]),
            editor: React.PropTypes.func, // react class
            props: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.object])
        })).isRequired,
        header: React.PropTypes.node,
        footer: React.PropTypes.node,
        className: React.PropTypes.string,
        formClassName: React.PropTypes.string,
        fieldClassName: React.PropTypes.string,
        value: React.PropTypes.object, // might not be just a simple object
        onChange: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            value: {}
        }
    },
    handleChange(key, iValue) {
        let {onChange, value} = this.props
        onChange(im.set(value, key, iValue))
    },
    renderField(id, value, fieldCfg, dataSet) {
        let {value: wholeValue} = this.props
        let {formatter, editor, props = {}, onChange, preProcess} = fieldCfg

        if (formatter) {
            if (_.isFunction(formatter)) {
                return formatter(value, dataSet)
            }
            else {
                return formatter
            }
        }
        else if (editor) {
            if (_.isFunction(props)) {
                props = props(dataSet)
            }
            // TODO: check editor must be ReactClass
            props = {
                ...props, id,
                data: preProcess ? preProcess(wholeValue) : value,
                onChange: onChange ? (value)=>{onChange(value, wholeValue)} : this.handleChange.bind(this, id)
            }

            return React.createElement(editor, props)
        }
        else {
            return value
        }
    },
    render() {
        let {id, fields, value, header, footer, className, formClassName, fieldClassName} = this.props

        return <div id={id} className={className}>
            {
                header ? <header>{header}</header> : null
            }
            <div className={cx(formClassName, 'content c-align')}>
                {
                    _.map(fields, (field, key) => {
                        let {label = key, className: fieldCls = fieldClassName} = field
                        let iValue = _.get(value, key, null) // to support traverse of nested field properties, eg a.b.c

                        return <div key={key} className={cx(key, fieldCls)}>
                            <label htmlFor={key}>{label}</label>
                            {this.renderField(key, iValue, field, value)}
                        </div>
                    })
                }
            </div>
            {
                footer ? <footer>{footer}</footer> : null
            }
        </div>
    }

})


export default BaseForm
