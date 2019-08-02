import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import ContextMenu from 'react-ui/build/src/components/contextmenu'

class RowMenu extends Component {
	constructor(props) {
		super(props)
	}
	handleRowContextMenu(evt) {
		const {page, text, targetEdit, targetDelete, targetUnlock, targetEventDist, targetEvents} = this.props
		let edit = { 
			id: 'edit',
			text: text.edit,
			action: () => this.props.onEdit(targetEdit)
		}

		if (page === 'map') {
			edit = {
				id: 'edit',
				text: text.edit,
				action: () => this.props.onEdit('', '', 'update', targetEdit)
			}
		}

		let menuItems = [
			edit,
			{
				id: 'delete',
				text: text.delete,
				action: () => this.props.onDelete(targetDelete)
			}
		]

		if (page === 'accounts') {
			menuItems.push({
				id: 'unlock',
				text: text.unlock,
				action: () => this.props.onUnlock(targetUnlock)
			})
		}

		if (page === 'syslog') {
			menuItems.push({
				id: 'eventDist',
				text: text.eventDist,
				action: () => this.props.onEventDist(targetEventDist)
			}, {
				id: 'events',
				text: text.events,
				action: () => this.props.onEvents(targetEvents)
			}, {
				id: 'hosts',
				text: text.hosts,
				action: () => this.props.onEditHosts(targetEvents)
			});
		}

		ContextMenu.open(evt, menuItems, 'view')
	}
	render() {
		const {active} = this.props

		return (
			<div className={cx('table-menu', {'active': active})}>
				<button onClick={this.handleRowContextMenu.bind(this)}><i className='fg fg-more'></i></button>
			</div>
		)
	}
}

RowMenu.propTypes = {
}

export default RowMenu