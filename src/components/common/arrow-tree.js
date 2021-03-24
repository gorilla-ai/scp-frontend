import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

// const TREE_DATA = {
//   "id": "home",
//   "children": [
//     {
//       "id": "rule",
//       "label": "規則",
//       "children": [
//         {
//           "id": "Check_unhandledExceptionFiler_iat",
//           "children": [
//             {
//               "id": 'rule rat_webcam { meta: author = "x0r" description = "Remote Administration toolkit using webcam" version = "0.1" strings: $f1 = "avicap32.dll" nocase $c1 = "capCreateCaptureWindow" nocase condition: all of them }'
//             }
//           ]
//         },
//         {
//           "id": "DebuggerException__UnhandledFilter",
//           "children": [
//             {
//               "id": 'rule DebuggerTiming__Ticks : AntiDebug DebuggerTiming { meta: weight = 1 Author = "naxonez" reference = "https:\//github.com/naxonez/yaraRules/blob/master/AntiDebugging.yara" strings: $ ="GetTickCount" condition: any of them }'
//             }
//           ]
//         }
//       ]
//     },
//     {
//       "id": "DLLs",
//       "children": [
//         {
//           "id": "C:\Windows\System32\svchost.exe"
//         },
//         {
//           "id": "C:\Windows\SYSTEM32\ntdll.dll"
//         }
//       ]
//     },
//     {
//       "id": "Connections",
//       "label": "網路行為",
//       "children": [
//         {
//           "id": 'destIp: "0.0.0.0"'
//         },
//         {
//           "id": 'destPort: "0"'
//         },
//         {
//           "id": 'protocol: "TCP"'
//         },
//         {
//           "id": 'srcIp: "0.0.0.0"'
//         },
//         {
//           "id": 'srcPort: "49215"'
//         }
//       ]
//     }
//   ]
// };

let t = null;

/**
 * Arrow Tree
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to generate arrow tree content
 */
class ArrowTree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Set the collection of opened nodes
   * @method
   * @param {string} id - ID of the opened node
   */  
  toggleOpenNode = (id) => {
    const {opened} = this.state;
    let tempOpened = opened;

    if (_.includes(opened, id)) {
      _.remove(tempOpened, function(item) {
        return item === id;
      });
    } else {
      tempOpened.push(id);
    }

    this.setState({
      opened: tempOpened
    });
  }
  /**
   * Display the tree content
   * @method
   * @param {object} val - content of the nodes
   * @param {number} i - index of the nodes
   * @returns HTML DOM
   */    
  getNodeContent = (val, i) => {
    const {opened} = this.state;
    const title = val.label || val.id;

    return (
      <div key={val.id + i} className='rule-content'>
        {val.children && val.children.length > 0 &&
          <div className='header' onClick={this.toggleOpenNode.bind(this, val.id)}>
            <i className={cx('fg fg-play', {'rotate': _.includes(opened, val.id)})}></i>
            <span>{title}</span>
          </div>
        }

        {(!val.children || val.children.length === 0) &&
          <div className='tree-content'>
            <span>{val.id}</span>
          </div>
        }

        {val.children && val.children.length > 0 &&
          <div className={cx('sub-content', {'hide': !_.includes(opened, val.id)})}>
            {val.children.map(this.getNodeContent)}
          </div>
        }
      </div>
    )
  }
  render() {
    const {data} = this.props;

    return (
      <div className='list'>
        <div className='group'>
          <div className='rule'>
            {data.children.map(this.getNodeContent)}
          </div>
        </div>
      </div>
    )
  }
}

ArrowTree.propTypes = {
  data: PropTypes.object.isRequired
};

export default ArrowTree;