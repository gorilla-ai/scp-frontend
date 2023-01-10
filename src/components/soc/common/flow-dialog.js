import React, { Component } from 'react'
import _ from 'lodash'
import cx from 'classnames'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

import {default as ah} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;
let it = null;

class IncidentFlowDialog extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');

    this.state = {
      id: null,
      open: false,
      activeSteps: 1,
      stepTitleList: ['SOC 1', 'SOC 2' , '設備單位承辦人', '資訊中心承辦人']
    };
  }
  componentDidMount() {
  }
  open = (id) => {
    const {baseUrl, session} = this.context;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/flowEngine/instance?id=${id}`,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).then(result => {
      if (result.rt) {
        const entitiesList = result.rt.entitiesList;
        const entityName = result.rt.currentEntity[id].entityName;
        let activeSteps = 1;

        _.forEach(entitiesList, (val, i) => {
          if (val.entityName === entityName) {
            activeSteps = i + 1;
            return;
          }
        })

        this.setState({
          id,
          open: true,
          activeSteps,
          stepTitleList: entitiesList
        });
      }
    }).catch(err => {
      helper.showPopupMsg('', t('txt-error'), it('txt-flow-msg-na'));
    })
  }
  close = () => {
    this.setState({
      open: false
    });
  }
  showUnitStepIcon = (val, i) => {
    const {activeSteps} = this.state;
    const index = ++i;
    const lineClass = 'line line' + index;
    const stepClass = 'step step' + index;

    return (
      <div key={i} className={`group group${index}`}>
        <div className={cx(lineClass, {active: activeSteps >= index})}></div>
        <div className={cx(stepClass, {active: activeSteps >= index})}>
          <div className='border-wrapper'>
            <span className='number'>{index}</span>
          </div>
          <div className='text-wrapper'>
            <div className='text'>{val.entityName}</div>
            {val.updateTime &&
              <div className='text'>{helper.getFormattedDate(val.updateTime, 'local')}</div>
            }
          </div>
        </div>
      </div>
    )
  }
  render() {
    const {open, stepTitleList} = this.state;
    const actions = {
      cancel: {text: t('txt-close'), className:'standard', handler: this.close}
    };

    if (!open) {
      return null;
    }

    return (
      <ModalDialog
        className='incident-tag-modal'
        style={{width: '1080px'}}
        title={it('txt-incident-soc-flow')}
        draggable={true}
        global={true}
        closeAction='cancel'
        actions={actions}>
        <div className='data-content' style={{minHeight: '26vh'}}>
          <div className='parent-content'>
            <div className='main-content basic-form' style={{minHeight: '47vh'}}>
              <div className='steps-indicator' style={{marginTop: '20vh'}}>
                {stepTitleList.map(this.showUnitStepIcon)}
              </div>
            </div>
          </div>
        </div>
      </ModalDialog>
    )
  }
}

IncidentFlowDialog.contextType = BaseDataContext;
IncidentFlowDialog.propTypes = {
};

export default IncidentFlowDialog;