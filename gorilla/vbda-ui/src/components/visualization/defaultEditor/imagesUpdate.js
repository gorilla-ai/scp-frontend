import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import ButtonGroup from 'react-ui/build/src/components/button-group'
import {validateField} from 'react-ui/build/src/utils/input-helper'

import Progress from 'react-ui/build/src/components/progress'
import imageConverter from 'vbda/utils/image-helper'
import cx from "classnames";

let log = require('loglevel').getLogger('core/components/input')
const gt = global.vbdaI18n.getFixedT(null, 'vbda')

const FILE_SERVICE_API = '/api/file'
const MODE = {
    FILE: 0,
    URL: 1,
}

const photoStyle = {
    position: 'relative',
    margin: '0px 10px 0px 0px',
    width: 'auto',
    height: '100px'
};
const buttonStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    padding: "2px 0 0 0",
    textAlign: "center",
    width: "18px",
    height: "18px",
    font: "16px/14px Tahoma, Verdana, sans-serif",
    color: "rgba(0,0,0,0.9)",
    background: "#ffffff",
    borderColor: "black",
    borderEadius: "15px",
    textDecoration: "none",
    fontWeight: "bold"
}

class ImagesUpdate extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        onChange: PropTypes.func
    };

    static defaultProps = {};

    state = {
        url: '',
        mode: MODE.FILE
    };

    addImage = (base64, name) => {
        let {onChange} = this.props
        let base64OfFile = _.cloneDeep(this.props.value)
        if (_.isEmpty(base64OfFile))
            base64OfFile = []
        base64OfFile.push({base64: base64.slice(base64.indexOf(",") + 1), name})
        this.setState({url: ''})
        onChange(base64OfFile)
        log.info('base64OfFile', base64OfFile)
    };

    deleteImage = (index) => {
        let {onChange} = this.props
        let {value: base64OfFile} = this.props
        base64OfFile.splice(index, 1)
        onChange(base64OfFile)
        log.info('base64OfFile', base64OfFile)
    };

    handleChange = (newFile) => {
        if (!newFile) {//清空
            return
        }
        console.log(newFile)
        imageConverter(newFile)
            .then((base64Data) => {
                this.addImage(base64Data, newFile.name)
                this.fileInput.handleClick()//把component的內容清掉
                Progress.done()
            })
    };

    handleUrl = (url) => {
        this.setState({url})
    };

    handleUrlConvert = () => {
        imageConverter(this.state.url)
            .then((value) => {
                if (value === null)
                    return
                this.addImage(value, this.state.url.slice(this.state.url.lastIndexOf("/") + 1))
            })
    };

    renderImageFileUpdate = () => {
        return <FileInput
            ref={(ref) => {
                this.fileInput = ref
            }}
            btnText='上傳'
            validate={{extension: 'image/*'}}
            onChange={(file) => {
                this.handleChange(file)
            }}
        />
    };

    renderImageFileURL = () => {
        return <div className='c-flex'>
            <Input
                className='grow'
                type='text'
                onChange={(url) => {
                    this.handleUrl(url)
                }}
                value={this.state.url}
            />
            <button className={cx('inline')} onClick={this.handleUrlConvert}>
                {gt('btn-import')}
            </button>
        </div>
    };

    renderImage = (index, srcUrl) => {
        return <div key={index} style={photoStyle}>
            <img
                src={srcUrl}
                style={photoStyle}
                alt=''
            />
            <a style={buttonStyle} onClick={() => this.deleteImage(index)}>X</a>
        </div>
    };

    render() {
        const {mode} = this.state
        const {value: base64OfFile} = this.props
        const list = [
            {value: 0, text: gt('btn-file')},
            {value: 1, text: gt('btn-url')}
        ]
        return <div>
            <ButtonGroup
                list={list}
                value={mode}
                onChange={(value) => {
                    this.setState({mode: value})
                }}
            />
            {
                mode === MODE.FILE ?
                    this.renderImageFileUpdate()
                    :
                    this.renderImageFileURL()
            }
            <div className='c-flex'>
                {
                    _.map(base64OfFile, ({base64, url}, index) => {
                            if (base64) {//base64
                                const srcUrl = 'data:image;base64,' + base64

                                return this.renderImage(index, srcUrl)
                            }
                            else {//url
                                const srcUrl = FILE_SERVICE_API + url

                                return this.renderImage(index, srcUrl)
                            }
                        }
                    )
                }
            </div>
        </div>
    }
}

export default ImagesUpdate