import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import helper from './helper'

let t = null;

/**
 * Encode Decode service
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to provide service for text encode/decode
 */
class EncodeDecode extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropDownList: [],
      encodeType: 'url',
      originalText: '',
      formattedText: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidMount() {
    const {highlightedText} = this.props;
    const dropDownList = _.map(['URL', 'Timestamp', 'BASE64'], (val, i) => {
      return <MenuItem key={i} value={val.toLowerCase()}>{val}</MenuItem>
    });

    this.setState({
      dropDownList
    });

    if (highlightedText) {
      this.setState({
        originalText: highlightedText
      });
    }
  }
  /**
   * Handle input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  /**
   * Handle data encode / decode
   * @method
   * @param {string} type - input type ('encode', 'decode' or 'timestamp')
   */
  handleTextEncode = (type) => {
    const {encodeType, originalText} = this.state;
    let tempFormattedText = '';

    if (!originalText) {
      this.setState({
        formattedText: ''
      });
      return;
    }

    if (type === 'encode') {
      if (encodeType === 'url') {
        tempFormattedText = encodeURI(originalText);
      } else if (encodeType === 'timestamp') {

      } else if (encodeType === 'base64') {
        tempFormattedText = window.btoa(unescape(encodeURIComponent(originalText)));
      }
    } else if (type === 'decode') {
      if (encodeType === 'url') {
        tempFormattedText = decodeURI(originalText);
      } else if (encodeType === 'timestamp') {

      } else if (encodeType === 'base64') {
        tempFormattedText = decodeURIComponent(escape(window.atob(originalText)));
      }
    } else if (type === 'timestamp') {
      tempFormattedText = t('alert.txt-invalidDate');

      if (originalText.length === 10) {
        tempFormattedText = moment.unix(Number(originalText)).local().format();
      } else if (originalText.length === 13) {
        tempFormattedText = moment(Number(originalText)).local().format();
      }

      if (tempFormattedText === 'Invalid date') {
        tempFormattedText = t('alert.txt-invalidDate');
      }
    }

    this.setState({
      formattedText: tempFormattedText
    });
  }
  /**
   * Display encode/decode content
   * @method
   * @returns HTML DOM
   */
  displayEncodeDecode = () => {
    const {dropDownList, encodeType, originalText, formattedText} = this.state;

    return (
      <div>
        <TextField
          id='textToBeEncoded'
          name='originalText'
          className='text-area'
          label={t('txt-text')}
          multiline
          rows={6}
          variant='outlined'
          fullWidth
          size='small'
          value={originalText}
          onChange={this.handleDataChange} />
        <div className='drop-down'>
          <TextField
            id='encodeDecodeList'
            name='encodeType'
            select
            variant='outlined'
            fullWidth
            size='small'
            value={encodeType}
            onChange={this.handleDataChange}>
            {dropDownList}
          </TextField>
        </div>
        {(encodeType === 'url' || encodeType === 'base64') &&
          <Button variant='contained' color='primary' onClick={this.handleTextEncode.bind(this, 'encode')}>Encode</Button>
        }
        {(encodeType === 'url' || encodeType === 'base64') &&
          <Button variant='contained' color='primary' onClick={this.handleTextEncode.bind(this, 'decode')}>Decode</Button>
        }
        {encodeType === 'timestamp'&&
          <Button variant='contained' color='primary' onClick={this.handleTextEncode.bind(this, 'timestamp')}>{t('alert.txt-toLocalTime')}</Button>
        }
        <TextField
          id='encodedText'
          name='formattedText'
          className='text-area'
          label={t('txt-result')}
          multiline
          rows={6}
          variant='outlined'
          fullWidth
          size='small'
          value={formattedText}
          disabled />
      </div>
    )
  }
  render() {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.props.openEncodeDialog}
    };

    return (
      <ModalDialog
        id='encodeDecodeDialog'
        className='modal-dialog'
        title={t('alert.txt-encodeDecode')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayEncodeDecode()}
      </ModalDialog>
    )
  }
}

EncodeDecode.propTypes = {
  openEncodeDialog: PropTypes.func.isRequired
};

export default EncodeDecode;