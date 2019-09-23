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
import Tabs from 'react-ui/build/src/components/tabs'
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

class ThreatIntelligence extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'threatList'
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {

  }
  render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {activeTab} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          <div className='data-table'>
            {activeTab === 'threatList' &&
              <div className='main-content'>
                <Tabs
                  className='subtab-menu'
                  menu={{
                    threatList: t('txt-threatIntelligence')
                  }}
                  current={activeTab}>
                </Tabs>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

ThreatIntelligence.propTypes = {
  baseUrl: PropTypes.string.isRequired
};

const HocThreatIntelligence = withLocale(ThreatIntelligence);
export { ThreatIntelligence, HocThreatIntelligence };