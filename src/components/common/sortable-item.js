import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Checkbox from 'react-ui/build/src/components/checkbox'
import Input from 'react-ui/build/src/components/input'
import Textarea from 'react-ui/build/src/components/textarea'

import {SortableElement, SortableHandle} from 'react-sortable-hoc'

import helper from './helper'

let t = null;
let f = null;

const LONG_INPUT = ['_Raw', 'message', 'msg'];
const TIME_FIELDS = ['@timestamp', 'firstPacket', 'lastPacket', 'timestamp', '_eventDttm_'];

const DragHandle = SortableHandle(() => <i className='fg fg-menu flow'></i>);

/**
 * Sortable Item
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the list with sort functionality
 */
class SortableItem extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
  }
  /**
   * Get input value in the table row
   * @method
   * @param {object} value - selected value of the sortable item
   * @returns HTML DOM
   */
  getValueData = (value) => {
    const key = _.keys(value).toString();

    if (_.includes(LONG_INPUT, key)) {
      return <Textarea rows={8} cols={50} className='value-input' value={value[key]} readOnly={true} />
    } else if (_.includes(TIME_FIELDS, key)) {
      return <Input type='text' className='value-input' value={helper.getFormattedDate(value[key], 'local')} readOnly={true} />
    } else {
      return <Input type='text' className='value-input' value={value[key]} readOnly={true} />
    }
  }
  render() {
    const {index, activeTab, value} = this.props;
    const key = _.keys(value).toString();
    let localeField = f(`${activeTab}Fields.${key}`);

    if (activeTab === 'logs') {
      localeField = this.props.getCustomFieldName(key, 'logs');
    }

    return (
      <li key={index} className='table-sort-list'>
        {!_.includes(TIME_FIELDS, key) &&
          <i className='fg fg-filter' title={t('txt-filterQuery')} onClick={this.props.showQueryOptions(key, value[key])}></i>
        }
        {_.includes(TIME_FIELDS, key) && //Disable the filer for time related fields
          <i className='fg fg-filter disabled' title={t('txt-filterQuery')}></i>
        }
        <Checkbox
          className='data-field flow'
          checked={this.props.checkDisplayFields(key)}
          onChange={this.props.setFieldsChange.bind(this, key)}
          disabled={_.includes(TIME_FIELDS, key)} />
        {activeTab === 'logs' &&
          <i className='fg fg-edit' title={t('syslogFields.txt-customFieldName')} onClick={this.props.toggleLocaleEdit.bind(this, key, localeField)}></i>
        }
        <span className='key'>{localeField}</span>
        <span className='value'>
          {this.getValueData(value)}
        </span>
        <DragHandle />
      </li>
    )
  }
}

SortableItem.propTypes = {
  activeTab: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired,
  setFieldsChange: PropTypes.func.isRequired,
  checkDisplayFields: PropTypes.func.isRequired,
  showQueryOptions: PropTypes.func.isRequired
};

export default SortableElement(SortableItem);