import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import DropDownList from 'react-ui/build/src/components/dropdown'
const log = require('loglevel').getLogger('eventHandler/info')


class info extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        event: PropTypes.object,
        className: PropTypes.string
    };

    state = {
        receiverIndex: 0
    };

    renderDiv = (label, content) => {
        if (!content) {
            return null
        }
        return <div>
            <label>{label}</label>
            <div>{content}</div>
        </div>
    };

    render() {
        let {event, className} = this.props
        const {receiverIndex} = this.state
        return (
            <div id="info_main">
                <div className='c-flex boxes'>
                    <div className='c-flex grow'>
                        <div className='c-flex grow'>
                            <div className='c-box grow'>
                                <header>聊天紀錄</header>
                                <div className='content c-result'>
                                    {this.renderDiv('寄件者名稱', event.messageSender.displayName)}
                                    {this.renderDiv('寄件者 ID', event.messageSender.name)}
                                    {this.renderDiv('服務類型', event.serviceType)}
                                    {this.renderDiv('通聯狀態', event.status)}
                                    {this.renderDiv('訊息發送時間', event.messageDttm)}
                                    {this.renderDiv('聊天室開啟時間', event.chatStartDttm)}
                                    {this.renderDiv('聊天室結束時間', event.lastActivityDttm)}
                                    {this.renderDiv('聊天內容', event.content)}
                                    {this.renderDiv('平台', event.platform)}
                                    {this.renderDiv('備註', event.sourceNote)}
                                </div>
                            </div>
                        </div>
                        <div className='c-flex grow'>
                            <div className='c-box grow'>
                                <header>收件者資訊</header>
                                {
                                    event.messageReceivers ?
                                        <div className='content c-result'>
                                            <DropDownList id='director'
                                                          list={_.map(event.messageReceivers, ({displayName}, index) => {
                                                                  return {value: index, text: displayName}
                                                              }
                                                          )}
                                                          onChange={(index) => {
                                                              this.setState({receiverIndex: index})
                                                          }}
                                                          value={receiverIndex}/>
                                            <div className='c-result'>
                                                {this.renderDiv('接收者 ID', event.messageReceivers[receiverIndex].name)}
                                                {this.renderDiv('接收者名稱', event.messageReceivers[receiverIndex].displayName)}
                                                {this.renderDiv('服務類型', event.messageReceivers[receiverIndex].serviceType)}
                                            </div>
                                        </div>
                                        :
                                        <div>no data</div>
                                }
                            </div>
                        </div>
                        <div className='c-flex grow'>
                            <div className='c-box grow'>
                                <header>其他</header>
                                <div className='content c-result'>
                                    {this.renderDiv('附件數量', event.attechementCount)}
                                    {this.renderDiv('聊天室 ID', event.chatRoomId)}
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
        )
    }
}

export default info