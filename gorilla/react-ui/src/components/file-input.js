import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'

import Popover from './popover'
import ih from '../utils/input-helper'

let log = require('loglevel').getLogger('react-ui/components/file-input')

/**
 * A React file input
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [name] - FileInput element name
 * @param {string} [className] - Classname for the container
 * @param {string} [btnText='Choose file'] - Text on the button
 * @param {string} [placeholder] - Placeholder for the text field
 * @param {boolean} [required=false] - Is this field mandatory?
 * @param {boolean} [disabled=false] - Is file input disabled?
 * @param {boolean} [enableClear=true] - Can this field can be cleared?
 * @param {object} [validate] - Validation config
 * @param {number} [validate.max] - Maximum file size which unit is 'MB'
 * @param {string | Array.<string>} [validate.extension] - Accepted file format, e.g., '.mp3'; ['.jpg', '.png']
 * @param {fuction} [validate.t] - Transform/translate error into readable message.<br>
 * If not specified, error message will be `${validate.t.params.name} ${code}`<br>
 * For example see [i18next]{@link http://i18next.com/translate/} translator for generating error message.<br>
 * @param {'missing'|'file-too-large'|'file-wrong-format'} validate.t.code - Error code
 * @param {object} validate.t.params - Parameters relevant to the error code
 * @param {string} validate.t.params.field - offending field name/id
 * @param {object} validate.t.params.value - offending file object
 * @param {number} [validate.t.params.max] - configured maximum file size which unit is MB
 * @param {string} [validate.t.params.extension] - configured accepted file extension
 * @param {function} [onChange] - Callback function when file is changed
 * @param {object} onChange.file - updated file
 * @param {object} onChange.eventInfo - event related info
 * @param {object} onChange.eventInfo.before - previous file
 *
 *
 * @example
// controlled

import {FileInput} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            name: '',
            type: '',
            size: 0
        }
    },
    handleChange(file) {
        this.setState({
            name: file ? file.name : '',
            type: file ? file.type : '',
            size: file ? file.size : 0
        })
    },
    render() {
        return <div className='c-flex aic'>
            <FileInput
                onChange={this.handleChange} required={true} name='fileDemo'
                validate={{
                    max: 10,
                    extension: ['.mp3', '.wma'],
                    t: (code, params) => {
                        if (code === 'file-too-large') {
                            return `File size should be lower than ${params.max} MB`
                        }
                        else {
                            return `File format should be ${params.extension}`
                        }
                    }
                }}
            />
        </div>
    }
})
 */

class FileInput extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        name: PropTypes.string,
        className: PropTypes.string,
        btnText: PropTypes.string,
        placeholder: PropTypes.string,
        required: PropTypes.bool,
        disabled: PropTypes.bool,
        enableClear: PropTypes.bool,
        validate: PropTypes.shape({
            max: PropTypes.number,
            extension: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
            t: PropTypes.func
        }),
        onChange: PropTypes.func
    };

    static defaultProps = {
        btnText: 'Choose file',
        disabled: false,
        enableClear: true,
        required: false,
        validate: {}
    };

    state = {
        file: null,
        isInvalid: false
    };

    componentWillUnmount() {
        Popover.close()
    }

    handleChange = (e) => {
        let fileInput = this.fileInput,
            fileSub = this.fileSub

        let {validate, onChange} = this.props

        if (fileInput.files.length > 0) {
            let file = fileInput.files[0]
            let error = validate ? this.validateFile(file) : null

            if (error) {
                this.fileInput.value = ''
                this.fileSub.value = ''

                Popover.open(e, error, {pointy:true})

                this.setState({
                    isInvalid: true
                })
            }
            else {
                Popover.close()
                fileSub.value = file.name

                if (onChange) {
                    onChange(file)
                }

                this.setState({
                    file,
                    isInvalid: false
                })
            }
        }
    };

    handleBlur = () => {
        Popover.close()
        this.setState({isInvalid:false})
    };

    handleClick = () => {
        Popover.close()

        let {onChange} = this.props

        this.fileInput.value = ''
        this.fileSub.value = ''

        if (onChange) {
            onChange(null)
        }

        this.setState({
            file: null,
            isInvalid: false
        })
    };

    validateFile = (file) => {
        let {id, name, required, validate:{t, ...params}} = this.props
        let msg = ih.validateField(file, {name:name || id, type:'file', required, ...params}, t?{et:t}:true)

        if (msg) {
            return <span>{msg}</span>
        }
        return null
    };

    render() {
        let {id, name, className, placeholder, btnText, disabled, enableClear, required, validate} = this.props
        let {file, isInvalid} = this.state
        let hasFile = !!file
        let extension = (validate && validate.extension) ? validate.extension : ''

        return <div id={id} className={cx('c-file-input', {disabled, clearable:enableClear}, className)}>
            <input
                type='file' name={name} ref={ref => { this.fileInput = ref }} accept={extension}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
                disabled={disabled}
                required={required} />
            <button disabled={disabled}>{btnText}</button>
            <input
                type='text'
                ref={ref => { this.fileSub = ref }}
                className={cx({invalid:isInvalid})}
                placeholder={placeholder}
                disabled={disabled}
                readOnly />
            {enableClear && hasFile && <i className={cx('c-link inline fg fg-close')} onClick={this.handleClick} />}
        </div>
    }
}

export default FileInput