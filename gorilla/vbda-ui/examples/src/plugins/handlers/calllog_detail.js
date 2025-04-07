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
                                <header>呼叫紀錄</header>
                                <div className='content c-result'>
                                    {this.renderDiv('撥出者名稱', event.sender.displayName)}
                                    {this.renderDiv('撥出者 ID', event.sender.name)}
                                    {this.renderDiv('服務類型', event.serviceType)}
                                    {this.renderDiv('通聯狀態', event.callType)}
                                    {this.renderDiv('通聯時間', event.durationInSeconds)}
                                    {this.renderDiv('開始時間', event.startDttm)}
                                    {this.renderDiv('結束時間', event.endDttm)}
                                    {this.renderDiv('備註', event.sourceNote)}
                                </div>
                            </div>
                        </div>
                        <div className='c-flex grow'>
                            <div className='c-box grow'>
                                <header>接收者資訊</header>
                                {
                                    event.receivers ?
                                        <div className='content c-result'>
                                            <DropDownList id='director'
                                                          list={_.map(event.receivers, ({displayName}, index) => {
                                                                  return {value: index, text: displayName}
                                                              }
                                                          )}
                                                          onChange={(index) => {
                                                              this.setState({receiverIndex: index})
                                                          }}
                                                          value={receiverIndex}/>
                                            <div className='c-result'>
                                                {this.renderDiv('接收者 ID', event.receivers[receiverIndex].name)}
                                                {this.renderDiv('接收者名稱', event.receivers[receiverIndex].displayName)}
                                                {this.renderDiv('服務類型', event.receivers[receiverIndex].serviceType)}
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
                                    {this.renderDiv('國家代碼', event.countryCode)}
                                    {this.renderDiv('projectId', event.projectId)}
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