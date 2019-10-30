import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import Input from 'react-ui/build/src/components/input'

import helper from './helper'

class SearchMark extends Component {
  constructor(props) {
    super(props);
  }
  handleChange(value) {
    const {markData} = this.props;
    let index = '';

    _.forEach(markData, (val, i) => {
      if (val.data === '') {
        index = i;
      }
    })

    this.props.onChange({
      data: value,
      color: helper.getColor(index)
    });
  }
  render() {
    const {value, queryType} = this.props;
    const formStatus = queryType === 'query' ? true : false;

    return (
      <div>
        <i className={'c-link fg fg-recode ' + value.color}></i>
        <Input
          className='mark-inputbox'
          onChange={this.handleChange}
          value={value.data}
          disabled={formStatus} />
      </div>
    )
  }
}

SearchMark.propTypes = {
  value: PropTypes.object.isRequired
};

export default SearchMark;