import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import {ReactMultiEmail} from 'react-multi-email'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from './context'
import FilterInput from './filter-input'
import helper from './helper'
import MarkInput from './mark-input'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};
const PERIOD_MIN = [10, 15, 30, 60];
const FORM_VALIDATION = {
  queryName: {
    valid: true,
    msg: ''
  },
  title: {
    valid: true,
    msg: ''
  },
  eventDescription: {
    valid: true,
    msg: ''
  }
};

let t = null;
let f = null;
let et = null;
let it = null;

/**
 * Query open/save
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Query open/save menu
 */
class QueryOpenSave extends Component {
  constructor(props) {
    super(props);

    this.state = {
      queryList: [],
      activeQuery: {},
      severityList: [],
      periodMinList: [],
      newQueryName: true,
      pattern: {
        name: '',
        aggColumn: '',
        periodMin: 10,
        threshold: 1,
        severity: 'Emergency'
      },
      soc: {
        id: '',
        severity: 'Emergency',
        limitQuery: 10,
        title: '',
        eventDescription: '',
        impact: 4,
        category: 1,
        status: true
      },
      activePatternId: '',
      patternCheckbox: false,
      publicCheckbox: false,
      socTemplateEnable: false,
      dialogOpenType: '',
      info: '',
      formValidation: _.cloneDeep(FORM_VALIDATION)
    };

    it = global.chewbaccaI18n.getFixedT(null, 'incident');
    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.setQueryList();
    this.setSeverityList();
    this.setPatternData();
  }
  /**
   * Set query list
   * @method
   * @param {array.<object>} [list] - query list to be set
   */
  setQueryList = (list) => {
    const {type, queryData, queryDataPublic} = this.props;
    let dataList = list;

    if (!list) {
      if (type === 'open') {
        dataList = queryData.list;
      } else if (type === 'publicOpen') {
        dataList = queryDataPublic.list;
      }
    }

    const queryList = _.map(dataList, val => {
      return {
        value: val.id,
        text: val.name
      }
    });

    this.setState({
      queryList,
      activeQuery: queryList[0]
    }, () => {
      if (this.props.type === 'open' ||this.props.type === 'publicOpen') {
        if (queryList.length > 0) {
          this.getQuerySOCValue(queryList[0]);
        }
      }
    });
  }
  /**
   * Set severity list
   * @method
   */
  setSeverityList = () => {
    const severityList = _.map(SEVERITY_TYPE, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });
    const periodMinList = _.map(PERIOD_MIN, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    this.setState({
      severityList,
      periodMinList
    });
  }
  /**
   * Set pattern data
   * @method
   */
  setPatternData = () => {
    this.setState({
      pattern: {
        ...this.props.queryData.pattern
      }
    });
  }
  getQuerySOCValue = (activeQuery) => {
    const {queryData, queryDataPublic, type} = this.props;
    const {baseUrl} = this.context;
    let tempQueryData = []

    if (type === 'open' || type === 'save') {
      tempQueryData = {...queryData};
    } else if (type === 'publicOpen' || type === 'publicSave') {
      tempQueryData = {...queryDataPublic};
    }

    let url = `${baseUrl}/api/soc/template?id=${activeQuery.value}`;
    this.ah.one({
      url,
      type: 'GET',
      contentType: 'text/plain'
    }).then(data => {
      if (data) {
        tempQueryData.soc = {
          id: data.id,
          title: data.title,
          eventDescription: data.eventDescription,
          category: data.category,
          impact: data.impact,
          severity: data.severity,
          limitQuery: data.limitQuery,
          status: data.status
        };

        this.props.setQueryData(tempQueryData);

        this.setState({
          socTemplateEnable: true,
          soc: tempQueryData.soc
        });
      } else {
        tempQueryData.soc = {
          id: '',
          severity: 'Emergency',
          limitQuery: 10,
          title: '',
          eventDescription: '',
          impact: 4,
          category: 1,
          status: true
        };

        this.props.setQueryData(tempQueryData);

        this.setState({
          socTemplateEnable: false,
        });
      }
      return null;
    }).catch(err => {
      this.setState({
        socTemplateEnable: false
      });
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getQuerySOCValueById = (id) => {
    const {queryData, type} = this.props;
    const {baseUrl} = this.context;
    let tempQueryData = []

    if (type === 'open' || type === 'save') {
      tempQueryData = {...queryData};
    }

    let url = `${baseUrl}/api/soc/template?id=${id}`;
    this.ah.one({
      url,
      type: 'GET',
      contentType: 'text/plain'
    }).then(data => {
      if (data) {
        tempQueryData.soc = {
          id: data.id,
          title: data.title,
          eventDescription: data.eventDescription,
          category: data.category,
          impact: data.impact,
          severity: data.severity,
          limitQuery: data.limitQuery,
          status: data.status
        };

        this.setState({
          socTemplateEnable: true,
          soc: tempQueryData.soc
        });
      } else {
        tempQueryData.soc = {
          id: '',
          severity: 'Emergency',
          limitQuery: 10,
          title: '',
          eventDescription: '',
          impact: 4,
          category: 1,
          status: true
        };

        this.setState({
          socTemplateEnable: false
        });
      }
      return null;
    }).catch(err => {
      this.setState({
        socTemplateEnable: false
      });
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Clear error info message
   * @method
   */
  clearErrorInfo = () => {
    this.setState({
      info: ''
    });
  }
  /**
   * Set and close query menu
   * @method
   */
  handleQueryAction = () => {
    const {pattern, patternCheckbox, publicCheckbox} = this.state;
    const {page, type, filterData, queryData, queryDataPublic, markData, moduleWithSOC} = this.props;

    if (type === 'open' || type === 'publicOpen') {
      if (type === 'open') {
        let tempQueryData = {...queryData};
        tempQueryData.openFlag = true;
        tempQueryData.displayId = queryData.id;
        tempQueryData.displayName = queryData.name;

        this.props.setQueryData(tempQueryData, 'setQuery');

        if (queryData.query) {
          if (page === 'hostList') {
            this.props.setFilterData(queryData.query);
          } else {
            if (page === 'logs') {
              let formattedMarkData = [];

              _.forEach(queryData.query.search, val => {
                if (val) {
                  formattedMarkData.push({
                    data: val
                  });
                }
              })
              this.props.setMarkData(formattedMarkData);
            }
            this.props.setFilterData(queryData.query.filter);
            this.props.setNotifyEmailData([]);
          }
        }
      } else if (type === 'publicOpen') {
        let tempQueryDataPublic = {...queryDataPublic};
        tempQueryDataPublic.openFlag = true;
        tempQueryDataPublic.displayId = queryDataPublic.id;
        tempQueryDataPublic.displayName = queryDataPublic.name;

        this.props.setQueryData(tempQueryDataPublic, 'setQuery');

        if (queryDataPublic.query) {
          if (page === 'logs') {
            let formattedMarkData = [];

            _.forEach(queryDataPublic.query.search, val => {
              if (val) {
                formattedMarkData.push({
                  data: val
                });
              }
            })
            this.props.setMarkData(formattedMarkData);
          }
          this.props.setFilterData(queryDataPublic.query.filter);
        }
      }
    } else if (type === 'save' || type === 'publicSave') {
      const {baseUrl} = this.context;
      const {page, account, queryData, queryDataPublic, notifyEmailData} = this.props;
      const {newQueryName, soc, socTemplateEnable, formValidation} = this.state;
      let tempFormValidation = {...formValidation};
      let tempFilterData = [];
      let url = '';
      let queryText = {};
      let emailList = [];
      let requestData = {};
      let requestType = '';
      let validate = true;

      if (page !== 'hostList') {
        _.forEach(filterData, val => {
          if (val.query) {
            tempFilterData.push({
              condition: val.condition,
              query: val.query
            });
          }
        })

        if (_.isEmpty(tempFilterData)) { //Close Save dialog if filterData is empty
          this.props.closeDialog();
          return;
        }
      }

      if (newQueryName) { //Form validation
        if (queryData.inputName || (queryDataPublic && queryDataPublic.inputName)) {
          const specialCharTest = /[\[\]<>?]+/; //[]<> are not allowed

          if (specialCharTest.test(queryData.inputName || (queryDataPublic && queryDataPublic.inputName))) {
            tempFormValidation.queryName.valid = false;
            tempFormValidation.queryName.msg = t('txt-checkRequiredFieldType');
            validate = false;
          } else {
            tempFormValidation.queryName.valid = true;
            tempFormValidation.queryName.msg = '';
          }
        } else {
          tempFormValidation.queryName.valid = false;
          tempFormValidation.queryName.msg = t('txt-required');
          validate = false;
        }

        if (socTemplateEnable) {
          if (soc.title) {
            const specialCharTest = /[\[\]<>?]+/; //[]<> are not allowed

            if (specialCharTest.test(soc.title)) {
              tempFormValidation.title.valid = false;
              tempFormValidation.title.msg = t('txt-checkRequiredFieldType');
              validate = false;
            } else {
              tempFormValidation.title.valid = true;
              tempFormValidation.title.msg = '';
            }
          } else {
            tempFormValidation.title.valid = false;
            tempFormValidation.title.msg = t('txt-required');
            validate = false;
          }

          if (soc.eventDescription) {
            const specialCharTest = /[\[\]<>?]+/; //[]<> are not allowed

            if (specialCharTest.test(soc.eventDescription)) {
              tempFormValidation.eventDescription.valid = false;
              tempFormValidation.eventDescription.msg = t('txt-checkRequiredFieldType');
              validate = false;
            } else {
              tempFormValidation.eventDescription.valid = true;
              tempFormValidation.eventDescription.msg = '';
            }
          } else {
            tempFormValidation.eventDescription.valid = false;
            tempFormValidation.eventDescription.msg = t('txt-required');
            validate = false;
          }
        }
      }

      this.setState({
        formValidation: tempFormValidation
      });

      if (!validate) {
        return;
      }

      if (type === 'save' && page === 'logs') { //Form validation
        if (patternCheckbox) {
          if (!pattern.threshold || !_.includes(PERIOD_MIN, Number(pattern.periodMin))) {
            this.setState({
              info: t('txt-allRequired')
            });
            return;
          } else {
            this.clearErrorInfo();
          }

          if (pattern.threshold > 1000) {
            this.setState({
              info: t('events.connections.txt-threasholdMax')
            });
            return;
          } else {
            this.clearErrorInfo();
          }
        }
      }

      if (page === 'hostList') {
        url = `${baseUrl}/api/account/host/queryText`;

        Object.keys(filterData).map(val => {
          if (filterData[val].length > 0) {
            if (val === 'status' || val === 'annotation') {
              queryText.annotationObj = {
                statusArray: filterData.status,
                annotationArray: filterData.annotation
              };
            } else {
              const type = val + 'Array';
              queryText[type] = filterData[val];
            }
          }
        });
      } else if (page === 'alert') {
        url = `${baseUrl}/api/account/alert/queryText`;
        queryText = {
          filter: filterData
        };
      } else if (page === 'logs') {
        let markDataArr = [];
        url = `${baseUrl}/api/v1/account/syslog/queryText`;

        _.forEach(markData, val => {
          if (val.data) {
            markDataArr.push(val.data);
          }
        })

        queryText = {
          filter: filterData,
          search: markDataArr
        };
      } else {
        url = `${baseUrl}/api/account/event/queryText`;
        queryText = {
          filter: filterData
        };
      }

      if (newQueryName) {
        let accountId = '';
        let queryName = '';

        if (type === 'publicSave') {
          accountId = 'IsPublic';
          queryName = queryDataPublic.inputName;
        } else if (type === 'save') {
          if (page === 'alert') {
            if (publicCheckbox) {
              accountId = 'Default';
              queryName = queryData.inputName;
            } else {
              accountId = account.id;
              queryName = queryData.inputName;
            }
          } else {
            if (publicCheckbox) {
              accountId = 'IsPublic';
              queryName = queryData.inputName;
            } else {
              accountId = account.id;
              queryName = queryData.inputName;
            }
          }
        }

        requestData = {
          accountId,
          name: queryName,
          queryText
        };

        requestType = 'POST';
      } else {
        let queryId = '';
        let accountId = '';

        if (type === 'publicSave') {
          queryId = queryDataPublic.id;
          accountId = 'IsPublic';
        } else if (type === 'save') {
          if (page === 'alert') {
            if (publicCheckbox) {
              accountId = 'Default';
            } else {
              accountId = account.id;
            }
          }
          queryId = queryData.id;
          accountId = account.id;
        }

        requestData = {
          id: queryId,
          accountId,
          name: this.getQueryName(),
          queryText
        };

        if (type === 'save' && patternCheckbox) {
          if (page !== 'alert') {
            requestData.patternId = queryData.patternId;
          }
        }

        requestType = 'PATCH';
      }

      if (type === 'save' && page === 'alert') {
        requestData.emailList = notifyEmailData;
      }

      if (type === 'save' && page === 'logs') {
        requestData.aggColumn = pattern.aggColumn;

        if (patternCheckbox) {
          requestData.emailList = notifyEmailData;

          if (pattern.severity) {
            requestData.severity = pattern.severity;
          }

          if (pattern.periodMin) {
            requestData.periodMin = Number(pattern.periodMin);
          }

          if (pattern.threshold) {
            requestData.threshold = Number(pattern.threshold);
          }

          requestData.isPublic = publicCheckbox;
        } else { //Pattern script checkbox is unchecked
          requestData.emailList = [];

          this.setState({
            activePatternId: ''
          });
        }
      }

      this.ah.one({
        url,
        data: JSON.stringify(requestData),
        type: requestType,
        contentType: 'text/plain'
      })
      .then(data => {
        if (data) {
          if (moduleWithSOC && type === 'save') {
            if (requestType === 'PATCH') {
              let socRequestBody = {
                id: requestData.id,
                title: soc.title,
                eventDescription: soc.eventDescription,
                category: soc.category,
                impact: soc.impact,
                limitQuery: soc.limitQuery,
                creator: account.id
              };
              if (page === 'alert') {
                socRequestBody.severity = soc.severity;
              }
              if (page === 'logs') {
                socRequestBody.severity = pattern.severity;
              }
              if (this.state.socTemplateEnable) {
                this.ah.one({
                  url: `${baseUrl}/api/soc/template`,
                  data: JSON.stringify(socRequestBody),
                  type: 'POST',
                  contentType: 'text/plain'
                }).then(data => {
                  if (data) {

                  }
                  return null;
                }).catch(err => {
                  helper.showPopupMsg('', t('txt-error'), err.message);
                }).finally(err => {
                  helper.showPopupMsg(t('events.connections.txt-querySaved'));
                  this.props.getSavedQuery();
                  this.setState({
                    socTemplateEnable: false,
                    soc: {
                      id: '',
                      severity: 'Emergency',
                      limitQuery: 10,
                      title: '',
                      eventDescription: '',
                      impact: 4,
                      category: 1,
                      status: true
                    }
                  });
                })
              } else {
                this.ah.one({
                  url: `${baseUrl}/api/soc/template?id=${requestData.id}`,
                  type: 'DELETE',
                }).then(data => {
                  if (data) {

                  }
                  return null;
                }).catch(err => {
                  helper.showPopupMsg('', t('txt-error'), err.message);
                }).finally(err => {
                  helper.showPopupMsg(t('events.connections.txt-querySaved'));
                  this.props.getSavedQuery();
                  this.setState({
                    socTemplateEnable: false,
                    soc: {
                      id: '',
                      severity: 'Emergency',
                      limitQuery: 10,
                      title: '',
                      eventDescription: '',
                      impact: 4,
                      category: 1,
                      status: true
                    }
                  });
                })
              }
            } else {
              if (this.state.socTemplateEnable && (page === 'alert' || page === 'logs')) {
                let socRequestBody = {
                  id: data.id,
                  title: soc.title,
                  eventDescription: soc.eventDescription,
                  category: soc.category,
                  impact: soc.impact,
                  limitQuery: soc.limitQuery,
                  creator: account.id
                };

                if (page === 'alert') {
                  socRequestBody.severity = soc.severity;
                }

                if (page === 'logs') {
                  socRequestBody.severity = pattern.severity;
                }

                this.ah.one({
                  url: `${baseUrl}/api/soc/template`,
                  data: JSON.stringify(socRequestBody),
                  type: 'POST',
                  contentType: 'text/plain'
                }).then(data => {
                  if (data) {

                  }
                  return null;
                }).catch(err => {
                  helper.showPopupMsg('', t('txt-error'), err.message);
                }).finally(err => {
                  helper.showPopupMsg(t('events.connections.txt-querySaved'));
                  this.props.getSavedQuery();
                  this.setState({
                    socTemplateEnable: false,
                    soc: {
                      id: '',
                      severity: 'Emergency',
                      limitQuery: 10,
                      title: '',
                      eventDescription: '',
                      impact: 4,
                      category: 1,
                    }
                  });
                })
              }
            }
          }
          helper.showPopupMsg(t('events.connections.txt-querySaved'));
          this.props.getSavedQuery();

          this.setState({
            socTemplateEnable: false,
            soc: {
              id: '',
              severity: 'Emergency',
              limitQuery: 10,
              title: '',
              eventDescription: '',
              impact: 4,
              category: 1,
            }
          });

          this.props.setNotifyEmailData([]);

          helper.showPopupMsg(t('events.connections.txt-querySaved'));

          if (type === 'save') {
            this.props.getSavedQuery();
            this.props.setNotifyEmailData([]);
          } else if (type === 'publicSave') {
            this.props.getPublicSavedQuery();
          }
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
    this.props.closeDialog();
  }
  /**
   * Get active query name
   * @method
   * @returns matched query name
   */
  getQueryName = () => {
    const {type, queryData, queryDataPublic} = this.props;
    let queryList = '';
    let query = '';
    let queryName = '';

    if (type === 'save') {
      queryList = queryData.list;
      query = queryData;
    } else if (type === 'publicSave') {
      queryList = queryDataPublic.list;
      query = queryDataPublic;
    }

    _.forEach(queryList, val => {
      if (val.id === query.id) {
        queryName = val.name;
        return false;
      }
    })

    return queryName;
  }
  /**
   * Display delete query content
   * @method
   * @returns HTML DOM
   */
  getDeleteQueryContent = () => {
    const {type, queryData, queryDataPublic} = this.props;
    let queryName = '';

    if (type === 'open') {
      queryName = queryData.name;
    } else if (type === 'publicOpen') {
      queryName = queryDataPublic.name;
    }

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {queryName}?</span>
      </div>
    )
  }
  /**
   * Open delete query dialog
   * @method
   */
  removeQuery = () => {
    PopupDialog.prompt({
      title: t('events.connections.txt-deleteFilter'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteQueryContent(),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteFilterQuery();
        }
      }
    });
  }
  /**
   * Delete saved query and reset query data
   * @method
   */
  deleteFilterQuery = () => {
    const {baseUrl} = this.context;
    const {page, type, queryData, queryDataPublic} = this.props;
    let queryId = '';
    let url = '';

    if (type === 'open' && !queryData.id) {
      return;
    } else if (type === 'publicOpen' && !queryDataPublic.id) {
      return;
    }

    if (type === 'open') {
      queryId = queryData.id;
    } else if (type === 'publicOpen') {
      queryId = queryDataPublic.id;
    }

    if (page === 'alert') {
      url = `${baseUrl}/api/account/alert/queryText?id=${queryId}`;
    } else if (page === 'logs') {
      url = `${baseUrl}/api/v1/account/syslog/queryText?id=${queryId}`;
    } else {
      url = `${baseUrl}/api/account/event/queryText?id=${queryId}`;
    }

    this.ah.one({
      url,
      type: 'DELETE'
    })
    .then(data => {
      if (data) {
        let newQueryList = [];
        let tempQueryData = {...queryData};
        let tempQueryDataPublic = {...queryDataPublic};

        if (type === 'open') {
          _.forEach(queryData.list, val => {
            if (val.id !== queryData.id) {
              newQueryList.push(val);
            }
          })
        } else if (type === 'publicOpen') {
          _.forEach(queryDataPublic.list, val => {
            if (val.id !== queryDataPublic.id) {
              newQueryList.push(val);
            }
          })
        }

        if (newQueryList.length > 0) {
          if (type === 'open') {
            tempQueryData.id = newQueryList[0].id;
            tempQueryData.name = newQueryList[0].name;
            tempQueryData.list = newQueryList;
            tempQueryData.query = newQueryList[0].queryText;
            tempQueryData.emailList = newQueryList[0].emailList;

            if (page === 'logs') {
              tempQueryData.patternId = '';
              tempQueryData.pattern = {
                name: '',
                aggColumn: '',
                periodMin: 10,
                threshold: 1,
                severity: ''
              };

              if (newQueryList[0].patternId) {
                tempQueryData.patternId = newQueryList[0].patternId;
              }

              if (newQueryList[0].patternName) {
                tempQueryData.pattern.name = newQueryList[0].patternName;
              }

              if (newQueryList[0].aggColumn) {
                tempQueryData.pattern.name = newQueryList[0].aggColumn;
              }

              if (newQueryList[0].periodMin) {
                tempQueryData.pattern.periodMin = newQueryList[0].periodMin;
              }

              if (newQueryList[0].threshold) {
                tempQueryData.pattern.threshold = newQueryList[0].threshold;
              }

              if (newQueryList[0].severity) {
                tempQueryData.pattern.severity = newQueryList[0].severity;
              }
            }
          } else if (type === 'publicOpen') {
            tempQueryDataPublic.id = newQueryList[0].id;
            tempQueryDataPublic.name = newQueryList[0].name;
            tempQueryDataPublic.list = newQueryList;
            tempQueryDataPublic.query = newQueryList[0].queryText;
          }
        } else {
          if (type === 'open') {
            tempQueryData.id = '';
            tempQueryData.name = '';
            tempQueryData.list = [];
            tempQueryData.query = '';
          } else if (type === 'publicOpen') {
            tempQueryDataPublic.id = '';
            tempQueryDataPublic.name = '';
            tempQueryDataPublic.list = [];
            tempQueryDataPublic.query = '';
          }
        }

        if (type === 'open') {
          this.props.setQueryData(tempQueryData);
        } else if (type === 'publicOpen') {
          this.props.setQueryData(tempQueryDataPublic);
        }

        this.setQueryList(newQueryList);
      } else {
        helper.showPopupMsg('', t('txt-error'), err.message);
      }
      return null;
    });
  }
  /**
   * Display saved filter queries
   * @method
   * @param {object} value - saved query data
   * @param {number} index - index of the queryDataList array
   * @returns FilterInput component
   */
  displayFilterQuery = (value, index) => {
    const {page, logFields} = this.props;

    return (
      <FilterInput
        key={index}
        page={page}
        logFields={logFields}
        queryType='query'
        filterData={[{
          condition: value.condition,
          query: value.query
        }]}
        inline={false} />
    )
  }
  /**
   * Display individual form
   * @method
   * @param {string} queryDataList - query data
   * @param {string} key - key of the query data
   * @param {number} i - index of the query data
   * @returns HTML DOM
   */
  displayHostQuery = (queryDataList, key, i) => {
    const type = key.replace('Array', '');
    let label = '';
    let value = '';

    if (type === 'annotationObj') {
      if (queryDataList[key].statusArray.length > 0) {
        label = t('ipFields.status');
        value = queryDataList[key].statusArray.join(', ');
      }

      if (queryDataList[key].annotationArray.length > 0) {
        label = t('ipFields.annotation');
        value = queryDataList[key].annotationArray.join(', ');
      }
    } else {
      if (queryDataList[key].length > 0) {
        label = t('ipFields.' + type);
        value = queryDataList[key].join(', ');
      }
    }

    if (value) {
      return (
        <div key={i} className='group'>
          <TextField
            name={type}
            label={label}
            variant='outlined'
            fullWidth
            size='small'
            value={value}
            disabled={true} />
        </div>
      )
    }
  }
  /**
   * Display saved mark
   * @method
   * @param {object} value - saved mark data
   * @param {number} index - index of the queryDataMark array
   * @returns MarkInput component
   */
  displayMarkSearch = (value, index) => {
    const {page, logFields} = this.props;

    return (
      <MarkInput
        key={index}
        page={page}
        logFields={logFields}
        queryType='query'
        markData={[{
          data: value
        }]}
        inline={false} />
    )
  }
  /**
   * Set query data for new selected saved query
   * @method
   * @param {string} fieldType - input type ('id' or 'name')
   * @param {object} event - event object
   */
  handleQueryChange = (fieldType, event, comboValue) => {
    const {page, type, queryData, queryDataPublic} = this.props;
    const {queryList, activeQuery, newQueryName, pattern} = this.state;
    let tempQueryData = {...queryData};
    let tempQueryDataPublic = {...queryDataPublic};
    let value = event.target.value;
    let queryName = '';

    if (fieldType === 'id') {
      if (type === 'open' || type === 'save') {
        let tempPattern = {...pattern};
        let patternCheckbox = false;
        let publicCheckbox = false;
        tempQueryData.id = value;
        tempQueryData.openFlag = true;
        tempQueryData.query = {}; //Reset data to empty
        tempQueryData.patternId = '';
        tempQueryData.pattern = {
          name: '',
          aggColumn: '',
          periodMin: 10,
          threshold: 1,
          severity: ''
        };

        tempQueryData.soc = {
          severity: 'Emergency',
          limitQuery: 10,
          title: '',
          eventDescription: '',
          impact: 4,
          category: 1,
          id: '',
          status: true
        }

        tempQueryData.emailList = [];

        if (comboValue && comboValue.value) {
          const selectedQueryIndex = _.findIndex(queryList, { 'value': comboValue.value });
          value = comboValue.value;
          tempQueryData.id = comboValue.value;

          this.setState({
            activeQuery: queryList[selectedQueryIndex]
          }, () => {
            this.getQuerySOCValueById(tempQueryData.id);
          });
        }

        _.forEach(queryData.list, val => {
          if (val.id === value) {
            let formattedQueryText = [];
            tempQueryData.name = val.name;

            if (page === 'hostList') {
              tempQueryData.query = val.queryText;
            } else {
              _.forEach(val.queryText.filter, val => {
                let formattedValue = val.condition.toLowerCase();
                formattedValue = formattedValue.replace(' ', '_');

                formattedQueryText.push({
                  condition: formattedValue,
                  query: val.query
                });
              })

              tempQueryData.query.filter = formattedQueryText;

              if (page === 'logs') {
                tempQueryData.query.search = val.queryText.search;
              }

              if (val.patternId) {
                tempQueryData.patternId = val.patternId;
              }

              if (val.patternName) {
                tempQueryData.pattern.name = val.patternName;
                tempPattern.name = val.patternName;
              }

              if (val.aggColumn) {
                tempQueryData.pattern.aggColumn = val.aggColumn;
                tempPattern.aggColumn = val.aggColumn;
              }

              if (val.periodMin) {
                tempQueryData.pattern.periodMin = val.periodMin;
                tempPattern.periodMin = val.periodMin;
              }

              if (val.threshold) {
                tempQueryData.pattern.threshold = val.threshold;
                tempPattern.threshold = val.threshold;
              }

              if (val.severity) {
                tempQueryData.pattern.severity = val.severity;
                tempPattern.severity = val.severity;
                patternCheckbox = true;
              }

              if (val.isPublic) {
                publicCheckbox = true;
              }
            }

            if (val.emailList.length > 0) {
              tempQueryData.emailList = val.emailList;
              this.props.setNotifyEmailData(val.emailList);
            } else {
              this.props.setNotifyEmailData([]);
            }
            return false;
          }
        })
        this.props.setQueryData(tempQueryData);

        if (page !== 'hostList') {
          this.setState({
            pattern: tempPattern,
            patternCheckbox,
            publicCheckbox
          }, () => {
            this.getQuerySOCValueById(tempQueryData.id);
          });
        }
      } else if (type === 'publicOpen' || type === 'publicSave') {
        tempQueryDataPublic.id = value;
        tempQueryDataPublic.openFlag = true;
        tempQueryDataPublic.query = {}; //Reset data to empty
        tempQueryData.emailList = [];

        if (comboValue && comboValue.value) {
          const selectedQueryIndex = _.findIndex(queryList, { 'value': comboValue.value });
          value = comboValue.value;
          tempQueryDataPublic.id = comboValue.value;

          this.setState({
            activeQuery: queryList[selectedQueryIndex]
          });
        }

        _.forEach(queryDataPublic.list, val => {
          if (val.id === value) {
            let formattedQueryText = [];
            tempQueryDataPublic.name = val.name;

            _.forEach(val.queryText.filter, val => {
              let formattedValue = val.condition.toLowerCase();
              formattedValue = formattedValue.replace(' ', '_');

              formattedQueryText.push({
                condition: formattedValue,
                query: val.query
              });
            })

            tempQueryDataPublic.query.filter = formattedQueryText;

            if (page === 'logs') {
              tempQueryDataPublic.query.search = val.queryText.search;
            }
            return false;
          }
        })
        this.props.setQueryData(tempQueryDataPublic);
      }

      if (value === 'new') {
        queryName = true;
        this.props.setNotifyEmailData([]);
      } else {
        queryName = false;
      }

      this.setState({
        dialogOpenType: 'change'
      });

    } else if (fieldType === 'name') {
      queryName = newQueryName;

      if (type === 'open' || type === 'save') {
        tempQueryData.inputName = value;
        this.props.setQueryData(tempQueryData);
      } else if (type === 'publicOpen' || type === 'publicSave') {
        tempQueryDataPublic.inputName = value;
        this.props.setQueryData(tempQueryDataPublic);
      }
    }

    this.clearErrorInfo();

    this.setState({
      newQueryName: queryName
    });
  }
  /**
   * Handle Pattern edit input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempPattern = {...this.state.pattern};
    let tempSoc = {...this.state.soc};
    tempPattern[event.target.name] = event.target.value;

    if (event.target.name === 'severity') {
      if (event.target.value === 'Emergency') {
        tempSoc['impact'] = 4;
      } else if (event.target.value === 'Alert') {
        tempSoc['impact'] = 3;
      } else if (event.target.value === 'Notice') {
        tempSoc['impact'] = 1;
      } else if (event.target.value === 'Warning') {
        tempSoc['impact'] = 2;
      } else if (event.target.value === 'Critical') {
        tempSoc['impact'] = 3;
      }
    }

    this.setState({
      pattern: tempPattern,
      soc: tempSoc
    });
  }
  handleSeverityWithSOCChange = (event) => {
    let tempData = {...this.state.soc};
    tempData[event.target.name] = event.target.value;

    if (event.target.name === 'category' && (event.target.value === 0 || event.target.value === 9)) {
      return;
    }

    if (event.target.name === 'severity') {
      if (event.target.value === 'Emergency') {
        tempData['impact'] = 4;
      } else if (event.target.value === 'Alert') {
        tempData['impact'] = 3;
      } else if (event.target.value === 'Notice') {
        tempData['impact'] = 1;
      } else if (event.target.value === 'Warning') {
        tempData['impact'] = 2;
      } else if (event.target.value === 'Critical') {
        tempData['impact'] = 3;
      }
    }

    this.setState({
      soc: tempData
    });
  }
  /**
   * Toggle pattern checkbox
   * @method
   */
  togglePatternCheckbox = () => {
    this.setState({
      patternCheckbox: !this.state.patternCheckbox
    });

    if (!this.state.patternCheckbox) {
      this.setState({
        soc: {
          id: '',
          severity: 'Emergency',
          limitQuery: 10,
          title: '',
          eventDescription: '',
          impact: 4,
          category: 1,
          status: true
        },
        socTemplateEnable: false
      });
    }
  }
  /**
   * Toggle public checkbox
   * @method
   */
  togglePublicCheckbox = () => {
    this.setState({
      publicCheckbox: !this.state.publicCheckbox
    });

    if (!this.state.patternCheckbox && !this.state.publicCheckbox) {
      this.setState({
        soc: {
          id: '',
          severity: 'Emergency',
          limitQuery: 10,
          title: '',
          eventDescription: '',
          impact: 4,
          category: 1,
          status: true
        },
        socTemplateEnable: false
      })
    }
  }
  /**
   * Toggle pattern checkbox
   * @method
   */
  toggleSOCSwitch = () => {
    this.setState({
      socTemplateEnable: !this.state.socTemplateEnable,
      publicCheckbox: !this.state.publicCheckbox
    });
  }
  toggleSOCSwitchFromLog = () => {
    this.setState({
      socTemplateEnable: !this.state.socTemplateEnable,
    });
  }
  /**
   * Handle email delete
   * @method
   * @param {function} removeEmail - function to remove email
   * @param {number} index - index of the emails list array
   */
  deleteEmail = (removeEmail, index) => {
    removeEmail(index);
  }
  /**
   * Handle email delete
   * @method
   * @param {string} email - individual email
   * @param {number} index - index of the emails list array
   * @param {function} removeEmail - function to remove email
   * @returns HTML DOM
   */
  getLabel = (email, index, removeEmail) => {
    return (
      <div data-tag key={index}>
        {email}
        <span data-tag-handle onClick={this.deleteEmail.bind(this, removeEmail, index)}> <span className='font-bold'>x</span></span>
      </div>
    )
  }
  /**
   * Display individual email
   * @method
   * @param {string} val - email value
   * @param {string} i - index of the emails array
   * @returns HTML DOM
   */
  displayEmail = (val, i) => {
    return <span key={i}>{val}</span>
  }
  /**
   * Display React Email input
   * @method
   * @returns HTML DOM
   */
  displayEmailInput = () => {
    const {page, notifyEmailData} = this.props;
    const {patternCheckbox} = this.state;

    return (
      <div>
        <label>{t('notifications.txt-notifyEmail')}</label>
        {(page === 'hostList' || page === 'alert' || (page === 'logs' && patternCheckbox)) &&
          <ReactMultiEmail
            id='reactMultiEmail'
            emails={notifyEmailData}
            onChange={this.props.setNotifyEmailData}
            getLabel={this.getLabel} />
        }
        {page === 'logs' && !patternCheckbox &&
          <TextField
            className='email-disabled'
            variant='outlined'
            fullWidth
            size='small'
            value=''
            disabled />
        }
      </div>
    )
  }
  /**
   * Get query alert content
   * @method
   * @param {string} type - query dialog type ('open' or 'save')
   * @returns HTML DOM
   */
  getQueryAlertContent = (type) => {
    const {queryData, moduleWithSOC} = this.props;
    const {pattern, severityList, periodMinList, patternCheckbox, publicCheckbox, dialogOpenType} = this.state;
    let severityType = '';
    let patternCheckboxChecked = '';
    let patternCheckboxDisabled = '';
    let publicCheckboxChecked = '';
    let disabledStatus = '';

    if (type === 'open') {
      severityType = queryData.pattern.severity;
      patternCheckboxChecked = true;
      patternCheckboxDisabled = true;
      publicCheckboxChecked = dialogOpenType === 'change' ? publicCheckbox : queryData.isPublic;
      disabledStatus = true;
    } else if (type === 'save') {
      severityType = pattern.severity;
      patternCheckboxChecked = patternCheckbox;
      patternCheckboxDisabled = false;
      publicCheckboxChecked = publicCheckbox;
      disabledStatus = !patternCheckbox;
    }

    return (
      <div>
        <FormControlLabel
          label={t('events.connections.txt-addPatternScript')}
          control={
            <Checkbox
              id='patternCheckbox'
              className='checkbox-ui'
              checked={patternCheckboxChecked}
              onChange={this.togglePatternCheckbox}
              color='primary' />
          }
          disabled={patternCheckboxDisabled} />
        <div className='group severity-section'>
          <div className='top-group'>
            <div className='severity-level'>
              <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[severityType]}}></i>
              <TextField
                className='severity-dropdown'
                name='severity'
                select
                label={f('syslogPatternTableFields.severity')}
                variant='outlined'
                size='small'
                value={severityType}
                onChange={this.handleDataChange}
                disabled={disabledStatus}>
                {severityList}
              </TextField>
              <TextField
                className='add-column'
                name='aggColumn'
                label={t('events.connections.txt-addColumn')}
                variant='outlined'
                fullWidth
                size='small'
                value={pattern.aggColumn}
                onChange={this.handleDataChange}
                disabled={disabledStatus} />
            </div>
            <FormControlLabel
              label={t('events.connections.txt-public')}
              control={
                <Checkbox
                  id='publicCheckbox'
                  className='checkbox-ui public-checkbox'
                  checked={publicCheckboxChecked}
                  onChange={this.togglePublicCheckbox}
                  color='primary' />
              }
              disabled={disabledStatus} />
          </div>
          <div className='period'>
            <span className='support-text'>{t('events.connections.txt-patternQuery1')}</span>
            <TextField
              name='periodMin'
              select
              variant='outlined'
              size='small'
              required
              value={pattern.periodMin}
              onChange={this.handleDataChange}
              disabled={disabledStatus}>
              {periodMinList}
            </TextField>
            <span className='support-text'>{t('events.connections.txt-patternQuery2')}</span>
            <TextField
              id='threshold'
              className='number'
              name='threshold'
              type='number'
              variant='outlined'
              size='small'
              InputProps={{inputProps: { min: 1, max: 1000 }}}
              value={pattern.threshold}
              onChange={this.handleDataChange}
              disabled={disabledStatus} />
            <span className='support-text'> {t('events.connections.txt-patternQuery3')}</span>
          </div>
          {type === 'open' && queryData.emailList.length > 0 &&
            <div>
              <label>{t('notifications.txt-notifyEmail')}</label>
              <div className='flex-item'>{queryData.emailList.map(this.displayEmail)}</div>
            </div>
          }
          {type === 'save' &&
            this.displayEmailInput()
          }
        </div>
      </div>
    )
  }
  getQueryWithSOC = (type) => {
    const {queryData} = this.props;
    const {soc, severityList, socTemplateEnable, pattern, formValidation} = this.state;
    let severityType = '';
    let tempSocTemplateEnable = socTemplateEnable;
    let patternCheckboxDisabled = '';

    if (type === 'open') {
      if (queryData.soc) {
        severityType = queryData.soc.severity;
        patternCheckboxDisabled = true;

        if (queryData.soc.id) {
          if (queryData.soc.id !== '') {
            tempSocTemplateEnable = true;
          }
        }
      } else {
        severityType = 'Emergency';
        patternCheckboxDisabled = false;
      }
    } else if (type === 'save') {
      severityType = 'Emergency';
      patternCheckboxDisabled = false;
      severityType = soc.severity;
    } else {
      patternCheckboxDisabled = true;
    }

    return (
        <div>
          <FormControlLabel
            label={t('events.connections.txt-addSOCScript')}
            control={
            <Switch
              checked={tempSocTemplateEnable}
              onChange={this.toggleSOCSwitch}
              color='primary' />
            }
            disabled={patternCheckboxDisabled} />
          {tempSocTemplateEnable &&
            <div className='group severity-section'>
              <div className='top-group'>
                <div className='severity-level'>
                  <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[severityType]}}/>
                  <TextField
                    className='severity-dropdown'
                    name='severity'
                    select
                    label={f('syslogPatternTableFields.severity')}
                    variant='outlined'
                    size='small'
                    value={severityType}
                    onChange={this.handleSeverityWithSOCChange}
                    disabled={patternCheckboxDisabled}>
                    {severityList}
                  </TextField>
                </div>
                <TextField
                  style={{width: '22%'}}
                  id='impact'
                  name='impact'
                  variant='outlined'
                  fullWidth={true}
                  size='small'
                  onChange={this.handleSeverityWithSOCChange}
                  required
                  select
                  label={f('incidentFields.impactAssessment')}
                  value={soc.impact}
                  disabled={true}>
                  {
                    _.map(_.range(1, 5), el => {
                      return <MenuItem value={el}>{`${el} (${(9 - 2 * el)} ${it('txt-day')})`}</MenuItem>
                    })
                  }
                </TextField>
              </div>
              <div className='top-group' >
                <TextField
                  style={{width: '100%'}}
                  id='category'
                  name='category'
                  variant='outlined'
                  fullWidth={true}
                  size='small'
                  onChange={this.handleSeverityWithSOCChange}
                  required
                  select
                  label={f('incidentFields.category')}
                  value={soc.category}
                  disabled={patternCheckboxDisabled}>
                  {
                    _.map(_.range(0, 20), el => {
                      return <MenuItem value={el}>{it(`category.${el}`)}</MenuItem>
                    })
                  }
                </TextField>
              </div>
              <div className='top-group' >
                <FormControlLabel
                  style={{width: '100%'}}
                  label={t('events.connections.txt-enableSOCScript')}
                  className='soc-script'
                  control={
                    <Switch
                      checked={soc.status}
                      color='primary' />
                  }
                  disabled={true} />
              </div>
              <div className='period'>
                <span className='support-text'>{t('events.connections.txt-socQuery1')}</span>
                <TextField
                  style={{width: '40%'}}
                  name='limitQuery'
                  variant='outlined'
                  size='small'
                  required
                  value={soc.limitQuery}
                  onChange={this.handleSeverityWithSOCChange}
                  disabled={true}>
                </TextField>
                <span className='support-text'>{t('events.connections.txt-socQuery2')}</span>
              </div>
              <div className='top-group' style={{width: '100%'}}>
                <TextField
                  style={{width: '100%'}}
                  name='title'
                  variant='outlined'
                  size='small'
                  required
                  label={f('incidentFields.title')}
                  error={!formValidation.title.valid}
                  helperText={formValidation.title.msg}
                  value={soc.title}
                  onChange={this.handleSeverityWithSOCChange}
                  disabled={patternCheckboxDisabled}>
                </TextField>
              </div>
              <div className='top-group'  style={{width: '100%'}}>
                <TextField
                  style={{width: '100%'}}
                  name='eventDescription'
                  variant='outlined'
                  size='small'
                  required
                  label={f('incidentFields.rule')}
                  value={soc.eventDescription}
                  error={!formValidation.eventDescription.valid}
                  helperText={formValidation.eventDescription.msg}
                  onChange={this.handleSeverityWithSOCChange}
                  disabled={patternCheckboxDisabled}>
                </TextField>
              </div>
            </div>
          }
        </div>
    )
  }
  getQueryWithSOCByLog = (type) => {
    const {queryData} = this.props;
    const {soc, socTemplateEnable, pattern, formValidation} = this.state;
    let tempPattern = {...pattern};
    let tempSocTemplateEnable = socTemplateEnable;
    let disabledStatus = true;

    if (type === 'open') {
      disabledStatus = true;

      if (queryData.soc) {
        if (queryData.soc.id) {
          if (queryData.soc.id !== '') {
            tempSocTemplateEnable = true;
          }
        }
      }
    } else if (type === 'save') {
      if (this.state.patternCheckbox && this.state.publicCheckbox) {
        disabledStatus  = false;
      }
    }

    return (
      <div>
        <FormControlLabel
          label={t('events.connections.txt-addSOCScript')}
          control={
            <Switch
              checked={tempSocTemplateEnable}
              onChange={this.toggleSOCSwitchFromLog}
              color='primary' />
          }
          disabled={disabledStatus} />

        {tempSocTemplateEnable &&
        <div className='group severity-section'>
          <div className='top-group'>
            <div className='severity-level' style={{width: '63%'}}>
              <TextField
                className='severity-dropdown'
                id='category'
                name='category'
                variant='outlined'
                fullWidth={true}
                size='small'
                onChange={this.handleSeverityWithSOCChange}
                required
                select
                label={f('incidentFields.category')}
                value={soc.category}
                disabled={disabledStatus}>
                {
                  _.map(_.range(0, 20), el => {
                    return <MenuItem value={el}>{it(`category.${el}`)}</MenuItem>
                  })
                }
              </TextField>
            </div>
            <TextField
              style={{width: '30%'}}
              id='impact'
              name='impact'
              variant='outlined'
              fullWidth={true}
              size='small'
              onChange={this.handleSeverityWithSOCChange}
              required
              select
              label={f('incidentFields.impactAssessment')}
              value={soc.impact}
              disabled={true}>
              {
                _.map(_.range(1, 5), el => {
                  return <MenuItem value={el}>{`${el} (${(9 - 2 * el)} ${it('txt-day')})`}</MenuItem>
                })
              }
            </TextField>
          </div>
          <div className='period'>
            <span className='support-text'>{t('events.connections.txt-socQuery1')}</span>
            <TextField
              style={{width: '40%'}}
              name='limitQuery'
              variant='outlined'
              size='small'
              required
              value={soc.limitQuery}
              onChange={this.handleSeverityWithSOCChange}
              disabled={true}>
            </TextField>
            <span className='support-text'>{t('events.connections.txt-socQuery2')}</span>
          </div>
          <div className='top-group' style={{width: '100%'}}>
            <FormControlLabel
              style={{width: '100%'}}
              label={t('events.connections.txt-enableSOCScript')}
              control={
                <Switch
                  checked={soc.status}
                  color='primary' />
              }
              disabled={true} />
          </div>
          <div className='top-group' style={{width: '100%'}}>
            <TextField
              style={{width: '100%'}}
              name='title'
              variant='outlined'
              size='small'
              required
              label={f('incidentFields.title')}
              value={soc.title}
              error={!formValidation.title.valid}
              helperText={formValidation.title.msg}
              onChange={this.handleSeverityWithSOCChange}
              disabled={disabledStatus}>
            </TextField>
          </div>
          <div className='top-group' style={{width: '100%'}}>
            <TextField
              style={{width: '100%'}}
              name='eventDescription'
              variant='outlined'
              size='small'
              required
              label={f('incidentFields.rule')}
              value={soc.eventDescription}
              error={!formValidation.eventDescription.valid}
              helperText={formValidation.eventDescription.msg}
              onChange={this.handleSeverityWithSOCChange}
              disabled={disabledStatus}>
            </TextField>
          </div>
        </div>
        }
      </div>
    )
  }
  /**
   * Display query list
   * @method
   * @param {object} params - parameters for Autocomplete
   * @returns TextField component
   */
  renderQueryList = (params) => {
    return (
      <TextField
        {...params}
        label={t('events.connections.txt-queryName')}
        variant='outlined'
        size='small' />
    )
  }
  /**
   * Get filter group background color
   * @method
   * @param {string} type - query type ('filter' or 'mark')
   * @param {object} queryDataList - query data list
   * @returns CSS property object
   */
  getQueryColor = (type, queryDataList) => {
    if (!queryDataList || (queryDataList && queryDataList.length === 0) || _.isEmpty(queryDataList)) {
      if (type === 'filter') {
        return { visibility: 'hidden' };
      } else if (type === 'mark') {
        return { display: 'none' };
      }
    }
  }
  /**
   * Get delete btn disabled status
   * @method
   * @returns boolean true/false
   */
  deleteBtnDisabled = () => {
    const {type, queryData, queryDataPublic} = this.props;

    if (type === 'open') {
      return queryData.displayId === queryData.id;
    } else if (type === 'publicOpen') {
      return queryDataPublic.displayId === queryDataPublic.id;
    }
  }
  /**
   * Display query menu content
   * @method
   * @param {string} type - query type ('open', 'save', 'publicOpen' or 'publicSave')
   * @returns HTML DOM
   */
  displayQueryContent = (type) => {
    const {locale, sessionRights} = this.context;
    const {page, queryData, queryDataPublic, filterData, markData, moduleWithSOC} = this.props;
    const {queryList, activeQuery, formValidation} = this.state;
    let displayQueryList = [];
    let tempFilterData = [];
    let tempMarkData = [];

    if (type === 'open' || type === 'publicOpen') {
      let queryDataList = [];
      let queryDataMark = [];

      if (type === 'open') {
        displayQueryList = _.map(queryData.list, (val, i) => {
          return <MenuItem key={i} value={val.id}>{val.name}</MenuItem>
        });

        if (page === 'logs' && !_.isEmpty(queryData.query)) {
          queryDataList = queryData.query.filter;
          queryDataMark = queryData.query.search;
        } else {
          if (page === 'hostList') {
            queryDataList = queryData.query;
          } else {
            queryDataList = queryData.query.filter;
          }
        }
      } else if (type === 'publicOpen') {
        displayQueryList = _.map(queryDataPublic.list, (val, i) => {
          return <MenuItem key={i} value={val.id}>{val.name}</MenuItem>
        });

        if (page === 'logs' && !_.isEmpty(queryDataPublic.query)) {
          queryDataList = queryDataPublic.query.filter;
          queryDataMark = queryDataPublic.query.search;
        } else {
          queryDataList = queryDataPublic.query.filter;
        }
      }

      return (
        <div>
          <Autocomplete
            className='combo-box query-name dropdown'
            options={queryList}
            value={activeQuery}
            getOptionLabel={(option) => option.text}
            renderInput={this.renderQueryList}
            onChange={this.handleQueryChange.bind(this, 'id')} />

          <div className='filter-group' style={this.getQueryColor('filter', queryDataList)}>
            {page === 'hostList' && queryDataList &&
              Object.keys(queryDataList).map(this.displayHostQuery.bind(this, queryDataList))
            }
            {page !== 'hostList' && queryDataList && queryDataList.length > 0 &&
              queryDataList.map(this.displayFilterQuery)
            }
          </div>

          <div className='filter-group' style={this.getQueryColor('mark', queryDataMark)}>
            {queryDataMark && queryDataMark.length > 0 &&
              queryDataMark.map(this.displayMarkSearch)
            }
          </div>

          {page === 'alert' && queryData.emailList.length > 0 && type === 'open' &&
            <div className='email-list'>
              <label>{t('notifications.txt-notifyEmail')}</label>
              <div className='flex-item'>{queryData.emailList.map(this.displayEmail)}</div>
            </div>
          }

          {type === 'open' && page === 'logs' && queryData.patternId &&
            this.getQueryAlertContent(type)
          }

          {page === 'logs' && queryData.patternId && moduleWithSOC && type === 'open' &&
            this.getQueryWithSOCByLog(type)
          }

          {page === 'alert' && moduleWithSOC && type === 'open' &&
            this.getQueryWithSOC(type)
          }

          {type === 'open' && !this.deleteBtnDisabled() &&
            <Button id='deleteQueryBtn' variant='outlined' color='primary' className='standard delete-query' onClick={this.removeQuery}>{t('txt-delete')}</Button>
          }

          {type === 'publicOpen' && sessionRights.Module_Config && !this.deleteBtnDisabled() &&
            <Button id='deleteQueryBtn' variant='outlined' color='primary' className='standard delete-query' onClick={this.removeQuery}>{t('txt-delete')}</Button>
          }
        </div>
      )
    } else if (type === 'save' || type === 'publicSave') {
      let dropDownValue = 'new';
      let textFieldValue = '';
      let hostFilterEmpty = true;

      if (page === 'hostList') {
        _.forEach(filterData, (val, key) => {
          if (val.length > 0) {
            hostFilterEmpty = false;
            return false;
          }
        })
      } else {
        _.forEach(filterData, val => {
          if (val.query) {
            tempFilterData.push({
              condition: val.condition,
              query: val.query
            });
          }
        })
      }

      if (type === 'save') {
        displayQueryList = _.map(queryData.list, (val, i) => {
          return <MenuItem key={i} value={val.id}>{val.name}</MenuItem>
        });

        _.forEach(markData, val => {
          if (val.data) {
            tempMarkData.push({
              data: val.data
            });
          }
        })

        if (queryData.openFlag) {
          dropDownValue = queryData.id;
        }
        textFieldValue = queryData.inputName;
      } else if (type === 'publicSave') {
        displayQueryList = _.map(queryDataPublic.list, (val, i) => {
          return <MenuItem key={i} value={val.id}>{val.name}</MenuItem>
        });

        _.forEach(markData, val => {
          if (val.data) {
            tempMarkData.push({
              data: val.data
            });
          }
        })

        if (queryDataPublic.openFlag) {
          dropDownValue = queryDataPublic.id;
        }
        textFieldValue = queryDataPublic.inputName;
      }

      return (
        <div>
          <div className='query-options'>
            <TextField
              id='queryOptionsDropdown'
              className='query-name dropdown'
              select
              label={t('events.connections.txt-queryName')}
              variant='outlined'
              fullWidth
              size='small'
              required
              value={dropDownValue}
              onChange={this.handleQueryChange.bind(this, 'id')}>
              <MenuItem value='new'>{t('events.connections.txt-addQuery')}</MenuItem>
              {displayQueryList}
            </TextField>

            {dropDownValue === 'new' &&
              <TextField
                id='queryOptionsInput'
                className='query-name'
                label={t('txt-plsEnterName')}
                variant='outlined'
                size='small'
                maxLength={50}
                required
                error={!formValidation.queryName.valid}
                helperText={formValidation.queryName.msg}
                value={textFieldValue}
                onChange={this.handleQueryChange.bind(this, 'name')} />
            }
          </div>

          {page === 'hostList' && !hostFilterEmpty &&
            <div className='filter-group'>
              {Object.keys(filterData).map(this.displayHostQuery.bind(this, filterData))}
            </div>
          }

          {page !== 'hostList' && tempFilterData.length > 0 &&
            <div className='filter-group'>
              {tempFilterData.map(this.displayFilterQuery)}
            </div>
          }

          {(type === 'save'|| type === 'publicSave') && tempMarkData.length > 0 &&
            <div className='filter-group'>
              {tempMarkData.map(this.displayMarkSearch)}
            </div>
          }

          {type === 'save' && page === 'alert' &&
            this.displayEmailInput()
          }

          {type === 'save' && page === 'logs' &&
            this.getQueryAlertContent(type)
          }

          {page === 'logs' && moduleWithSOC  && type === 'save' &&
            this.getQueryWithSOCByLog(type)
          }

          {page === 'alert' && moduleWithSOC && type === 'save' &&
            this.getQueryWithSOC(type)
          }
        </div>
      )
    }
  }
  render() {
    const {page, type, queryData, queryDataPublic, filterData} = this.props;
    const titleText = t(`events.connections.txt-${type}Query`);
    let actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.handleQueryAction}
    };
    let displayContent = this.displayQueryContent(type);

    if (type === 'open' && queryData.list.length === 0) {
      actions = {
        cancel: {text: t('txt-close'), handler: this.props.closeDialog}
      };
      displayContent = <div className='error-msg'>{t('events.connections.txt-noSavedQuery')}</div>;
    }

    if (type === 'publicOpen' && queryDataPublic.list.length === 0) {
      actions = {
        cancel: {text: t('txt-close'), handler: this.props.closeDialog}
      };
      displayContent = <div className='error-msg'>{t('events.connections.txt-noSavedQuery')}</div>;
    }

    if (type === 'save' || type === 'publicSave') {
      let showEmptyQeuryMsg = false;

      if (page === 'hostList') {
        let filterEmpty = true;

        _.forEach(filterData, (val, key) => {
          if (val.length > 0) {
            filterEmpty = false;
            return false;
          }
        })

        if (filterEmpty) {
          showEmptyQeuryMsg = true;
        }
      } else {
        if (filterData.length === 0 || filterData[0].query === '') {
          showEmptyQeuryMsg = true;
        }
      }

      if (showEmptyQeuryMsg) {
        actions = {
          cancel: {text: t('txt-close'), handler: this.props.closeDialog}
        };
        displayContent = <div className='error-msg'>{t('events.connections.txt-noOpenQuery')}</div>;   
      }
    }

    return (
      <ModalDialog
        id='queryDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        info={this.state.info}
        closeAction='cancel'>
        {displayContent}
      </ModalDialog>
    )
  }
}

QueryOpenSave.contextType = BaseDataContext;

QueryOpenSave.propTypes = {
  page: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired,
  filterData: PropTypes.array.isRequired,
  setFilterData: PropTypes.func.isRequired,
  setQueryData: PropTypes.func.isRequired,
  getSavedQuery: PropTypes.func.isRequired,
  getPublicSavedQuery: PropTypes.func.isRequired,
  closeDialog: PropTypes.func.isRequired
};

export default QueryOpenSave;