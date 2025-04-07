import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import DropDownList from 'react-ui/build/src/components/dropdown'
import cx from 'classnames'

import ButtonGroup from 'react-ui/build/src/components/button-group'

const log = require('loglevel').getLogger('eventHandler/info')

const CRIMELEVEL = {
    1: '普通',
    2: '重大',
    3: '特殊'
}

const CRIMESTEP = {
    1: '既遂',
    2: '未遂',
    3: '預備或陰謀'
}

const DISCOVERWAY = {
    1: '被害人報案',
    2: '親友報案',
    3: '他人檢舉',
    4: '勤務中發現',
    5: '自首投案',
    6: '其他'
}

const REPORTWAY = {
    1: '親自',
    2: '書面投函',
    3: '電話',
    4: '傳真',
    5: '網路',
    6: '上級交轉',
    7: '其他'
}

const OCCURWEATHER = {
    1: '晴',
    2: '陰',
    3: '雨',
    4: '霧',
    5: '微風',
    6: '大風',
    7: '颱風',
    8: '其他'
}
const LOSTTYPE = {
    1: '損失',
    2: '起獲',
    3: '證物'
}
const GENDER = {
    1: '男',
    2: '女',
    3: '不詳'
}
const FOREIGNLABORERTYPE = {
    1: '合法',
    2: '非法',
    3: '逃逸',
    4: '其他'
}
const RELATIONSHIPWITHVICTIM = {
    1: '夫妻',
    2: '親戚',
    3: '同居',
    4: '僚屬',
    5: '鄰居',
    6: '同學',
    7: '同事',
    8: '朋友',
    9: '認識',
    A: '陌生'

}
const CASUALTYTYPE = {
    1: '輕傷',
    2: '重傷',
    3: '亡'

}
const FAMILYTYPE = {
    1: '單親',
    2: '雙親',
    3: '失親'

}
const ECONOMYCONDITION = {
    1: '貧寒',
    2: '免持',
    3: '小康',
    4: '中產',
    5: '富裕'

}

class info extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        event: PropTypes.object,
        className: PropTypes.string
    };

    state = {
        nowTab: 'a',
        nowCommonPersonIndex: 0,
        nowSuspectIndex: 0,
        nowThingIndex: 0,
    };

    getCriminal = (suspect) => {
        if (suspect.IsActiveCriminal === 'Y')
            return '現行犯'
        if (suspect.IsPreviousCriminal === 'Y')
            return '前科犯'
        if (suspect.IsWantedCriminal === 'Y')
            return '通緝犯'
        if (suspect.IsChronicCriminal === 'Y')
            return '慣(常)犯'
        if (suspect.IsParolee === 'Y')
            return '假釋中'
        if (suspect.IsEscape === 'Y')
            return '在逃'
        if (suspect.IsPrimaryCriminal === 'Y')
            return '主嫌'
        if (suspect.IsSecondaryCriminal === 'Y')
            return '從嫌'
        return '未知'
    };

    renderA = () => {
        let event = this.props.event
        return <div className='c-flex grow'>
            <div className='c-box grow'>
                <header>案件基本資料</header>
                <div className='content c-result'>
                    {this.renderDiv('案號', event.BaseNo)}
                    {this.renderDiv('刑案級別', CRIMELEVEL[event.CrimeLevel])}
                    {this.renderDiv('案類', event.CaseType)}
                    {this.renderDiv('犯罪實施階段', CRIMESTEP[event.CrimeStep])}
                    {this.renderDiv('發現經過', DISCOVERWAY[event.DiscoverWay])}
                    {this.renderDiv('報案方式', REPORTWAY[event.ReportWay])}
                    {this.renderDiv('發生氣候', OCCURWEATHER[event.OccurWeather])}
                    {this.renderDiv('發生主要場所', event.PrimaryPlace)}
                </div>
            </div>
            <div className='c-box grow'>
                <header>發生</header>
                <div className='content c-result'>
                    {this.renderDiv('時間', event.OccurDateTime)}
                    {this.renderDiv('地點', event.OccurAddress)}
                    {this.renderDiv('管轄', event.OccurUnitName)}
                </div>
            </div>
            <div className='c-box grow'>
                <header>發現</header>
                <div className='content c-result'>
                    {this.renderDiv('時間', event.DiscoverTime)}
                    {this.renderDiv('地點', event.DiscoverAddress)}
                    {this.renderDiv('管轄', event.DiscoverUnitName)}
                </div>
            </div>
            <div className='c-box grow'>
                <header>破獲</header>
                <div className='content c-result'>
                    {this.renderDiv('時間', event.BreakDateTime)}
                    {this.renderDiv('地點', event.BreakAddress)}
                    {this.renderDiv('管轄', event.BreakUnitName)}
                </div>
            </div>
            <div className='c-box grow'>
                <header>報案</header>
                <div className='content c-result'>
                    {this.renderDiv('時間', event.ReportDate)}
                    {this.renderDiv('三聯單編號', event.ReportTriFormNo)}
                    {this.renderDiv('管轄', event.ReportAcceptUnitCodeName)}
                </div>
            </div>
        </div>
    };

    renderB = () => {
        const {nowCommonPersonIndex} = this.state
        const {event} = this.props

        let nowCommonPerson = _.get(event, 'commonPersons.' + nowCommonPersonIndex, null)
        if (!nowCommonPerson)
            return <div className='c-flex grow'>
                <div>no data</div>
            </div>
        return <div className='c-flex grow'>
            <div className='c-box grow'>
                <header>共同人資料</header>
                <div className='content c-result'>
                    <div>
                        <label>姓名</label>
                    </div>
                    <DropDownList id=''
                                  list={_.map(event.commonPersons, ({Name}, index) => {
                                          return {value: index, text: Name}
                                      }
                                  )}
                                  onChange={(index) => {
                                      this.setState({nowThingIndex: index})
                                  }}
                                  value={nowCommonPersonIndex}/>
                    {this.renderDiv('姓名', nowCommonPerson.Name)}
                    {this.renderDiv('身分證', nowCommonPerson.ID)}
                    {this.renderDiv('出生', nowCommonPerson.Birthday)}
                    {this.renderDiv('性別', GENDER[nowCommonPerson.Gender])}
                    {this.renderDiv('綽號別名', nowCommonPerson.Alias)}
                    {this.renderDiv('住址', nowCommonPerson.Address)}
                    {this.renderDiv('身高', nowCommonPerson.Height)}
                    {this.renderDiv('特徵', nowCommonPerson.Feature)}
                    {this.renderDiv('職業', nowCommonPerson.Occupation)}
                    {this.renderDiv('教育', nowCommonPerson.Education)}
                    {this.renderDiv('連絡電話', nowCommonPerson.Telphone)}
                    {this.renderDiv('聯絡呼叫器', nowCommonPerson.BBCall)}
                    {this.renderDiv('國籍', nowCommonPerson.Nationality)}
                    {this.renderDiv('外勞類別', FOREIGNLABORERTYPE[nowCommonPerson.ForeignLaborerType])}
                    {this.renderDiv('受傷程度', CASUALTYTYPE[nowCommonPerson.CasualtyType])}
                    {this.renderDiv('被害原因', nowCommonPerson.InjuredReason)}
                </div>
            </div>
        </div>
    };

    renderC = () => {
        const {nowSuspectIndex} = this.state
        const {event} = this.props

        let suspect = _.get(event, 'suspects.' + nowSuspectIndex, null)
        if (!suspect)
            return <div className='c-flex grow'>
                <div>no data</div>
            </div>
        return <div className='c-flex grow'>
            <div className='c-box grow'>
                <header>嫌疑人</header>
                <div className='content c-result'>
                    <div>
                        <label>姓名</label>
                    </div>
                    <DropDownList id=''
                                  list={_.map(event.suspects, ({Name}, index) => {
                                          return {value: index, text: Name}
                                      }
                                  )}
                                  onChange={(index) => {
                                      this.setState({nowThingIndex: index})
                                  }}
                                  value={nowSuspectIndex}/>
                    {this.renderDiv('姓名', suspect.Name)}
                    {this.renderDiv('身分證', suspect.ID)}
                    {this.renderDiv('出生', suspect.Birthday)}
                    {this.renderDiv('性別', GENDER[suspect.Gender])}
                    {this.renderDiv('綽號別名', suspect.Alias)}
                    {this.renderDiv('住址', suspect.Address)}
                    {this.renderDiv('身高', suspect.Height)}
                    {this.renderDiv('特徵', suspect.Feature)}
                    {this.renderDiv('職業', suspect.Occupation)}
                    {this.renderDiv('教育', suspect.Education)}
                    {this.renderDiv('連絡電話', suspect.Telphone)}
                    {this.renderDiv('聯絡呼叫器', suspect.BBCall)}
                    {this.renderDiv('國籍', suspect.Nationality)}
                    {this.renderDiv('外勞類別', FOREIGNLABORERTYPE[suspect.ForeignLaborerType])}
                    {this.renderDiv('到案日期', suspect.CaughtDate)}
                    {this.renderDiv('緝獲單位', suspect.ArrestUnitCode)}
                    {this.renderDiv('類別', this.getCriminal(suspect))}
                    {this.renderDiv('與主被害人關係', RELATIONSHIPWITHVICTIM[suspect.Relationshipwithvictim])}
                    {this.renderDiv('受傷程度', CASUALTYTYPE[suspect.CasualtyType])}
                </div>
            </div>
            <div className='c-box grow'>
                <header>犯罪方式</header>
                <div className='content c-result'>
                    {this.renderDiv('不良嗜好', suspect.Hobby)}
                    {this.renderDiv('犯罪習癖', suspect.CrimeHabit)}
                    {this.renderDiv('犯罪原因', suspect.CrimeReason1)}
                    {this.renderDiv('準備措施', suspect.CrimePreparation1)}
                    {this.renderDiv('犯罪方式', suspect.CrimeMethod1)}
                    {this.renderDiv('犯罪工具', suspect.CrimeTool1)}
                </div>
            </div>
            <div className='c-box grow'>
                <header>少年家庭狀況</header>
                <div className='content c-result'>
                    {this.renderDiv('家長姓名', suspect.ParentName)}
                    {this.renderDiv('家長職業', suspect.ParentOccupation)}
                    {this.renderDiv('家長教育', suspect.ParentEducation)}
                    {this.renderDiv('家庭型態', FAMILYTYPE[suspect.FamilyType])}
                    {this.renderDiv('經濟狀況', ECONOMYCONDITION[suspect.EconomyCondition])}
                </div>
            </div>
        </div>
    };

    renderD = () => {
        const {nowThingIndex} = this.state
        const {event} = this.props

        let nowThing = _.get(event, 'things.' + nowThingIndex, null)
        if (!nowThing)
            return <div className='c-flex grow'>
                <div>no data</div>
            </div>
        return <div className='c-flex grow'>
            <div className='c-box grow'>
                <header>失、贓、證物</header>
                <div className='content c-result'>
                    <div>
                        <label>種類品名</label>
                    </div>
                    <DropDownList id=''
                                  list={_.map(event.things, ({KindCode}, index) => {
                                          return {value: index, text: KindCode}
                                      }
                                  )}
                                  onChange={(index) => {
                                      this.setState({nowThingIndex: index})
                                  }}
                                  value={nowThingIndex}/>
                    {this.renderDiv('類別', LOSTTYPE[nowThing.LostType])}
                    {this.renderDiv('種類品名', nowThing.KindCode)}
                    {this.renderDiv('數、重量', nowThing.Weight)}
                    {this.renderDiv('廠牌', nowThing.Brand)}
                    {this.renderDiv('價值', nowThing.Value)}
                    {this.renderDiv('年份', nowThing.Year)}
                    {this.renderDiv('顏色', nowThing.Color)}
                    {this.renderDiv('質料', nowThing.Material)}
                    {this.renderDiv('銷贓方法', nowThing.DisposalStolenMethod)}
                    {this.renderDiv('車牌號碼', nowThing.CarID)}
                    {this.renderDiv('品錶型(引擎)號碼', nowThing.EngineNo)}
                    {this.renderDiv('物(車、槍、表、機)身號碼', nowThing.GunNo)}
                    {this.renderDiv('國內外來源地區', nowThing.SourceRegion)}
                    {this.renderDiv('起獲日期', nowThing.GetDate)}
                    {this.renderDiv('起獲單位', nowThing.GetUnitCode)}
                </div>
            </div>
        </div>
    };

    renderE = () => {
        let event = {
        }
        return <div className='c-flex fdc grow'>
            <div className='c-box grow'>
                <header>3 Header</header>
                <div className='content'>
                    3
                </div>
            </div>
            <div className='c-flex grow'>
                <div className='c-box fixed'>
                    <header>4 Header</header>
                    <div className='content'>
                        4
                    </div>
                </div>
                <div className='c-flex fdc grow'>
                    <div className='c-box grow'>
                        <header>5 Header</header>
                        <div className='content'>
                            5
                        </div>
                    </div>
                    <div className='c-box grow'>
                        <header>6 Header</header>
                        <div className='content'>
                            6
                        </div>
                    </div>
                </div>
            </div>
        </div>
    };

    renderX = () => {
        let event = {
        }
        return <div className='c-flex fdc grow'>
            <div className='c-box grow'>
                <header>3 Header</header>
                <div className='content'>
                    3
                </div>
            </div>
            <div className='c-flex grow'>
                <div className='c-box fixed'>
                    <header>4 Header</header>
                    <div className='content'>
                        4
                    </div>
                </div>
                <div className='c-flex fdc grow'>
                    <div className='c-box grow'>
                        <header>5 Header</header>
                        <div className='content'>
                            5
                        </div>
                    </div>
                    <div className='c-box grow'>
                        <header>6 Header</header>
                        <div className='content'>
                            6
                        </div>
                    </div>
                </div>
            </div>
        </div>
    };

    renderDiv = (label, content, hide = false) => {
        if (!content) {
            if (hide)
                return null
            else
                return <div>
                    <label>{label}</label>
                    <div>無紀錄</div>
                </div>

        }
        return <div>
            <label>{label}</label>
            <div>{content}</div>
        </div>
    };

    render() {
        let {nowTab} = this.state
        let renderMain = {
            a: this.renderA(),
            b: this.renderB(),
            c: this.renderC(),
            d: this.renderD(),
            E: this.renderE()
        }
        let main = renderMain[nowTab]
        return <div id="info_main">
            {/*<div >*/}
            <div className='c-flex aic jcsb fixed c-toolbar'>
                <ButtonGroup
                    list={[
                        {value: 'a', text: '案件資本資料'},
                        {value: 'b', text: '共同人資料'},
                        {value: 'c', text: '嫌疑人資料'},
                        {value: 'd', text: '失、贓、證物專項'},
                        {value: 'e', text: '影音多媒體專項'}
                    ]}
                    value={nowTab}
                    onChange={(value) => {
                        this.setState({nowTab: value})
                    }}
                />
            </div>
            <div className='c-flex boxes'>
                {main}
            </div>
            {/*</div>*/}
        </div>
    }
}

export default info