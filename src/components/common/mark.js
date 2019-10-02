import React, { Component } from 'react'
import PropTypes from 'prop-types'

import MultiInput from 'react-ui/build/src/components/multi-input'

import helper from './helper'
import searchMark from './search-mark'

class Mark extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {activeTab, queryType, searchFields, logFields, markData, inline} = this.props;
    let data = {};

    if (queryType === 'query') {
      data = {
        activeTab,
        searchFields,
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
            onChange={this.props.setMarkData}
            value={tempMarkData} />
        </div>
      )
    }
  }
}

Mark.propTypes = {
  activeTab: PropTypes.string.isRequired,
  searchFields: PropTypes.object.isRequired,
  logFields: PropTypes.array.isRequired,
  markData: PropTypes.array.isRequired,
  inline: PropTypes.bool.isRequired
};

export default Mark;