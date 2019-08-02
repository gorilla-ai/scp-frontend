import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'


import DataTable from 'react-ui/build/src/components/table'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'

let t = null
let et = null


class Relationships extends Component {
	constructor(props) {
		super(props)

		this.state = {
			nodeA: 'srcNode',
			nodeB: 'dstNode',
			nameOptions: []
		}

		t = global.chewbaccaI18n.getFixedT(null, 'connections')
  	et = global.chewbaccaI18n.getFixedT(null, 'errors')
	}
	componentDidMount() {
		this.getOptions()
		this.setDefault()
	}
	getOptions() {
		const {relationships} = this.props
		let nameList = []

	  	_.forEach(relationships, el => {
      		nameList.push({value: el.name, text: el.name})
		})

  		this.setState({nameOptions: nameList})
	}
	setDefault() {
		let {onChange, value:curValue, relationships} = this.props

	    curValue = curValue === '' ? {} : curValue
	    
	    if (!curValue.name) {
	      	// curValue.name = relationships[0].name
	      	curValue.name = ''
	      	curValue.conditions = _.map(relationships[0].conditions, el => {
	        	return {name: el.name, value: el.value, node: ''}
	      	})
	    	
	      	onChange(curValue)
	      	// this.setState({nodeA: relationships[0].node_a, nodeB: relationships[0].node_b})  
	    }
	    else {
	      	let rs = _.find(relationships, {name: curValue.name})
	      	this.setState({nodeA: rs.node_a, nodeB: rs.node_b})
	    }
	}
	handleChange(field, value) {
		let {onChange, value:curValue, relationships} = this.props

		if (field === 'name') {
			curValue = curValue === '' ? {} : curValue
			curValue.name = value
			
			let rs = _.find(relationships, {name: value})
			curValue.conditions = _.map(rs.conditions, el => {
				return {name: el.name, value: el.value, node: ''}
			})
			
			onChange(curValue)
			this.setState({nodeA: rs.node_a, nodeB: rs.node_b})
		}
		else {
			onChange({...curValue, [field]: value})
		}
	}
	handleNodeChange(allValue, value) {
		let {onChange, value:curValue} = this.props
		let conds = curValue.conditions
		conds[_.indexOf(conds, allValue)].node = value
	  	curValue.conditions = conds
    	onChange(curValue)
	}
	render() {
		const {value, rawOptions} = this.props
		const {nodeA, nodeB, nameOptions} = this.state

    return (
  		<div className='Relationship'>
  			<div className='up'>
    			<div className='item'>
      			<label>{t('syslogFields.name')}</label>
      			<DropDownList list={nameOptions} onChange={this.handleChange.bind(this, 'name')} value={value.name} />
  			</div>
  			<div className='item'>
      			<label>{nodeA}</label>
				<DropDownList list={rawOptions} onChange={this.handleChange.bind(this, 'srcNode')} value={value.srcNode} />
  			</div>
      		<i className='fg fg-next' />
  			<div className='item'>
        		<label>{nodeB}</label>
        		<DropDownList list={rawOptions} onChange={this.handleChange.bind(this, 'dstNode')} value={value.dstNode} />
    		</div>
  		</div>
			<div className='down'>
				<div className='item'>
					<label>{t('syslogFields.conditions')}</label>
    			<DataTable className='table-100' data={value.conditions} 
          			fields={{
            			name: { label: t('syslogFields.name'), style:{textAlign: 'left'} },
            			value: { label: t('syslogFields.value'), style:{textAlign: 'left'} },
            			node: { label: '', formatter: (val, allVal) => {
            				return <DropDownList list={rawOptions} required={true} validate={{t: et}} value={val}
            							onChange={this.handleNodeChange.bind(this, allVal)} />
            			}}
          			}} />
      			</div>
  			</div>
  		</div>
  	)
	}
}

Relationships.propTypes = {
}

export default Relationships