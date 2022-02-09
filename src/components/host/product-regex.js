import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import TextField from '@material-ui/core/TextField'

/**
 * HMD Settings for Product Regex
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Product regex form
 */
class ProductRegex extends Component {
  constructor(props) {
    super(props);
  }
  /**
   * Set input value change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      [event.target.name]: event.target.value
    });
  }
  /**
   * Show each product regex item
   * @method
   * @param {string} val - product regex data
   * @param {string} i - index of the  product regex data
   * @returns TextField component
   */
  getIndividualTextField = (val, i) => {
    const {activeContent, fieldEnable, value} = this.props;

    return (
      <TextField
        key={i}
        name={val.name}
        label={val.label}
        className='product-regex'
        variant='outlined'
        size='small'
        value={value[val.name]}
        onChange={this.handleDataChange}
        disabled={!fieldEnable.vansSoftware} />
    )
  }
  render() {
    return (
      <div className='group-content'>
        {this.props.PRODUCT_REGEX.map(this.getIndividualTextField)}
      </div>
    )
  }
}

ProductRegex.propTypes = {
  activeContent: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired
};

export default ProductRegex;