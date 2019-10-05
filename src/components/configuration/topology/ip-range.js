import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'

class IpRange extends Component {
  constructor(props) {
    super(props);
  }
  handleChange(field, value) {
    this.props.onChange({
      ...this.props.value,
      [field]: value
    });
  }
  render() {
    const {activeContent, statusEnable, value} = this.props;

    return (
      <div className='group-content'>
        <DropDownList
          required={true}
          onChange={this.handleChange.bind(this, 'type')}
          list={[
            {value: 'private', text: 'Private'},
            {value: 'public', text: 'Public'}
          ]}
          value={value.type}
          readOnly={activeContent === 'viewMode' || !statusEnable.ipRange} />
        <Input
          onChange={this.handleChange.bind(this, 'ip')}
          value={value.ip}
          readOnly={activeContent === 'viewMode' || !statusEnable.ipRange} />
        <Input
          onChange={this.handleChange.bind(this, 'mask')}
          value={value.mask}
          readOnly={activeContent === 'viewMode' || !statusEnable.ipRange} />
      </div>
    )
  }
}

IpRange.propTypes = {
  value: PropTypes.object.isRequired
};

export default IpRange;