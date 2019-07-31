import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'

//const NO_FIELD_VALUE = '-----';

class SearchFilter extends Component {
  constructor(props) {
    super(props);
  }
  handleChange(field, value) {
    this.props.onChange({
      ...this.props.value,
      [field]: value
    });
  }
  // getUniqueFilterList = () => {
  //   const {searchFields} = this.props;

  //   if (searchFields) {
  //     const field_Connections = searchFields.session;
  //     const field_Dns = searchFields.dns;
  //     const field_Http = searchFields.http;
  //     const field_Html = searchFields.html;
  //     const field_Email = searchFields.email;
  //     const field_File = searchFields.file;
  //     const field_Cert = searchFields.cert;
  //     const field_Ftp = searchFields.ftp;
  //     const field_Alert = searchFields.alert;

  //     const uniqueFilterList = _.uniq(field_Connections.concat(field_Dns, field_Http, field_Html, field_Email, field_File, field_Cert, field_Ftp, field_Alert)).sort();
      
  //     const filterList = _.remove(uniqueFilterList, item => {
  //       if (item !== '_tableMenu_' && item !== '_id') {
  //         return item;
  //       }
  //     });

  //     return filterList;
  //   }
  // }
  render() {
    const {activeTab, queryType, value} = this.props;
    const conditionList = ['Must', 'Must Not', 'Either']; //'=', '!=', 'LIKE', 'RE', 'CIDR'
    //let fieldValue = NO_FIELD_VALUE;
    //let filterList = [];
    let formStatus = '';

    if (queryType === 'query') {
      // filterList = this.getUniqueFilterList();
      // filterList = _.uniq(filterList.concat(logFields)).sort();
      // filterList.unshift(NO_FIELD_VALUE);
      formStatus = true;
    } else {
      // if (activeTab === 'logs') {
      //   filterList = [NO_FIELD_VALUE];

      //   _.forEach(logFields, val => {
      //     filterList.push(val);
      //   }) 
      // } else if (activeTab === 'alert') {
      //   filterList = this.getUniqueFilterList();
      //   filterList.unshift(NO_FIELD_VALUE);
      // } else {
      //   filterList = this.getUniqueFilterList();
      //   conditionList = ['=', '!=', 'LIKE', 'RE', 'CIDR'];
      // }
      formStatus = false;
    }

    // if (value.fields) {
    //   fieldValue = value.fields;
    // }

    return (
      <div>
        {/*<span>
          <DropDownList
            className='filter-select'
            required={true}
            onChange={this.handleChange.bind(this, 'fields')}
            value={fieldValue}
            list={filterList.map(type => ({value: type, text: type}))}
            disabled={formStatus} />
          </span>*/}
        <span>
          {conditionList &&
            <DropDownList
              className='condition-select'
              required={true}
              onChange={this.handleChange.bind(this, 'condition')}
              value={value.condition}
              list={conditionList.map(type => ({value: type, text: type}))}
              disabled={formStatus} />
          }
        </span>
        <span>
          <Input
            className='filter-inputbox'
            onChange={this.handleChange.bind(this, 'query')}
            value={value.query}
            disabled={formStatus} />
        </span>
      </div>
    )
  }
}

SearchFilter.propTypes = {
};

export default SearchFilter;