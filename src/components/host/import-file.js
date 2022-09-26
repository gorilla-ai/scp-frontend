import React, { Component } from 'react'
import PropTypes from 'prop-types'
import jschardet from 'jschardet'
import XLSX from 'xlsx'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import FileUpload from '../common/file-upload'

let t = null;

/**
 * Import File
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the File Import
 */
class ImportFile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      csvData: [],
      file: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Handle file change and set the file
   * @method
   * @param {object} file - file uploaded by the user
   * @param {object} check - a returned promise for the encode info
   */
  handleFileChange = (file, check) => {
    let reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, {type:rABS ? 'binary' : 'array'});
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws, {header:1});

      this.setState({
        csvData: data
      });
    }
    reader.onerror = error => reject(error);

    if (rABS) {
      if (check.encoding) {
        if (check.encoding === 'UTF-8') {
          reader.readAsText(file, 'UTF-8');
        } else { //If check.encoding is available, force to read as BIG5 encoding
          reader.readAsText(file, 'BIG5');
        }
      } else {
        reader.readAsBinaryString(file);
      }
    } else {
      reader.readAsArrayBuffer(file);
    }
  }
  /**
   * Check file encoding
   * @method
   * @param {object} file - file uploaded by the user
   * @returns promise of the file reader
   */
  checkEncode = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const rABS = !!reader.readAsBinaryString;

      reader.onload = async (e) => {
        resolve(jschardet.detect(e.target.result));
      }
      reader.onerror = error => reject(error);

      if (rABS) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }
  /**
   * Handle CSV batch upload
   * @method
   * @param {object} file - file uploaded by the user
   */
  handleCSVfile = (file) => {
    const {importFilterType} = this.props;

    if (importFilterType === 'ip') {
      this.parseCSVfile(file);
    } else if (importFilterType === 'safetyScanInfo') {
      this.setState({
        file
      });
    }
  }
  /**
   * Handle CSV batch upload
   * @method
   * @param {object} file - file uploaded by the user
   */
  parseCSVfile = async (file) => {
    if (file) {
      this.handleFileChange(file, await this.checkEncode(file));
    }
  }
  render() {
    const {importFilterType} = this.props;
    const {csvData, file} = this.state;
    const titleText = t('network-inventory.txt-batchUpload');
    let uploadFile = '';

    if (importFilterType === 'ip') {
      uploadFile = csvData;
    } else if (importFilterType === 'safetyScanInfo') {
      uploadFile = file;
    }

    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.toggleCsvImport},
      confirm: {text: t('txt-confirm'), handler: this.props.confirmCsvImport.bind(this, uploadFile)}
    };

    return (
      <ModalDialog
        id='importFileDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
          <FileUpload
            id='csvFileInput'
            fileType='csv'
            supportText={titleText}
            btnText={t('txt-upload')}
            handleFileChange={this.handleCSVfile} />
      </ModalDialog>
    )
  }
}

ImportFile.propTypes = {
  importFilterType: PropTypes.string.isRequired,
  toggleCsvImport: PropTypes.func.isRequired,
  confirmCsvImport: PropTypes.func.isRequired
};

export default ImportFile;