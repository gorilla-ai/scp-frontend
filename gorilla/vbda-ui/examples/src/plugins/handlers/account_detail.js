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
                                <header>Detail</header>
                                <div className='content c-result'>
                                    {this.renderDiv('project Id', event.projectId)}
                                    {this.renderDiv('名稱', event.displayName ? event.displayName : event.name)}
                                    {this.renderDiv('是否為目標', event.isTarget?'是':'否')}
                                    {this.renderDiv('服務類型', event.serviceType)}
                                    {this.renderDiv('詳細資料', event.detail)}
                                </div>
                            </div>
                            <div className='c-flex grow'>
                                <div className='c-box grow'>
                                    <header>Related Accounts</header>
                                    {
                                        event.relatedAccounts ?
                                            <div className='content c-result'>
                                                <DropDownList id='director'
                                                              list={_.map(event.relatedAccounts, ({name}, index) => {
                                                                      return {value: index, text: name}
                                                                  }
                                                              )}
                                                              onChange={(index) => {
                                                                  this.setState({receiverIndex: index})
                                                              }}
                                                              value={receiverIndex}/>
                                                <div className='c-result'>
                                                    {this.renderDiv('名稱', event.relatedAccounts[receiverIndex].name)}
                                                    {this.renderDiv('是否為目標', event.isTarget?'是':'否')}
                                                    {this.renderDiv('服務類型', event.relatedAccounts[receiverIndex].serviceType)}
                                                </div>
                                            </div>
                                            :
                                            <div className='content'>no data</div>
                                    }
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