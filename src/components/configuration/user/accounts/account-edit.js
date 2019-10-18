import React, {Component} from 'react'
import _ from 'lodash'
import cx from 'classnames'
import i18n from 'i18next'
import PropTypes from 'prop-types';
import queryString from 'query-string'

import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'
import Form from 'react-ui/build/src/components/form'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import helper from '../../../common/helper'
import withLocale from '../../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const log = require('loglevel').getLogger('accounts/account-edit')
const t = i18n.getFixedT(null, 'accounts');
const gt = i18n.getFixedT(null, 'app');
const et =  i18n.getFixedT(null, 'errors');

const INITIAL_STATE = {
  open: false,
  info: null,
  error: false,
  accountData: {
      account: '',
      name: '',
      password: '',
      email: '',
      unit: '',
      title: '',
      phone: '',
      selected: []
  },
  privileges: [],
  showPrivileges: true
};

class Editor extends Component {
  constructor(props) {
    super(props);

    this.state = _.cloneDeep(INITIAL_STATE);
    this.ah = getInstance('chewbacca');
  }
  handleChange = (accountData) => {
    this.setState({
      accountData
    });
  }
  loadAccount = (id) => {
    const {baseUrl} = this.props;

    ah.all([
      {
        url: `${baseUrl}/api/account?accountid=${id}`,
        type:'GET'
      },
      {
        url: `${baseUrl}/api/account/privileges?accountId=${id}`,
        type:'GET'
      }
    ])
    .then(data => {
      const accountData = {
        accountid: data[0].rt.accountid,
        account: data[0].rt.account,
        name: data[0].rt.name,
        password: data[0].rt.password,
        email: data[0].rt.email,
        unit: data[0].rt.unit,
        title: data[0].rt.title,
        phone: data[0].rt.phone,
        selected: _.map(data[1].rt, 'privilegeid')
      };

      this.setState({
        accountData
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
      this.close();
    })
  }
  loadPrivileges = () => {
    const {baseUrl} = this.props;

    ah.one({
      url: `${baseUrl}/api/account/privileges`
    })
    .then(data => {
      const privileges = _.map(data.rt, el => {
        return {
          value: el.privilegeid,
          text: el.name
        };
      })

      this.setState({
        privileges
      });
    })
  }
  saveAccount = () => {
    const {baseUrl, session, onDone} = this.props;
    const {id, accountData, showPrivileges} = this.state;
    let validForm = true;

    if (_.isEmpty(accountData.account)) validForm = false;
    if (_.isEmpty(accountData.email)) validForm = false;
    if (_.isEmpty(accountData.name)) validForm = false;
    if (_.isEmpty(accountData.password)) validForm = false;
    if (_.isEmpty(accountData.phone)) validForm = false;
    if (_.isEmpty(accountData.title)) validForm = false;
    if (_.isEmpty(accountData.unit)) validForm = false;
    if (showPrivileges && _.isEmpty(accountData.selected)) validForm = false;

    if (validForm) {
      this.ah.one({
        url: `${baseUrl}/api/account`,
        data: JSON.stringify(_.omit(accountData, 'selected')),
        type: id ? 'PATCH' : 'POST',
        contentType: 'application/json',
        dataType: 'json'
      })
      .then(data => {
        const resId = id || data || data.rt;

        this.setState({id:resId}, () => {
          if (showPrivileges) {
            this.savePrivileges()
          } else {
            this.close()
            onDone()
          }
        });
      })
      .catch(err => {
        this.setState({
          error: true,
          info: err.message
        });
      })
    } else {
      this.setState({
        error: true,
        info: et('fill-required-fields')
      });
    }
  }
  savePrivileges = () => {
    const {baseUrl, onDone} = this.props;
    const {id, accountData:{selected}} = this.state;

    ah.one({
      url: `${baseUrl}/api/account/privileges?accountId=${id}&${queryString.stringify({privilegeIds:selected})}`,
      type: 'PATCH',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      this.setState(
        _.cloneDeep(INITIAL_STATE), () => {
        onDone()
      });
    })
    .catch(err => {
      this.setState({
        error: true,
        info: err.message
      })
    })
  }
  open = (id, option) => {
    let showPrivileges = true;

    if (option === 'fromHeader') {
      showPrivileges = false;
    }
    this.setState({
      open: true,
      id,
      showPrivileges
    }, () => {
      this.loadPrivileges();
      
      if (id) {
       this.loadAccount(id);
      }
    });
  }
  close = () => {
    this.setState(
      _.cloneDeep(INITIAL_STATE)
    );
  }
  error = (msg) => {
    this.setState({
      info:msg,
      error: true
    });
  }
  render() {
    const {id, accountData, info, error, open, privileges, showPrivileges} = this.state;

    if (!open) {
      return null
    }

    let formFieldsBasic = {
      account: {label: t('l-account'), editor: Input, props: {
        required: true,
        readOnly: id,
        validate: {
          pattern: /[0-9a-zA-Z]{4,}/,
          patternReadable: t('txt-only-num-eng'),
          t: et
        }
      }},
      name: {label: t('l-name'), editor: Input, props: {
        required: true,
        validate: { t:et }
      }},
      password: {label: t('l-password'), editor: Input, props: {
        type: 'password',
        required: true,
        validate: { t:et }
      }},
      email: {label: t('l-email'), editor: Input, props: {
        required: true,
        validate: {
          pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          patternReadable: t('txt-email-invalid'),
          t: et
        }
      }},
      unit: {label: t('l-unit'), editor: Input, props: {
        required: true,
        validate: { t:et }
      }},
      title: {label: t('l-title'), editor: Input, props: {
        required: true,
        validate: { t:et }
      }},
      phone: {label: t('l-phone'), editor: Input, props: {
        required: true,
        validate: { t:et }
      }}
    };

    const formFieldsPrivileges = {
      selected: {label: t('l-privileges'), editor: CheckboxGroup, props: {
        required: true,
        list: privileges
      }}
    };

    if (showPrivileges) {
      formFieldsBasic = _.assign({}, formFieldsBasic, formFieldsPrivileges);
    }

    return <ModalDialog
      id='g-user-accounts-edit'
      title={id ? t('dlg-edit') : t('dlg-add')}
      draggable
      global
      info={info}
      infoClassName={cx({'c-error':error})}
      closeAction='cancel'
      actions={{
        cancel: {text: gt('btn-cancel'), className: 'standard', handler: this.close},
        confirm: {text: gt('btn-ok'), handler: this.saveAccount}
      }}>
      <div className='c-flex fdc boxes dialog-width'>
        <Form
          formClassName='c-form inline c-flex jcsb'
          fields={formFieldsBasic}
          value={accountData}
          onChange={this.handleChange} />
      </div>
    </ModalDialog>
  }
}

Editor.propTypes = {
  onDone: PropTypes.func.isRequired
};

Editor.defaultProps = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

export default withLocale(Editor);