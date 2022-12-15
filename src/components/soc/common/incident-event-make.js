import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import MenuItem from '@material-ui/core/MenuItem'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'
import IncidentForm from './incident-form'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;
let it = null;
let at = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

class IncidentEventMake extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');
    at = global.chewbaccaI18n.getFixedT(null, 'account');

    this.state = {
      activeContent: 'addIncident', //tableList, viewIncident, editIncident, addIncident
      displayPage: 'main', /* main, events, ttps */
      incidentType: '',
      toggleType: '',
      showFilter: false,
      showChart: true,
      currentIncident: {},
      originalIncident: {},
      severityList: [],
      deviceListOptions: [],
      attach: null,
      filesName: [],
      contextAnchor: null,
      currentData: {},
      activeSteps: 1,
      incidentAccidentList: _.map(_.range(1, 6), el => {
        return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
      }),
      incidentAccidentSubList: [
        _.map(_.range(11, 17), el => {
          return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
        }),
        _.map(_.range(21, 26), el => {
          return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
        }),
        _.map(_.range(31, 33), el => {
          return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
        }),
        _.map(_.range(41, 45), el => {
          return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
        })
      ]
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const severityList = _.map(SEVERITY_TYPE, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    this.setState({
      severityList
    });
  }
  handleOpenMenu = (data, event) => {
    this.setState({
      contextAnchor: event.currentTarget,
      currentData: data
    });
  }
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null,
      currentData: {}
    });
  }
  toggleSteps = (type) => {
    const { activeSteps, formValidation} = this.state;
    let tempActiveSteps = activeSteps;
    let tempFormValidation = {...formValidation};

    if (type === 'previous') {
      tempActiveSteps--;

      this.setState({
        activeSteps: tempActiveSteps
      });
    } else if (type === 'next') {
      if (activeSteps === 1) {
        let validate = true;

        this.setState({
          formValidation: tempFormValidation
        });

        if (!validate) {
          return;
        }

        tempActiveSteps++;

        this.setState({
          activeSteps: tempActiveSteps
        });
      }
    }
  }
  displayEditContent = () => {
    const {session} = this.context
    const {incident, socFlowList, enableEstablishDttm} = this.props;
    const {
      activeSteps,
      incidentType,
      severityList,
      attach,
      filesName,
      deviceListOptions,
      incidentAccidentList,
      incidentAccidentSubList
    } = this.state;

    return (
      <div className='main-content basic-form'>
        <div className='auto-settings' style={{width: '100vh'}}>
          <IncidentForm
            from='threats'
            activeSteps={activeSteps}
            incident={incident}
            severityList={severityList}
            incidentType={incidentType}
            socFlowList={socFlowList}
            attach={attach}
            filesName={filesName}
            deviceListOptions={deviceListOptions}
            incidentAccidentList={incidentAccidentList}
            incidentAccidentSubList={incidentAccidentSubList}
            enableEstablishDttm={enableEstablishDttm}
            handleDataChange={this.handleDataChange}
            handleDataChangeMui={this.handleDataChangeMui}
            handleFileChange={this.handleFileChange}
            handleConnectContactChange={this.handleConnectContactChange}
            handleEventsChange={this.handleEventsChange}
            toggleSteps={this.toggleSteps} />
        </div>
      </div>
    )
  }
  /**
   * Handle file upload change
   * @method
   * @param {string} [options] - option for 'clear'
   */
  handleFileChange = (options) => {
    const input = document.getElementById('multiMalware');
    let filesName = [];

    if (options === 'clear') {
      this.setState({
        filesName: ''
      });

      this.props.handleAttachChange(options);
      return;
    }

    if (_.size(input.files) > 0) {
      const flag = new RegExp("[\`~!@#$^&*()=|{}':;',\\[\\]<>+《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
      let validate = true;

      _.forEach(input.files, val => {
        if (flag.test(val.name)) {
          validate = false;
          helper.showPopupMsg(it('txt-attachedFileNameError'), t('txt-error'));
          return;
        } else if (val.size > 20000000) {
          validate = false;
          helper.showPopupMsg(it('file-too-large'), t('txt-error'));
          return;
        } else {
          filesName.push(val.name);
        }
      })

      if (!validate) return;

      this.setState({
        filesName: filesName.join(', ')
      });

      this.props.handleAttachChange(input.files);
    }
  }
  handleDataChange = (type, value) => {
    this.props.handleDataChange(type, value);
  }
  handleDataChangeMui = (event) => {
    this.props.handleDataChangeMui(event);
  }
  handleEventsChange = (val) => {
    this.props.handleEventsChange(val);
  }
  handleConnectContactChange = (val) => {
    this.props.handleConnectContactChange(val);
  }
  handleAttachChange = (val) => {
    this.props.handleAttachChange(val);
  }
  render() {
    return (
      <div className='data-content'>
        <div className='parent-content'>
          {this.displayEditContent()}
        </div>
      </div>
    )
  }  
}

IncidentEventMake.contextType = BaseDataContext;

IncidentEventMake.propTypes = {
  incident: PropTypes.string.isRequired,
  socFlowList: PropTypes.array.isRequired,
  enableEstablishDttm: PropTypes.string.isRequired,
  handleDataChange: PropTypes.func.isRequired,
  handleDataChangeMui: PropTypes.func.isRequired,
  handleEventsChange: PropTypes.func.isRequired,
  handleConnectContactChange: PropTypes.func.isRequired,
  handleAttachChange: PropTypes.func.isRequired,
  handleAFChange: PropTypes.func.isRequired,
  toggleEstablishDateCheckbox: PropTypes.func.isRequired
};

export default IncidentEventMake;