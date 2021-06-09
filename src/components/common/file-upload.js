import React, { Component } from 'react'
import PropTypes from 'prop-types'

import FileInput from 'react-ui/build/src/components/file-input'

let t = null;

/**
 * Filter Upload
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the file upload
 */
class FileUpload extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Get error message
   * @method
   * @param {object} code - error code
   * @param {object} params - error info
   * @returns text
   */
  getErrorMsg = (code, params) => {
    if (params.code === 'file-wrong-format') {
      return t('txt-file-format-error') + params.extension;
    }
  }
  /**
   * Handle file change
   * @method
   * @param {object} file - file info object
   */
  handleFileChange = (file) => {
    this.props.handleFileChange(file);
  }
  render() {
    const {id, fileType, supportText, btnText, readOnly} = this.props;
    const disabled = readOnly || false;
    let validate = {};

    if (fileType == 'indicators') {
      validate = {
        extension: '.zip',
        t: this.getErrorMsg
      };
    }

    if (fileType == 'pcap') {
      validate = {
        extension: '.pcap',
        t: this.getErrorMsg
      };
    }

    if (fileType === 'csv') {
      validate = {
        extension: ['.csv', '.xlsx', '.xls'],
        t: this.getErrorMsg
      };
    }

    if (fileType === 'text') {
      validate = {
        extension: ['.txt'],
        t: this.getErrorMsg
      };
    }


    if (fileType === 'attached') {
      validate = {
        extension: ['.txt', '.zip', '.xls','.csv','.xlsx','.doc','.docx'],
        t: this.getErrorMsg
      };
    }

    return (
      <div className='content'>
        {supportText &&
          <label htmlFor={id}>{supportText}</label>
        }
        <FileInput
          id={id}
          className='file-input'
          disabled={disabled}
          validate={validate}
          btnText={btnText}
          onChange={this.handleFileChange} />
      </div>
    )
  }
}

FileUpload.propTypes = {
  id: PropTypes.string.isRequired,
  fileType: PropTypes.string,
  supportText: PropTypes.string,
  btnText: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  handleFileChange: PropTypes.func.isRequired
};

export default FileUpload;