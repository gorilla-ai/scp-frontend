import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import Promise from 'bluebird'
import FileInput from 'react-ui/build/src/components/file-input'
import MultiInput from 'react-ui/build/src/components/multi-input'

import Progress from 'react-ui/build/src/components/progress'

let log = require('loglevel').getLogger('core/components/input')

class FilesUpdate extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        onChange: PropTypes.func
    };

    static defaultProps = {};

    state = {
        base64OfFile: {},
        nameOfFile: {}
    };

    handleChange = (value) => {
        console.log(value)
        let {onChange} = this.props
        let {base64OfFile, nameOfFile} = this.state

        let newObjectsOfFile =
            _.chain(value)
                .filter((o) => {
                    return o !== ''
                })
                .keyBy('lastModified')
                .value()
        let newFilesToAdd = _.omit(newObjectsOfFile, _.keys(base64OfFile))
        //新增檔案
        if (!_.isEmpty(newFilesToAdd)) {
            _.forEach(newFilesToAdd, (newFile, newFileKey) => {
                if (!_.isNil(newFile))
                    new Promise((resolve, reject) =>
                        getBase64(newFile, resolve))
                        .then((base64Data) => {
                            base64OfFile[newFileKey] = base64Data
                            nameOfFile[newFileKey] = newFile.name
                            onChange(_.map(base64OfFile, (base64, key) => {
                                return {base64, name: nameOfFile[key]}
                            }))
                            this.setState({base64OfFile, nameOfFile})
                            log.info('base64OfFile', base64OfFile, 'nameOfFile', nameOfFile)
                            Progress.done()
                        })
            })
        }
        //刪除檔案
        let fileToDelete = _.omit(base64OfFile, _.keys(newObjectsOfFile))
        if (!_.isEmpty(fileToDelete)) {
            _.forEach(fileToDelete, (file, fileKey) => {
                delete base64OfFile[fileKey]
                delete nameOfFile[fileKey]
            })
            onChange(_.map(base64OfFile, (base64, key) => {
                return {base64, name: nameOfFile[key]}
            }))
            this.setState({base64OfFile, nameOfFile})
            log.info('base64OfFile', base64OfFile, 'nameOfFile', nameOfFile)
        }

        function getBase64(file, resolve) {
            Progress.startSpin()
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                // callBack(reader.result)
                const base64Value = reader.result
                const result = base64Value.slice(base64Value.indexOf(",") + 1)
                resolve(result)
            };
        }
    };

    renderImageFileUpdate = () => {
        return <MultiInput id='phones'
                           base={FileInput}
                           persistKeys
                           props={{btnText: '選擇檔案'}}
                           onChange={this.handleChange}/>

    };

    render() {
        return <div>
            {this.renderImageFileUpdate()}
        </div>
    }
}

export default FilesUpdate