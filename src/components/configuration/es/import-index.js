import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'

import DatePicker from 'react-ui/build/src/components/date-picker'
import Input from 'react-ui/build/src/components/input'

import {BaseDataContext} from '../../common/context';
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

/**
 * Import Index
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Import Index content
 */
class ImportIndex extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors')
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {

  }
  /**
   * Set import index input value change
   * @method
   * @param {string} value - input value
   */
  handleDataChange = (value) => {
    this.props.onChange({
      index: value
    });
  }
  render() {
    const {locale} = this.context;
    const {value} = this.props;

    return (
      <div className='import-index'>
        <label htmlFor='importIndexText'></label>
        <DatePicker
          id='datePicker'
          className='date-picker'
          value={value.index}
          onChange={this.handleDataChange}
          locale={locale}
          t={et} />     
      </div>
    )
  }
}

ImportIndex.contextType = BaseDataContext;

ImportIndex.propTypes = {
};

export default ImportIndex;