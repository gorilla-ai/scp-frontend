import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'

import DropDownList from 'react-ui/build/src/components/dropdown'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import Textarea from 'react-ui/build/src/components/textarea'

import helper from './helper'

let t = null;

/**
 * Encode Decode service
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
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
    const dropDownList = _.map(['URL', 'Timestamp', 'BASE64'], val => {
      return {
        value: val.toLowerCase(),
        text: val
      };
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
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleDataChange = (type, value) => {
    this.setState({
      [type]: value.trim()
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
        tempFormattedText = Moment.unix(Number(originalText)).local().format();
      } else if (originalText.length === 13) {
        tempFormattedText = Moment(Number(originalText)).local().format();
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
   * Handle encode type dropdown list selection change
   * @method
   * @param {string} value - encode type ('url' 'timestamp', or 'base64')
   */
  handleEncodeListChange = (value) => {
    this.setState({
      encodeType: value
    });
  }
  /**
   * Display encode/decode content
   * @method
   */
  displayEncodeDecode = () => {
    const {dropDownList, encodeType, originalText, formattedText} = this.state;

    return (
      <div>
        <label htmlFor='textToBeEncoded'>{t('txt-text')}</label>
        <Textarea
          id='textToBeEncoded'
          className='text-area'
          value={originalText}
          onChange={this.handleDataChange.bind(this, 'originalText')} />
        <div className='drop-down'>
          <DropDownList
            id='encodeDecodeList'
            list={dropDownList}
            required={true}
            value={encodeType}
            onChange={this.handleEncodeListChange} />
        </div>
        {(encodeType === 'url' || encodeType === 'base64') &&
          <button onClick={this.handleTextEncode.bind(this, 'encode')}>Encode</button>
        }
        {(encodeType === 'url' || encodeType === 'base64') &&
          <button onClick={this.handleTextEncode.bind(this, 'decode')}>Decode</button>
        }
        {encodeType === 'timestamp'&&
          <button onClick={this.handleTextEncode.bind(this, 'timestamp')}>{t('alert.txt-toLocalTime')}</button>
        }
        <label htmlFor='encodedText'>{t('txt-result')}</label>
        <Textarea
          id='encodedText'
          className='text-area'
          value={formattedText}
          onChange={this.handleDataChange.bind(this, 'formattedText')}
          readOnly={true} />
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