import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import DataTable from 'react-ui/build/src/components/table'
import DatePicker from 'react-ui/build/src/components/date-picker'
import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Textarea from 'react-ui/build/src/components/textarea'
import ToggleBtn from 'react-ui/build/src/components/toggle-button'

import {HocFileUpload as FileUpload} from '../../common/file-upload'
import helper from '../../common/helper'
import {HocPagination as Pagination} from '../../common/pagination'
import withLocale from '../../../hoc/locale-provider'
import {HocConfig as Config} from '../../common/configuration'
import RowMenu from '../../common/row-menu'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

class Manage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      datetime: {
        from: helper.getSubstractDate(1, 'hour'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
        //from: '2018-03-07T08:50:00Z',
        //to: '2018-03-08T09:50:00Z'
      },
      threatSearch: false,
      threats: {
        dataFieldsArr: ['createDttm', 'certification', 'domainName', 'white domainName', 'fileHash', 'ip', 'snort', 'url', 'yara'],
        dataFields: {},
        dataContent: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        showContent: false
      },
      agentSearch: '',
      modalTitle: '',
      modalAgentOpen: false,
      agent: {
        dataFieldsArr: ['_menu', 'status', 'ipPort', 'projectId', 'memo', 'agentApiStatus', 'agentMode', 'pCapFileUploadDT', 'analysis'/*, 'startStop', 'threatIntellUpdDt'*/],
        dataFields: {},
        dataContent: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        showContent: false,
        add: {}
      },
      openFilter: false,
      info: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getDataFields();
  }
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  getDataFields = () => {
    const {baseUrl, page} = this.props;
    let dataFieldsArr = this.state[page].dataFieldsArr;
    let dataFields = {};

    dataFieldsArr.forEach(tempData => {
      dataFields[tempData] = {
        label: tempData === '_menu' ? '' : t(`${page}Fields.${tempData}`),
        sortable: null,
        formatter: (value, allValue) => {
          const ipPortURL = '/ChewbaccaWeb/flow-analysis/connections/' + allValue.projectId;

          if (page === 'agent') {
            if (tempData === 'ipPort') {
              return <span>{value}</span>
            } else if (tempData === 'memo') {
              let formattedValue = value;

              if (value.length > 20) {
                formattedValue = value.substr(0, 20) + '...';
                return <a onClick={helper.showPopupMsg.bind(this, value, t('txt-memo'))}>{formattedValue}</a>;
              } else {
                return <span>{value}</span>;
              }
            } else if (tempData === 'status') {
              let text = '';
              let styleStatus = '#d0021b';
              let on = true
              let status = 'n/a'
              let action = ''

              if (value.indexOf('inactive') !== -1) {
                text = t('txt-offline')
                on = false
                status = 'inactive'
                action = 'start'
              } else if (value.indexOf('active') !== -1) {
                text = t('txt-online')
                styleStatus = '#22ac38'
                status = 'active'
                action = 'stop'
              } else {
                text = t('txt-notApplicable');
                on = false
                action = 'start'
              }

              return <ToggleBtn onText='On' offText='Off' on={on} onChange={this.handleAgentStartStop.bind(this, action, status, allValue)} />
            } else if (tempData === 'agentApiStatus') {
              let styleStatus = '#22ac38';

              if (value.toLowerCase() === 'normal') {
              } else if (value.toLowerCase() === 'error') {
                styleStatus = '#d0021b';
              }

              return <div style={{color : styleStatus}}><i className='fg fg-recode' /></div>
            } else if (tempData === 'agentMode') {
              if (value.toLowerCase() === 'realtime') {
                return (
                  <div className='button'>
                    <div>{t('txt-realtime')}</div>
                  </div>
                )
              } else if (value.toLowerCase() === 'tcpdump') {
                return (
                  <div className='button'>
                    <div>{t('txt-tcpdump')}</div>
                    <div>{helper.getFormattedDate(allValue.agentStartDt)}</div>
                    <div>{helper.getFormattedDate(allValue.agentEndDt)}</div>
                  </div>
                )
              } else {
                return (
                  <div className='button'>
                  </div>
                )
              }
            } else if (tempData === 'analysis') {
              const analysisStatus = allValue.lastAnalyzedStatus.toLowerCase();
              let statusLabel = '';
              let status = 'n/a';
              let showStartBtn = false;

              if (allValue.status.indexOf('inactive') !== -1) {
                status = 'inactive';
              } else if (allValue.status.indexOf('active') !== -1) {
                status = 'active';
              }

              if (allValue.agentMode.toLowerCase() === 'tcpdump' && status === 'inactive' && analysisStatus === 'unanalyzed') {
                showStartBtn = true;
              }

              switch(analysisStatus) {
                case 'analyzed':
                  statusLabel = t('network.agent.txt-analyzed');
                  break;
                case 'unanalyzed':
                  statusLabel = t('network.agent.txt-unanalyzed');
                  break;
                case 'analyzing':
                  statusLabel = t('network.agent.txt-analyzing');
                  break;
                case 'n/a':
                  statusLabel = t('txt-notApplicable');
                  break;
              }

              return (
                <div className='button'>
                  <button className='status no-pointer analysis'>
                    {
                      showStartBtn && <i className='c-link fg fg-video-analytics active' onClick={this.agentAnalysis.bind(this, allValue)}></i>
                    }
                    <span className='status'>{statusLabel}</span>
                  </button>
                  <span>{helper.getFormattedDate(allValue.lastAnalyzedStatusUpdDt)}</span>
                </div>
              )
            } else if (tempData === 'pCapFileUploadDT') {
              let disabled = null;

              if (allValue.status.indexOf('inactive') !== -1) {
                disabled = true;
              } else if (allValue.status.indexOf('active') !== -1) {
                disabled = false;
              } else {
                disabled = true;
              }

              let tooltip = t('network.agent.txt-pcap-tooltip') + allValue.ipPort + '/opt/projects/edgeAPI/uploadPCAP'

              return (
                <div className='button' title={tooltip}>
                  <button onClick={this.pcapAnalysis.bind(this, allValue)} disabled={disabled}>
                {
                  // <button onClick={this.openUploadModal.bind(this, allValue, 'agent')} disabled={disabled}>
                }
                    <i className='c-link fg fg-video-analytics'></i><span>{t('txt-parse')}</span>
                  </button>
                  <div>
                    <span>{helper.getFormattedDate(allValue.pCapFileUploadDT, 'local')}</span>
                    {allValue.pCapFileUploadStatus &&
                      <span>({this.getPcapStatusMsg(allValue.pCapFileUploadStatus)})</span>
                    }
                  </div>
                </div>
              )
            } else if (tempData === '_menu') {
              return <RowMenu 
                      page='agent'
                      active={value}
                      targetEdit={allValue}
                      targetDelete={allValue}
                      text={{
                        edit: t('txt-edit'),
                        delete: t('txt-delete')
                      }}
                      onEdit={this.getAddAgentContent}
                      onDelete={this.openDeleteAgentModal} />
            } else {
              return <span>{value}</span>;
            }
          }

          if (page === 'threats') {
            return <span>{value}</span>;
          }
        }
      };
    })

    if (page === 'agent') {
      let tempAgent = {...this.state.agent};
      tempAgent.dataFields = dataFields;

      this.setState({
        agent: tempAgent
      }, () => {
        this.updateAgentData();
      });
    }

    if (page === 'threats') {
      let tempThreats = {...this.state.threats};
      tempThreats.dataFields = dataFields;

      this.setState({
        threats: tempThreats
      }, () => {
        this.updateAgentData();
      });
    }
  }
  handleRowMouseOver(value, allValue, evt) {
    let tmp = {...this.state.agent}

    tmp['dataContent'] = _.map(tmp['dataContent'], el => {
      return {
        ...el,
        _menu: el.projectId === allValue.projectId ? true : false
      }
    })

    this.setState({agent: tmp})
  }
  updateThreatIntell = (allValue) => {
    const {baseUrl} = this.props;

    ah.one({
      url: `${baseUrl}/api/agent/updThreat`,
      data: JSON.stringify({
        id: allValue.agentId,
        threatIntellStartDt: allValue.threatIntellUpdDt
      }),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        helper.showPopupMsg(t('network.agent.txt-agentUpdateSuccess'));
      } else {
        helper.showPopupMsg(t('network.agent.txt-agentUpdateFail'), t('txt-error'));
      }
      this.updateAgentData();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handlePaginationChange = (type, value) => {
    const {page} = this.props;

    if (page === 'agent') {
      let tempAgent = {...this.state.agent};
      tempAgent[type] = value;

      if (type === 'pageSize') {
        tempAgent.currentPage = 1;
      }

      this.setState({
        agent: tempAgent
      }, () => {
        this.updateAgentData();
      });
    }

    if (page === 'threats') {
      let tempThreats = {...this.state.threats};
      tempThreats[type] = value;

      if (type === 'pageSize') {
        tempThreats.currentPage = 1;
      }

      this.setState({
        threats: tempThreats
      }, () => {
        this.updateAgentData();
      });
    }
  }
  updateAgentData = (search) => {
    const {page, baseUrl} = this.props;
    const {datetime, threats, threatSearch, agent, agentSearch} = this.state;

    if (page === 'agent') {
      let agentData = {
        ipPort: '',
        sort: 'ipPort',
        order: 'asc',
        page: agent.currentPage,
        pageSize: agent.pageSize
      };

      if (agentSearch) {
        agentData = {
          ...agentData,
          ipPort : agentSearch
        }
      }

      this.ah.one({
        url: `${baseUrl}/api/agent/_search`,
        data: JSON.stringify(agentData),
        type: 'POST',
        contentType: 'text/plain'
      })
      .then(data => {
        let tableData = data;
        let tempDataContent = [];
        let tempTotalCounts = data.counts;

        tempDataContent = tableData.rows.map(tempData => {
          return tempData;
        });

        let tempAgent = {...agent};
        tempAgent.totalCount = tempTotalCounts;
        tempAgent.dataContent = tempDataContent;
        tempAgent.showContent = true;

        this.setState({
          agent: tempAgent
        });
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }

    if (page === 'threats') {
      let dataObj = {
        page: threats.currentPage,
        pageSize: threats.pageSize
      };

      if (search || threatSearch) {
        dataObj = {
          ...dataObj,
          createDtStart: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
          createDtEnd: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
        };

        if (search) {
          this.setState({
            threatSearch: true
          });
        }
      }

      this.ah.one({
        url: `${baseUrl}/api/threat/upload/_search`,
        data: JSON.stringify(dataObj),
        type: 'POST',
        contentType: 'text/plain'
      })
      .then(data => {
        if (data.counts) {
          let tempDataContent = [];
          let tempTotalCounts = data.counts;
          let tempThreats = {...threats};

          if (tempTotalCounts > 0) {
            for (var i = 0; i < data.rows.length; i++) {
              if (data.rows[i].sourceReference) {
                const dataSplit = data.rows[i].sourceReference.split(', ');
                let innerObj = {};

                for (var j = 0; j < dataSplit.length; j++) {
                  const dataSplit2 = dataSplit[j].split(':');
                  let dataKey = dataSplit2[0].replace(' ', '');
                  let dataValue = '';

                  if (dataSplit2[1]) {
                    dataValue = dataSplit2[1].replace(' ', '');
                  }
                  
                  if (threats.dataFieldsArr.indexOf(dataKey) < 0) {
                    break;
                  }

                  innerObj[dataKey] = dataValue;
                }

                if (Object.keys(innerObj).length !== 0 && innerObj.constructor === Object) {
                  innerObj['createDttm'] = helper.getFormattedDate(data.rows[i].createDttm);
                  tempDataContent.push(innerObj);
                }
              }
            }

            tempThreats.totalCount = tempTotalCounts;
            tempThreats.dataContent = tempDataContent;
            tempThreats.showContent = true;
          } else {
            tempThreats.totalCount = 0;
            tempThreats.dataContent = [];
            tempThreats.showContent = true;
          }

          this.setState({
            threats: tempThreats
          });
        } else {
          helper.showPopupMsg(t('txt-notFound', ''));
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  handleDataChange = (type, val) => {
    const {agent} = this.state;
    let tempAgent = {...agent};

    if (type === 'projectId') {
      val = val.toLowerCase();
    }

    tempAgent.add[type] = val;

    this.setState({
      agent: tempAgent
    });
  }
  getPcapStatusMsg = (status) => {
    if (status === 'Success') {
      return t('txt-success');
    } else if (status === 'Fail') {
      return t('txt-fail');
    }
  }
  displayAddAgent = () => {
    const {agent} = this.state;
    let disabled = false;

    if (agent.add.status && agent.add.status.indexOf('inactive') !== -1) {
      disabled = false;
    } else if (agent.add.status && agent.add.status.indexOf('active') !== -1) {
      disabled = true;
    }

    return (
      <div className='content'>
        <label htmlFor='agentMode'>{t('network.agent.txt-agentMode')}</label>
        <DropDownList
          id='agentMode'
          className='add'
          required={true}
          list={[
            {
              value: 'REALTIME',
              text: t('txt-realtime')
            },
            {
              value: 'TCPDUMP',
              text: t('txt-tcpdump')
            }
          ]}
          onChange={this.handleDataChange.bind(this, 'agentMode')}
          value={agent.add.agentMode} />

        <div>
          <label htmlFor='agentModeDatetime'>{t('network.agent.txt-dateRange')}</label>
          <DateRange
            id='agentModeDatetime'
            className='add'
            onChange={this.handleDataChange.bind(this, 'modeDatetime')}
            enableTime={true}
            value={agent.add.modeDatetime}
            t={et} />
        </div>

        <label htmlFor='agentIPport'>{t('txt-agent')} ({t('txt-agent')} IP:Port) <span>*</span></label>
        <Input
          id='agentIPport'
          className='add'
          placeholder=''
          required={true}
          validate={{
            pattern:/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):(\d+)$/,
            patternReadable:'xxx.xxx.xxx.xxx:xxx',
            t:(code, {value, pattern}) => {
              if (code[0] === 'missing') {
                return t('txt-required');
              } else if (code[0] === 'no-match') {
                return t('network.agent.txt-ipValidationFail');
              }
            }
          }}
          value={agent.add.ipPort}
          disabled={disabled}
          onChange={this.handleDataChange.bind(this, 'ipPort')} />

        <label htmlFor='agentProjectID'>{t('txt-projectID')} ({t('network.agent.txt-lowercaseOnly')}) <span>*</span></label>
        <Input
          id='agentProjectID'
          className='add'
          placeholder=''
          required={true}
          validate={{
            t: et
          }}
          value={agent.add.projectId}
          disabled={disabled}
          onChange={this.handleDataChange.bind(this, 'projectId')} />

        <label htmlFor='agentIPlist'>IP {t('txt-listText')} ({t('txt-commaSeparated')})</label>
        <Input
          id='agentIPlist'
          className='add'
          placeholder=''
          required={false}
          value={agent.add.ipList}
          onChange={this.handleDataChange.bind(this, 'ipList')} />

        <label htmlFor='agentMemo'>{t('txt-memo')} ({t('network.agent.txt-memoMaxLength')})</label>
        <Textarea
          id='agentMemo'
          className='add'
          rows={4}
          maxlength={250}
          value={agent.add.memo}
          onChange={this.handleDataChange.bind(this, 'memo')} />

        {agent.add.lastAnalyzedStatusUpdDt &&
          <div>
            <label htmlFor='agentDatetime'>{t('network.agent.txt-previousUpdateTime')}</label>
            <Input
              id='agentDatetime'
              readOnly={true}
              value={helper.getFormattedDate(agent.add.lastAnalyzedStatusUpdDt)} />
          </div>
        }

        {agent.add.agentId &&
          <div>
            <label htmlFor='agentID'></label>
            <Input
              id='agentID'
              name='agentID'
              type='hidden'
              value={agent.add.agentId} />
          </div>
        }
      </div>
    )
  }
  closeDialog = () => {
    this.setState({
      modalAgentOpen: false
    });
  }
  handleAgentConfirm = () => {
    const {agent} = this.state;
    const {baseUrl} = this.props;
    let requestType = 'POST';
    let data = {
      projectId: agent.add.projectId,
      ipPort: agent.add.ipPort,
      threatIntellUpdDt: Moment(agent.add.agentDatetime).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      agentMode: agent.add.agentMode
    };

    if (agent.add.memo) {
      data = {
        ...data,
        memo: agent.add.memo,
      };
    }

    if (agent.add.ipList) {
      data = {
        ...data,
        ipList: agent.add.ipList,
      };
    }

    if (agent.add.modeDatetime.from) {
      if (agent.add.modeDatetime.to) {
        data = {
          ...data,
          agentStartDt: Moment(agent.add.modeDatetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
        };
      } else { //End date is empty
        this.setState({
          info: t('network.agent.txt-agentEditNoEndDate')
        });
        return;
      }
    }

    if (agent.add.modeDatetime.to) {
      if (agent.add.modeDatetime.from) {
        data = {
          ...data,
          agentEndDt: Moment(agent.add.modeDatetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
        };
      } else { //Start date is empty
        this.setState({
          info: t('network.agent.txt-agentEditNoStartDate')
        });
        return;
      }

      if (Moment(agent.add.modeDatetime.to).isBefore()) { //End date is a past date (compare with current date time)
        this.setState({
          info: t('network.agent.txt-agentEditPastEndDate')
        });
        return;
      }
    }

    if (agent.add.agentId) {
      data = {
        ...data,
        id: agent.add.agentId
      };
      requestType = 'PATCH';
    }

    ah.one({
      url: `${baseUrl}/api/agent`,
      data: JSON.stringify(data),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      this.closeDialog();

      switch(data.ret) {
        case 0:
          helper.showPopupMsg(t('network.agent.txt-agentEditSuccess'));
          break;
        case -1:
          helper.showPopupMsg(t('network.agent.txt-agentEditFail'), t('txt-error'), t('network.agent.txt-agentEditError1'));
          break;
        case -11:
          helper.showPopupMsg(t('network.agent.txt-agentEditFail'), t('txt-error'), t('network.agent.txt-agentEditError2'));
          break;
        case -21:
          helper.showPopupMsg(t('network.agent.txt-agentEditFail'), t('txt-error'), t('network.agent.txt-agentEditError3'));
          break;
        case -22:
          helper.showPopupMsg(t('network.agent.txt-agentEditFail'), t('txt-error'), t('network.agent.txt-agentEditError4'));
          break;
        case -31:
          helper.showPopupMsg(t('network.agent.txt-agentEditFail'), t('txt-error'), t('network.agent.txt-agentEditError5'));
          break;
        case -32:
          helper.showPopupMsg(t('network.agent.txt-agentEditFail'), t('txt-error'), t('network.agent.txt-agentEditError6'));
        case -33:
          helper.showPopupMsg(t('network.agent.txt-agentEditFail'), t('txt-error'), t('network.agent.txt-agentEditError7'));
          break;
        default:
          break;
      }

      this.updateAgentData();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  pcapAnalysis = (value) => {
    const {agent} = this.state
    const {baseUrl} = this.props
    const url = `${baseUrl}/api/agent/pcap/_analyze?projectId=${value.projectId}`

    ah.one({
      url: url,
      type: 'GET'
    })
    .then(data => {
      this.updateAgentData();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  agentAnalysis = (value) => {
    const {agent} = this.state;
    const {baseUrl} = this.props;
    const url = `${baseUrl}/api/agent/_analyze?projectId=${value.projectId}`;

    ah.one({
      url: url,
      type: 'GET'
    })
    .then(data => {
      this.updateAgentData();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  modalAgentDialog = () => {
    const {modalTitle, info} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog.bind(this)},
      confirm: {text: t('txt-confirm'), handler: this.handleAgentConfirm.bind(this)}
    };

    return (
      <ModalDialog
        id='agentModalDialog'
        className='modal-dialog'
        title={modalTitle}
        draggable={true}
        global={true}
        actions={actions}
        info={info}
        closeAction='cancel'>
        {this.displayAddAgent()}
      </ModalDialog>
    )
  }
  getAddAgentContent = (allValue) => {
    const {agent} = this.state;
    let tempAgent = {...agent};
    let titleText = '';

    if (allValue && allValue.agentId) {
      titleText = t('network.agent.txt-editAgent');
    } else {
      titleText = t('network.agent.txt-addAgent');
    }

    if (allValue && allValue.agentId) {
      tempAgent.add = {
        ...allValue,
        modeDatetime: {
          from: helper.getFormattedDate(allValue.agentStartDt, 'local'),
          to: helper.getFormattedDate(allValue.agentEndDt, 'local')
        }
      };
    } else {
      tempAgent.add = {
        agentId: '',
        ipPort: '127.0.0.1:5000',
        projectID: '',
        memo: '',
        threatIntellUpdDt: helper.getSubstractDate(7, 'd'),
        agentMode: 'REALTIME',
        ipList: '',
        modeDatetime: {
          from: '',
          to: ''
        }
      };
    }

    this.setState({
      agent: tempAgent,
      modalTitle: titleText,
      modalAgentOpen: true
    });
  }
  getDeleteAgentContent = (value) => {
    const {agent} = this.state;

    if (value) {
      let tempAgent = {...agent};
      tempAgent.add = {...value};

      this.setState({
        agent: tempAgent
      });
    }

    return (
      <div className='content delete'>
        <span>{t('network.agent.txt-deleteAgentMsg')} ({value.ipPort})?</span>
      </div>
    )
  }
  deleteFile = () => {
    const {agent} = this.state;
    const {baseUrl} = this.props;

    ah.one({
      url: `${baseUrl}/api/agent/${agent.add.agentId}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.updateAgentData();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  openDeleteAgentModal = (value) => {
    PopupDialog.prompt({
      title: t('network.agent.txt-deleteAgent'),
      id: 'modalWindow',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteAgentContent(value),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteFile();
        }
      }
    });
  }
  getUploadContent = (value) => {
    const {page} = this.props;
    const supportText = t('txt-indicators') + ' (.json)';
    const selectFile = t('txt-selectFile');

    if (page === 'agent') {
      if (value) {
        let tempAgent = {...this.state.agent};
        tempAgent.add = {...value};

        this.setState({
          agent: tempAgent
        });
      }
      return (
        <FileUpload
          supportText='PCAP'
          id='PcapUpload'
          name='file'
          fileType='pcap'
          btnText={selectFile} />
      )
    }

    if (page === 'threats') {
      return (
        <FileUpload
          supportText={supportText}
          id='indicatorUpload'
          name='file'
          fileType='indicators'
          btnText={selectFile} />
      )
    }
  }
  uploadFile = (data) => {
    const {page, baseUrl} = this.props;
    const {agent} = this.state;
    let formData = new FormData();
    formData.append('file', data.file);

    if (page === 'agent') {
      ah.one({
        url: `${baseUrl}/api/agent/upload/${agent.add.agentId}`,
        data: formData,
        type: 'POST',
        processData: false,
        contentType: false
      })
      .then(data => {
        if (data.ret === 0) {
          helper.showPopupMsg(t('txt-fileUploadedSuccess'));
        } else {
          helper.showPopupMsg(t('txt-fileUploadedFail'), t('txt-error'));
        }
        this.updateAgentData();
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }

    if (page === 'threats') {
      ah.one({
        url: `${baseUrl}/api/threat/upload`,
        data: formData,
        type: 'POST',
        processData: false,
        contentType: false
      })
      .then(data => {
        if (data.ret === 0) {
          helper.showPopupMsg(t('txt-fileUploadedSuccess'));
        } else {
          helper.showPopupMsg(t('txt-fileUploadedFail'), t('txt-error'));
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  openUploadModal = (value, type) => {
    let title = '';

    if (type === 'agent') {
      title = t('network.agent.txt-uploadPCAP');
    } else if (type === 'threats') {
      title = t('network.agent.txt-uploadIndicators');
    }

    PopupDialog.prompt({
      title,
      id: 'modalWindow',
      confirmText: t('txt-upload'),
      cancelText: t('txt-cancel'),
      display: this.getUploadContent(value),
      act: (confirmed, data) => {
        if (confirmed) {
          if (data.file) {
            this.uploadFile(data);
          } else {
            const errorMsg = t('txt-requiredFileMsg');
            return errorMsg;
          }
        }
      }
    });
  }
  handleAgentSearch = (agentSearch) => {
    this.setState({
      agentSearch
    });
  }
  handleAgentStartStop = (type, status, allValue) => {
    const {baseUrl} = this.props;
    const url = `${baseUrl}/api/agent/_${type}?id=${allValue.agentId}&projectId=${allValue.projectId}`;

    if ((status === 'n/a') || (type === 'start' && status === 'active') || (type === 'stop' && status === 'inactive')) {
      return;
    }

    ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data.ret === 0) {
        this.updateAgentData('search');
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  setFilter(flag) {
    this.setState({openFilter: flag})
  }
  clearFilter() {
    this.setState({agentSearch: ''})
  }
  renderFilter() {
    const {page} = this.props
    const {datetime, threats, agentSearch, openFilter} = this.state

    return (
      <div className={cx('main-filter', {'active': openFilter})}>
        <i className='fg fg-close' onClick={this.setFilter.bind(this, false)} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          {page === 'agent' && 
            <div className='group'>
              <label htmlFor='agentSearch' className='first-label'>{t('network.agent.txt-agentSearch')}</label>
              <Input 
                id='agentSearch'
                className='search-textarea'
                onChange={this.handleAgentSearch}
                value={agentSearch} />
            </div>
          }
          {page === 'threats' && 
            <div className='group'>
              <label htmlFor='threatsSearch' className='first-label'>{t('network.agent.txt-threatsSearch')}</label>
              <DateRange
                id='threatsSearch'
                className='daterange'
                onChange={this.handleDateChange}
                enableTime={true}
                value={datetime}
                t={et} />
            </div>
          }
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.updateAgentData.bind(this, 'search')}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter.bind(this)}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot, language, session, page} = this.props;
    const {datetime, threats, modalAgentOpen, agent, agentSearch, openFilter} = this.state;

    return (
      <div>
        { modalAgentOpen && this.modalAgentDialog() }
         
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {page === 'agent' &&
              <button onClick={this.getAddAgentContent} title={t('network.agent.txt-addAgent')}><i className='fg fg-add'></i></button>
            }
            {page === 'threats' &&
              <button className='last' onClick={this.openUploadModal.bind(this, '', 'threats')} title={t('network.agent.txt-uploadIndicators')}><i className='fg fg-add'></i></button>
            }
            {page === 'agent' &&
              <button className={cx('last', {'active': openFilter})} onClick={this.setFilter.bind(this, !openFilter)} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
            }
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          {page === 'agent' && agent.showContent &&
            <div className='data-table'>
              { this.renderFilter() }

              <div className='main-content'>
                <div className='table-content'>
                  <div className='table normal'>
                    <DataTable
                      className='main-table'
                      data={agent.dataContent}
                      onRowMouseOver={this.handleRowMouseOver.bind(this)}
                      fields={agent.dataFields} />
                  </div>
                  <footer>
                    <Pagination
                      totalCount={agent.totalCount}
                      pageSize={agent.pageSize}
                      currentPage={agent.currentPage}
                      onPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                      onDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
                  </footer>
                </div>
              </div>
            </div>
          }

          {page === 'threats' && threats.showContent &&
            <div className='data-table'>
              { this.renderFilter() }

              <div className='main-content'>
                <div className='table-content'>
                  <div className='table normal'>
                    <DataTable
                      className='main-table'
                      data={threats.dataContent}
                      fields={threats.dataFields} />
                  </div>
                  <footer>
                    <Pagination
                      totalCount={threats.totalCount}
                      pageSize={threats.pageSize}
                      currentPage={threats.currentPage}
                      onPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                      onDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
                  </footer>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

Manage.propTypes = {
  page:  PropTypes.string.isRequired,
  baseUrl: PropTypes.string.isRequired
};

const HocManage = withLocale(Manage);
export { Manage, HocManage };