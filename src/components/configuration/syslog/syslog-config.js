import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import cx from 'classnames'

import TextField from '@material-ui/core/TextField';

import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import Relationships from './relationships'

let t = null;

const StyledTextField = withStyles({
  root: {
    backgroundColor: '#fff',
    '& .Mui-disabled': {
      backgroundColor: '#f2f2f2'
    }
  }
})(TextField);

function TextFieldComp(props) {
  return (
    <StyledTextField
      id={props.id}
      className={props.className}
      name={props.name}
      type={props.type}
      label={props.label}
      multiline={props.multiline}
      rows={props.rows}
      maxLength={props.maxLength}
      variant={props.variant}
      fullWidth={props.fullWidth}
      size={props.size}
      InputProps={props.InputProps}
      required={props.required}
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled} />
  )
}

/**
 * Syslog Config
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Syslog Configuration page
 */
class syslogConfig extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Display pattern hint
   * @method
   * @returns HTML DOM
   */
  showPatternContent = () => {
    return (
      <table className='c-table pattern'>
        <tbody>
          <tr>
            <td valign='top'>
              <div>Log:</div>
              <div>Pattern:</div>
            </td>
            <td>
              <div>EventReceivedTime:2020-02-18 10:03:33, SourceModuleName:dns3</div>
              <div>EventReceivedTime:&#37;&#123;DATESTAMP:datestamp&#125;, SourceModuleName:&#37;&#123;WORD:word&#125;</div>
            </td>
          </tr>
          <tr>
            <td valign='top'>
              <div>Log:</div>
              <div>Pattern:</div>
            </td>
            <td>
              <div><span>"</span>EventReceivedTime<span>"</span>:<span>"</span>2020-02-18 10:03:33<span>"</span>, <span>"</span>SourceModuleName<span>"</span>:<span>"</span>dns3<span>"</span></div>
              <div><span>&#37;&#123;QUOTEDSTRING&#125;</span>:<span>&#37;&#123;QUOTEDSTRING</span>:datestamp<span>&#125;</span>, <span>&#37;&#123;QUOTEDSTRING&#125;</span>:<span>&#37;&#123;QUOTEDSTRING</span>:word<span>&#125;</span></div>
            </td>
          </tr>
          <tr>
            <td valign='top'>
              <div>Log:</div>
              <div>Pattern:</div>
            </td>
            <td>
              <div><span>\"</span>EventReceivedTime<span>\"</span>:<span>\"</span>2020-02-18 10:03:33<span>\"</span>, <span>\"</span>SourceModuleName<span>\"</span>:<span>\"</span>dns3<span>\"</span></div>
              <div><span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span>EventReceivedTime<span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span>:<span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span>&#37;&#123;DATESTAMP:datestamp&#125;<span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span>, <span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span>SourceModuleName<span>&#37;&#123;NOTSPACE&#125;&#37; &#123;NOTSPACE&#125;</span>:<span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span>&#37;&#123;WORD:word&#125;<span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span></div>
            </td>
          </tr>
          <tr>
            <td valign='top'>
              <div>Log:</div>
              <div>Pattern:</div>
            </td>
            <td>
              <div>"EventReceivedTime":"2020-02-18 10:03:33", "SourceModuleName<span>":</span>"dns3"</div>
              <div>&#37;&#123;GREEDYDATA&#125;SourceModuleName<span>&#37;&#123;DOUBLEQUOTESCOLON&#125;</span>&#37;&#123;QUOTEDSTRING:word&#125;</div>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
  /**
   * Open dialog for pattern hint
   * @method
   */
  showPatternHint = () => {
    PopupDialog.alert({
      id: 'modalWindowSmall',
      title: t('txt-tips'),
      confirmText: t('txt-close'),
      display: this.showPatternContent()
    });
  }
  /**
   * Display syslog parsed input data
   * @method
   * @param {string} val - syslog parsed data value
   * @param {string} key - syslog parsed data key
   * @returns HTML DOM
   */
  displayParsedData = (val, key) => {
    if (key != '_Raw') {
      return (
        <div className='group' key={key}>
          <TextFieldComp
            id={key}
            name='format'
            label={key}
            variant='outlined'
            fullWidth={true}
            size='small'
            value={val}
            disabled={true} />
        </div>
      )
    }
  }
  /**
   * Get filter width based on props
   * @method
   * @returns filter width
   */
  getFilterWidth = () => {
    return this.props.data.showPatternLeftNav ? '78%' : '93%';
  }
  render() {
    const {config, index} = this.props;

    return (
      <div className='filters' style={{width: this.getFilterWidth()}}>
        {config.type === 'formatSettings' &&
          <div>
            <div className='pattern-format'>
              <header>{t('syslogFields.txt-patternFormat')}</header>
              <div className='group'>
                <div className='pattern'>
                  <label>{t('syslogFields.matchPattern')}</label><i className='c-link fg fg-help' title={t('txt-tips')} onClick={this.showPatternHint} />
                </div>
                <TextFieldComp
                  id='syslogPattern'
                  multiline={true}
                  rows={6}
                  variant='outlined'
                  fullWidth={true}
                  size='small'
                  value={config.patternSetting[index].pattern}
                  onChange={this.props.handleConfigChange.bind(this, 'pattern')} />
              </div>
            </div>

            <div className='data-result'>
              <div className='left-syslog'>
                <div className='form-group normal long full-width syslog-config'>
                  <header>{t('syslogFields.txt-originalData')}</header>
                  <div className='group'>
                    <label htmlFor='syslogInput'>{t('syslogFields.dataSampleInput')}</label>
                    {config.id &&
                      <button className='standard' onClick={this.props.getLatestInput.bind(this, config.id)}>{t('syslogFields.txt-getLatest')}</button>
                    }
                    <TextFieldComp
                      id='syslogInput'
                      multiline={true}
                      rows={20}
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      value={config.patternSetting[index].input}
                      onChange={this.props.handleConfigChange.bind(this, 'input')} />
                  </div>
                </div>
              </div>
              <i className='c-link fg fg-forward' title={t('txt-parse')} onClick={this.props.getSyslogGrok} />
              <div className='left-syslog'>
                <div className='form-group normal long full-width syslog-config'>
                  <header>{t('syslogFields.txt-originalData')}</header>
                  <div className='parsed-list'>
                    {_.map(config.patternSetting[index].property, this.displayParsedData)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        {config.type === 'relationship' &&
          <MultiInput
            className='relationships'
            base={Relationships}
            props={this.props.data}
            defaultItemValue={{
              name: '',
              srcNode: '',
              dstNode: '',
              conditions: []
            }}
            value={config.patternSetting[index].relationships}
            onChange={this.props.handleRelationshipChange} />
        }
      </div>
    )
  }
}

syslogConfig.propTypes = {

};

export default syslogConfig;