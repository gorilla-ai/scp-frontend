import React, { Component } from 'react'
import PropTypes from 'prop-types'

import MultiInput from 'react-ui/build/src/components/multi-input'

import helper from './helper'
import searchMark from './search-mark'

/**
 * Mark Input
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the individual mark input
 */
class MarkInput extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {page, queryType, logFields, markData, inline} = this.props;
    let data = {};

    if (queryType === 'query') {
      data = {
        page,
        logFields,
        queryType
      };

      return (
        <MultiInput
          className='main-mark-group'
          base={searchMark}
          inline={inline}
          props={data}
          value={markData} />
      )
    } else {
      let tempMarkData = [];

      _.forEach(markData, (val, i) => {
        tempMarkData.push({
          data: val.data,
          color: helper.getColor(i)
        });
      })

      const defaultMark = {
        data: '',
        color: helper.getColor(tempMarkData.length)
      };

      data = {
        tempMarkData
      };

      return (
        <div className='mark-section'>
          <MultiInput
            className='mark-wrap'
            base={searchMark}
            inline={inline}
            props={data}
            defaultItemValue={defaultMark}
            value={tempMarkData}
            onChange={this.props.setMarkData} />
        </div>
      )
    }
  }
}

MarkInput.propTypes = {
  page: PropTypes.string,
  logFields: PropTypes.array.isRequired,
  markData: PropTypes.array.isRequired,
  inline: PropTypes.bool.isRequired,
  setMarkData: PropTypes.func.isRequired
};

export default MarkInput;