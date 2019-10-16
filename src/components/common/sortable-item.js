import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Checkbox from 'react-ui/build/src/components/checkbox'
import Input from 'react-ui/build/src/components/input'
import Textarea from 'react-ui/build/src/components/textarea'

import {SortableElement, SortableHandle} from 'react-sortable-hoc'

import helper from './helper'
import withLocale from '../../hoc/locale-provider'

let t = null;
let f = null;

const LONG_INPUT = ['_Raw', 'message', 'msg'];
const TIME_FIELDS = ['@timestamp', 'firstPacket', 'lastPacket', 'timestamp', '_eventDttm_'];

const DragHandle = SortableHandle(() => <i className='fg fg-menu flow'></i>);

class SortableItem extends Component {
  constructor(props) {
    super(props);

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
  }
  componentDidMount = () => {

  }
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
    const {
      index,
      activeTab,
      value,
      getCustomFieldName,
      setFieldsChange,
      checkDisplayFields,
      showQueryOptions,
      toggleLocaleEdit
    } = this.props;
    const key = _.keys(value).toString();
    let localeField = f(`${activeTab}Fields.${key}`);

    if (activeTab === 'logs') {
      localeField = getCustomFieldName(key, 'logs');
    }

    return (
      <li key={index} className='table-sort-list'>
        {!_.includes(TIME_FIELDS, key) &&
          <i className='fg fg-filter' title={t('txt-filterQuery')} onClick={showQueryOptions(key, value[key])}></i>
        }
        {_.includes(TIME_FIELDS, key) && //Disable the filer for time related fields
          <i className='fg fg-filter disabled' title={t('txt-filterQuery')}></i>
        }
        <Checkbox
          className='data-field flow'
          onChange={setFieldsChange.bind(this, key)}
          checked={checkDisplayFields(key)}
          disabled={_.includes(TIME_FIELDS, key)} />
        {activeTab === 'logs' &&
          <i className='fg fg-edit' title={t('syslogFields.txt-customFieldName')} onClick={toggleLocaleEdit.bind(this, key, localeField)}></i>
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

const HocSortableItem = withLocale(SortableElement(SortableItem));
export { SortableItem, HocSortableItem };