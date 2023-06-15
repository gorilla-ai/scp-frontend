import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'
import FileUpload from '../../common/file-upload'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';

let t = null;

/**
 * Host upload file component
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the upload file dialog
 */
class UploadFile extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');

    this.state = {
      cpeFile: {},
      kbidFile: {}
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
  }
  /**
   * Handle CPE setup file upload
   * @method
   * @param {object} file - file uploaded by the user
   */
  getCpeSetupFile = (file) => {
    const {page} = this.props;

    if (page === 'inventory') {
      this.setState({
        cpeFile: file
      });
    } else if (page === 'kbid') {
      this.setState({
        kbidFile: file
      });
    }
  }
  /**
   * Handle file upload confirm
   * @method
   */
  confirmFileUpload = () => {
    const {baseUrl} = this.context;
    const {page} = this.props;
    const {cpeFile, kbidFile} = this.state;
    const requestData = {
      hmdScanDistribution: {
        taskName: 'getVans',
        primaryKeyName: 'cpe23Uri'
      },
      ...this.props.getFilterRequestData()
    };
    let url = '';
    let formData = new FormData();
    formData.append('payload', JSON.stringify(requestData));

    if (page === 'inventory') {
      if (!cpeFile.name) {
        return;
      }

      url = `${baseUrl}/api/hmd/cpeUpdateToDate/merge/_upload`;
      formData.append('file', cpeFile);
    } else if (page === 'kbid') {
      if (!kbidFile.name) {
        return;
      }

      url = `${baseUrl}/api/hmd/kbid/merge/_upload`;
      formData.append('file', kbidFile);
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    this.ah.one({
      url,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      helper.showPopupMsg(t('txt-uploadSuccess'));

      if (page === 'inventory') {
        this.setState({
          cpeFile: {}
        });
      } else if (page === 'kbid') {
        this.setState({
          kbidFile: {}
        });
      }

      this.props.toggleUploadFile(data);
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {page} = this.props;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.toggleUploadFile},
      confirm: {text: t('txt-confirm'), handler: this.confirmFileUpload}
    };
    let title = '';

    if (page === 'inventory') {
      title = t('host.txt-uploadMergedCpe');
    } else if (page === 'kbid') {
      title = t('host.txt-uploadMergedKbid');
    }

    return (
      <ModalDialog
        id='cpeFileUploadDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        <FileUpload
          id='fileUpload'
          fileType='csv'
          supportText={title}
          btnText={t('txt-upload')}
          handleFileChange={this.getCpeSetupFile} />
      </ModalDialog>
    )
  }
}

UploadFile.contextType = BaseDataContext;

UploadFile.propTypes = {
  page: PropTypes.string.isRequired,
  toggleUploadFile: PropTypes.func.isRequired,
  getFilterRequestData: PropTypes.func.isRequired
};

export default UploadFile;