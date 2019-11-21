import React, { Component } from 'react'
import PropTypes from 'prop-types'

import FileInput from 'react-ui/build/src/components/file-input'

import withLocale from '../../hoc/locale-provider'

let t = null;

/**
 * Filter Upload
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
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
  render() {
    const {supportText, id, name, fileType, btnText} = this.props;
    let validate = {};

    if (fileType == 'indicators') {
      validate = {
        extension: '.json',
        t: this.getErrorMsg
      };
    }

    if (fileType == 'pcap') {
      validate = {
        extension: '.pcap',
        t: this.getErrorMsg
      };
    }

    return (
      <div className='content'>
        <label htmlFor={id}>{supportText}</label>
        <FileInput
          id={id}
          name={name}
          validate={validate}
          btnText={btnText} />
      </div>
    )
  }
}

FileUpload.propTypes = {
  supportText: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  fileType: PropTypes.string.isRequired,
  btnText: PropTypes.string.isRequired
};

const HocFileUpload = withLocale(FileUpload);
export { FileUpload, HocFileUpload };