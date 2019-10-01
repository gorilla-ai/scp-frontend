import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import ComboBox from 'react-ui/build/src/components/combobox'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Popover from 'react-ui/build/src/components/popover'

import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'
import {HocConfig as Config} from '../../common/configuration'
import RowMenu from '../../common/row-menu'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

class EmailReport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      search: {
        reportPeriod: 0,
        isEnabled: -1,
        networkType: -1,
        honeypot: ''
      },
      honeyPotList: [],
      modalTitle: '',
      emailReport: {
        dataFieldsArr: ['_menu', 'reportPeriod', 'isEnabled', 'sendHour', 'sendWeekDay'/*, 'sendBulk'*/, 'emailSubject', 'recipientList', 'networkType', 'honeypotList', 'lastStatus'/*, 'lastFailEmail'*/],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'reportPeriod',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        add: {}
      },
      modalOpen: false,
      openFilter: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getHoneyPotData();
    this.getReportEmailData();
  }
  getHoneyPotData = () => {
    const {baseUrl} = this.props;

    this.ah.one({
      url: `${baseUrl}/api/honeynet/host/_search`,
      data: JSON.stringify({
        page: 1,
        pageSize: 10000
      }),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      let honeyPotList = [];

      _.forEach(data.rows, val => {
        honeyPotList.push(val.vpnName);
      });

      this.setState({
        honeyPotList
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getReportEmailData = (fromSearch) => {
    const {baseUrl} = this.props;
    const {search, emailReport} = this.state;
    let dataObj = {
      sort: emailReport.sort.field,
      order: emailReport.sort.desc ? 'desc' : 'asc',
      page: fromSearch === 'search' ? 1 : emailReport.currentPage,
      pageSize: emailReport.pageSize
    };

    if (fromSearch === 'search') {
      if (search.reportPeriod !== 0) {
        dataObj.reportPeriod = search.reportPeriod;
      }

      if (search.isEnabled !== -1) {
        dataObj.isEnabled = search.isEnabled;
      }

      if (search.networkType !== -1) {
        dataObj.networkType = search.networkType;
      }

      if (search.honeypot) {
        dataObj.honeypot = search.honeypot;
      }
    }

    this.ah.one({
      url: `${baseUrl}/api/honeynet/reportEmail/_search`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      let tempEmailReport = {...emailReport};
      tempEmailReport.dataContent = data.rows;
      tempEmailReport.totalCount = data.counts;
      tempEmailReport.currentPage = fromSearch === 'search' ? 1 : emailReport.currentPage;

      let dataFields = {};
      emailReport.dataFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: tempData === '_menu' ? '' : t(`emailReportFields.${tempData}`),
          sortable: tempData !== '_menu' ? true : null,
          formatter: (value, allValue) => {
            if (tempData === 'reportPeriod') {
              switch(value) {
                case 1:
                  value = t('txt-daily');
                  break;
                case 2:
                  value = t('txt-weekly');
                  break;
                case 2:
                  value = t('txt-monthly');
                  break;
              }
            } else if (tempData === 'isEnabled') {
                let statusStyle = value === 0 ? 'red' : 'green'
                return <span className={statusStyle}><i className='fg fg-recode'/></span>
            } else if (tempData === 'sendBulk') {
              switch(value) {
                case 0:
                  value = t('txt-no');
                  break;
                case 1:
                  value = t('txt-yes');
                  break;
              }
            } else if (tempData === 'sendWeekDay') {
              if (allValue.reportPeriod === 1) {
                value = t('txt-daily');
              } else {
                switch(value) {
                  case 0:
                    value = t('txt-sun');
                    break;
                  case 1:
                    value = t('txt-mon');
                    break;
                  case 2:
                    value = t('txt-tue');
                    break;
                  case 3:
                    value = t('txt-wed');
                    break;
                  case 4:
                    value = t('txt-thu');
                    break;
                  case 5:
                    value = t('txt-fri');
                    break;
                  case 6:
                    value = t('txt-sat');
                    break;
                }
              }
            } else if (tempData === 'networkType') {
              switch(value) {
                case 1:
                  value = t('txt-internet');
                  break;
                case 2:
                  value = t('txt-intranet');
                  break;
              }
            } else if (tempData === 'honeypotList' || tempData === 'emailSubject' || tempData === 'recipientList' || tempData === 'lastFailEmail') {
              value = value.replace(/,/g, ", ");
              let formattedValue = value;

              if (value.length > 20) {
                formattedValue = value.substr(0, 20) + '...';
                return <a onClick={helper.showPopupMsg.bind(this, value, t(`emailReportFields.${tempData}`))}>{formattedValue}</a>;
              } else {
                return <span>{value}</span>;
              }
            } else if (tempData === '_menu') {
              return <RowMenu
                      page='mail'
                      active={value}
                      targetEdit={allValue}
                      targetDelete={allValue}
                      text={{
                        edit: t('txt-edit'),
                        delete: t('txt-delete')
                      }}
                      onEdit={this.addEmailSettings}
                      onDelete={this.openDeleteEmailReportModal} />
            } else if (tempData === 'lastStatus') {
              let statusStyle = ''
              if (value === 'success') {
                statusStyle = 'green'
              } else {
                statusStyle = 'red'
              }

              return <div onMouseEnter={this.mouseEnter.bind(this, allValue.lastFailEmail)} onMouseLeave={this.mouseLeave.bind(this)}>
                <span className={statusStyle}><i className='fg fg-recode'/></span>
                </div>
            }
            return <span>{value}</span>;
          }
        };
      })

      tempEmailReport.dataFields = dataFields;

      this.setState({
        emailReport: tempEmailReport
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  mouseEnter = (lfe, evt) => {
    Popover.openId('popup-id', evt, <div>{t(`emailReportFields.lastFailEmail`) + lfe}</div>)
  }
  mouseLeave = () => {
    Popover.closeId('popup-id')
  }
  handleRowMouseOver = (value, allValue, evt) => {
    let tmp = {...this.state.emailReport}

    tmp['dataContent'] = _.map(tmp['dataContent'], el => {
      return {
        ...el,
        _menu: el.settingID === allValue.settingID ? true : false
      }
    })

    this.setState({emailReport: tmp})
  }
  displayAddEmailSettings = () => {
    const {honeyPotList, emailReport} = this.state;
    let hourArr = [];
    const weekArr = [
      {
        value: 0,
        text: t('txt-sun')
      },
      {
        value: 1,
        text: t('txt-mon')
      },
      {
        value: 2,
        text: t('txt-tue')
      },
      {
        value: 3,
        text: t('txt-wed')
      },
      {
        value: 4,
        text: t('txt-thu')
      },
      {
        value: 5,
        text: t('txt-fri')
      },
      {
        value: 6,
        text: t('txt-sat')
      }
    ];

    for (var i = 0; i <= 23; i++) {
      hourArr.push({
        value: i,
        text: i.toString()
      });
    }

    return (
      <div>
        <div className='content'>
          <label htmlFor='emailReportPeriod'>{t('emailReportFields.reportPeriod')}</label>
          <DropDownList
            id='emailReportPeriod'
            className='add'
            list={[
              {
                value: 1,
                text: t('txt-daily')
              },
              {
                value: 2,
                text: t('txt-weekly')
              }
            ]}
            required={true}
            defaultValue='1'
            onChange={this.handleDataChange.bind(this, 'emailReport', 'reportPeriod')}
            value={emailReport.add.reportPeriod}/>

          <label htmlFor='emailReportEnabled'>{t('emailReportFields.isEnabled')}</label>
          <DropDownList
            id='emailReportEnabled'
            className='add'
            list={[
              {
                value: 0,
                text: t('txt-no')
              },
              {
                value: 1,
                text: t('txt-yes')
              }              
            ]}
            required={true}
            defaultValue='0'
            onChange={this.handleDataChange.bind(this, 'emailReport', 'isEnabled')}
            value={emailReport.add.isEnabled}/>

          <label htmlFor='emailReportSendHour'>{t('emailReportFields.sendHour')}</label>
          <DropDownList
            id='emailReportSendHour'
            className='add'
            list={hourArr}
            required={true}
            defaultValue='0'
            onChange={this.handleDataChange.bind(this, 'emailReport', 'sendHour')}
            value={emailReport.add.sendHour}/>

          {Number(emailReport.add.reportPeriod) === 2 &&
            <div>
              <label htmlFor='emailReportWeekDay'>{t('emailReportFields.sendWeekDay')}</label>
              <DropDownList
                id='emailReportWeekDay'
                className='add'
                list={weekArr}
                required={true}
                defaultValue='0'
                onChange={this.handleDataChange.bind(this, 'emailReport', 'sendWeekDay')}
                value={emailReport.add.sendWeekDay}/>
            </div>
          }

          <label htmlFor='emailReportSendBulk'>{t('emailReportFields.sendBulk')}</label>
          <DropDownList
            id='emailReportSendBulk'
            className='add'
            list={[
              {
                value: 0,
                text: t('txt-no')
              },
              {
                value: 1,
                text: t('txt-yes')
              }
            ]}
            required={true}
            defaultValue='0'
            onChange={this.handleDataChange.bind(this, 'emailReport', 'sendBulk')}
            value={emailReport.add.sendBulk}/>
        
          <label htmlFor='emailReportSubject'>{t('emailReportFields.emailSubject')} <span>*</span></label>
          <Input
            id='emailReportSubject'
            className='add'
            placeholder=''
            required={true}
            validate={{
              t: et
            }}
            value={emailReport.add.emailSubject}
            onChange={this.handleDataChange.bind(this, 'emailReport', 'emailSubject')} />

          <label htmlFor='emailReportRecipient'>{t('emailReportFields.recipientList')} ({t('txt-commaSeparated')})</label>
          <Input
            id='emailReportRecipient'
            className='add'
            placeholder=''
            value={emailReport.add.recipientList}
            onChange={this.handleDataChange.bind(this, 'emailReport', 'recipientList')} />

          <label htmlFor='emailReportNetwork'>{t('emailReportFields.networkType')}</label>
          <DropDownList
            id='emailReportNetwork'
            className='add'
            list={[
              {
                value: 1,
                text: t('txt-internet')
              },
              {
                value: 2,
                text: t('txt-intranet')
              }
            ]}
            required={true}
            defaultValue='2'
            onChange={this.handleDataChange.bind(this, 'emailReport', 'networkType')}
            value={emailReport.add.networkType}/>

          <label htmlFor='emailReportHoneypot'>{t('emailReportFields.honeypotList')}</label>
          <ComboBox
            id='emailReportHoneypot'
            list={
              honeyPotList.map(
                i => ({
                  value: i,
                  text: i
                })
              )
            }
            multiSelect={{
              enabled: true,
              toggleAll: true
            }}
            search={{
              enabled: true
            }}
            info={(list) => {
              return list.length <= 0 ? 'No Results Found' : ''
            }}
            onChange={this.handleDataChange.bind(this, 'emailReport', 'honeypotList')}
            value={emailReport.add.honeypotList}/>
        </div>
      </div>
    )
  }
  addEmailSettings = (allValue) => {
    let tempEmailReport = {...this.state.emailReport};
    const titleText = allValue.settingID ? t('honeynet.txt-editEmailReport') : t('honeynet.txt-addEmailReport');

    if (allValue.settingID) {
      tempEmailReport.add = {
        ...allValue
      };

      const tempList = allValue.honeypotList.replace(/\s+/g, '');
      tempEmailReport.add.honeypotList = tempList.split(",");
    } else {
      tempEmailReport.add = {
        reportPeriod: 1,
        isEnabled: 0,
        sendHour: 0,
        sendBulk: 0,
        sendWeekDay: 0,
        networkType: 2
      };
    }

    this.setState({
      modalTitle: titleText,
      emailReport: tempEmailReport,
      modalOpen: true
    });
  }
  handleAddEmailSettingsConfirm = () => {
    const {emailReport} = this.state;
    const {baseUrl} = this.props;
    let requestType = 'POST';
    let data = {
      reportPeriod: Number(emailReport.add.reportPeriod),
      isEnabled: Number(emailReport.add.isEnabled),
      sendHour: Number(emailReport.add.sendHour),
      sendBulk: Number(emailReport.add.sendBulk),
      emailSubject: emailReport.add.emailSubject,
      recipientList: emailReport.add.recipientList,
      networkType: Number(emailReport.add.networkType),
      honeypotList: emailReport.add.honeypotList.join()
    };

    if (Number(emailReport.add.reportPeriod) === 2) {
      data = {
        ...data,
        sendWeekDay: Number(emailReport.add.sendWeekDay)
      };
    }

    if (emailReport.add.settingID) {
      data = {
        ...data,
        settingID: emailReport.add.settingID
      };
      requestType = 'PATCH';
    }

    ah.one({
      url: `${baseUrl}/api/honeynet/reportEmail`,
      data: JSON.stringify(data),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      this.closeDialog();
      this.getReportEmailData();
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  closeDialog = () => {
    this.setState({
      modalOpen: false
    });
  }
  modalDialog = () => {
    const {modalTitle} = this.state;
    const titleText = modalTitle;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog.bind(this)},
      confirm: {text: t('txt-confirm'), handler: this.handleAddEmailSettingsConfirm.bind(this)}
    };

    return (
      <ModalDialog
        id='emailReportModalDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayAddEmailSettings()}
      </ModalDialog>
    )
  }
  handleTableSort = (value) => {
    let tempEmailReport = {...this.state.emailReport};
    tempEmailReport.sort.field = value.field;
    tempEmailReport.sort.desc = !tempEmailReport.sort.desc;

    this.setState({
      emailReport: tempEmailReport
    }, () => {
      this.getReportEmailData();
    });
  }
  handlePaginationChange = (type, value) => {
    let tempEmailReport = {...this.state.emailReport};
    tempEmailReport[type] = value;

    if (type === 'pageSize') {
      tempEmailReport.currentPage = 1;
    }

    this.setState({
      emailReport: tempEmailReport
    }, () => {
      this.getReportEmailData();
    });
  }
  handleDataChange = (formType, type, value) => {
    const {search, emailReport} = this.state;
    let tempSearch = {...search};
    let tempEmailReport = {...emailReport};

    if (formType === 'search') {
      tempSearch[type] = value;

      this.setState({
        search: tempSearch
      });
    } else if (formType === 'emailReport') {
      tempEmailReport.add[type] = value;

      if (type === 'reportPeriod') {
        if (Number(value) === 1) {
          tempEmailReport.add.networkType = 2;
        } else if (Number(value) === 2) {
          tempEmailReport.add.networkType = 1;
        }
      }

      this.setState({
        emailReport: tempEmailReport
      });
    }
  }
  getDeleteEmailReportContent = (value) => {
    if (value) {
      let tempEmailReport = {...this.state.emailReport};
      tempEmailReport.add = {...value};

      this.setState({
        emailReport: tempEmailReport
      });
    }

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}?</span>
      </div>
    )
  }
  openDeleteEmailReportModal = (value) => {
    PopupDialog.prompt({
      title: t('honeynet.txt-deleteEmailReport'),
      id: 'modalWindow',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteEmailReportContent(value),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteEmailReport();
        }
      }
    });
  }
  deleteEmailReport = () => {
    const {emailReport} = this.state;
    const {baseUrl} = this.props;

    ah.one({
      url: `${baseUrl}/api/honeynet/reportEmail/${emailReport.add.settingID}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getReportEmailData();
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  setFilter(flag) {
    this.setState({openFilter: flag})
  }
  clearFilter() {
    const clear = { reportPeriod: 0, isEnabled: -1, networkType: -1, honeypot: '' }
    this.setState({search: clear})
  }
  renderFilter() {
    const {search, openFilter} = this.state

    return (
      <div className={cx('main-filter', {'active': openFilter})}>
        <i className='fg fg-close' onClick={this.setFilter.bind(this, false)} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='searchEmailReportPeriod' className='first-label'>{t('emailReportFields.reportPeriod')}</label>
            <DropDownList id='searchEmailReportPeriod' required={true}
              list={[
                {
                  value: 0,
                  text: t('txt-all')
                },
                {
                  value: 1,
                  text: t('txt-daily')
                },
                {
                  value: 2,
                  text: t('txt-weekly')
                }
              ]}
              onChange={this.handleDataChange.bind(this, 'search', 'reportPeriod')}
              value={search.reportPeriod} />
          </div>
          <div className='group'>
            <label htmlFor='searchEmailReportNetwork'>{t('emailReportFields.networkType')}</label>
            <DropDownList id='searchEmailReportNetwork' required={true}
              list={[
                {
                  value: -1,
                  text: t('txt-all')
                },
                {
                  value: 1,
                  text: t('txt-internet')
                },
                {
                  value: 2,
                  text: t('txt-intranet')
                }
              ]}
              onChange={this.handleDataChange.bind(this, 'search', 'networkType')}
              value={search.networkType} />
          </div>
          <div className='group'>
            <label htmlFor='searchEmailReportHoneypot'>{t('emailReportFields.honeypot')}</label>
            <Input id='searchEmailReportHoneypot' placeholder={t('txt-enterKeyword')} onChange={this.handleDataChange.bind(this, 'search', 'honeypot')} value={search.honeypot} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getReportEmailData.bind(this, 'search')}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter.bind(this)}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {emailReport, modalOpen, openFilter} = this.state;

    return (
      <div>
        { modalOpen && this.modalDialog() }
        
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button onClick={this.addEmailSettings} title={t('honeynet.txt-addEmailReport')}><i className='fg fg-add'></i></button>
            <button className={cx('last', {'active': openFilter})} onClick={this.setFilter.bind(this, !openFilter)} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'> 
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          <div className='parent-content'>
            { this.renderFilter() }

            <div className='main-content'>
              <header className='main-header'>{t('txt-email-report')}</header>
              <TableContent
                dataTableData={emailReport.dataContent}
                dataTableFields={emailReport.dataFields}
                dataTableSort={emailReport.sort}
                paginationTotalCount={emailReport.totalCount}
                paginationPageSize={emailReport.pageSize}
                paginationCurrentPage={emailReport.currentPage}
                handleTableSort={this.handleTableSort}
                handleRowMouseOver={this.handleRowMouseOver}
                paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

EmailReport.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

const HocEmailReport = withLocale(EmailReport);
export { EmailReport, HocEmailReport };