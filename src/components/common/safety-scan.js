import React, { Component } from 'react'
import PropTypes from 'prop-types'

import withLocale from '../../hoc/locale-provider'

let t = null;

class SafetyScan extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }

  render() {
    const {type} = this.props;

    return (
      <div className='safety-scan-content'>
        <div className='nav'>
          <ul>
            <li>
              <span className='name'>Yara Scan</span>
              <span className='count' style={{color: '#d0021b'}}>可疑檔案數: 18</span>
            </li>
            <li>
              <span className='name'>GCB</span>
              <span className='count' style={{color: '#11a629'}}>通過/總項目: 49/87</span>
            </li>
          </ul>
        </div>
        <div className='content'>
          <div className='updates'>最近更新時間: 2019/07/11 18:23</div>
          <button>重新檢測</button>
          <table className='c-table main-table'>
            <thead>
              <tr>
                <th>可疑檔案名稱</th>
                <th>檔案路徑</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>readme.doc</td>
                <td>c:/desktop/readme.doc</td>
              </tr>
              <tr>
                <td>test.bat</td>
                <td>c:/desktop/test.bat</td>
              </tr>
              <tr>
                <td>facebox.doc</td>
                <td>c:/desktop/facebox/facebox.doc</td>
              </tr>
              <tr>
                <td>SS-report.doc</td>
                <td>c:/desktop/windows/user/SS-report.doc</td>
              </tr>
              <tr>
                <td>readme.doc</td>
                <td>c:/desktop/readme.doc</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

SafetyScan.propTypes = {

};

const HocSafetyScan = withLocale(SafetyScan);
export { SafetyScan, HocSafetyScan };