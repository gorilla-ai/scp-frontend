import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Textarea from 'react-ui/build/src/components/textarea'

/**
 * Search Filter
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component for the search filter multi input (filter-input.js)
 */
class SearchFilter extends Component {
  constructor(props) {
    super(props);
  }
  /**
   * Set search filter input
   * @method
   * @param {string} field - input type ('condition' or 'query')
   * @param {string} value - input value
   */
  handleDataChange = (field, value) => {
    this.props.onChange({
      ...this.props.value,
      [field]: value
    });
  }
  render() {
    const {queryType, activeTab, value} = this.props;
    const formStatus = queryType === 'query' ? true : false;
    let conditionList = [];
    let filterList = [];

    if (activeTab === 'host') {
      filterList = [
        {
          value: 'exactIp',
          text: 'Exact IP'
        },
        {
          value: 'ip',
          text: 'IP'
        },
        {
          value: 'mac',
          text: 'MAC'
        },
        {
          value: 'hostName',
          text: 'Host Name'
        },
        {
          value: 'deviceType',
          text: 'Device Type'
        },
        {
          value: 'system',
          text: 'System'
        }
      ];
    } else {
      conditionList = ['Must', 'Must Not', 'Either'];
      filterList = _.map(conditionList, val => {
        let formattedValue = val.toLowerCase();
        formattedValue = formattedValue.replace(' ', '_');

        return {
          value: formattedValue,
          text: val
        };
      });
    }

    return (
      <div>
        <DropDownList
          className='condition-select'
          list={filterList}
          required={true}
          value={value.condition}
          onChange={this.handleDataChange.bind(this, 'condition')}
          disabled={formStatus} />
        <Textarea
          className='filter-inputbox'
          value={value.query}
          onChange={this.handleDataChange.bind(this, 'query')}
          disabled={formStatus} />
      </div>
    )
  }
}

SearchFilter.propTypes = {
  value: PropTypes.object.isRequired
};

export default SearchFilter;