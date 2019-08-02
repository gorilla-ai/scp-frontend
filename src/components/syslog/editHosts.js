import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Input from 'react-ui/build/src/components/input'

let t = null

class EditHosts extends Component {
	constructor(props) {
		super(props)

		t = chewbaccaI18n.getFixedT(null, 'connections')
	}
  handleChange = (field, value) => {
    this.props.onChange({
      [field]: value
    });
  }
  getErrorMsg = (code, {value, pattern}) => {
    if (code[0] === 'no-match') {
      return t('network-topology.txt-ipValidationFail');
    }
  }
	render() {
		const {id, value} = this.props;

    return (
      <Input
        className='edit-hosts-inputbox'
        validate={{
          pattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
          patternReadable: 'xxx.xxx.xxx.xxx',
          t: this.getErrorMsg
        }}
        onChange={this.handleChange.bind(this, 'host')}
        value={value.host} />
  	)
	}
}

EditHosts.propTypes = {
}

export default EditHosts