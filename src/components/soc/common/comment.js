import React, { Component } from 'react'
import _ from 'lodash'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

import {default as ah} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;
let it = null;

class IncidentComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentList: [],
      selectedCommandId: 'new',
      title: '',
      command: ''
    }
    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');
  }
  componentDidMount() {
    this.fetchCommentList();
  }
  componentDidUpdate(prevProps, prevState) {
  }
  fetchCommentList = () => {
    const {baseUrl} = this.context

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/command/_search`
    })
    .then(data => {
      if (data && data.rt) {
        this.setState({
          commentList: data.rt
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleClose = () => {
    const {onClose} = this.props;
    onClose();
  }
  handleDataChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }
  handleSelectChange = (e) => {
    const {commentList} = this.state;
    const comment = _.find(commentList, {id: e.target.value});

    if (comment) {
      this.setState({
        selectedCommandId: comment.id,
        title: comment.title,
        command: comment.command
      })
    } else {
      this.setState({
        selectedCommandId: 'new',
        title: '',
        command: ''
      })
    }
  }
  addComment = () => {
    const {baseUrl} = this.context;
    const {title, command} = this.state;

    if (!title || !command) {
      PopupDialog.alert({
        title: t('txt-tips'),
        display: it('txt-required'),
        confirmText: t('txt-close')
      });
      return;
    }

    const payload = {
      title, 
      command
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/command`,
      data: JSON.stringify(payload),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      this.handleClose();

      helper.showPopupMsg('', t('txt-success'), it('txt-new') + it('txt-comment-example') + t('txt-success'));
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  editComment = () => {
    const {baseUrl} = this.context;
    const {title, command, selectedCommandId} = this.state;

    if (!title || !command) {
      PopupDialog.alert({
        title: t('txt-tips'),
        display: it('txt-required'),
        confirmText: t('txt-close')
      });
      return;
    }

    const payload = {
      id: selectedCommandId,
      title, 
      command
    };

    PopupDialog.prompt({
      title: t('txt-edit'),
      confirmText: t('txt-confirm'),
      cancelText: t('txt-cancel'),
      display: <span>{it('txt-edit-msg')}</span>,
      act: (confirmed, data) => {
        if (confirmed) {
          helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

          ah.one({
            url: `${baseUrl}/api/soc/command`,
            data: JSON.stringify(payload),
            type: 'PATCH',
            contentType: 'application/json',
            dataType: 'json'
          })
          .then(data => {
            this.handleClose();

            helper.showPopupMsg('', t('txt-success'), it('txt-update') + it('txt-comment-example') + t('txt-success'));
          })
          .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message);
          })
        }
      }
    })
  }
  deleteComment = () => {
    const {baseUrl} = this.context;
    const {title, selectedCommandId} = this.state;

    PopupDialog.prompt({
      title: t('txt-delete'),
      confirmText: t('txt-confirm'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('txt-delete-msg')}: {title} ?</span>
        </div>
      ),
      act: (confirmed, data) => {
        if (confirmed) {
          helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

          ah.one({
            url: `${baseUrl}/api/soc/command?id=${selectedCommandId}`,
            type: 'DELETE'
          })
          .then(data => {
            this.handleClose();

            helper.showPopupMsg('', t('txt-success'), it('txt-delete') + it('txt-comment-example') + t('txt-success'));
          })
          .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message);
          })
        }
      }
    })
  }
  render() {
    const {commentList, selectedCommandId, title, command} = this.state;

    const actions = {
      cancel: {text: t('txt-cancel'), className:'standard', handler: this.handleClose}
    };
    if (selectedCommandId === 'new') {
      actions['add'] = {text: t('txt-add'), handler: this.addComment}
    } else {
      actions['edit'] = {text: t('txt-edit'), handler: this.editComment}
      actions['delete'] = {text: t('txt-delete'), handler: this.deleteComment}
    }
    
    let commentSelectList = _.map(commentList, el => {
      return {
        text: el.title,
        value: el.id
      };
    });
    commentSelectList = _.concat([{text: it('txt-comment-new'), value: 'new'}], commentSelectList);

    return (
      <ModalDialog
        className='incident-comment'
        title={it('txt-comment-example')} 
        draggable={true}
        global={true}
        closeAction='cancel'
        actions={actions}>
        <div className='left'>
          <TextField
            variant='outlined'
            fullWidth={true}
            size='small'
            required
            multiline
            value={selectedCommandId}
            select
            onChange={this.handleSelectChange}>
            {
              _.map(commentSelectList, el => {
                return <MenuItem key={el.value} value={el.value}>{el.text}</MenuItem>
              })
            }
          </TextField>
        </div>
        <div className='right'>
          <TextField
            name='title'
            label={it('txt-title')}
            variant='outlined'
            fullWidth={true}
            size='small'
            required
            value={title}
            onChange={this.handleDataChange}>
          </TextField>
          <TextField
            name='command'
            label={it('txt-comment')}
            multiline
            value={command}
            rows={8}
            variant='outlined'
            fullWidth={true}
            size='small'
            onChange={this.handleDataChange} />
        </div>
      </ModalDialog>
    )
  }
}


IncidentComment.contextType = BaseDataContext;
IncidentComment.propTypes = {
};

export default IncidentComment;