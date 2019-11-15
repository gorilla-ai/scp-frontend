import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DataTable from 'react-ui/build/src/components/table'
import DropDownList from 'react-ui/build/src/components/dropdown'

let t = null;
let et = null;

/**
 * Relationships
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Relationships content
 */
class Relationships extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nodeA: 'srcNode',
      nodeB: 'dstNode',
      nameOptions: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
  }
  componentDidMount() {
    this.getOptions();
    this.setDefault();
  }
  /**
   * Get and set relationships name options
   * @method
   * @param none
   * @returns none
   */
  getOptions = () => {
    const {relationships} = this.props;
    let nameList = [];

    _.forEach(relationships, el => {
      nameList.push({value: el.name, text: el.name})
    })

    this.setState({
      nameOptions: nameList
    });
  }
  /**
   * Set default relationships
   * @method
   * @param none
   * @returns none
   */
  setDefault = () => {
    const {value, relationships} = this.props;
    let curValue = value === '' ? {} : value;

    if (!curValue.name) {
      curValue.name = '';
      curValue.conditions = _.map(relationships[0].conditions, el => {
        return {
          name: el.name,
          value: el.value, node: ''
        };
      });

      this.props.onChange(curValue);
    } else {
      const rs = _.find(relationships, {name: curValue.name});

      this.setState({
        nodeA: rs.node_a,
        nodeB: rs.node_b
      });
    }
  }
  /**
   * Handle relationships input value change
   * @method
   * @param {string} field - input field
   * @param {string} value - input value
   * @returns none
   */
  handleDataChange = (field, value) => {
    let {value: curValue, relationships} = this.props;

    if (field === 'name') {
      curValue = curValue === '' ? {} : curValue;
      curValue.name = value;
      
      const rs = _.find(relationships, {name: value});

      curValue.conditions = _.map(rs.conditions, el => {
        return {
          name: el.name,
          value: el.value, node: ''
        };
      });
      
      this.props.onChange(curValue);

      this.setState({
        nodeA: rs.node_a,
        nodeB: rs.node_b
      });
    } else {
      this.props.onChange({...curValue, [field]: value});
    }
  }
  /**
   * Handle node data change
   * @method
   * @param {object} allValue - relationships data
   * @param {string} value - node value
   * @returns none
   */
  handleNodeChange = (allValue, value) => {
    const {value: curValue} = this.props;
    let conds = curValue.conditions;
    conds[_.indexOf(conds, allValue)].node = value;
    curValue.conditions = conds;

    this.props.onChange(curValue);
  }
  render() {
    const {value, rawOptions} = this.props;
    const {nodeA, nodeB, nameOptions} = this.state;

    return (
      <div className='relationship'>
        <div className='up'>
          <div className='item'>
            <label>{t('syslogFields.name')}</label>
            <DropDownList list={nameOptions} onChange={this.handleDataChange.bind(this, 'name')} value={value.name} />
          </div>
          <div className='item'>
            <label>{nodeA}</label>
            <DropDownList list={rawOptions} onChange={this.handleDataChange.bind(this, 'srcNode')} value={value.srcNode} />
          </div>
          <i className='fg fg-next' />
          <div className='item'>
            <label>{nodeB}</label>
            <DropDownList list={rawOptions} onChange={this.handleDataChange.bind(this, 'dstNode')} value={value.dstNode} />
          </div>
        </div>
        <div className='down'>
          <div className='item'>
            <label>{t('syslogFields.conditions')}</label>
            <DataTable 
              className='main-table'
              data={value.conditions}
              fields={
                {
                  name: { 
                    label: t('syslogFields.name'),
                    style: { textAlign: 'left'}
                  },
                  value: {
                    label: t('syslogFields.value'),
                    style:{textAlign: 'left'}
                  },
                  node: {
                    label: '',
                    formatter: (val, allValue) => {
                      return <DropDownList
                        list={rawOptions}
                        required={true}
                        validate={{t: et}}
                        value={val}
                        onChange={this.handleNodeChange.bind(this, allValue)} />
                    }
                  }
                }
              } />
          </div>
        </div>
      </div>
    )
  }
}

Relationships.propTypes = {
}

export default Relationships