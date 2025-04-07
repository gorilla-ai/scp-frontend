import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import moment from "moment";
import NotificationSystem from 'react-notification-system';

import WidgetLoader from "../loaders/widget";



let log = require('loglevel').getLogger('alarm')

const ICON_CLASS = {
    "success": "fg-chat-2",
    "info": "fg-chat-2",
    "error": "fg-alert-2",
    "warning": "fg-alert-1"
}

/**
 * Alarm
 * @constructor
 * @param {string} type - real-time data get way. 'polling' | 'webSocket'
 * @param {object} options - setting for type
 * @param {object} options.wsUrl - [webSocket] webSocket url
 * @param {object} options.query - [polling] ajax query format
 * @param {string} options.query.url - [polling] request url
 * @param {string} options.query.type - [polling] request type
 * @param {string} [options.query.data] - [polling] request body
 * @param {object} [options.delay] - [polling] polling delay seconds
 * @param {string} [options.startDttmKey] - [polling]
 * @param {string} [options.endDttmKey] - [polling]
 * @param {string} [options.timeFormat] - [polling]
 * @param {string} [options.selectKey] - [polling, webSocket] select the data array key path
 * @param {object} dataCfg.messageType - define the message type setting
 * @param {string} dataCfg.messageType.key
 * @param {object} dataCfg.messageType.valueMapping - value/type pairs for all the value, type support ['success', 'info', 'warning', 'error']
 * @param {string} dataCfg.titleKey - define the title in data
 * @param {string} dataCfg.messageKey - define the message in data
 * @param {int} autoDismiss - delay in seconds for the notification go away. Set this to 0 to not auto-dismiss the notification
 * @param {string} position - Position of the notification. Available: tr (top right), tl (top left), tc (top center), br (bottom right), bl (bottom left), bc (bottom center)
 */
class Alarm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.loadPollingData = this.loadPollingData.bind(this)
        this.addNotifications = this.addNotifications.bind(this)
    }

    componentDidMount() {
        this.init()
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(prevProps, this.props))
            this.init()
    }

    init() {
        const {type} = this.props
        if (type === 'polling') {
            this.setPolling()
        }
        else if (type === 'webSocket') {
            this.setWebSocket()
        }
        else
            log.error('not support type of alarm')
    }

    componentWillUnmount() {
        const {intervalId, socket} = this.state
        if (intervalId)
            clearInterval(this.state.intervalId);
        else if (socket)
            socket.close()
    }

    setPolling() {
        const {options: {delay = 5}} = this.props
        const intervalId = setInterval(this.loadPollingData, delay * 1000)
        const {socket} = this.state
        // clear setting if need
        if (socket)
            socket.close()
        this.setState({intervalId, socket: null})
    }

    setWebSocket() {
        const {options: {wsUrl}} = this.props
        if (!wsUrl) {
            this.addNotification({
                messageType: 'error',
                message: 'WebSocket Url Setting Error!',
                title: 'Error',
                autoDismiss: 0
            });
            return
        }
        // Open a connection
        var socket = new WebSocket(`ws://${wsUrl.replace('ws://', '')}`);

        // When a connection is made
        socket.onopen = function () {
            console.log('Opened connection');
        }
        // When data is received
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                this.addNotifications(data)
            } catch (e) {

            }
        }
        socket.onerror = (event) => {
            console.error("WebSocket error observed:", event);
            this.addNotification({
                messageType: 'error',
                message: 'WebSocket Connect Failed!',
                title: 'Error',
                autoDismiss: 0
            });
        }
        const {intervalId} = this.state
        //clear setting if need
        if (intervalId)
            clearInterval(this.state.intervalId);
        this.setState({socket, intervalId: null})
    }

    loadPollingData() {
        const {
            options: {
                query,
                startDttmKey = 'startDttm',
                endDttmKey = 'endDttm',
                timeFormat = 'YYYY-MM-DDTHH:mm:ss.SS[Z]',
                selectKey,
                delay = 5
            }
        } = this.props
        let ajaxRequest = {
            ...query
        }

        ajaxRequest.data = {
            ...ajaxRequest.data,
            [startDttmKey]: moment().subtract(delay, 'seconds').utc().format(timeFormat),
            [endDttmKey]: moment().utc().format(timeFormat)
        }
        this.loadDataWithQueryConfig({query: ajaxRequest, selectKey})
    }

    loadDataWithQueryConfig({query: ajaxRequest, selectKey}) {
        WidgetLoader.loadDataWithQueryConfig({query: ajaxRequest, selectKey})
            .then(data => {
                this.addNotifications(data)
            })
            .catch((error) => {
                log.error(`Load Polling Data Fail.`, error)
            })
    }

    addNotifications(data) {
        log.info(`Add notifications.`, data)
        _.forEach(data, data => {
            const {
                dataCfg: {titleKey, messageKey},
                autoDismiss = 2
            } = this.props
            const {
                key: messageTypeReference,
                valueMapping: messageTypeValueMapping
            } = _.get(this.props, 'dataCfg.messageType', {})
            let messageType = 'info'
            if (messageTypeReference && messageTypeValueMapping)
                messageType = _.get(messageTypeValueMapping, data[messageTypeReference], 'info')
            const title = _.get(data, titleKey, null)
            const message = _.get(data, messageKey, null)
            this.addNotification({
                messageType,
                message,
                title,
                autoDismiss,
                position: 'br'
            });
        })
        this.setState({data})
    }

    addNotification({messageType, title, message, autoDismiss, position = 'br'}) {
        const content = <div className='notification-content'>
            <div className="notification-custom-icon"><i className={cx("fg", ICON_CLASS[messageType])}/></div>
            <div className="notification-custom-content">
                {title && <h4 className="title">{title}</h4>}
                <p className="message">{message}</p>
            </div>
        </div>
        this.notificationSystem.addNotification({
            message: content,
            level: messageType,
            autoDismiss,
            position
        });
    }

    render() {
        return <div>
            <NotificationSystem ref={element => {
                this.notificationSystem = element;
            }} />
        </div>
    }
}

export default Alarm