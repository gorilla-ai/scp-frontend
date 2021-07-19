import React, {Component} from 'react'
import PropTypes from 'prop-types'

import {ReactMultiEmail} from 'react-multi-email'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from './context'
import FilterInput from './filter-input'
import helper from './helper'
import MarkInput from './mark-input'
import Switch from "@material-ui/core/Switch";
import {getInstance} from 'react-ui/build/src/utils/ajax-helper'
import _ from "lodash";

let t = null;
let f = null;
let et = null;
let it = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};
const PERIOD_MIN = [10, 15, 30, 60];

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
        periodMin: 10,
        threshold: 1,
        severity: 'Emergency'
      },
      soc:{
        id:'',
        severity: 'Emergency',
        limitQuery: 10,
        title: '',
        eventDescription:'',
        impact: 4,
        category: 1,
      },
      activePatternId: '',
      patternCheckbox: false,
      publicCheckbox: false,
      socTemplateEnable:false,

      dialogOpenType: '',
      info: '',
      formValidation: {
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
      }
    };

    it = global.chewbaccaI18n.getFixedT(null, "incident");
    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.setQueryList();
    this.setSeverityList();
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

  getQuerySOCValue = (activeQuery) => {
    const {queryData, queryDataPublic, type} = this.props;
    // const {activeQuery} = this.state;
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
          limitQuery: data.limitQuery
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
        };

        this.props.setQueryData(tempQueryData);

        this.setState({
          socTemplateEnable: false,
          soc: tempQueryData.soc
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
    const {activeTab, type, filterData, queryData, queryDataPublic, markData} = this.props;

    if (type === 'open' || type === 'publicOpen') {
      if (type === 'open') {
        let tempQueryData = {...queryData};
        tempQueryData.openFlag = true;
        tempQueryData.displayId = queryData.id;
        tempQueryData.displayName = queryData.name;

        this.props.setQueryData(tempQueryData, 'setQuery');

        if (queryData.query) {
          if (activeTab === 'logs') {
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
      } else if (type === 'publicOpen') {
        let tempQueryDataPublic = {...queryDataPublic};
        tempQueryDataPublic.openFlag = true;
        tempQueryDataPublic.displayId = queryDataPublic.id;
        tempQueryDataPublic.displayName = queryDataPublic.name;

        this.props.setQueryData(tempQueryDataPublic, 'setQuery');

        if (queryDataPublic.query) {
          this.props.setFilterData(queryDataPublic.query.filter);
        }
      }
    } else if (type === 'save' || type === 'publicSave') {
      const {baseUrl} = this.context;
      const {account, queryData, queryDataPublic, notifyEmailData} = this.props;
      const {newQueryName, formValidation, soc} = this.state;
      let tempFormValidation = {...formValidation};
      let tempFilterData = [];
      let url = '';
      let queryText = {};
      let emailList = [];
      let requestData = {};
      let requestType = '';
      let validate = true;

      _.forEach(filterData, val => {
        if (val.query) {
          tempFilterData.push({
            condition: val.condition,
            query: val.query.trim()
          });
        }
      })

      if (_.isEmpty(tempFilterData)) { //Close Save dialog if filterData is empty
        this.props.closeDialog();
        return;
      }


      if (newQueryName) { //Form validation
        if (queryData.inputName || queryDataPublic.inputName) {
          const specialCharTest = /[\[\]<>?]+/; //[]<> are not allowed

          if (specialCharTest.test(queryData.inputName || queryDataPublic.inputName)) {
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

        if (this.state.socTemplateEnable){
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

      if (type === 'save' && activeTab === 'logs') { //Form validation
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

      if (activeTab === 'alert') {
        url = `${baseUrl}/api/account/alert/queryText`;
        queryText = {
          filter: filterData
        };
      }
      else if (activeTab === 'logs') {
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
      }
      else {
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
          if (activeTab === 'alert') {
            if (publicCheckbox){
              accountId = 'Default';
              queryName = queryData.inputName;
            }else{
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
          if (activeTab === 'alert') {
            if (publicCheckbox){
              accountId = 'Default';
            }else{
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
          if (activeTab === 'alert') {

          }else{
            requestData.patternId = queryData.patternId;
          }
        }

        requestType = 'PATCH';
      }

      if (type === 'save' && activeTab === 'alert') {
        requestData.emailList = notifyEmailData;
      }

      if (type === 'save' && activeTab === 'logs') {
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

           if(this.state.socTemplateEnable && (activeTab === 'alert' || activeTab === 'logs')){
             let socRequestBody = {
               id: data.id,
               title: soc.title,
               eventDescription: soc.eventDescription,
               category: soc.category,
               impact: soc.impact,
               limitQuery: soc.limitQuery,
               creator: account.id
             }
             if (activeTab === 'alert') {
               socRequestBody.severity = soc.severity
             }
             if (activeTab === 'logs') {
               socRequestBody.severity = pattern.severity
             }

             this.ah.one({
               url: `${baseUrl}/api/soc/template`,
               data: JSON.stringify(socRequestBody),
               type: 'POST',
               contentType: 'text/plain'
             }).then(data => {
               if (data) {
                 // console.log('override soc Template result :: ', data)
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
               })
             })
           }else{
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
             })
           }

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
    const {activeTab, type, queryData, queryDataPublic} = this.props;
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

    if (activeTab === 'alert') {
      url = `${baseUrl}/api/account/alert/queryText?id=${queryId}`;
    } else if (activeTab === 'logs') {
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

            if (activeTab === 'logs') {
              tempQueryData.patternId = '';
              tempQueryData.pattern = {
                name: '',
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
   * Display all saved filter queries
   * @method
   * @param {object} value - saved query data
   * @param {number} index - index of the queryDataList array
   * @returns FilterInput component
   */
  displayFilterQuery = (value, index) => {
    const {activeTab, logFields} = this.props;

    return (
      <FilterInput
        key={index}
        activeTab={activeTab}
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
   * Display all saved mark
   * @method
   * @param {object} value - saved mark data
   * @param {number} index - index of the queryDataMark array
   * @returns MarkInput component
   */
  displayMarkSearch = (value, index) => {
    const {activeTab, logFields} = this.props;

    return (
      <MarkInput
        key={index}
        activeTab={activeTab}
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
    const {activeTab, type, queryData, queryDataPublic} = this.props;
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
          periodMin: 10,
          threshold: 1,
          severity: ''
        };
        tempQueryData.soc = {
          severity: 'Emergency',
          limitQuery: 10,
          title: '',
          eventDescription:'',
          impact: 4,
          category: 1,
          id:''
        }
        tempQueryData.emailList = [];

        if (comboValue && comboValue.value) {
          const selectedQueryIndex = _.findIndex(queryList, { 'value': comboValue.value });
          value = comboValue.value;
          tempQueryData.id = comboValue.value;

          this.setState({
            activeQuery: queryList[selectedQueryIndex]
          }, () => {
            this.getQuerySOCValue(queryList[selectedQueryIndex]);
          });
        }

        _.forEach(queryData.list, val => {
          if (val.id === value) {
            let formattedQueryText = [];
            tempQueryData.name = val.name;

            _.forEach(val.queryText.filter, val => {
              let formattedValue = val.condition.toLowerCase();
              formattedValue = formattedValue.replace(' ', '_');

              formattedQueryText.push({
                condition: formattedValue,
                query: val.query.trim()
              });
            })

            tempQueryData.query.filter = formattedQueryText;

            if (activeTab === 'logs') {
              tempQueryData.query.search = val.queryText.search;
            }

            if (val.patternId) {
              tempQueryData.patternId = val.patternId;
            }

            if (val.patternName) {
              tempQueryData.pattern.name = val.patternName;
              tempPattern.name = val.patternName;
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

        this.setState({
          pattern: tempPattern,
          patternCheckbox,
          publicCheckbox
        });
      } else if (type === 'publicOpen' || type === 'publicSave') {
        tempQueryDataPublic.id = value;
        tempQueryDataPublic.openFlag = true;
        tempQueryDataPublic.query = {}; //Reset data to empty

        tempQueryDataPublic.soc = {
          severity: 'Emergency',
          limitQuery: 10,
          title: '',
          eventDescription:'',
          impact: 4,
          category: 1,
          id:''
        }

        if (comboValue && comboValue.value) {
          const selectedQueryIndex = _.findIndex(queryList, { 'value': comboValue.value });
          value = comboValue.value;
          tempQueryDataPublic.id = comboValue.value;

          this.setState({
            activeQuery: queryList[selectedQueryIndex]
          }, () => {
            this.getQuerySOCValue(queryList[selectedQueryIndex]);
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
                query: val.query.trim()
              });
            })

            tempQueryDataPublic.query.filter = formattedQueryText;

            if (activeTab === 'logs') {
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

      tempQueryData.soc = {
        severity: 'Emergency',
        limitQuery: 10,
        title: '',
        eventDescription:'',
        impact: 4,
        category: 1,
        id:''

      }

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
      soc:tempQueryData.soc,
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

    if (event.target.name === 'severity'){

      if (event.target.value === 'Emergency'){
        tempSoc['impact'] = 4
      }else  if (event.target.value === 'Alert'){
        tempSoc['impact'] = 3
      }else  if (event.target.value === 'Notice'){
        tempSoc['impact'] = 1
      }else  if (event.target.value === 'Warning'){
        tempSoc['impact'] = 2
      }else  if (event.target.value === 'Critical'){
        tempSoc['impact'] = 3
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

    if (event.target.name === 'severity'){

      if (event.target.value === 'Emergency'){
        tempData['impact'] = 4
      }else  if (event.target.value === 'Alert'){
        tempData['impact'] = 3
      }else  if (event.target.value === 'Notice'){
        tempData['impact'] = 1
      }else  if (event.target.value === 'Warning'){
        tempData['impact'] = 2
      }else  if (event.target.value === 'Critical'){
        tempData['impact'] = 3
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

    if (!this.state.patternCheckbox){
      this.setState({
        soc:{
          id:'',
          severity: 'Emergency',
          limitQuery: 10,
          title: '',
          eventDescription:'',
          impact: 4,
          category: 1,
        },
        socTemplateEnable:false
      })
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

    if (!this.state.patternCheckbox && !this.state.publicCheckbox){
      this.setState({
        soc:{
          id:'',
          severity: 'Emergency',
          limitQuery: 10,
          title: '',
          eventDescription:'',
          impact: 4,
          category: 1,
        },
        socTemplateEnable:false
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
   * @returns ReactMultiEmail component
   */
  displayEmailInput = () => {
    const {activeTab, notifyEmailData} = this.props;
    const {patternCheckbox} = this.state;

    return (
      <div>
        <label>{t('notifications.txt-notifyEmail')}</label>
        {(activeTab === 'alert' || (activeTab === 'logs' && patternCheckbox)) &&
          <ReactMultiEmail
            id='reactMultiEmail'
            emails={notifyEmailData}
            onChange={this.props.setNotifyEmailData}
            getLabel={this.getLabel} />
        }
        {activeTab === 'logs' && !patternCheckbox &&
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
    let disabledValue = '';

    if (type === 'open') {
      severityType = queryData.pattern.severity;
      patternCheckboxChecked = true;
      patternCheckboxDisabled = true;
      publicCheckboxChecked = dialogOpenType === 'change' ? publicCheckbox : queryData.isPublic;
      disabledValue = true;
    } else if (type === 'save') {
      severityType = pattern.severity;
      patternCheckboxChecked = patternCheckbox;
      patternCheckboxDisabled = false;
      publicCheckboxChecked = publicCheckbox;
      disabledValue = !patternCheckbox;
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
                disabled={disabledValue}>
                {severityList}
              </TextField>
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
              disabled={disabledValue} />
          </div>
          <div className='period'>
            <span className='support-text'>{t('events.connections.txt-patternQuery1')} </span>
            <TextField
              name='periodMin'
              select
              variant='outlined'
              size='small'
              required
              value={pattern.periodMin}
              onChange={this.handleDataChange}
              disabled={disabledValue}>
              {periodMinList}
            </TextField>
            <span className='support-text'> {t('events.connections.txt-patternQuery2')} </span>
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
              disabled={disabledValue} />
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
        patternCheckboxDisabled = true
        if (queryData.soc) {
          if (queryData.soc.id) {
            if (queryData.soc.id !== '') {
              tempSocTemplateEnable = true;
            } else {

            }
          } else {

          }
        } else {

        }
      } else {
        severityType = soc.severity;
        patternCheckboxDisabled = false
      }

    } else if (type === 'save') {
      severityType = soc.severity || this.state.pattern.severity;
      patternCheckboxDisabled = false
    } else{
      patternCheckboxDisabled = true
    }

    return (
        <div>
          <FormControlLabel
              label={t('events.connections.txt-addSOCScript')}
              control={
                <Switch
                    checked={tempSocTemplateEnable}
                    onChange={this.toggleSOCSwitch}
                    color='primary'
                    />
              }
              disabled={patternCheckboxDisabled}
          />
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
                      return  <MenuItem value={el}>{`${el} (${(9 - 2 * el)} ${it('txt-day')})`}</MenuItem>
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
                  {_.map(_.range(1, 9), el => {
                    return <MenuItem value={el}>{it(`category.${el}`)}</MenuItem>
                  })}
                </TextField>
              </div>
              <div className='period'>
                <span className='support-text'>{t('events.connections.txt-socQuery1')} </span>
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
                <span className='support-text'>{t('events.connections.txt-socQuery2')} </span>
              </div>
              <div className='top-group'    style={{width: '100%'}}>
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
    let disabledValue = true;

    if (type === 'open') {
      disabledValue = true;
      if (queryData.soc){
        // severityType = queryData.soc.severity;
        if ( queryData.soc){
          if (queryData.soc.id){
            if (queryData.soc.id !== ''){
              tempSocTemplateEnable = true;
            }else{

            }
          }else{

          }
        }else{

        }
      }
    } else if (type === 'save') {
      if(this.state.patternCheckbox && this.state.publicCheckbox){
        disabledValue  = false
      }
    }

    return (
        <div>
          <FormControlLabel
              label={t('events.connections.txt-addSOCScript')}
              control={
                <Switch
                    checked={tempSocTemplateEnable}
                    onChange={this.toggleSOCSwitch}
                    color='primary'
                />
              }
              disabled={disabledValue}
          />

          {tempSocTemplateEnable &&
          <div className='group severity-section'>
            <div className='top-group'>
              <div className='severity-level'  style={{width: '63%'}}>
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
                    disabled={disabledValue}>
                  {_.map(_.range(1, 9), el => {
                    return <MenuItem value={el}>{it(`category.${el}`)}</MenuItem>
                  })}
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
                    return  <MenuItem value={el}>{`${el} (${(9 - 2 * el)} ${it('txt-day')})`}</MenuItem>
                  })
                }
              </TextField>
            </div>
            <div className='period'>
              <span className='support-text'>{t('events.connections.txt-socQuery1')} </span>
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
              <span className='support-text'>{t('events.connections.txt-socQuery2')} </span>
            </div>
            <div className='top-group'    style={{width: '100%'}}>
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
                  disabled={disabledValue}>
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
                  disabled={disabledValue}>
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
   * @param {object} queryDataList - query data list
   * @returns css display
   */
  getQueryColor = (queryDataList) => {
    if (!queryDataList || (queryDataList && queryDataList.length === 0)) {
      return { display: 'none' };
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
    const {activeTab, queryData, queryDataPublic, filterData, markData, moduleWithSOC} = this.props;
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

        if (activeTab === 'logs' && !_.isEmpty(queryData.query)) {
          queryDataList = queryData.query.filter;
          queryDataMark = queryData.query.search;
        } else {
          queryDataList = queryData.query.filter;
        }
      } else if (type === 'publicOpen') {
        displayQueryList = _.map(queryDataPublic.list, (val, i) => {
          return <MenuItem key={i} value={val.id}>{val.name}</MenuItem>
        });

        if (activeTab === 'logs' && !_.isEmpty(queryDataPublic.query)) {
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

          <div className='filter-group' style={this.getQueryColor(queryDataList)}>
            {queryDataList && queryDataList.length > 0 &&
              queryDataList.map(this.displayFilterQuery)
            }
          </div>

          <div className='filter-group' style={this.getQueryColor(queryDataMark)}>
            {queryDataMark && queryDataMark.length > 0 &&
              queryDataMark.map(this.displayMarkSearch)
            }
          </div>

          {activeTab === 'alert' && queryData.emailList.length > 0 &&
            <div className='email-list'>
              <label>{t('notifications.txt-notifyEmail')}</label>
              <div className='flex-item'>{queryData.emailList.map(this.displayEmail)}</div>
            </div>
          }

          {type === 'open' && activeTab === 'logs' && queryData.patternId &&
            this.getQueryAlertContent(type)
          }


          {activeTab === 'logs' && queryData.patternId && moduleWithSOC && type === 'open' &&
            this.getQueryWithSOCByLog(type)
          }

          {activeTab === 'alert' && moduleWithSOC && type === 'open' &&
            this.getQueryWithSOC(type)
          }

          <Button id='deleteQueryBtn' variant='outlined' color='primary' className='standard delete-query' onClick={this.removeQuery} disabled={this.deleteBtnDisabled()}>{t('txt-delete')}</Button>
        </div>
      )
    } else if (type === 'save' || type === 'publicSave') {
      let dropDownValue = 'new';

      _.forEach(filterData, val => {
        if (val.query) {
          tempFilterData.push({
            condition: val.condition,
            query: val.query.trim()
          });
        }
      })

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
      } else if (type === 'publicSave') {
        displayQueryList = _.map(queryDataPublic.list, (val, i) => {
          return <MenuItem key={i} value={val.id}>{val.name}</MenuItem>
        });

        if (queryDataPublic.openFlag) {
          dropDownValue = queryDataPublic.id;
        }
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
                value={type === 'save' ? queryData.inputName : queryDataPublic.inputName}
                onChange={this.handleQueryChange.bind(this, 'name')} />
            }
          </div>

          {tempFilterData.length > 0 &&
            <div className='filter-group'>
              {tempFilterData.map(this.displayFilterQuery)}
            </div>
          }

          {type === 'save' && tempMarkData.length > 0 &&
            <div className='filter-group'>
              {tempMarkData.map(this.displayMarkSearch)}
            </div>
          }

          {type === 'save' && activeTab === 'alert' &&
            this.displayEmailInput()
          }

          {type === 'save' && activeTab === 'logs' &&
            this.getQueryAlertContent(type)
          }

          {activeTab === 'logs' && moduleWithSOC  && type === 'save' &&
            this.getQueryWithSOCByLog(type)
          }

          {activeTab === 'alert' && moduleWithSOC && type === 'save' &&
            this.getQueryWithSOC(type)
          }
        </div>
      )
    }
  }
  render() {
    const {type, queryData, queryDataPublic, filterData} = this.props;
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
      if (filterData.length === 0 || filterData[0].query === '') {
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
  activeTab: PropTypes.string.isRequired,
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